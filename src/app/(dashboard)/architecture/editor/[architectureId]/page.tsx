import { Badge } from "@/components/ui/badge";
import ArchitectureCanvas from "../../_components/ArchitectureCanvas";

export default function ArchitectureEditorPage({
  params,
}: {
  params: { architectureId: string };
}) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6 overflow-hidden">
      <section className="min-w-0 rounded-none border bg-card/80 px-5 py-5 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80">
        <Badge variant="outline" className="w-fit">
          System Design
        </Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Backend Architecture</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Start from the prebuilt production backend graph, customize every node and connection, and
          simulate runs against a daily credit budget.
        </p>
      </section>

      <ArchitectureCanvas architectureId={params.architectureId} />
    </div>
  );
}
