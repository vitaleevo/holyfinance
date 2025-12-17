import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
    args: {
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        if (!args.userId) return [];

        const user = await ctx.db.get(args.userId!);
        if (!user) return [];

        // Admin/Partner see all family budget limits
        if (user.familyId && (user.role === 'admin' || user.role === 'partner')) {
            return await ctx.db
                .query("budgetLimits")
                .withIndex("by_family", (q) => q.eq("familyId", user.familyId!))
                .collect();
        }

        return await ctx.db
            .query("budgetLimits")
            .withIndex("by_user", (q) => q.eq("userId", args.userId!))
            .collect();
    },
});

export const create = mutation({
    args: {
        userId: v.id("users"),
        category: v.string(),
        limit: v.number(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        const familyId = user?.familyId;

        return await ctx.db.insert("budgetLimits", { ...args, familyId });
    },
});

export const update = mutation({
    args: {
        id: v.id("budgetLimits"),
        userId: v.id("users"),
        category: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { id, userId, ...data } = args;

        const budget = await ctx.db.get(id);
        if (!budget) throw new Error("Not found");

        const user = await ctx.db.get(userId);
        const hasAccess = budget.userId === userId || (user?.familyId && budget.familyId === user.familyId);

        if (!hasAccess) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(id, data);
    },
});

export const remove = mutation({
    args: {
        id: v.id("budgetLimits"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const budget = await ctx.db.get(args.id);
        if (!budget) return;

        const user = await ctx.db.get(args.userId);
        const hasAccess = budget.userId === args.userId || (user?.familyId && budget.familyId === user.familyId);

        if (!hasAccess) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});
