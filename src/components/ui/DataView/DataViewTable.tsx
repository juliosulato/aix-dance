import { Table, Checkbox, Group, Flex } from "@mantine/core";
import { Column } from ".";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DataViewTableProps<T> {
    data: T[];
    columns: Column<T>[];
    selectedRows?: string[];
    onSelectRow?: (id: string, selected: boolean) => void;
    idKey?: keyof T;
    RenderRowMenu?: (item: T) => React.ReactNode;
    RenderAllRowsMenu?: (selectedRows: string[]) => React.ReactNode;
    baseUrl?: string;
}

export default function DataViewTable<T>({
    data,
    columns,
    selectedRows = [],
    onSelectRow,
    idKey = "id" as keyof T,
    RenderAllRowsMenu,
    RenderRowMenu,
    baseUrl
}: DataViewTableProps<T>) {
    const handleSelect = (item: T, checked: boolean) => {
        if (!onSelectRow) return;
        const id = String(item[idKey]);
        onSelectRow(id, checked);
    };

    const router = useRouter();

    const [hoverRow, setHoverRow] = useState<string>("");

    const handleRowClick = (item: T) => {
        if (!baseUrl) return;
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
            return;
        }

        const id = String(item[idKey]);
        router.push(`${baseUrl}/${id}`);
    };

    return (
        <div className="w-full overflow-hidden rounded-3xl">
            <Table className="w-full" verticalSpacing="lg" horizontalSpacing="xl" withRowBorders={false} >
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th className="w-16 rounded-tl-3xl rounded-bl-3xl bg-white">
                            <Group gap="xs">
                                <Checkbox
                                    checked={data.length > 0 && data.every(item => selectedRows.includes(String(item[idKey])))}
                                    indeterminate={
                                        selectedRows.length > 0 && selectedRows.length < data.length
                                    }
                                    onChange={e => {
                                        const checked = e.currentTarget.checked;
                                        data.forEach(item => handleSelect(item, checked));
                                    }}
                                />
                                {selectedRows.length > 1 && RenderAllRowsMenu && RenderAllRowsMenu(selectedRows)}
                            </Group>
                        </Table.Th>

                        {columns.map((col, idx) => {
                            const isLastColumn = idx === columns.length - 1;

                            return (
                                <Table.Th
                                    key={idx}
                                    className={`bg-white ${isLastColumn ? "rounded-br-3xl" : ""}`}
                                >
                                    {col.label}
                                </Table.Th>
                            );
                        })}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    <tr className="bg-neutral-100">
                        <td></td><td></td><td className="py-2">&nbsp;</td>
                    </tr>
                    {data.map((item, rowIdx) => {
                        const isSelected = selectedRows.includes(String(item[idKey]));

                        const bgColor = rowIdx % 2 === 0 ? "white" : "#fafafa";

                        const isFirstRow = rowIdx === 0;
                        const isLastRow = rowIdx === data.length - 1;

                        return (
                            <Table.Tr
                                onClick={() => handleRowClick(item)}
                                key={rowIdx} style={{ backgroundColor: bgColor }}

                                className={`
                                    transition-colors duration-200 
                                    ${baseUrl ? 'cursor-pointer hover:!bg-purple-50' : 'hover:bg-[rgb(124,58,237,0.1)]'}
                                `}
                            >
                                <Table.Td
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                    className={`${isFirstRow ? "rounded-tl-3xl" : ""} ${isLastRow ? "rounded-bl-3xl" : ""}`}
                                >
                                    <Flex gap="sm" align="center">
                                        <Checkbox
                                            checked={isSelected}
                                            onChange={e => handleSelect(item, e.currentTarget.checked)}
                                        />
                                        {isSelected && RenderRowMenu && RenderRowMenu(item)}
                                    </Flex>
                                </Table.Td>
                                {columns.map((col, colIdx) => {
                                    const value = item[col.key];
                                    const isLastColumn = colIdx === columns.length - 1;

                                    return (
                                        <Table.Td
                                            key={colIdx}
                                            className={`${isFirstRow && isLastColumn ? "rounded-tr-3xl" : ""} ${isLastRow && isLastColumn ? "rounded-br-3xl" : ""}`}
                                        >
                                            {col.render
                                                ? col.render(value, item)
                                                : typeof value === "string" || typeof value === "number" || typeof value === "boolean"
                                                    ? value
                                                    : JSON.stringify(value)}
                                        </Table.Td>
                                    );
                                })}
                            </Table.Tr>
                        );
                    })}
                </Table.Tbody>
            </Table>
        </div>

    );
}
