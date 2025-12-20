import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getUserIdFromToken } from "./auth";
import { Id, TableNames } from "./_generated/dataModel";

export const generateUploadUrl = mutation({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autenticado");
        return await ctx.storage.generateUploadUrl();
    }
});

export const updateAvatar = mutation({
    args: {
        storageId: v.id("_storage"),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Authenticate
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) {
            throw new Error("Não autenticado");
        }

        const user = await ctx.db.get(userId);
        if (!user) throw new Error("Usuário não encontrado");

        // Update user with new storage ID
        await ctx.db.patch(userId, {
            avatarStorageId: args.storageId,
        });
    },
});

export const updateProfile = mutation({
    args: {
        token: v.optional(v.string()),
        name: v.optional(v.string()),
        phone: v.optional(v.string()),
        currency: v.optional(v.string()),
        familyRelationship: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) {
            throw new Error("Não autenticado");
        }

        const dataToUpdate: {
            name?: string;
            phone?: string;
            currency?: string;
            familyRelationship?: string;
        } = {};
        if (args.name !== undefined) dataToUpdate.name = args.name;
        if (args.phone !== undefined) dataToUpdate.phone = args.phone;
        if (args.currency !== undefined) dataToUpdate.currency = args.currency;
        if (args.familyRelationship !== undefined) dataToUpdate.familyRelationship = args.familyRelationship;

        await ctx.db.patch(userId, dataToUpdate);

        // Notify user
        await ctx.db.insert("notifications", {
            userId,
            title: "Perfil Atualizado",
            message: "Suas informações de perfil foram atualizadas com sucesso.",
            type: "success",
            read: false,
            createdAt: new Date().toISOString(),
            isImportant: false,
        });
    },
});

export const requestAccountDeletion = mutation({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autenticado");

        const user = await ctx.db.get(userId);
        if (!user) throw new Error("Usuário não encontrado");

        const deletionDate = new Date();
        deletionDate.setDate(deletionDate.getDate() + 7);

        await ctx.db.patch(userId, {
            deletionScheduledAt: deletionDate.toISOString(),
        });

        // Notify user
        await ctx.db.insert("notifications", {
            userId,
            title: "Exclusão de Conta Agendada",
            message: "Sua conta será excluída permanentemente em 7 dias (em " + deletionDate.toLocaleDateString('pt-BR') + "). Você pode cancelar esta ação a qualquer momento nas configurações.",
            type: "warning",
            read: false,
            createdAt: new Date().toISOString(),
            isImportant: true,
        });
    }
});

export const cancelAccountDeletion = mutation({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autenticado");

        await ctx.db.patch(userId, {
            deletionScheduledAt: undefined,
        });

        // Notify user
        await ctx.db.insert("notifications", {
            userId,
            title: "Exclusão Cancelada",
            message: "A exclusão da sua conta foi cancelada com sucesso.",
            type: "success",
            read: false,
            createdAt: new Date().toISOString(),
            isImportant: false,
        });
    }
});

export const getProfile = query({
    args: {
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) return null;

        const user = await ctx.db.get(userId);
        if (!user) return null;

        let avatarUrl = null;
        if (user.avatarStorageId) {
            avatarUrl = await ctx.storage.getUrl(user.avatarStorageId);
        }

        return {
            ...user,
            avatarUrl,
        };
    },
});

export const deleteScheduledAccounts = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = new Date().toISOString();
        const usersToDelete = await ctx.db
            .query("users")
            .withIndex("by_deletion", (q) => q.lte("deletionScheduledAt", now))
            .collect();

        for (const user of usersToDelete) {
            await deleteUserData(ctx, user._id);
        }
    }
});

async function deleteUserData(ctx: any, userId: Id<"users">) {
    const user = await ctx.db.get(userId);
    if (!user) return;

    // Delete avatar if exists
    if (user.avatarStorageId) {
        try {
            await ctx.storage.delete(user.avatarStorageId);
        } catch (e) {
            console.error("Erro ao deletar avatar:", e);
        }
    }

    // Cleanup family if last member
    if (user.familyId) {
        const otherMembers = await ctx.db
            .query("users")
            .withIndex("by_family", (q: any) => q.eq("familyId", user.familyId))
            .collect();

        // Note: the current user is still in the database at this point
        if (otherMembers.length <= 1) {
            await ctx.db.delete(user.familyId);
        }
    }

    // List of tables to clean up (those with by_user index)
    const tables: TableNames[] = [
        "sessions", "settings", "accounts", "transactions", "goals",
        "budgetLimits", "investments", "debts", "notifications",
        "emailSettings", "categories"
    ];

    for (const tableName of tables) {
        const records = await ctx.db
            .query(tableName)
            .withIndex("by_user", (q: any) => q.eq("userId", userId))
            .collect();
        for (const record of records) {
            await ctx.db.delete(record._id);
        }
    }

    // Finally delete the user
    await ctx.db.delete(userId);
}
