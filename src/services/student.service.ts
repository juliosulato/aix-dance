import { serverFetch } from "@/lib/server-fetch";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const studentService = {
    async create(tenancyId: string, formData: FormData) {
        return await serverFetch(`${baseUrl}/api/v1/tenancies/${tenancyId}/students`, {
            method: "POST",
            body: formData, 
        });
    },
    async update(tenancyId: string, formData: FormData, id: string) {
        return await serverFetch(`${baseUrl}/api/v1/tenancies/${tenancyId}/students/${id}`, {
            method: "PUT",
            body: formData, 
        });
    },
    async deleteSingleOrMany(tenancyId: string, payload: {ids: string[]}) {
        return await serverFetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/students`,
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