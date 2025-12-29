import z from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
  remember: z.boolean().optional(),
})