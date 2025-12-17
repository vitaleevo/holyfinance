import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserIdFromToken } from "./auth";

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
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
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) {
            throw new Error("Não autenticado");
        }

        const dataToUpdate: any = {};
        if (args.name !== undefined) dataToUpdate.name = args.name;
        if (args.phone !== undefined) dataToUpdate.phone = args.phone;
        if (args.currency !== undefined) dataToUpdate.currency = args.currency;

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
