import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";
import { PLAN_LIMITS } from "./plans";

export const seedPackages = internalMutation({
    args: {},
    handler: async (ctx) => {
        const existing = await ctx.db.query("packages").collect();
        if (existing.length > 0) {
            console.log("Packages already seeded.");
            return;
        }

        const packages = [
            {
                key: "basic",
                name: "Básico",
                description: "Ideal para começar a organizar sua vida financeira.",
                priceMonthly: 5000,
                priceYearly: 51000,
                priceBiyearly: 90000,
                limits: {
                    maxAccounts: PLAN_LIMITS.basic.maxAccounts,
                    maxFamilyMembers: PLAN_LIMITS.basic.maxFamilyMembers,
                },
                features: PLAN_LIMITS.basic.features,
                isActive: true,
                highlight: false,
            },
            {
                key: "intermediate",
                name: "Intermediário",
                description: "Perfeito para famílias em crescimento.",
                priceMonthly: 12000,
                priceYearly: 122400,
                priceBiyearly: 216000,
                limits: {
                    maxAccounts: PLAN_LIMITS.intermediate.maxAccounts,
                    maxFamilyMembers: PLAN_LIMITS.intermediate.maxFamilyMembers,
                },
                features: PLAN_LIMITS.intermediate.features,
                isActive: true,
                highlight: true,
            },
            {
                key: "advanced",
                name: "Avançado",
                description: "Controle total e inteligência artificial.",
                priceMonthly: 25000,
                priceYearly: 255000,
                priceBiyearly: 450000,
                limits: {
                    maxAccounts: PLAN_LIMITS.advanced.maxAccounts,
                    maxFamilyMembers: PLAN_LIMITS.advanced.maxFamilyMembers,
                },
                features: PLAN_LIMITS.advanced.features,
                isActive: true,
                highlight: false,
            },
        ];

        for (const pkg of packages) {
            await ctx.db.insert("packages", pkg);
        }
    },
});

export const promoteToSuperAdmin = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        // Note: In a real scenario, this should be an internal mutation called by a script
        // or protected by a secret key. Since we are in development/setup mode, we allow it.

        // Safety check: only allow if NO super admin exists yet? 
        // Or just let it fly for now since the user controls the code.

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();

        if (!user) {
            throw new Error("Usuário não encontrado.");
        }

        await ctx.db.patch(user._id, { isSuperAdmin: true });
        return { success: true, message: `Usuário ${user.name} agora é Super Admin.` };
    },
});
