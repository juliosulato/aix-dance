import { z } from 'zod';

// Enums
export const ResourceTypeEnum = z.enum(['FINANCE', 'USER', 'COURSE', 'TEACHER']);
export const ActionTypeEnum = z.enum(['VIEW', 'CREATE', 'EDIT', 'DELETE']);

// Permission Schema
export const PermissionSchema = z.object({
  resource: ResourceTypeEnum,
  action: ActionTypeEnum,
});

export type PermissionInput = z.infer<typeof PermissionSchema>;

// Create User Schema
export const CreateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  user: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  image: z.string().nullable().optional(),
  active: z.boolean().optional().default(true),
  permissions: z.array(PermissionSchema).optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

// Update User Schema
export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  user: z.string().optional(),
  password: z.string().min(6).optional(),
  image: z.string().nullable().optional(),
  active: z.boolean().optional(),
  permissions: z.array(PermissionSchema).optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
