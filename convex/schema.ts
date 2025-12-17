import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    createdAt: v.string(),
    phone: v.optional(v.string()),
    currency: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.string(),
  }).index("by_token", ["token"]),

  settings: defineTable({
    userId: v.id("users"),
    theme: v.string(),
    emailNotifications: v.boolean(),
    privacyMode: v.boolean(),
  }).index("by_user", ["userId"]),

  accounts: defineTable({
    userId: v.id("users"),
    name: v.string(),
    type: v.string(),
    balance: v.number(),
    bankName: v.string(),
  }).index("by_user", ["userId"]),

  transactions: defineTable({
    userId: v.id("users"),
    description: v.string(),
    amount: v.number(),
    type: v.string(), // "income" | "expense"
    category: v.string(),
    date: v.string(),
    account: v.string(), // Name of account, linked via logic
  }).index("by_user", ["userId"]),

  goals: defineTable({
    userId: v.id("users"),
    title: v.string(),
    targetAmount: v.number(),
    currentAmount: v.number(),
    deadline: v.string(),
    status: v.string(), // "active" | "completed"
  }).index("by_user", ["userId"]),

  budgetLimits: defineTable({
    userId: v.id("users"),
    category: v.string(),
    limit: v.number(),
  }).index("by_user", ["userId"]),

  investments: defineTable({
    userId: v.id("users"),
    ticker: v.string(),
    name: v.string(),
    type: v.string(),
    quantity: v.number(),
    price: v.number(),
  }).index("by_user", ["userId"]),

  debts: defineTable({
    userId: v.id("users"),
    name: v.string(),
    bank: v.string(),
    totalValue: v.number(),
    paidValue: v.number(),
    monthlyParcel: v.number(),
    dueDate: v.string(),
    icon: v.string(),
  }).index("by_user", ["userId"]),

  notifications: defineTable({
    userId: v.id("users"), // Cast as string in code if using v.string() but here strict v.id()
    title: v.string(),
    message: v.string(),
    type: v.string(), // "info" | "success" | "warning" | "error"
    read: v.boolean(),
    createdAt: v.string(),
    isImportant: v.boolean(),
  }).index("by_user", ["userId"]),

  emailSettings: defineTable({
    userId: v.id("users"),
    host: v.string(),
    port: v.number(),
    user: v.string(),
    pass: v.string(), // In production, encrypt this!
    fromEmail: v.string(),
    secure: v.boolean(),
  }).index("by_user", ["userId"]),
});
