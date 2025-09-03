import { z } from "zod";

export const createUserSchema = z.object({
  firstName: z.string().min(1, { message: "O campo Primeiro Nome está obrigatório" }),
  lastName: z.string().min(1, { message: "O campo Sobrenome está obrigatório" }),
  email: z.email({ message: "E-mail inválido" }),
  teacher: z.object({
    phoneNumber: z.string().min(1, { message: "Celular obrigatório" }),
    birthOfDate: z.string().min(1, { message: "Data de nascimento obrigatória" }),
    document: z.string().min(1, { message: "CPF obrigatório" }),
    gender: z.enum(["MALE","FEMALE","NON_BINARY","OTHER"], { message: "Selecione um gênero válido" }),
    address: z.object({
      publicPlace: z.string().min(1, { message: "Logradouro obrigatório" }),
      number: z.string().min(1, { message: "Número obrigatório" }),
      neighborhood: z.string().min(1, { message: "Bairro obrigatório" }),
      zipCode: z.string().min(1, { message: "CEP obrigatório" }),
      city: z.string().min(1, { message: "Cidade obrigatória" }),
      state: z.string().min(1, { message: "Estado obrigatório" }),
    }).optional()
  })
});
