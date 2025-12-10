export interface StockMovementFromApi {
    id: string;
    productId: string;
    type: 'IN' | 'OUT';
    quantity: number;
    reason: string;
    createdAt: string;
    createdBy: {
        id: string;
        name: string;
        email: string;
    };
}