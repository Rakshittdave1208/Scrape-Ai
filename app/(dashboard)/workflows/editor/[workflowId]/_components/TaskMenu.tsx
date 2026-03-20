"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import { TaskType } from "@/types/task";
import { Button } from "@/components/ui/button";
import { createFlowNode } from "@/lib/workflow/createFlowNode";
import { AppNode } from "@/types/appNode";
import { useEdges, useNodes, useReactFlow } from "@xyflow/react";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";

function TaskMenu() {
  const nodes = useNodes<AppNode>();
  const edges = useEdges();
  const selectedNodes = nodes.filter((node) => node.selected);
  const { deleteElements, setEdges } = useReactFlow();

  const deleteSelectedNodes = () => {
    if (selectedNodes.length === 0) return;

    void deleteElements({
      nodes: selectedNodes.map((node) => ({ id: node.id })),
    });
  };

  const clearAllConnections = () => {
    setEdges([]);
  };

  return (
    <aside className="w-[340px] min-w-[340px] max-w-[340px] border-r-2 border-separate h-full p-2 px-4 overflow-auto">
      <Accordion
        type="multiple"
        defaultValue={["browser", "crud", "extraction"]}
        className="w-full"
      >
        <AccordionItem value="browser">
          <AccordionTrigger className="font-bold">Browser</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-1">
            <TaskMenuBtn taskType={TaskType.LAUNCH_BROWSER} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="crud">
          <AccordionTrigger className="font-bold">CRUD operations</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="rounded-md border bg-secondary/40 p-3 text-xs text-muted-foreground">
              <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                <EyeIcon size={14} />
                Canvas overview
              </div>
              <p>Nodes: {nodes.length}</p>
              <p>Connections: {edges.length}</p>
              <p>Selected nodes: {selectedNodes.length}</p>
            </div>

            <div className="rounded-md border bg-secondary/40 p-3 text-xs text-muted-foreground">
              <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                <PencilIcon size={14} />
                Update selected node
              </div>
              <p>
                Select a node on the canvas, then edit its fields directly inside the node card.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={clearAllConnections}
              disabled={edges.length === 0}
            >
              <Trash2Icon size={16} />
              Clear all connections
            </Button>

            <Button
              type="button"
              variant="destructive"
              className="w-full justify-start"
              onClick={deleteSelectedNodes}
              disabled={selectedNodes.length === 0}
            >
              <Trash2Icon size={16} />
              Delete selected nodes
            </Button>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="extraction">
          <AccordionTrigger className="font-bold">
            Data extraction
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-1">
            <TaskMenuBtn taskType={TaskType.PAGE_TO_HTML} />
            <TaskMenuBtn taskType={TaskType.EXTRACT_TEXT_FROM_ELEMENT} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}

function TaskMenuBtn({ taskType }: { taskType: TaskType }) {
  const task = TaskRegistry[taskType];
  const { getNodes, screenToFlowPosition, setNodes } = useReactFlow();

  const onDragStart = (event: React.DragEvent<HTMLButtonElement>) => {
    event.dataTransfer.setData("taskType", task.type);
    event.dataTransfer.effectAllowed = "move";
  };

  const onAddNode = () => {
    const flowElement = document.querySelector(".react-flow");
    const rect = flowElement?.getBoundingClientRect();
    const existingNodes = getNodes();
    const offset = existingNodes.length * 24;

    const position = screenToFlowPosition({
      x: rect ? rect.left + rect.width / 2 + offset : window.innerWidth / 2 + offset,
      y: rect ? rect.top + rect.height / 2 + offset : window.innerHeight / 2 + offset,
    });

    const newNode = createFlowNode(task.type, position);
    setNodes((currentNodes) => currentNodes.concat(newNode));
  };

  return (
    <Button
      type="button"
      variant="secondary"
      className="flex w-full items-center justify-between gap-2 border"
      draggable
      onClick={onAddNode}
      onDragStart={onDragStart}
    >
      <div className="flex gap-2">
        <task.icon size={20} />
        {task.label}
      </div>
    </Button>
  );
}

export default TaskMenu;
