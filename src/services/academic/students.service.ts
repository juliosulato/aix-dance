import { serverFetch } from "@/lib/server-fetch";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export class StudentsService {
  static create(tenancyId: string, formData: FormData) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/students`,
      {
        method: "POST",
        body: formData,
      }
    );
  }

  static update(tenancyId: string, formData: FormData, id: string) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/students/${id}`,
      {
        method: "PUT",
        body: formData,
      }
    );
  }

  static deleteMany(
    tenancyId: string,
    payload: { ids: string[] }
  ) {
    return serverFetch(
      `${baseUrl}/api/v1/tenancies/${tenancyId}/students`,
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
