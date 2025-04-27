import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  questionnaires: defineTable({
    userId: v.string(),
    status: v.string(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),
  steps: defineTable({
    index: v.number(),
    prdId: v.string(),
    type: v.union(
      v.literal("text"),
      v.literal("select"),
      v.literal("multiselect"),
      v.literal("radio"),
      v.literal("slider"),
      v.literal("number"),
      v.literal("multiselect_with_slider")
    ),
    prompt: v.string(),
    title: v.optional(v.string()),
    options: v.optional(v.array(v.string())),
    sliderOptions: v.optional(v.array(v.string())),
  })
    .index("by_index", ["index"])
    .index("by_prdId", ["prdId"]),
  answers: defineTable({
    questionnaireId: v.id("questionnaires"),
    stepId: v.id("steps"),
    value: v.union(
      v.string(),
      v.array(v.string()),
      v.number(),
      v.object({
        dataTypes: v.array(v.string()),
        completeness: v.number(),
      })
    ),
    skipped: v.boolean(),
  })
    .index("by_questionnaire", ["questionnaireId"])
    .index("by_questionnaire_and_step", ["questionnaireId", "stepId"]),
  users: defineTable({
    tokenIdentifier: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
