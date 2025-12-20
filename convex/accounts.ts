import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserIdFromToken } from "./auth";
import { checkLimit } from "./plans";

export const get = query({
    args: {
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) return [];

        const user = await ctx.db.get(userId);
        if (!user) return [];

        // If user is in a family AND has full access (admin/partner), show all family data
        if (user.familyId && (user.role === 'admin' || user.role === 'partner')) {
            return await ctx.db
                .query("accounts")
                .withIndex("by_family", (q) => q.eq("familyId", user.familyId!))
                .collect();
        }

        // Members only see their own accounts
        return await ctx.db
            .query("accounts")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
    },
});

export const create = mutation({
    args: {
        token: v.optional(v.string()),
        name: v.string(),
        type: v.string(),
        balance: v.number(),
        bankName: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autorizado");

        const user = await ctx.db.get(userId);
        const familyId = user?.familyId;

        // Plan Limit Check for Accounts
        const currentAccounts = await ctx.db
            .query("accounts")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        const canCreate = checkLimit(user?.planType, "maxAccounts", currentAccounts.length);
        if (!canCreate) {
            throw new Error("Limite de contas atingido para seu plano atual. Faça upgrade para adicionar mais contas.");
        }

        return await ctx.db.insert("accounts", {
            userId,
            name: args.name,
            type: args.type,
            balance: args.balance,
            bankName: args.bankName,
            familyId,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("accounts"),
        token: v.optional(v.string()),
        name: v.optional(v.string()),
        type: v.optional(v.string()),
        balance: v.optional(v.number()),
        bankName: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autorizado");

        const { id, token, ...data } = args;

        const account = await ctx.db.get(id);
        if (!account) throw new Error("Conta não encontrada");

        const user = await ctx.db.get(userId);

        // Verify ownership & Permissions
        const isOwner = account.userId === userId;
        const isManager = user?.familyId && (user.role === "admin" || user.role === "partner");
        const hasAccess = isOwner || (isManager && account.familyId === user.familyId);

        if (!hasAccess) {
            throw new Error("Você não tem permissão para alterar esta conta.");
        }

        await ctx.db.patch(id, data);
    },
});

export const remove = mutation({
    args: {
        id: v.id("accounts"),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autorizado");

        const account = await ctx.db.get(args.id);
        if (!account) return;

        const user = await ctx.db.get(userId);

        // Verify ownership & Permissions
        const isOwner = account.userId === userId;
        const isManager = user?.familyId && (user.role === "admin" || user.role === "partner");
        const hasAccess = isOwner || (isManager && account.familyId === user.familyId);

        if (!hasAccess) {
            throw new Error("Você não tem permissão para remover esta conta.");
        }

        await ctx.db.delete(args.id);
    },
});

export const transfer = mutation({
    args: {
        token: v.optional(v.string()),
        fromAccountId: v.id("accounts"),
        toAccountId: v.id("accounts"),
        amount: v.number(),
        date: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autorizado");

        const fromAccount = await ctx.db.get(args.fromAccountId);
        const toAccount = await ctx.db.get(args.toAccountId);

        if (!fromAccount || !toAccount) throw new Error("Conta não encontrada");

        const user = await ctx.db.get(userId);
        const familyId = user?.familyId;

        // Permission check for transfer
        const canAccessFrom = fromAccount.userId === userId || (familyId && fromAccount.familyId === familyId && (user?.role === 'admin' || user?.role === 'partner'));
        const canAccessTo = toAccount.userId === userId || (familyId && toAccount.familyId === familyId && (user?.role === 'admin' || user?.role === 'partner'));

        if (!canAccessFrom || !canAccessTo) throw new Error("Você não tem permissão para realizar esta transferência.");
        if (fromAccount._id === toAccount._id) throw new Error("Contas devem ser diferentes");
        if ((fromAccount.balance ?? 0) < args.amount) throw new Error("Saldo insuficiente na conta de origem");

        const newFromBalance = (fromAccount.balance ?? 0) - args.amount;
        const newToBalance = (toAccount.balance ?? 0) + args.amount;

        await ctx.db.patch(fromAccount._id, { balance: newFromBalance });
        await ctx.db.patch(toAccount._id, { balance: newToBalance });

        // Record transactions
        await ctx.db.insert("transactions", {
            userId: userId, // Performed by
            familyId,
            description: `Transferência: ${fromAccount.name} -> ${toAccount.name}`,
            amount: args.amount,
            type: "expense",
            category: "Transferência",
            date: args.date,
            account: fromAccount.name,
        });

        await ctx.db.insert("transactions", {
            userId: userId, // Performed by
            familyId,
            description: `Transferência: ${fromAccount.name} -> ${toAccount.name}`,
            amount: args.amount,
            type: "income",
            category: "Transferência",
            date: args.date,
            account: toAccount.name,
        });
    },
});
