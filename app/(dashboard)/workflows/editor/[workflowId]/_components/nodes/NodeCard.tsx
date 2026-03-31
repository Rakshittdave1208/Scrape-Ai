"use client";

import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import React from "react";

function NodeCard({
  children,
  nodeId,
  isSelected,
  status,
}: {
  children: React.ReactNode;
  nodeId: string;
  isSelected: boolean;
  status: "idle" | "running" | "success" | "error";
}) {
  const { getNode, setCenter } = useReactFlow();

  return (
    <div
      onDoubleClick={() => {
        const node = getNode(nodeId);
        if (!node) return;
        const { position, measured } = node;
        if (!position || !measured) return;
        const { width, height } = measured;
        const x = position.x + (width ?? 0) / 2;
        const y = position.y + (height ?? 0) / 2;
        setCenter(x, y, { zoom: 1, duration: 500 });
      }}
      className={cn(
        "flex w-[400px] flex-col gap-1 rounded-xl border-2 border-separate bg-white/95 text-xs shadow-lg shadow-slate-200/60 ring-1 ring-slate-200/70 transition-colors dark:bg-slate-950/95 dark:shadow-black/40 dark:ring-slate-800/80",
        isSelected && "border-primary ring-primary/30",
        status === "success" && "border-emerald-500/70 ring-emerald-500/20",
        status === "error" && "border-destructive ring-destructive/20"
      )}
    >
      {children}
    </div>
  );
}

export default NodeCard;
