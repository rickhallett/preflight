"use node";

import { Buffer } from "node:buffer"; // For Base64 decoding
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Conceptual validator - not used directly in args
const stepDataValidator = v.object({
  prdId: v.string(),
  index: v.number(),
  title: v.string(),
  prompt: v.string(),
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
    v.literal("conditional"),
    // Custom UI component types
    v.literal("range_slider_with_labels"),
    v.literal("visual_selector"),
    v.literal("condensed_checkbox_grid"),
    v.literal("hierarchical_select")
  ),
  options: v.optional(v.array(v.string())),
  sliderOptions: v.optional(v.array(v.string())),
  // Added for custom components
  labels: v.optional(v.array(v.string())),
  images: v.optional(v.array(
    v.object({
      value: v.string(),
      image: v.string(),
      label: v.string()
    })
  )),
  rows: v.optional(v.array(v.string())),
  columns: v.optional(v.array(v.string())),
  hierarchicalOptions: v.optional(v.any()),
});

// Action now takes Base64 encoded JSON string
export const seedSinglePrdAction = internalAction({
  args: { stepDataBase64: v.string() }, // Expect Base64 string arg
  handler: async (ctx, { stepDataBase64 }) => {
    let stepData;
    try {
      const jsonString = Buffer.from(stepDataBase64, 'base64').toString('utf8');
      console.log(`Decoded JSON: ${jsonString}`);
      const parsedArgs = JSON.parse(jsonString);
      if (!parsedArgs || !parsedArgs.stepData) { // Expecting { stepData: { ... } }
        throw new Error("Invalid decoded JSON format: Missing stepData field.");
      }
      stepData = parsedArgs.stepData;
      // TODO: Add validation using stepDataValidator if needed
    } catch (e: any) {
      console.error("Failed to decode/parse stepData from Base64 input:", e);
      throw new Error(`Failed to process Base64 input: ${e.message}`);
    }

    console.log(`Action received data for: ${stepData.prdId}`);
    try {
      await ctx.runMutation(internal.steps.addOrUpdateStep, { stepData: stepData });
      console.log(`Mutation call successful for: ${stepData.prdId}`);
      return { success: true, prdId: stepData.prdId };
    } catch (error: any) {
      console.error(`Error running mutation for step ${stepData.prdId}:`, error);
      throw new Error(`Failed to seed step ${stepData.prdId}: ${error.message}`);
    }
  },
}); 