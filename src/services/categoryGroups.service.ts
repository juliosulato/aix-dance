import { serverFetch } from "@/lib/server-fetch";
import { CreateCategoryGroupInput, UpdateCategoryGroupInput } from "@/schemas/financial/category-group.schema";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const CategoryGroupsService = {
  create(tenancyId: string, data: CreateCategoryGroupInput) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/categories/groups`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  update(tenancyId: string, data: UpdateCategoryGroupInput) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/categories/groups/${data.id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },

  deleteMany(tenancyId: string, ids: string[]) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/categories/groups`,
      {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      }
    );
  },
};
