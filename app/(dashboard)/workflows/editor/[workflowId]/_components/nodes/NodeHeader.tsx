"use client";

import { Button } from "@/components/ui/button";
import { TaskRegistry } from "@/lib/workflow/task/registry";
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
  const task = TaskRegistry[taskType];
  const { deleteElements, getNode, setNodes } = useReactFlow();

  return (
    <div className="drag-handle flex cursor-grab select-none items-center gap-2 p-2 active:cursor-grabbing">
      <task.icon size={16} />
      <div className="flex justify-between items-center w-full">
        <p className="text-xs font-bold uppercase text-muted-foreground">
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
            className="inline-flex select-none items-center gap-1 rounded-sm px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
