"use client";

import { TaskParam, TaskParamType } from "@/types/task";
import StringParam from "./param/StringParam";
import BrowserInstanceParam from "./param/BrowserInstanceParam";

const ParamComponentMap: Record<TaskParamType, React.ComponentType<any>> = {
  [TaskParamType.STRING]: StringParam,
  [TaskParamType.NUMBER]: StringParam,
  [TaskParamType.JSON]: StringParam,
  [TaskParamType.BROWSER_INSTANCE]: BrowserInstanceParam,
};

function NodeParamField({
  param,
  nodeId,
  disabled,
  isConnected,
}: {
  param: TaskParam;
  nodeId: string;
  disabled: boolean;
  isConnected: boolean;
}) {
  const Component = ParamComponentMap[param.type];

  if (!Component) {
    return (
      <div className="w-full">
        <p className="text-xs text-muted-foreground">Not implemented ({param.type})</p>
      </div>
    );
  }

  return (
    <Component
      param={param}
      nodeId={nodeId}
      disabled={disabled}
      isConnected={isConnected}
      readOnly={param.type === TaskParamType.BROWSER_INSTANCE}
    />
  );
}

export default NodeParamField;
