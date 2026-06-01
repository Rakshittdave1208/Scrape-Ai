"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { ensureBillingAccount } from "@/lib/billing/account";
import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { createSampleProductWorkflowDefinition } from "@/lib/workflow/sampleProductWorkflow";
import { createWorkflowSchema } from "@/schema/workflow";
import { WorkflowStatus } from "@/types/workflow";
import { createAuditLog } from "@/lib/auth/audit";

export async function CreateWorkflow(values: {
  name: string;
  description?: string | null;
}) {
  const parsed = createWorkflowSchema.safeParse(values);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid form data");
  }

  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  // SELF-HEALING: Ensure default multi-tenant context exists before creation
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

  await prisma.membership.upsert({
    where: { userId_organizationId_workspaceId: { userId, organizationId: "default-org", workspaceId: "default-workspace" } },
    update: {},
    create: { userId, organizationId: "default-org", workspaceId: "default-workspace", role: "SUPER_ADMIN" }
  });

  const organizationId = "default-org";
  const workspaceId = "default-workspace";

  const billingAccount = await ensureBillingAccount(userId);
  const currentWorkflowCount = await prisma.workflow.count({
    where: { organizationId },
  });

  if (currentWorkflowCount >= billingAccount.workflowLimit) {
    throw new Error(
      `You have reached your workflow limit for the ${billingAccount.planKey} plan`
    );
  }

  let workflow;
  try {
    workflow = await prisma.workflow.create({
      data: {
        organizationId,
        workspaceId,
        userId, // Populate legacy field
        createdById: userId,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        definition: createSampleProductWorkflowDefinition(),
        status: WorkflowStatus.DRAFT,
        visibility: "PRIVATE",
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("A workflow with this name already exists in your workspace.");
    }
    throw new Error("Failed to create workflow. Please try again.");
  }

  revalidatePath("/workflows");

  // 3. Audit Log
  await createAuditLog({
    action: "workflow.create",
    resourceType: "Workflow",
    resourceId: workflow.id,
    metadata: { name: workflow.name },
  });

  return { workflowId: workflow.id };
}
