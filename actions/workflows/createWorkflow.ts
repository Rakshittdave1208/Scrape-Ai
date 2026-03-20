
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createWorkflowSchema } from "@/schema/workflow";
import { WorkflowStatus } from "@/types/workflow";
import { TaskType } from "@/types/task";

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

  // Build the initial definition with a LaunchBrowser entry-point node
  // Avoid importing @xyflow/react here (client-only)
  const initialNode = {
    id: crypto.randomUUID(),
    type: "appNode",
    dragHandle: ".drag-handle",
    data: {
      type: TaskType.LAUNCH_BROWSER,
      inputs: {},
    },
    position: { x: 100, y: 100 },
  };

  const initialFlow = {
    nodes: [initialNode],
    edges: [],
    viewport: {
      x: 0,
      y: 0,
      zoom: 1,
    },
  };

  const workflow = await prisma.workflow.create({
    data: {
      userId,
      name: parsed.data.name,
      description: parsed.data.description,
      definition: JSON.stringify(initialFlow),
      status: WorkflowStatus.DRAFT,
    },
  });

  // 🔥 refresh workflows page
  revalidatePath("/workflows");

  redirect(`/workflows/editor/${workflow.id}`);
}
