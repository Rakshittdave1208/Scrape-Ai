import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function WorkflowEditorLandingPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Workflow Editor</CardTitle>
          <CardDescription>
            Select a workflow from your workflows list to open the editor for that project.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button asChild>
            <Link href="/workflows">Go to workflows</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
