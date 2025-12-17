import { mutation } from "./_generated/server";

export const clearAll = mutation({
    args: {},
    handler: async (ctx) => {
        const tables = [
            "users",
            "sessions",
            "settings",
            "accounts",
            "transactions",
            "goals",
            "budgetLimits",
            "investments",
            "debts",
            "notifications",
        ];

        for (const table of tables) {
            const docs = await ctx.db.query(table as any).collect();
            for (const doc of docs) {
                await ctx.db.delete(doc._id);
            }
        }
    },
});
