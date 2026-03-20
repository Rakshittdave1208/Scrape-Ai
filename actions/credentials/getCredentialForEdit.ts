"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getCredentialForEdit(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthenticated");
  }

  const credential = await prisma.credential.findFirst({
    where: {
      id,
      userId,
    },
    select: {
      id: true,
      name: true,
      type: true,
      description: true,
      apiKey: true,
      username: true,
      password: true,
      cookieValue: true,
      customHeaders: true,
    },
  });

  if (!credential) {
    throw new Error("Credential not found");
  }

  return credential;
}
