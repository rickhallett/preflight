import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { api, internal } from "./_generated/api";

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
  returns: v.id("questionnaires"),
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

// Validation helper function
const validateAnswer = async (
  ctx: any,
  stepId: Id<"steps">,
  value: any,
  skipped: boolean
): Promise<{ isValid: boolean, errorMessage?: string }> => {
  // If skipped and allowed to be skipped, no need to validate
  if (skipped) {
    return { isValid: true };
  }

  // Get step to check validation rules
  const step = await ctx.db.get(stepId);
  if (!step) {
    return { isValid: false, errorMessage: "Step not found" };
  }

  // If no validation rules, consider valid
  if (!step.validation) {
    return { isValid: true };
  }

  const validation = step.validation;

  // Check required
  if (validation.required && value === undefined) {
    return {
      isValid: false,
      errorMessage: validation.errorMessage || "This field is required"
    };
  }

  // Type-specific validations
  switch (step.type) {
    case "text":
      // Check min/max length for strings
      if (typeof value === "string") {
        if (validation.minLength !== undefined && value.length < validation.minLength) {
          return {
            isValid: false,
            errorMessage: validation.errorMessage || `Must be at least ${validation.minLength} characters`
          };
        }
        if (validation.maxLength !== undefined && value.length > validation.maxLength) {
          return {
            isValid: false,
            errorMessage: validation.errorMessage || `Must be at most ${validation.maxLength} characters`
          };
        }
        // Check regex pattern
        if (validation.pattern) {
          try {
            const regex = new RegExp(validation.pattern);
            if (!regex.test(value)) {
              return {
                isValid: false,
                errorMessage: validation.errorMessage || "Input does not match the required pattern"
              };
            }
          } catch (error) {
            console.error("Invalid regex pattern:", validation.pattern);
          }
        }
      }
      break;

    case "number":
    case "slider":
      // Check min/max value for numbers
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        if (validation.minValue !== undefined && numValue < validation.minValue) {
          return {
            isValid: false,
            errorMessage: validation.errorMessage || `Must be at least ${validation.minValue}`
          };
        }
        if (validation.maxValue !== undefined && numValue > validation.maxValue) {
          return {
            isValid: false,
            errorMessage: validation.errorMessage || `Must be at most ${validation.maxValue}`
          };
        }
      }
      break;

    case "multiselect":
      // Check min/max selections
      if (Array.isArray(value)) {
        if (validation.minLength !== undefined && value.length < validation.minLength) {
          return {
            isValid: false,
            errorMessage: validation.errorMessage || `Please select at least ${validation.minLength} options`
          };
        }
        if (validation.maxLength !== undefined && value.length > validation.maxLength) {
          return {
            isValid: false,
            errorMessage: validation.errorMessage || `Please select at most ${validation.maxLength} options`
          };
        }
      }
      break;

    // Add validations for other question types as needed
  }

  return { isValid: true };
};

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

    // Check if the questionnaire exists and belongs to the user
    const questionnaire = await ctx.db.get(args.questionnaireId);
    if (!questionnaire) throw new Error("Questionnaire not found");
    if (questionnaire.userId !== userId) throw new Error("Unauthorized");

    // Server-side validation
    const validationResult = await validateAnswer(ctx, args.stepId, args.value, args.skipped);
    if (!validationResult.isValid) {
      throw new Error(validationResult.errorMessage || "Validation failed");
    }

    // Check if an answer already exists
    const existingAnswer = await ctx.db
      .query("answers")
      .withIndex("by_questionnaire_and_step", (q) =>
        q
          .eq("questionnaireId", args.questionnaireId)
          .eq("stepId", args.stepId)
      )
      .unique();

    if (existingAnswer) {
      // Update existing answer
      await ctx.db.patch(existingAnswer._id, {
        value: args.value,
        skipped: args.skipped,
      });
      return existingAnswer._id;
    } else {
      // Create new answer
      return await ctx.db.insert("answers", {
        questionnaireId: args.questionnaireId,
        stepId: args.stepId,
        value: args.value,
        skipped: args.skipped,
      });
    }
  },
});

export const completeQuestionnaire = mutation({
  args: {
    questionnaireId: v.id("questionnaires"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if the questionnaire exists and belongs to the user
    const questionnaire = await ctx.db.get(args.questionnaireId);
    if (!questionnaire) throw new Error("Questionnaire not found");
    if (questionnaire.userId !== userId) throw new Error("Unauthorized");

    // Mark as completed
    await ctx.db.patch(args.questionnaireId, {
      status: "completed",
      completedAt: Date.now(),
    });

    // Schedule reminder after completion
    await ctx.scheduler.runAfter(1000 * 60 * 60 * 24 * 7, internal.reminders.sendFollowUp, {
      questionnaireId: args.questionnaireId,
      userId,
    });

    return questionnaire._id;
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

export const getAnswers = query({
  args: {
    questionnaireId: v.id("questionnaires"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if the questionnaire exists and belongs to the user
    const questionnaire = await ctx.db.get(args.questionnaireId);
    if (!questionnaire) throw new Error("Questionnaire not found");
    if (questionnaire.userId !== userId) throw new Error("Unauthorized");

    // Get all answers for this questionnaire
    const answers = await ctx.db
      .query("answers")
      .withIndex("by_questionnaire", (q) => q.eq("questionnaireId", args.questionnaireId))
      .collect();

    return answers;
  },
});

export const listQuestionnaires = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const questionnaires = await ctx.db
      .query("questionnaires")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return questionnaires;
  },
});
