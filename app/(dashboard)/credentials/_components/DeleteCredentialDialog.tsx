"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteCredential } from "@/actions/credentials/deleteCredential";
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

export default function DeleteCredentialDialog({
  open,
  setOpen,
  credentialId,
  credentialName,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  credentialId: string;
  credentialName: string;
}) {
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete credential?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the stored credential from your workspace.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-2 py-4">
          <p>
            Type <b>{credentialName}</b> to confirm:
          </p>
          <Input
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder="Enter credential name"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={confirmText !== credentialName || isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(event) => {
              event.preventDefault();
              startTransition(async () => {
                try {
                  await deleteCredential(credentialId);
                  toast.success("Credential deleted", { id: credentialId });
                  setConfirmText("");
                  setOpen(false);
                  router.refresh();
                } catch (error) {
                  toast.error("Failed to delete credential", { id: credentialId });
                }
              });
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
