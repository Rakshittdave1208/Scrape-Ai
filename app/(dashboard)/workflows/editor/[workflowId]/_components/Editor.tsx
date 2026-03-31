"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import FlowEditor from "./FlowEditor";
import { ReactFlowProvider } from "@xyflow/react";
import TaskMenu from "./TaskMenu";

export type WorkflowForEditor = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  definition: string;
  status: string;
};

function Editor({ workflow }: { workflow: WorkflowForEditor }) {
  const editorShellRef = useRef<HTMLElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  return (
    <ReactFlowProvider>
      <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden rounded-lg border bg-background">
        <section
          ref={editorShellRef}
          className="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)] overflow-hidden bg-background xl:grid-cols-[292px_minmax(0,1fr)]"
        >
          <TaskMenu />
          <FlowEditor
            workflow={workflow}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />
        </section>
      </div>
    </ReactFlowProvider>
  );
}

export default Editor;
