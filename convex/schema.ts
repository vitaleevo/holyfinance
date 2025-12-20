import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  families: defineTable({
    name: v.string(),
    code: v.string(), // Invite code e.g. "SILVA-9921"
    createdAt: v.string(),
  }).index("by_code", ["code"]),

  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    createdAt: v.string(),
    phone: v.optional(v.string()),
    currency: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
    familyId: v.optional(v.id("families")), // Link to family
    role: v.optional(v.string()), // "admin" | "partner" | "member"
    familyRelationship: v.optional(v.string()), // "Pai", "Mãe", "Filho", "Primo", etc.
    subscriptionStatus: v.optional(v.union(
      v.literal("trialing"),
      v.literal("active"),
      v.literal("canceled"),
      v.literal("expired"),
      v.literal("pending_verification")
    )),
    trialEndsAt: v.optional(v.string()),
    planType: v.optional(v.union(v.literal("free"), v.literal("basic"), v.literal("intermediate"), v.literal("advanced"))),
    billingCycle: v.optional(v.union(v.literal("monthly"), v.literal("yearly"), v.literal("biyearly"))),
    paymentMethod: v.optional(v.union(v.literal("mcx"), v.literal("stripe"))),
    paymentPhone: v.optional(v.string()),
    deletionScheduledAt: v.optional(v.string()), // Timestamp for account deletion
    isSuperAdmin: v.optional(v.boolean()), // System Administrator
  })
    .index("by_email", ["email"])
    .index("by_family", ["familyId"])
    .index("by_deletion", ["deletionScheduledAt"]),

  packages: defineTable({
    key: v.string(), // "basic", "intermediate", "advanced"
    name: v.string(), // "Básico", "Intermediário"
    description: v.string(),
    priceMonthly: v.number(), // In AOA
    priceYearly: v.number(),
    priceBiyearly: v.optional(v.number()),
    limits: v.object({
      maxAccounts: v.number(),
      maxFamilyMembers: v.number(),
    }),
    features: v.object({
      investments: v.boolean(),
      financialAssistant: v.boolean(),
      advancedReports: v.boolean(),
      csvExport: v.boolean(),
    }),
    isActive: v.boolean(),
    highlight: v.optional(v.boolean()), // "Most Popular"
  }).index("by_key", ["key"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.string(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),

  settings: defineTable({
    userId: v.id("users"),
    theme: v.string(),
    emailNotifications: v.boolean(),
    privacyMode: v.boolean(),
  }).index("by_user", ["userId"]),

  accounts: defineTable({
    userId: v.id("users"), // Author
    familyId: v.optional(v.id("families")), // Owner entity
    name: v.string(),
    type: v.string(),
    balance: v.number(),
    bankName: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_family", ["familyId"]),

  transactions: defineTable({
    userId: v.id("users"), // Author
    familyId: v.optional(v.id("families")), // Owner entity
    description: v.string(),
    amount: v.number(),
    type: v.string(), // "income" | "expense"
    category: v.string(),
    date: v.string(),
    account: v.string(), // Name of account, linked via logic
    status: v.optional(v.union(v.literal("paid"), v.literal("pending"), v.literal("completed"))),
  })
    .index("by_user", ["userId"])
    .index("by_family", ["familyId"]),

  goals: defineTable({
    userId: v.id("users"),
    familyId: v.optional(v.id("families")),
    title: v.string(),
    targetAmount: v.number(),
    currentAmount: v.number(),
    deadline: v.string(),
    status: v.string(), // "active" | "completed"
    category: v.string(),
    icon: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_family", ["familyId"]),

  budgetLimits: defineTable({
    userId: v.id("users"),
    familyId: v.optional(v.id("families")),
    category: v.string(),
    limit: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_family", ["familyId"]),

  investments: defineTable({
    userId: v.id("users"),
    familyId: v.optional(v.id("families")),
    ticker: v.string(),
    name: v.string(),
    type: v.string(),
    quantity: v.number(),
    price: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_family", ["familyId"]),

  debts: defineTable({
    userId: v.id("users"),
    familyId: v.optional(v.id("families")),
    name: v.string(),
    bank: v.string(),
    totalValue: v.number(),
    paidValue: v.number(),
    monthlyParcel: v.number(),
    dueDate: v.string(),
    icon: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_family", ["familyId"]),

  notifications: defineTable({
    userId: v.id("users"),
    familyId: v.optional(v.id("families")),
    title: v.string(),
    message: v.string(),
    type: v.string(), // "info" | "success" | "warning" | "error"
    read: v.boolean(),
    createdAt: v.string(),
    isImportant: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_family", ["familyId"]),

  emailSettings: defineTable({
    userId: v.id("users"),
    host: v.string(),
    port: v.number(),
    user: v.string(),
    pass: v.string(), // In production, encrypt this!
    fromEmail: v.string(),
    secure: v.boolean(),
  }).index("by_user", ["userId"]),

  categories: defineTable({
    userId: v.id("users"),
    familyId: v.optional(v.id("families")),
    name: v.string(),
    type: v.string(), // "income" | "expense"
    icon: v.optional(v.string()), // Material ID
    color: v.optional(v.string()), // Hex
    isDefault: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_family", ["familyId"]),
});
