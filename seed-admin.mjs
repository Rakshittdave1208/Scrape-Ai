import { PrismaClient } from "./src/lib/generated/prisma/index.js";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Scanning for most active User ID...");

  try {
    // We look at Workflows to find the current user's ID
    const workflow = await prisma.workflow.findFirst({
        orderBy: { createdAt: 'desc' }
    });

    if (!workflow) {
        console.log("❌ No workflows found. Please create one workflow in the UI first so I can find your ID.");
        return;
    }

    const userId = workflow.createdById;
    console.log(`✅ Identified User ID: ${userId}`);
    console.log(`🚀 Escalating ${userId} to SUPER_ADMIN with UNLIMITED credits...`);

    // 1. Upgrade Role in Membership
    await prisma.membership.upsert({
        where: { userId_organizationId_workspaceId: { userId, organizationId: "default-org", workspaceId: "default-workspace" } },
        update: { role: "SUPER_ADMIN" },
        create: { userId, organizationId: "default-org", workspaceId: "default-workspace", role: "SUPER_ADMIN" }
    });

    // 2. Grant Unlimited Credits (BillingAccount)
    const HIGH_VALUE = 1000000000; // 1 Billion credits
    await prisma.billingAccount.upsert({
        where: { userId },
        update: {
            workflowCredits: HIGH_VALUE,
            architectureCredits: HIGH_VALUE,
            workflowLimit: HIGH_VALUE,
            planKey: "ENTERPRISE",
            status: "active"
        },
        create: {
            userId,
            workflowCredits: HIGH_VALUE,
            architectureCredits: HIGH_VALUE,
            workflowLimit: HIGH_VALUE,
            planKey: "ENTERPRISE",
            status: "active"
        }
    });

    console.log("🎉 SUCCESS! You now have:");
    console.log("   - Role: SUPER_ADMIN");
    console.log("   - Credits: UNLIMITED (1 Billion)");
    console.log("   - Workflow Limit: UNLIMITED");
    console.log("   - Status: ENTERPRISE");

  } catch (e) {
    console.error("❌ Admin escalation failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
