
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import CreateWorkflowDialog from "./_components/CreateWorkflowDialog";
import WorkflowRow from "./_components/WorkflowRow";

export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex-1 flex flex-col h-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Workflows</h1>
            <p className="text-muted-foreground">
              Please sign in to manage your workflows.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const workflows = await prisma.workflow.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex-1 flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-muted-foreground">
            Create, edit, and delete your workflows.
          </p>
        </div>

        <CreateWorkflowDialog triggerText="Create workflow" />
      </div>

      {workflows.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 border rounded-lg p-8 border-dashed">
          <div className="space-y-2">
            <p className="text-lg font-medium">No workflows yet</p>
            <p className="text-muted-foreground">
              Click on &quot;Create workflow&quot; to start building your first one.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {workflows.map((workflow) => (
            <WorkflowRow
              key={workflow.id}
              id={workflow.id}
              name={workflow.name}
              description={workflow.description}
            />
          ))}
        </div>
      )}
    </div>
  );
}




