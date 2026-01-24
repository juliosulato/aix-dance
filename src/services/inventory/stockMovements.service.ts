import { serverFetch } from "@/lib/server-fetch";
import { CreateStockMovementInput } from "@/schemas/inventory/stock-movement";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export class StockMovementsService {
    static create(tenantId: string, payload: CreateStockMovementInput) {
        return serverFetch(`${BASE_URL}/api/v1/tenants/${tenantId}/inventory/stock-movements`, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    static delete(tenantId: string, id: string) {
        return serverFetch(`${BASE_URL}/api/v1/tenants/${tenantId}/inventory/stock-movements/${id}`, {
            method: "DELETE"
        })
    }
}