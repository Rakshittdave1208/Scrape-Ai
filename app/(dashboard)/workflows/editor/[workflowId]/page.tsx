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
      userId,
    },
    select: {
      id: true,
      userId: true,
      name: true,
      description: true,
      definition: true,
      status: true,
    },
  });

  if (!workflow) {
    return notFound();
  }

  return (
    <div className="flex flex-1 min-h-0">
      <Editor workflow={workflow} />
    </div>
  );
}

