import { serverFetch } from "@/lib/server-fetch";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export class ProductsService {
    /**
     * Cria um produto.
     * Aceita FormData para permitir upload de arquivos.
     */
    static create(tenancyId: string, formData: FormData) {
        return serverFetch(`${BASE_URL}/api/v1/tenancies/${tenancyId}/products`, {
            method: "POST",
            body: formData
        })
    }

/**
   * Atualiza um produto.
   * @param tenancyId - O ID da Academia
   * @param id - O ID do produto a ser atualizado
   * @param formData - Dados do formulário
   */
    static update(tenancyId: string, id: string, formData: FormData) {
        return serverFetch(`${BASE_URL}/api/v1/tenancies/${tenancyId}/products;${id}`, {
            method: "PUT",
            body: formData
        })
    }

     /**
     * Exclui um ou mais produtos
     * @param tenancyId ID da Academia
     * @param ids Array de IDs para exclusão
     */
    static deleteMany(tenancyId: string, ids: string[]) {
        return serverFetch(`${BASE_URL}/api/v1/tenancies/${tenancyId}/products`, {
            method: "DELETE",
            body: JSON.stringify({ ids }),
            headers: {
                "Content-Type": "application/json"
            }
        })
    }
}