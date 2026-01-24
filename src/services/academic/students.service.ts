import { serverFetch } from "@/lib/server-fetch";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export class StudentsService {
  static create(tenantId: string, formData: FormData) {
    return serverFetch(
      `${baseUrl}/api/v1/tenants/${tenantId}/academic/students`,
      {
        method: "POST",
        body: formData,
      }
    );
  }

  static update(tenantId: string, formData: FormData, id: string) {
    return serverFetch(
      `${baseUrl}/api/v1/tenants/${tenantId}/academic/students/${id}`,
      {
        method: "PUT",
        body: formData,
      }
    );
  }

  static deleteMany(
    tenantId: string,
    payload: { ids: string[] }
  ) {
    return serverFetch(
      `${baseUrl}/api/v1/tenants/${tenantId}/academic/students`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  }
}
