"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/auth/audit";

export async function DeleteWorkflow(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("unauthenticated");
  }

  await prisma.workflow.delete({
    where: {
      id,
      createdById: userId,
    },
  });

  // Audit Log
  await createAuditLog({
    action: "workflow.delete",
    resourceType: "Workflow",
    resourceId: id,
  });

  revalidatePath("/workflows");
  redirect("/workflows");
}
