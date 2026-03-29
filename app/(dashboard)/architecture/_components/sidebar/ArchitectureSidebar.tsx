"use client";

import { CpuIcon, DatabaseIcon, Layers3Icon, PlusIcon, ServerCogIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ArchitectureTemplate } from "@/lib/defaultArchitecture";
import { architectureTemplates } from "@/lib/workflow/backendArchitecture";
import { architectureCategoryStyles, formatCredits } from "../shared";

const categoryMeta = {
  client: {
    title: "Client",
    icon: Layers3Icon,
  },
  api: {
    title: "API",
    icon: CpuIcon,
  },
  service: {
    title: "Service",
    icon: ServerCogIcon,
  },
  infra: {
    title: "Infra",
    icon: DatabaseIcon,
  },
} as const;

type ArchitectureSidebarProps = {
  credits: number;
  dailyLimit: number;
  progress: number;
  nodesCount: number;
  edgesCount: number;
  selectedLabel?: string | null;
  onAddTemplate: (template: ArchitectureTemplate) => void;
};

export default function ArchitectureSidebar({
  credits,
  dailyLimit,
  progress,
  nodesCount,
  edgesCount,
  selectedLabel,
  onAddTemplate,
}: ArchitectureSidebarProps) {
  return (
    <aside className="flex min-h-0 min-w-[280px] max-w-[280px] flex-col gap-4">
      <Card className="gap-4 py-5">
        <CardHeader className="gap-3 px-5">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="outline">Daily Credits</Badge>
            <span className="text-xs font-medium text-muted-foreground">10,000 / day</span>
          </div>
          <div>
            <CardTitle className="text-2xl">{formatCredits(credits)}</CardTitle>
            <CardDescription>Remaining simulation credits for architecture runs.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 px-5">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="rounded-xl border bg-background px-3 py-2">
              <p className="font-semibold text-foreground">{nodesCount}</p>
              <p>Nodes</p>
            </div>
            <div className="rounded-xl border bg-background px-3 py-2">
              <p className="font-semibold text-foreground">{edgesCount}</p>
              <p>Edges</p>
            </div>
            <div className="col-span-2 rounded-xl border bg-background px-3 py-2">
              <p className="font-semibold text-foreground">{selectedLabel ?? "Nothing selected"}</p>
              <p>Current selection</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Daily allowance: {formatCredits(dailyLimit)} credits.
          </p>
        </CardContent>
      </Card>

      <Card className="min-h-0 flex-1 gap-4 overflow-hidden py-5">
        <CardHeader className="gap-2 px-5">
          <CardTitle>Node Palette</CardTitle>
          <CardDescription>Drag a module into the canvas or click to add it quickly.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-0 space-y-4 overflow-y-auto px-5">
          {(Object.keys(categoryMeta) as Array<keyof typeof categoryMeta>).map((categoryKey, index) => {
            const categoryTemplates = architectureTemplates.filter((template) => template.category === categoryKey);
            const styles = architectureCategoryStyles[categoryKey];
            const Icon = categoryMeta[categoryKey].icon;

            return (
              <div key={categoryKey} className="space-y-3">
                {index > 0 ? <Separator /> : null}
                <div className="flex items-center gap-2">
                  <span className={cn("rounded-full border p-2", styles.pill)}>
                    <Icon size={14} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{categoryMeta[categoryKey].title}</p>
                    <p className="text-xs text-muted-foreground">{categoryTemplates.length} templates</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {categoryTemplates.map((template) => (
                    <button
                      key={template.key}
                      type="button"
                      draggable
                      onClick={() => onAddTemplate(template)}
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData(
                          "application/architecture-template",
                          JSON.stringify(template)
                        );
                      }}
                      className={cn(
                        "flex w-full items-start justify-between gap-3 rounded-2xl border px-3 py-3 text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-sm",
                        styles.card
                      )}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{template.label}</p>
                        <p className="text-xs leading-5 text-current/80">{template.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className="bg-background/70">
                          {template.cost} cr
                        </Badge>
                        <span className="rounded-full border border-current/20 bg-background/70 p-1.5">
                          <PlusIcon size={14} />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </aside>
  );
}
