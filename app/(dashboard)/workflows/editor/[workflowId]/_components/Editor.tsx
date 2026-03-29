"use client";

import React from "react";
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
  return (
    <ReactFlowProvider>
      <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden rounded-lg border bg-background">
        <section className="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)] overflow-hidden xl:grid-cols-[292px_minmax(0,1fr)]">
          <TaskMenu />
          <FlowEditor workflow={workflow} />
        </section>
      </div>
    </ReactFlowProvider>
  );
}

export default Editor;
