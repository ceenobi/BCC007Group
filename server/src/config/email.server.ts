import { getResend } from "@/config/resend.js";
import { env } from "@/config/keys.js";
import logger from "@/config/logger.js";

interface SendEmailOptions {
  email: string;
  subject: string;
  message: string;
  attachments?: {
    filename: string;
    content: Buffer | string;
  }[];
}

const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  try {
    const resend = getResend();
    // Define text fallback
    const textFallback = options.message
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();

    // Override recipient in development due to Resend restrictions
    let recipient = options.email;
    if (env.nodeEnv === "development") {
      logger.info(
        `Development mode: Redirecting email from ${options.email} to authorized address: cobimbachu@gmail.com`,
      );
      recipient = "cobimbachu@gmail.com";
    }

    const { data, error } = await resend.emails.send({
      from: "BCC007Pay <onboarding@resend.dev>", // Replace with your verified domain in production
      to: recipient,
      subject: options.subject,
      text: textFallback,
      html: options.message,
      attachments: options.attachments,
    });

    if (error) {
      logger.error("Resend email sending failed:", error);
      return;
    }

    if (env.nodeEnv === "development") {
      logger.info(`Email sent successfully via Resend! ID: ${data?.id}`);
    }
  } catch (error: any) {
    logger.error("Email sending failed:", error);
    // Don't throw error for now to prevent signup from failing
    logger.warn("Email service failed, but continuing with other process");
  }
};

export { sendEmail };
