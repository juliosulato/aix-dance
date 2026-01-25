import { serverFetch } from "@/lib/server-fetch";
import {
  CreateModalityInput,
  UpdateModalityInput,
} from "@/schemas/academic/modality.schema";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export class ModalitiesService {
  static create(tenantId: string, data: CreateModalityInput) {
    return serverFetch(
      `${BASE_URL}/api/v1/tenants/${tenantId}/academic/modalities`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        }
      }
    );
  }

  static update(tenantId: string, data: UpdateModalityInput, id: string) {
    return serverFetch(
      `${BASE_URL}/api/v1/tenants/${tenantId}/academic/modalities/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        }
      }
    );
  }

  static deleteMany(tenantId: string, payload: { ids: string[] }) {
    return serverFetch(
      `${BASE_URL}/api/v1/tenants/${tenantId}/academic/modalities`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  }
}
