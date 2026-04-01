"use client";

import "@xyflow/react/dist/style.css";

import { forwardRef, useCallback, useEffect, useImperativeHandle } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import { useTheme } from "next-themes";
import {
  AlertTriangleIcon,
  PlayIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";

import type { WorkflowForEditor } from "./Editor";
import { nodeTypes } from "./canvas/nodeTypes";
import { Button } from "@/components/ui/button";
import { WORKFLOW_SNAP_GRID } from "@/lib/workflow/graph";
import { useWorkflowCanvas } from "@/hooks/useWorkflowCanvas";

const fitViewOptions = { padding: 0.16 };
const CANVAS_PAN_STEP = 120;

export type FlowEditorHandle = {
  saveLocal: () => void;
  loadLocal: () => void;
  loadDemo: () => void;
  clearCanvas: () => void;
  execute: () => void;
  publish: () => void;
};

const FlowEditor = forwardRef<FlowEditorHandle, {
  workflow: WorkflowForEditor;
  activeView: "editor" | "runs";
}>(
function FlowEditor({
  workflow,
  activeView,
}, ref) {
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useImperativeHandle(
    ref,
    () => ({
      saveLocal: saveToLocalStorage,
      loadLocal: loadFromLocalStorage,
      loadDemo: loadDemoWorkflow,
      clearCanvas,
      execute: runWorkflow,
      publish: saveToLocalStorage,
    }),
    [clearCanvas, loadDemoWorkflow, loadFromLocalStorage, runWorkflow, saveToLocalStorage]
  );

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

  if (activeView === "runs") {
    return (
      <main className="flex min-h-0 flex-1 flex-col bg-background p-5 dark:bg-[#0b0909]">
        <div className="flex min-h-0 flex-1 flex-col rounded-2xl border bg-card/90 p-5 shadow-sm dark:border-zinc-800 dark:bg-[#111010]">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground dark:text-zinc-500">Runs</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground dark:text-white">Workflow execution history</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground dark:text-zinc-400">
                Run the workflow from the editor toolbar to populate these logs and inspect any validation errors.
              </p>
            </div>

            <Button
              type="button"
              className="bg-emerald-500 text-black hover:bg-emerald-400"
              onClick={runWorkflow}
            >
              <PlayIcon size={14} />
              Execute now
            </Button>
          </div>

          <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1.25fr)_380px]">
            <div className="min-h-[320px] rounded-2xl border bg-background/80 p-4 dark:border-zinc-800 dark:bg-[#0b0909]">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground dark:text-zinc-100">
                <SparklesIcon size={14} className="text-emerald-400" />
                Latest execution events
              </div>
              {executionLogs.length === 0 ? (
                <div className="flex h-full min-h-[240px] items-center justify-center rounded-xl border border-dashed bg-muted/30 px-6 text-center text-sm text-muted-foreground dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-500">
                  No execution logs yet. Switch to the editor view and run the workflow once to generate a run history.
                </div>
              ) : (
                <div className="space-y-3">
                  {executionLogs.map((log) => (
                    <div key={log} className="rounded-xl border bg-background px-4 py-3 text-sm text-foreground dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-200">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border bg-background/80 p-4 dark:border-zinc-800 dark:bg-[#0b0909]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground dark:text-zinc-500">Status</p>
                <p className="mt-3 text-xl font-semibold text-foreground dark:text-white">
                  {executionError ? "Needs attention" : executionLogs.length > 0 ? "Last run completed" : "Ready"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground dark:text-zinc-400">
                  {executionError || "Execution logs and node outcomes will appear here after each run."}
                </p>
              </div>

              <div className="rounded-2xl border bg-background/80 p-4 dark:border-zinc-800 dark:bg-[#0b0909]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground dark:text-zinc-500">Canvas snapshot</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border bg-background px-3 py-4 dark:border-zinc-800 dark:bg-zinc-950/70">
                    <p className="text-xs text-muted-foreground dark:text-zinc-500">Nodes</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground dark:text-white">{nodes.length}</p>
                  </div>
                  <div className="rounded-xl border bg-background px-3 py-4 dark:border-zinc-800 dark:bg-zinc-950/70">
                    <p className="text-xs text-muted-foreground dark:text-zinc-500">Edges</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground dark:text-white">{edges.length}</p>
                  </div>
                  <div className="rounded-xl border bg-background px-3 py-4 dark:border-zinc-800 dark:bg-zinc-950/70">
                    <p className="text-xs text-muted-foreground dark:text-zinc-500">Credits left</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground dark:text-white">{creditsRemaining}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative h-full min-h-0 flex-1 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.06),_transparent_28%),linear-gradient(to_bottom,_rgba(255,255,255,0.96),_rgba(248,250,252,0.98))] dark:bg-[#0b0909]"
      onClick={closeContextMenu}
    >
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
        className="bg-transparent"
      >
        <Panel
          position="top-left"
          className="rounded-xl border bg-background/95 px-4 py-3 shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-[#111010]/95"
        >
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
            <p className="text-sm font-semibold text-foreground dark:text-white">Editor canvas</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground dark:text-zinc-400">
            Build the graph visually, then switch to Runs to inspect the latest execution state.
          </p>
        </Panel>

        {(executionError || executionLogs.length > 0) && (
          <Panel
            position="bottom-left"
            className="w-[340px] rounded-xl border bg-background/95 p-3 text-xs shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-[#111010]/95"
          >
            <div className="mb-2 flex items-center gap-2 font-semibold text-foreground dark:text-white">
              <AlertTriangleIcon size={14} className="text-amber-400" />
              Execution
            </div>
            {executionError && <p className="mb-2 text-rose-400">{executionError}</p>}
            <div className="space-y-1 text-muted-foreground dark:text-zinc-400">
              {executionLogs.map((log) => (
                <p key={log}>{log}</p>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-white"
                onClick={clearBrokenState}
              >
                Clear
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-emerald-500 text-black hover:bg-emerald-400"
                onClick={runWorkflow}
              >
                Re-run
              </Button>
            </div>
          </Panel>
        )}

        <Controls
          position="bottom-right"
          fitViewOptions={fitViewOptions}
          className="!rounded-xl !border !bg-background/95 !shadow-lg dark:!border-zinc-800 dark:!bg-[#111010]/95"
        />
        <MiniMap
          pannable
          zoomable
          className="!border !bg-background/95 !shadow-lg dark:!border-zinc-800 dark:!bg-[#111010]/95"
          maskColor="rgba(0,0,0,0.15)"
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={18}
          size={1.3}
          color={isDark ? "#2a2525" : "#cbd5e1"}
        />
      </ReactFlow>

      {contextMenuPosition && (
        <div
          className="absolute z-50 min-w-44 rounded-xl border bg-background p-1 shadow-lg dark:border-zinc-800 dark:bg-[#111010]"
          style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start text-rose-400 hover:bg-rose-950/40 hover:text-rose-300"
            onClick={deleteContextNode}
          >
            <Trash2Icon size={14} />
            Delete node
          </Button>
        </div>
      )}
    </main>
  );
});

export default FlowEditor;
