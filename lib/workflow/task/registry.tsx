import { ApiNodeTask } from "./ApiNode";
import { ExtractTextFromElementTask } from "./ExtractTextFromElement";
import { LaunchBrowserTask } from "./LaunchBrowser";
import { PageToHtmlTask } from "./PageToHtml";
import { ScraperNodeTask } from "./ScraperNode";
import { TransformNodeTask } from "./TransformNode";

import { TaskCategory, TaskType, WorkflowTask } from "@/types/task";

type Registry = Record<TaskType, WorkflowTask>;

export const TaskRegistry: Registry = {
  [TaskType.LAUNCH_BROWSER]: LaunchBrowserTask,
  [TaskType.PAGE_TO_HTML]: PageToHtmlTask,
  [TaskType.EXTRACT_TEXT_FROM_ELEMENT]: ExtractTextFromElementTask,
  [TaskType.SCRAPER_NODE]: ScraperNodeTask,
  [TaskType.API_NODE]: ApiNodeTask,
  [TaskType.TRANSFORM_NODE]: TransformNodeTask,
};

export const TaskCategoryOrder: TaskCategory[] = ["Core", "Browser", "Extraction"];

export const TaskRegistryByCategory = TaskCategoryOrder.reduce(
  (accumulator, category) => {
    accumulator[category] = Object.values(TaskRegistry).filter((task) => task.category === category);
    return accumulator;
  },
  {} as Record<TaskCategory, WorkflowTask[]>
);
