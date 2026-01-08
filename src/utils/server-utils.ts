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
export function buildPayload(
  validatedData: Record<string, any>,
  jsonKeys?: string[]
): FormData {
  const payload = new FormData();

  Object.entries(validatedData).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (jsonKeys?.includes(key)) {
      payload.append(key, JSON.stringify(value));
    }

    else if (value instanceof File) {
      payload.append(key, value);
    }

    else {
      payload.append(key, String(value));
    }
  });

  return payload;
}

