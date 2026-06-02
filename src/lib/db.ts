/**
 * Prisma client singleton for Next.js.
 *
 * In development Next.js clears the Node.js module cache on every HMR reload,
 * which would create a new PrismaClient on each request. We store the instance
 * on `globalThis` to avoid exhausting database connections.
 *
 * @see https://www.prisma.io/docs/orm/more/help-and-troubleshooting/nextjs-help
 */
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
