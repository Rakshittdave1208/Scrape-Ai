"use client";

import { useCallback, useMemo, useState } from "react";
import { DownloadIcon, PlayIcon, RefreshCcwIcon, SaveIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCanvasState } from "@/hooks/useCanvasState";
import { useCredits } from "@/hooks/useCredits";
import type { ArchitectureEdge, ArchitectureNode } from "@/lib/workflow/backendArchitecture";
import ArchitectureFlow from "./canvas/ArchitectureFlow";
import ArchitectureInspector from "./panels/ArchitectureInspector";
import ArchitectureSidebar from "./sidebar/ArchitectureSidebar";

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

    if (!orderedNodes) {
      setRunMessage("Execution blocked. The graph must remain acyclic.");
      setNodes((currentNodes) =>
        currentNodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            status: "error",
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

  return (
    <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
      <ArchitectureSidebar
        credits={credits}
        dailyLimit={dailyLimit}
        progress={progress}
        nodesCount={nodes.length}
        edgesCount={edges.length}
        selectedLabel={selectedLabel}
        onAddTemplate={addNodeAtDefaultPosition}
      />

      <div className="flex min-h-0 min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-background px-4 py-3 shadow-sm">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Default template loaded</Badge>
              <Badge variant="outline">{nodes.length} nodes</Badge>
              <Badge variant="outline">{edges.length} edges</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{runMessage}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
            <Button type="button" size="sm" onClick={() => void runArchitecture()} disabled={isRunning}>
              <PlayIcon size={14} />
              Run Architecture
            </Button>
          </div>
        </div>

        <ArchitectureFlow
          nodes={nodes}
          edges={edges}
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
      </div>

      <ArchitectureInspector
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        onUpdateNode={updateNodeData}
        onUpdateNodeCategory={updateNodeCategory}
        onUpdateEdgeLabel={updateEdgeLabel}
        onDeleteNode={deleteNode}
        onDeleteEdge={deleteEdge}
      />
    </div>
  );
}
