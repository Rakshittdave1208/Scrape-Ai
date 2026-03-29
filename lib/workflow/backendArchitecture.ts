import type { Edge, Node } from "@xyflow/react";

export type ArchitectureCategory = "client" | "api" | "service" | "infra";
export type ArchitectureNodeStatus = "idle" | "running" | "success" | "error";

export type ArchitectureNodeData = {
  label: string;
  description: string;
  category: ArchitectureCategory;
  config: Record<string, unknown>;
  cost: number;
  status: ArchitectureNodeStatus;
};

export type ArchitectureNode = Node<ArchitectureNodeData>;
export type ArchitectureEdge = Edge;

export const architectureTemplates: Array<{
  key: string;
  label: string;
  description: string;
  category: ArchitectureCategory;
  config: Record<string, unknown>;
  cost: number;
}> = [
  {
    key: "client-app",
    label: "Client App",
    description: "Frontend application that designs workflows and monitors executions.",
    category: "client",
    config: { framework: "React", surface: "dashboard" },
    cost: 100,
  },
  {
    key: "api-gateway",
    label: "API Gateway",
    description: "Routes requests, applies validation, and orchestrates backend services.",
    category: "api",
    config: { protocol: "HTTP", auth: "Clerk" },
    cost: 120,
  },
  {
    key: "service-node",
    label: "Service Node",
    description: "General business service for orchestration or domain logic.",
    category: "service",
    config: { runtime: "Node.js", scaling: "horizontal" },
    cost: 90,
  },
  {
    key: "database-node",
    label: "Database Node",
    description: "Persistent data storage for workflows, runs, and operational state.",
    category: "infra",
    config: { engine: "MongoDB", replication: "enabled" },
    cost: 140,
  },
  {
    key: "queue-node",
    label: "Queue Node",
    description: "Queue and worker dispatcher for asynchronous execution.",
    category: "infra",
    config: { engine: "Redis/BullMQ", retries: 3 },
    cost: 110,
  },
  {
    key: "external-infra",
    label: "External Infra",
    description: "External system such as Stripe webhooks or third-party integrations.",
    category: "infra",
    config: { provider: "Stripe", mode: "webhook" },
    cost: 80,
  },
];

export const backendNodes: ArchitectureNode[] = [
  {
    id: "client",
    type: "architectureNode",
    position: { x: 560, y: 48 },
    data: {
      label: "Client",
      description: "React Flow frontend for building, managing, and monitoring workflows.",
      category: "client",
      config: { framework: "React", ui: "React Flow" },
      cost: 100,
      status: "idle",
    },
  },
  {
    id: "api-gateway",
    type: "architectureNode",
    position: { x: 560, y: 240 },
    data: {
      label: "API Gateway",
      description: "Primary entry point for authenticated requests, routing, validation, and orchestration.",
      category: "api",
      config: { protocol: "HTTP", auth: "Clerk", transport: "REST" },
      cost: 120,
      status: "idle",
    },
  },
  {
    id: "auth-service",
    type: "architectureNode",
    position: { x: 40, y: 470 },
    data: {
      label: "Auth Service (Clerk)",
      description: "Handles user authentication, session verification, and identity resolution.",
      category: "service",
      config: { provider: "Clerk", tokens: "JWT" },
      cost: 90,
      status: "idle",
    },
  },
  {
    id: "workflow-service",
    type: "architectureNode",
    position: { x: 380, y: 470 },
    data: {
      label: "Workflow Service",
      description: "Manages workflow definitions, node graphs, versions, and persisted workflow state.",
      category: "service",
      config: { entity: "workflows", versioning: true },
      cost: 95,
      status: "idle",
    },
  },
  {
    id: "execution-engine",
    type: "architectureNode",
    position: { x: 720, y: 470 },
    data: {
      label: "Execution Engine",
      description: "Builds DAG execution plans, resolves dependencies, and coordinates workflow runs.",
      category: "service",
      config: { mode: "dag", retries: 3 },
      cost: 150,
      status: "idle",
    },
  },
  {
    id: "billing-service",
    type: "architectureNode",
    position: { x: 1060, y: 470 },
    data: {
      label: "Billing Service",
      description: "Tracks plans, credit usage, limits, and subscription-aware execution permissions.",
      category: "service",
      config: { credits: "daily", plans: ["FREE", "PRO"] },
      cost: 100,
      status: "idle",
    },
  },
  {
    id: "database",
    type: "architectureNode",
    position: { x: 120, y: 780 },
    data: {
      label: "Database (MongoDB)",
      description: "Stores workflows, credentials, execution logs, billing state, and usage records.",
      category: "infra",
      config: { engine: "MongoDB", persistence: "primary" },
      cost: 130,
      status: "idle",
    },
  },
  {
    id: "queue-system",
    type: "architectureNode",
    position: { x: 500, y: 780 },
    data: {
      label: "Queue System (Redis/BullMQ)",
      description: "Queues workflow jobs, handles retries, scheduling, and worker distribution.",
      category: "infra",
      config: { engine: "Redis", queue: "BullMQ" },
      cost: 120,
      status: "idle",
    },
  },
  {
    id: "node-executors",
    type: "architectureNode",
    position: { x: 900, y: 780 },
    data: {
      label: "Node Executors",
      description: "Runs task workers for Scraper, API, and Transform nodes.",
      category: "service",
      config: { executors: ["scraper", "api", "transform"] },
      cost: 110,
      status: "idle",
    },
  },
  {
    id: "stripe-webhook-handler",
    type: "architectureNode",
    position: { x: 1280, y: 780 },
    data: {
      label: "Stripe Webhook Handler",
      description: "Processes Stripe subscription and payment events to update billing state.",
      category: "infra",
      config: { provider: "Stripe", mode: "webhook" },
      cost: 80,
      status: "idle",
    },
  },
];

export const backendEdges: ArchitectureEdge[] = [
  {
    id: "edge-client-api",
    source: "client",
    target: "api-gateway",
    label: "ui requests",
  },
  {
    id: "edge-api-auth",
    source: "api-gateway",
    target: "auth-service",
    label: "auth request",
  },
  {
    id: "edge-api-workflow",
    source: "api-gateway",
    target: "workflow-service",
    label: "manage workflows",
  },
  {
    id: "edge-workflow-db",
    source: "workflow-service",
    target: "database",
    label: "store workflow",
  },
  {
    id: "edge-api-execution",
    source: "api-gateway",
    target: "execution-engine",
    label: "execute workflow",
  },
  {
    id: "edge-execution-billing",
    source: "execution-engine",
    target: "billing-service",
    label: "deduct credits",
  },
  {
    id: "edge-execution-queue",
    source: "execution-engine",
    target: "queue-system",
    label: "enqueue run",
  },
  {
    id: "edge-queue-executors",
    source: "queue-system",
    target: "node-executors",
    label: "process job",
  },
  {
    id: "edge-executors-db",
    source: "node-executors",
    target: "database",
    label: "store results",
  },
  {
    id: "edge-billing-stripe",
    source: "billing-service",
    target: "stripe-webhook-handler",
    label: "payment events",
  },
  {
    id: "edge-stripe-billing",
    source: "stripe-webhook-handler",
    target: "billing-service",
    label: "handle webhook",
  },
  {
    id: "edge-billing-db",
    source: "billing-service",
    target: "database",
    label: "persist usage",
  },
];

export const defaultArchitecture = {
  nodes: backendNodes,
  edges: backendEdges,
};
