"use client";

import { cn } from "@/lib/utils";
import { TaskParam, TaskParamType } from "@/types/task";
import { Handle, Position, useEdges } from "@xyflow/react";
import NodeParamField from "./NodeParamField";
import { ColorForHandle } from "./common";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function NodeInputs({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col divide-y gap-2">{children}</div>;
}

export function NodeInput({
  input,
  nodeId,
}: {
  input: TaskParam;
  nodeId: string;
}) {
  const edges = useEdges();
  const isConnected = !input.hideHandle && edges.some(
    (edge) => edge.target === nodeId && edge.targetHandle === input.name
  );
  const isBrowserInstance = input.type === TaskParamType.BROWSER_INSTANCE;
  const isManualInput = input.type === TaskParamType.STRING && input.hideHandle;
  const isPortOnlyInput = isBrowserInstance || (input.type !== TaskParamType.STRING && !input.hideHandle);
  const statusLabel = isConnected
    ? "Connected"
    : isManualInput
      ? "Manual"
      : isPortOnlyInput
        ? "Port only"
        : "Editable";

  return (
    <div className="relative flex w-full justify-start bg-secondary p-3">
      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center justify-between">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                  Input
                </Badge>
                <p className="text-[11px] text-muted-foreground">{input.type}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              {input.helperText ?? `${input.name} accepts ${input.type.toLowerCase()} data.`}
            </TooltipContent>
          </Tooltip>
          <p className="text-[11px] text-muted-foreground">{statusLabel}</p>
        </div>
        <NodeParamField
          param={input}
          nodeId={nodeId}
          disabled={isConnected || isBrowserInstance}
          isConnected={isConnected}
        />
      </div>
      {!input.hideHandle && (
        <Handle
          id={input.name}
          isConnectable={!isConnected}
          type="target"
          position={Position.Left}
          className={cn(
            "!z-20 !-left-4 !h-6 !w-6 !rounded-full !border-2 !border-background !bg-muted-foreground shadow-md transition-all",
            isConnected && "!ring-4 !ring-primary/30",
            ColorForHandle[input.type]
          )}
        />
      )}
    </div>
  );
}
