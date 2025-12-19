import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserIdFromToken } from "./auth";

export const get = query({
    args: {
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) return [];

        const user = await ctx.db.get(userId);
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
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
    },
});

export const create = mutation({
    args: {
        token: v.optional(v.string()),
        ticker: v.string(),
        name: v.string(),
        type: v.string(),
        quantity: v.number(),
        price: v.number(),
        accountId: v.optional(v.id("accounts")),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autorizado");

        const { accountId, token, ...investmentData } = args;

        const user = await ctx.db.get(userId);
        const familyId = user?.familyId;

        const id = await ctx.db.insert("investments", {
            ...investmentData,
            userId,
            familyId
        });

        // Debit from account if specified
        if (accountId) {
            const account = await ctx.db.get(accountId);
            const accountAccess = account && (account.userId === userId || (familyId && account.familyId === familyId));
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
        token: v.optional(v.string()),
        ticker: v.optional(v.string()),
        name: v.optional(v.string()),
        type: v.optional(v.string()),
        quantity: v.optional(v.number()),
        price: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autorizado");

        const { id, token, ...data } = args;

        const investment = await ctx.db.get(id);
        if (!investment) throw new Error("Investimento não encontrado");

        const user = await ctx.db.get(userId);
        const hasAccess = investment.userId === userId || (user?.familyId && investment.familyId === user.familyId);

        if (!hasAccess) {
            throw new Error("Sem permissão para atualizar este investimento");
        }

        await ctx.db.patch(id, data);
    },
});

export const remove = mutation({
    args: {
        id: v.id("investments"),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autorizado");

        const investment = await ctx.db.get(args.id);
        if (!investment) return;

        const user = await ctx.db.get(userId);
        const hasAccess = investment.userId === userId || (user?.familyId && investment.familyId === user.familyId);

        if (!hasAccess) {
            throw new Error("Sem permissão para remover este investimento");
        }

        await ctx.db.delete(args.id);
    },
});
