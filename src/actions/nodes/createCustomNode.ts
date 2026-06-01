"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { createCustomNodeSchema, CreateCustomNodeSchemaType } from "@/schema/nodes";
import { revalidatePath } from "next/cache";

/**
 * PRODUCTION PIPELINE: Custom Node Registration
 */
export async function createCustomNode(input: CreateCustomNodeSchemaType) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  // Validate Input
  const parsed = createCustomNodeSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid node definition");
  }

  const { organizationId } = await prisma.membership.findFirstOrThrow({
    where: { userId },
    select: { organizationId: true }
  });

  const node = await prisma.customNode.create({
    data: {
      userId,
      organizationId,
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

  revalidatePath("/workflows");
  return node;
}
