import { serverFetch } from "@/lib/server-fetch";
import { CreateCategoryGroupInput, UpdateCategoryGroupInput } from "@/schemas/financial/category-group.schema";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export class CategoryGroupsService {
  static create(tenantId: string, data: CreateCategoryGroupInput) {
    return serverFetch(
      `${baseUrl}/api/v1/tenants/${tenantId}/financial/category-groups`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json"
        },
      }
    );
  }

  static update(tenantId: string, data: UpdateCategoryGroupInput) {
    return serverFetch(
      `${baseUrl}/api/v1/tenants/${tenantId}/financial/category-groups/${data.id}`,
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
      `${baseUrl}/api/v1/tenants/${tenantId}/financial/category-groups`,
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
