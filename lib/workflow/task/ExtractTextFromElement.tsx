import { TaskParamType, TaskType, WorkflowTask } from "@/types/task";
import { TextIcon } from "lucide-react";

export const ExtractTextFromElementTask = {
  type: TaskType.EXTRACT_TEXT_FROM_ELEMENT,
  label: "Extract text from element",
  icon: TextIcon,
  inputs: [
    {
      name: "Html",
      type: TaskParamType.STRING,
      required: true,
    },
    {
      name: "Selector",
      type: TaskParamType.STRING,
      helperText: "CSS selector used to find the element",
      placeholder: ".article-title",
      required: true,
      hideHandle: true,
    },
  ],
  outputs: [
    {
      name: "Extracted text",
      type: TaskParamType.STRING,
    },
  ],
  credits: 2,
} satisfies WorkflowTask;
