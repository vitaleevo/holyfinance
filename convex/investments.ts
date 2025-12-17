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

        // Admin/Partner see all family investments
        if (user.familyId && (user.role === 'admin' || user.role === 'partner')) {
            return await ctx.db
                .query("investments")
                .withIndex("by_family", (q) => q.eq("familyId", user.familyId!))
                .collect();
        }

        return await ctx.db
            .query("investments")
            .withIndex("by_user", (q) => q.eq("userId", args.userId!))
            .collect();
    },
});

export const create = mutation({
    args: {
        userId: v.id("users"),
        ticker: v.string(),
        name: v.string(),
        type: v.string(),
        quantity: v.number(),
        price: v.number(),
        accountId: v.optional(v.id("accounts")),
    },
    handler: async (ctx, args) => {
        const { accountId, ...investmentData } = args;

        const user = await ctx.db.get(args.userId);
        const familyId = user?.familyId;

        const id = await ctx.db.insert("investments", { ...investmentData, familyId });

        // Debit from account if specified
        if (accountId) {
            const account = await ctx.db.get(accountId);
            const accountAccess = account && (account.userId === args.userId || (familyId && account.familyId === familyId));
            if (accountAccess) {
                const totalCost = args.quantity * args.price;
                await ctx.db.patch(accountId, {
                    balance: (account.balance ?? 0) - totalCost,
                });
            }
        }

        return id;
    },
});

export const update = mutation({
    args: {
        id: v.id("investments"),
        userId: v.id("users"),
        ticker: v.optional(v.string()),
        name: v.optional(v.string()),
        type: v.optional(v.string()),
        quantity: v.optional(v.number()),
        price: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { id, userId, ...data } = args;

        const investment = await ctx.db.get(id);
        if (!investment) throw new Error("Not found");

        const user = await ctx.db.get(userId);
        const hasAccess = investment.userId === userId || (user?.familyId && investment.familyId === user.familyId);

        if (!hasAccess) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(id, data);
    },
});

export const remove = mutation({
    args: {
        id: v.id("investments"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const investment = await ctx.db.get(args.id);
        if (!investment) return;

        const user = await ctx.db.get(args.userId);
        const hasAccess = investment.userId === args.userId || (user?.familyId && investment.familyId === user.familyId);

        if (!hasAccess) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});
