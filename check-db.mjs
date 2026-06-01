import { PrismaClient } from "./src/lib/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  console.log("📊 Fetching all Workflows from Database...");

  try {
    const workflows = await prisma.workflow.findMany({
        select: {
            id: true,
            name: true,
            userId: true,
            createdById: true,
            organizationId: true,
            workspaceId: true,
            createdAt: true
        }
    });

    if (workflows.length === 0) {
        console.log("📭 Database is EMPTY. No workflows found.");
    } else {
        console.table(workflows);
    }

  } catch (e) {
    console.error("❌ Database query failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
