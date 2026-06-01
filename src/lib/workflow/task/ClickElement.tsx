import { MousePointerClickIcon } from "lucide-react";

import { TaskParamType, TaskType, WorkflowTask } from "@/types/task";

export const ClickElementTask = {
  type: TaskType.CLICK_ELEMENT,
  nodeType: "scraperNode",
  label: "Click Element",
  icon: MousePointerClickIcon,
  category: "User Interactions",
  description: "Click a button, link, or interactive element on the page.",
  inputs: [
    {
      name: "Web page",
      type: TaskParamType.BROWSER_INSTANCE,
      required: true,
    },
    {
      name: "Selector",
      type: TaskParamType.STRING,
      helperText: "CSS selector for the clickable element.",
      placeholder: "button.add-to-cart",
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
        lastInteraction: `Clicked ${String(resolvedInputs.Selector ?? "element")}`,
      },
    };
  },
} satisfies WorkflowTask;
