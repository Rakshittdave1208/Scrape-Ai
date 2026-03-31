"use client";

import { memo } from "react";
import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react";
import { ActivityIcon, CableIcon, GripHorizontalIcon, Settings2Icon } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { ArchitectureNode } from "@/lib/workflow/backendArchitecture";
import { cn } from "@/lib/utils";
import { architectureCategoryStyles, architectureStatusStyles } from "../shared";

const ArchitectureNode = memo(({ id, data, selected }: NodeProps<ArchitectureNode>) => {
  const { setNodes } = useReactFlow<ArchitectureNode>();
  const category = (data.category ?? "service") as keyof typeof architectureCategoryStyles;
  const styles = architectureCategoryStyles[category];
  const status = architectureStatusStyles[data.status ?? "idle"];

  return (
    <div
      className={cn(
        "relative w-[300px] rounded-2xl border-2 px-5 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition-all sm:w-[320px]",
        styles.card,
        selected && "ring-4 ring-primary/15"
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={cn("!h-3.5 !w-3.5 !border-2 !border-background", styles.handle)}
      />
      <Handle
        type="target"
        position={Position.Top}
        className={cn("!h-3.5 !w-3.5 !border-2 !border-background", styles.handle)}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={cn("!h-3.5 !w-3.5 !border-2 !border-background", styles.handle)}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn("!h-3.5 !w-3.5 !border-2 !border-background", styles.handle)}
      />

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-current/65">
              <GripHorizontalIcon size={13} />
              <span>Architecture Node</span>
            </div>
            <h3 className="text-base font-semibold leading-tight">{String(data.label)}</h3>
            <Input
              value={data.technology ?? ""}
              placeholder="Type database or service technology"
              className="nodrag h-8 border-current/15 bg-background/90 text-xs font-medium text-foreground placeholder:text-muted-foreground"
              onChange={(event) => {
                const nextValue = event.target.value;
                setNodes((currentNodes) =>
                  currentNodes.map((node) =>
                    node.id === id
                      ? {
                          ...node,
                          data: {
                            ...node.data,
                            technology: nextValue,
                          },
                        }
                      : node
                  )
                );
              }}
            />
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                styles.pill
              )}
            >
              {String(data.category)}
            </span>
            <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold", status)}>
              {String(data.status)}
            </span>
          </div>
        </div>

        <p className="text-sm leading-6 text-current/80">{String(data.description)}</p>

        <div className="grid grid-cols-3 gap-2 text-xs text-current/75">
          <div className="rounded-xl border border-current/15 bg-background/60 px-3 py-2">
            <div className="flex items-center gap-2 font-semibold text-current">
              <ActivityIcon size={13} />
              {data.cost} cr
            </div>
            <p className="mt-1 text-[11px]">run cost</p>
          </div>
          <div className="rounded-xl border border-current/15 bg-background/60 px-3 py-2">
            <div className="flex items-center gap-2 font-semibold text-current">
              <Settings2Icon size={13} />
              {Object.keys(data.config ?? {}).length}
            </div>
            <p className="mt-1 text-[11px]">config keys</p>
          </div>
          <div className="rounded-xl border border-current/15 bg-background/60 px-3 py-2">
            <div className="flex items-center gap-2 font-semibold text-current">
              <CableIcon size={13} />
              Ready
            </div>
            <p className="mt-1 text-[11px]">connectable</p>
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-current/15 bg-background/70 px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-current/65">Node Input</p>
          <Input
            value={data.input ?? ""}
            placeholder="Type architecture details here"
            className="nodrag border-current/15 bg-background/90 text-sm text-foreground placeholder:text-muted-foreground"
            onChange={(event) => {
              const nextValue = event.target.value;
              setNodes((currentNodes) =>
                currentNodes.map((node) =>
                  node.id === id
                    ? {
                        ...node,
                        data: {
                          ...node.data,
                          input: nextValue,
                        },
                      }
                    : node
                )
              );
            }}
          />
          <p className="text-[11px] text-current/65">Use this inline field for notes, runtime values, or service details.</p>
        </div>
      </div>
    </div>
  );
});

ArchitectureNode.displayName = "ArchitectureNode";

export default ArchitectureNode;
