import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listUserQuestionnaires = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("questionnaires")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const createQuestionnaire = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("questionnaires", {
      userId,
      status: "in_progress",
      startedAt: Date.now(),
    });
  },
});

export const saveAnswer = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const questionnaire = await ctx.db.get(args.questionnaireId);
    if (!questionnaire || questionnaire.userId !== userId) {
      throw new Error("Questionnaire not found");
    }

    await ctx.db.insert("answers", {
      questionnaireId: args.questionnaireId,
      stepId: args.stepId,
      value: args.value,
      skipped: args.skipped,
    });
  },
});

export const completeQuestionnaire = mutation({
  args: {
    questionnaireId: v.id("questionnaires"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const questionnaire = await ctx.db.get(args.questionnaireId);
    if (!questionnaire || questionnaire.userId !== userId) {
      throw new Error("Questionnaire not found");
    }

    await ctx.db.patch(args.questionnaireId, {
      status: "completed",
      completedAt: Date.now(),
    });
  },
});

export const deleteQuestionnaire = mutation({
  args: {
    questionnaireId: v.id("questionnaires"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const questionnaire = await ctx.db.get(args.questionnaireId);
    if (!questionnaire || questionnaire.userId !== userId) {
      throw new Error("Questionnaire not found");
    }

    // Delete all associated answers
    const answers = await ctx.db
      .query("answers")
      .withIndex("by_questionnaire", q => q.eq("questionnaireId", args.questionnaireId))
      .collect();

    for (const answer of answers) {
      await ctx.db.delete(answer._id);
    }

    // Delete the questionnaire
    await ctx.db.delete(args.questionnaireId);
  },
});
