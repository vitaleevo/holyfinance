import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserIdFromToken } from "./auth";

/**
 * Ensures the user is a Super Admin
 */
async function checkSuperAdmin(ctx: any, token: string | undefined) {
    const userId = await getUserIdFromToken(ctx, token);
    if (!userId) throw new ConvexError("Não autenticado.");

    const user = await ctx.db.get(userId);
    if (!user?.isSuperAdmin) {
        throw new ConvexError("Acesso negado. Apenas o proprietário do sistema pode acessar esta área.");
    }
    return userId;
}

/**
 * List all platform users with metadata
 */
export const listAllUsers = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await checkSuperAdmin(ctx, args.token);

        const users = await ctx.db.query("users").collect();

        // Enhance with more info if needed
        return users.map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            planType: u.planType,
            subscriptionStatus: u.subscriptionStatus,
            createdAt: u.createdAt,
            phone: u.phone,
            isSuperAdmin: u.isSuperAdmin,
        })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
});

/**
 * Get core platform metrics
 */
export const getPlatformStats = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await checkSuperAdmin(ctx, args.token);

        const users = await ctx.db.query("users").collect();
        const transactions = await ctx.db.query("transactions").collect();

        const activeSubscribers = users.filter(u => u.subscriptionStatus === 'active');
        const pendingApprovals = users.filter(u => u.subscriptionStatus === 'pending_verification');

        // Total Estimated Revenue (Simplified)
        let estimatedRevenue = 0;
        // In a real app, we would sum actual payment records. 
        // For now, we estimate based on active plan prices.

        return {
            totalUsers: users.length,
            activeSubscribers: activeSubscribers.length,
            pendingApprovals: pendingApprovals.length,
            totalTransactions: transactions.length,
            revenueEst: 5120000, // Mock for now until we have payment logs
        };
    }
});

/**
 * Manage Packages
 */
export const listPackages = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await checkSuperAdmin(ctx, args.token);
        return await ctx.db.query("packages").collect();
    }
});

export const updatePackage = mutation({
    args: {
        token: v.optional(v.string()),
        packageId: v.id("packages"),
        updates: v.object({
            name: v.optional(v.string()),
            description: v.optional(v.string()),
            priceMonthly: v.optional(v.number()),
            priceYearly: v.optional(v.number()),
            priceBiyearly: v.optional(v.number()),
            isActive: v.optional(v.boolean()),
            highlight: v.optional(v.boolean()),
            limits: v.optional(v.object({
                maxAccounts: v.number(),
                maxFamilyMembers: v.number(),
            })),
            features: v.optional(v.object({
                investments: v.boolean(),
                financialAssistant: v.boolean(),
                advancedReports: v.boolean(),
                csvExport: v.boolean(),
            })),
        })
    },
    handler: async (ctx, args) => {
        await checkSuperAdmin(ctx, args.token);
        await ctx.db.patch(args.packageId, args.updates);
        return { success: true };
    }
});

/**
 * Public: List active packages for the subscription page
 */
export const listActivePackages = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("packages")
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();
    }
});
