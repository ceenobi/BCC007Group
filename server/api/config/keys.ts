import { config } from "dotenv";
import path from "path";

// Load environment variables - only for local development
// On Vercel, env vars are injected automatically via dashboard
if (!process.env.VERCEL) {
  const envPath = path.resolve(process.cwd(), ".env.staging");
  config({ path: envPath });
}
interface Env {
  readonly nodeEnv: string | undefined;
  readonly googleClientId: string | undefined;
  readonly googleClientSecret: string | undefined;
  readonly betterAuthUrl: string | undefined;
  readonly betterAuthSecret: string | undefined;
  readonly emailHost: string | undefined;
  readonly emailPort: string | undefined;
  readonly emailUser: string | undefined;
  readonly emailPassword: string | undefined;
  readonly databaseUrl: string | undefined;
  readonly databaseName: string | undefined;
  readonly clientUrl: string | undefined;
  readonly serverUrl: string | undefined;
  readonly cloudinary: {
    cloudName: string | undefined;
    apiKey: string | undefined;
    apiSecret: string | undefined;
    uploadPreset: string | undefined;
  };
  readonly paystackSecretKey: string | undefined;
  readonly paystackPublicKey: string | undefined;
  readonly upstash: {
    redisUrl: string | undefined;
    redisToken: string | undefined;
    qstashUrl: string | undefined;
    qstashToken: string | undefined;
  };
  readonly resendApiKey: string | undefined;
  readonly brevoApiKey: string | undefined;
}

export const env: Env = {
  // Server-side only variables (will be undefined on client)
  nodeEnv: process.env.NODE_ENV || "development",
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  betterAuthUrl: process.env.BETTER_AUTH_URL,
  betterAuthSecret: process.env.BETTER_AUTH_SECRET,
  emailHost: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT,
  emailUser: process.env.EMAIL_USER,
  emailPassword: process.env.EMAIL_PASSWORD,
  databaseUrl: process.env.DATABASE_URL,
  databaseName: process.env.DATABASE_NAME,
  clientUrl: process.env.CLIENT_URL,
  serverUrl: process.env.SERVER_URL,
  cloudinary: {
    apiSecret: process.env.CLOUDINARY_SECRET_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
  },
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
  paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY,
  upstash: {
    redisUrl: process.env.UPSTASH_REDIS_REST_URL,
    redisToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    qstashToken: process.env.QSTASH_TOKEN,
    qstashUrl: process.env.QSTASH_URL,
  },
  resendApiKey: process.env.RESEND_API_KEY,
  brevoApiKey: process.env.BREVO_API_KEY,
};
