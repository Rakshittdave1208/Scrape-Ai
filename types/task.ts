import { LucideProps } from "lucide-react";

export enum TaskType {
  LAUNCH_BROWSER = "LAUNCH_BROWSER",
  PAGE_TO_HTML = "PAGE_TO_HTML",
  EXTRACT_TEXT_FROM_ELEMENT = "EXTRACT_TEXT_FROM_ELEMENT",
  SCRAPER_NODE = "SCRAPER_NODE",
  API_NODE = "API_NODE",
  TRANSFORM_NODE = "TRANSFORM_NODE",
  FILL_INPUT = "FILL_INPUT",
  CLICK_ELEMENT = "CLICK_ELEMENT",
  NAVIGATE_URL = "NAVIGATE_URL",
  SCROLL_TO_ELEMENT = "SCROLL_TO_ELEMENT",
  EXTRACT_DATA_WITH_AI = "EXTRACT_DATA_WITH_AI",
  READ_PROPERTY_FROM_JSON = "READ_PROPERTY_FROM_JSON",
  ADD_PROPERTY_TO_JSON = "ADD_PROPERTY_TO_JSON",
  WAIT_FOR_ELEMENT = "WAIT_FOR_ELEMENT",
  SEND_TO_WEBHOOK = "SEND_TO_WEBHOOK",
}

export enum TaskParamType {
  STRING = "STRING",
  NUMBER = "NUMBER",
  JSON = "JSON",
  BROWSER_INSTANCE = "BROWSER_INSTANCE",
}

export type TaskCategory =
  | "Core"
  | "User Interactions"
  | "Data Extraction"
  | "Data Storage"
  | "Timing Controls"
  | "Result Delivery";

export interface TaskParam {
  name: string;
  type: TaskParamType;
  helperText?: string;
  placeholder?: string;
  inputType?: "text" | "url" | "number";
  required?: boolean;
  hideHandle?: boolean;
}

export interface WorkflowTask {
  type: TaskType;
  nodeType: "scraperNode" | "apiNode" | "transformNode";
  label: string;
  icon: React.FC<LucideProps>;
  category: TaskCategory;
  description?: string;
  isEntryPoint?: boolean;
  inputs: TaskParam[];
  outputs: TaskParam[];
  credits: number;
}
