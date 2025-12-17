import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { createNotification } from "./notifications";

export const get = query({
    args: {
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        if (!args.userId) return [];

        const user = await ctx.db.get(args.userId!);
        if (!user) return [];

        // If user is admin/partner, show all family transactions
        if (user.familyId && (user.role === 'admin' || user.role === 'partner')) {
            return await ctx.db
                .query("transactions")
                .withIndex("by_family", (q) => q.eq("familyId", user.familyId!))
                .order("desc")
                .collect();
        }

        return await ctx.db
            .query("transactions")
            .withIndex("by_user", (q) => q.eq("userId", args.userId!))
            .order("desc")
            .collect();
    },
});

export const create = mutation({
    args: {
        userId: v.id("users"),
        description: v.string(),
        amount: v.number(),
        type: v.string(),
        category: v.string(),
        date: v.string(),
        account: v.string(),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        const familyId = user?.familyId;

        const id = await ctx.db.insert("transactions", {
            ...args,
            status: args.status || "completed", // Default
            familyId
        });

        // Update Account Balance
        let accountQuery = ctx.db.query("accounts");
        if (familyId) {
            // @ts-ignore
            accountQuery = accountQuery.withIndex("by_family", q => q.eq("familyId", familyId));
        } else {
            accountQuery = accountQuery.withIndex("by_user", q => q.eq("userId", args.userId));
        }

        const account = await accountQuery
            .filter((q) => q.eq(q.field("name"), args.account))
            .first();

        if (account) {
            let newBalance = account.balance ?? 0;
            if (args.type === "income") {
                newBalance += args.amount;
            } else {
                newBalance -= args.amount;
            }
            await ctx.db.patch(account._id, { balance: newBalance });
        }

        // Check Budget Limit (Negative Objective)
        if (args.type === "expense") {
            let limitDoc;
            if (familyId) {
                limitDoc = await ctx.db.query("budgetLimits")
                    .withIndex("by_family", q => q.eq("familyId", familyId))
                    .filter(q => q.eq(q.field("category"), args.category))
                    .first();
            } else {
                limitDoc = await ctx.db.query("budgetLimits")
                    .withIndex("by_user", q => q.eq("userId", args.userId))
                    .filter(q => q.eq(q.field("category"), args.category))
                    .first();
            }

            if (limitDoc) {
                // Calculate total spend this month for this category
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

                let transactionsQuery = ctx.db.query("transactions");
                if (familyId) {
                    // @ts-ignore
                    transactionsQuery = transactionsQuery.withIndex("by_family", q => q.eq("familyId", familyId));
                } else {
                    transactionsQuery = transactionsQuery.withIndex("by_user", q => q.eq("userId", args.userId));
                }

                const transactions = await transactionsQuery
                    .filter((q) => q.and(
                        q.eq(q.field("category"), args.category),
                        q.eq(q.field("type"), "expense"),
                        q.gte(q.field("date"), startOfMonth)
                    ))
                    .collect();

                const totalSpent = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

                if (totalSpent > limitDoc.limit) {
                    const ideas = [
                        "Tente reduzir gastos supérfluos nesta categoria até o fim do mês.",
                        "Reveja suas assinaturas ou compras recorrentes.",
                        "Prepare sua próxima refeição em casa para economizar."
                    ];
                    const idea = ideas[Math.floor(Math.random() * ideas.length)];

                    await createNotification(ctx, {
                        userId: args.userId,
                        familyId,
                        title: `Orçamento Excedido: ${args.category} ⚠️`,
                        message: `Você ultrapassou o limite de ${limitDoc.limit} para ${args.category}. Gasto atual: ${totalSpent}.\n\n💡 Ideia: ${idea}`,
                        type: "warning", // Negative
                        isImportant: true,
                    });
                }
            }
        }

        return id;
    },
});

export const update = mutation({
    args: {
        id: v.id("transactions"),
        userId: v.id("users"),
        description: v.string(),
        amount: v.number(),
        type: v.string(),
        category: v.string(),
        date: v.string(),
        account: v.string(),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, userId, ...newData } = args;
        const oldTransaction = await ctx.db.get(id);

        if (!oldTransaction) {
            throw new Error("Transaction not found");
        }

        const user = await ctx.db.get(userId);
        const familyId = user?.familyId;

        // Verify ownership
        const hasAccess = oldTransaction.userId === userId || (familyId && oldTransaction.familyId === familyId);
        if (!hasAccess) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(id, newData);

        // Helper to find account
        const findAccount = async (name: string) => {
            let q = ctx.db.query("accounts");
            if (familyId) {
                // @ts-ignore
                q = q.withIndex("by_family", qt => qt.eq("familyId", familyId));
            } else {
                q = q.withIndex("by_user", qt => qt.eq("userId", userId));
            }
            return await q.filter(qt => qt.eq(qt.field("name"), name)).first();
        };

        // Revert old transaction effect
        const oldAccount = await findAccount(oldTransaction.account);
        if (oldAccount) {
            let balance = oldAccount.balance ?? 0;
            if (oldTransaction.type === "income") {
                balance -= oldTransaction.amount;
            } else {
                balance += oldTransaction.amount;
            }
            await ctx.db.patch(oldAccount._id, { balance });
        }

        // Apply new transaction effect
        const newAccount = await findAccount(newData.account);
        if (newAccount) {
            let balance = newAccount.balance ?? 0;
            if (newData.type === "income") {
                balance += newData.amount;
            } else {
                balance -= newData.amount;
            }
            await ctx.db.patch(newAccount._id, { balance });
        }
    },
});

export const remove = mutation({
    args: {
        id: v.id("transactions"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const transaction = await ctx.db.get(args.id);
        if (!transaction) return;

        const user = await ctx.db.get(args.userId);
        const familyId = user?.familyId;

        // Verify ownership
        const hasAccess = transaction.userId === args.userId || (familyId && transaction.familyId === familyId);
        if (!hasAccess) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);

        // Revert Account Balance
        let accountQuery = ctx.db.query("accounts");
        if (familyId) {
            // @ts-ignore
            accountQuery = accountQuery.withIndex("by_family", q => q.eq("familyId", familyId));
        } else {
            accountQuery = accountQuery.withIndex("by_user", q => q.eq("userId", args.userId));
        }

        const account = await accountQuery
            .filter((q) => q.eq(q.field("name"), transaction.account))
            .first();

        if (account) {
            let balance = account.balance ?? 0;
            if (transaction.type === "income") {
                balance -= transaction.amount;
            } else {
                balance += transaction.amount;
            }
            await ctx.db.patch(account._id, { balance });
        }
    },
});
