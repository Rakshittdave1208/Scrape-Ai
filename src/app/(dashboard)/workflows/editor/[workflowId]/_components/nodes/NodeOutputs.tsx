"use client";

import { cn } from "@/lib/utils";
import { TaskParam } from "@/types/task";
import { Handle, Position, useEdges } from "@xyflow/react";
import { ColorForHandle } from "./common";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function NodeOutputs({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col divide-y divide-slate-200/80 gap-2 dark:divide-slate-800/80">{children}</div>;
}

export function NodeOutput({ output, nodeId }: { output: TaskParam; nodeId: string }) {
  const edges = useEdges();
  const isConnected = edges.some((edge) => edge.source === nodeId && edge.sourceHandle === output.name);

  return (
    <div className="relative flex justify-end bg-gradient-to-r from-slate-50 via-white to-slate-50 p-3 dark:from-slate-950/80 dark:via-slate-900/80 dark:to-slate-950/80">
      <div className="flex w-full flex-col items-end gap-2 text-right">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{output.type}</p>
              <Badge variant="outline" className="text-[11px] uppercase tracking-[0.08em]">
                Output
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            {output.helperText ?? `${output.name} emits ${output.type.toLowerCase()} data.`}
          </TooltipContent>
        </Tooltip>
        <p className="text-sm leading-6 text-muted-foreground">{output.name}</p>
      </div>
      <Handle
        id={output.name}
        type="source"
        position={Position.Right}
        className={cn(
          "!z-20 !-right-4 !h-6 !w-6 !rounded-full !border-2 !border-background !bg-muted-foreground shadow-md transition-all",
          isConnected && "!ring-4 !ring-primary/30",
          ColorForHandle[output.type]
        )}
      />
    </div>
  );
}
