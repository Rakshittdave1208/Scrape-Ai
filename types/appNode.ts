import { Node } from "@xyflow/react";

import { TaskParam, TaskType } from "./task";

export type NodeExecutionStatus = "idle" | "running" | "success" | "error";

export interface AppNodeData {
  type: TaskType;
  label: string;
  inputs: Record<string, string>;
  outputs: TaskParam[];
  config?: Record<string, unknown>;
  cost: number;
  status: NodeExecutionStatus;
  error?: string | null;
}

export type AppNode = Node<AppNodeData>;
