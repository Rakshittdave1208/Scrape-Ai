import { BracesIcon } from "lucide-react";

import { TaskParamType, TaskType, WorkflowTask } from "@/types/task";

export const ReadPropertyFromJsonTask = {
  type: TaskType.READ_PROPERTY_FROM_JSON,
  nodeType: "transformNode",
  label: "Read property from JSON",
  icon: BracesIcon,
  category: "Data Storage",
  description: "Read a property value from a JSON object for later steps.",
  inputs: [
    {
      name: "JSON",
      type: TaskParamType.JSON,
      required: true,
    },
    {
      name: "Property name",
      type: TaskParamType.STRING,
      helperText: "Name of the field to read from the JSON payload.",
      placeholder: "price",
      hideHandle: true,
      required: true,
    },
  ],
  outputs: [
    {
      name: "Value",
      type: TaskParamType.STRING,
    },
  ],
  credits: 1,
} satisfies WorkflowTask;
