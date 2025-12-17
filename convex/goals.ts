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

        // Admin/Partner see all family goals
        if (user.familyId && (user.role === 'admin' || user.role === 'partner')) {
            return await ctx.db
                .query("goals")
                .withIndex("by_family", (q) => q.eq("familyId", user.familyId!))
                .collect();
        }

        return await ctx.db
            .query("goals")
            .withIndex("by_user", (q) => q.eq("userId", args.userId!))
            .collect();
    },
});

export const create = mutation({
    args: {
        userId: v.id("users"),
        title: v.string(),
        category: v.string(),
        targetAmount: v.number(),
        deadline: v.string(),
        icon: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        const familyId = user?.familyId;

        return await ctx.db.insert("goals", {
            ...args,
            familyId,
            currentAmount: 0,
            status: "active",
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("goals"),
        userId: v.id("users"),
        title: v.optional(v.string()),
        category: v.optional(v.string()),
        targetAmount: v.optional(v.number()),
        currentAmount: v.optional(v.number()),
        deadline: v.optional(v.string()),
        icon: v.optional(v.string()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, userId, ...data } = args;

        const goal = await ctx.db.get(id);
        if (!goal) throw new Error("Not found");

        const user = await ctx.db.get(userId);
        const hasAccess = goal.userId === userId || (user?.familyId && goal.familyId === user.familyId);

        if (!hasAccess) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(id, data);
    },
});

export const remove = mutation({
    args: {
        id: v.id("goals"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const goal = await ctx.db.get(args.id);
        if (!goal) return;

        const user = await ctx.db.get(args.userId);
        const hasAccess = goal.userId === args.userId || (user?.familyId && goal.familyId === user.familyId);

        if (!hasAccess) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});

export const addFundsCompensating = mutation({
    args: {
        goalId: v.id("goals"),
        userId: v.id("users"),
        amount: v.number(),
        accountId: v.optional(v.id("accounts")),
    },
    handler: async (ctx, args) => {
        const goal = await ctx.db.get(args.goalId);
        if (!goal) throw new Error("Not found");

        const user = await ctx.db.get(args.userId);
        const familyId = user?.familyId;
        const hasAccess = goal.userId === args.userId || (familyId && goal.familyId === familyId);

        if (!hasAccess) {
            throw new Error("Unauthorized");
        }

        // Update goal
        const newAmount = goal.currentAmount + args.amount;
        const isCompleted = newAmount >= goal.targetAmount;
        const wasCompleted = goal.status === "completed";

        await ctx.db.patch(args.goalId, {
            currentAmount: newAmount,
            status: isCompleted ? "completed" : "active",
        });

        // Notify if just completed
        if (isCompleted && !wasCompleted) {
            const ideas = [
                "Considere mover os fundos para um investimento de baixo risco agora.",
                "Que tal definir uma meta maior para continuar crescendo?",
                "Reveja seu orçamento para otimizar ainda mais seus ganhos."
            ];
            const idea = ideas[Math.floor(Math.random() * ideas.length)];

            await createNotification(ctx, {
                userId: args.userId,
                familyId,
                title: `Meta Atingida: ${goal.title} 🎉`,
                message: `Parabéns! Você alcançou o valor alvo de ${goal.targetAmount}.\n\n💡 Ideia: ${idea}`,
                type: "success",
                isImportant: true,
            });
        }

        // Debit from account if specified
        if (args.accountId) {
            const account = await ctx.db.get(args.accountId);
            const accountAccess = account && (account.userId === args.userId || (familyId && account.familyId === familyId));
            if (accountAccess) {
                await ctx.db.patch(args.accountId, {
                    balance: (account.balance ?? 0) - args.amount,
                });
            }
        }
    },
});
