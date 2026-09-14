import env from "./Env.js";
import dns from "dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

export async function connectDatabase(uri?: string): Promise<typeof mongoose> {
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected successfully.");
  });

  mongoose.connection.on("error", (error: Error) => {
    console.error("MongoDB connection error:", error.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected.");
  });

  try {
    const targetUri = uri || process.env.MONGODB_URI || env.mongoUri;
    await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 20
    });
    return mongoose;
  } catch (error) {
    console.error("Initial MongoDB connection failure:", error);
    if (process.env.NODE_ENV === "test") {
      throw error;
    }
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
