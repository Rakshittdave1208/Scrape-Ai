"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import DeleteWorkflowDialog from "./WorkflowCard";

interface Props {
  id: string;
  name: string;
  description?: string | null;
}

export default function WorkflowRow({ id, name, description }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between border rounded-lg p-4 bg-card">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/workflows/editor/${id}`}
            className="font-semibold hover:underline"
          >
            {name}
          </Link>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href={`/workflows/editor/${id}`}>Edit</Link>
        </Button>
        <Button
          variant="destructive"
          onClick={() => setOpen(true)}
        >
          Delete
        </Button>

        <DeleteWorkflowDialog
          open={open}
          setOpen={setOpen}
          workflowName={name}
          workflowId={id}
        />
      </div>
    </div>
  );
}

