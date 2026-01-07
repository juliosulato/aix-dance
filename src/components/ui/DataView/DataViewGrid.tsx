import React from "react";
import { SimpleGrid, Box } from "@mantine/core";
import { useRouter } from "next/navigation";

interface DataViewGridProps<T> {
  data: T[];
  renderCard: (item: T) => React.ReactNode;
  baseUrl?: string;
  idKey?: keyof T;
}

export default function DataViewGrid<T>({
  data,
  renderCard,
  baseUrl,
  idKey = "id" as keyof T,
}: DataViewGridProps<T>) {
  const router = useRouter();

  const handleItemClick = (item: T, event: React.MouseEvent) => {
    if (!baseUrl) return;

    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;

    const url = `${baseUrl}/${String(item[idKey])}`;

    if (event?.button === 1) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    const id = String((item as any)[idKey]);
    router.push(`${baseUrl}/${id}`);
  };

  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} // Ajuste responsivo do Mantine
      spacing="md"
      verticalSpacing="md"
    >
      {data.map((item, index) => {
        // Gera uma key única confiável
        const keyValue = (item as any)[idKey] || index;

        return (
          <Box
            key={keyValue}
            onClick={(e) => handleItemClick(item, e)}
            onAuxClick={(e) => handleItemClick(item, e)}
            className={`
              relative flex flex-col h-full
              bg-white rounded-2xl shadow-sm border border-gray-100
              transition-all duration-200 ease-in-out
              hover:shadow-md hover:border-violet-100
              ${baseUrl ? "cursor-pointer active:scale-[0.99]" : ""}
            `}
          >
            {renderCard(item)}
          </Box>
        );
      })}
    </SimpleGrid>
  );
}
