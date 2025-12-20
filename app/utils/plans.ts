export type PlanType = "free" | "basic" | "intermediate" | "advanced";

export const PLAN_LIMITS = {
    free: {
        maxAccounts: 1,
        maxFamilyMembers: 0,
        features: {
            investments: false,
            financialAssistant: false,
            advancedReports: false,
            csvExport: false,
        }
    },
    basic: {
        maxAccounts: 1,
        maxFamilyMembers: 0,
        features: {
            investments: false,
            financialAssistant: false,
            advancedReports: false,
            csvExport: true,
        }
    },
    intermediate: {
        maxAccounts: 5,
        maxFamilyMembers: 3,
        features: {
            investments: true,
            financialAssistant: false,
            advancedReports: true,
            csvExport: true,
        }
    },
    advanced: {
        maxAccounts: 999, // Unlimited
        maxFamilyMembers: 999,
        features: {
            investments: true,
            financialAssistant: true,
            advancedReports: true,
            csvExport: true,
        }
    }
} as const;

export function getPlanLimits(planType?: string) {
    const plan = (planType as PlanType) || "free";
    // Fallback to free if plan type is invalid
    return PLAN_LIMITS[plan] || PLAN_LIMITS["free"];
}

export function checkLimit(
    planType: string | undefined,
    metric: "maxAccounts" | "maxFamilyMembers",
    currentCount: number
): boolean {
    const limits = getPlanLimits(planType);
    const limit = limits[metric];
    return currentCount < limit;
}

export function hasFeature(
    planType: string | undefined,
    feature: keyof typeof PLAN_LIMITS["basic"]["features"]
): boolean {
    const limits = getPlanLimits(planType);
    return limits.features[feature];
}
