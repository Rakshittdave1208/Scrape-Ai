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
        Html: `<html><body><h1 class="product-title">Wireless Headphones Pro</h1><span class="product-price">$249</span><p>HTML from ${String(
          (resolvedInputs["Web page"] as { url?: string } | undefined)?.url ?? "connected page"
        )}</p></body></html>`,
        "Web page": resolvedInputs["Web page"],
      };
    case TaskType.FILL_INPUT:
      return {
        "Web page": {
          ...(resolvedInputs["Web page"] as Record<string, unknown> | undefined),
          lastInteraction: `Filled ${String(resolvedInputs.Selector ?? "field")}`,
          lastValue: resolvedInputs.Value ?? "",
        },
      };
    case TaskType.CLICK_ELEMENT:
      return {
        "Web page": {
          ...(resolvedInputs["Web page"] as Record<string, unknown> | undefined),
          lastInteraction: `Clicked ${String(resolvedInputs.Selector ?? "element")}`,
        },
      };
    case TaskType.NAVIGATE_URL:
      return {
        "Web page": {
          ...(resolvedInputs["Web page"] as Record<string, unknown> | undefined),
          url: resolvedInputs["Next URL"] ?? "",
          navigatedAt: new Date().toISOString(),
        },
      };
    case TaskType.SCROLL_TO_ELEMENT:
      return {
        "Web page": {
          ...(resolvedInputs["Web page"] as Record<string, unknown> | undefined),
          lastInteraction: `Scrolled to ${String(resolvedInputs.Selector ?? "element")}`,
        },
      };
    case TaskType.EXTRACT_TEXT_FROM_ELEMENT:
      return {
        "Extracted text": `Extracted value for ${String(resolvedInputs.Selector ?? "selector")}`,
      };
    case TaskType.EXTRACT_DATA_WITH_AI:
      return {
        "Structured data": {
          instruction: resolvedInputs.Instruction ?? "",
          source: "ai-extraction",
          payloadPreview: String(resolvedInputs.Html ?? "").slice(0, 120),
        },
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
    case TaskType.READ_PROPERTY_FROM_JSON: {
      const jsonInput = resolvedInputs.JSON as Record<string, unknown> | undefined;
      const propertyName = String(resolvedInputs["Property name"] ?? "");
      return {
        Value: jsonInput?.[propertyName] ?? "",
      };
    }
    case TaskType.ADD_PROPERTY_TO_JSON: {
      const jsonInput = (resolvedInputs.JSON as Record<string, unknown> | undefined) ?? {};
      return {
        "Updated JSON": {
          ...jsonInput,
          [String(resolvedInputs["Property name"] ?? "property")]: resolvedInputs["Property value"] ?? "",
        },
      };
    }
    case TaskType.WAIT_FOR_ELEMENT:
      return {
        "Web page": {
          ...(resolvedInputs["Web page"] as Record<string, unknown> | undefined),
          waitedFor: resolvedInputs.Selector ?? "",
          timeoutMs: resolvedInputs["Timeout ms"] ?? 0,
        },
      };
    case TaskType.SEND_TO_WEBHOOK:
      return {
        Response: {
          ok: true,
          destination: resolvedInputs["Webhook URL"] ?? "",
          acceptedPayload: resolvedInputs.Payload ?? null,
          deliveredAt: new Date().toISOString(),
        },
      };
    default:
      return {};
  }
}

export function executeWorkflow(nodes: AppNode[], edges: Edge[]): WorkflowExecutionResult {
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
      const output = simulateNode(node, resolvedInputs);
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
