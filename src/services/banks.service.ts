import { serverFetch } from "@/lib/server-fetch";
import { CreateBankInput, UpdateBankInput } from "@/schemas/financial/bank.schema";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const BanksService = {
  create(tenancyId: string, data: CreateBankInput) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/banks`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  update(tenancyId: string, data: UpdateBankInput) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/banks`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },

  deleteMany(tenancyId: string, ids: string[]) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/banks`,
      {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      }
    );
  },
};
