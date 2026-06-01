"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckIcon,
  ExpandIcon,
  Minimize2Icon,
  PlayIcon,
  SaveIcon,
  SparklesIcon,
  UploadIcon,
} from "lucide-react";
import { ReactFlowProvider } from "@xyflow/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import FlowEditor, { type FlowEditorHandle } from "./FlowEditor";
import TaskMenu from "./TaskMenu";
import { CustomNode } from "@/lib/generated/prisma";

export type WorkflowForEditor = {
  id: string;
  createdById: string;
  name: string;
  description: string | null;
  definition: string;
  status: string;
};

function Editor({ 
  workflow,
  customNodes = [] 
}: { 
  workflow: WorkflowForEditor,
  customNodes: CustomNode[]
}) {
  const editorShellRef = useRef<HTMLElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const flowEditorRef = useRef<FlowEditorHandle | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeView, setActiveView] = useState<"editor" | "runs">("editor");
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === editorShellRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const element = editorShellRef.current;

    if (!element) {
      return;
    }

    if (document.fullscreenElement === element) {
      await document.exitFullscreen();
      return;
    }

    await element.requestFullscreen();
  }, []);

  useEffect(() => {
    if (!isResizing) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const workspace = workspaceRef.current;

      if (!workspace) {
        return;
      }

      const bounds = workspace.getBoundingClientRect();
      const nextWidth = event.clientX - bounds.left;
      const maxWidth = Math.max(360, bounds.width * 0.45);

      setSidebarWidth(Math.min(Math.max(nextWidth, 300), maxWidth));
    };

    const stopResizing = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResizing);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResizing);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  return (
    <ReactFlowProvider>
      <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden rounded-none border bg-card/90 text-foreground shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur dark:border-zinc-800 dark:bg-[#090707] dark:text-zinc-100 dark:shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
        <section ref={editorShellRef} className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background dark:bg-[#090707]">
          <header className="border-b bg-card/95 px-5 py-4 backdrop-blur dark:border-zinc-800 dark:bg-[#0f0c0c]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-3">
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="mt-0.5 h-9 w-9 rounded-none border bg-background/90 text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  <Link href="/workflows">
                    <ArrowLeftIcon size={16} />
                  </Link>
                </Button>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold tracking-wide text-foreground dark:text-zinc-50">Workflow editor</p>
                    <Badge className="border-border bg-background text-muted-foreground hover:bg-background dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900">
                      {workflow.status}
                    </Badge>
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-foreground dark:text-white">{workflow.name}</h1>
                    <p className="text-sm text-muted-foreground dark:text-zinc-400">
                      {workflow.description || "Visual automation graph ready to edit and execute."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 xl:items-end">
                <div className="flex rounded-none border border-border bg-muted/60 p-1 dark:border-zinc-800 dark:bg-zinc-950/80">
                  <button
                    type="button"
                    onClick={() => setActiveView("editor")}
                    className={`min-w-28 rounded-none px-5 py-2 text-sm font-medium transition ${
                      activeView === "editor"
                        ? "bg-background text-foreground shadow-sm dark:bg-zinc-800 dark:text-white"
                        : "text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView("runs")}
                    className={`min-w-28 rounded-none px-5 py-2 text-sm font-medium transition ${
                      activeView === "runs"
                        ? "bg-background text-foreground shadow-sm dark:bg-zinc-800 dark:text-white"
                        : "text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    Runs
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <div className="rounded-none border border-border bg-background/90 px-3 py-2 text-xs text-muted-foreground dark:border-zinc-800 dark:bg-zinc-950/90 dark:text-zinc-400">
                    Credits left <span className="font-semibold text-foreground dark:text-white">10,000</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-white"
                    onClick={() => flowEditorRef.current?.loadDemo()}
                  >
                    <SparklesIcon size={14} />
                    Demo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-white"
                    onClick={() => flowEditorRef.current?.loadLocal()}
                  >
                    <UploadIcon size={14} />
                    Load
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-white"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? <Minimize2Icon size={14} /> : <ExpandIcon size={14} />}
                    {isFullscreen ? "Exit Full Screen" : "Full Screen"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-white"
                    onClick={() => flowEditorRef.current?.saveLocal()}
                  >
                    <SaveIcon size={14} />
                    Save
                  </Button>
                  <Button
                    type="button"
                    className="bg-emerald-500 text-black hover:bg-emerald-400"
                    onClick={() => flowEditorRef.current?.execute()}
                  >
                    <PlayIcon size={14} />
                    Execute
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60 dark:hover:text-emerald-50"
                    onClick={() => flowEditorRef.current?.publish()}
                  >
                    <CheckIcon size={14} />
                    Publish
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <div
            ref={workspaceRef}
            className="grid min-h-0 flex-1 overflow-hidden bg-background dark:bg-[#090707]"
            style={{ gridTemplateColumns: `${sidebarWidth}px 10px minmax(0,1fr)` }}
          >
            <TaskMenu customNodes={customNodes} />
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize workflow sidebar"
              tabIndex={0}
              className={cn(
                "group relative flex h-full cursor-col-resize items-center justify-center bg-muted/70 transition dark:bg-zinc-950/80",
                isResizing && "bg-accent dark:bg-zinc-900"
              )}
              onPointerDown={(event) => {
                event.preventDefault();
                setIsResizing(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  setSidebarWidth((current) => Math.max(current - 20, 300));
                }

                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  const workspace = workspaceRef.current;
                  const maxWidth = workspace ? Math.max(360, workspace.getBoundingClientRect().width * 0.45) : 520;
                  setSidebarWidth((current) => Math.min(current + 20, maxWidth));
                }
              }}
            >
              <div className="h-full w-px bg-border transition group-hover:bg-emerald-400 group-focus-visible:bg-emerald-400 dark:bg-zinc-800" />
              <div className="absolute flex h-12 w-3 items-center justify-center rounded-full border bg-background/95 shadow-lg dark:border-zinc-800 dark:bg-zinc-950/95">
                <div className="space-y-1">
                  <div className="h-1 w-1 rounded-full bg-muted-foreground group-hover:bg-emerald-400 dark:bg-zinc-500" />
                  <div className="h-1 w-1 rounded-full bg-muted-foreground group-hover:bg-emerald-400 dark:bg-zinc-500" />
                  <div className="h-1 w-1 rounded-full bg-muted-foreground group-hover:bg-emerald-400 dark:bg-zinc-500" />
                </div>
              </div>
            </div>
            <FlowEditor ref={flowEditorRef} workflow={workflow} activeView={activeView} />
          </div>
        </section>
      </div>
    </ReactFlowProvider>
  );
}

export default Editor;
