import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { createNotification } from "./notifications";
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

        // Admin/Partner see all family goals
        if (user.familyId && (user.role === 'admin' || user.role === 'partner')) {
            return await ctx.db
                .query("goals")
                .withIndex("by_family", (q) => q.eq("familyId", user.familyId!))
                .collect();
        }

        return await ctx.db
            .query("goals")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
    },
});

export const create = mutation({
    args: {
        token: v.optional(v.string()),
        title: v.string(),
        category: v.string(),
        targetAmount: v.number(),
        deadline: v.string(),
        icon: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autorizado");

        const user = await ctx.db.get(userId);
        const familyId = user?.familyId;

        const { token, ...goalData } = args;

        return await ctx.db.insert("goals", {
            ...goalData,
            userId,
            familyId,
            currentAmount: 0,
            status: "active",
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("goals"),
        token: v.optional(v.string()),
        title: v.optional(v.string()),
        category: v.optional(v.string()),
        targetAmount: v.optional(v.number()),
        currentAmount: v.optional(v.number()),
        deadline: v.optional(v.string()),
        icon: v.optional(v.string()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autorizado");

        const { id, token, ...data } = args;

        const goal = await ctx.db.get(id);
        if (!goal) throw new Error("Meta não encontrada");

        const user = await ctx.db.get(userId);

        // Verify ownership & Permissions
        const isOwner = goal.userId === userId;
        const isManager = user?.familyId && (user.role === "admin" || user.role === "partner");
        const hasAccess = isOwner || (isManager && goal.familyId === user.familyId);

        if (!hasAccess) {
            throw new Error("Você não tem permissão para atualizar esta meta.");
        }

        await ctx.db.patch(id, data);
    },
});

export const remove = mutation({
    args: {
        id: v.id("goals"),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autorizado");

        const goal = await ctx.db.get(args.id);
        if (!goal) return;

        const user = await ctx.db.get(userId);

        // Verify ownership & Permissions
        const isOwner = goal.userId === userId;
        const isManager = user?.familyId && (user.role === "admin" || user.role === "partner");
        const hasAccess = isOwner || (isManager && goal.familyId === user.familyId);

        if (!hasAccess) {
            throw new Error("Você não tem permissão para excluir esta meta.");
        }

        await ctx.db.delete(args.id);
    },
});

export const addFundsCompensating = mutation({
    args: {
        goalId: v.id("goals"),
        token: v.optional(v.string()),
        amount: v.number(),
        accountId: v.optional(v.id("accounts")),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autorizado");

        const goal = await ctx.db.get(args.goalId);
        if (!goal) throw new Error("Meta não encontrada");

        const user = await ctx.db.get(userId);
        const familyId = user?.familyId;
        // Verify ownership & Permissions
        const isOwner = goal.userId === userId;
        const isManager = familyId && (user?.role === "admin" || user?.role === "partner");
        const hasAccess = isOwner || (isManager && goal.familyId === familyId);

        if (!hasAccess) {
            throw new Error("Você não tem permissão para adicionar fundos a esta meta.");
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
                userId: userId,
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
            const accountAccess = account && (account.userId === userId || (familyId && account.familyId === familyId));
            if (accountAccess) {
                await ctx.db.patch(args.accountId, {
                    balance: (account.balance ?? 0) - args.amount,
                });
            }
        }
    },
});

export const checkDeadlines = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);

        const goals = await ctx.db.query("goals")
            .filter(q => q.eq(q.field("status"), "active"))
            .collect();

        for (const goal of goals) {
            const deadline = new Date(goal.deadline);
            // If deadline is within next 7 days
            if (deadline > now && deadline <= nextWeek) {
                await createNotification(ctx, {
                    userId: goal.userId,
                    familyId: goal.familyId,
                    title: `Prazo de Meta Próximo: ${goal.title} ⏳`,
                    message: `A data alvo da sua meta "${goal.title}" é em ${deadline.toLocaleDateString('pt-AO')}. Você já guardou ${goal.currentAmount} de ${goal.targetAmount}.`,
                    type: "warning",
                    isImportant: true,
                });
            }
        }
    }
});
