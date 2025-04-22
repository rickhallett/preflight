import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

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
    for (const step of STEPS) {
      await ctx.db.insert("steps", step);
    }
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
