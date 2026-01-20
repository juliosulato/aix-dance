import { serverFetch } from "@/lib/server-fetch";
import { CreateStockMovementInput } from "@/schemas/inventory/stock-movement";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export class StockMovementsService {
    static create(tenancyId: string, payload: CreateStockMovementInput) {
        return serverFetch(`${BASE_URL}/api/v1/tenancies/${tenancyId}/inventory/stock-movements`, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    static delete(tenancyId: string, id: string) {
        return serverFetch(`${BASE_URL}/api/v1/tenancies/${tenancyId}/inventory/stock-movements/${id}`, {
            method: "DELETE"
        })
    }
}