"use client";

import { useEffect, useMemo, useState } from "react";
import { Link2Icon, Trash2Icon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { ArchitectureCategory, ArchitectureEdge, ArchitectureNode } from "@/lib/workflow/backendArchitecture";

type ArchitectureInspectorProps = {
  selectedNode: ArchitectureNode | null;
  selectedEdge: ArchitectureEdge | null;
  onUpdateNode: (nodeId: string, updates: Partial<ArchitectureNode["data"]>) => void;
  onUpdateNodeCategory: (nodeId: string, category: ArchitectureCategory) => void;
  onUpdateEdgeLabel: (edgeId: string, label: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
};

const categories: ArchitectureCategory[] = ["client", "api", "service", "infra"];

export default function ArchitectureInspector({
  selectedNode,
  selectedEdge,
  onUpdateNode,
  onUpdateNodeCategory,
  onUpdateEdgeLabel,
  onDeleteNode,
  onDeleteEdge,
}: ArchitectureInspectorProps) {
  const [configDraft, setConfigDraft] = useState("");
  const [configError, setConfigError] = useState("");

  useEffect(() => {
    if (!selectedNode) {
      setConfigDraft("");
      setConfigError("");
      return;
    }

    setConfigDraft(JSON.stringify(selectedNode.data.config ?? {}, null, 2));
    setConfigError("");
  }, [selectedNode]);

  const selectionTitle = useMemo(() => {
    if (selectedNode) {
      return "Node Inspector";
    }

    if (selectedEdge) {
      return "Connection Inspector";
    }

    return "Inspector";
  }, [selectedEdge, selectedNode]);

  return (
    <aside className="flex min-h-0 min-w-[320px] max-w-[320px] flex-col">
      <Card className="min-h-0 flex-1 gap-4 overflow-hidden py-5">
        <CardHeader className="gap-2 px-5">
          <CardTitle>{selectionTitle}</CardTitle>
          <CardDescription>
            {selectedNode
              ? "Refine the selected architecture node."
              : selectedEdge
                ? "Tune the selected connection label."
                : "Pick a node or edge on the canvas to customize it."}
          </CardDescription>
        </CardHeader>

        <CardContent className="min-h-0 overflow-y-auto px-5">
          {selectedNode ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="outline">{selectedNode.data.category}</Badge>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => onDeleteNode(selectedNode.id)}
                >
                  <Trash2Icon size={14} />
                  Delete node
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="architecture-node-label">Label</Label>
                <Input
                  id="architecture-node-label"
                  value={selectedNode.data.label}
                  onChange={(event) => onUpdateNode(selectedNode.id, { label: event.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="architecture-node-description">Description</Label>
                <Textarea
                  id="architecture-node-description"
                  className="min-h-28"
                  value={selectedNode.data.description}
                  onChange={(event) =>
                    onUpdateNode(selectedNode.id, { description: event.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="architecture-node-category">Category</Label>
                  <select
                    id="architecture-node-category"
                    className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    value={selectedNode.data.category}
                    onChange={(event) =>
                      onUpdateNodeCategory(selectedNode.id, event.target.value as ArchitectureCategory)
                    }
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="architecture-node-cost">Run Cost</Label>
                  <Input
                    id="architecture-node-cost"
                    type="number"
                    min={0}
                    value={selectedNode.data.cost}
                    onChange={(event) =>
                      onUpdateNode(selectedNode.id, {
                        cost: Number.isFinite(Number(event.target.value))
                          ? Number(event.target.value)
                          : selectedNode.data.cost,
                      })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="architecture-node-config">Config JSON</Label>
                <Textarea
                  id="architecture-node-config"
                  className="min-h-[260px] font-mono text-xs"
                  value={configDraft}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setConfigDraft(nextValue);

                    try {
                      const parsed = JSON.parse(nextValue) as Record<string, unknown>;
                      onUpdateNode(selectedNode.id, { config: parsed });
                      setConfigError("");
                    } catch {
                      setConfigError("Config must be valid JSON before it can be applied.");
                    }
                  }}
                />
                {configError ? <p className="text-xs text-destructive">{configError}</p> : null}
              </div>
            </div>
          ) : null}

          {!selectedNode && selectedEdge ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="outline">
                  <Link2Icon size={12} />
                  Edge
                </Badge>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => onDeleteEdge(selectedEdge.id)}
                >
                  <Trash2Icon size={14} />
                  Delete edge
                </Button>
              </div>

              <div className="rounded-2xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">{selectedEdge.source}</span>
                  {" -> "}
                  <span className="font-semibold text-foreground">{selectedEdge.target}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="architecture-edge-label">Connection Label</Label>
                <Input
                  id="architecture-edge-label"
                  value={typeof selectedEdge.label === "string" ? selectedEdge.label : ""}
                  onChange={(event) => onUpdateEdgeLabel(selectedEdge.id, event.target.value)}
                />
              </div>
            </div>
          ) : null}

          {!selectedNode && !selectedEdge ? (
            <div className="flex h-full min-h-[360px] items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 text-center">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Nothing selected</p>
                <p className="text-sm text-muted-foreground">
                  Select a node to edit its label, description, category, and config. Select an edge to rename or
                  remove it.
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </aside>
  );
}
