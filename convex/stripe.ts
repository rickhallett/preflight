import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import Stripe from "stripe";

"use node";

export const createCheckoutSession = action({
  args: {},
  handler: async (ctx): Promise<string | null> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const user = await ctx.runQuery(api.auth.loggedInUser);
    if (!user) throw new Error("User not found");
    if (user.role === "paid") throw new Error("Already paid");

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
      apiVersion: "2025-03-31.basil",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "PreFlight Access",
            },
            unit_amount: 2000, // $20.00
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.PUBLIC_URL}/success`,
      cancel_url: `${process.env.PUBLIC_URL}/cancel`,
      client_reference_id: userId,
    });

    return session.url ?? null;
  },
});

export const handleStripeWebhook = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, { role: "paid" });
  },
});
