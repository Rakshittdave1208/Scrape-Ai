"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useEdgesState, useNodesState, type EdgeChange, type NodeChange, type XYPosition } from "@xyflow/react";

import {
  ARCHITECTURE_STORAGE_KEY,
  createArchitectureNodeFromTemplate,
  createDefaultArchitectureGraph,
  type ArchitectureTemplate,
} from "@/lib/defaultArchitecture";
import type {
  ArchitectureCategory,
  ArchitectureEdge,
  ArchitectureNode,
  ArchitectureNodeData,
} from "@/lib/workflow/backendArchitecture";

type GraphState = {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
};

function normalizeNode(node: ArchitectureNode): ArchitectureNode {
  return {
    ...node,
    type: "architectureNode",
    data: {
      ...node.data,
      config: node.data.config ?? {},
      cost: node.data.cost ?? 100,
      status: node.data.status ?? "idle",
    },
  };
}

function normalizeEdge(edge: ArchitectureEdge): ArchitectureEdge {
  return {
    ...edge,
    type: edge.type ?? "smoothstep",
  };
}

function normalizeGraph(graph?: Partial<GraphState>) {
  const fallback = createDefaultArchitectureGraph();

  return {
    nodes: (graph?.nodes ?? fallback.nodes).map(normalizeNode),
    edges: (graph?.edges ?? fallback.edges).map(normalizeEdge),
  };
}

function readStoredGraph() {
  const stored = localStorage.getItem(ARCHITECTURE_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return normalizeGraph(JSON.parse(stored) as GraphState);
  } catch {
    return null;
  }
}

export function useCanvasState() {
  const initialGraph = useMemo(() => createDefaultArchitectureGraph(), []);
  const [nodes, setNodes, onNodesChangeBase] = useNodesState(initialGraph.nodes);
  const [edges, setEdges, onEdgesChangeBase] = useEdgesState(initialGraph.edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const storedGraph = readStoredGraph();

    if (storedGraph) {
      setNodes(storedGraph.nodes);
      setEdges(storedGraph.edges);
    } else {
      const defaultGraph = normalizeGraph(initialGraph);
      setNodes(defaultGraph.nodes);
      setEdges(defaultGraph.edges);
    }

    setHasHydrated(true);
  }, [initialGraph, setEdges, setNodes]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    localStorage.setItem(ARCHITECTURE_STORAGE_KEY, JSON.stringify({ nodes, edges }));
  }, [edges, hasHydrated, nodes]);

  useEffect(() => {
    if (selectedNodeId && !nodes.some((node) => node.id === selectedNodeId)) {
      setSelectedNodeId(null);
    }
  }, [nodes, selectedNodeId]);

  useEffect(() => {
    if (selectedEdgeId && !edges.some((edge) => edge.id === selectedEdgeId)) {
      setSelectedEdgeId(null);
    }
  }, [edges, selectedEdgeId]);

  const onNodesChange = useCallback(
    (changes: NodeChange<ArchitectureNode>[]) => {
      onNodesChangeBase(changes);
    },
    [onNodesChangeBase]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<ArchitectureEdge>[]) => {
      onEdgesChangeBase(changes);
    },
    [onEdgesChangeBase]
  );

  const saveGraph = useCallback(() => {
    localStorage.setItem(ARCHITECTURE_STORAGE_KEY, JSON.stringify({ nodes, edges }));
  }, [edges, nodes]);

  const loadGraph = useCallback(() => {
    const storedGraph = readStoredGraph();

    if (!storedGraph) {
      return;
    }

    setNodes(storedGraph.nodes);
    setEdges(storedGraph.edges);
  }, [setEdges, setNodes]);

  const resetGraph = useCallback(() => {
    const defaultGraph = createDefaultArchitectureGraph();
    setNodes(defaultGraph.nodes);
    setEdges(defaultGraph.edges);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    localStorage.setItem(ARCHITECTURE_STORAGE_KEY, JSON.stringify(defaultGraph));
  }, [setEdges, setNodes]);

  const addNodeFromTemplate = useCallback(
    (template: ArchitectureTemplate, position: XYPosition) => {
      const nextNode = createArchitectureNodeFromTemplate(template.key, position);
      setNodes((currentNodes) => [...currentNodes, nextNode]);
      setSelectedNodeId(nextNode.id);
      setSelectedEdgeId(null);
      return nextNode;
    },
    [setNodes]
  );

  const addNodeAtDefaultPosition = useCallback(
    (template: ArchitectureTemplate) => {
      const offset = Math.max(0, nodes.length - 1) * 32;
      return addNodeFromTemplate(template, { x: 240 + offset, y: 220 + (offset % 160) });
    },
    [addNodeFromTemplate, nodes.length]
  );

  const updateNodeData = useCallback(
    (nodeId: string, updates: Partial<ArchitectureNodeData>) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...updates,
                  config: updates.config ?? node.data.config,
                },
              }
            : node
        )
      );
    },
    [setNodes]
  );

  const updateNodeCategory = useCallback(
    (nodeId: string, category: ArchitectureCategory) => {
      updateNodeData(nodeId, { category });
    },
    [updateNodeData]
  );

  const updateEdgeLabel = useCallback(
    (edgeId: string, label: string) => {
      setEdges((currentEdges) =>
        currentEdges.map((edge) =>
          edge.id === edgeId
            ? {
                ...edge,
                label,
              }
            : edge
        )
      );
    },
    [setEdges]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((currentNodes) => currentNodes.filter((node) => node.id !== nodeId));
      setEdges((currentEdges) =>
        currentEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
      setSelectedNodeId((currentSelected) => (currentSelected === nodeId ? null : currentSelected));
    },
    [setEdges, setNodes]
  );

  const deleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((currentEdges) => currentEdges.filter((edge) => edge.id !== edgeId));
      setSelectedEdgeId((currentSelected) => (currentSelected === edgeId ? null : currentSelected));
    },
    [setEdges]
  );

  const setSelection = useCallback((nodeId: string | null, edgeId: string | null) => {
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(edgeId);
  }, []);

  const clearStatuses = useCallback(() => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          status: "idle",
        },
      }))
    );
  }, [setNodes]);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );
  const selectedEdge = useMemo(
    () => edges.find((edge) => edge.id === selectedEdgeId) ?? null,
    [edges, selectedEdgeId]
  );

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    selectedNode,
    selectedEdge,
    selectedNodeId,
    selectedEdgeId,
    hasHydrated,
    saveGraph,
    loadGraph,
    resetGraph,
    addNodeFromTemplate,
    addNodeAtDefaultPosition,
    updateNodeData,
    updateNodeCategory,
    updateEdgeLabel,
    deleteNode,
    deleteEdge,
    setSelection,
    clearStatuses,
  };
}
