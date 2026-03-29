import type { Connection, Edge } from "@xyflow/react";

import type { AppNode } from "@/types/appNode";
import { TaskRegistry } from "./task/registry";

export const WORKFLOW_SNAP_GRID: [number, number] = [24, 24];

export function getTaskParamType(node: AppNode | undefined, handleName: string, kind: "input" | "output") {
  if (!node) {
    return null;
  }

  const task = TaskRegistry[node.data.type];
  const params = kind === "input" ? task.inputs : task.outputs;
  return params.find((param) => param.name === handleName)?.type ?? null;
}

export function isConnectionValid(connection: Connection, nodes: AppNode[], edges: Edge[]) {
  if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) {
    return false;
  }

  if (connection.source === connection.target) {
    return false;
  }

  const sourceNode = nodes.find((node) => node.id === connection.source);
  const targetNode = nodes.find((node) => node.id === connection.target);

  const sourceType = getTaskParamType(sourceNode, connection.sourceHandle, "output");
  const targetType = getTaskParamType(targetNode, connection.targetHandle, "input");

  if (!sourceType || !targetType || sourceType !== targetType) {
    return false;
  }

  const targetAlreadyConnected = edges.some(
    (edge) =>
      edge.target === connection.target &&
      edge.targetHandle === connection.targetHandle &&
      !(edge.source === connection.source && edge.sourceHandle === connection.sourceHandle)
  );

  return !targetAlreadyConnected;
}

export function getNodeExecutionCost(nodes: AppNode[]) {
  return nodes.reduce((total, node) => total + (node.data.cost ?? 0), 0);
}
