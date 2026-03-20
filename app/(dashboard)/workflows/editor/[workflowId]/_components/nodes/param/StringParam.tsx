"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TaskParam } from "@/types/task";
import { useReactFlow } from "@xyflow/react";
import { CaseSensitiveIcon, LinkIcon, PencilLineIcon } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import { AppNode } from "@/types/appNode";

function StringParam({
  param,
  nodeId,
  disabled,
}: {
  param: TaskParam;
  nodeId: string;
  disabled: boolean;
}) {
  const id = useId();
  const { updateNodeData, getNode } = useReactFlow();
  const node = getNode(nodeId) as AppNode;
  const [internalValue, setInternalValue] = useState(
    node?.data?.inputs?.[param.name] || ""
  );
  const [isFocused, setIsFocused] = useState(false);
  const trimmedValue = internalValue.trim();
  const isUrlField = param.inputType === "url";
  const looksLikeUrl =
    !isUrlField || trimmedValue.length === 0 || /^https?:\/\/.+/i.test(trimmedValue);
  const hasValue = trimmedValue.length > 0;

  useEffect(() => {
    setInternalValue(node?.data?.inputs?.[param.name] || "");
  }, [node?.data?.inputs, param.name]);

  const updateValue = useCallback(
    (newValue: string) => {
      const currentNode = getNode(nodeId) as AppNode | undefined;

      updateNodeData(nodeId, {
        inputs: {
          ...currentNode?.data?.inputs,
          [param.name]: newValue,
        },
      });
    },
    [getNode, nodeId, param.name, updateNodeData]
  );

  return (
    <div
      className={`nodrag w-full rounded-md border p-3 transition-colors ${
        disabled
          ? "border-border/60 bg-muted/30"
          : isFocused
            ? "border-primary bg-primary/5"
            : "border-border/80 bg-background/80"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PencilLineIcon size={14} className="text-primary" />
          <Label htmlFor={id} className="flex select-text text-xs font-medium">
            {param.name}
            {param.required && <span className="px-2 text-red-400">*</span>}
          </Label>
        </div>
        <Badge variant="outline" className="select-text gap-1 text-[10px] uppercase tracking-wide">
          {isUrlField ? <LinkIcon size={10} /> : <CaseSensitiveIcon size={10} />}
          {isUrlField ? "URL" : "String"}
        </Badge>
      </div>

      <Input
        id={id}
        type={param.inputType ?? "text"}
        disabled={disabled}
        className="nodrag border-none bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
        value={internalValue}
        onChange={(e) => {
          const newValue = e.target.value;
          setInternalValue(newValue);
          updateValue(newValue);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={param.placeholder ?? "Enter value here"}
      />

      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {disabled
            ? "Connected from another node"
            : !hasValue && param.required
              ? "Required"
              : isUrlField && !looksLikeUrl
                ? "Enter a valid URL starting with http:// or https://"
                : "Manual value ready"}
        </span>
        <span className="select-text">{internalValue.length} chars</span>
      </div>

      {param.helperText && <p className="mt-2 select-text text-[11px] text-muted-foreground">{param.helperText}</p>}
    </div>
  );
}

export default StringParam;
