import { z } from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Project name is required"),
    description: z.string().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const memberSchema = z.object({
  body: z.object({
    userId: z.string().min(1, "User id is required"),
    role: z.enum(["VIEWER", "EDITOR", "MANAGER", "ADMIN"]).optional(),
  }),
  params: z.object({ projectId: z.string().min(1) }),
  query: z.object({}).optional(),
});

export const projectIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ projectId: z.string().min(1, "Project id is required") }),
  query: z.object({}).optional(),
});

export const listProjectsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z
    .object({
      search: z.string().optional(),
      sortBy: z.enum(["createdAt", "updatedAt", "name"]).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().max(100).optional(),
    })
    .optional(),
});
