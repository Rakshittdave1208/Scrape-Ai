"use server";

import { Prisma } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import {
  createCredentialSchema,
  type CreateCredentialSchemaType,
} from "@/schema/credentials";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/auth/audit";

function buildCredentialData(
  input: CreateCredentialSchemaType,
  userId: string,
  organizationId: string,
  workspaceId: string | null
) {
  return {
    organizationId,
    workspaceId,
    createdById: userId,
    name: input.name.trim(),
    type: input.type,
    value: null,
    apiKey: input.type === "API_KEY" ? input.apiKey?.trim() || null : null,
    username:
      input.type === "USERNAME_PASSWORD" ? input.username?.trim() || null : null,
    password:
      input.type === "USERNAME_PASSWORD" ? input.password || null : null,
    cookieValue:
      input.type === "COOKIE" ? input.cookieValue?.trim() || null : null,
    customHeaders:
      input.type === "CUSTOM_HEADER" ? input.customHeaders?.trim() || null : null,
    description: input.description?.trim() || null,
    visibility: "PRIVATE",
  };
}

export async function createCredential(input: CreateCredentialSchemaType) {
  const parsed = createCredentialSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid credential data"
    );
  }

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthenticated");
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

  try {
    const credential = await prisma.credential.create({
      data: buildCredentialData(
        parsed.data,
        userId,
        "default-org",
        "default-workspace"
      ),
    });

    // Audit Log
    await createAuditLog({
      action: "credential.create",
      resourceType: "Credential",
      resourceId: credential.id,
      metadata: { name: credential.name, type: credential.type },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("A credential with this name already exists");
    }

    throw new Error("Failed to create credential");
  }

  revalidatePath("/credentials");
  revalidatePath("/");
}
