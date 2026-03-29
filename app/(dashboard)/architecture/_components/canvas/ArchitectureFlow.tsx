"use client";

import { useCallback, useMemo, type Dispatch, type DragEvent, type SetStateAction } from "react";
import {
  addEdge,
  Background,
  BackgroundVariant,
  ConnectionLineType,
  Controls,
  MarkerType,
  MiniMap,
  type NodeTypes,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type OnEdgesChange,
  type OnNodesChange,
  type OnSelectionChangeFunc,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { MoveIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ArchitectureTemplate } from "@/lib/defaultArchitecture";
import type { ArchitectureEdge, ArchitectureNode } from "@/lib/workflow/backendArchitecture";
import ArchitectureNodeCard from "../nodes/ArchitectureNode";
import { architectureCategoryStyles, getArchitectureEdgePresentation } from "../shared";

const nodeTypes: NodeTypes = {
  architectureNode: ArchitectureNodeCard,
};

const SNAP_GRID: [number, number] = [24, 24];

type ArchitectureFlowInnerProps = {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  hoveredEdgeId: string | null;
  activeEdgeIds: string[];
  isRunning: boolean;
  onNodesChange: OnNodesChange<ArchitectureNode>;
  onEdgesChange: OnEdgesChange<ArchitectureEdge>;
  onAddNode: (template: ArchitectureTemplate, position: { x: number; y: number }) => void;
  onDeleteSelection: () => void;
  onSelect: OnSelectionChangeFunc;
  onSetHoveredEdge: (edgeId: string | null) => void;
  onSetEdges: Dispatch<SetStateAction<ArchitectureEdge[]>>;
};

function ArchitectureFlowInner({
  nodes,
  edges,
  selectedNodeId,
  selectedEdgeId,
  hoveredEdgeId,
  activeEdgeIds,
  isRunning,
  onNodesChange,
  onEdgesChange,
  onAddNode,
  onDeleteSelection,
  onSelect,
  onSetHoveredEdge,
  onSetEdges,
}: ArchitectureFlowInnerProps) {
  const { fitView, screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) {
        return;
      }

      onSetEdges((currentEdges) =>
        addEdge(
          {
            ...connection,
            id: `architecture-edge-${crypto.randomUUID()}`,
            label: "custom link",
          },
          currentEdges
        )
      );
    },
    [onSetEdges]
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const rawPayload = event.dataTransfer.getData("application/architecture-template");

      if (!rawPayload) {
        return;
      }

      const template = JSON.parse(rawPayload) as ArchitectureTemplate;
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      onAddNode(template, position);
    },
    [onAddNode, screenToFlowPosition]
  );

  const renderedEdges = useMemo(
    () =>
      edges.map((edge) => {
        const presentation = getArchitectureEdgePresentation({
          isActive: activeEdgeIds.includes(edge.id),
          isHovered: hoveredEdgeId === edge.id,
          isSelected: selectedEdgeId === edge.id,
        });

        return {
          ...edge,
          type: "smoothstep",
          animated: presentation.animated,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 18,
            height: 18,
            color: presentation.stroke,
          },
          style: {
            strokeWidth: presentation.strokeWidth,
            stroke: presentation.stroke,
          },
          labelStyle: {
            fill: presentation.labelColor,
            fontSize: 12,
            fontWeight: 600,
          },
          labelBgStyle: {
            fill: "#ffffff",
            fillOpacity: 0.96,
            stroke: presentation.labelBorder,
            strokeWidth: 1,
          },
          labelBgPadding: [10, 5] as [number, number],
          labelBgBorderRadius: 10,
        };
      }),
    [activeEdgeIds, edges, hoveredEdgeId, selectedEdgeId]
  );

  return (
    <div
      className="relative min-h-[860px] min-w-0 flex-1 overflow-hidden rounded-2xl border bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_30%),linear-gradient(to_bottom,_rgba(255,255,255,0.98),_rgba(248,250,252,1))] shadow-sm"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={renderedEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionChange={onSelect}
        onConnect={onConnect}
        onEdgeMouseEnter={(_, edge) => onSetHoveredEdge(edge.id)}
        onEdgeMouseLeave={() => onSetHoveredEdge(null)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.4}
        maxZoom={1.5}
        nodesDraggable
        nodesConnectable
        elementsSelectable
        deleteKeyCode={["Backspace", "Delete"]}
        snapToGrid
        snapGrid={SNAP_GRID}
        panOnDrag
        panOnScroll
        selectionOnDrag={false}
        connectionLineStyle={{ stroke: "#2563eb", strokeWidth: 2.5 }}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Panel
          position="top-left"
          className="rounded-xl border bg-background/95 px-4 py-3 text-sm shadow-sm backdrop-blur"
        >
          <p className="font-semibold text-foreground">Architecture Canvas</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Drag templates in from the left, connect services, and refine the system from the inspector.
          </p>
        </Panel>

        <Panel
          position="top-right"
          className="flex items-center gap-2 rounded-xl border bg-background/95 px-3 py-2 text-xs shadow-sm backdrop-blur"
        >
          <Button type="button" size="sm" variant="outline" onClick={() => void fitView({ padding: 0.2, duration: 350 })}>
            <MoveIcon size={14} />
            Fit View
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onDeleteSelection}
            disabled={!selectedNodeId && !selectedEdgeId}
          >
            <Trash2Icon size={14} />
            Delete
          </Button>
        </Panel>

        <MiniMap
          pannable
          zoomable
          className="!border !bg-background/95"
          nodeColor={(node) => {
            const category = (node.data?.category ?? "service") as keyof typeof architectureCategoryStyles;
            return architectureCategoryStyles[category].minimap;
          }}
        />
        <Controls position="bottom-right" />
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="#cbd5e1" />
      </ReactFlow>

      {isRunning ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
          <div className="rounded-full border bg-background/95 px-4 py-2 text-xs font-medium text-foreground shadow-sm">
            Simulating architecture execution...
          </div>
        </div>
      ) : null}
    </div>
  );
}

type ArchitectureFlowProps = ArchitectureFlowInnerProps;

export default function ArchitectureFlow(props: ArchitectureFlowProps) {
  return (
    <ReactFlowProvider>
      <ArchitectureFlowInner {...props} />
    </ReactFlowProvider>
  );
}
