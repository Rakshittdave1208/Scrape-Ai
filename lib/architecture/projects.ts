import { createDefaultArchitectureGraph } from "@/lib/defaultArchitecture";

export type ArchitectureProject = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export const ARCHITECTURE_PROJECTS_STORAGE_KEY = "architecture-projects";

export function getArchitectureStorageKey(architectureId: string) {
  return `architecture-canvas-state:${architectureId}`;
}

export function readArchitectureProjects() {
  if (typeof window === "undefined") {
    return [] as ArchitectureProject[];
  }

  const stored = window.localStorage.getItem(ARCHITECTURE_PROJECTS_STORAGE_KEY);

  if (!stored) {
    return [] as ArchitectureProject[];
  }

  try {
    const parsed = JSON.parse(stored) as ArchitectureProject[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as ArchitectureProject[];
  }
}

export function writeArchitectureProjects(projects: ArchitectureProject[]) {
  window.localStorage.setItem(ARCHITECTURE_PROJECTS_STORAGE_KEY, JSON.stringify(projects));
}

export function createArchitectureProject(overrides?: Partial<Pick<ArchitectureProject, "name" | "description">>) {
  const timestamp = new Date().toISOString();
  const existing = readArchitectureProjects();
  const nextIndex = existing.length + 1;

  const project: ArchitectureProject = {
    id: crypto.randomUUID(),
    name: overrides?.name?.trim() || `Architecture ${nextIndex}`,
    description: overrides?.description?.trim() || "Custom backend system design",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  writeArchitectureProjects([project, ...existing]);
  window.localStorage.setItem(
    getArchitectureStorageKey(project.id),
    JSON.stringify(createDefaultArchitectureGraph())
  );

  return project;
}

export function deleteArchitectureProject(projectId: string) {
  const remainingProjects = readArchitectureProjects().filter((project) => project.id !== projectId);
  writeArchitectureProjects(remainingProjects);
  window.localStorage.removeItem(getArchitectureStorageKey(projectId));
}

export function touchArchitectureProject(projectId: string) {
  const nextProjects = readArchitectureProjects().map((project) =>
    project.id === projectId
      ? {
          ...project,
          updatedAt: new Date().toISOString(),
        }
      : project
  );

  writeArchitectureProjects(nextProjects);
}
