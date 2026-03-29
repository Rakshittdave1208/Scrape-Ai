import { TaskParamType, TaskType, WorkflowTask } from "@/types/task";
import { GlobeIcon } from "lucide-react";

export const LaunchBrowserTask = {
  type: TaskType.LAUNCH_BROWSER,
  nodeType: "scraperNode",
  label: "Launch Browser",
  icon: GlobeIcon,
  category: "Browser",
  isEntryPoint: true,
  inputs: [
    {
      name: "Website Url",
      type: TaskParamType.STRING,
      helperText: "Paste the page URL to open in the browser",
      placeholder: "https://www.google.com",
      inputType: "url",
      required: true,
      hideHandle: true,
    },
  ],
  outputs: [
    {
      name: "Web page",
      type: TaskParamType.BROWSER_INSTANCE,
    },
  ],
  credits: 5,
} satisfies WorkflowTask;
