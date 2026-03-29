import { LucideProps } from "lucide-react";

export enum TaskType {
  LAUNCH_BROWSER = "LAUNCH_BROWSER",
  PAGE_TO_HTML = "PAGE_TO_HTML",
  EXTRACT_TEXT_FROM_ELEMENT = "EXTRACT_TEXT_FROM_ELEMENT",
  SCRAPER_NODE = "SCRAPER_NODE",
  API_NODE = "API_NODE",
  TRANSFORM_NODE = "TRANSFORM_NODE",
}

export enum TaskParamType {
  STRING = "STRING",
  NUMBER = "NUMBER",
  JSON = "JSON",
  BROWSER_INSTANCE = "BROWSER_INSTANCE",
}

export type TaskCategory = "Browser" | "Extraction" | "Core";

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
