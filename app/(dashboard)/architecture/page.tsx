import { Badge } from "@/components/ui/badge";
import ArchitectureCanvas from "./_components/ArchitectureCanvas";

export default function ArchitecturePage() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6">
      <section className="space-y-2">
        <Badge variant="outline" className="w-fit">
          System Design
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">Backend Architecture</h1>
        <p className="max-w-3xl text-muted-foreground">
          Start from the prebuilt production backend graph, customize every node and connection, and simulate runs
          against a daily credit budget.
        </p>
      </section>

      <ArchitectureCanvas />
    </div>
  );
}
