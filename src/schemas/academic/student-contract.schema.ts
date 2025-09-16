import { z } from 'zod';

export const createStudentContractSchema = z.object({
    // ID do aluno que está assinando o contrato.
    studentId: z.string({
        error: 'É obrigatório selecionar um aluno.',
    }),
    // ID do modelo de contrato que será usado como base.
    contractModelId: z.string({
        error: 'É obrigatório selecionar um modelo de contrato.',
    }),
    // O conteúdo final do contrato em HTML, após a substituição das variáveis.
    htmlContent: z.string().optional(),
    // Campos para preenchimento de variáveis manuais (ex: nome da testemunha).
    manualVariables: z.record(z.string(), z.string()).optional(),
});

// Tipagem inferida a partir do schema para uso no frontend.
export type CreateStudentContractInput = z.infer<typeof createStudentContractSchema>;

