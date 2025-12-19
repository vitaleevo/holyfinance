import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserIdFromToken } from "./auth";

const DEFAULT_CATEGORIES = [
    // Expenses
    { name: "Alimentação", type: "expense", icon: "restaurant", color: "#FF5252", isDefault: true },
    { name: "Transporte", type: "expense", icon: "directions_car", color: "#448AFF", isDefault: true },
    { name: "Moradia", type: "expense", icon: "home", color: "#7C4DFF", isDefault: true },
    { name: "Lazer", type: "expense", icon: "sports_esports", color: "#FFAB40", isDefault: true },
    { name: "Saúde", type: "expense", icon: "medical_services", color: "#00BFA5", isDefault: true },
    { name: "Educação", type: "expense", icon: "school", color: "#40C4FF", isDefault: true },
    { name: "Outros", type: "expense", icon: "more_horiz", color: "#9E9E9E", isDefault: true },

    // Income
    { name: "Salário", type: "income", icon: "payments", color: "#69F0AE", isDefault: true },
    { name: "Investimento", type: "income", icon: "trending_up", color: "#00E676", isDefault: true },
    { name: "Extra", type: "income", icon: "add", color: "#FFFF00", isDefault: true },
    { name: "Presente", type: "income", icon: "card_giftcard", color: "#E040FB", isDefault: true },
];

export const get = query({
    args: {
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) return [];

        const user = await ctx.db.get(userId);
        const familyId = user?.familyId;

        let categories;

        // Strategy: Fetch user categories. If none exist (and no family ones), seed defaults for the user.
        // If family exists, we check family categories separately/additionally? 
        // For now, let's assume we fetch both User + Family.

        // Fetch User Categories
        const userCategories = await ctx.db
            .query("categories")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        // Fetch Family Categories (if applicable)
        let familyCategories: any[] = [];
        if (familyId) {
            familyCategories = await ctx.db
                .query("categories")
                .withIndex("by_family", (q) => q.eq("familyId", familyId))
                .collect();
        }

        const allCategories = [...userCategories, ...familyCategories];

        // Seed Defaults if completely empty (New User or Migration)
        // Note: We only auto-seed for the USER. Family shared categories are explicit.
        if (allCategories.length === 0) {
            // This side-effect inside a query is not allowed in Convex (Queries are read-only).
            // We must accept that this returns empty, and the UI should trigger a seed Mutation, 
            // OR we just hardcode defaults in the UI if the list is empty?
            // Better approach: We cannot write in a query.
            // We will return a special flag or just the raw list.
            // Actually, for a quick "Must Work" approach:
            // The UI logic: If query returns empty array, show defaults from a constant file.
            // BUT we want them in DB so they can be edited/recurring.

            // So, we will implement a `checkAndSeed` mutation that the client calls on mount if list is empty?
            // Or simpler: The `get` just returns what is there. The Client (Context) decides.
            // However, to make it "prossiga com tudo" and seamless, I'll add a separate mutation `seedDefaults` 
            // and call it from the frontend if needed? 
            // No, that causes waterfall.

            // Correct Approach in Convex:
            // Use a Mutation "ensureDefaults" that checks and writes.
            // We can call this once on "Register". 
            // For existing users, we might need a "lazy" migration.
            // Let's stick with: `get` returns data. `create` adds data.
            // Ideally, existing users from before this update see NO categories. That's bad.

            // I'll create a mutation `initializeCategories` that we can run.
            return allCategories;
        }

        return allCategories;
    },
});

export const initializeDefaults = mutation({
    args: {
        token: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) return;

        // Check if already has categories
        const existing = await ctx.db
            .query("categories")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (existing) return; // Already initialized

        for (const cat of DEFAULT_CATEGORIES) {
            await ctx.db.insert("categories", {
                userId,
                name: cat.name,
                type: cat.type,
                icon: cat.icon,
                color: cat.color,
                isDefault: true
            });
        }
    }
});

export const create = mutation({
    args: {
        token: v.optional(v.string()),
        name: v.string(),
        type: v.string(),
        icon: v.optional(v.string()),
        color: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Unauthorized");

        await ctx.db.insert("categories", {
            userId,
            name: args.name,
            type: args.type,
            icon: args.icon,
            color: args.color,
            isDefault: false,
        });
    },
});

export const remove = mutation({
    args: {
        id: v.id("categories"),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserIdFromToken(ctx, args.token);
        if (!userId) throw new Error("Unauthorized");

        const cat = await ctx.db.get(args.id);
        if (!cat) return;

        if (cat.userId !== userId) throw new Error("Unauthorized");

        // Optional: Prevent deleting defaults
        // if (cat.isDefault) throw new Error("Cannot delete default category");

        await ctx.db.delete(args.id);
    },
});
