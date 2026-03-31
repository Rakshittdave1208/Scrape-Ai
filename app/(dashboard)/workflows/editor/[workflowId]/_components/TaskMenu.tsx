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
import type { TaskCategory, TaskType, WorkflowTask } from "@/types/task";
import { useEdges, useNodes, useReactFlow } from "@xyflow/react";
import { EyeIcon, PencilIcon, SparklesIcon, Trash2Icon } from "lucide-react";

const categoryTheme: Record<
  TaskCategory,
  {
    panel: string;
    badge: string;
    iconWrap: string;
  }
> = {
  Core: {
    panel: "border-sky-200/80 bg-gradient-to-br from-sky-50 via-white to-cyan-50 dark:border-sky-900/60 dark:from-sky-950/30 dark:via-background dark:to-cyan-950/20",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300",
    iconWrap: "bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:ring-sky-900/70",
  },
  Browser: {
    panel: "border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-lime-50 dark:border-emerald-900/60 dark:from-emerald-950/30 dark:via-background dark:to-lime-950/20",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300",
    iconWrap: "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:ring-emerald-900/70",
  },
  Extraction: {
    panel: "border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:border-amber-900/60 dark:from-amber-950/30 dark:via-background dark:to-orange-950/20",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300",
    iconWrap: "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:ring-amber-900/70",
  },
};

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
    <aside className="h-full overflow-y-auto border-r bg-gradient-to-b from-background via-background to-muted/25 p-3">
      <div className="sticky top-0 z-10 mb-4 rounded-xl border bg-background/95 p-4 shadow-sm backdrop-blur">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-sm">
            <SparklesIcon size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Node Types</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Workflow Builder</p>
          </div>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          Click to add or drag a node type into the workflow canvas.
        </p>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["Core", "Browser", "crud", "Extraction"]}
        className="w-full"
      >
        {Object.entries(TaskRegistryByCategory).map(([category, tasks]) => (
          <AccordionItem key={category} value={category} className="mb-3 rounded-xl border bg-background/70 px-3">
            <AccordionTrigger className="py-3 font-bold hover:no-underline">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${categoryTheme[category as TaskCategory].badge}`}>
                  {category}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-1">
              {tasks.map((task) => (
                <TaskMenuBtn key={task.type} taskType={task.type} category={category as TaskCategory} />
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}

        <AccordionItem value="crud" className="rounded-xl border bg-background/70 px-3">
          <AccordionTrigger className="py-3 font-bold hover:no-underline">
            <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-700 dark:bg-rose-950/70 dark:text-rose-300">
              Canvas
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="rounded-xl border bg-gradient-to-br from-white via-white to-slate-50 p-3 text-xs text-muted-foreground shadow-sm dark:from-background dark:via-background dark:to-slate-950/20">
              <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                <EyeIcon size={14} />
                Canvas overview
              </div>
              <p>Nodes: {nodes.length}</p>
              <p>Connections: {edges.length}</p>
              <p>Selected nodes: {selectedNodes.length}</p>
            </div>

            <div className="rounded-xl border bg-gradient-to-br from-white via-white to-slate-50 p-3 text-xs text-muted-foreground shadow-sm dark:from-background dark:via-background dark:to-slate-950/20">
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

function TaskMenuBtn({
  taskType,
  category,
}: {
  taskType: TaskType;
  category: TaskCategory;
}) {
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
    <TaskMenuButtonContent
      task={task}
      category={category}
      onAddNode={onAddNode}
      onDragStart={onDragStart}
    />
  );
}

function TaskMenuButtonContent({
  task,
  onAddNode,
  onDragStart,
  category,
}: {
  task: WorkflowTask;
  onAddNode: () => void;
  onDragStart: (event: React.DragEvent<HTMLButtonElement>) => void;
  category: TaskCategory;
}) {
  const theme = categoryTheme[category];

  return (
    <Button
      type="button"
      variant="ghost"
      className={`group flex h-auto w-full items-start justify-between gap-3 rounded-xl border px-3 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${theme.panel}`}
      draggable
      onClick={onAddNode}
      onDragStart={onDragStart}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${theme.iconWrap}`}>
          <task.icon size={18} />
        </div>
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground">{task.label}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${theme.badge}`}>
              {task.category}
            </span>
          </div>
          {task.description && (
            <p className="line-clamp-2 text-[11px] leading-4 text-muted-foreground">{task.description}</p>
          )}
        </div>
      </div>
    </Button>
  );
}

export default TaskMenu;
