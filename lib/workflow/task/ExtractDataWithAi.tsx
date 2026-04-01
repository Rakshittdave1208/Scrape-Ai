import { SparklesIcon } from "lucide-react";

import { TaskParamType, TaskType, WorkflowTask } from "@/types/task";

export const ExtractDataWithAiTask = {
  type: TaskType.EXTRACT_DATA_WITH_AI,
  nodeType: "transformNode",
  label: "Extract data with AI",
  icon: SparklesIcon,
  category: "Data Extraction",
  description: "Use an AI prompt to extract structured data from raw HTML or text.",
  inputs: [
    {
      name: "Html",
      type: TaskParamType.STRING,
      required: true,
    },
    {
      name: "Instruction",
      type: TaskParamType.STRING,
      helperText: "Prompt that describes what should be extracted.",
      placeholder: "Extract the title, price, and availability into JSON.",
      hideHandle: true,
      required: true,
    },
  ],
  outputs: [
    {
      name: "Structured data",
      type: TaskParamType.JSON,
    },
  ],
  credits: 3,
} satisfies WorkflowTask;
