import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent } from "@/components/ui/card";
import CreateCredentialDialog from "./_components/CreateCredentialDialog";
import CredentialCard from "./_components/CredentialCard";

export default async function CredentialsPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Credentials</h1>
          <p className="text-muted-foreground">Please sign in to manage your credentials.</p>
        </div>
      </div>
    );
  }

  const credentials = await prisma.credential.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      type: true,
      username: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Credentials</h1>
          <p className="text-muted-foreground">
            Store secrets for your workflows without exposing raw values in the dashboard UI.
          </p>
        </div>
        <CreateCredentialDialog />
      </div>

      {credentials.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
            <h2 className="text-lg font-semibold">No credentials yet</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Add your first credential to keep API keys, passwords, cookies, and headers ready for future
              workflow integrations.
            </p>
            <CreateCredentialDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {credentials.map((credential) => (
            <CredentialCard key={credential.id} credential={credential} />
          ))}
        </div>
      )}
    </div>
  );
}
