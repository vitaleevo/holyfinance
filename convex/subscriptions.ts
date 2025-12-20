import { v, ConvexError } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { hashSync } from "bcryptjs";
import { getUserIdFromToken } from "./auth";

/**
 * Creates a user directly as ACTIVE (no trial needed since they are paying upfront)
 */
export const payAndRegister = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        password: v.string(),
        planType: v.union(v.literal("basic"), v.literal("intermediate"), v.literal("advanced")),
        billingCycle: v.union(v.literal("monthly"), v.literal("yearly"), v.literal("biyearly")),
        paymentMethod: v.optional(v.union(v.literal("mcx"), v.literal("stripe"))),
        paymentPhone: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();

        if (existing) throw new ConvexError("Email já cadastrado. Por favor, faça login ou use outro email.");

        const userId = await ctx.db.insert("users", {
            name: args.name,
            email: args.email.toLowerCase(),
            passwordHash: hashSync(args.password, 10),
            createdAt: new Date().toISOString(),
            subscriptionStatus: args.paymentMethod === 'mcx' ? "pending_verification" : "active",
            planType: args.planType,
            billingCycle: args.billingCycle,
            paymentMethod: args.paymentMethod,
            paymentPhone: args.paymentPhone,
        });

        // Default settings
        await ctx.db.insert("settings", {
            userId,
            theme: "dark",
            emailNotifications: true,
            privacyMode: false,
        });

        // Session
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        await ctx.db.insert("sessions", { userId, token, expiresAt });

        return { userId, token };
    }
});

/**
 * Upgrades a user from trial/expired to active
 */
export const upgradeSubscription = mutation({
    args: {
        token: v.string(),
        planType: v.union(v.literal("basic"), v.literal("intermediate"), v.literal("advanced")),
        billingCycle: v.union(v.literal("monthly"), v.literal("yearly"), v.literal("biyearly")),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autorizado.");

        await ctx.db.patch(userId, {
            subscriptionStatus: "active",
            planType: args.planType,
            billingCycle: args.billingCycle,
            // Clear trial fields if any
            trialEndsAt: undefined
        });

        return { success: true };
    }
});

/**
 * Admin utility to cleanup users who are expired for more than 30 days
 */
export const cleanupExpiredUsers = mutation({
    args: { adminToken: v.string() }, // Simplistic check
    handler: async (ctx, args) => {
        // In a real app, verify admin role
        const users = await ctx.db.query("users").collect();
        const now = Date.now();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

        let deletedCount = 0;

        for (const user of users) {
            // Check if expired and was trialing before
            const isTrialExpired = user.subscriptionStatus === "trialing" && user.trialEndsAt && (new Date(user.trialEndsAt).getTime() + thirtyDaysMs < now);
            const isExplicitlyExpired = user.subscriptionStatus === "expired" && user.trialEndsAt && (new Date(user.trialEndsAt).getTime() + thirtyDaysMs < now);

            if (isTrialExpired || isExplicitlyExpired) {
                // Delete user and associated data (simplified)
                await ctx.db.delete(user._id);
                deletedCount++;
                // Note: In production you'd also delete transactions, accounts, etc.
            }
        }

        return { deletedCount };
    }
});

/**
 * Lists users waiting for manual verification
 */
export const getPendingUsers = query({
    args: { adminToken: v.string() },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.adminToken);
        if (!userId) return [];

        const admin = await ctx.db.get(userId);
        if (admin?.role !== 'admin') return [];

        return await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("subscriptionStatus"), "pending_verification"))
            .collect();
    }
});

/**
 * Approves a pending subscription
 */
export const approveUser = mutation({
    args: {
        adminToken: v.string(),
        targetUserId: v.id("users")
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.adminToken);
        if (!userId) throw new Error("Não autorizado.");

        const admin = await ctx.db.get(userId);
        if (admin?.role !== 'admin') throw new Error("Apenas administradores podem aprovar assinaturas.");

        await ctx.db.patch(args.targetUserId, {
            subscriptionStatus: "active",
            trialEndsAt: undefined
        });

        // Add confirmation notification
        await ctx.db.insert("notifications", {
            userId: args.targetUserId,
            title: "Assinatura Aprovada! 🎉",
            message: "Seu pagamento foi confirmado manualmente por um administrador. Bem-vindo!",
            type: "success",
            read: false,
            createdAt: new Date().toISOString(),
            isImportant: true
        });

        return { success: true };
    }
});
