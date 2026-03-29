import type { Edge } from "@xyflow/react";

import type { AppNode } from "@/types/appNode";
import { TaskType } from "@/types/task";

export type WorkflowExecutionResult = {
  logs: string[];
  outputsByNode: Record<string, Record<string, unknown>>;
  errorsByNode: Record<string, string>;
  order: string[];
  creditsUsed: number;
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
    return nodes.map((node) => node.id);
  }

  return orderedIds;
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

function simulateNode(node: AppNode, resolvedInputs: Record<string, unknown>) {
  switch (node.data.type) {
    case TaskType.LAUNCH_BROWSER:
      return {
        "Web page": {
          url: resolvedInputs["Website Url"] ?? "",
          openedAt: new Date().toISOString(),
        },
      };
    case TaskType.PAGE_TO_HTML:
      return {
        Html: `<html><body>HTML from ${String(
          (resolvedInputs["Web page"] as { url?: string } | undefined)?.url ?? "connected page"
        )}</body></html>`,
        "Web page": resolvedInputs["Web page"],
      };
    case TaskType.EXTRACT_TEXT_FROM_ELEMENT:
      return {
        "Extracted text": `Extracted ${String(resolvedInputs.Selector ?? "value")}`,
      };
    case TaskType.SCRAPER_NODE:
      return {
        responseBody: `Fetched body from ${String(resolvedInputs["Target URL"] ?? "")}`,
        metadata: {
          source: "scraper",
          timestamp: new Date().toISOString(),
        },
      };
    case TaskType.API_NODE:
      return {
        response: {
          ok: true,
          endpoint: resolvedInputs.Endpoint ?? "",
          payload: resolvedInputs.Payload ?? null,
        },
        statusCode: 200,
      };
    case TaskType.TRANSFORM_NODE: {
      const source = String(resolvedInputs.Source ?? "");
      const template = String(resolvedInputs.Template ?? "{{value}}");
      return {
        result: template.replaceAll("{{value}}", source),
      };
    }
    default:
      return {};
  }
}

export function executeWorkflow(nodes: AppNode[], edges: Edge[]): WorkflowExecutionResult {
  const outputsByNode: WorkflowExecutionResult["outputsByNode"] = {};
  const errorsByNode: WorkflowExecutionResult["errorsByNode"] = {};
  const logs: string[] = [];
  const orderedNodeIds = sortNodesTopologically(nodes, edges);

  for (const nodeId of orderedNodeIds) {
    const node = nodes.find((item) => item.id === nodeId);
    if (!node) {
      continue;
    }

    try {
      const resolvedInputs = buildInputMap(node, edges, outputsByNode);
      const output = simulateNode(node, resolvedInputs);
      outputsByNode[node.id] = output;
      logs.push(`${node.data.label} executed`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown execution error";
      errorsByNode[node.id] = message;
      logs.push(`${node.data.label} failed`);
    }
  }

  const creditsUsed = nodes.reduce((total, node) => total + (node.data.cost ?? 0), 0);

  return {
    logs,
    outputsByNode,
    errorsByNode,
    order: orderedNodeIds,
    creditsUsed,
  };
}
