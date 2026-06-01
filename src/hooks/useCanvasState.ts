"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useEdgesState, useNodesState, type EdgeChange, type NodeChange, type XYPosition } from "@xyflow/react";

import {
  createArchitectureNodeFromTemplate,
  createCustomArchitectureNode,
  createDefaultArchitectureGraph,
  getArchitectureGraphStorageKey,
  type CustomArchitectureNodeDraft,
  type ArchitectureTemplate,
} from "@/lib/defaultArchitecture";
import {
  createInitialArchitectureProjectGraph,
  type StoredArchitectureGraph,
  touchArchitectureProject,
} from "@/lib/architecture/projects";
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
      technology: node.data.technology ?? "",
      input: node.data.input ?? "",
      error: node.data.error ?? null,
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

function sanitizeEdges(edges: ArchitectureEdge[]) {
  const hasLegacyBillingStripeLoop =
    edges.some(
      (edge) => edge.source === "billing-service" && edge.target === "stripe-webhook-handler"
    ) &&
    edges.some(
      (edge) => edge.source === "stripe-webhook-handler" && edge.target === "billing-service"
    );

  if (!hasLegacyBillingStripeLoop) {
    return edges;
  }

  return edges.filter(
    (edge) => !(edge.source === "billing-service" && edge.target === "stripe-webhook-handler")
  );
}

function normalizeGraph(graph?: Partial<GraphState>) {
  const fallback = createDefaultArchitectureGraph();
  const normalizedEdges = sanitizeEdges((graph?.edges ?? fallback.edges).map(normalizeEdge));

  return {
    nodes: (graph?.nodes ?? fallback.nodes).map(normalizeNode),
    edges: normalizedEdges,
  };
}

function readStoredGraph(storageKey: string) {
  const stored = localStorage.getItem(storageKey);

  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as GraphState | StoredArchitectureGraph;
    const graph =
      "nodes" in parsed && "edges" in parsed
        ? {
            nodes: parsed.nodes,
            edges: parsed.edges,
          }
        : createInitialArchitectureProjectGraph();
    const normalized = normalizeGraph(graph);

    if (normalized.nodes.length === 0) {
      return normalizeGraph();
    }

    return normalized;
  } catch {
    return null;
  }
}

export function useCanvasState(architectureId: string) {
  const initialGraph = useMemo(() => createDefaultArchitectureGraph(), []);
  const storageKey = useMemo(() => getArchitectureGraphStorageKey(architectureId), [architectureId]);
  const [nodes, setNodes, onNodesChangeBase] = useNodesState(initialGraph.nodes);
  const [edges, setEdges, onEdgesChangeBase] = useEdgesState(initialGraph.edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const storedGraph = readStoredGraph(storageKey);

    if (storedGraph) {
      setNodes(storedGraph.nodes);
      setEdges(storedGraph.edges);
    } else {
      const defaultGraph = normalizeGraph(initialGraph);
      setNodes(defaultGraph.nodes);
      setEdges(defaultGraph.edges);
    }

    setHasHydrated(true);
  }, [initialGraph, setEdges, setNodes, storageKey]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify({ nodes, edges }));
    touchArchitectureProject(architectureId);
  }, [architectureId, edges, hasHydrated, nodes, storageKey]);

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
    localStorage.setItem(storageKey, JSON.stringify({ nodes, edges }));
    touchArchitectureProject(architectureId);
  }, [architectureId, edges, nodes, storageKey]);

  const loadGraph = useCallback(() => {
    const storedGraph = readStoredGraph(storageKey);

    if (!storedGraph) {
      return;
    }

    setNodes(storedGraph.nodes);
    setEdges(storedGraph.edges);
  }, [setEdges, setNodes, storageKey]);

  const resetGraph = useCallback(() => {
    const defaultGraph = createDefaultArchitectureGraph();
    setNodes(defaultGraph.nodes);
    setEdges(defaultGraph.edges);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    localStorage.setItem(storageKey, JSON.stringify(defaultGraph));
    touchArchitectureProject(architectureId);
  }, [architectureId, setEdges, setNodes, storageKey]);

  const clearGraph = useCallback(() => {
    const emptyGraph = {
      nodes: [] as ArchitectureNode[],
      edges: [] as ArchitectureEdge[],
    };

    setNodes(emptyGraph.nodes);
    setEdges(emptyGraph.edges);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    localStorage.setItem(storageKey, JSON.stringify(emptyGraph));
    touchArchitectureProject(architectureId);
  }, [architectureId, setEdges, setNodes, storageKey]);

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

  const addCustomNode = useCallback(
    (draft: CustomArchitectureNodeDraft, position: XYPosition) => {
      const nextNode = createCustomArchitectureNode(draft, position);
      setNodes((currentNodes) => [...currentNodes, nextNode]);
      setSelectedNodeId(nextNode.id);
      setSelectedEdgeId(null);
      return nextNode;
    },
    [setNodes]
  );

  const addCustomNodeAtDefaultPosition = useCallback(
    (draft: CustomArchitectureNodeDraft) => {
      const offset = Math.max(0, nodes.length - 1) * 32;
      return addCustomNode(draft, { x: 240 + offset, y: 220 + (offset % 160) });
    },
    [addCustomNode, nodes.length]
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
                  error: updates.error ?? node.data.error ?? null,
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
          error: null,
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
    clearGraph,
    addNodeFromTemplate,
    addNodeAtDefaultPosition,
    addCustomNode,
    addCustomNodeAtDefaultPosition,
    updateNodeData,
    updateNodeCategory,
    updateEdgeLabel,
    deleteNode,
    deleteEdge,
    setSelection,
    clearStatuses,
  };
}
