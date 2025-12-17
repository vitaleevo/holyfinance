import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
    args: {
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        if (!args.userId) return [];

        return await ctx.db
            .query("accounts")
            .withIndex("by_user", (q) => q.eq("userId", args.userId!))
            .collect();
    },
});

export const create = mutation({
    args: {
        userId: v.id("users"),
        name: v.string(),
        type: v.string(),
        balance: v.number(),
        bankName: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("accounts", args);
    },
});

export const update = mutation({
    args: {
        id: v.id("accounts"),
        userId: v.id("users"),
        name: v.optional(v.string()),
        type: v.optional(v.string()),
        balance: v.optional(v.number()),
        bankName: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, userId, ...data } = args;

        const account = await ctx.db.get(id);
        if (!account || account.userId !== userId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(id, data);
    },
});

export const remove = mutation({
    args: {
        id: v.id("accounts"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const account = await ctx.db.get(args.id);
        if (!account || account.userId !== args.userId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});

export const transfer = mutation({
    args: {
        fromAccountId: v.id("accounts"),
        toAccountId: v.id("accounts"),
        amount: v.number(),
        date: v.string(),
    },
    handler: async (ctx, args) => {
        const fromAccount = await ctx.db.get(args.fromAccountId);
        const toAccount = await ctx.db.get(args.toAccountId);

        if (!fromAccount || !toAccount) throw new Error("Conta não encontrada");
        if (fromAccount.userId !== toAccount.userId) throw new Error("Unauthorized");
        if (fromAccount._id === toAccount._id) throw new Error("Contas devem ser diferentes");
        if ((fromAccount.balance ?? 0) < args.amount) throw new Error("Saldo insuficiente");

        const newFromBalance = (fromAccount.balance ?? 0) - args.amount;
        const newToBalance = (toAccount.balance ?? 0) + args.amount;

        await ctx.db.patch(fromAccount._id, { balance: newFromBalance });
        await ctx.db.patch(toAccount._id, { balance: newToBalance });

        // Record transactions
        await ctx.db.insert("transactions", {
            userId: fromAccount.userId,
            description: `Transferência para ${toAccount.name}`,
            amount: args.amount,
            type: "expense",
            category: "Transferência",
            date: args.date,
            account: fromAccount.name,
        });

        await ctx.db.insert("transactions", {
            userId: toAccount.userId,
            description: `Transferência de ${fromAccount.name}`,
            amount: args.amount,
            type: "income",
            category: "Transferência",
            date: args.date,
            account: toAccount.name,
        });
    },
});
