import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserIdFromToken } from "./auth";

function generateCode() {
    // Generate a random 4 digit string
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Format as XXX-XXX could be nicer but pure alphanumeric is easier to type
    return code;
}

export const create = mutation({
    args: {
        name: v.string(),
        token: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        if (user.familyId) throw new Error("User already in a family");

        const code = generateCode();

        const familyId = await ctx.db.insert("families", {
            name: args.name,
            code: code,
            createdAt: new Date().toISOString(),
        });

        await ctx.db.patch(userId, {
            familyId: familyId,
            role: "admin"
        });

        // Migrate all user data to the family
        const accounts = await ctx.db.query("accounts").withIndex("by_user", q => q.eq("userId", userId)).collect();
        for (const item of accounts) await ctx.db.patch(item._id, { familyId });

        const transactions = await ctx.db.query("transactions").withIndex("by_user", q => q.eq("userId", userId)).collect();
        for (const item of transactions) await ctx.db.patch(item._id, { familyId });

        const goals = await ctx.db.query("goals").withIndex("by_user", q => q.eq("userId", userId)).collect();
        for (const item of goals) await ctx.db.patch(item._id, { familyId });

        const budgetLimits = await ctx.db.query("budgetLimits").withIndex("by_user", q => q.eq("userId", userId)).collect();
        for (const item of budgetLimits) await ctx.db.patch(item._id, { familyId });

        const investments = await ctx.db.query("investments").withIndex("by_user", q => q.eq("userId", userId)).collect();
        for (const item of investments) await ctx.db.patch(item._id, { familyId });

        const debts = await ctx.db.query("debts").withIndex("by_user", q => q.eq("userId", userId)).collect();
        for (const item of debts) await ctx.db.patch(item._id, { familyId });

        const notifications = await ctx.db.query("notifications").withIndex("by_user", q => q.eq("userId", userId)).collect();
        for (const item of notifications) await ctx.db.patch(item._id, { familyId });

        return { familyId, code };
    },
});

export const join = mutation({
    args: {
        code: v.string(),
        token: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        if (user.familyId) throw new Error("User already in a family");

        const family = await ctx.db
            .query("families")
            .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
            .first();

        if (!family) throw new Error("Código de convite inválido ou expirado.");

        // Rule: Limit family size to 5 members
        const currentMembers = await ctx.db
            .query("users")
            .withIndex("by_family", (q) => q.eq("familyId", family._id))
            .collect();

        if (currentMembers.length >= 5) {
            throw new Error("Esta família já atingiu o limite máximo de 5 membros.");
        }

        await ctx.db.patch(userId, {
            familyId: family._id,
            role: "member"
        });

        // Migrate all user data to the family
        const accounts2 = await ctx.db.query("accounts").withIndex("by_user", q => q.eq("userId", userId)).collect();
        for (const item of accounts2) await ctx.db.patch(item._id, { familyId: family._id });

        const transactions2 = await ctx.db.query("transactions").withIndex("by_user", q => q.eq("userId", userId)).collect();
        for (const item of transactions2) await ctx.db.patch(item._id, { familyId: family._id });

        const goals2 = await ctx.db.query("goals").withIndex("by_user", q => q.eq("userId", userId)).collect();
        for (const item of goals2) await ctx.db.patch(item._id, { familyId: family._id });

        const budgetLimits2 = await ctx.db.query("budgetLimits").withIndex("by_user", q => q.eq("userId", userId)).collect();
        for (const item of budgetLimits2) await ctx.db.patch(item._id, { familyId: family._id });

        const investments2 = await ctx.db.query("investments").withIndex("by_user", q => q.eq("userId", userId)).collect();
        for (const item of investments2) await ctx.db.patch(item._id, { familyId: family._id });

        const debts2 = await ctx.db.query("debts").withIndex("by_user", q => q.eq("userId", userId)).collect();
        for (const item of debts2) await ctx.db.patch(item._id, { familyId: family._id });

        const notifications2 = await ctx.db.query("notifications").withIndex("by_user", q => q.eq("userId", userId)).collect();
        for (const item of notifications2) await ctx.db.patch(item._id, { familyId: family._id });

        return family;
    },
});

export const get = query({
    args: {
        token: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) return null;

        const user = await ctx.db.get(userId);
        if (!user || !user.familyId) return null;

        const family = await ctx.db.get(user.familyId);
        if (!family) return null;

        // Get members
        const members = await ctx.db
            .query("users")
            .withIndex("by_family", (q) => q.eq("familyId", user.familyId!))
            .collect();

        // Security Layer: Mask code for simple members
        const hasFullAccess = user.role === 'admin' || user.role === 'partner';
        const secureFamily = {
            ...family,
            code: hasFullAccess ? family.code : "******"
        };

        return {
            family: secureFamily,
            members: members.map(m => ({
                id: m._id,
                name: m.name,
                email: m.email,
                role: m.role,
                avatarStorageId: m.avatarStorageId,
                familyRelationship: m.familyRelationship
            }))
        };
    },
});

// Allow admin to change member roles
export const updateMemberRole = mutation({
    args: {
        memberId: v.id("users"),
        newRole: v.string(), // "partner" | "member"
        token: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Unauthorized");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser || currentUser.role !== 'admin') {
            throw new Error("Only admin can change roles");
        }

        const member = await ctx.db.get(args.memberId);
        if (!member) throw new Error("Member not found");

        // Ensure same family
        if (member.familyId !== currentUser.familyId) {
            throw new Error("Member not in your family");
        }

        // Cannot change own role or demote self
        if (member._id === userId) {
            throw new Error("Cannot change your own role");
        }

        // Valid roles
        if (!['partner', 'member'].includes(args.newRole)) {
            throw new Error("Invalid role");
        }

        await ctx.db.patch(args.memberId, { role: args.newRole });

        return { success: true };
    },
});

// Remove member from family (admin only)
export const removeMember = mutation({
    args: {
        memberId: v.id("users"),
        token: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Unauthorized");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser || currentUser.role !== 'admin') {
            throw new Error("Only admin can remove members");
        }

        const member = await ctx.db.get(args.memberId);
        if (!member) throw new Error("Member not found");

        // Ensure same family
        if (member.familyId !== currentUser.familyId) {
            throw new Error("Member not in your family");
        }

        // Cannot remove self
        if (member._id === userId) {
            throw new Error("Cannot remove yourself. Use 'leave' instead or transfer admin first.");
        }

        // Remove member from family (keep their data orphan for individual access)
        await ctx.db.patch(args.memberId, { familyId: undefined, role: undefined });

        return { success: true };
    },
});

// Leave family voluntarily
export const leave = mutation({
    args: {
        token: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || !user.familyId) throw new Error("Not in a family");

        // If admin, check if there are other members
        if (user.role === 'admin') {
            const members = await ctx.db
                .query("users")
                .withIndex("by_family", (q) => q.eq("familyId", user.familyId!))
                .collect();

            if (members.length > 1) {
                // Find another admin or partner to transfer
                const successor = members.find(m => m._id !== userId && (m.role === 'partner' || m.role === 'admin'));
                if (successor) {
                    await ctx.db.patch(successor._id, { role: 'admin' });
                } else {
                    throw new Error("You must promote another member to admin before leaving, or remove all members first.");
                }
            }
        }

        // Leave family
        await ctx.db.patch(userId, { familyId: undefined, role: undefined });

        return { success: true };
    },
});

// Transfer admin role to another member
export const transferAdmin = mutation({
    args: {
        newAdminId: v.id("users"),
        token: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Unauthorized");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser || currentUser.role !== 'admin') {
            throw new Error("Only admin can transfer admin role");
        }

        const newAdmin = await ctx.db.get(args.newAdminId);
        if (!newAdmin) throw new Error("Member not found");

        if (newAdmin.familyId !== currentUser.familyId) {
            throw new Error("Member not in your family");
        }

        if (newAdmin._id === userId) {
            throw new Error("You are already the admin");
        }

        // Transfer admin
        await ctx.db.patch(args.newAdminId, { role: 'admin' });
        await ctx.db.patch(userId, { role: 'partner' });

        return { success: true };
    },
});
