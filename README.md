ScrapeFlow

ScrapeFlow is a visual workflow builder for web scraping automation. It allows users to design scraping pipelines using a node-based interface, manage credentials securely, and persist workflows for execution.

Unlike simple scraping tools, ScrapeFlow is built as a mini SaaS platform, combining a visual editor with backend systems for authentication, storage, and future execution pipelines.

✨ Key Features
🧠 Visual Workflow Builder

Drag-and-drop node editor powered by React Flow

Create complex scraping pipelines visually

Connect node outputs → inputs dynamically

Extendable node system via task registry

🔐 Secure Credential Management

Store API keys, cookies, headers, and login credentials

Secrets are masked in UI

Credentials scoped per user

Prevents raw secret exposure in workflows

💾 Workflow Persistence

Save workflows to database

Reload and edit existing flows

Graph structure stored as JSON

👤 Authentication System

Clerk-based authentication

User-specific workflows and credentials

Access control on all resources

🧩 Registry-Based Node System

Each node is defined via metadata:

label

icon

inputs

outputs

Dynamic rendering of nodes

Easy to extend with new scraping tasks

🏗️ Architecture Overview

ScrapeFlow follows a modular SaaS architecture:

Frontend (Next.js + React Flow)
        ↓
API Layer (Next.js Server Actions / Routes)
        ↓
Database (Prisma + SQLite)
        ↓
Auth Layer (Clerk)
Core Modules

Workflow Engine (UI) → Node editor & graph builder

Credential Manager → Secure storage of secrets

Task Registry → Defines node types

Persistence Layer → Saves workflows & credentials

Auth Layer → User isolation & protection

🛠️ Tech Stack
Frontend

Next.js 14 (App Router)

React 18

TypeScript

Tailwind CSS

Radix UI / shadcn components

React Hook Form

Zod (validation)

@xyflow/react (React Flow)

Backend

Next.js API / Server Actions

Prisma ORM

SQLite (dev database)

Authentication

Clerk

📂 Project Structure (Simplified)
/app
  /dashboard
  /workflows
  /credentials

/components
  /ui
  /workflow-editor
  /nodes

/lib
  /prisma
  /auth
  /validators

/registry
  taskRegistry.ts

/prisma
  schema.prisma
⚙️ Getting Started
1. Clone the Repository
git clone https://github.com/your-username/scrapeflow.git
cd scrapeflow
2. Install Dependencies
npm install
3. Setup Environment Variables

Create a .env file:

DATABASE_URL="file:./dev.db"

# Clerk (example)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
4. Setup Database
npx prisma migrate dev
5. Run the App
npm run dev

Open:

👉 http://localhost:3000

🔐 Credential Handling Design

ScrapeFlow follows strict rules for handling sensitive data:

❌ Raw secrets are never stored in workflow JSON

✅ Credentials are stored separately and referenced via credentialId

🔒 Values are masked in UI (••••••)

👤 Scoped per user for isolation

🧩 Node System Design

Each node is defined via a task registry:

{
  type: "HTTP_REQUEST",
  label: "HTTP Request",
  icon: "Globe",
  inputs: [...],
  outputs: [...]
}
Benefits:

Plug-and-play extensibility

No hardcoding UI for nodes

Easy to add new scraping steps

🚧 Current Limitations

No execution engine yet

No real-time scraping

SQLite (not production-ready)

No background job processing

Limited node types

🛣️ Roadmap
🔥 Phase 1 (In Progress)

Workflow execution engine

Credential injection into nodes

Node runtime system

⚙️ Phase 2

Background job queue (BullMQ / Redis)

Execution logs & debugging

Retry & failure handling

💰 Phase 3

Usage tracking

Billing system (credits/subscription)

Rate limits

📊 Phase 4

Analytics dashboard

Workflow performance insights

💡 Future Vision

ScrapeFlow aims to become:

A Zapier-like automation platform for web scraping

Where users can:

Automate data extraction

Chain scraping workflows

Integrate with APIs and databases

Run workflows at scale

🤝 Contributing

Contributions are welcome!

Fork the repo

Create a feature branch

Commit your changes

Open a pull request

📜 License

MIT License

👨‍💻 Author

Rakshit Dave

MERN Stack Developer

Building scalable SaaS products

Interested in automation, AI, and system design