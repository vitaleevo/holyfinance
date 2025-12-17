import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
    args: {
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        if (!args.userId) return [];

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
        return await ctx.db.insert("budgetLimits", args);
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
        if (!budget || budget.userId !== userId) {
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
        if (!budget || budget.userId !== args.userId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});
