import { z } from "zod";

const passwordRuleMessage =
  "Password must be 8-20 characters and include one uppercase letter, one number, and one special character.";

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Valid email is required"),
    password: z
      .string()
      .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/, passwordRuleMessage),
    confirmPassword: z.string(),
    role: z.enum(["ADMIN", "MEMBER"]).optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirm password must match",
    path: ["confirmPassword"],
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Valid email is required"),
    password: z.string().min(6, "Password is required"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const forgotPasswordSchema = z.object({
  body: z
    .object({
      email: z.string().email("Valid email is required"),
      password: z
        .string()
        .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/, passwordRuleMessage),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Password and confirm password must match",
      path: ["confirmPassword"],
    }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const checkEmailSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    email: z.string().email("Valid email is required"),
  }),
});
