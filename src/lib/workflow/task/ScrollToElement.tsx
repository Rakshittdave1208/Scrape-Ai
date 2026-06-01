import { MoveVerticalIcon } from "lucide-react";

import { TaskParamType, TaskType, WorkflowTask } from "@/types/task";

export const ScrollToElementTask = {
  type: TaskType.SCROLL_TO_ELEMENT,
  nodeType: "scraperNode",
  label: "Scroll to element",
  icon: MoveVerticalIcon,
  category: "User Interactions",
  description: "Scroll the current page until a target element becomes visible.",
  inputs: [
    {
      name: "Web page",
      type: TaskParamType.BROWSER_INSTANCE,
      required: true,
    },
    {
      name: "Selector",
      type: TaskParamType.STRING,
      helperText: "CSS selector for the element to scroll into view.",
      placeholder: ".pricing-table",
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
  credits: 1,
  run: (resolvedInputs) => {
    return {
      "Web page": {
        ...(resolvedInputs["Web page"] as Record<string, unknown> | undefined),
        lastInteraction: `Scrolled to ${String(resolvedInputs.Selector ?? "element")}`,
      },
    };
  },
} satisfies WorkflowTask;
