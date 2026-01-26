import { serverFetch } from "@/lib/server-fetch";
import { CreatePlanInput, UpdatePlanInput } from "@/schemas/academic/plan.schema";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

export class PlanService {
    static create(tenantId: string, data: CreatePlanInput) {
        return serverFetch(`${BASE_URL}/api/v1/tenants/${tenantId}/academic/plans`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    static update(tenantId: string, data: UpdatePlanInput) {
        return serverFetch(`${BASE_URL}/api/v1/tenants/${tenantId}/academic/plans/${data.id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    static delete(tenantId: string, planId: string) {
        return serverFetch(`${BASE_URL}/api/v1/tenants/${tenantId}/academic/plans/${planId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}