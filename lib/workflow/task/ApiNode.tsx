import { Globe2Icon } from "lucide-react";

import { TaskParamType, TaskType, WorkflowTask } from "@/types/task";

export const ApiNodeTask = {
  type: TaskType.API_NODE,
  nodeType: "apiNode",
  label: "API Node",
  icon: Globe2Icon,
  category: "Core",
  description: "Send data to an API endpoint and return the JSON response.",
  inputs: [
    {
      name: "Endpoint",
      type: TaskParamType.STRING,
      placeholder: "https://api.example.com/endpoint",
      helperText: "URL for the API request.",
      inputType: "url",
      hideHandle: true,
      required: true,
    },
    {
      name: "Payload",
      type: TaskParamType.JSON,
      helperText: "Incoming request payload.",
      required: false,
    },
  ],
  outputs: [
    {
      name: "response",
      type: TaskParamType.JSON,
      helperText: "Structured response body.",
    },
    {
      name: "statusCode",
      type: TaskParamType.NUMBER,
      helperText: "HTTP status code for the response.",
    },
  ],
  credits: 8,
} satisfies WorkflowTask;
