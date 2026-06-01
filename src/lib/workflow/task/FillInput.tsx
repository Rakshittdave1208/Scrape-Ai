import { PencilLineIcon } from "lucide-react";

import { TaskParamType, TaskType, WorkflowTask } from "@/types/task";

export const FillInputTask = {
  type: TaskType.FILL_INPUT,
  nodeType: "scraperNode",
  label: "Fill Input",
  icon: PencilLineIcon,
  category: "User Interactions",
  description: "Type a value into an input element on the current page.",
  inputs: [
    {
      name: "Web page",
      type: TaskParamType.BROWSER_INSTANCE,
      required: true,
    },
    {
      name: "Selector",
      type: TaskParamType.STRING,
      helperText: "CSS selector for the input element.",
      placeholder: "input[name='email']",
      hideHandle: true,
      required: true,
    },
    {
      name: "Value",
      type: TaskParamType.STRING,
      helperText: "Value that will be typed into the element.",
      placeholder: "hello@example.com",
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
        lastInteraction: `Filled ${String(resolvedInputs.Selector ?? "field")}`,
        lastValue: resolvedInputs.Value ?? "",
      },
    };
  },
} satisfies WorkflowTask;
