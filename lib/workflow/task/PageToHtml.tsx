import { TaskParamType, TaskType, WorkflowTask } from "@/types/task";
import { CodeIcon } from "lucide-react";

export const PageToHtmlTask = {
  type: TaskType.PAGE_TO_HTML,
  nodeType: "transformNode",
  label: "Get HTML from page",
  icon: CodeIcon,
  category: "Extraction",
  inputs: [
    {
      name: "Web page",
      type: TaskParamType.BROWSER_INSTANCE,
      required: true,
    },
  ],
  outputs: [
    {
      name: "Html",
      type: TaskParamType.STRING,
    },
    {
      name: "Web page",
      type: TaskParamType.BROWSER_INSTANCE,
    },
  ],
  credits: 2,
} satisfies WorkflowTask;
