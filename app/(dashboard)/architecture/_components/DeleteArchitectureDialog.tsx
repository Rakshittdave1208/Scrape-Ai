"use client";

import { useState } from "react";
import { toast } from "sonner";

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
import { deleteArchitectureProject } from "@/lib/architecture/projects";

type DeleteArchitectureDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  architectureId: string;
  architectureName: string;
  onDeleted: () => void;
};

export default function DeleteArchitectureDialog({
  open,
  setOpen,
  architectureId,
  architectureName,
  onDeleted,
}: DeleteArchitectureDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsDeleting(true);
    toast.loading("Deleting architecture...", { id: architectureId });

    try {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 350);
      });

      deleteArchitectureProject(architectureId);
      toast.success("Architecture deleted successfully", { id: architectureId });
      setConfirmText("");
      setOpen(false);
      onDeleted();
    } catch {
      toast.error("Failed to delete architecture", { id: architectureId });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setConfirmText("");
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete architecture?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the architecture project.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-2 py-4">
          <p>
            Type <b>{architectureName}</b> to confirm deletion.
          </p>

          <Input
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder="Enter architecture name"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={confirmText !== architectureName || isDeleting}
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
