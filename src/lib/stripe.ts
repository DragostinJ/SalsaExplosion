import Stripe from "stripe";
import { env } from "@/lib/env";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  typescript: true,
  appInfo: {
    name: "Salsa Explosion Dance Studio",
    version: "1.0.0",
  },
});
