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

export function isConnectionValid(connection: Connection | Edge, nodes: AppNode[], edges: Edge[]) {
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

export type WorkflowValidationError = {
  nodeId: string;
  message: string;
};

export function validateWorkflow(nodes: AppNode[], edges: Edge[]) {
  const errors: WorkflowValidationError[] = [];

  // 1. Check for entry points
  const entryPoints = nodes.filter((node) => TaskRegistry[node.data.type].isEntryPoint);
  if (entryPoints.length === 0) {
    errors.push({ nodeId: "global", message: "Workflow must have at least one entry point node." });
  }

  // 2. Check for disconnected nodes (except entry points)
  nodes.forEach((node) => {
    const isEntryPoint = TaskRegistry[node.data.type].isEntryPoint;
    const hasIncomingEdges = edges.some((edge) => edge.target === node.id);
    if (!isEntryPoint && !hasIncomingEdges) {
      errors.push({ nodeId: node.id, message: "Node is disconnected from the workflow." });
    }
  });

  // 3. Validate required inputs
  nodes.forEach((node) => {
    const task = TaskRegistry[node.data.type];
    task.inputs.forEach((input) => {
      if (input.required) {
        const isConnected = edges.some((edge) => edge.target === node.id && edge.targetHandle === input.name);
        const hasValue = node.data.inputs[input.name] && node.data.inputs[input.name].trim().length > 0;
        
        if (!isConnected && !hasValue) {
          errors.push({ nodeId: node.id, message: `Required input "${input.name}" is missing.` });
        }
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
