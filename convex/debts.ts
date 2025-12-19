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

        // Admin/Partner see all family debts
        if (user.familyId && (user.role === 'admin' || user.role === 'partner')) {
            return await ctx.db
                .query("debts")
                .withIndex("by_family", (q) => q.eq("familyId", user.familyId!))
                .collect();
        }

        return await ctx.db
            .query("debts")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
    },
});

export const create = mutation({
    args: {
        token: v.optional(v.string()),
        name: v.string(),
        bank: v.string(),
        totalValue: v.number(),
        paidValue: v.number(),
        monthlyParcel: v.number(),
        dueDate: v.string(),
        icon: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autorizado");

        const user = await ctx.db.get(userId);
        const familyId = user?.familyId;

        const { token: _, ...debtData } = args;

        return await ctx.db.insert("debts", {
            ...debtData,
            userId,
            familyId
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("debts"),
        token: v.optional(v.string()),
        name: v.optional(v.string()),
        bank: v.optional(v.string()),
        totalValue: v.optional(v.number()),
        paidValue: v.optional(v.number()),
        monthlyParcel: v.optional(v.number()),
        dueDate: v.optional(v.string()),
        icon: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autorizado");

        const { id, token: _, ...data } = args;

        const debt = await ctx.db.get(id);
        if (!debt) throw new Error("Dívida não encontrada");

        const user = await ctx.db.get(userId);
        const hasAccess = debt.userId === userId || (user?.familyId && debt.familyId === user.familyId);

        if (!hasAccess) {
            throw new Error("Sem permissão para atualizar esta dívida");
        }

        await ctx.db.patch(id, data);
    },
});

export const remove = mutation({
    args: {
        id: v.id("debts"),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autorizado");

        const debt = await ctx.db.get(args.id);
        if (!debt) return;

        const user = await ctx.db.get(userId);
        const hasAccess = debt.userId === userId || (user?.familyId && debt.familyId === user.familyId);

        if (!hasAccess) {
            throw new Error("Sem permissão para excluir esta dívida");
        }

        await ctx.db.delete(args.id);
    },
});

export const payParcel = mutation({
    args: {
        debtId: v.id("debts"),
        accountId: v.id("accounts"),
        token: v.optional(v.string()),
        amount: v.number(),
        date: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autorizado");

        const user = await ctx.db.get(userId);
        const familyId = user?.familyId;

        const debt = await ctx.db.get(args.debtId);
        let account = await ctx.db.get(args.accountId);

        if (!debt || !account) throw new Error("Referência não encontrada");

        // Logic: Family-related transactions are deducted from admin's account
        let usedAccountId = args.accountId;
        let transDescription = `Pagamento Dívida: ${debt.name}`;

        if (familyId) {
            const admin = await ctx.db
                .query("users")
                .withIndex("by_family", (q) => q.eq("familyId", familyId))
                .filter((q) => q.eq(q.field("role"), "admin"))
                .first();

            if (admin && admin._id !== userId) {
                // Find admin's primary account
                const adminAccount = await ctx.db
                    .query("accounts")
                    .withIndex("by_user", (q) => q.eq("userId", admin._id))
                    .first();

                if (adminAccount) {
                    account = adminAccount;
                    usedAccountId = adminAccount._id;
                    transDescription += ` (Pago por: ${user?.name})`;
                }
            }
        }

        const debtAccess = debt.userId === userId || (familyId && debt.familyId === familyId);
        const accountAccess = account && (account.userId === userId || (familyId && account.familyId === familyId) || (account.userId === userId));

        if (!debtAccess) throw new Error("Sem permissão para acessar esta dívida");
        // if ((account.balance ?? 0) < args.amount) throw new Error("Saldo insuficiente na conta para este pagamento");

        // Update Debt
        await ctx.db.patch(debt._id, {
            paidValue: (debt.paidValue || 0) + args.amount
        });

        // Debit Account (Target Account)
        await ctx.db.patch(usedAccountId, {
            balance: (account.balance || 0) - args.amount
        });

        // Create Transaction (On the account that was actually debited)
        await ctx.db.insert("transactions", {
            userId: account.userId, // Transaction belongs to the account owner
            familyId,
            description: transDescription,
            amount: args.amount,
            type: "expense",
            category: "Dívidas",
            date: args.date,
            account: account.name,
        });
    },
});
