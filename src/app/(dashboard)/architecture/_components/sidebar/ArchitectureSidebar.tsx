"use client";

import { useMemo, useState } from "react";
import { CpuIcon, DatabaseIcon, Layers3Icon, PlusIcon, ServerCogIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ArchitectureTemplate, CustomArchitectureNodeDraft } from "@/lib/defaultArchitecture";
import { architectureTemplates } from "@/lib/workflow/backendArchitecture";
import { architectureCategoryStyles, formatCredits, getArchitectureCategoryLabel } from "../shared";

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
    title: "Cloud Infra",
    icon: DatabaseIcon,
  },
} as const;

const defaultTemplate = architectureTemplates.find((template) => template.key === "service-node") ?? architectureTemplates[0];

function createDraftFromTemplate(template: ArchitectureTemplate): CustomArchitectureNodeDraft {
  return {
    baseTemplateKey: template.key,
    label: template.label,
    description: template.description,
    category: template.category,
    technology:
      typeof template.config.provider === "string"
        ? template.config.provider
        : typeof template.config.engine === "string"
          ? template.config.engine
          : typeof template.config.runtime === "string"
            ? template.config.runtime
            : template.label,
    input: "",
    config: { ...template.config },
    cost: template.cost,
  };
}

type ArchitectureSidebarProps = {
  className?: string;
  credits: number;
  dailyLimit: number;
  progress: number;
  nodesCount: number;
  edgesCount: number;
  selectedLabel?: string | null;
  onAddTemplate: (template: ArchitectureTemplate) => void;
  onAddCustomNode: (draft: CustomArchitectureNodeDraft) => void;
};

export default function ArchitectureSidebar({
  className,
  credits,
  dailyLimit,
  progress,
  nodesCount,
  edgesCount,
  selectedLabel,
  onAddTemplate,
  onAddCustomNode,
}: ArchitectureSidebarProps) {
  const [customDraft, setCustomDraft] = useState<CustomArchitectureNodeDraft>(() =>
    createDraftFromTemplate(defaultTemplate)
  );
  const [configText, setConfigText] = useState(() => JSON.stringify(defaultTemplate.config, null, 2));
  const [customError, setCustomError] = useState<string | null>(null);

  const paletteTemplates = useMemo(() => architectureTemplates, []);

  const handleTemplateChange = (templateKey: string) => {
    const template = paletteTemplates.find((item) => item.key === templateKey) ?? defaultTemplate;
    const nextDraft = createDraftFromTemplate(template);
    setCustomDraft(nextDraft);
    setConfigText(JSON.stringify(nextDraft.config, null, 2));
    setCustomError(null);
  };

  const handleAddCustomNode = () => {
    const label = customDraft.label.trim();
    const description = customDraft.description.trim();
    const technology = customDraft.technology.trim();

    if (!label || !description || !technology) {
      setCustomError("Add a label, description, and technology before creating the node.");
      return;
    }

    try {
      const parsedConfig = configText.trim() ? (JSON.parse(configText) as Record<string, unknown>) : {};
      onAddCustomNode({
        ...customDraft,
        label,
        description,
        technology,
        input: customDraft.input.trim(),
        cost: Math.max(0, Number(customDraft.cost) || 0),
        config: parsedConfig,
      });
      setCustomError(null);
    } catch {
      setCustomError("Config JSON is invalid. Fix the JSON before adding the node.");
    }
  };

  return (
    <aside
      className={cn(
        "flex min-h-0 min-w-0 w-full flex-col gap-4 xl:w-[248px] xl:min-w-[248px] xl:max-w-[248px] 2xl:w-[260px] 2xl:min-w-[260px] 2xl:max-w-[260px]",
        className
      )}
    >
      <Card className="gap-4 border-white/70 bg-background/92 py-5 shadow-lg backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/88">
        <CardHeader className="gap-3 px-5">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="outline">Daily Credits</Badge>
            <span className="text-xs font-medium text-muted-foreground">{formatCredits(dailyLimit)} / day</span>
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
            <div className="rounded-none border bg-background/80 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/80">
              <p className="font-semibold text-foreground">{nodesCount}</p>
              <p>Nodes</p>
            </div>
            <div className="rounded-none border bg-background/80 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/80">
              <p className="font-semibold text-foreground">{edgesCount}</p>
              <p>Edges</p>
            </div>
            <div className="col-span-2 rounded-none border bg-background/80 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/80">
              <p className="truncate font-semibold text-foreground">{selectedLabel ?? "Nothing selected"}</p>
              <p>Current selection</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Daily allowance: {formatCredits(dailyLimit)} credits.
          </p>
        </CardContent>
      </Card>

      <Card className="min-h-0 flex-1 gap-4 overflow-hidden border-white/70 bg-background/92 py-5 shadow-lg backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/88">
        <CardHeader className="gap-2 px-5">
          <CardTitle>Node Palette</CardTitle>
          <CardDescription>Drag a module into the canvas or click to add it quickly.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-0 space-y-4 overflow-y-auto px-5">
          <div className="rounded-none border border-dashed border-primary/30 bg-primary/5 p-4 dark:border-primary/20 dark:bg-primary/10">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full border border-primary/20 bg-background/80 p-2 text-primary dark:bg-slate-950/80">
                <SparklesIcon size={14} />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Custom Node Builder</p>
                <p className="text-xs text-muted-foreground">Create your own architecture node and add it to the canvas.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Starting template</Label>
                <Select value={customDraft.baseTemplateKey} onValueChange={handleTemplateChange}>
                  <SelectTrigger className="w-full bg-background/80 dark:bg-slate-950/70">
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {paletteTemplates.map((template) => (
                      <SelectItem key={template.key} value={template.key}>
                        {template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Node label</Label>
                <Input
                  value={customDraft.label}
                  onChange={(event) =>
                    setCustomDraft((current) => ({
                      ...current,
                      label: event.target.value,
                    }))
                  }
                  placeholder="Kubernetes Worker Pool"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Description</Label>
                <Textarea
                  value={customDraft.description}
                  onChange={(event) =>
                    setCustomDraft((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="min-h-20 resize-none"
                  placeholder="Describe what this node does in your system."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Category</Label>
                  <Select
                    value={customDraft.category}
                    onValueChange={(value) =>
                      setCustomDraft((current) => ({
                        ...current,
                        category: value as CustomArchitectureNodeDraft["category"],
                      }))
                    }
                  >
                    <SelectTrigger className="w-full bg-background/80 dark:bg-slate-950/70">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(categoryMeta) as Array<keyof typeof categoryMeta>).map((categoryKey) => (
                        <SelectItem key={categoryKey} value={categoryKey}>
                          {getArchitectureCategoryLabel(categoryKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Run cost</Label>
                  <Input
                    type="number"
                    min={0}
                    value={customDraft.cost}
                    onChange={(event) =>
                      setCustomDraft((current) => ({
                        ...current,
                        cost: Number(event.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Technology</Label>
                <Input
                  value={customDraft.technology}
                  onChange={(event) =>
                    setCustomDraft((current) => ({
                      ...current,
                      technology: event.target.value,
                    }))
                  }
                  placeholder="AWS EKS"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Inline input</Label>
                <Input
                  value={customDraft.input}
                  onChange={(event) =>
                    setCustomDraft((current) => ({
                      ...current,
                      input: event.target.value,
                    }))
                  }
                  placeholder="Optional note or runtime detail"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Config JSON</Label>
                <Textarea
                  value={configText}
                  onChange={(event) => setConfigText(event.target.value)}
                  className="min-h-28 font-mono text-xs"
                  placeholder='{"provider":"AWS","service":"EKS"}'
                />
              </div>

              {customError ? (
                <p className="text-xs font-medium text-destructive">{customError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  This creates a reusable custom node on the canvas with your own label, config, and category.
                </p>
              )}

              <Button type="button" className="w-full" onClick={handleAddCustomNode}>
                <PlusIcon size={14} />
                Add Custom Node
              </Button>
            </div>
          </div>

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
                    <p className="text-sm font-semibold text-foreground">
                      {getArchitectureCategoryLabel(categoryKey) || categoryMeta[categoryKey].title}
                    </p>
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
                        "flex w-full items-start justify-between gap-3 rounded-none border px-3 py-3 text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-sm",
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
