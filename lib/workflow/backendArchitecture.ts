import type { Edge, Node } from "@xyflow/react";

export type ArchitectureCategory = "client" | "api" | "service" | "infra";
export type ArchitectureNodeStatus = "idle" | "running" | "success" | "error";

export type ArchitectureNodeData = {
  label: string;
  description: string;
  category: ArchitectureCategory;
  technology: string;
  input: string;
  error?: string | null;
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
    key: "kubernetes-cluster",
    label: "Kubernetes Cluster",
    description: "Container orchestration layer for deploying workflow services and workers.",
    category: "infra",
    config: { provider: "Kubernetes", autoscaling: true, workloads: ["api", "workers"] },
    cost: 160,
  },
  {
    key: "docker-host",
    label: "Docker Host",
    description: "Container host for packaging and running API services, workers, and utility jobs.",
    category: "infra",
    config: { runtime: "Docker", host: "VM", registry: "Docker Hub" },
    cost: 100,
  },
  {
    key: "aws-eks",
    label: "AWS EKS",
    description: "Managed Kubernetes cluster on AWS for scalable workflow workloads.",
    category: "infra",
    config: { provider: "AWS", service: "EKS", autoscaling: true },
    cost: 175,
  },
  {
    key: "aws-ecs",
    label: "AWS ECS",
    description: "Managed container orchestration for running workflow APIs and workers on AWS.",
    category: "infra",
    config: { provider: "AWS", service: "ECS", launchType: "Fargate" },
    cost: 145,
  },
  {
    key: "aws-lambda",
    label: "AWS Lambda",
    description: "Serverless execution for lightweight workflow handlers and event-driven tasks.",
    category: "infra",
    config: { provider: "AWS", service: "Lambda", trigger: "event" },
    cost: 95,
  },
  {
    key: "aws-s3",
    label: "AWS S3 Bucket",
    description: "Durable object storage for scraped files, exports, backups, and workflow artifacts.",
    category: "infra",
    config: { provider: "AWS", service: "S3", storageClass: "Standard", versioning: true },
    cost: 80,
  },
  {
    key: "aws-rds",
    label: "AWS RDS",
    description: "Managed relational database for transactional workflow metadata and billing state.",
    category: "infra",
    config: { provider: "AWS", service: "RDS", engine: "PostgreSQL" },
    cost: 135,
  },
  {
    key: "gke-cluster",
    label: "Google Kubernetes Engine",
    description: "Managed Kubernetes environment on Google Cloud for production workflow deployments.",
    category: "infra",
    config: { provider: "GCP", service: "GKE", autoscaling: true },
    cost: 170,
  },
  {
    key: "cloud-run",
    label: "Google Cloud Run",
    description: "Serverless containers for running APIs and event-driven workflow processors.",
    category: "infra",
    config: { provider: "GCP", service: "Cloud Run", scaling: "request-based" },
    cost: 105,
  },
  {
    key: "google-cloud-storage",
    label: "Google Cloud Storage",
    description: "Object storage for datasets, exports, logs, and generated workflow artifacts.",
    category: "infra",
    config: { provider: "GCP", service: "Cloud Storage", tier: "Standard" },
    cost: 80,
  },
  {
    key: "cloud-sql",
    label: "Google Cloud SQL",
    description: "Managed SQL database for workflow metadata, execution state, and application data.",
    category: "infra",
    config: { provider: "GCP", service: "Cloud SQL", engine: "PostgreSQL" },
    cost: 130,
  },
  {
    key: "cloud-load-balancer",
    label: "Cloud Load Balancer",
    description: "Distributes traffic across API and service instances in the cloud edge.",
    category: "infra",
    config: { provider: "AWS ALB", tls: true, routing: "path-based" },
    cost: 95,
  },
  {
    key: "object-storage",
    label: "Object Storage",
    description: "Stores scraped files, exports, and large workflow artifacts.",
    category: "infra",
    config: { provider: "S3", tier: "standard", versioning: true },
    cost: 85,
  },
  {
    key: "cloud-cache",
    label: "Cloud Cache",
    description: "High-speed caching layer for sessions, rate limits, and workflow state.",
    category: "infra",
    config: { provider: "Redis Cloud", mode: "cache", persistence: false },
    cost: 90,
  },
  {
    key: "observability-stack",
    label: "Observability Stack",
    description: "Centralized metrics, logs, and tracing for production workflow operations.",
    category: "infra",
    config: { logging: "ELK", metrics: "Prometheus", tracing: "OpenTelemetry" },
    cost: 105,
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
    position: { x: 780, y: 80 },
    data: {
      label: "Client",
      description: "React Flow frontend for building, managing, and monitoring workflows.",
      category: "client",
      technology: "React Flow",
      input: "",
      error: null,
      config: { framework: "React", ui: "React Flow" },
      cost: 100,
      status: "idle",
    },
  },
  {
    id: "api-gateway",
    type: "architectureNode",
    position: { x: 780, y: 280 },
    data: {
      label: "API Gateway",
      description: "Primary entry point for authenticated requests, routing, validation, and orchestration.",
      category: "api",
      technology: "HTTP Gateway",
      input: "",
      error: null,
      config: { protocol: "HTTP", auth: "Clerk", transport: "REST" },
      cost: 120,
      status: "idle",
    },
  },
  {
    id: "auth-service",
    type: "architectureNode",
    position: { x: 80, y: 560 },
    data: {
      label: "Auth Service (Clerk)",
      description: "Handles user authentication, session verification, and identity resolution.",
      category: "service",
      technology: "Clerk",
      input: "",
      error: null,
      config: { provider: "Clerk", tokens: "JWT" },
      cost: 90,
      status: "idle",
    },
  },
  {
    id: "workflow-service",
    type: "architectureNode",
    position: { x: 500, y: 560 },
    data: {
      label: "Workflow Service",
      description: "Manages workflow definitions, node graphs, versions, and persisted workflow state.",
      category: "service",
      technology: "Node.js Service",
      input: "",
      error: null,
      config: { entity: "workflows", versioning: true },
      cost: 95,
      status: "idle",
    },
  },
  {
    id: "execution-engine",
    type: "architectureNode",
    position: { x: 920, y: 560 },
    data: {
      label: "Execution Engine",
      description: "Builds DAG execution plans, resolves dependencies, and coordinates workflow runs.",
      category: "service",
      technology: "DAG Runner",
      input: "",
      error: null,
      config: { mode: "dag", retries: 3 },
      cost: 150,
      status: "idle",
    },
  },
  {
    id: "billing-service",
    type: "architectureNode",
    position: { x: 1340, y: 560 },
    data: {
      label: "Billing Service",
      description: "Tracks plans, credit usage, limits, and subscription-aware execution permissions.",
      category: "service",
      technology: "Stripe Billing",
      input: "",
      error: null,
      config: { credits: "daily", plans: ["FREE", "PRO"] },
      cost: 100,
      status: "idle",
    },
  },
  {
    id: "cloud-cache",
    type: "architectureNode",
    position: { x: 1760, y: 560 },
    data: {
      label: "Cloud Cache",
      description: "Caches sessions, workflow state, and hot execution metadata for fast reads.",
      category: "infra",
      technology: "Redis Cloud",
      input: "",
      error: null,
      config: { provider: "Redis Cloud", mode: "cache", ttl: "15m" },
      cost: 90,
      status: "idle",
    },
  },
  {
    id: "aws-eks",
    type: "architectureNode",
    position: { x: 1760, y: 900 },
    data: {
      label: "AWS EKS",
      description: "Managed Kubernetes cluster running API, execution, and worker workloads in the cloud.",
      category: "infra",
      technology: "AWS EKS",
      input: "",
      error: null,
      config: { provider: "AWS", service: "EKS", workloads: ["api", "engine", "workers"] },
      cost: 175,
      status: "idle",
    },
  },
  {
    id: "database",
    type: "architectureNode",
    position: { x: 80, y: 900 },
    data: {
      label: "Database (MongoDB)",
      description: "Stores workflows, credentials, execution logs, billing state, and usage records.",
      category: "infra",
      technology: "MongoDB",
      input: "",
      error: null,
      config: { engine: "MongoDB", persistence: "primary" },
      cost: 130,
      status: "idle",
    },
  },
  {
    id: "queue-system",
    type: "architectureNode",
    position: { x: 500, y: 900 },
    data: {
      label: "Queue System (Redis/BullMQ)",
      description: "Queues workflow jobs, handles retries, scheduling, and worker distribution.",
      category: "infra",
      technology: "Redis / BullMQ",
      input: "",
      error: null,
      config: { engine: "Redis", queue: "BullMQ" },
      cost: 120,
      status: "idle",
    },
  },
  {
    id: "node-executors",
    type: "architectureNode",
    position: { x: 920, y: 900 },
    data: {
      label: "Node Executors",
      description: "Runs task workers for Scraper, API, and Transform nodes.",
      category: "service",
      technology: "Worker Pool",
      input: "",
      error: null,
      config: { executors: ["scraper", "api", "transform"] },
      cost: 110,
      status: "idle",
    },
  },
  {
    id: "stripe-webhook-handler",
    type: "architectureNode",
    position: { x: 1340, y: 900 },
    data: {
      label: "Stripe Webhook Handler",
      description: "Processes Stripe subscription and payment events to update billing state.",
      category: "infra",
      technology: "Stripe Webhooks",
      input: "",
      error: null,
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
    id: "edge-api-cache",
    source: "api-gateway",
    target: "cloud-cache",
    label: "cache sessions",
  },
  {
    id: "edge-workflow-db",
    source: "workflow-service",
    target: "database",
    label: "store workflow",
  },
  {
    id: "edge-workflow-cache",
    source: "workflow-service",
    target: "cloud-cache",
    label: "cache graph state",
  },
  {
    id: "edge-api-execution",
    source: "api-gateway",
    target: "execution-engine",
    label: "execute workflow",
  },
  {
    id: "edge-eks-api",
    source: "aws-eks",
    target: "api-gateway",
    label: "host api pods",
  },
  {
    id: "edge-eks-engine",
    source: "aws-eks",
    target: "execution-engine",
    label: "run engine pods",
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
    id: "edge-eks-workers",
    source: "aws-eks",
    target: "node-executors",
    label: "scale workers",
  },
  {
    id: "edge-executors-db",
    source: "node-executors",
    target: "database",
    label: "store results",
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
