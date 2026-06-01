"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  ArchitectureProject,
  readArchitectureProjects,
} from "@/lib/architecture/projects";
import {
  ArchitectureDeleteProvider,
  useArchitectureDelete,
} from "./ArchitectureDeleteContext";
import CreateArchitectureDialog from "./CreateArchitectureDialog";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function ArchitectureProjectsPage() {
  return <ArchitectureProjectsContent />;
}

function ArchitectureProjectsContent() {
  const [projects, setProjects] = useState<ArchitectureProject[]>([]);

  const refreshProjects = useCallback(() => {
    setProjects(readArchitectureProjects());
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  return (
    <ArchitectureDeleteProvider onDeleted={refreshProjects}>
      <div className="space-y-6">
        <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Architecture</h1>
            <p className="max-w-3xl text-muted-foreground">
              Create, open, and manage your architecture designs.
            </p>
          </div>

          <CreateArchitectureDialog triggerText="Create architecture" />
        </section>

        <section className="space-y-4">
          {projects.length === 0 ? (
            <div className="rounded-none border border-dashed bg-card/80 px-5 py-10 text-center shadow-sm backdrop-blur">
              <p className="text-lg font-semibold text-foreground">No architecture projects yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first architecture to start designing cloud and backend systems.
              </p>
              <CreateArchitectureDialog triggerText="Create architecture" triggerClassName="mt-4" />
            </div>
          ) : (
            projects.map((project) => (
              <ArchitectureProjectRow
                key={project.id}
                project={project}
              />
            ))
          )}
        </section>
      </div>
    </ArchitectureDeleteProvider>
  );
}

function ArchitectureProjectRow({
  project,
}: {
  project: ArchitectureProject;
}) {
  const { requestDelete } = useArchitectureDelete();

  return (
    <div className="flex items-center justify-between gap-4 rounded-none border bg-card/80 p-4 shadow-sm backdrop-blur transition hover:shadow-md dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="min-w-0 space-y-1">
        <p className="truncate text-xl font-semibold text-foreground">{project.name}</p>
        <p className="truncate text-sm text-muted-foreground">{project.description}</p>
        <p className="text-xs text-muted-foreground">Updated {formatDate(project.updatedAt)}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button asChild type="button" variant="outline">
          <Link href={`/architecture/editor/${project.id}`}>Edit</Link>
        </Button>
        <Button type="button" variant="destructive" onClick={() => requestDelete(project)}>
          Delete
        </Button>
      </div>
    </div>
  );
}
