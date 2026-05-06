import { z } from "zod";

export const projectTaskParamsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ projectId: z.string().min(1, "Project id is required") }),
  query: z
    .object({
      search: z.string().optional(),
      status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
      priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
      assignedTo: z.string().optional(),
      dueFrom: z.string().datetime().optional(),
      dueTo: z.string().datetime().optional(),
      sortBy: z.enum(["createdAt", "updatedAt", "dueDate", "priority"]).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().max(100).optional(),
    })
    .optional(),
});

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2, "Task title is required"),
    description: z.string().optional(),
    dueDate: z.string().datetime().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    assignedTo: z.string().optional(),
  }),
  params: z.object({ projectId: z.string().min(1) }),
  query: z.object({}).optional(),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    dueDate: z.string().datetime().optional().nullable(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    assignedTo: z.string().optional().nullable(),
  }),
  params: z.object({ taskId: z.string().min(1) }),
  query: z.object({}).optional(),
});

export const deleteTaskSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ taskId: z.string().min(1, "Task id is required") }),
  query: z.object({}).optional(),
});

export const taskIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ taskId: z.string().min(1, "Task id is required") }),
  query: z.object({}).optional(),
});

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Comment is required").max(1000, "Comment too long"),
  }),
  params: z.object({ taskId: z.string().min(1, "Task id is required") }),
  query: z.object({}).optional(),
});
