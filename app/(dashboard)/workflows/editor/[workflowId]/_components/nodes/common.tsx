import { TaskParamType } from "@/types/task";

export const ColorForHandle: Record<string, string> = {
  [TaskParamType.BROWSER_INSTANCE]: "!bg-amber-400",
  [TaskParamType.STRING]: "!bg-violet-400",
};
