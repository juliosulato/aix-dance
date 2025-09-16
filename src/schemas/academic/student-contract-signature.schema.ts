import { z } from 'zod';

export const signatureSchema = z.object({
    fullName: z.string({
        error: "O nome completo é obrigatório.",
    }).min(3, "O nome deve ter pelo menos 3 caracteres."),
    document: z.string({
        error: "O documento é obrigatório.",
    }).min(5, "O documento deve ter pelo menos 5 caracteres."),
});

export type SignatureInput = z.infer<typeof signatureSchema>;

