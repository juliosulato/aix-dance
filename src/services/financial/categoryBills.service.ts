import { serverFetch } from "@/lib/server-fetch";
import {
  CreateCategoryBillInput,
  UpdateCategoryBillInput,
} from "@/schemas/financial/category-bill.schema";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export class CategoryBillsService {
  static create(tenantId: string, data: CreateCategoryBillInput) {
    return serverFetch(
      `${baseUrl}/api/v1/tenants/${tenantId}/financial/categories-bills`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  static update(tenantId: string, data: UpdateCategoryBillInput) {
    return serverFetch(
      `${baseUrl}/api/v1/tenants/${tenantId}/financial/categories-bills/${data.id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  static deleteMany(tenantId: string, ids: string[]) {
    return serverFetch(
      `${baseUrl}/api/v1/tenants/${tenantId}/financial/categories-bills`,
      {
        method: "DELETE",
        body: JSON.stringify({ ids }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
