interface ParseOptions {
  /** Chaves que devem ser convertidas para booleano (ex: 'active', 'canLeaveAlone') */
  booleans?: string[];
  /** Chaves que contém JSON strings (ex: 'address', 'guardian', 'variants') */
  jsons?: string[];
  /** Chaves de arquivo (opcional, o parser detecta File automaticamente, mas útil para ignorar vazios) */
  files?: string[];
}

/**
 * Extrai e converte dados brutos de um FormData para um objeto plano
 * pronto para validação do Zod.
 */
export function parseFormData(formData: FormData, options: ParseOptions = {}) {
  const { booleans = [], jsons = [], files = [] } = options;
  const rawData: Record<string, any> = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      if (value.size > 0) {
        rawData[key] = value;
      }
      continue; 
    }

    if (jsons.includes(key)) {
      if (typeof value === 'string' && value.trim() !== '') {
        try {
          rawData[key] = JSON.parse(value);
        } catch (e) {
          console.warn(`Falha ao parsear JSON do campo ${key}`, e);
          rawData[key] = undefined;
        }
      } else {
        rawData[key] = undefined;
      }
      continue;
    }

    if (booleans.includes(key)) {
      rawData[key] = value === 'true';
      continue;
    }

    rawData[key] = value;
  }

  return rawData;
}

/**
 * Reconstrói um FormData limpo a partir dos dados validados para enviar ao Service/Backend
 */

export function buildPayload(validatedData: Record<string, any>): FormData {
  const payload = new FormData();

  Object.entries(validatedData).forEach(([key, value]) => {
    // 1. Ignora undefined/null
    if (value === undefined || value === null) return;

    // 2. Se for File, anexa diretamente (binário)
    if (value instanceof File) {
      payload.append(key, value);
      return;
    }

    // 3. Se for Date, converte para ISO String (padrão de API)
    if (value instanceof Date) {
      payload.append(key, value.toISOString());
      return;
    }

    // 4. Se for Objeto ou Array (e não for File/Date), converte para JSON string
    if (typeof value === "object") {
      payload.append(key, JSON.stringify(value));
      return;
    }

    // 5. Primitivos (string, number, boolean)
    payload.append(key, String(value));
  });

  return payload;
}