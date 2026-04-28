"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { ensureBillingAccount } from "@/lib/billing/account";
import prisma from "@/lib/prisma";
import { createSampleProductWorkflowDefinition } from "@/lib/workflow/sampleProductWorkflow";
import { createWorkflowSchema } from "@/schema/workflow";
import { WorkflowStatus } from "@/types/workflow";

export async function CreateWorkflow(values: {
  name: string;
  description?: string | null;
}) {
  const parsed = createWorkflowSchema.safeParse(values);

  if (!parsed.success) {
    throw new Error("Invalid form data");
  }

  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const billingAccount = await ensureBillingAccount(userId);
  const currentWorkflowCount = await prisma.workflow.count({
    where: { userId },
  });

  if (currentWorkflowCount >= billingAccount.workflowLimit) {
    throw new Error(
      `You have reached your workflow limit for the ${billingAccount.planKey} plan`
    );
  }

  const workflow = await prisma.workflow.create({
    data: {
      userId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      definition: createSampleProductWorkflowDefinition(),
      status: WorkflowStatus.DRAFT,
    },
  });

  revalidatePath("/workflows");

  return { workflowId: workflow.id };
}
