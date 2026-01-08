import { serverFetch } from "@/lib/server-fetch";
import { CreateBankInput, UpdateBankInput } from "@/schemas/financial/bank.schema";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export class BanksService {
  static create(tenancyId: string, data: CreateBankInput) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/banks`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  static update(tenancyId: string, data: UpdateBankInput) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/banks/${data.id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  static deleteMany(tenancyId: string, ids: string[]) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/banks`,
      {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      }
    );
  }
};
