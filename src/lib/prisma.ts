import { PrismaClient } from "@prisma/client";
import { withServerlessPoolParams } from "./db-url";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton Prisma Client optimized for Serverless / Supabase Free Tier:
 * Prevents multiple client instances during Next.js hot-reloading and cold starts.
 * For Supabase connection pooler, DATABASE_URL should use transaction mode (port 6543)
 * with ?connection_limit=1&pool_timeout=15 to avoid exhausting the free tier pool.
 */
const configuredDbUrl = withServerlessPoolParams(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(configuredDbUrl
      ? { datasources: { db: { url: configuredDbUrl } } }
      : {}),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
