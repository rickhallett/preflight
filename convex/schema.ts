import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  questionnaires: defineTable({
    userId: v.id("users"),
    status: v.string(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),
  steps: defineTable({
    index: v.number(),
    type: v.string(),
    prompt: v.string(),
    options: v.optional(v.array(v.string())),
  }),
  answers: defineTable({
    questionnaireId: v.id("questionnaires"),
    stepId: v.id("steps"),
    value: v.union(v.string(), v.array(v.string())),
    skipped: v.boolean(),
  }).index("by_questionnaire", ["questionnaireId"]),
  users: defineTable({
    email: v.optional(v.string()),
    role: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
  }).index("by_email", ["email"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
