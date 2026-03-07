import { config } from "dotenv";
import path from "path";

function loadDotenv() {
  // Only load dotenv locally, not on Vercel
  if (!process.env.VERCEL) {
    const envFile =
      process.env.NODE_ENV === "staging" ? ".env.staging" : ".env.development";
    const envPath = path.resolve(process.cwd(), envFile);
    config({ path: envPath });
  }
}

loadDotenv();

interface EnvSpec {
  key: string;
  required?: boolean;
}
const ENV_VARS: EnvSpec[] = [
  { key: "NODE_ENV" },
  { key: "GOOGLE_CLIENT_ID" },
  { key: "GOOGLE_CLIENT_SECRET" },
  { key: "BETTER_AUTH_URL" },
  { key: "BETTER_AUTH_SECRET" },
  { key: "EMAIL_HOST" },
  { key: "EMAIL_PORT" },
  { key: "EMAIL_USER" },
  { key: "EMAIL_PASSWORD" },
  { key: "DATABASE_URL" },
  { key: "DATABASE_NAME" },
  { key: "CLIENT_URL" },
  { key: "SERVER_URL" },
  { key: "CLOUDINARY_CLOUD_NAME" },
  { key: "CLOUDINARY_API_KEY" },
  { key: "CLOUDINARY_SECRET_KEY" },
  { key: "CLOUDINARY_UPLOAD_PRESET" },
  { key: "PAYSTACK_SECRET_KEY" },
  { key: "PAYSTACK_PUBLIC_KEY" },
  { key: "UPSTASH_REDIS_REST_URL" },
  { key: "UPSTASH_REDIS_REST_TOKEN" },
  { key: "QSTASH_TOKEN" },
  { key: "QSTASH_URL" },
  { key: "RESEND_API_KEY" },
  { key: "BREVO_API_KEY" },
  // Add optional vars like this:
  // { key: "OPTIONAL_VAR", required: false }
];

function getEnvVar(): Record<string, string> {
  const missing: string[] = [];
  const result: Record<string, string> = {};

  ENV_VARS.forEach(({ key, required = true }) => {
    const value = process.env[key];
    if (!value) {
      if (required) missing.push(key);
    } else {
      result[key] = value;
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  return result;
}

interface Env {
  readonly nodeEnv: string;
  readonly googleClientId: string;
  readonly googleClientSecret: string;
  readonly betterAuthUrl: string;
  readonly betterAuthSecret: string;
  readonly emailHost: string;
  readonly emailPort: string;
  readonly emailUser: string;
  readonly emailPassword: string;
  readonly databaseUrl: string;
  readonly databaseName: string;
  readonly clientUrl: string;
  readonly serverUrl: string;
  readonly cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    uploadPreset: string;
  };
  readonly paystackSecretKey: string;
  readonly paystackPublicKey: string;
  readonly upstash: {
    redisUrl: string;
    redisToken: string;
    qstashUrl: string;
    qstashToken: string;
  };
  readonly resendApiKey: string;
}

export const env: Env = {
  nodeEnv: getEnvVar()["NODE_ENV"] || "development",
  googleClientId: getEnvVar()["GOOGLE_CLIENT_ID"],
  googleClientSecret: getEnvVar()["GOOGLE_CLIENT_SECRET"],
  betterAuthUrl: getEnvVar()["BETTER_AUTH_URL"],
  betterAuthSecret: getEnvVar()["BETTER_AUTH_SECRET"],
  emailHost: getEnvVar()["EMAIL_HOST"],
  emailPort: getEnvVar()["EMAIL_PORT"],
  emailUser: getEnvVar()["EMAIL_USER"],
  emailPassword: getEnvVar()["EMAIL_PASSWORD"],
  databaseUrl: getEnvVar()["DATABASE_URL"],
  databaseName: getEnvVar()["DATABASE_NAME"],
  clientUrl: getEnvVar()["CLIENT_URL"],
  serverUrl: getEnvVar()["SERVER_URL"],
  cloudinary: {
    apiSecret: getEnvVar()["CLOUDINARY_SECRET_KEY"],
    cloudName: getEnvVar()["CLOUDINARY_CLOUD_NAME"],
    apiKey: getEnvVar()["CLOUDINARY_API_KEY"],
    uploadPreset: getEnvVar()["CLOUDINARY_UPLOAD_PRESET"],
  },
  paystackSecretKey: getEnvVar()["PAYSTACK_SECRET_KEY"],
  paystackPublicKey: getEnvVar()["PAYSTACK_PUBLIC_KEY"],
  upstash: {
    redisUrl: getEnvVar()["UPSTASH_REDIS_REST_URL"],
    redisToken: getEnvVar()["UPSTASH_REDIS_REST_TOKEN"],
    qstashToken: getEnvVar()["QSTASH_TOKEN"],
    qstashUrl: getEnvVar()["QSTASH_URL"],
  },
  resendApiKey: getEnvVar()["RESEND_API_KEY"],
};
