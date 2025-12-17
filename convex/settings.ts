import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
    args: {
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        if (!args.userId) return null;

        return await ctx.db
            .query("settings")
            .withIndex("by_user", (q) => q.eq("userId", args.userId!))
            .first();
    },
});

export const update = mutation({
    args: {
        userId: v.id("users"),
        theme: v.optional(v.string()),
        emailNotifications: v.optional(v.boolean()),
        privacyMode: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { userId, ...data } = args;

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
