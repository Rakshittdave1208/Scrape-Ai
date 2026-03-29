"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { TaskRegistryByCategory } from "@/lib/workflow/task/registry";
import { createFlowNode } from "@/lib/workflow/createFlowNode";
import type { AppNode } from "@/types/appNode";
import type { TaskType } from "@/types/task";
import { useEdges, useNodes, useReactFlow } from "@xyflow/react";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";

function TaskMenu() {
  const nodes = useNodes<AppNode>();
  const edges = useEdges();
  const selectedNodes = nodes.filter((node) => node.selected);
  const { deleteElements, setEdges } = useReactFlow();

  const deleteSelectedNodes = () => {
    if (selectedNodes.length === 0) {
      return;
    }

    void deleteElements({
      nodes: selectedNodes.map((node) => ({ id: node.id })),
    });
  };

  return (
    <aside className="h-full overflow-y-auto border-r bg-card/40 p-2.5 px-3">
      <Accordion
        type="multiple"
        defaultValue={["Core", "Browser", "crud", "Extraction"]}
        className="w-full"
      >
        {Object.entries(TaskRegistryByCategory).map(([category, tasks]) => (
          <AccordionItem key={category} value={category}>
            <AccordionTrigger className="font-bold">{category}</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-1">
              {tasks.map((task) => (
                <TaskMenuBtn key={task.type} taskType={task.type} />
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}

        <AccordionItem value="crud">
          <AccordionTrigger className="font-bold">Canvas</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="rounded-md border bg-secondary/40 p-2.5 text-xs text-muted-foreground">
              <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                <EyeIcon size={14} />
                Canvas overview
              </div>
              <p>Nodes: {nodes.length}</p>
              <p>Connections: {edges.length}</p>
              <p>Selected nodes: {selectedNodes.length}</p>
            </div>

            <div className="rounded-md border bg-secondary/40 p-2.5 text-xs text-muted-foreground">
              <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                <PencilIcon size={14} />
                Node editing
              </div>
              <p>Select a node and edit its inputs directly in the node card.</p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={() => setEdges([])}
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
      </Accordion>
    </aside>
  );
}

function TaskMenuBtn({ taskType }: { taskType: TaskType }) {
  const { getNodes, screenToFlowPosition, setNodes } = useReactFlow();
  const task = Object.values(TaskRegistryByCategory)
    .flat()
    .find((item) => item.type === taskType);

  if (!task) {
    return null;
  }

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
      className="flex w-full items-center justify-between gap-2 border px-3 text-left"
      draggable
      onClick={onAddNode}
      onDragStart={onDragStart}
    >
      <div className="flex items-center gap-2">
        <task.icon size={18} />
        <div className="flex flex-col items-start">
          <span>{task.label}</span>
          {task.description && <span className="text-[11px] text-muted-foreground">{task.description}</span>}
        </div>
      </div>
    </Button>
  );
}

export default TaskMenu;
