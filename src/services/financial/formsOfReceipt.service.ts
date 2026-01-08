import { serverFetch } from "@/lib/server-fetch";
import { CreateFormsOfReceiptInput, UpdateFormsOfReceiptInput } from "@/schemas/financial/forms-receipt.schema";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export class FormsOfReceiptService {
  static create(tenancyId: string, data: CreateFormsOfReceiptInput) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/forms-of-receipt`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  static update(tenancyId: string, data: UpdateFormsOfReceiptInput) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/forms-of-receipt/${data.id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  static deleteMany(tenancyId: string, ids: string[]) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/forms-of-receipt`,
      {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      }
    );
  }
};
