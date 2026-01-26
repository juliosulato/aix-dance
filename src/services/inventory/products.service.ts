import { serverFetch } from "@/lib/server-fetch";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export class ProductsService {
  /**
   * Cria um produto.
   * Aceita FormData para permitir upload de arquivos.
   */
  static create(tenantId: string, formData: FormData) {
    return serverFetch(
      `${BASE_URL}/api/v1/tenants/${tenantId}/inventory/products`,
      {
        method: "POST",
        body: formData,
      }
    );
  }

  /**
   * Atualiza um produto.
   * @param tenantId - O ID da Academia
   * @param id - O ID do produto a ser atualizado
   * @param formData - Dados do formulário
   */
  static update(tenantId: string, id: string, formData: FormData) {
    return serverFetch(
      `${BASE_URL}/api/v1/tenants/${tenantId}/inventory/products/${id}`,
      {
        method: "PATCH",
        body: formData,
      }
    );
  }

  /**
   * Exclui um ou mais produtos
   * @param tenantId ID da Academia
   * @param ids Array de IDs para exclusão
   */
  static bulkDelete(tenantId: string, ids: string[]) {
    return serverFetch(
      `${BASE_URL}/api/v1/tenants/${tenantId}/inventory/products`,
      {
        method: "DELETE",
        body: JSON.stringify({ ids }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  /**
   * Atualiza o status de um ou mais produtos.
   *
   * @param tenantId - ID da academia
   * @param payload - Objeto contendo:
   *   - ids: array de IDs dos produtos a serem atualizados
   *   - isActive: novo status a ser aplicado
   */ 
  static bulkUpdateStatus(
    tenantId: string,
    payload: { ids: string[]; isActive: boolean }
  ) {
    return serverFetch(
      `${BASE_URL}/api/v1/tenants/${tenantId}/inventory/products`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
