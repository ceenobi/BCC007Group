import { vi } from "vitest";

// Set environment variables for tests
process.env.DATABASE_URL = "mongodb://localhost:27017/test";
process.env.NODE_ENV = "test";

// Mock environment keys
vi.mock("~/config/keys", () => ({
  env: {
    databaseUrl: "mongodb://localhost:27017/test",
    nodeEnv: "test",
    resendApiKey: "test_resend_api_key",
    betterAuthSecret: "test_better_auth_secret",
    betterAuthUrl: "http://localhost:3000",
  },
}));

// Mock Headers for better-auth
class MockHeaders {
  _headers = new Map<string, string>();
  append(n: string, v: string) {
    this._headers.set(n.toLowerCase(), v);
  }
  delete(n: string) {
    this._headers.delete(n.toLowerCase());
  }
  get(n: string) {
    return this._headers.get(n.toLowerCase()) || null;
  }
  has(n: string) {
    return this._headers.has(n.toLowerCase());
  }
  set(n: string, v: string) {
    this._headers.set(n.toLowerCase(), v);
  }
  forEach(cb: (value: string, key: string) => void) {
    this._headers.forEach(cb);
  }
  [Symbol.iterator]() {
    return this._headers.entries();
  }
  entries() {
    return this._headers.entries();
  }
  keys() {
    return this._headers.keys();
  }
  values() {
    return this._headers.values();
  }
}
global.Headers = MockHeaders as any;

// Mock Resend
vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: vi.fn(),
    };
  },
}));

// Mock better-auth/node
vi.mock("better-auth/node", () => ({
  fromNodeHeaders: vi.fn((h) => h),
}));

// Mock Upstash Redis
vi.mock("@upstash/redis", () => ({
  Redis: class {
    get = vi.fn();
    set = vi.fn();
    del = vi.fn();
  },
}));

// Mock Upstash Workflow
vi.mock("@upstash/workflow", () => ({
  Client: class {
    trigger = vi.fn().mockResolvedValue({ workflowRunId: "test-run-id" });
  },
}));

// Mock Mongoose
vi.mock("mongoose", () => ({
  default: {
    connect: vi.fn(),
    connection: {
      on: vi.fn(),
      readyState: 1,
      close: vi.fn(),
      db: {
        admin: () => ({
          ping: vi.fn().mockResolvedValue(true),
        }),
      },
    },
    Schema: class {},
    model: vi.fn(),
  },
  connect: vi.fn(),
  Schema: class {},
  model: vi.fn(),
  Types: {
    ObjectId: class {
      toString() {
        return "507f1f77bcf86cd799439011";
      }
    },
  },
}));
