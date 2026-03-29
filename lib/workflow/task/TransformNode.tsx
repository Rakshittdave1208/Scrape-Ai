import { ShuffleIcon } from "lucide-react";

import { TaskParamType, TaskType, WorkflowTask } from "@/types/task";

export const TransformNodeTask = {
  type: TaskType.TRANSFORM_NODE,
  nodeType: "transformNode",
  label: "Transform Node",
  icon: ShuffleIcon,
  category: "Core",
  description: "Map incoming text or JSON into a transformed output.",
  inputs: [
    {
      name: "Source",
      type: TaskParamType.STRING,
      helperText: "Primary value to transform.",
      required: true,
    },
    {
      name: "Template",
      type: TaskParamType.STRING,
      placeholder: "{{value}}",
      helperText: "Formatting template for the output.",
      hideHandle: true,
      required: true,
    },
  ],
  outputs: [
    {
      name: "result",
      type: TaskParamType.STRING,
      helperText: "Transformed value.",
    },
  ],
  credits: 3,
} satisfies WorkflowTask;
