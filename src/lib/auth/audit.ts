import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

/**
 * PRODUCTION-GRADE AUDIT LOGGER
 * Automatically captures context (IP, User Agent) and records actions.
 */
export async function createAuditLog(input: {
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, any>;
}) {
  const { userId } = await auth();
  if (!userId) return; // Anonymous actions not logged in this layer

  const headerList = headers();
  const ipAddress = headerList.get("x-forwarded-for") || "unknown";
  const userAgent = headerList.get("user-agent") || "unknown";

  // 1. Resolve user's organization and role
  const membership = await prisma.membership.findFirst({
    where: { userId },
    select: { organizationId: true, role: true }
  });

  if (!membership) return;

  // 2. Create the immutable log entry
  return await prisma.auditLog.create({
    data: {
      userId,
      organizationId: membership.organizationId,
      role: membership.role,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      ipAddress,
      userAgent,
    }
  });
}
