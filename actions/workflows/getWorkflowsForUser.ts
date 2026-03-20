
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GetWorkflowsForUser() {
  // ✔ Authentication
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthenticated");
  }

  // ✔ Fetch workflows for this user
  try {
    const workflows = await prisma.workflow.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return workflows;
  } catch (error) {
    
    throw new Error("Failed to fetch workflows");
  }
}
