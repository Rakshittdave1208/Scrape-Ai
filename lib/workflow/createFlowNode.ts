import { AppNode } from "@/types/appNode";
import { TaskType } from "@/types/task";
import { TaskRegistry } from "./task/registry";

export function createFlowNode(
  nodeType: TaskType,
  position?: { x: number; y: number }
): AppNode {
  const task = TaskRegistry[nodeType];

  return {
    id: crypto.randomUUID(),
    type: task.nodeType,
    dragHandle: ".drag-handle",
    data: {
      type: nodeType,
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
