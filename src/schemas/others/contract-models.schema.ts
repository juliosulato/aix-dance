import { z } from 'zod';

// Define as opções de preenchimento automático para as variáveis.
// Agora com a propriedade 'group' para organizar o Select.
export const presetOptions = [
    { group: 'Informações do Aluno', value: 'STUDENT_FULL_NAME', label: 'Nome Completo do Aluno' },
    { group: 'Informações do Aluno', value: 'STUDENT_FIRST_NAME', label: 'Primeiro Nome do Aluno' },
    { group: 'Informações do Aluno', value: 'STUDENT_LAST_NAME', label: 'Sobrenome do Aluno' },
    { group: 'Informações do Aluno', value: 'STUDENT_EMAIL', label: 'E-mail do Aluno' },
    { group: 'Informações do Aluno', value: 'STUDENT_PHONE', label: 'Celular do Aluno' },
    { group: 'Informações do Aluno', value: 'STUDENT_DOCUMENT', label: 'Documento (RG/CPF) do Aluno' },
    { group: 'Informações do Aluno', value: 'STUDENT_BIRTH_DATE', label: 'Data de Nascimento do Aluno' },
    { group: 'Informações da Academia', value: 'TENANCY_NAME', label: 'Nome da Academia' },
    { group: 'Informações da Academia', value: 'TENANCY_DOCUMENT', label: 'Documento (CNPJ) da Academia' },
    { group: 'Informações da Academia', value: 'TENANCY_EMAIL', label: 'E-mail da Academia' },
    { group: 'Informações da Academia', value: 'TENANCY_PHONE', label: 'Telefone da Academia' },
    { group: 'Informações da Academia', value: 'TENANCY_ADDRESS', label: 'Endereço Completo da Academia' },
    { group: 'Outros', value: 'CURRENT_DATE', label: 'Data Atual' },
];

// Schema de validação padronizado para o modelo de contrato
export const contractModelSchema = z.object({
    title: z.string({
        error: 'O título do modelo é obrigatório.',
    }).min(3, 'O título deve ter no mínimo 3 caracteres.'),

    htmlContent: z.string().optional(),

    variablePresets: z.record(z.string(), z.string()).optional(),
});

// Tipagem padronizada inferida do schema
export type ContractModelInput = z.infer<typeof contractModelSchema>;

