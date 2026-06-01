import { LinkIcon } from "lucide-react";

import { TaskParamType, TaskType, WorkflowTask } from "@/types/task";

export const NavigateUrlTask = {
  type: TaskType.NAVIGATE_URL,
  nodeType: "scraperNode",
  label: "Navigate Url",
  icon: LinkIcon,
  category: "User Interactions",
  description: "Navigate the active page to a new URL during the workflow.",
  inputs: [
    {
      name: "Web page",
      type: TaskParamType.BROWSER_INSTANCE,
      required: true,
    },
    {
      name: "Next URL",
      type: TaskParamType.STRING,
      helperText: "The URL the page should navigate to.",
      placeholder: "https://example.com/checkout",
      inputType: "url",
      hideHandle: true,
      required: true,
    },
  ],
  outputs: [
    {
      name: "Web page",
      type: TaskParamType.BROWSER_INSTANCE,
    },
  ],
  credits: 2,
  run: (resolvedInputs) => {
    return {
      "Web page": {
        ...(resolvedInputs["Web page"] as Record<string, unknown> | undefined),
        url: resolvedInputs["Next URL"] ?? "",
        navigatedAt: new Date().toISOString(),
      },
    };
  },
} satisfies WorkflowTask;
