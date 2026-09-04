import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { apiReference } from "@scalar/express-api-reference";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/Auth.routes.js";
import workspaceRoutes from "./routes/Workspace.routes.js";
import dashboardRoutes from "./routes/Dashboard.routes.js";
import invitationRoutes from "./routes/Invitation.routes.js";
import boardRoutes from "./routes/Board.routes.js";
import columnRoutes from "./routes/Column.routes.js";
import taskRoutes from "./routes/Task.routes.js";
import commentRoutes from "./routes/Comment.routes.js";
import {
    notFoundHandler,
    errorHandler
} from "./middleware/Error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Helmet with relaxed CSP so Scalar's CDN scripts can load on /api/docs
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:"],
                workerSrc: ["'self'", "blob:"],
                connectSrc: ["'self'"]
            }
        }
    })
);

// Enable CORS for all origins, supporting httpOnly cookies/credentials
app.use(
    cors({
        origin: true,
        credentials: true
    })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/", (_req: Request, res: Response) => {
    res.json({
        name: "CollabBoard API",
        status: "ok",
        docs: "/api/docs"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/columns", columnRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);

// Serve the raw OpenAPI spec as JSON so Scalar can load it
const specPath = path.join(__dirname, "openapi.yaml");
const openApiSpec = YAML.load(specPath);
app.get("/api/openapi.json", (_req: Request, res: Response) => {
    res.json(openApiSpec);
});

// Scalar API Reference UI
app.use(
    "/api/docs",
    apiReference({
        spec: {
            url: "/api/openapi.json"
        }
    })
);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
