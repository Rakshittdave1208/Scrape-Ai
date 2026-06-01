import { TaskParamType, TaskType, WorkflowTask } from "@/types/task";
import { CodeIcon } from "lucide-react";

export const PageToHtmlTask = {
  type: TaskType.PAGE_TO_HTML,
  nodeType: "transformNode",
  label: "Get HTML from page",
  icon: CodeIcon,
  category: "Data Extraction",
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
  run: (resolvedInputs) => {
    return {
      Html: `<html><body><h1 class="product-title">Wireless Headphones Pro</h1><span class="product-price">$249</span><p>HTML from ${String(
        (resolvedInputs["Web page"] as { url?: string } | undefined)?.url ?? "connected page"
      )}</p></body></html>`,
      "Web page": resolvedInputs["Web page"],
    };
  },
} satisfies WorkflowTask;
