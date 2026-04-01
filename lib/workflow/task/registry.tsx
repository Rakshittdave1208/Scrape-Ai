import { ApiNodeTask } from "./ApiNode";
import { AddPropertyToJsonTask } from "./AddPropertyToJson";
import { ClickElementTask } from "./ClickElement";
import { ExtractTextFromElementTask } from "./ExtractTextFromElement";
import { ExtractDataWithAiTask } from "./ExtractDataWithAi";
import { FillInputTask } from "./FillInput";
import { LaunchBrowserTask } from "./LaunchBrowser";
import { NavigateUrlTask } from "./NavigateUrl";
import { PageToHtmlTask } from "./PageToHtml";
import { ReadPropertyFromJsonTask } from "./ReadPropertyFromJson";
import { ScraperNodeTask } from "./ScraperNode";
import { ScrollToElementTask } from "./ScrollToElement";
import { SendToWebhookTask } from "./SendToWebhook";
import { TransformNodeTask } from "./TransformNode";
import { WaitForElementTask } from "./WaitForElement";

import { TaskCategory, TaskType, WorkflowTask } from "@/types/task";

type Registry = Record<TaskType, WorkflowTask>;

export const TaskRegistry: Registry = {
  [TaskType.LAUNCH_BROWSER]: LaunchBrowserTask,
  [TaskType.PAGE_TO_HTML]: PageToHtmlTask,
  [TaskType.EXTRACT_TEXT_FROM_ELEMENT]: ExtractTextFromElementTask,
  [TaskType.SCRAPER_NODE]: ScraperNodeTask,
  [TaskType.API_NODE]: ApiNodeTask,
  [TaskType.TRANSFORM_NODE]: TransformNodeTask,
  [TaskType.FILL_INPUT]: FillInputTask,
  [TaskType.CLICK_ELEMENT]: ClickElementTask,
  [TaskType.NAVIGATE_URL]: NavigateUrlTask,
  [TaskType.SCROLL_TO_ELEMENT]: ScrollToElementTask,
  [TaskType.EXTRACT_DATA_WITH_AI]: ExtractDataWithAiTask,
  [TaskType.READ_PROPERTY_FROM_JSON]: ReadPropertyFromJsonTask,
  [TaskType.ADD_PROPERTY_TO_JSON]: AddPropertyToJsonTask,
  [TaskType.WAIT_FOR_ELEMENT]: WaitForElementTask,
  [TaskType.SEND_TO_WEBHOOK]: SendToWebhookTask,
};

export const TaskCategoryOrder: TaskCategory[] = [
  "Core",
  "User Interactions",
  "Data Extraction",
  "Data Storage",
  "Timing Controls",
  "Result Delivery",
];

export const TaskRegistryByCategory = TaskCategoryOrder.reduce(
  (accumulator, category) => {
    accumulator[category] = Object.values(TaskRegistry).filter((task) => task.category === category);
    return accumulator;
  },
  {} as Record<TaskCategory, WorkflowTask[]>
);
