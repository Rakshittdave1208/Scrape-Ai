# ScraperFlow: Universal AI Workflow Automation Platform

## Principal Architect Vision
ScraperFlow is not just a workflow editor; it is universal AI automation infrastructure. It serves as a runtime orchestration engine and pluggable connector platform, designed for enterprise-scale integration.

## Architecture: The Three Pillars

### 1. Frontend: Dynamic Visual Renderer
- **Responsibility:** Strictly visual orchestration.
- **Constraints:** ZERO hardcoded node logic. All nodes, forms, and handles are rendered dynamically from schemas.
- **Interactions:** Drag-and-drop, state synchronization, and execution monitoring.

### 2. Backend: Runtime Execution Engine
- **Responsibility:** Orchestration of the workflow lifecycle.
- **Key Features:** Credential injection, retry logic, queue management, and provider communication.
- **Security:** Secrets are NEVER stored in workflow definitions.

### 3. Runtime Layer: Multi-Language Infrastructure
- **Capability:** Support for Node.js, Python, Java, Go, and Dockerized environments.
- **Execution:** Remote execution via HTTP, gRPC, or persistent WebSockets.

## Absolute Rules for Development

### NEVER
- **Hardcode:** No hardcoded providers, node types, or provider-specific architecture.
- **Tight Coupling:** No business logic in the UI; no UI assumptions in the backend.
- **Switches:** Use of `switch(node.type)` for core logic is forbidden. Use registration patterns and strategy maps.
- **Leakage:** Secrets must be stored in a dedicated credential manager, not in the workflow JSON.

### ALWAYS
- **Schema-Driven:** Everything from UI forms to execution steps must be driven by JSON schemas.
- **Plugin Architecture:** Design for a pluggable provider system from day one.
- **AI-Ready:** Ensure the system can ingest OpenAPI/Swagger to generate nodes dynamically via AI.
- **Enterprise-Scale:** Optimize for queue-based workers and horizontal scalability.

## Node Schema Standard
Every node must conform to the following conceptual structure:
```json
{
  "id": "unique-id",
  "provider": "e.g., openai, stripe, local",
  "runtime": "node | python | docker",
  "schema": { "inputSchema": {}, "outputSchema": {} },
  "execution": { "handler": "path/to/function", "config": {} },
  "inputs": [],
  "outputs": []
}
```

## Global UI Rules (Visual Inspiration)
- **Mode:** Full Light & Dark mode support.
- **Corners:** Sharp edges only (0px to 2px radius).
- **Typography:** **Clash Display** (via Syne) for headings, **Inter** for body.
- **Palette:** Dark mode uses `#050505` background and `#7DD3FC` primary accent.

---

# Enterprise RBAC & Multi-Tenancy

## 1. Multi-User & Multi-Organization
The platform must implement strict organizational isolation. Every resource (workflow, credential, log) belongs to an **Organization** and a **Workspace**. Cross-organization access is strictly forbidden.

## 2. Role-Based Access Control (RBAC) & Hierarchy
### Authority Inheritance Rule
Higher authority roles always inherit permissions from lower roles.
`SUPER_ADMIN` > `ORG_ADMIN` > `WORKSPACE_ADMIN` > `DEVELOPER` > `EDITOR` > `EXECUTOR` > `VIEWER`.

### Edit Access Rules
- **VIEWER:** Read-only access to workflows and results.
- **EXECUTOR:** Execute workflows only. Cannot edit or view logic details.
- **EDITOR:** Edit workflow nodes. Cannot change permissions.
- **DEVELOPER:** Modify node schemas and add integrations.
- **WORKSPACE_ADMIN:** Full workspace management, including permissions.
- **ORG_ADMIN:** Full control within an organization.
- **SUPER_ADMIN:** Full platform-wide authority.

### Role Assignment Constraints
- **Admin Exclusivity:** Roles can ONLY be assigned or modified by an `ORG_ADMIN` or `SUPER_ADMIN`.
- **Immutable Admin Rule:** The roles of `ORG_ADMIN` and `SUPER_ADMIN` are protected. No user (regardless of authority) can demote or change the role of an existing `ORG_ADMIN` or `SUPER_ADMIN` to ensure organization stability and prevent lockouts.

## 3. Workflow Governance & Approval Flow
### Workflow Locking
- Implement edit sessions and workflow locking to prevent concurrent edit conflicts.
- Support "Protected" production workflows that require admin approval to modify.

### Approval Pipeline
Workflow state transitions must follow:
`Draft` → `Review` → `Approved` → `Published`
- **Editors:** Can create and edit drafts.
- **Admins:** Can approve workflows for publication.
- **Super Admins:** Can override any state.

## 4. Security & Authorization Architecture
### Backend Mandate
- NEVER trust frontend permissions.
- Always validate roles, organization ownership, and permission scopes on the backend.

### Centralized Authorization
- Permissions must NEVER be hardcoded.
- Use **Policy-Based Access Control (PBAC)** or dynamic permission middleware.
- Design for future SSO, SCIM, and ABAC (Attribute-Based Access Control) support.

## 5. Audit Logging
EVERY action must be logged in a centralized audit system, including:
- **Details:** `userId`, `role`, `timestamp`, `ipAddress`, `action`, `resourceId`, `metadata`.
- **Scope:** Workflow edits, node changes, credential access, execution triggers, and permission modifications.
