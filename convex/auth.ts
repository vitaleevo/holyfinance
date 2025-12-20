import { v, ConvexError } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { hashSync, compareSync } from "bcryptjs";

// Generate a random token
function generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Register a new user
export const register = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        // Validate Email
        const email = args.email.toLowerCase();
        const forbiddenDomains = ['example.com', 'test.com', 'admin.com', 'localhost', 'tempmail.com', 'fake.com', 'mail.com'];
        const domain = email.split('@')[1];

        if (!domain || !domain.includes('.')) {
            throw new ConvexError("O formato do email parece estar incorreto. Por favor, verifique.");
        }

        if (forbiddenDomains.includes(domain)) {
            throw new ConvexError("Por favor, use um email válido (Gmail, Outlook, domínio pessoal, etc). Emails de teste não são permitidos.");
        }

        // Check if user already exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        if (existingUser) {
            throw new ConvexError("Já existe uma conta com este email.");
        }

        // Create user
        const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const userId = await ctx.db.insert("users", {
            name: args.name,
            email: args.email.toLowerCase(),
            passwordHash: hashSync(args.password, 10), // Use bcrypt
            createdAt: new Date().toISOString(),
            subscriptionStatus: "trialing",
            trialEndsAt,
            planType: "basic",
            billingCycle: "monthly",
        });

        // Create default settings for the user
        await ctx.db.insert("settings", {
            userId,
            theme: "dark",
            emailNotifications: true,
            privacyMode: false,
        });

        // Welcome notification
        await ctx.db.insert("notifications", {
            userId,
            title: "Bem-vindo ao HolyFinanças!",
            message: "Sua conta foi criada com sucesso. Configure seu perfil e metas.",
            type: "success",
            read: false,
            createdAt: new Date().toISOString(),
            isImportant: false
        });

        // Create session
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

        await ctx.db.insert("sessions", {
            userId,
            token,
            expiresAt,
        });

        return { userId, token };
    },
});

// Login
export const login = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();

        if (!user) {
            throw new ConvexError("Email ou senha incorretos.");
        }

        const isValid = compareSync(args.password, user.passwordHash); // Use bcrypt
        if (!isValid) {
            throw new ConvexError("Email ou senha incorretos.");
        }

        // Create session
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        await ctx.db.insert("sessions", {
            userId: user._id,
            token,
            expiresAt,
        });

        return { userId: user._id, token, userName: user.name };
    },
});

// Logout
export const logout = mutation({
    args: {
        token: v.string(),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .first();

        if (session) {
            await ctx.db.delete(session._id);
        }
    },
});

// Get current user from token
export const getCurrentUser = query({
    args: {
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        if (!args.token) return null;

        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", args.token!))
            .first();

        if (!session || !session.userId) return null;

        // Check if session expired
        if (new Date(session.expiresAt) < new Date()) {
            return null;
        }

        const user = await ctx.db.get(session.userId);
        if (!user) return null;

        let avatarUrl = null;
        if (user.avatarStorageId) {
            avatarUrl = await ctx.storage.getUrl(user.avatarStorageId);
        }

        let status: any = user.subscriptionStatus ?? "expired";

        // Dynamic check for trial expiration
        if (status === "trialing" && user.trialEndsAt) {
            const trialEnd = new Date(user.trialEndsAt).getTime();
            if (Date.now() > trialEnd) {
                status = "expired";
            }
        }

        return {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            currency: user.currency,
            avatarUrl,
            familyRelationship: user.familyRelationship,
            role: user.role ?? "member",
            subscriptionStatus: status,
            trialEndsAt: user.trialEndsAt,
            planType: user.planType ?? "basic",
            billingCycle: user.billingCycle ?? "monthly",
        };
    },
});

// Helper function to get userId from token (for use in other mutations)
export async function getUserIdFromToken(
    ctx: QueryCtx,
    token: string | undefined
): Promise<Id<"users"> | null> {
    if (!token) return null;

    const session = await ctx.db
        .query("sessions")
        .withIndex("by_token", (q: any) => q.eq("token", token))
        .first();

    if (!session || !session.userId) return null;

    if (new Date(session.expiresAt) < new Date()) {
        return null;
    }

    return session.userId;
}

export type UserRole = "admin" | "partner" | "member";

export async function getUserWithRole(ctx: QueryCtx, token: string | undefined) {
    const userId = await getUserIdFromToken(ctx, token);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    return {
        ...user,
        role: (user.role as UserRole) || "member" // Fallback to member for safety
    };
}
