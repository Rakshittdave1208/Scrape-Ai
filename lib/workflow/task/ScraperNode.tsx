import { SearchIcon } from "lucide-react";

import { TaskParamType, TaskType, WorkflowTask } from "@/types/task";

export const ScraperNodeTask = {
  type: TaskType.SCRAPER_NODE,
  nodeType: "scraperNode",
  label: "Scraper Node",
  icon: SearchIcon,
  category: "Core",
  description: "Fetch a page and return its raw body for downstream nodes.",
  isEntryPoint: true,
  inputs: [
    {
      name: "Target URL",
      type: TaskParamType.STRING,
      placeholder: "https://example.com",
      helperText: "Enter the URL to scrape.",
      inputType: "url",
      hideHandle: true,
      required: true,
    },
  ],
  outputs: [
    {
      name: "responseBody",
      type: TaskParamType.STRING,
      helperText: "The fetched HTML or body text.",
    },
    {
      name: "metadata",
      type: TaskParamType.JSON,
      helperText: "Execution metadata for later steps.",
    },
  ],
  credits: 10,
} satisfies WorkflowTask;
