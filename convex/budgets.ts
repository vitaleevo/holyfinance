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

        // Admin/Partner see all family budget limits
        if (user.familyId && (user.role === 'admin' || user.role === 'partner')) {
            return await ctx.db
                .query("budgetLimits")
                .withIndex("by_family", (q) => q.eq("familyId", user.familyId!))
                .collect();
        }

        return await ctx.db
            .query("budgetLimits")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
    },
});

export const create = mutation({
    args: {
        token: v.optional(v.string()),
        category: v.string(),
        limit: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autorizado");

        const user = await ctx.db.get(userId);
        const familyId = user?.familyId;

        const { token: _, ...data } = args;

        return await ctx.db.insert("budgetLimits", {
            ...data,
            userId,
            familyId
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("budgetLimits"),
        token: v.optional(v.string()),
        category: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autorizado");

        const { id, token: _, ...data } = args;

        const budget = await ctx.db.get(id);
        if (!budget) throw new Error("Orçamento não encontrado");

        const user = await ctx.db.get(userId);
        const hasAccess = budget.userId === userId || (user?.familyId && budget.familyId === user.familyId);

        if (!hasAccess) {
            throw new Error("Sem permissão para atualizar este orçamento");
        }

        await ctx.db.patch(id, data);
    },
});

export const remove = mutation({
    args: {
        id: v.id("budgetLimits"),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autorizado");

        const budget = await ctx.db.get(args.id);
        if (!budget) return;

        const user = await ctx.db.get(userId);
        const hasAccess = budget.userId === userId || (user?.familyId && budget.familyId === user.familyId);

        if (!hasAccess) {
            throw new Error("Sem permissão para excluir este orçamento");
        }

        await ctx.db.delete(args.id);
    },
});
