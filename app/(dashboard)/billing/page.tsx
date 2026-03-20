import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          This page is now part of the dashboard route structure and is ready for your billing or
          credit-usage UI.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected route</CardTitle>
          <CardDescription>
            You can reach this page from the sidebar, the home dashboard, and the breadcrumb trail.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button asChild>
            <Link href="/workflows">Open workflows</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
