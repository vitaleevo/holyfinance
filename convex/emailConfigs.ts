import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserIdFromToken } from "./auth";
import { encrypt } from "./utils";

export const saveSettings = mutation({
    args: {
        token: v.optional(v.string()),
        host: v.string(),
        port: v.number(),
        user: v.string(),
        pass: v.string(),
        fromEmail: v.string(),
        secure: v.boolean(),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Unauthorized");

        const existing = await ctx.db
            .query("emailSettings")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        const data = {
            userId,
            host: args.host,
            port: args.port,
            user: args.user,
            pass: encrypt(args.pass),
            fromEmail: args.fromEmail,
            secure: args.secure,
        };

        if (existing) {
            await ctx.db.patch(existing._id, data);
        } else {
            await ctx.db.insert("emailSettings", data);
        }
    },
});

export const getSettings = query({
    args: {
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) return null;

        const settings = await ctx.db
            .query("emailSettings")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (settings) {
            return {
                ...settings,
                pass: "********" // Never return encrypted pass to UI
            };
        }
        return null;
    },
});
