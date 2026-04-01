import { SendIcon } from "lucide-react";

import { TaskParamType, TaskType, WorkflowTask } from "@/types/task";

export const SendToWebhookTask = {
  type: TaskType.SEND_TO_WEBHOOK,
  nodeType: "apiNode",
  label: "Send to Webhook",
  icon: SendIcon,
  category: "Result Delivery",
  description: "Deliver the final JSON payload to a webhook or external endpoint.",
  inputs: [
    {
      name: "Payload",
      type: TaskParamType.JSON,
      required: true,
    },
    {
      name: "Webhook URL",
      type: TaskParamType.STRING,
      helperText: "Destination URL for the webhook call.",
      placeholder: "https://hooks.example.com/workflows/product-data",
      inputType: "url",
      hideHandle: true,
      required: true,
    },
  ],
  outputs: [
    {
      name: "Response",
      type: TaskParamType.JSON,
    },
  ],
  credits: 2,
} satisfies WorkflowTask;
