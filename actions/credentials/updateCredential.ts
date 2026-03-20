"use server";

import { Prisma } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import {
  updateCredentialSchema,
  type UpdateCredentialSchemaType,
} from "@/schema/credentials";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

function buildCredentialData(input: UpdateCredentialSchemaType) {
  return {
    name: input.name.trim(),
    type: input.type,
    value: null,
    apiKey: input.type === "API_KEY" ? input.apiKey?.trim() || null : null,
    username: input.type === "USERNAME_PASSWORD" ? input.username?.trim() || null : null,
    password: input.type === "USERNAME_PASSWORD" ? input.password || null : null,
    cookieValue: input.type === "COOKIE" ? input.cookieValue?.trim() || null : null,
    customHeaders: input.type === "CUSTOM_HEADER" ? input.customHeaders?.trim() || null : null,
    description: input.description?.trim() || null,
  };
}

export async function updateCredential(input: UpdateCredentialSchemaType) {
  const parsed = updateCredentialSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid credential data");
  }

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthenticated");
  }

  try {
    await prisma.credential.update({
      where: {
        id: parsed.data.id,
        userId,
      },
      data: buildCredentialData(parsed.data),
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("A credential with this name already exists");
    }

    throw new Error("Failed to update credential");
  }

  revalidatePath("/credentials");
  revalidatePath("/");
}
