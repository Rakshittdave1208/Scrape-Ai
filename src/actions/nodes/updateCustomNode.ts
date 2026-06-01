"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { createCustomNodeSchema, CreateCustomNodeSchemaType } from "@/schema/nodes";
import { revalidatePath } from "next/cache";

/**
 * Update an existing custom node
 */
export async function updateCustomNode(id: string, input: CreateCustomNodeSchemaType) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  // Validate Input
  const parsed = createCustomNodeSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid node definition");
  }

  // Ensure user owns the node
  const existingNode = await prisma.customNode.findUnique({
    where: { id, userId }
  });

  if (!existingNode) {
    throw new Error("Node not found or access denied");
  }

  const node = await prisma.customNode.update({
    where: { id },
    data: {
      name: parsed.data.name,
      label: parsed.data.label,
      icon: parsed.data.icon,
      category: parsed.data.category,
      description: parsed.data.description,
      inputs: JSON.stringify(parsed.data.inputs),
      outputs: JSON.stringify(parsed.data.outputs),
      runtime: parsed.data.runtime,
      code: parsed.data.code,
      config: parsed.data.config,
    }
  });

  revalidatePath("/nodes");
  revalidatePath("/workflows");
  return node;
}
