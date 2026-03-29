import type { XYPosition } from "@xyflow/react";

import {
  architectureTemplates,
  defaultArchitecture as defaultArchitectureSeed,
  type ArchitectureCategory,
  type ArchitectureEdge,
  type ArchitectureNode,
  type ArchitectureNodeData,
} from "@/lib/workflow/backendArchitecture";

export const ARCHITECTURE_STORAGE_KEY = "architecture-canvas-state";
export const ARCHITECTURE_DAILY_CREDITS = 10_000;

export type ArchitectureTemplate = (typeof architectureTemplates)[number];

function cloneArchitectureNode(node: ArchitectureNode): ArchitectureNode {
  return {
    ...node,
    data: {
      ...node.data,
      config: { ...node.data.config },
    },
  };
}

function cloneArchitectureEdge(edge: ArchitectureEdge): ArchitectureEdge {
  return {
    ...edge,
  };
}

export function createDefaultArchitectureGraph() {
  return {
    nodes: defaultArchitectureSeed.nodes.map(cloneArchitectureNode),
    edges: defaultArchitectureSeed.edges.map(cloneArchitectureEdge),
  };
}

export function getArchitectureTemplateByKey(templateKey: string) {
  return architectureTemplates.find((template) => template.key === templateKey) ?? architectureTemplates[0];
}

export function createArchitectureNodeFromTemplate(
  templateKey: string,
  position: XYPosition,
  overrides?: Partial<ArchitectureNodeData>
): ArchitectureNode {
  const template = getArchitectureTemplateByKey(templateKey);

  return {
    id: `architecture-node-${crypto.randomUUID()}`,
    type: "architectureNode",
    position,
    data: {
      label: overrides?.label ?? template.label,
      description: overrides?.description ?? template.description,
      category: overrides?.category ?? template.category,
      config: overrides?.config ?? { ...template.config },
      cost: overrides?.cost ?? template.cost,
      status: overrides?.status ?? "idle",
    },
  };
}

export function getCategoryTemplates(category: ArchitectureCategory) {
  return architectureTemplates.filter((template) => template.category === category);
}
