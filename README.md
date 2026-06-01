# ScraperFlow: Universal AI Workflow Automation Platform

[![Enterprise Grade](https://img.shields.io/badge/Enterprise-Grade-blue.svg)]()
[![Architecture](https://img.shields.io/badge/Architecture-Universal-emerald.svg)]()
[![Runtime](https://img.shields.io/badge/Runtime-Multi--Language-orange.svg)]()

**ScraperFlow** is a next-generation, universal AI automation infrastructure designed for enterprise-scale orchestration. Unlike static workflow editors, ScraperFlow is a dynamic execution platform built on the principles of total decoupling and schema-driven intelligence.

---

## 🏛 Principal Architect Vision

ScraperFlow is engineered to be the operating system for enterprise integrations. It serves as:
- **Universal Automation Infrastructure:** Connect any backend, any API, any runtime.
- **Runtime Orchestration Engine:** Managing complex lifecycles across distributed systems.
- **Dynamic Node Generation System:** AI-powered node generation from OpenAPI/Swagger specs.
- **Multi-Language Runtime:** Native support for Node.js, Python, Java, Go, and Docker sandboxes.

---

## 🏗 Core Architectural Pillars

### 1. Frontend → Dynamic Visual Renderer
A strictly visual orchestration layer. ZERO hardcoded node logic. All nodes, forms, and handles are rendered dynamically from JSON schemas.

### 2. Backend → Runtime Execution Engine
The brain of the platform. Controls credential injection, retry logic, queue management, and provider communication.

### 3. Connectors → Pluggable Provider System
A modular bridge to third-party services. Designed for "plug-and-play" integration with any external API or legacy system.

### 4. Runtime Layer → Multi-Language Execution
Distributed execution infrastructure supporting remote runtimes via HTTP, gRPC, or persistent WebSockets.

---

## 🔐 Enterprise RBAC & Governance

Built for Fortune 500 compliance and multi-team collaboration.

### Hierarchical Role System
`SUPER_ADMIN` > `ORG_ADMIN` > `WORKSPACE_ADMIN` > `DEVELOPER` > `EDITOR` > `EXECUTOR` > `VIEWER`

### Advanced Features
- **Authority Inheritance:** Higher authority roles automatically inherit and can override lower-level permissions.
- **Workflow Locking:** Real-time edit sessions to prevent concurrent conflict.
- **Approval Pipeline:** Strict `Draft → Review → Approved → Published` lifecycle for production safety.
- **Immutable Audit Logs:** Every action (edits, executions, permission changes) is recorded for forensic compliance.

---

## 🚀 Core Features

- **Dynamic Nodes:** Fully JSON-driven node definitions.
- **Personal Nodes:** Users can define and store custom nodes in their own database.
- **API Ingestion:** Instant node generation from OpenAPI/Swagger imports.
- **Credential Manager:** Secure, isolated secret storage (secrets never touch workflow JSON).
- **Queue Workers:** Built for horizontal scalability and high-volume processing.
- **Docker Sandbox:** Secure execution of untrusted scripts in isolated environments.

---

## 🛠 Node Standard (JSON-Driven)

Every node in the system follows a strict, metadata-rich schema:

```json
{
  "id": "node-unique-id",
  "provider": "openai | stripe | custom",
  "runtime": "node | python | api",
  "schema": {
    "inputSchema": { ... },
    "outputSchema": { ... }
  },
  "execution": {
    "handler": "execution-path",
    "config": { ... }
  },
  "inputs": [],
  "outputs": []
}
```

---

## 💻 Technical Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** Prisma ORM (Enterprise Multi-Tenancy)
- **Auth:** Clerk (Enterprise SSO Ready)
- **UI:** Custom Sharp-Edge Design System (Clash Display + Inter)
- **Canvas:** @xyflow/react

---

## 🤝 Contributing

This platform is architected for scale. Please refer to `GEMINI.md` for the absolute architectural rules and design system mandates before submitting a pull request.

---

**Intelligent Hiring. Automated.** *(Note: Visual Identity Inspiration)*
**Universal Automation. Realized.**
