import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
    args: {
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        if (!args.userId) return [];

        return await ctx.db
            .query("debts")
            .withIndex("by_user", (q) => q.eq("userId", args.userId!))
            .collect();
    },
});

export const create = mutation({
    args: {
        userId: v.id("users"),
        name: v.string(),
        bank: v.string(),
        totalValue: v.number(),
        paidValue: v.number(),
        monthlyParcel: v.number(),
        dueDate: v.string(),
        icon: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("debts", args);
    },
});

export const update = mutation({
    args: {
        id: v.id("debts"),
        userId: v.id("users"),
        name: v.optional(v.string()),
        bank: v.optional(v.string()),
        totalValue: v.optional(v.number()),
        paidValue: v.optional(v.number()),
        monthlyParcel: v.optional(v.number()),
        dueDate: v.optional(v.string()),
        icon: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, userId, ...data } = args;

        const debt = await ctx.db.get(id);
        if (!debt || debt.userId !== userId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(id, data);
    },
});

export const remove = mutation({
    args: {
        id: v.id("debts"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const debt = await ctx.db.get(args.id);
        if (!debt || debt.userId !== args.userId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});

export const payParcel = mutation({
    args: {
        debtId: v.id("debts"),
        accountId: v.id("accounts"),
        amount: v.number(),
        date: v.string(),
    },
    handler: async (ctx, args) => {
        const debt = await ctx.db.get(args.debtId);
        const account = await ctx.db.get(args.accountId);

        if (!debt || !account) throw new Error("Referência não encontrada");
        if (debt.userId !== account.userId) throw new Error("Unauthorized");
        if ((account.balance ?? 0) < args.amount) throw new Error("Saldo insuficiente");

        // Update Debt
        await ctx.db.patch(debt._id, {
            paidValue: (debt.paidValue || 0) + args.amount
        });

        // Debit Account
        await ctx.db.patch(account._id, {
            balance: (account.balance || 0) - args.amount
        });

        // Create Transaction
        await ctx.db.insert("transactions", {
            userId: debt.userId,
            description: `Pagamento Dívida: ${debt.name}`,
            amount: args.amount,
            type: "expense",
            category: "Dívidas",
            date: args.date,
            account: account.name,
        });

        // Check if finished?
        const newPaid = (debt.paidValue || 0) + args.amount;
        if (newPaid >= debt.totalValue) {
            // Maybe notify?
            // console.log("Debt paid off!");
        }
    },
});
