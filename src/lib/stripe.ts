import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_for_build";

export const stripe = new Stripe(stripeSecretKey, {
  typescript: true,
  appInfo: {
    name: "Salsa Explosion Dance Studio",
    version: "1.0.0",
  },
});
