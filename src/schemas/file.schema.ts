import z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const fileSchema = z
  .custom<File>((val) => {
    if (!val) return true;
    return (
      val instanceof File ||
      (typeof val === "object" && "size" in val && "type" in val)
    );
  }, "Imagem inválida")
  .refine((file) => {
    if (!file || file.size === 0) return true;
    return file.size <= MAX_FILE_SIZE;
  }, "O tamanho máximo da imagem é de 5MB.")
  .refine((file) => {
    if (!file || file.size === 0) return true;
    return ACCEPTED_IMAGE_TYPES.includes(file.type);
  }, "Formato inválido. Use .jpg, .jpeg, .png ou .webp")
  .optional()
  .nullable();
