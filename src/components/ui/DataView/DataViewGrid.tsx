import { SimpleGrid } from "@mantine/core";
import { useRouter } from "next/navigation"; // NOVO

interface DataViewGridProps<T> {
    data: T[];
    renderCard: (item: T) => React.ReactNode;
    baseUrl?: string; // NOVO
    idKey?: keyof T; // NOVO: Para consistência com a tabela
}

export default function DataViewGrid<T>({ 
    data, 
    renderCard, 
    baseUrl, 
    idKey = "id" as keyof T 
}: DataViewGridProps<T>) {
    const router = useRouter(); // NOVO

    return (
        <SimpleGrid
            className="gap-4"
            cols={{ base: 1, sm: 2, lg: 4 }}
        >
            {data.map((item, index) => (
                <div
                    key={index}
                    // ALTERADO: Adiciona classes de hover/cursor e o evento onClick
                    className={`
                        bg-white shadow-sm rounded-2xl p-4 md:p-6 flex flex-col gap-4 md:gap-6 justify-between
                        transition-colors duration-200
                        ${baseUrl ? 'cursor-pointer hover:bg-purple-50' : ''}
                    `}
                    onClick={() => {
                        if (baseUrl) {
                            const id = String(item[idKey]);
                            router.push(`${baseUrl}/${id}`);
                        }
                    }}
                >
                    {/* Para evitar que clicar no menu do card redirecione, 
                        o componente de menu dentro do renderCard deve ter e.stopPropagation() */}
                    {renderCard ? renderCard(item) : null}
                </div>
            ))}
        </SimpleGrid>
    );
}