import assert from "assert";
import { describe, it, before, after } from "node:test";
import { createServer, type Server } from "http";
import app from "../src/app.js";
import env from "../src/config/Env.js";
import { connectDatabase, disconnectDatabase } from "../src/config/Database.js";
import { initializeSocket } from "../src/socket/index.js";
import User from "../src/models/User.js";
import Workspace from "../src/models/Workspace.js";
import WorkspaceMember from "../src/models/Workspace_members.js";
import WorkspaceInvitation from "../src/models/WorkspaceInvitation.js";
import Board from "../src/models/Board.js";
import Column from "../src/models/Column.js";
import Task from "../src/models/Task.js";
import RefreshToken from "../src/models/RefreshToken.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const TEST_PORT = 5001;
const TEST_DATABASE = "collabboard-test";

// Test helpers
function createToken(sub: string, type: "access" | "refresh" = "access"): string {
    return jwt.sign(
        { sub, type },
        type === "access" ? env.jwtAccessSecret : env.jwtRefreshSecret,
        { expiresIn: type === "access" ? "15m" : "7d" }
    );
}

async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

async function parseResponse<T = unknown>(response: Response): Promise<T> {
    return response.json() as Promise<T>;
}

async function createTestUser(email: string, password: string): Promise<any> {
    const hashedPassword = await hashPassword(password);
    return User.create({
        email,
        fullName: email.split("@")[0],
        passwordHash: hashedPassword,
        status: "active",
    });
}

async function createTestWorkspace(ownerId: string, name: string = "Test Workspace"): Promise<any> {
    const workspace = await Workspace.create({
        name,
        description: "Test",
        owner: ownerId,
        archived: false,
    });
    
    await WorkspaceMember.create({
        workspace: workspace._id,
        user: ownerId,
        role: "owner",
        status: "active",
    });
    
    return workspace;
}

async function createTestBoard(workspaceId: string, userId: string, name: string = "Test Board"): Promise<any> {
    const board = await Board.create({
        workspace: workspaceId,
        name,
        status: "active",
        createdBy: userId,
    });

    // Create default columns
    const columnNames = ["To Do", "In Progress", "Done"];
    for (const colName of columnNames) {
        await Column.create({
            board: board._id,
            name: colName,
            position: columnNames.indexOf(colName),
        });
    }

    return board;
}

describe("CollabBoard API Tests", () => {
    let server: Server;

    before(async () => {
        const mongoUri = process.env.TEST_MONGODB_URI || process.env.MONGODB_URI || `mongodb://127.0.0.1:27017/${TEST_DATABASE}`;
        console.log(`Connecting to test database: ${mongoUri}`);
        await connectDatabase(mongoUri);

        // Clear all test data
        await User.deleteMany({});
        await Workspace.deleteMany({});
        await WorkspaceMember.deleteMany({});
        await WorkspaceInvitation.deleteMany({});
        await Board.deleteMany({});
        await Column.deleteMany({});
        await Task.deleteMany({});
        await RefreshToken.deleteMany({});

        // Start test HTTP server with Socket.IO
        const httpServer = createServer(app);
        initializeSocket(httpServer);
        server = await new Promise<Server>((resolve) => {
            httpServer.listen(TEST_PORT, () => {
                console.log(`Test server running on port ${TEST_PORT}`);
                resolve(httpServer);
            });
        });
    });

    after(async () => {
        try {
            await User.deleteMany({});
            await Workspace.deleteMany({});
            await WorkspaceMember.deleteMany({});
            await WorkspaceInvitation.deleteMany({});
            await Board.deleteMany({});
            await Column.deleteMany({});
            await Task.deleteMany({});
            await RefreshToken.deleteMany({});
        } catch {
            // Ignore cleanup deletion failures
        }

        if (server) {
            await new Promise<void>((resolve) => server.close(() => resolve()));
        }

        await disconnectDatabase();
        console.log("Test cleanup complete");
    });

    describe("Authentication", () => {
        it("should register a new user", async () => {
            const response = await fetch(`http://localhost:${TEST_PORT}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: "test@example.com",
                    password: "TestPassword123",
                    fullName: "Test User",
                }),
            });

            assert.strictEqual(response.status, 201, "Should return 201");
            const data = await parseResponse<{ data: { user: { email: string } } }>(response);
            assert.ok(data.data?.user?.email, "Should return user");
        });

        it("should reject duplicate email registration", async () => {
            const email = "duplicate@example.com";
            
            // Create first user
            await createTestUser(email, "password123");

            // Try to register again
            const response = await fetch(`http://localhost:${TEST_PORT}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password: "TestPassword123",
                    fullName: "Test User",
                }),
            });

            assert.strictEqual(response.status, 409, "Should reject duplicate email with 409 Conflict");
        });

        it("should login with correct credentials", async () => {
            const email = "login-test@example.com";
            const password = "TestPassword123";
            
            await createTestUser(email, password);

            const response = await fetch(`http://localhost:${TEST_PORT}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            assert.strictEqual(response.status, 200, "Should return 200");
            const data = await parseResponse<{ data: { accessToken: string } }>(response);
            assert.ok(data.data?.accessToken, "Should return access token");
        });

        it("should reject login with incorrect password", async () => {
            const email = "wrong-pass@example.com";
            
            await createTestUser(email, "CorrectPassword123");

            const response = await fetch(`http://localhost:${TEST_PORT}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password: "WrongPassword123",
                }),
            });

            assert.strictEqual(response.status, 401, "Should return 401 for wrong password");
        });
    });

    describe("Workspaces", () => {
        let userId: string;
        let accessToken: string;
        let workspaceId: string;

        before(async () => {
            const user = await createTestUser("ws-owner@example.com", "password123");
            userId = user._id.toString();
            accessToken = createToken(userId);

            const workspace = await createTestWorkspace(userId);
            workspaceId = workspace._id.toString();
        });

        it("should create a workspace", async () => {
            const response = await fetch(`http://localhost:${TEST_PORT}/api/workspaces`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    name: "New Workspace",
                    description: "Test",
                }),
            });

            assert.strictEqual(response.status, 201, "Should return 201");
            const data = await parseResponse<{ data: { id?: string; _id?: string } }>(response);
            const returnedId = data.data?.id || data.data?._id;
            assert.ok(returnedId, "Should return workspace with ID");
        });

        it("should retrieve workspace by ID", async () => {
            const response = await fetch(`http://localhost:${TEST_PORT}/api/workspaces/${workspaceId}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            assert.strictEqual(response.status, 200, "Should return 200");
            const data = await parseResponse<{ data: { id?: string; _id?: string } }>(response);
            const returnedId = data.data?.id || data.data?._id;
            assert.strictEqual(String(returnedId), workspaceId, "Should return correct workspace");
        });

        it("should update workspace", async () => {
            const response = await fetch(`http://localhost:${TEST_PORT}/api/workspaces/${workspaceId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    name: "Updated Workspace Name",
                }),
            });

            assert.strictEqual(response.status, 200, "Should return 200");
            const data = await parseResponse<{ data: { name: string } }>(response);
            assert.strictEqual(data.data?.name, "Updated Workspace Name", "Should update name");
        });
    });

    describe("Tasks", () => {
        let userId: string;
        let accessToken: string;
        let workspaceId: string;
        let boardId: string;
        let columnId: string;
        let taskId: string;

        before(async () => {
            const user = await createTestUser("task-owner@example.com", "password123");
            userId = user._id.toString();
            accessToken = createToken(userId);

            const workspace = await createTestWorkspace(userId);
            workspaceId = workspace._id.toString();

            const board = await createTestBoard(workspaceId, userId);
            boardId = board._id.toString();

            const column = await Column.findOne({ board: boardId });
            columnId = column!._id.toString();
        });

        it("should create a task", async () => {
            const response = await fetch(`http://localhost:${TEST_PORT}/api/boards/${boardId}/tasks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    title: "Test Task",
                    description: "A test task",
                    columnId,
                    priority: "high",
                }),
            });

            assert.strictEqual(response.status, 201, "Should return 201");
            const data = await parseResponse<{ data: { id?: string; _id?: string } }>(response);
            const returnedId = data.data?.id || data.data?._id;
            assert.ok(returnedId, "Should return task with ID");
            taskId = String(returnedId);
        });

        it("should retrieve task by ID", async () => {
            const response = await fetch(`http://localhost:${TEST_PORT}/api/tasks/${taskId}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            assert.strictEqual(response.status, 200, "Should return 200");
            const data = await parseResponse<{ data: { id?: string; _id?: string } }>(response);
            const returnedId = data.data?.id || data.data?._id;
            assert.strictEqual(String(returnedId), taskId, "Should return correct task");
        });

        it("should update task with version control", async () => {
            const getResponse = await fetch(`http://localhost:${TEST_PORT}/api/tasks/${taskId}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const getData = await parseResponse<{ data: { version: number } }>(getResponse);
            const currentVersion = getData.data?.version;

            const response = await fetch(`http://localhost:${TEST_PORT}/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    title: "Updated Task Title",
                    version: currentVersion,
                }),
            });

            assert.strictEqual(response.status, 200, "Should return 200");
            const data = await parseResponse<{ data: { title: string; version: number } }>(response);
            assert.strictEqual(data.data?.title, "Updated Task Title", "Should update title");
            assert.strictEqual(data.data?.version, (currentVersion || 0) + 1, "Should increment version");
        });

        it("should reject update with wrong version", async () => {
            const response = await fetch(`http://localhost:${TEST_PORT}/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    title: "Should Fail",
                    version: 0, // Wrong version
                }),
            });

            assert.strictEqual(response.status, 409, "Should return 409 for version mismatch");
        });

        it("should move task", async () => {
            const getResponse = await fetch(`http://localhost:${TEST_PORT}/api/tasks/${taskId}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const getData = await parseResponse<{ data: { version: number } }>(getResponse);
            const currentVersion = getData.data?.version;

            // Get another column
            const otherColumn = await Column.findOne({ board: boardId, _id: { $ne: columnId } });

            const response = await fetch(`http://localhost:${TEST_PORT}/api/tasks/${taskId}/move`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    columnId: otherColumn?._id.toString(),
                    position: 0,
                    version: currentVersion,
                }),
            });

            assert.strictEqual(response.status, 200, "Should return 200");
            const data = await parseResponse<{ data: { column: string } }>(response);
            assert.strictEqual(String(data.data?.column), otherColumn?._id.toString(), "Should move to new column");
        });

        it("should delete (archive) task", async () => {
            const response = await fetch(`http://localhost:${TEST_PORT}/api/tasks/${taskId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            assert.strictEqual(response.status, 200, "Should return 200");
        });
    });

    describe("Authorization", () => {
        let user1Token: string;
        let user2Token: string;
        let workspaceId: string;

        before(async () => {
            const user1 = await createTestUser("auth-user1@example.com", "password123");
            user1Token = createToken(user1._id.toString());

            const user2 = await createTestUser("auth-user2@example.com", "password123");
            user2Token = createToken(user2._id.toString());

            const workspace = await createTestWorkspace(user1._id.toString());
            workspaceId = workspace._id.toString();
        });

        it("should deny access to non-members", async () => {
            const response = await fetch(`http://localhost:${TEST_PORT}/api/workspaces/${workspaceId}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${user2Token}` },
            });

            assert.strictEqual(response.status, 403, "Should return 403 for non-member");
        });

        it("should allow access to workspace members", async () => {
            const response = await fetch(`http://localhost:${TEST_PORT}/api/workspaces/${workspaceId}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${user1Token}` },
            });

            assert.strictEqual(response.status, 200, "Should allow member access");
        });
    });
});
