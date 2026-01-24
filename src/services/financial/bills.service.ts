import { serverFetch } from "@/lib/server-fetch";
import { CreateBillInput, UpdateBillInput } from "@/schemas/financial/bill.schema";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export class BillsService {
  static create(tenantId: string, data: CreateBillInput) {
    return serverFetch(
      `${baseUrl}/api/v1/tenants/${tenantId}/financial/bills`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  static update(tenantId: string, data: UpdateBillInput) {
    return serverFetch(
      `${baseUrl}/api/v1/tenants/${tenantId}/financial/bills/${data.id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  static deleteMany(tenantId: string, ids: string[]) {
    return serverFetch(
      `${baseUrl}/api/v1/tenants/${tenantId}/financial/bills`,
      {
        method: "DELETE",
        body: JSON.stringify({ ids }),
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  static deleteOne(tenantId: string, id: string, scope: string) {
    return serverFetch(
      `${baseUrl}/api/v1/tenants/${tenantId}/financial/bills/${id}?scope=${scope}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};
