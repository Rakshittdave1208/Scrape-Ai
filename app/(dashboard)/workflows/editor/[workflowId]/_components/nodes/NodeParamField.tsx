"use client";

import { TaskParam, TaskParamType } from "@/types/task";
import StringParam from "./param/StringParam";
import BrowserInstanceParam from "./param/BrowserInstanceParam";

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
  if (param.type === TaskParamType.BROWSER_INSTANCE) {
    return (
      <BrowserInstanceParam
        param={param}
        isConnected={isConnected}
        readOnly={true}
      />
    );
  }

  switch (param.type) {
    case TaskParamType.STRING:
      return <StringParam param={param} nodeId={nodeId} disabled={disabled} />;
    default:
      return (
        <div className="w-full">
          <p className="text-xs text-muted-foreground">Not implemented</p>
        </div>
      );
  }
}

export default NodeParamField;
