import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/lib/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
  // Keep compatibility with existing SQLite DateTime values created before the adapter switch.
  timestampFormat: "unixepoch-ms",
});

function createPrismaClient() {
  return new PrismaClient({
    adapter,
  });
}

function hasExpectedBillingModels(
  client: PrismaClient | undefined
): client is PrismaClient {
  return Boolean(
    client &&
      "billingAccount" in client &&
      "billingEvent" in client
  );
}

const prismaClient: PrismaClient =
  process.env.NODE_ENV === "production"
    ? createPrismaClient()
    : hasExpectedBillingModels(globalForPrisma.prisma)
      ? globalForPrisma.prisma
      : createPrismaClient();

export const prisma = prismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
