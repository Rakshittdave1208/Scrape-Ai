"use client";

import "@xyflow/react/dist/style.css";

import { useCallback, useEffect } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import {
  AlertTriangleIcon,
  ExpandIcon,
  Minimize2Icon,
  PlayIcon,
  RefreshCcwIcon,
  SaveIcon,
  SparklesIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";

import type { WorkflowForEditor } from "./Editor";
import { nodeTypes } from "./canvas/nodeTypes";
import { Button } from "@/components/ui/button";
import { WORKFLOW_SNAP_GRID } from "@/lib/workflow/graph";
import { useWorkflowCanvas } from "@/hooks/useWorkflowCanvas";

const fitViewOptions = { padding: 0.16 };
const CANVAS_PAN_STEP = 120;

export default function FlowEditor({
  workflow,
  isFullscreen,
  onToggleFullscreen,
}: {
  workflow: WorkflowForEditor;
  isFullscreen: boolean;
  onToggleFullscreen: () => void | Promise<void>;
}) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    canConnect,
    onDrop,
    syncViewportState,
    saveToLocalStorage,
    loadFromLocalStorage,
    loadDemoWorkflow,
    clearCanvas,
    runWorkflow,
    creditsRemaining,
    executionLogs,
    executionError,
    clearBrokenState,
    contextMenuPosition,
    openContextMenu,
    closeContextMenu,
    deleteContextNode,
  } = useWorkflowCanvas({
    workflowId: workflow.id,
    definition: workflow.definition,
  });
  const { getViewport, setViewport } = useReactFlow();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      const tag = target.tagName.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        target.isContentEditable
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      let deltaX = 0;
      let deltaY = 0;

      switch (event.key) {
        case "ArrowLeft":
          deltaX = CANVAS_PAN_STEP;
          break;
        case "ArrowRight":
          deltaX = -CANVAS_PAN_STEP;
          break;
        case "ArrowUp":
          deltaY = CANVAS_PAN_STEP;
          break;
        case "ArrowDown":
          deltaY = -CANVAS_PAN_STEP;
          break;
        default:
          return;
      }

      event.preventDefault();
      const viewport = getViewport();
      void setViewport(
        {
          x: viewport.x + deltaX,
          y: viewport.y + deltaY,
          zoom: viewport.zoom,
        },
        { duration: 120 }
      );
      syncViewportState();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [getViewport, setViewport, syncViewportState]);

  return (
    <main className="relative h-full min-h-0 flex-1 bg-background" onClick={closeContextMenu}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={canConnect}
        fitView
        fitViewOptions={fitViewOptions}
        connectionRadius={30}
        deleteKeyCode={["Backspace", "Delete"]}
        snapToGrid
        snapGrid={WORKFLOW_SNAP_GRID}
        elevateEdgesOnSelect
        elevateNodesOnSelect
        onDragOver={onDragOver}
        onDrop={onDrop}
        onMoveEnd={syncViewportState}
        onNodeDragStop={syncViewportState}
        onNodeContextMenu={(event, node) => {
          event.preventDefault();
          openContextMenu(node.id, { x: event.clientX, y: event.clientY });
        }}
      >
        <Panel
          position="top-left"
          className="flex items-center gap-2 rounded-md border bg-background/95 p-2 shadow-sm backdrop-blur"
        >
          <Button type="button" size="sm" variant="outline" onClick={saveToLocalStorage}>
            <SaveIcon size={14} />
            Save Workflow
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={loadFromLocalStorage}>
            <UploadIcon size={14} />
            Load Workflow
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={loadDemoWorkflow}>
            <SparklesIcon size={14} />
            Load Demo
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onToggleFullscreen}>
            {isFullscreen ? <Minimize2Icon size={14} /> : <ExpandIcon size={14} />}
            {isFullscreen ? "Exit Full Screen" : "Full Screen"}
          </Button>
          <Button type="button" size="sm" onClick={runWorkflow}>
            <PlayIcon size={14} />
            Execute
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={clearCanvas}>
            <RefreshCcwIcon size={14} />
            Clear Canvas
          </Button>
        </Panel>

        <Panel
          position="top-right"
          className="rounded-md border bg-background/95 px-3 py-2 text-xs shadow-sm backdrop-blur"
        >
          <span className="text-muted-foreground">Credits left:</span>{" "}
          <span className="text-sm font-semibold text-foreground">{creditsRemaining}</span>
        </Panel>

        {(executionError || executionLogs.length > 0) && (
          <Panel
            position="bottom-left"
            className="w-[320px] rounded-md border bg-background/95 p-3 text-xs shadow-sm backdrop-blur"
          >
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <AlertTriangleIcon size={14} />
              Execution
            </div>
            {executionError && <p className="mb-2 text-destructive">{executionError}</p>}
            <div className="space-y-1 text-muted-foreground">
              {executionLogs.map((log) => (
                <p key={log}>{log}</p>
              ))}
            </div>
          </Panel>
        )}

        <Controls position="bottom-right" fitViewOptions={fitViewOptions} />
        <MiniMap pannable zoomable className="!bg-background/95 !border" />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>

      {contextMenuPosition && (
        <div
          className="absolute z-50 min-w-44 rounded-md border bg-background p-1 shadow-lg"
          style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={deleteContextNode}
          >
            <Trash2Icon size={14} />
            Delete node
          </Button>
        </div>
      )}
    </main>
  );
}
