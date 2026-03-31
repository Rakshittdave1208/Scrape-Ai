# ScrapeFlow

ScrapeFlow is a node-based workflow builder for scraping and automation. It combines a visual React Flow editor, user-scoped credential management, architecture canvas templates, and an evolving billing system inside a Next.js dashboard.

## Features

- Visual workflow editor for building scraping pipelines with nodes and edges
- Registry-driven task system for adding new node types
- Credential vault with masked secrets and per-user ownership
- Architecture canvas with editable backend system templates
- Clerk authentication for protected dashboard access
- Prisma + SQLite persistence for local development
- Billing foundation with Stripe checkout setup

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui + Radix UI
- `@xyflow/react`
- Prisma 7
- SQLite
- Clerk
- Stripe

## Project Structure

```text
scrape-flow/
├─ app/
│  ├─ (auth)/
│  ├─ (dashboard)/
│  │  ├─ (home)/
│  │  ├─ architecture/
│  │  ├─ billing/
│  │  ├─ credentials/
│  │  └─ workflows/
│  ├─ api/
│  ├─ globals.css
│  └─ layout.tsx
├─ actions/
│  ├─ billing/
│  ├─ credentials/
│  └─ workflows/
├─ components/
│  ├─ providers/
│  ├─ ui/
│  └─ uiii/
├─ hooks/
│  ├─ useCanvasState.ts
│  ├─ useCredits.ts
│  └─ useWorkflowCanvas.ts
├─ lib/
│  ├─ billing/
│  ├─ generated/
│  ├─ helper/
│  ├─ workflow/
│  ├─ defaultArchitecture.ts
│  ├─ prisma.ts
│  └─ stripe.ts
├─ prisma/
│  ├─ migrations/
│  ├─ schema.prisma
│  └─ dev.db
├─ public/
├─ schema/
│  ├─ credentials.ts
│  └─ workflow.ts
├─ types/
│  ├─ appNode.ts
│  ├─ task.ts
│  └─ workflow.ts
├─ middleware.ts
├─ package.json
├─ prisma.config.ts
└─ tailwind.config.ts
```

## Important Areas

### `app/(dashboard)/workflows`

Contains the workflow listing page and the workflow editor route. This is the main product area for creating and editing automation flows.

### `app/(dashboard)/credentials`

Contains the credentials management UI for creating, editing, and deleting user-owned secrets and connection values.

### `app/(dashboard)/architecture`

Contains the editable backend architecture canvas with a node palette, inspector panel, and local persistence.

### `actions/`

Server Actions for workflow CRUD, credential CRUD, and billing-related operations.

### `lib/workflow/`

Core workflow logic such as task registry definitions, sample flows, node creation, and graph helpers.

### `schema/`

Zod validation schemas for workflows and credentials.

### `prisma/`

Database schema, migrations, and local SQLite database for development.

## Clone and Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Rakshittdave1208/Scrape-Ai.git
cd Scrape-Ai/scrape-flow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment variables

Create a `.env.local` file in `scrape-flow/` with the following values:

```env
DATABASE_URL="file:./dev.db"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"

NEXT_PUBLIC_APP_URL="http://localhost:3000"

STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_PRO_PRICE_ID="your_stripe_price_id"
```

Notes:

- `DATABASE_URL` is required for Prisma and local SQLite.
- Clerk keys are required to access authenticated dashboard routes.
- Stripe values are only needed for billing checkout features.

### 4. Run Prisma migrations

```bash
npx prisma migrate dev
```

### 5. Generate the Prisma client

```bash
npx prisma generate
```

### 6. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Local Development Notes

- The app uses SQLite for local development.
- Workflow and architecture canvas state are also persisted in local storage for some UI experiences.
- Credentials are scoped by `userId` and shown in masked form in the UI.
- Billing is partially integrated and expects Stripe configuration for checkout.

## Current Product Areas

### Workflow Builder

- Add nodes from a task menu
- Connect nodes on a React Flow canvas
- Save workflow definitions as JSON
- Edit node inputs and graph structure

### Credentials

- Create structured credentials
- Edit or delete existing credentials
- Hide raw secret values in list views

### Architecture Canvas

- Start from a default backend architecture template
- Drag in new nodes from a sidebar
- Edit node labels, descriptions, technology, and config
- Save, reset, clear, and simulate the canvas

### Billing

- Free and Pro plan configuration
- Stripe checkout session creation
- Credits-oriented product direction

## Security Notes

- Credentials are user-scoped.
- Raw secret values should not be embedded directly into workflow JSON.
- Sensitive values are masked in the UI.
- Update and delete flows should always validate ownership server-side.

## Roadmap

- Workflow execution engine
- Credential injection into runtime nodes
- Queue workers for async execution
- Run history and execution logs
- Better billing state synchronization with Stripe webhooks

## Repository

GitHub:

```text
https://github.com/Rakshittdave1208/Scrape-Ai
```
