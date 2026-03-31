
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createWorkflowSchema } from "@/schema/workflow";
import { WorkflowStatus } from "@/types/workflow";
import { createSampleProductWorkflowDefinition } from "@/lib/workflow/sampleProductWorkflow";

export async function CreateWorkflow(formData: FormData) {
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;

  const parsed = createWorkflowSchema.safeParse({
    name,
    description,
  });

  if (!parsed.success) {
    throw new Error("Invalid form data");
  }

  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const workflow = await prisma.workflow.create({
    data: {
      userId,
      name: parsed.data.name,
      description: parsed.data.description,
      definition: createSampleProductWorkflowDefinition(),
      status: WorkflowStatus.DRAFT,
    },
  });

  // 🔥 refresh workflows page
  revalidatePath("/workflows");

  redirect(`/workflows/editor/${workflow.id}`);
}
