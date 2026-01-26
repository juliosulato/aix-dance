import { serverFetch } from "@/lib/server-fetch";
import { CreateFormsOfReceiptInput, UpdateFormsOfReceiptInput } from "@/schemas/financial/forms-receipt.schema";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export class FormsOfReceiptService {
  static create(tenantId: string, data: CreateFormsOfReceiptInput) {
    return serverFetch(
      `${baseUrl}/api/v1/tenants/${tenantId}/financial/forms-of-receipt`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  static update(tenantId: string, data: UpdateFormsOfReceiptInput) {
    return serverFetch(
      `${baseUrl}/api/v1/tenants/${tenantId}/financial/forms-of-receipt/${data.id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  static deleteMany(tenantId: string, ids: string[]) {
    return serverFetch(
      `${baseUrl}/api/v1/tenants/${tenantId}/financial/forms-of-receipt`,
      {
        method: "DELETE",
        body: JSON.stringify({ ids }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
