import { createServer } from "http";
import app from "./app.js";
import env from "./config/Env.js";
import { connectDatabase } from "./config/Database.js";

async function startServer(): Promise<void> {
    try {
        await connectDatabase();

        const server = createServer(app);

        server.listen(env.port, () => {
            console.log(
                `Server running on http://localhost:${env.port} (${env.nodeEnv})`
            );
            console.log(`API Docs (Scalar): http://localhost:${env.port}/api/docs`);
        });

        const shutdown = async (signal: string): Promise<void> => {
            console.log(`\n${signal} received, shutting down...`);

            server.close(async () => {
                const { disconnectDatabase } = await import("./config/Database.js");
                await disconnectDatabase();
                process.exit(0);
            });
        };

        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
