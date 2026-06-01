"use client";

import { memo } from "react";
import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react";
import { ActivityIcon, CableIcon, GripHorizontalIcon, Settings2Icon } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { ArchitectureNode } from "@/lib/workflow/backendArchitecture";
import { cn } from "@/lib/utils";
import { architectureCategoryStyles, architectureStatusStyles, getArchitectureCategoryLabel } from "../shared";

const ArchitectureNode = memo(({ id, data, selected }: NodeProps<ArchitectureNode>) => {
  const { setNodes } = useReactFlow<ArchitectureNode>();
  const category = (data.category ?? "service") as keyof typeof architectureCategoryStyles;
  const styles = architectureCategoryStyles[category];
  const status = architectureStatusStyles[data.status ?? "idle"];

  return (
    <div
      className={cn(
        "font-canvas relative w-[300px] rounded-none border-2 px-5 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] ring-1 ring-white/60 transition-all dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)] dark:ring-slate-800/80 sm:w-[320px]",
        styles.card,
        selected && "ring-4 ring-primary/20 dark:ring-primary/30"
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
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-current/70">
              <GripHorizontalIcon size={13} />
              <span>Architecture Node</span>
            </div>
            <h3 className="text-lg font-semibold leading-snug">{String(data.label)}</h3>
            <Input
              value={data.technology ?? ""}
              placeholder="Type database or service technology"
              className="nodrag h-9 border-current/15 bg-white/85 text-sm font-medium text-foreground placeholder:text-muted-foreground dark:bg-slate-900/85"
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
                "rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                styles.pill
              )}
            >
              {getArchitectureCategoryLabel(String(data.category))}
            </span>
            <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold", status)}>
              {String(data.status)}
            </span>
          </div>
        </div>

        <p className="text-[15px] leading-7 text-current/85 dark:text-current/90">{String(data.description)}</p>

        {data.error ? (
          <div className="rounded-none border border-rose-300 bg-rose-50 px-3 py-2 text-sm leading-6 text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/60 dark:text-rose-200">
            {data.error}
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-2 text-sm text-current/80">
          <div className="rounded-none border border-current/15 bg-white/70 px-3 py-2 dark:bg-slate-900/70">
            <div className="flex items-center gap-2 font-semibold text-current">
              <ActivityIcon size={13} />
              {data.cost} cr
            </div>
            <p className="mt-1 text-xs">run cost</p>
          </div>
          <div className="rounded-none border border-current/15 bg-white/70 px-3 py-2 dark:bg-slate-900/70">
            <div className="flex items-center gap-2 font-semibold text-current">
              <Settings2Icon size={13} />
              {Object.keys(data.config ?? {}).length}
            </div>
            <p className="mt-1 text-xs">config keys</p>
          </div>
          <div className="rounded-none border border-current/15 bg-white/70 px-3 py-2 dark:bg-slate-900/70">
            <div className="flex items-center gap-2 font-semibold text-current">
              <CableIcon size={13} />
              Ready
            </div>
            <p className="mt-1 text-xs">connectable</p>
          </div>
        </div>

        <div className="space-y-2 rounded-none border border-current/15 bg-white/75 px-3 py-3 dark:bg-slate-900/75">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-current/70">Node Input</p>
          <Input
            value={data.input ?? ""}
            placeholder="Type architecture details here"
            className="nodrag h-10 border-current/15 bg-white/90 text-[15px] text-foreground placeholder:text-muted-foreground dark:bg-slate-950/85"
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
          <p className="text-xs leading-5 text-current/70">Use this inline field for notes, runtime values, or service details.</p>
        </div>
      </div>
    </div>
  );
});

ArchitectureNode.displayName = "ArchitectureNode";

export default ArchitectureNode;
