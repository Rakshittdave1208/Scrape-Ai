import { HourglassIcon } from "lucide-react";

import { TaskParamType, TaskType, WorkflowTask } from "@/types/task";

export const WaitForElementTask = {
  type: TaskType.WAIT_FOR_ELEMENT,
  nodeType: "scraperNode",
  label: "Wait For Element",
  icon: HourglassIcon,
  category: "Timing Controls",
  description: "Pause the workflow until an element appears on the page.",
  inputs: [
    {
      name: "Web page",
      type: TaskParamType.BROWSER_INSTANCE,
      required: true,
    },
    {
      name: "Selector",
      type: TaskParamType.STRING,
      helperText: "Element to wait for before continuing.",
      placeholder: ".results-ready",
      hideHandle: true,
      required: true,
    },
    {
      name: "Timeout ms",
      type: TaskParamType.NUMBER,
      helperText: "Maximum wait time in milliseconds.",
      placeholder: "5000",
      inputType: "number",
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
        waitedFor: resolvedInputs.Selector ?? "",
        timeoutMs: resolvedInputs["Timeout ms"] ?? 0,
      },
    };
  },
} satisfies WorkflowTask;
