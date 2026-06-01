import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import CreateCustomNodeDialog from "./_components/CreateCustomNodeDialog";
import { SparklesIcon } from "lucide-react";
import CustomNodeCard from "./_components/CustomNodeCard";

export default async function NodesPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Unauthenticated</div>;
  }

  // SELF-HEALING: Ensure default multi-tenant context exists
  await prisma.organization.upsert({
    where: { id: "default-org" },
    update: {},
    create: { id: "default-org", name: "Default Organization", slug: "default" }
  });

  const customNodes = await prisma.customNode.findMany({
    where: {
      userId,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex-1 flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-display">Custom Nodes</h1>
          <p className="text-muted-foreground">
            Create and manage your personalized workflow nodes.
          </p>
        </div>

        <CreateCustomNodeDialog />
      </div>

      {customNodes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 border rounded-none p-12 border-dashed bg-card/30">
          <div className="rounded-none bg-primary/10 p-4 ring-1 ring-primary/20">
            <SparklesIcon className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2 max-w-sm">
            <p className="text-lg font-medium">No custom nodes yet</p>
            <p className="text-muted-foreground text-sm">
              Custom nodes allow you to extend the platform with your own logic, APIs, and scripts.
            </p>
          </div>
          <CreateCustomNodeDialog triggerText="Create your first node" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customNodes.map((node) => (
            <CustomNodeCard key={node.id} node={node} />
          ))}
        </div>
      )}
    </div>
  );
}
