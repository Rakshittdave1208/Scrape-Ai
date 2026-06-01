import Editor from "./_components/Editor";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: { workflowId: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    return <div>unauthenticated</div>;
  }

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: params.workflowId,
      createdById: userId,
    },
    select: {
      id: true,
      createdById: true,
      name: true,
      description: true,
      definition: true,
      status: true,
    },
  });

  if (!workflow) {
    return notFound();
  }

  // SELF-HEALING: Ensure default multi-tenant context exists
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

  // 2. Resolve organization and fetch custom nodes
  const customNodes = await prisma.customNode.findMany({ 
    where: { organizationId: "default-org" } 
  });

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <Editor workflow={workflow} customNodes={customNodes} />
    </div>
  );
}

