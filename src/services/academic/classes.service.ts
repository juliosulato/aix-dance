import {serverFetch} from "@/lib/server-fetch";
import {CreateClassInput, UpdateClassInput} from "@/schemas/academic/class.schema";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export class ClassesService {
    static create(tenantId: string, data: CreateClassInput) {
        return serverFetch(`${BASE_URL}/api/v1/tenants/${tenantId}/academic/classes`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    static update(tenantId: string, data: UpdateClassInput, id: string) {
        return serverFetch(`${BASE_URL}/api/v1/tenants/${tenantId}/academic/classes/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    static deleteMany(tenantId: string, payload: { ids: string[] }) {
        return serverFetch(`${BASE_URL}/api/v1/tenants/${tenantId}/academic/classes`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
    }
}