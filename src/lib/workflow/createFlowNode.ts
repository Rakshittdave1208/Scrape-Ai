import { AppNode } from "@/types/appNode";
import { TaskType, WorkflowTask } from "@/types/task";
import { TaskRegistry } from "./task/registry";

export function createFlowNode(
  nodeType: TaskType | string,
  position?: { x: number; y: number },
  taskDefinition?: WorkflowTask // Optional task definition to support custom nodes
): AppNode {
  const task = taskDefinition || (TaskRegistry as any)[nodeType];

  return {
    id: crypto.randomUUID(),
    type: task.nodeType,
    dragHandle: ".drag-handle",
    data: {
      type: nodeType as TaskType,
      label: task.label,
      inputs: {},
      outputs: task.outputs,
      config: {},
      cost: task.credits,
      status: "idle",
      error: null,
    },
    position: position ?? { x: 0, y: 0 },
  };
}
