"use client";

import React, { createContext, useContext, useMemo } from "react";
import { TaskRegistry, getTaskRegistry } from "@/lib/workflow/task/registry";
import { CustomNode } from "@/lib/generated/prisma";
import { WorkflowTask } from "@/types/task";

type Registry = Record<string, WorkflowTask>;

const TaskRegistryContext = createContext<Registry | null>(null);

export function TaskRegistryProvider({
  children,
  customNodes = [],
}: {
  children: React.ReactNode;
  customNodes?: CustomNode[];
}) {
  const registry = useMemo(() => getTaskRegistry(customNodes), [customNodes]);

  return (
    <TaskRegistryContext.Provider value={registry}>
      {children}
    </TaskRegistryContext.Provider>
  );
}

export function useTaskRegistry() {
  const context = useContext(TaskRegistryContext);
  // Fallback to static registry if provider is not found (e.g. in some isolated tests or components)
  return context || TaskRegistry;
}
