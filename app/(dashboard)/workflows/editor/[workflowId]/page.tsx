import Editor from "./_components/Editor";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <div className="flex h-full flex-1 flex-col space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border bg-card p-5 shadow-sm md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{workflow.name}</h1>
            <Badge variant="outline">{workflow.status}</Badge>
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground">
            {workflow.description || "Build your workflow visually by adding nodes, connecting data flow, and saving the graph."}
          </p>
        </div>

        <Button asChild variant="outline" className="w-fit">
          <Link href="/workflows">
            <ArrowLeftIcon size={16} />
            Back to workflows
          </Link>
        </Button>
      </section>

      <div className="flex min-h-0 flex-1">
        <Editor workflow={workflow} />
      </div>
    </div>
  );
}

