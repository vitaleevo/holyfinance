import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserIdFromToken } from "./auth";

export const get = query({
    args: {
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) return null;

        return await ctx.db
            .query("settings")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();
    },
});

export const update = mutation({
    args: {
        token: v.optional(v.string()),
        theme: v.optional(v.string()),
        emailNotifications: v.optional(v.boolean()),
        privacyMode: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Não autorizado");

        const { token: _, ...data } = args;

        const settings = await ctx.db
            .query("settings")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (settings) {
            await ctx.db.patch(settings._id, data);
        } else {
            // Create settings if they don't exist
            await ctx.db.insert("settings", {
                userId,
                theme: data.theme ?? "dark",
                emailNotifications: data.emailNotifications ?? true,
                privacyMode: data.privacyMode ?? false,
            });
        }
    },
});
