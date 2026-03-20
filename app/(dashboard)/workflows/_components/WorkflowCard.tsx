
"use client";

import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  workflowName: string;
  workflowId: string;
}

export default function DeleteWorkflowDialog({
  open,
  setOpen,
  workflowName,
  workflowId,
}: Props) {
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/workflows/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete workflow");
      }
    },

    onError: () => {
      toast.error("Something went wrong", { id: workflowId });
    },

    onSuccess: () => {
      toast.success("Workflow deleted successfully", { id: workflowId });
      setConfirmText("");
      setOpen(false);
      router.refresh();
    },
  });

  const handleDelete = () => {
    toast.loading("Deleting workflow...", { id: workflowId });
    deleteMutation.mutate(workflowId);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>

        <AlertDialogHeader>
          <AlertDialogTitle>Delete Workflow</AlertDialogTitle>

          {/* IMPORTANT: ONLY TEXT HERE */}
          <AlertDialogDescription>
            This action cannot be undone. It will permanently delete the workflow.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* INPUT SECTION OUTSIDE DESCRIPTION */}
        <div className="flex flex-col gap-2 py-4">
          <span>
            Type <b>{workflowName}</b> to confirm deletion.
          </span>

          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Enter workflow name"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction
            disabled={confirmText !== workflowName || deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>

      </AlertDialogContent>
    </AlertDialog>
  );
}

