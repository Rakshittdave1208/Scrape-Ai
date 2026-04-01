import { DatabaseIcon } from "lucide-react";

import { TaskParamType, TaskType, WorkflowTask } from "@/types/task";

export const AddPropertyToJsonTask = {
  type: TaskType.ADD_PROPERTY_TO_JSON,
  nodeType: "transformNode",
  label: "Add property to JSON",
  icon: DatabaseIcon,
  category: "Data Storage",
  description: "Append a new property to an existing JSON payload.",
  inputs: [
    {
      name: "JSON",
      type: TaskParamType.JSON,
      required: true,
    },
    {
      name: "Property name",
      type: TaskParamType.STRING,
      helperText: "Field name that should be added.",
      placeholder: "quoteBy",
      hideHandle: true,
      required: true,
    },
    {
      name: "Property value",
      type: TaskParamType.STRING,
      helperText: "Value to store under the new field.",
      placeholder: "Wireless Store",
      hideHandle: true,
      required: true,
    },
  ],
  outputs: [
    {
      name: "Updated JSON",
      type: TaskParamType.JSON,
    },
  ],
  credits: 1,
} satisfies WorkflowTask;
