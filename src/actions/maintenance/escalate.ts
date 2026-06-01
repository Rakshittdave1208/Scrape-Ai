"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * PRODUCTION-GRADE MAINTENANCE UTILITY
 * Call this from a hidden admin UI or protected trigger to escalate a user.
 */
export async function escalateToAdmin(targetEmail?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  // In local dev, we assume the person calling this is the maintainer
  // and we escalate THEIR account.
  
  console.log(`🚀 Escalating ${userId} to SUPER_ADMIN...`);

  // 1. Ensure Multi-tenant context exists (Self-healing)
  await prisma.organization.upsert({
    where: { id: "default-org" },
    update: {},
    create: { id: "default-org", name: "Default Organization", slug: "default" }
  });

  await prisma.workspace.upsert({
    where: { id: "default-workspace" },
    update: {},
    create: { id: "default-workspace", name: "Default Workspace", organizationId: "default-org" }
  });

  // 2. Upgrade Membership
  await prisma.membership.upsert({
    where: { userId_organizationId_workspaceId: { userId, organizationId: "default-org", workspaceId: "default-workspace" } },
    update: { role: "SUPER_ADMIN" },
    create: { userId, organizationId: "default-org", workspaceId: "default-workspace", role: "SUPER_ADMIN" }
  });

  // 3. Grant Unlimited Credits
  const HIGH_VALUE = 1000000000;
  await prisma.billingAccount.upsert({
    where: { userId },
    update: {
      workflowCredits: HIGH_VALUE,
      architectureCredits: HIGH_VALUE,
      workflowLimit: 10000,
      planKey: "ENTERPRISE",
      status: "active"
    },
    create: {
      userId,
      workflowCredits: HIGH_VALUE,
      architectureCredits: HIGH_VALUE,
      workflowLimit: 10000,
      planKey: "ENTERPRISE",
      status: "active"
    }
  });

  revalidatePath("/");
  return { success: true, message: "Escalation Complete: You are now SUPER_ADMIN with Unlimited Credits." };
}
