import { serverFetch } from "@/lib/server-fetch";
import { CreateFormsOfReceiptInput, UpdateFormsOfReceiptInput } from "@/schemas/financial/forms-receipt.schema";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const FormsOfReceiptService = {
  create(tenancyId: string, data: CreateFormsOfReceiptInput) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/forms-of-receipt`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  update(tenancyId: string, data: UpdateFormsOfReceiptInput) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/forms-of-receipt`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },

  deleteMany(tenancyId: string, ids: string[]) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/forms-of-receipt`,
      {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      }
    );
  },
};
