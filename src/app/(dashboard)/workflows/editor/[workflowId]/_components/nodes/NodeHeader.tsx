"use client";

import { Button } from "@/components/ui/button";
import { useTaskRegistry } from "@/components/providers/TaskRegistryProvider";
import { TaskType } from "@/types/task";
import { useReactFlow } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { CopyIcon, CoinsIcon, MoveHorizontalIcon, Trash2Icon } from "lucide-react";

function NodeHeader({
  taskType,
  nodeId,
  status,
}: {
  taskType: TaskType;
  nodeId: string;
  status: "idle" | "running" | "success" | "error";
}) {
  const TaskRegistry = useTaskRegistry();
  const task = TaskRegistry[taskType];
  const { deleteElements, getNode, setNodes } = useReactFlow();

  if (!task) return null;

  return (
    <div className="drag-handle flex cursor-grab select-none items-center gap-2 rounded-t-none border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-3 active:cursor-grabbing dark:border-slate-800/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <task.icon size={16} className="text-primary" />
      <div className="flex justify-between items-center w-full">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-700 dark:text-slate-200">
          {task.label}
        </p>
        <div className="flex gap-1 items-center">
          {task.isEntryPoint && <Badge className="nodrag" variant="outline">Entry point</Badge>}
          <Badge className="nodrag capitalize" variant="outline">
            {status}
          </Badge>
          <Badge className="nodrag gap-2 flex items-center text-xs" variant="outline">
            <CoinsIcon size={16} />
            {task.credits}
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="nodrag text-muted-foreground hover:text-foreground"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              const node = getNode(nodeId);
              if (!node) return;

              setNodes((currentNodes) =>
                currentNodes.concat({
                  ...node,
                  id: crypto.randomUUID(),
                  selected: false,
                  position: {
                    x: node.position.x + 40,
                    y: node.position.y + 40,
                  },
                })
              );
            }}
          >
            <CopyIcon size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="nodrag text-muted-foreground hover:text-destructive"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void deleteElements({ nodes: [{ id: nodeId }] });
            }}
          >
            <Trash2Icon size={16} />
          </Button>
          <div
            title="Drag to move node"
            aria-label="Drag to move node"
            role="button"
            tabIndex={0}
            className="inline-flex select-none items-center gap-1 rounded-none px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <MoveHorizontalIcon size={16} />
            <span>Move</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NodeHeader;
