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

        if (!family) throw new Error("Invalid family code");

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

        // Get members
        const members = await ctx.db
            .query("users")
            .withIndex("by_family", (q) => q.eq("familyId", user.familyId!))
            .collect();

        return {
            family,
            members: members.map(m => ({
                id: m._id,
                name: m.name,
                email: m.email,
                role: m.role,
                avatarStorageId: m.avatarStorageId
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
