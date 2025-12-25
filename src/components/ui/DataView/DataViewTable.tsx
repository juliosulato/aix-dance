import { Table, Checkbox, Group, Flex, UnstyledButton } from "@mantine/core";
import { Column, SortConfig } from ".";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { TbArrowDown, TbArrowUp, TbArrowsSort } from "react-icons/tb";

interface DataViewTableProps<T> {
    data: T[];
    columns: Column<T>[];
    selectedRows?: string[];
    onSelectRow?: (id: string, selected: boolean) => void;
    idKey?: keyof T;
    RenderRowMenu?: (item: T) => React.ReactNode;
    RenderAllRowsMenu?: (selectedRows: string[]) => React.ReactNode;
    baseUrl?: string;
    sortConfig: SortConfig<T> | null;
    onSort: React.Dispatch<React.SetStateAction<SortConfig<T> | null>>;
}

export default function DataViewTable<T>({
    data,
    columns,
    selectedRows = [],
    onSelectRow,
    idKey = "id" as keyof T,
    RenderAllRowsMenu,
    RenderRowMenu,
    baseUrl,
    sortConfig,
    onSort
}: DataViewTableProps<T>) {
    const handleSelect = (item: T, checked: boolean) => {
        if (!onSelectRow) return;
        const id = String(item[idKey]);
        onSelectRow(id, checked);
    };

    const [rowHover, setRowHover] = useState<string | null>(null);

    const router = useRouter();

    const handleRowClick = (item: T) => {
        if (!baseUrl) return;
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) return;

        const id = String(item[idKey]);
        router.push(`${baseUrl}/${id}`);
    };

    const handleSort = (key: keyof T) => {
        onSort(prev => {
            if (prev?.key === key && prev.direction === 'asc') {
                return { key, direction: 'desc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const SortIcon = ({ columnKey }: { columnKey: keyof T }) => {
        if (sortConfig?.key !== columnKey) return <TbArrowsSort size={14} className="text-gray-400" />;
        if (sortConfig.direction === 'asc') return <TbArrowUp size={14} className="text-violet-600" />;
        return <TbArrowDown size={14} className="text-violet-600" />;
    };

    return (
        <div className="w-full overflow-hidden rounded-3xl">
            <Table.ScrollContainer minWidth={500}>
                <Table className="w-full" verticalSpacing="lg" horizontalSpacing="xl" withRowBorders={false} >
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th className="!max-w-fit rounded-tl-3xl rounded-bl-3xl bg-white text-nowrap">
                                <Group gap="xs">
                                    <Checkbox
                                        checked={data.length > 0 && data.every(item => selectedRows.includes(String(item[idKey])))}
                                        indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
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
                                    <Table.Th key={idx} className={`bg-white text-nowrap ${isLastColumn ? "rounded-tr-3xl rounded-br-3xl" : ""}`}>
                                        {col.sortable ? (
                                            <UnstyledButton onClick={() => handleSort(col.key)} className="w-full">
                                                <Group justify="space-between" gap="xs" wrap="nowrap">
                                                    {col.label}
                                                    <SortIcon columnKey={col.key} />
                                                </Group>
                                            </UnstyledButton>
                                        ) : (
                                            col.label
                                        )}
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
                                    onMouseEnter={() => setRowHover(String(rowIdx))}
                                    onMouseLeave={() => setRowHover(null)}
                                    className={`
                                    transition-colors duration-200 
                                    ${baseUrl ? 'cursor-pointer hover:!bg-purple-50' : 'hover:bg-[rgb(124,58,237,0.1)]'}
                                `}
                                >
                                    <Table.Td
                                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                        className={`${isFirstRow ? "rounded-tl-3xl" : ""} ${isLastRow ? "rounded-bl-3xl" : ""}`}
                                    >
                                        <Flex gap="sm" align="center"
                                            className={`transition opacity-0 ${(rowHover == String(rowIdx) || isSelected) && "opacity-100"}`}
                                        >
                                            <Checkbox
                                                checked={isSelected}
                                                onChange={e => handleSelect(item, e.currentTarget.checked)}
                                            />
                                            {RenderRowMenu && RenderRowMenu(item)}
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
                                                        : value ? JSON.stringify(value ) : ""}
                                            </Table.Td>
                                        );
                                    })}
                                </Table.Tr>
                            );
                        })}
                    </Table.Tbody>
                </Table>
            </Table.ScrollContainer>
        </div>
    );
}
