import { serverFetch } from "@/lib/server-fetch";
import { CreateCategoryBillInput, UpdateCategoryBillInput } from "@/schemas/financial/category-bill.schema";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export class CategoryBillsService {
  static create(tenancyId: string, data: CreateCategoryBillInput) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/categories/bills`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  static update(tenancyId: string, data: UpdateCategoryBillInput) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/categories/bills/${data.id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  static deleteMany(tenancyId: string, ids: string[]) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/categories/bills`,
      {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      }
    );
  }
};
