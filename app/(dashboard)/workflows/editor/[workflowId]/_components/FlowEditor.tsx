"use client";

import "@xyflow/react/dist/style.css";

import { useCallback } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
} from "@xyflow/react";
import { AlertTriangleIcon, PlayIcon, RefreshCcwIcon, SaveIcon, Trash2Icon, UploadIcon } from "lucide-react";

import type { WorkflowForEditor } from "./Editor";
import { nodeTypes } from "./canvas/nodeTypes";
import { Button } from "@/components/ui/button";
import { WORKFLOW_SNAP_GRID } from "@/lib/workflow/graph";
import { useWorkflowCanvas } from "@/hooks/useWorkflowCanvas";

const fitViewOptions = { padding: 0.16 };

export default function FlowEditor({
  workflow,
}: {
  workflow: WorkflowForEditor;
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

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <main className="relative h-full min-h-0 flex-1" onClick={closeContextMenu}>
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
          <Button type="button" size="sm" onClick={runWorkflow}>
            <PlayIcon size={14} />
            Execute
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={clearBrokenState}>
            <RefreshCcwIcon size={14} />
            Reset
          </Button>
        </Panel>

        <Panel
          position="top-center"
          className="rounded-md border bg-background/95 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur"
        >
          Drag node types from the sidebar, connect matching handles, save locally or to the workflow
          definition, and run the graph when ready.
        </Panel>

        <Panel
          position="top-right"
          className="rounded-md border bg-background/95 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur"
        >
          Credits remaining: <span className="font-semibold text-foreground">{creditsRemaining}</span>
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
