import { serverFetch } from "@/lib/server-fetch";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const studentService = {
    async create(tenancyId: string, formData: FormData) {
        return await serverFetch(`${baseUrl}/api/v1/tenancies/${tenancyId}/students`, {
            method: "POST",
            body: formData, 
        });
    }
}