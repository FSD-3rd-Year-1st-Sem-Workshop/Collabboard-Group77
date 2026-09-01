import "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      fullName: string;
      email: string;
      avatar?: string | null;
    };
    userId?: string;
    workspace?: any;
    workspaceMember?: any;
    resolvedWorkspaceId?: string;
    board?: any;
    column?: any;
    task?: any;
  }
}
