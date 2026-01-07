import { z } from "zod";

/**
 * Extrai e converte dados brutos de um FormData para um objeto plano
 * pronto para validação do Zod.
 */
export function parseStudentFormData(formData: FormData) {
  const rawData: Record<string, any> = {};

  // 1. Extração básica e tratamento de booleanos
  for (const [key, value] of formData.entries()) {
    // Ignora campos complexos que trataremos manualmente abaixo
    if (['address', 'guardian', 'file'].includes(key)) continue;

    // Tratamento manual de booleanos (ex: checkboxes)
    if (['canLeaveAlone', 'active'].includes(key)) {
      rawData[key] = value === 'true';
    } else {
      rawData[key] = value;
    }
  }

  // 2. Tratamento de Arquivo
  const file = formData.get('file');
  if (file && file instanceof File && file.size > 0) {
    rawData.file = file;
  }

  // 3. Parsing de JSONs (Address e Guardian)
  const parseJsonField = (fieldName: string, defaultValue: any) => {
    const value = formData.get(fieldName) as string;
    if (!value) return undefined;
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error(`Erro ao fazer parse de ${fieldName}:`, e);
      return defaultValue;
    }
  };

  rawData.address = parseJsonField('address', undefined);
  rawData.guardian = parseJsonField('guardian', []);

  return rawData;
}

/**
 * Reconstrói um FormData limpo a partir dos dados validados para enviar ao Service/Backend
 */
export function buildStudentPayload(validatedData: Record<string, any>): FormData {
  const payload = new FormData();

  Object.entries(validatedData).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    // Tratamento específico para campos que devem ir como JSON
    if (['address', 'guardian'].includes(key)) {
      payload.append(key, JSON.stringify(value));
    } 
    // Arquivos
    else if (value instanceof File) {
      payload.append(key, value);
    } 
    // Booleanos e outros primitivos
    else {
      payload.append(key, String(value));
    }
  });

  return payload;
}