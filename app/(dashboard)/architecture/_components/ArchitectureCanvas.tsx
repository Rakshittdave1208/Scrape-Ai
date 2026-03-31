"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DownloadIcon,
  EraserIcon,
  ExpandIcon,
  MinimizeIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  PlayIcon,
  RefreshCcwIcon,
  SaveIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCanvasState } from "@/hooks/useCanvasState";
import { useCredits } from "@/hooks/useCredits";
import type { ArchitectureEdge, ArchitectureNode } from "@/lib/workflow/backendArchitecture";
import { cn } from "@/lib/utils";
import ArchitectureFlow from "./canvas/ArchitectureFlow";
import ArchitectureInspector from "./panels/ArchitectureInspector";
import ArchitectureSidebar from "./sidebar/ArchitectureSidebar";
import { formatCredits } from "./shared";

function validateArchitecture(nodes: ArchitectureNode[], edges: ArchitectureEdge[]) {
  const nodeErrors = new Map<string, string>();
  const nodeIds = new Set(nodes.map((node) => node.id));

  if (nodes.length === 0) {
    return {
      nodeErrors,
      globalError: "The canvas is empty. Add at least one node before running the architecture.",
    };
  }

  edges.forEach((edge) => {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      if (nodeIds.has(edge.source)) {
        nodeErrors.set(edge.source, "This node has an invalid outgoing connection.");
      }

      if (nodeIds.has(edge.target)) {
        nodeErrors.set(edge.target, "This node has an invalid incoming connection.");
      }
    }
  });

  nodes.forEach((node) => {
    if (!node.data.label.trim()) {
      nodeErrors.set(node.id, "Node title is required.");
      return;
    }

    if (!node.data.description.trim()) {
      nodeErrors.set(node.id, "Node description is required.");
      return;
    }

    if (!node.data.technology.trim()) {
      nodeErrors.set(node.id, "Technology is required before running this node.");
      return;
    }

    const connected = edges.some((edge) => edge.source === node.id || edge.target === node.id);

    if (!connected && nodes.length > 1) {
      nodeErrors.set(node.id, "Connect this node to the architecture graph before running.");
    }
  });

  return {
    nodeErrors,
    globalError:
      nodeErrors.size > 0
        ? "Architecture validation failed. Review the highlighted nodes and try again."
        : null,
  };
}

function getTopologicalOrder(nodes: ArchitectureNode[], edges: ArchitectureEdge[]) {
  const indegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  nodes.forEach((node) => {
    indegree.set(node.id, 0);
    adjacency.set(node.id, []);
  });

  edges.forEach((edge) => {
    if (!indegree.has(edge.source) || !indegree.has(edge.target)) {
      return;
    }

    adjacency.get(edge.source)?.push(edge.target);
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
  });

  const queue = nodes.filter((node) => (indegree.get(node.id) ?? 0) === 0).map((node) => node.id);
  const orderedIds: string[] = [];

  while (queue.length > 0) {
    const currentId = queue.shift();

    if (!currentId) {
      continue;
    }

    orderedIds.push(currentId);

    adjacency.get(currentId)?.forEach((nextId) => {
      const nextCount = (indegree.get(nextId) ?? 1) - 1;
      indegree.set(nextId, nextCount);

      if (nextCount === 0) {
        queue.push(nextId);
      }
    });
  }

  if (orderedIds.length !== nodes.length) {
    return null;
  }

  return orderedIds
    .map((id) => nodes.find((node) => node.id === id))
    .filter((node): node is ArchitectureNode => Boolean(node));
}

function wait(duration: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

export default function ArchitectureCanvas() {
  const {
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
    saveGraph,
    loadGraph,
    resetGraph,
    clearGraph,
    addNodeFromTemplate,
    addNodeAtDefaultPosition,
    updateNodeData,
    updateNodeCategory,
    updateEdgeLabel,
    deleteNode,
    deleteEdge,
    setSelection,
    clearStatuses,
  } = useCanvasState();
  const { credits, dailyLimit, progress, consumeCredits } = useCredits();
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [activeEdgeIds, setActiveEdgeIds] = useState<string[]>([]);
  const [runMessage, setRunMessage] = useState("Preloaded architecture ready for editing.");
  const [isRunning, setIsRunning] = useState(false);
  const [showPalette, setShowPalette] = useState(true);
  const [showInspector, setShowInspector] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasShellRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedNode || selectedEdge) {
      setShowInspector(true);
    }
  }, [selectedEdge, selectedNode]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === canvasShellRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const selectedLabel = useMemo(() => {
    if (selectedNode) {
      return selectedNode.data.label;
    }

    if (selectedEdge) {
      return typeof selectedEdge.label === "string" && selectedEdge.label.length > 0
        ? selectedEdge.label
        : `${selectedEdge.source} -> ${selectedEdge.target}`;
    }

    return null;
  }, [selectedEdge, selectedNode]);

  const runArchitecture = useCallback(async () => {
    const orderedNodes = getTopologicalOrder(nodes, edges);
    const validation = validateArchitecture(nodes, edges);

    if (validation.nodeErrors.size > 0) {
      setRunMessage(validation.globalError ?? "Architecture validation failed.");
      setActiveEdgeIds([]);
      setNodes((currentNodes) =>
        currentNodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            status: validation.nodeErrors.has(node.id) ? "error" : "idle",
            error: validation.nodeErrors.get(node.id) ?? null,
          },
        }))
      );
      return;
    }

    if (!orderedNodes) {
      setRunMessage("Execution blocked. The graph must remain acyclic.");
      setNodes((currentNodes) =>
        currentNodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            status: "error",
            error: "This graph contains a cycle. Remove circular connections before running.",
          },
        }))
      );
      return;
    }

    const totalCost = orderedNodes.reduce((sum, node) => sum + (node.data.cost ?? 0), 0);

    if (!consumeCredits(totalCost)) {
      setRunMessage(`Not enough credits to run this graph. Required ${totalCost} credits.`);
      return;
    }

    setIsRunning(true);
    setRunMessage(`Running ${orderedNodes.length} nodes for ${totalCost} credits.`);
    clearStatuses();
    setActiveEdgeIds([]);

    try {
      for (const node of orderedNodes) {
        setNodes((currentNodes) =>
          currentNodes.map((currentNode) =>
            currentNode.id === node.id
              ? {
                  ...currentNode,
                  data: {
                    ...currentNode.data,
                    status: "running",
                    error: null,
                  },
                }
              : currentNode
          )
        );

        setActiveEdgeIds((currentIds) =>
          Array.from(
            new Set([
              ...currentIds,
              ...edges
                .filter((edge) => edge.target === node.id || edge.source === node.id)
                .map((edge) => edge.id),
            ])
          )
        );

        await wait(320);

        setNodes((currentNodes) =>
          currentNodes.map((currentNode) =>
            currentNode.id === node.id
              ? {
                  ...currentNode,
                  data: {
                    ...currentNode.data,
                    status: "success",
                    error: null,
                  },
                }
              : currentNode
          )
        );
      }

      setRunMessage(`Architecture simulation completed. ${totalCost} credits consumed.`);
    } catch {
      setRunMessage("Architecture simulation failed.");
      setNodes((currentNodes) =>
        currentNodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            status: node.data.status === "running" ? "error" : node.data.status,
            error:
              node.data.status === "running"
                ? "Simulation stopped while this node was executing."
                : node.data.error ?? null,
          },
        }))
      );
    } finally {
      setIsRunning(false);
    }
  }, [clearStatuses, consumeCredits, edges, nodes, setNodes]);

  const deleteSelection = useCallback(() => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
      return;
    }

    if (selectedEdgeId) {
      deleteEdge(selectedEdgeId);
    }
  }, [deleteEdge, deleteNode, selectedEdgeId, selectedNodeId]);

  const toggleFullscreen = useCallback(async () => {
    if (!canvasShellRef.current) {
      return;
    }

    if (document.fullscreenElement === canvasShellRef.current) {
      await document.exitFullscreen();
      return;
    }

    await canvasShellRef.current.requestFullscreen();
  }, []);

  const autoFitKey = useMemo(
    () => `${nodes.length}-${edges.length}-${isFullscreen ? "fullscreen" : "windowed"}`,
    [edges.length, isFullscreen, nodes.length]
  );

  return (
    <div
      ref={canvasShellRef}
      className={cn(
        "flex h-full min-h-0 flex-1 min-w-0 flex-col gap-4",
        isFullscreen && "h-screen bg-background p-4"
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-2xl border bg-background px-4 py-3 shadow-sm">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Default template loaded</Badge>
            <Badge variant="outline">{nodes.length} nodes</Badge>
            <Badge variant="outline">{edges.length} edges</Badge>
            <Badge variant="outline">Credits left {formatCredits(credits)}</Badge>
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground">{runMessage}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => void toggleFullscreen()}>
            {isFullscreen ? <MinimizeIcon size={14} /> : <ExpandIcon size={14} />}
            {isFullscreen ? "Exit Full Screen" : "Full Screen"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowPalette((current) => !current)}
          >
            {showPalette ? <PanelLeftCloseIcon size={14} /> : <PanelLeftOpenIcon size={14} />}
            {showPalette ? "Hide Palette" : "Show Palette"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowInspector((current) => !current)}
          >
            {showInspector ? <PanelRightCloseIcon size={14} /> : <PanelRightOpenIcon size={14} />}
            {showInspector ? "Hide Inspector" : "Show Inspector"}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={saveGraph}>
            <SaveIcon size={14} />
            Save
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={loadGraph}>
            <DownloadIcon size={14} />
            Load
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={resetGraph}>
            <RefreshCcwIcon size={14} />
            Reset Canvas
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={clearGraph}>
            <EraserIcon size={14} />
            Clear Canvas
          </Button>
          <Button type="button" size="sm" onClick={() => void runArchitecture()} disabled={isRunning}>
            <PlayIcon size={14} />
            Run Architecture
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "relative min-w-0 flex-1",
          isFullscreen ? "h-[calc(100vh-9rem)] min-h-[calc(100vh-9rem)]" : "min-h-[720px] xl:min-h-[860px]"
        )}
      >
        <ArchitectureFlow
          nodes={nodes}
          edges={edges}
          autoFitKey={autoFitKey}
          selectedNodeId={selectedNodeId}
          selectedEdgeId={selectedEdgeId}
          hoveredEdgeId={hoveredEdgeId}
          activeEdgeIds={activeEdgeIds}
          isRunning={isRunning}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onAddNode={addNodeFromTemplate}
          onDeleteSelection={deleteSelection}
          onSelect={({ nodes: selectedNodes, edges: selectedEdges }) =>
            setSelection(selectedNodes[0]?.id ?? null, selectedEdges[0]?.id ?? null)
          }
          onSetHoveredEdge={setHoveredEdgeId}
          onSetEdges={setEdges}
        />

        {showPalette ? (
          <div className="pointer-events-none absolute inset-y-4 left-4 z-20 hidden xl:block">
            <ArchitectureSidebar
              className="pointer-events-auto h-full"
              credits={credits}
              dailyLimit={dailyLimit}
              progress={progress}
              nodesCount={nodes.length}
              edgesCount={edges.length}
              selectedLabel={selectedLabel}
              onAddTemplate={addNodeAtDefaultPosition}
            />
          </div>
        ) : null}

        {showInspector ? (
          <div className="pointer-events-none absolute inset-y-4 right-4 z-20 hidden xl:block">
            <ArchitectureInspector
              className="pointer-events-auto h-full"
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              onUpdateNode={updateNodeData}
              onUpdateNodeCategory={updateNodeCategory}
              onUpdateEdgeLabel={updateEdgeLabel}
              onDeleteNode={deleteNode}
              onDeleteEdge={deleteEdge}
            />
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 xl:hidden">
        {showPalette ? (
          <ArchitectureSidebar
            credits={credits}
            dailyLimit={dailyLimit}
            progress={progress}
            nodesCount={nodes.length}
            edgesCount={edges.length}
            selectedLabel={selectedLabel}
            onAddTemplate={addNodeAtDefaultPosition}
          />
        ) : null}

        {showInspector ? (
          <ArchitectureInspector
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            onUpdateNode={updateNodeData}
            onUpdateNodeCategory={updateNodeCategory}
            onUpdateEdgeLabel={updateEdgeLabel}
            onDeleteNode={deleteNode}
            onDeleteEdge={deleteEdge}
          />
        ) : null}
      </div>
    </div>
  );
}
