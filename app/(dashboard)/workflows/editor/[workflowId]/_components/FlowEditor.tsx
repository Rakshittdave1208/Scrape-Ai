"use client";

import type { WorkflowForEditor } from "./Editor";
import { updateWorkflow } from "@/actions/workflows/updateWorkflow";
import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import NodeComponent from "./nodes/NodeComponent";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppNode } from "@/types/appNode";
import { TaskType } from "@/types/task";
import { createFlowNode } from "@/lib/workflow/createFlowNode";

const nodeTypes = {
  appNode: NodeComponent,
};

const fitViewOptions = { padding: 1 };
const SAVE_DELAY_MS = 700;

export default function FlowEditor({
  workflow,
}: {
  workflow: WorkflowForEditor;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [viewportState, setViewportState] = useState({ x: 0, y: 0, zoom: 1 });
  const hasHydratedRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { getViewport, setViewport, screenToFlowPosition } = useReactFlow();

  useEffect(() => {
    try {
      const { nodes = [], edges = [], viewport } = JSON.parse(workflow.definition);
      setNodes(nodes);
      setEdges(edges);

      if (viewport) {
        const { x = 0, y = 0, zoom = 1 } = viewport;
        setViewport({ x, y, zoom });
        setViewportState({ x, y, zoom });
      } else {
        setViewportState({ x: 0, y: 0, zoom: 1 });
      }
    } catch {
      setNodes([]);
      setEdges([]);
      setViewportState({ x: 0, y: 0, zoom: 1 });
    } finally {
      hasHydratedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow.definition]);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const definition = JSON.stringify({
        nodes,
        edges,
        viewport: getViewport(),
      });

      void updateWorkflow(workflow.id, definition);
    }, SAVE_DELAY_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [edges, getViewport, nodes, viewportState, workflow.id]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("taskType");
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = createFlowNode(type as TaskType, position);
      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const syncViewportState = useCallback(() => {
    setViewportState(getViewport());
  }, [getViewport]);

  return (
    <main className="h-full min-h-0 flex-1">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        fitViewOptions={fitViewOptions}
        connectionRadius={30}
        deleteKeyCode={["Backspace", "Delete"]}
        elevateEdgesOnSelect
        elevateNodesOnSelect
        fitView
        onDragOver={onDragOver}
        onDrop={onDrop}
        onConnect={onConnect}
        onMoveEnd={syncViewportState}
        onNodeDragStop={syncViewportState}
      >
        <Panel
          position="top-center"
          className="rounded-md border bg-background/95 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur"
        >
          Use the task buttons to add nodes. Connect by dragging from a right dot to a left dot. Changes
          are saved automatically.
        </Panel>
        <Controls position="top-left" fitViewOptions={fitViewOptions} />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </main>
  );
}
