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
        if (!user) throw new Error("Usuário não encontrado");

        const familyId = user.familyId;

        // Security Rule: Only admin/partner can create family budgets
        if (familyId && user.role === 'member') {
            throw new Error("Apenas administradores e parceiros podem definir orçamentos da família.");
        }

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
        const familyId = user?.familyId;

        // Verify ownership & Permissions
        const isOwner = budget.userId === userId;
        const isManager = familyId && (user?.role === "admin" || user?.role === "partner");
        const hasAccess = isOwner || (isManager && budget.familyId === familyId);

        // Additional Rule: Members cannot edit family budgets even if they created them (rare case)
        if (familyId && user?.role === 'member' && budget.familyId === familyId) {
            throw new Error("Membros não podem editar orçamentos da família.");
        }

        if (!hasAccess) {
            throw new Error("Você não tem permissão para atualizar este orçamento.");
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
        const familyId = user?.familyId;

        // Verify ownership & Permissions
        const isOwner = budget.userId === userId;
        const isManager = familyId && (user?.role === "admin" || user?.role === "partner");
        const hasAccess = isOwner || (isManager && budget.familyId === familyId);

        if (familyId && user?.role === 'member' && budget.familyId === familyId) {
            throw new Error("Membros não podem excluir orçamentos da família.");
        }

        if (!hasAccess) {
            throw new Error("Você não tem permissão para excluir este orçamento.");
        }

        await ctx.db.delete(args.id);
    },
});
