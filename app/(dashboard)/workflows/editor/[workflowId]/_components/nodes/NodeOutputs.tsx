"use client";

import { cn } from "@/lib/utils";
import { TaskParam } from "@/types/task";
import { Handle, Position } from "@xyflow/react";
import { ColorForHandle } from "./common";
import { Badge } from "@/components/ui/badge";

export function NodeOutputs({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col divide-y gap-2">{children}</div>;
}

export function NodeOutput({ output }: { output: TaskParam }) {
  return (
    <div className="relative flex justify-end bg-secondary p-3">
      <div className="flex w-full flex-col items-end gap-2 text-right">
        <div className="flex items-center gap-2">
          <p className="text-[11px] text-muted-foreground">{output.type}</p>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
            Output
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{output.name}</p>
      </div>
      <Handle
        id={output.name}
        type="source"
        position={Position.Right}
        className={cn(
          "!z-20 !-right-4 !h-6 !w-6 !rounded-full !border-2 !border-background !bg-muted-foreground shadow-md",
          ColorForHandle[output.type]
        )}
      />
    </div>
  );
}
