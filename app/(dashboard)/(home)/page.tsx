import Link from "next/link";
import {
  ArrowRightIcon,
  KeyRoundIcon,
  Link2Icon,
  PlayCircleIcon,
  SaveIcon,
  WorkflowIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const quickLinks = [
  {
    href: "/workflows",
    title: "Workflows",
    description: "Create and manage your scraping workflows.",
    cta: "Open workflows",
  },
  {
    href: "/credentials",
    title: "Credentials",
    description: "Store API keys, usernames, passwords, cookies, and custom headers.",
    cta: "Manage credentials",
  },
  {
    href: "/billing",
    title: "Billing",
    description: "Review your usage, credits, and subscription details.",
    cta: "View billing",
  },
];

const gettingStartedSteps = [
  {
    title: "1. Add your credentials",
    description:
      "Open the Credentials page and save the secrets your workflows will need later, such as API keys, usernames, passwords, cookies, or headers.",
    icon: KeyRoundIcon,
    href: "/credentials",
    cta: "Go to credentials",
  },
  {
    title: "2. Create a workflow",
    description:
      "Open Workflows, create a new workflow, and enter the visual editor. Every workflow starts from a launch or input step.",
    icon: WorkflowIcon,
    href: "/workflows",
    cta: "Create a workflow",
  },
  {
    title: "3. Add nodes to the canvas",
    description:
      "Use the left sidebar task buttons to add nodes like Launch Browser, Get HTML from page, and Extract text from element.",
    icon: PlayCircleIcon,
    href: "/workflows",
    cta: "Open editor",
  },
  {
    title: "4. Connect the data flow",
    description:
      "Drag from the output dot of one node to the input dot of the next node. Browser instance inputs are connection-only and should not be typed manually.",
    icon: Link2Icon,
    href: "/workflows",
    cta: "Connect nodes",
  },
  {
    title: "5. Save and continue later",
    description:
      "Your workflow definition is saved to the database, so you can refresh the page and continue building without losing the graph.",
    icon: SaveIcon,
    href: "/workflows",
    cta: "View workflows",
  },
];

const exampleFlow = [
  "Launch Browser",
  "Get HTML from page",
  "Extract text from element",
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge variant="outline" className="w-fit">
          User guide
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">How to use ScrapeFlow</h1>
        <p className="max-w-3xl text-muted-foreground">
          ScrapeFlow lets you build scraping workflows visually. Add credentials, create a workflow,
          place nodes on the canvas, connect the outputs to the next inputs, and save the flow as a
          reusable workflow definition.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {quickLinks.map((link) => (
          <Card key={link.href} className="flex flex-col">
            <CardHeader>
              <CardTitle>{link.title}</CardTitle>
              <CardDescription>{link.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button asChild className="w-full">
                <Link href={link.href}>{link.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Follow these steps to create your first workflow from the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {gettingStartedSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="flex items-start justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-md border bg-secondary p-2 text-muted-foreground">
                      <Icon size={18} />
                    </div>
                    <div className="space-y-1">
                      <h2 className="font-semibold">{step.title}</h2>
                      <p className="max-w-2xl text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={step.href}>{step.cta}</Link>
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Example Flow</CardTitle>
              <CardDescription>A simple chain you can build right now in the editor.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {exampleFlow.map((step, index) => (
                <div key={step} className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <span className="font-medium">{step}</span>
                    <Badge variant="secondary">Step {index + 1}</Badge>
                  </div>
                  {index < exampleFlow.length - 1 && (
                    <div className="flex justify-center text-muted-foreground">
                      <ArrowRightIcon size={16} />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Important Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>String inputs can be typed manually inside a node.</p>
              <p>Browser instance inputs are port-only and must come from another node connection.</p>
              <p>Credentials are masked in the UI and stored separately from workflow definitions.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
