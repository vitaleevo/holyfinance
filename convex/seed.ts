import { mutation } from "./_generated/server";

const seed = mutation({
    args: {},
    handler: async (ctx) => {
        // Seed disabled as it requires userId for the new multi-tenant schema.
        // Please use the Register page to create a user and initial data.
        return "Seed disabled";
    },
});
