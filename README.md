# BCC007 Pay - Member & Payment Management System

A production-ready member management and payment processing platform built for Brilliant Child College 2007 alumni to manage dues, events, and help-desk operations with real-time updates and secure automated flows.

---

## 🛠 Tech Stack

### Frontend

- **Framework**: [React Router v7](https://reactrouter.com/) (Framework Mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Components**: UI components based on [shadcn/ui](https://ui.shadcn.com/)
- **Client State**: [TanStack Query](https://tanstack.com/query/latest) & React Context

### Backend

- **Framework**: [Express.js](https://expressjs.com/) with TypeScript
- **Contract**: [ts-rest](https://ts-rest.com/) for type-safe API communication
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Payments**: [Paystack API](https://paystack.com/docs/)
- **Background Jobs**: [Upstash QStash/Workflow](https://upstash.com/docs/qstash/workflow)
- **Real-time**: [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)

---

## 🚀 Application Flows

### 1. User Authentication & Onboarding

The system uses a two-tier onboarding process to ensure all members are verified and have complete profiles.

- **Registration**: Admins can register members. New members receive a temporary password via email (Upstash QStash).
- **First Login**: Members log in, verify their email, and complete their profile information.
- **Onboarding Checklist**:
  - [ ] Basic Info (Phone, Gender, Location, Occupation)
  - [ ] Update Profile Avatar (Cloudinary)
  - [ ] Complete Bank Details (for future payouts or transfers)
- **Completion**: Once all steps are completed, the `isOnboarded` status is updated, and the user gains full access to the dashboard.

### 2. Financial & Payment Flow (Paystack)

The core of the application is a secure payment processing engine for dues, event fees, and donations.

- **Initialization**: A member selects a payment type (e.g., Monthly Dues). The client calls `initializePayment`, and the server communicates with Paystack to generate a unique transaction reference and checkout URL.
- **Processing**: The user is redirected to Paystack's secure portal to complete the transaction.
- **Verification**: After payment, the user is redirected back to `/dashboard/payments/verify`. The server then confirms the status with Paystack's API.
- **Sync & SSE**: Once verified, the transaction is recorded in MongoDB. An SSE event (`payment:completed`) is broadcasted to all logged-in sessions to update UI stats in real-time.

### 3. Events & Engagement

- **Event Creation**: Admins create events with descriptions, dates, and optional fees.
- **Engagement**: Members can mark interest in events.
- **Payments**: If an event has a fee, members can pay directly through the integrated payment flow.

### 4. Help Desk & Support

- **Ticketing**: Members can create support tickets for technical or payment-related issues.
- **Resolution**: Admins manage tickets from the dashboard, assigning staff and updating status (Open -> In-Progress -> Resolved).
- **Communication**: Status updates trigger real-time notifications to the affected member via SSE.

### 5. Real-time Notifications (SSE)

The application maintains a persistent connection (`/api/v1/sse/stream`) to keep the dashboard alive without manual refreshes.

- Broadcasts include: `payment:completed`, `ticket:updated`, `event:created`, and `member:created`.
- These events automatically trigger TanStack Query cache invalidations, ensuring the UI always displays fresh data.

---

## 📁 Project Structure

```text
├── client/                 # React Router 7 Frontend
│   ├── app/
│   │   ├── components/     # UI & Shared Components
│   │   ├── context/        # Stores & Application State
│   │   ├── features/       # Feature-specific logic (dashboard, payments, etc.)
│   │   ├── routes/         # Page components & layouts
│   │   └── lib/            # Utilities (storage, queryClient)
│   └── public/             # Static Assets
├── server/                 # Express.js Backend
│   ├── src/
│   │   ├── config/         # Environment, Auth, & DB Config
│   │   ├── contract/       # ts-rest API definitions
│   │   ├── middleware/     # Security, Rate Limiting, Auth
│   │   ├── models/         # Mongoose Schemas
│   │   ├── workflows/      # Upstash Workflow Jobs
│   │   └── routes/         # API Implementations
│   └── index.ts            # Entry Point
```

---

## 📝 Configuration & Security

- **Security Headers**: Managed via [Helmet](https://helmetjs.github.io/) with custom CSP policies for Cloudinary and Paystack.
- **Rate Limiting**: Granular rate implementation for sensitive endpoints (Auth, Payments) using `express-rate-limit`.
- **Validation**: Strict input sanitization and typing via **Zod** across both client and server.

---

## 🏗 Development & CI/CD Workflow

To ensure a high-standard, production-ready codebase, the project follows a strict branching and CI/CD strategy.

### 1. Branching Model

- **`main`**: The production-ready branch. Only merges from `staging` are allowed via Pull Requests.
- **`staging`**: The integration branch. All feature branches and bug fixes must be merged here first for testing.
- **`feature/*` or `fix/*`**: Temporary branches for new development or patches.

### 2. Branch Protection Rules

Both `main` and `staging` branches are protected to prevent accidental direct pushes and ensure quality:

- **Pull Requests (PRs) Required**: All changes must go through a PR. Direct pushes to `main` and `staging` are blocked.
- **Status Checks**: GitHub Actions must pass (Linting, Typechecking, Unit Tests, E2E Tests) before a merge is permitted.
- **Code Reviews**: 
  - `main` requires at least **1 approving review** from a code owner.
  - `staging` requires a successful PR and passing CI (no manual approval required for solo development speed).
- **Admin Enforcement**: These rules apply to everyone, including repository owners, to ensure a consistent workflow.

### 3. CI/CD Operations

- **CI (GitHub Actions)**: Every PR to `staging` or `main` triggers an automated pipeline:
  - **Server**: Typechecks and Vitest unit/integration tests.
  - **Client**: Typechecks, Vitest unit tests, and Playwright E2E tests.
- **Deployment**: 
  - Merges to `main` trigger a production deployment to **Vercel** for both client and server applications.

### 4. Contributing

When starting a new task:
1. Create a feature branch from latest `staging`.
2. Push changes and open a PR targeting `staging`.
3. Use the provided [PR Template](.github/pull_request_template.md) to describe your changes.
4. Once CI passes and the PR is merged, create a subsequent PR from `staging` to `main` for production release.
