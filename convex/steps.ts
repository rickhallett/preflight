import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

const STEPS = [
  {
    index: 0,
    type: "text",
    prompt: "What's your company name?",
  },
  {
    index: 1,
    type: "select",
    prompt: "What industry are you in?",
    options: ["Technology", "Healthcare", "Finance", "Education", "Retail", "Other"],
  },
  {
    index: 2,
    type: "select",
    prompt: "How many employees do you have?",
    options: ["1-10", "11-50", "51-200", "201-1000", "1000+"],
  },
  {
    index: 3,
    type: "multiselect",
    prompt: "What are your main goals? (Select all that apply)",
    options: [
      "Increase Revenue",
      "Reduce Costs",
      "Improve Efficiency",
      "Enter New Markets",
      "Launch New Products",
      "Other",
    ],
  },
  {
    index: 4,
    type: "text",
    prompt: "What are your biggest challenges right now?",
  },
];

export const seedSteps = mutation({
  args: {},
  handler: async (ctx) => {
    console.warn(
      "Existing seedSteps mutation called, but its implementation is commented out."
    );
    console.warn("Use `bunx convex run scripts/seed_steps_from_prds.mjs` instead.");
    // Implementation commented out due to schema changes (prdId required)
    // for (const step of STEPS) {
    //   // @ts-ignore - Ignore implicit any for deprecated seed
    //   await ctx.db.insert("steps", step);
    // }
  },
});

const stepDataValidator = v.object({
  prdId: v.string(),
  index: v.number(),
  title: v.string(),
  prompt: v.string(),
  type: v.string(),
  options: v.optional(v.array(v.string())),
});

export const addOrUpdateStep = internalMutation({
  args: { stepData: stepDataValidator },
  handler: async (ctx, { stepData }) => {
    const existingStep = await ctx.db
      .query("steps")
      .withIndex("by_prdId", (q) => q.eq("prdId", stepData.prdId))
      .unique();

    if (existingStep) {
      await ctx.db.patch(existingStep._id, stepData);
      console.log(`Updated step: ${stepData.prdId}`);
      return existingStep._id;
    } else {
      const newStepId = await ctx.db.insert("steps", stepData);
      console.log(`Inserted new step: ${stepData.prdId}`);
      return newStepId;
    }
  },
});

export const deleteAllSteps = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allSteps = await ctx.db.query("steps").collect();
    let deletedCount = 0;
    for (const step of allSteps) {
      await ctx.db.delete(step._id);
      deletedCount++;
    }
    console.log(`Deleted ${deletedCount} steps.`);
    return { deletedCount };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db
      .query("steps")
      .order("asc")
      .collect();
  },
});
