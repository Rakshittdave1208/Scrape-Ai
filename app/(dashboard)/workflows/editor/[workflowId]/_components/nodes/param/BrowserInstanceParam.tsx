"use client";

import { Badge } from "@/components/ui/badge";
import { TaskParam } from "@/types/task";
import { CheckCircle2Icon, GlobeIcon, Link2Icon } from "lucide-react";

function BrowserInstanceParam({
  param,
  isConnected = false,
  readOnly = true,
}: {
  param: TaskParam;
  isConnected?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className="nodrag w-full rounded-md border border-dashed border-border/80 bg-muted/20 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <GlobeIcon size={14} className="text-amber-500" />
          <p className="text-xs font-medium">{param.name}</p>
        </div>
        <Badge variant="outline" className="gap-1 text-[10px] uppercase tracking-wide">
          {isConnected ? <CheckCircle2Icon size={10} /> : <Link2Icon size={10} />}
          {isConnected ? "Connected" : readOnly ? "Port only" : "Read only"}
        </Badge>
      </div>
      <p className="text-[11px] text-muted-foreground">
        {isConnected
          ? "This browser input is already supplied by another node in the workflow graph."
          : "Connect this input from another node. This value is provided through the workflow graph."}
      </p>
    </div>
  );
}

export default BrowserInstanceParam;
