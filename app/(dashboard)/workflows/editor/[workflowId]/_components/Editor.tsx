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
        <section className="flex min-h-0 flex-1 overflow-hidden">
          <TaskMenu />
          <FlowEditor workflow={workflow} />
        </section>
      </div>
    </ReactFlowProvider>
  );
}

export default Editor;
