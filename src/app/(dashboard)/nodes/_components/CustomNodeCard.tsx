"use client";

import { CustomNode } from "@/lib/generated/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CustomNodeCard({ node }: { node: CustomNode }) {
  const Icon = (LucideIcons as any)[node.icon] || LucideIcons.HelpCircle;

  return (
    <Card className="group transition-all hover:border-primary/50 flex flex-col justify-between overflow-hidden">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="p-3 bg-primary/10 text-primary ring-1 ring-primary/20 rounded-none transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon size={20} />
          </div>
          <Badge variant="secondary" className="uppercase tracking-widest text-[9px] rounded-none">
            {node.runtime}
          </Badge>
        </div>
        
        <div className="space-y-1">
          <CardTitle className="font-display group-hover:text-primary transition-colors">
            {node.label}
          </CardTitle>
          <CardDescription className="line-clamp-2 min-h-[40px]">
            {node.description || "No description provided."}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
           <span className="text-foreground">{JSON.parse(node.inputs).length}</span> Inputs
           <span className="text-zinc-700">•</span>
           <span className="text-foreground">{JSON.parse(node.outputs).length}</span> Outputs
        </div>

        <div className="flex items-center gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" className="w-full text-xs rounded-none" asChild>
            <Link href={`/nodes/edit/${node.id}`}>Edit Node</Link>
          </Button>
          <Button size="sm" className="w-full text-xs rounded-none bg-primary hover:bg-primary/90 text-primary-foreground">
            Deploy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
