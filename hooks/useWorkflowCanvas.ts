"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addEdge,
  type Connection,
  type Edge,
  type NodeChange,
  type OnEdgesChange,
  type OnNodesChange,
  type XYPosition,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";

import { updateWorkflow } from "@/actions/workflows/updateWorkflow";
import { useExecutionCredits } from "@/hooks/useExecutionCredits";
import { createFlowNode } from "@/lib/workflow/createFlowNode";
import { executeWorkflow } from "@/lib/workflow/executeWorkflow";
import { getNodeExecutionCost, isConnectionValid } from "@/lib/workflow/graph";
import type { AppNode } from "@/types/appNode";
import type { TaskType } from "@/types/task";

const SAVE_DELAY_MS = 700;

type ViewportState = { x: number; y: number; zoom: number };

export function useWorkflowCanvas({
  workflowId,
  definition,
}: {
  workflowId: string;
  definition: string;
}) {
  const [nodes, setNodes, onNodesChangeBase] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [viewportState, setViewportState] = useState<ViewportState>({ x: 0, y: 0, zoom: 1 });
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [contextNodeId, setContextNodeId] = useState<string | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<XYPosition | null>(null);
  const hasHydratedRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { getViewport, setViewport, screenToFlowPosition, deleteElements } = useReactFlow();
  const credits = useExecutionCredits(100);

  const storageKey = useMemo(() => `workflow-canvas:${workflowId}`, [workflowId]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(definition);
      const nextNodes = Array.isArray(parsed.nodes) ? parsed.nodes : [];
      const nextEdges = Array.isArray(parsed.edges) ? parsed.edges : [];
      const nextViewport = parsed.viewport ?? { x: 0, y: 0, zoom: 1 };

      setNodes(nextNodes);
      setEdges(nextEdges);
      setViewport(nextViewport);
      setViewportState(nextViewport);
    } catch {
      setNodes([]);
      setEdges([]);
      setViewportState({ x: 0, y: 0, zoom: 1 });
    } finally {
      hasHydratedRef.current = true;
    }
  }, [definition, setEdges, setNodes, setViewport]);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const nextDefinition = JSON.stringify({
        nodes,
        edges,
        viewport: getViewport(),
      });

      void updateWorkflow(workflowId, nextDefinition);
    }, SAVE_DELAY_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [edges, getViewport, nodes, viewportState, workflowId]);

  const syncViewportState = useCallback(() => {
    setViewportState(getViewport());
  }, [getViewport]);

  const onNodesChange = useCallback<OnNodesChange<AppNode>>(
    (changes: NodeChange<AppNode>[]) => {
      onNodesChangeBase(changes);
      const deleted = changes.filter((change) => change.type === "remove").map((change) => change.id);
      if (deleted.length > 0) {
        setEdges((currentEdges) =>
          currentEdges.filter((edge) => !deleted.includes(edge.source) && !deleted.includes(edge.target))
        );
      }
    },
    [onNodesChangeBase, setEdges]
  );

  const canConnect = useCallback(
    (connection: Connection) => isConnectionValid(connection, nodes, edges),
    [edges, nodes]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!canConnect(connection)) {
        setExecutionError("Invalid connection. Connect matching output and input types only.");
        return;
      }

      setExecutionError(null);
      setEdges((currentEdges) =>
        addEdge(
          {
            ...connection,
            animated: true,
          },
          currentEdges
        )
      );
    },
    [canConnect, setEdges]
  );

  const addNode = useCallback(
    (taskType: TaskType, position: XYPosition) => {
      setNodes((currentNodes) => currentNodes.concat(createFlowNode(taskType, position)));
    },
    [setNodes]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("taskType") as TaskType;

      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [addNode, screenToFlowPosition]
  );

  const saveToLocalStorage = useCallback(() => {
    const snapshot = JSON.stringify({
      nodes,
      edges,
      viewport: getViewport(),
    });

    localStorage.setItem(storageKey, snapshot);
  }, [edges, getViewport, nodes, storageKey]);

  const loadFromLocalStorage = useCallback(() => {
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      setExecutionError("No saved local workflow snapshot found.");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setNodes(parsed.nodes ?? []);
      setEdges(parsed.edges ?? []);
      setViewport(parsed.viewport ?? { x: 0, y: 0, zoom: 1 });
      setExecutionError(null);
    } catch {
      setExecutionError("Failed to load the saved workflow snapshot.");
    }
  }, [setEdges, setNodes, setViewport, storageKey]);

  const resetNodeStatuses = useCallback(() => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          status: "idle",
          error: null,
        },
      }))
    );
  }, [setNodes]);

  const runWorkflow = useCallback(() => {
    setExecutionError(null);
    resetNodeStatuses();

    const totalCost = getNodeExecutionCost(nodes);

    if (!credits.hasEnoughCredits(totalCost)) {
      setExecutionError("Not enough credits to execute this workflow.");
      return;
    }

    const result = executeWorkflow(nodes, edges);

    if (Object.keys(result.errorsByNode).length > 0) {
      setExecutionError("One or more nodes failed during execution.");
    }

    credits.consume(result.creditsUsed);
    setExecutionLogs(result.logs);

    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const failed = result.errorsByNode[node.id];
        return {
          ...node,
          data: {
            ...node.data,
            status: failed ? "error" : "success",
            error: failed ?? null,
          },
        };
      })
    );
  }, [credits, edges, nodes, resetNodeStatuses, setNodes]);

  const openContextMenu = useCallback((nodeId: string, position: XYPosition) => {
    setContextNodeId(nodeId);
    setContextMenuPosition(position);
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextNodeId(null);
    setContextMenuPosition(null);
  }, []);

  const deleteContextNode = useCallback(() => {
    if (!contextNodeId) {
      return;
    }

    void deleteElements({
      nodes: [{ id: contextNodeId }],
    });

    closeContextMenu();
  }, [closeContextMenu, contextNodeId, deleteElements]);

  const clearBrokenState = useCallback(() => {
    setExecutionError(null);
    setExecutionLogs([]);
    resetNodeStatuses();
  }, [resetNodeStatuses]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange: onEdgesChange as OnEdgesChange<Edge>,
    onConnect,
    canConnect,
    onDrop,
    addNode,
    syncViewportState,
    saveToLocalStorage,
    loadFromLocalStorage,
    runWorkflow,
    creditsRemaining: credits.remainingCredits,
    executionLogs,
    executionError,
    clearBrokenState,
    contextNodeId,
    contextMenuPosition,
    openContextMenu,
    closeContextMenu,
    deleteContextNode,
  };
}
