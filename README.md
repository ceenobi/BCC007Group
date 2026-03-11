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

## 🧪 Testing & CI/CD

The project implements a multi-layer testing strategy to ensure reliability across both frontend and backend.

### **Testing Layers**
- **Server Unit & Integration**: [Vitest](https://vitest.dev/) for testing services, models, and API routes with comprehensive mocking for external dependencies (Paystack, MongoDB).
- **Client Unit**: Vitest and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for component-level validation.
- **End-to-End (E2E)**: [Playwright](https://playwright.dev/) for full user flows (Auth, Payments) with automated server orchestration.

### **Automated Pipeline (GitHub Actions)**
Every Pull Request to `main` or `staging` triggers the CI pipeline:
1. **Server CI**: Handles TypeScript validation and unit/integration tests.
2. **Client CI**: Handles TypeScript validation, unit tests, and full E2E Playwright tests.
3. **Security**: Automated GitGuardian scans for exposed secrets.

> [!IMPORTANT]
> To ensure E2E tests pass in CI, the following **GitHub Actions Secrets** must be configured in the repository: `DATABASE_URL`, `DATABASE_NAME`, `BETTER_AUTH_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `QSTASH_TOKEN`, `QSTASH_URL`, `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET_KEY`, `CLOUDINARY_UPLOAD_PRESET`, `RESEND_API_KEY`.
