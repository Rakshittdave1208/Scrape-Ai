"use client";

import { createContext, useContext, useMemo, useState } from "react";

import type { ArchitectureProject } from "@/lib/architecture/projects";
import DeleteArchitectureDialog from "./DeleteArchitectureDialog";

type ArchitectureDeleteContextValue = {
  deleteTarget: ArchitectureProject | null;
  requestDelete: (project: ArchitectureProject) => void;
  closeDeleteDialog: () => void;
};

const ArchitectureDeleteContext = createContext<ArchitectureDeleteContextValue | null>(null);

export function ArchitectureDeleteProvider({
  children,
  onDeleted,
}: {
  children: React.ReactNode;
  onDeleted?: () => void;
}) {
  const [deleteTarget, setDeleteTarget] = useState<ArchitectureProject | null>(null);

  const closeDeleteDialog = () => setDeleteTarget(null);

  const value = useMemo<ArchitectureDeleteContextValue>(
    () => ({
      deleteTarget,
      requestDelete: (project) => setDeleteTarget(project),
      closeDeleteDialog,
    }),
    [deleteTarget]
  );

  return (
    <ArchitectureDeleteContext.Provider value={value}>
      {children}
      <DeleteArchitectureDialog
        open={Boolean(deleteTarget)}
        setOpen={(nextOpen) => {
          if (!nextOpen) {
            closeDeleteDialog();
          }
        }}
        architectureId={deleteTarget?.id ?? ""}
        architectureName={deleteTarget?.name ?? ""}
        onDeleted={() => {
          closeDeleteDialog();
          onDeleted?.();
        }}
      />
    </ArchitectureDeleteContext.Provider>
  );
}

export function useArchitectureDelete() {
  const context = useContext(ArchitectureDeleteContext);

  if (!context) {
    throw new Error("useArchitectureDelete must be used within ArchitectureDeleteProvider");
  }

  return context;
}
