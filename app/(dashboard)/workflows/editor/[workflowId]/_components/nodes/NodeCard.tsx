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
        "flex w-[400px] flex-col gap-1 rounded-md border-2 border-separate bg-background text-xs transition-colors",
        isSelected && "border-primary",
        status === "success" && "border-emerald-500/70",
        status === "error" && "border-destructive"
      )}
    >
      {children}
    </div>
  );
}

export default NodeCard;
