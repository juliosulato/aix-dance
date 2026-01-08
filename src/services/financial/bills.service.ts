import { serverFetch } from "@/lib/server-fetch";
import { CreateBillInput, UpdateBillInput } from "@/schemas/financial/bill.schema";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export class BillsService {
  static create(tenancyId: string, data: CreateBillInput) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/bills`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  static update(tenancyId: string, data: UpdateBillInput) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/bills/${data.id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  static deleteMany(tenancyId: string, ids: string[]) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/bills`,
      {
        method: "DELETE",
        body: JSON.stringify({ ids }),
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  static deleteOne(tenancyId: string, id: string, scope: string) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/bills/${id}?scope=${scope}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};
