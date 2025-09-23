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
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  email: z.string().email("Email inválido"),
  user: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  image: z.string().nullable().optional(),
  active: z.boolean().optional().default(true),
  permissions: z.array(PermissionSchema).optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

// Update User Schema
export const UpdateUserSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório").optional(),
  lastName: z.string().min(1, "Sobrenome é obrigatório").optional(),
  email: z.string().email("Email inválido").optional(),
  user: z.string().optional(),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional(),
  image: z.string().nullable().optional(),
  active: z.boolean().optional(),
  permissions: z.array(PermissionSchema).optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
