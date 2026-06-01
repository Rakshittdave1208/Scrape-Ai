# ScraperFlow: Universal AI Workflow Automation Platform

[![Enterprise Grade](https://img.shields.io/badge/Enterprise-Grade-blue.svg)]()
[![Architecture](https://img.shields.io/badge/Architecture-Universal-emerald.svg)]()
[![Runtime](https://img.shields.io/badge/Runtime-Multi--Language-orange.svg)]()
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-blue.svg)](https://www.prisma.io/)

**ScraperFlow** is a next-generation, universal AI automation infrastructure designed for enterprise-scale orchestration. Built with total decoupling and schema-driven intelligence, it provides a powerful visual interface for building complex scraping and automation pipelines.

---

## 🏛 Principal Architect Vision

ScraperFlow is engineered to be the operating system for enterprise integrations. It serves as:
- **Universal Automation Infrastructure:** Connect any backend, any API, any runtime.
- **Runtime Orchestration Engine:** Managing complex lifecycles across distributed systems.
- **Dynamic Node Generation System:** AI-powered node generation from OpenAPI/Swagger specs.

---

## 🚀 Key Features

- **Visual Workflow Builder:** Drag-and-drop interface powered by [React Flow](https://reactflow.dev/).
- **AI-Powered Extraction:** Leverage AI to extract structured data from any webpage.
- **Enterprise RBAC:** Sophisticated multi-tenancy with Organizations, Workspaces, and hierarchical roles.
- **Secure Credential Management:** Isolated storage for API keys and secrets.
- **Real-time Credit System:** Integrated billing and credit tracking (Stripe).
- **Audit Logging:** Immutable records of every action for compliance and forensics.

---

## 🛠 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **ORM** | Prisma (SQLite/PostgreSQL) |
| **Authentication** | Clerk (Enterprise SSO Ready) |
| **Payments** | Stripe |
| **Styling** | Tailwind CSS + Lucide Icons |
| **Canvas** | @xyflow/react |

---

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Rakshittdave1208/Scrape-Ai.git
   cd Scrape-Ai/scrape-flow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root and add the following:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PRO_PRICE_ID=your_stripe_price_id
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Initialize the Database:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

---

## 🏗 Architectural Pillars

1. **Frontend:** Dynamic Visual Renderer (Schema-driven UI).
2. **Backend:** Runtime Execution Engine (Node orchestration).
3. **Connectors:** Pluggable Provider System (Modular APIs).
4. **Governance:** Strict RBAC and Approval Pipelines.

---

## 🤝 Contributing

We welcome contributions! Please refer to [GEMINI.md](./GEMINI.md) for our absolute architectural rules and design system mandates before submitting a pull request.

---

**Universal Automation. Realized.**
