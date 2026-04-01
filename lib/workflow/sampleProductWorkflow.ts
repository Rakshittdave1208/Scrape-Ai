import type { Edge } from "@xyflow/react";

import { createFlowNode } from "@/lib/workflow/createFlowNode";
import type { AppNode } from "@/types/appNode";
import { TaskType } from "@/types/task";

function createSampleProductWorkflowNodes(): AppNode[] {
  const launchBrowser = createFlowNode(TaskType.LAUNCH_BROWSER, { x: 80, y: 210 });
  launchBrowser.data.inputs = {
    "Website Url": "https://shop.example.com/products/wireless-headphones",
  };

  const pageToHtml = createFlowNode(TaskType.PAGE_TO_HTML, { x: 420, y: 210 });

  const extractTitle = createFlowNode(TaskType.EXTRACT_TEXT_FROM_ELEMENT, { x: 790, y: 90 });
  extractTitle.data.inputs = {
    Selector: ".product-title",
  };

  const extractPrice = createFlowNode(TaskType.EXTRACT_TEXT_FROM_ELEMENT, { x: 790, y: 330 });
  extractPrice.data.inputs = {
    Selector: ".product-price",
  };

  const scraperNode = createFlowNode(TaskType.SCRAPER_NODE, { x: 1040, y: 520 });
  scraperNode.data.inputs = {
    "Target URL": "https://shop.example.com/api/products/wireless-headphones",
  };

  const transformNode = createFlowNode(TaskType.TRANSFORM_NODE, { x: 1390, y: 520 });
  transformNode.data.inputs = {
    Template: "Product summary: {{value}}",
  };

  const apiNode = createFlowNode(TaskType.API_NODE, { x: 1740, y: 520 });
  apiNode.data.inputs = {
    Endpoint: "https://inventory-api.example.com/v1/products/import",
  };

  return [launchBrowser, pageToHtml, extractTitle, extractPrice, scraperNode, transformNode, apiNode];
}

function createSampleProductWorkflowEdges(nodes: AppNode[]): Edge[] {
  const [launchBrowser, pageToHtml, extractTitle, extractPrice, scraperNode, transformNode, apiNode] = nodes;

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
      id: `edge-${pageToHtml.id}-${extractTitle.id}`,
      source: pageToHtml.id,
      target: extractTitle.id,
      sourceHandle: "Html",
      targetHandle: "Html",
      animated: true,
    },
    {
      id: `edge-${pageToHtml.id}-${extractPrice.id}`,
      source: pageToHtml.id,
      target: extractPrice.id,
      sourceHandle: "Html",
      targetHandle: "Html",
      animated: true,
    },
    {
      id: `edge-${scraperNode.id}-${transformNode.id}`,
      source: scraperNode.id,
      target: transformNode.id,
      sourceHandle: "responseBody",
      targetHandle: "Source",
      animated: true,
    },
    {
      id: `edge-${scraperNode.id}-${apiNode.id}`,
      source: scraperNode.id,
      target: apiNode.id,
      sourceHandle: "metadata",
      targetHandle: "Payload",
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
      x: -120,
      y: -40,
      zoom: 0.72,
    },
  };
}

export function createSampleProductWorkflowDefinition() {
  return JSON.stringify(createSampleProductWorkflow());
}
