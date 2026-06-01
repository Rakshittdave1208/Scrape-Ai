"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { getTaskRegistryByCategory } from "@/lib/workflow/task/registry";
import { createFlowNode } from "@/lib/workflow/createFlowNode";
import type { AppNode } from "@/types/appNode";
import type { TaskCategory, TaskType, WorkflowTask } from "@/types/task";
import { useEdges, useNodes, useReactFlow } from "@xyflow/react";
import {
  ChevronRightIcon,
  EyeIcon,
  PencilIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import { CustomNode } from "@/lib/generated/prisma";

const categoryTheme: Record<
  string,
  {
    panel: string;
    badge: string;
    iconWrap: string;
    accent: string;
  }
> = {
  Core: {
    panel: "border-violet-200 bg-gradient-to-br from-violet-50 via-background to-fuchsia-50 hover:border-violet-300 dark:border-violet-900/50 dark:from-violet-950/70 dark:via-zinc-950 dark:to-fuchsia-950/35 dark:hover:border-violet-700/70",
    badge: "bg-violet-500/12 text-violet-700 ring-1 ring-violet-500/20 dark:bg-violet-500/15 dark:text-violet-200 dark:ring-violet-500/30",
    iconWrap: "bg-violet-500/12 text-violet-700 ring-violet-500/20 dark:bg-violet-500/15 dark:text-violet-200 dark:ring-violet-500/30",
    accent: "bg-violet-400",
  },
  "User Interactions": {
    panel: "border-emerald-200 bg-gradient-to-br from-emerald-50 via-background to-lime-50 hover:border-emerald-300 dark:border-emerald-900/50 dark:from-emerald-950/70 dark:via-zinc-950 dark:to-lime-950/35 dark:hover:border-emerald-700/70",
    badge: "bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/30",
    iconWrap: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/30",
    accent: "bg-emerald-400",
  },
  "Data Extraction": {
    panel: "border-amber-200 bg-gradient-to-br from-amber-50 via-background to-orange-50 hover:border-amber-300 dark:border-amber-900/50 dark:from-amber-950/70 dark:via-zinc-950 dark:to-orange-950/35 dark:hover:border-amber-700/70",
    badge: "bg-amber-500/12 text-amber-700 ring-1 ring-amber-500/20 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/30",
    iconWrap: "bg-amber-500/12 text-amber-700 ring-emerald-500/20 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/30",
    accent: "bg-amber-400",
  },
  "Data Storage": {
    panel: "border-cyan-200 bg-gradient-to-br from-cyan-50 via-background to-sky-50 hover:border-cyan-300 dark:border-cyan-900/50 dark:from-cyan-950/70 dark:via-zinc-950 dark:to-sky-950/35 dark:hover:border-cyan-700/70",
    badge: "bg-cyan-500/12 text-cyan-700 ring-1 ring-cyan-500/20 dark:bg-cyan-500/15 dark:text-cyan-200 dark:ring-cyan-500/30",
    iconWrap: "bg-cyan-500/12 text-cyan-700 ring-cyan-500/20 dark:bg-cyan-500/15 dark:text-cyan-200 dark:ring-cyan-500/30",
    accent: "bg-cyan-400",
  },
  "Timing Controls": {
    panel: "border-rose-200 bg-gradient-to-br from-rose-50 via-background to-pink-50 hover:border-rose-300 dark:border-rose-900/50 dark:from-rose-950/70 dark:via-zinc-950 dark:to-pink-950/35 dark:hover:border-rose-700/70",
    badge: "bg-rose-500/12 text-rose-700 ring-1 ring-rose-500/20 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-500/30",
    iconWrap: "bg-rose-500/12 text-rose-700 ring-rose-500/20 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-500/30",
    accent: "bg-rose-400",
  },
  "Result Delivery": {
    panel: "border-indigo-200 bg-gradient-to-br from-indigo-50 via-background to-violet-50 hover:border-indigo-300 dark:border-indigo-900/50 dark:from-indigo-950/70 dark:via-zinc-950 dark:to-violet-950/35 dark:hover:border-indigo-700/70",
    badge: "bg-indigo-500/12 text-indigo-700 ring-1 ring-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-200 dark:ring-indigo-500/30",
    iconWrap: "bg-indigo-500/12 text-indigo-700 ring-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-200 dark:ring-indigo-500/30",
    accent: "bg-indigo-400",
  },
  "Custom Nodes": {
    panel: "border-blue-200 bg-gradient-to-br from-blue-50 via-background to-sky-50 hover:border-blue-300 dark:border-blue-900/50 dark:from-blue-950/70 dark:via-zinc-950 dark:to-sky-950/35 dark:hover:border-blue-700/70",
    badge: "bg-blue-500/12 text-blue-700 ring-1 ring-blue-500/20 dark:bg-blue-500/15 dark:text-blue-200 dark:ring-blue-500/30",
    iconWrap: "bg-blue-500/12 text-blue-700 ring-blue-500/20 dark:bg-blue-500/15 dark:text-blue-200 dark:ring-blue-500/30",
    accent: "bg-blue-400",
  },
};

function TaskMenu({ customNodes = [] }: { customNodes: CustomNode[] }) {
  const nodes = useNodes<AppNode>();
  const edges = useEdges();
  const selectedNodes = nodes.filter((node) => node.selected);
  const { deleteElements, setEdges } = useReactFlow();

  const registryByCategory = getTaskRegistryByCategory(customNodes);

  const deleteSelectedNodes = () => {
    if (selectedNodes.length === 0) {
      return;
    }

    void deleteElements({
      nodes: selectedNodes.map((node) => ({ id: node.id })),
    });
  };

  return (
    <aside className="h-full overflow-y-auto border-r bg-background p-3 text-foreground dark:border-zinc-800 dark:bg-[#0f0c0c] dark:text-zinc-100">
      <div className="sticky top-0 z-10 mb-4 rounded-none border bg-card/95 p-4 shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-[#151111]/95">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-none bg-gradient-to-br from-violet-500 via-fuchsia-500 to-emerald-400 text-white shadow-[0_12px_26px_rgba(34,197,94,0.2)]">
            <SparklesIcon size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground dark:text-white">Node Types</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground dark:text-zinc-500">Workflow Builder</p>
          </div>
        </div>
        <p className="text-xs leading-5 text-muted-foreground dark:text-zinc-400">
          Click to add or drag a node type into the workflow canvas.
        </p>
      </div>

      <Accordion
        type="multiple"
        defaultValue={[
          "Core",
          "User Interactions",
          "Data Extraction",
          "Data Storage",
          "Timing Controls",
          "Result Delivery",
          "Custom Nodes",
          "crud",
        ]}
        className="w-full"
      >
        {Object.entries(registryByCategory).map(([category, tasks]) => (
          <AccordionItem
            key={category}
            value={category}
            className="mb-3 rounded-none border bg-card/80 px-3 dark:border-zinc-800 dark:bg-[#151111]"
          >
            <AccordionTrigger className="py-3 font-bold text-foreground hover:no-underline dark:text-zinc-100">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${categoryTheme[category]?.badge || categoryTheme["Custom Nodes"].badge}`}>
                  {category}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-1">
              {tasks.map((task) => (
                <TaskMenuBtn 
                  key={task.type} 
                  task={task}
                  category={category} 
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}

        <AccordionItem value="crud" className="rounded-none border bg-card/80 px-3 dark:border-zinc-800 dark:bg-[#151111]">
          <AccordionTrigger className="py-3 font-bold text-foreground hover:no-underline dark:text-zinc-100">
            <span className="rounded-full bg-rose-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-200 ring-1 ring-rose-500/30">
              Canvas
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="rounded-none border bg-background/80 p-3 text-xs text-muted-foreground shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400">
              <div className="mb-2 flex items-center gap-2 font-medium text-foreground dark:text-zinc-100">
                <EyeIcon size={14} />
                Canvas overview
              </div>
              <p>Nodes: {nodes.length}</p>
              <p>Connections: {edges.length}</p>
              <p>Selected nodes: {selectedNodes.length}</p>
            </div>

            <div className="rounded-none border bg-background/80 p-3 text-xs text-muted-foreground shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400">
              <div className="mb-2 flex items-center gap-2 font-medium text-foreground dark:text-zinc-100">
                <PencilIcon size={14} />
                Node editing
              </div>
              <p>Select a node and edit its inputs directly in the node card.</p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full justify-start border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
              onClick={() => setEdges([])}
              disabled={edges.length === 0}
            >
              <Trash2Icon size={16} />
              Clear all connections
            </Button>

            <Button
              type="button"
              variant="destructive"
              className="w-full justify-start bg-rose-500/90 text-white hover:bg-rose-500"
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
  task,
  category,
}: {
  task: WorkflowTask;
  category: string;
}) {
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

    const newNode = createFlowNode(task.type, position, task);
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
  category: string;
}) {
  const theme = categoryTheme[category] || categoryTheme["Custom Nodes"];

  return (
    <Button
      type="button"
      variant="ghost"
      className={`group flex h-auto w-full items-start justify-between gap-3 rounded-none border px-3 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${theme.panel}`}
      draggable
      onClick={onAddNode}
      onDragStart={onDragStart}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-none ring-1 ${theme.iconWrap}`}>
          <task.icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="line-clamp-2 break-words text-sm font-semibold leading-5 text-foreground dark:text-zinc-100">
              {task.label}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${theme.badge}`}>
              {category}
            </span>
          </div>
          {task.description && (
            <p className="line-clamp-3 break-words text-[11px] leading-4 text-muted-foreground dark:text-zinc-400">{task.description}</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="rounded-full border border-border bg-background/80 px-2 py-1 text-[11px] font-semibold text-muted-foreground dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-300">
          {task.credits}
        </span>
        <div className={`h-2.5 w-2.5 rounded-full ${theme.accent}`} />
        <ChevronRightIcon size={14} className="text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground dark:text-zinc-500 dark:group-hover:text-zinc-300" />
      </div>
    </Button>
  );
}

export default TaskMenu;
