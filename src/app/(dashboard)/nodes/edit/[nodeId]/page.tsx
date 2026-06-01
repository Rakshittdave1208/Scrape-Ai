import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { CustomDialogHeader } from "@/components/uiii/CustomDialogHeader";
import { PencilIcon, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import EditNodeFormWrapper from "./_components/EditNodeFormWrapper";

export default async function EditNodePage({ params }: { params: { nodeId: string } }) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const node = await prisma.customNode.findUnique({
    where: {
      id: params.nodeId,
      userId,
    },
  });

  if (!node) {
    return notFound();
  }

  return (
    <div className="flex-1 flex flex-col h-full space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-none border">
          <Link href="/nodes">
            <ArrowLeftIcon size={18} />
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-display">Edit Custom Node</h1>
          <p className="text-muted-foreground">
            Modify the configuration and behavior of your personal node.
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-none overflow-hidden shadow-xl max-w-4xl mx-auto w-full">
        <CustomDialogHeader
          icon={<PencilIcon className="text-primary" />}
          title={`Editing: ${node.label}`}
          subTitle="Update schema and execution logic."
        />
        <div className="p-8">
          <EditNodeFormWrapper node={node} />
        </div>
      </div>
    </div>
  );
}
