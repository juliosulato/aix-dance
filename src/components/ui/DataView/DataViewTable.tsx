import { Table, Checkbox } from "@mantine/core";
import { Column } from ".";

interface DataViewTableProps<T> {
    data: T[];
    columns: Column<T>[];
    selectedRows?: string[];
    onSelectRow?: (id: string, selected: boolean) => void;
    idKey?: keyof T;
}

export default function DataViewTable<T>({
    data,
    columns,
    selectedRows = [],
    onSelectRow,
    idKey = "id" as keyof T
}: DataViewTableProps<T>) {
    const handleSelect = (item: T, checked: boolean) => {
        if (!onSelectRow) return;
        const id = String(item[idKey]);
        onSelectRow(id, checked);
    };

    return (
        <div className="w-full overflow-hidden rounded-3xl">
            <Table className="w-full" verticalSpacing="lg" horizontalSpacing="xl" withRowBorders={false} >
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th className="w-16 rounded-tl-3xl rounded-bl-3xl bg-white">
                            <Checkbox
                                checked={data.every(item => selectedRows.includes(String(item[idKey]))) && data.length > 0}
                                onChange={e => {
                                    const checked = e.currentTarget.checked;
                                    data.forEach(item => handleSelect(item, checked));
                                }}
                            />
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
                            <Table.Tr key={rowIdx} style={{ backgroundColor: bgColor }} className="transition-colors duration-200 hover:bg-[rgb(124, 58, 237, 0.1)]">
                                <Table.Td
                                    className={`
                    ${isFirstRow ? "rounded-tl-3xl" : ""} 
                    ${isLastRow ? "rounded-bl-3xl" : ""}
                `}
                                >
                                    <Checkbox
                                        checked={isSelected}
                                        onChange={e => handleSelect(item, e.currentTarget.checked)}
                                    />
                                </Table.Td>

                                {columns.map((col, colIdx) => {
                                    const value = item[col.key];
                                    const isLastColumn = colIdx === columns.length - 1;

                                    return (
                                        <Table.Td
                                            key={colIdx}
                                            className={`
                            ${isFirstRow && isLastColumn ? "rounded-tr-3xl" : ""} 
                            ${isLastRow && isLastColumn ? "rounded-br-3xl" : ""}
                        `}
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
