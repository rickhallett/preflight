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
      v.literal("multiselect_with_slider"),
      v.literal("dual_slider"),
      v.literal("matrix"),
      v.literal("ranked_choice"),
      v.literal("conditional")
    ),
    prompt: v.string(),
    title: v.optional(v.string()),
    options: v.optional(v.array(v.string())),
    sliderOptions: v.optional(v.array(v.string())),
    components: v.optional(v.array(
      v.object({
        id: v.string(),
        type: v.string(),
        label: v.string(),
        options: v.optional(v.array(v.string())),
        sliderOptions: v.optional(v.array(v.string())),
        required: v.optional(v.boolean()),
        condition: v.optional(v.any()),
        valueFormat: v.optional(v.any())
      })
    )),
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
      }),
      v.object({
        min: v.number(),
        max: v.number(),
      }),
      v.record(v.string(), v.any())
    ),
    skipped: v.boolean(),
  })
    .index("by_questionnaire", ["questionnaireId"])
    .index("by_questionnaire_and_step", ["questionnaireId", "stepId"]),
  users: defineTable({
    tokenIdentifier: v.optional(v.string()),
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
