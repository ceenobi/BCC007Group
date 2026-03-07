// Ensure environment variables are loaded
import mongoose, { ConnectOptions } from "mongoose";
import { env } from "~/config/keys";
import logger from "./logger";

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not defined");
}

interface DBConnection {
  isConnected: boolean;
  retryCount: number;
  maxRetries: number;
}

const dbConnection: DBConnection = {
  isConnected: false,
  retryCount: 0,
  maxRetries: 5,
};

export const connectToDB = async (): Promise<void> => {
  if (dbConnection.isConnected) {
    logger.info("✅ Using existing MongoDB connection");
    return;
  }

  if (dbConnection.retryCount >= dbConnection.maxRetries) {
    logger.error("❌ Max MongoDB connection retries reached");
    process.exit(1);
  }

  const connectionOptions: ConnectOptions = {
    dbName: env.databaseName,
    serverSelectionTimeoutMS: 45000,
    socketTimeoutMS: 5000,
    retryWrites: true,
    retryReads: true,
    maxPoolSize: 50,
    minPoolSize: 1,
    monitorCommands: env.nodeEnv === "development",
  };
  try {
    const conn = await mongoose.connect(env.databaseUrl!, connectionOptions);
    dbConnection.isConnected = conn.connections[0].readyState === 1;
    dbConnection.retryCount = 0;

    if (dbConnection.isConnected) {
      logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

      // Connection event handlers
      mongoose.connection.on("error", (err) => {
        logger.error("❌ MongoDB connection error:", err);
        dbConnection.isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        logger.info("ℹ️  MongoDB disconnected");
        dbConnection.isConnected = false;
        // Attempt to reconnect
        if (dbConnection.retryCount < dbConnection.maxRetries) {
          dbConnection.retryCount++;
          logger.info(
            `ℹ️  Attempting to reconnect (${dbConnection.retryCount}/${dbConnection.maxRetries})...`,
          );
          setTimeout(connectToDB, 5000);
        }
      });
    }
  } catch (error: unknown) {
    dbConnection.retryCount++;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(
      `❌ MongoDB connection failed (attempt ${dbConnection.retryCount}/${dbConnection.maxRetries}):`,
      errorMessage,
    );

    if (dbConnection.retryCount < dbConnection.maxRetries) {
      logger.info(`ℹ️  Retrying in 5 seconds...`);
      setTimeout(connectToDB, 5000);
    } else {
      console.error("❌ Max retries reached. Exiting...");
      process.exit(1);
    }
  }
};

// Handle graceful shutdown
export const gracefulShutdown = async (): Promise<void> => {
  try {
    logger.info("\n🛑 Received shutdown signal. Closing server...");
    // Close MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log("✅ MongoDB connection closed");
    }

    logger.info("✅ Server shutdown complete");
    process.exit(0);
  } catch (error) {
    logger.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  logger.error("\n❌ UNCAUGHT EXCEPTION! Shutting down...");
  logger.error(`${error.name}: ${error.message}`, { stack: error.stack });

  if (env.nodeEnv === "development") {
    console.error(error);
  }

  // Attempt to close server gracefully
  gracefulShutdown().finally(() => process.exit(1));
});

export async function withMongo<T>(fn: () => Promise<T>): Promise<T> {
  try {
    await connectToDB();
    return await fn();
  } catch (error: any) {
    logger.error("Operation failed", error);
    throw error?.response?.data || error;
  }
}
