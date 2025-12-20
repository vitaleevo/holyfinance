import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserIdFromToken } from "./auth";
import { decrypt } from "./utils";
import { api } from "./_generated/api";

export const list = query({
    args: {
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) return [];

        const user = await ctx.db.get(userId);
        if (user && user.familyId) {
            return await ctx.db
                .query("notifications")
                .withIndex("by_family", (q) => q.eq("familyId", user.familyId!))
                .order("desc")
                .collect();
        }

        return await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
    },
});

export const markAsRead = mutation({
    args: {
        id: v.id("notifications"),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        const notification = await ctx.db.get(args.id);

        if (!notification || !userId) {
            throw new Error("Unauthorized");
        }

        const user = await ctx.db.get(userId);
        const hasAccess = notification.userId === userId || (user?.familyId && notification.familyId === user.familyId);

        if (!hasAccess) throw new Error("Unauthorized");

        await ctx.db.patch(args.id, { read: true });
    },
});

export const markAllAsRead = mutation({
    args: {
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) return;

        const user = await ctx.db.get(userId);
        let unread = [];

        if (user?.familyId) {
            unread = await ctx.db
                .query("notifications")
                .withIndex("by_family", (q) => q.eq("familyId", user.familyId!))
                .filter((q) => q.eq(q.field("read"), false))
                .collect();
        } else {
            unread = await ctx.db
                .query("notifications")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .filter((q) => q.eq(q.field("read"), false))
                .collect();
        }

        for (const notif of unread) {
            await ctx.db.patch(notif._id, { read: true });
        }
    },
});

export const clearAll = mutation({
    args: {
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) return;

        const user = await ctx.db.get(userId);
        let notifications = [];

        if (user?.familyId) {
            notifications = await ctx.db
                .query("notifications")
                .withIndex("by_family", (q) => q.eq("familyId", user.familyId!))
                .collect();
        } else {
            notifications = await ctx.db
                .query("notifications")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .collect();
        }

        for (const notif of notifications) {
            await ctx.db.delete(notif._id);
        }
    },
});

// Helper for internal use from other mutations
export async function createNotification(ctx: any, args: { userId: any, familyId?: any, title: string, message: string, type: string, isImportant: boolean }) {
    await ctx.db.insert("notifications", {
        userId: args.userId,
        familyId: args.familyId,
        title: args.title,
        message: args.message,
        type: args.type,
        read: false,
        createdAt: new Date().toISOString(),
        isImportant: args.isImportant,
    });

    if (args.isImportant) {
        const user = await ctx.db.get(args.userId);
        const settings = await ctx.db
            .query("emailSettings")
            .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
            .first();

        if (user && user.email && settings) {
            await ctx.scheduler.runAfter(0, api.actions.email.send, {
                to: user.email,
                subject: args.title,
                html: `<p style="font-family: sans-serif;">${args.message.replace(/\n/g, "<br>")}</p>`,
                host: settings.host,
                port: settings.port,
                user: settings.user,
                pass: decrypt(settings.pass),
                fromEmail: settings.fromEmail,
                secure: settings.secure
            });
            console.log(`[EMAIL SENT] To ${user.email}`);
        } else {
            console.log(`[EMAIL SKIPPED] No settings or user email for ${args.userId}`);
        }
    }
}

// Internal helper to create notification
// In production, this would be an internal function or called via action
const create = mutation({
    args: {
        userId: v.id("users"),
        familyId: v.optional(v.id("families")),
        title: v.string(),
        message: v.string(),
        type: v.string(), // info, warning, success, error
        isImportant: v.boolean(),
    },
    handler: async (ctx, args) => {
        await createNotification(ctx, args);
    },
});
