import { LucideProps } from "lucide-react";

export enum TaskType {
  LAUNCH_BROWSER = "LAUNCH_BROWSER",
  PAGE_TO_HTML = "PAGE_TO_HTML",
  EXTRACT_TEXT_FROM_ELEMENT = "EXTRACT_TEXT_FROM_ELEMENT",
}

export enum TaskParamType {
  STRING = "STRING",
  BROWSER_INSTANCE = "BROWSER_INSTANCE",
}

export interface TaskParam {
  name: string;
  type: TaskParamType;
  helperText?: string;
  placeholder?: string;
  inputType?: "text" | "url";
  required?: boolean;
  hideHandle?: boolean;
  [key: string]: any;
}

export interface WorkflowTask {
  type: TaskType;
  label: string;
  icon: React.FC<LucideProps>;
  isEntryPoint?: boolean;
  inputs: TaskParam[];
  outputs: TaskParam[];
  credits: number;
}
