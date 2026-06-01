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
import { createSampleProductWorkflow } from "@/lib/workflow/sampleProductWorkflow";
import type { AppNode } from "@/types/appNode";
import { TaskType } from "@/types/task";

const SAVE_DELAY_MS = 700;

type ViewportState = { x: number; y: number; zoom: number };
type WorkflowTemplateMode = "demo" | "blank" | "custom";

function isStarterWorkflow(nodes: AppNode[], edges: Edge[]) {
  if (nodes.length !== 1 || edges.length !== 0) {
    return false;
  }

  const [firstNode] = nodes;
  return firstNode.data.type === TaskType.LAUNCH_BROWSER;
}

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
  const [templateMode, setTemplateMode] = useState<WorkflowTemplateMode>("demo");
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [contextNodeId, setContextNodeId] = useState<string | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<XYPosition | null>(null);
  const hasHydratedRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { getViewport, setViewport, screenToFlowPosition, deleteElements } = useReactFlow();
  const credits = useExecutionCredits(10_000);

  const storageKey = useMemo(() => `workflow-canvas:${workflowId}`, [workflowId]);

  useEffect(() => {
    const sampleWorkflow = createSampleProductWorkflow();

    try {
      const parsed = JSON.parse(definition);
      const parsedNodes = Array.isArray(parsed.nodes) ? parsed.nodes : [];
      const parsedEdges = Array.isArray(parsed.edges) ? parsed.edges : [];
      const parsedTemplateMode =
        parsed.meta?.template === "blank" || parsed.meta?.template === "custom"
          ? parsed.meta.template
          : "demo";
      const shouldUseDemo =
        parsedTemplateMode !== "blank" && (parsedNodes.length === 0 || isStarterWorkflow(parsedNodes, parsedEdges));

      const nextNodes = shouldUseDemo ? sampleWorkflow.nodes : parsedNodes;
      const nextEdges = shouldUseDemo ? sampleWorkflow.edges : parsedEdges;
      const nextViewport = shouldUseDemo
        ? sampleWorkflow.viewport
        : parsed.viewport ?? { x: 0, y: 0, zoom: 1 };

      setTemplateMode(shouldUseDemo ? "demo" : parsedTemplateMode);
      setNodes(nextNodes);
      setEdges(nextEdges);
      setViewport(nextViewport);
      setViewportState(nextViewport);
    } catch {
      setTemplateMode("demo");
      setNodes(sampleWorkflow.nodes);
      setEdges(sampleWorkflow.edges);
      setViewport(sampleWorkflow.viewport);
      setViewportState(sampleWorkflow.viewport);
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
        meta: {
          template:
            templateMode === "blank" || (nodes.length === 0 && edges.length === 0)
              ? "blank"
              : templateMode === "demo"
                ? "demo"
                : "custom",
        },
      });

      void updateWorkflow(workflowId, nextDefinition);
    }, SAVE_DELAY_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [edges, getViewport, nodes, templateMode, viewportState, workflowId]);

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
    (connection: Connection | Edge) => isConnectionValid(connection, nodes, edges),
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
      setTemplateMode("custom");
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
      meta: {
        template:
          templateMode === "blank" || (nodes.length === 0 && edges.length === 0)
            ? "blank"
            : templateMode === "demo"
              ? "demo"
              : "custom",
      },
    });

    localStorage.setItem(storageKey, snapshot);
  }, [edges, getViewport, nodes, storageKey, templateMode]);

  const loadDemoWorkflow = useCallback(() => {
    const sampleWorkflow = createSampleProductWorkflow();
    setTemplateMode("demo");
    setNodes(sampleWorkflow.nodes);
    setEdges(sampleWorkflow.edges);
    setViewport(sampleWorkflow.viewport);
    setViewportState(sampleWorkflow.viewport);
    setExecutionError(null);
    setExecutionLogs([]);
  }, [setEdges, setNodes, setViewport]);

  const clearCanvas = useCallback(() => {
    const blankViewport = { x: 0, y: 0, zoom: 1 };
    setTemplateMode("blank");
    setNodes([]);
    setEdges([]);
    setViewport(blankViewport);
    setViewportState(blankViewport);
    setExecutionError(null);
    setExecutionLogs([]);
  }, [setEdges, setNodes, setViewport]);

  const loadFromLocalStorage = useCallback(() => {
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      setExecutionError("No saved local workflow snapshot found.");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setTemplateMode(
        parsed.meta?.template === "blank" || parsed.meta?.template === "custom"
          ? parsed.meta.template
          : "demo"
      );
      setNodes(parsed.nodes ?? []);
      setEdges(parsed.edges ?? []);
      setViewport(parsed.viewport ?? { x: 0, y: 0, zoom: 1 });
      setExecutionError(null);
    } catch {
      setExecutionError("Failed to load the saved workflow snapshot.");
    }
  }, [setEdges, setNodes, setViewport, storageKey]);

  const resetNodeStatuses = useCallback(() => {
    if (nodes.length > 0 || edges.length > 0) {
      setTemplateMode("custom");
    }
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
  }, [edges.length, nodes.length, setNodes]);

  const runWorkflow = useCallback(async () => {
    setExecutionError(null);
    resetNodeStatuses();

    const totalCost = getNodeExecutionCost(nodes);

    if (!credits.hasEnoughCredits(totalCost)) {
      setExecutionError("Not enough credits to execute this workflow.");
      return;
    }

    const result = await executeWorkflow(nodes, edges);

    if (result.globalError) {
      setExecutionError(result.globalError);
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
    loadDemoWorkflow,
    clearCanvas,
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
