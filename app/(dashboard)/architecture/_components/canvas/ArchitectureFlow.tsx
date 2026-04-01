"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  type Dispatch,
  type DragEvent,
  type SetStateAction,
} from "react";
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
  useNodesInitialized,
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
  autoFitKey: string;
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
  autoFitKey,
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
  const nodesInitialized = useNodesInitialized();

  useEffect(() => {
    if (nodes.length === 0 || !nodesInitialized) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      void fitView({ padding: 0.28, duration: 350 });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [autoFitKey, fitView, nodes.length, nodesInitialized]);

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
          pathOptions: {
            borderRadius: 18,
            offset: 18,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 26,
            height: 26,
            color: presentation.stroke,
          },
          style: {
            strokeWidth: presentation.strokeWidth,
            stroke: presentation.stroke,
            strokeDasharray: presentation.dashArray,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            filter: presentation.dropShadow,
          },
          labelStyle: {
            fill: presentation.labelColor,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.02em",
          },
          labelBgStyle: {
            fill: presentation.labelBackground,
            fillOpacity: 0.92,
            stroke: presentation.labelBorder,
            strokeWidth: 1,
          },
          labelBgPadding: [12, 6] as [number, number],
          labelBgBorderRadius: 999,
        };
      }),
    [activeEdgeIds, edges, hoveredEdgeId, selectedEdgeId]
  );

  return (
    <div
      className="relative h-full min-h-[720px] 
      min-w-0 flex-1 overflow-hidden rounded-2xl
       border bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_30%),
       linear-gradient(to_bottom,_rgba(255,255,255,0.98),
       _rgba(248,250,252,1))] 
       shadow-sm dark:border-slate-800/80
        dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),
        _transparent_28%),linear-gradient(to_bottom,_rgba(2,6,23,0.98),
        _rgba(15,23,42,0.98))] xl:min-h-[860px]"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        className="h-full w-full"
        style={{ width: "100%", height: "100%" }}
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
        fitViewOptions={{ padding: 0.28 }}
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
        connectionLineStyle={{ stroke: "#60a5fa", strokeWidth: 4, strokeDasharray: "8 6" }}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{
          type: "smoothstep",
          pathOptions: {
            borderRadius: 18,
            offset: 18,
          },
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
            Connect services and refine the system from the inspector.
          </p>
        </Panel>

        <Panel
          position="top-right"
          className="flex items-center gap-2 rounded-xl border bg-background/95 px-3 py-2 text-xs shadow-sm backdrop-blur"
        >
          <Button type="button" size="sm" variant="outline" onClick={() => void fitView({ padding: 0.28, duration: 350 })}>
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
          className="!border !bg-background/95 dark:!border-slate-700"
          nodeColor={(node) => {
            const category = (node.data?.category ?? "service") as keyof typeof architectureCategoryStyles;
            return architectureCategoryStyles[category].minimap;
          }}
        />
        <Controls position="bottom-right" />
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="var(--border)" />
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
