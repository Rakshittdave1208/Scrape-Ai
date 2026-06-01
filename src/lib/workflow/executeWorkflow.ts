import type { Edge } from "@xyflow/react";

import { TaskRegistry } from "@/lib/workflow/task/registry";
import type { AppNode } from "@/types/appNode";
import { TaskType } from "@/types/task";

export type WorkflowExecutionResult = {
  logs: string[];
  outputsByNode: Record<string, Record<string, unknown>>;
  errorsByNode: Record<string, string>;
  order: string[];
  creditsUsed: number;
  globalError: string | null;
};

function sortNodesTopologically(nodes: AppNode[], edges: Edge[]) {
  const indegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  nodes.forEach((node) => {
    indegree.set(node.id, 0);
    adjacency.set(node.id, []);
  });

  edges.forEach((edge) => {
    adjacency.get(edge.source)?.push(edge.target);
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
  });

  const queue = nodes.filter((node) => (indegree.get(node.id) ?? 0) === 0).map((node) => node.id);
  const orderedIds: string[] = [];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    orderedIds.push(currentId);

    for (const nextId of adjacency.get(currentId) ?? []) {
      const nextDegree = (indegree.get(nextId) ?? 0) - 1;
      indegree.set(nextId, nextDegree);
      if (nextDegree === 0) {
        queue.push(nextId);
      }
    }
  }

  if (orderedIds.length !== nodes.length) {
    return {
      order: nodes.map((node) => node.id),
      hasCycle: true,
    };
  }

  return {
    order: orderedIds,
    hasCycle: false,
  };
}

function buildInputMap(node: AppNode, edges: Edge[], outputsByNode: WorkflowExecutionResult["outputsByNode"]) {
  const inputs: Record<string, unknown> = { ...node.data.inputs };

  edges
    .filter((edge) => edge.target === node.id && edge.sourceHandle && edge.targetHandle)
    .forEach((edge) => {
      inputs[edge.targetHandle!] = outputsByNode[edge.source]?.[edge.sourceHandle!] ?? null;
    });

  return inputs;
}

function validateNodeInputs(node: AppNode, resolvedInputs: Record<string, unknown>) {
  const task = TaskRegistry[node.data.type];

  for (const input of task.inputs) {
    if (!input.required) {
      continue;
    }

    const value = resolvedInputs[input.name];
    const isMissingString = typeof value === "string" && value.trim().length === 0;
    const isMissingValue = value == null || isMissingString;

    if (isMissingValue) {
      throw new Error(`${input.name} is required.`);
    }
  }
}

async function runNode(node: AppNode, resolvedInputs: Record<string, unknown>) {
  const task = TaskRegistry[node.data.type];
  if (!task.run) {
    return {};
  }
  return await task.run(resolvedInputs);
}

export async function executeWorkflow(nodes: AppNode[], edges: Edge[]): Promise<WorkflowExecutionResult> {
  const outputsByNode: WorkflowExecutionResult["outputsByNode"] = {};
  const errorsByNode: WorkflowExecutionResult["errorsByNode"] = {};
  const logs: string[] = [];
  const { order: orderedNodeIds, hasCycle } = sortNodesTopologically(nodes, edges);
  let creditsUsed = 0;

  if (hasCycle) {
    for (const node of nodes) {
      errorsByNode[node.id] = "This workflow contains a cycle. Remove circular connections before running.";
    }

    logs.push("Execution blocked: the workflow graph contains a cycle.");

    return {
      logs,
      outputsByNode,
      errorsByNode,
      order: orderedNodeIds,
      creditsUsed,
      globalError: "Execution blocked. The workflow graph contains a cycle.",
    };
  }

  for (const nodeId of orderedNodeIds) {
    const node = nodes.find((item) => item.id === nodeId);
    if (!node) {
      continue;
    }

    try {
      const upstreamFailure = edges.find(
        (edge) => edge.target === node.id && errorsByNode[edge.source]
      );

      if (upstreamFailure) {
        throw new Error("Blocked by an upstream node failure.");
      }

      const resolvedInputs = buildInputMap(node, edges, outputsByNode);
      validateNodeInputs(node, resolvedInputs);
      const output = await runNode(node, resolvedInputs);
      outputsByNode[node.id] = output;
      creditsUsed += node.data.cost ?? 0;
      logs.push(`${node.data.label} executed successfully.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown execution error";
      errorsByNode[node.id] = message;
      logs.push(`${node.data.label} failed: ${message}`);
    }
  }

  return {
    logs,
    outputsByNode,
    errorsByNode,
    order: orderedNodeIds,
    creditsUsed,
    globalError:
      Object.keys(errorsByNode).length > 0
        ? "One or more nodes failed during execution."
        : null,
  };
}
