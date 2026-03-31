import type { Edge } from "@xyflow/react";

import { createFlowNode } from "@/lib/workflow/createFlowNode";
import type { AppNode } from "@/types/appNode";
import { TaskType } from "@/types/task";

function createSampleProductWorkflowNodes(): AppNode[] {
  const launchBrowser = createFlowNode(TaskType.LAUNCH_BROWSER, { x: 80, y: 220 });
  launchBrowser.data.inputs = {
    "Website Url": "https://shop.example.com/products/wireless-headphones",
  };

  const pageToHtml = createFlowNode(TaskType.PAGE_TO_HTML, { x: 430, y: 220 });

  const extractText = createFlowNode(TaskType.EXTRACT_TEXT_FROM_ELEMENT, { x: 800, y: 220 });
  extractText.data.inputs = {
    Selector: ".product-title",
  };

  return [launchBrowser, pageToHtml, extractText];
}

function createSampleProductWorkflowEdges(nodes: AppNode[]): Edge[] {
  const [launchBrowser, pageToHtml, extractText] = nodes;

  return [
    {
      id: `edge-${launchBrowser.id}-${pageToHtml.id}`,
      source: launchBrowser.id,
      target: pageToHtml.id,
      sourceHandle: "Web page",
      targetHandle: "Web page",
      animated: true,
    },
    {
      id: `edge-${pageToHtml.id}-${extractText.id}`,
      source: pageToHtml.id,
      target: extractText.id,
      sourceHandle: "Html",
      targetHandle: "Html",
      animated: true,
    },
  ];
}

export function createSampleProductWorkflow() {
  const nodes = createSampleProductWorkflowNodes();
  const edges = createSampleProductWorkflowEdges(nodes);

  return {
    nodes,
    edges,
    viewport: {
      x: 0,
      y: 0,
      zoom: 0.9,
    },
  };
}

export function createSampleProductWorkflowDefinition() {
  return JSON.stringify(createSampleProductWorkflow());
}
