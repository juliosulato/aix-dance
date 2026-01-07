import { Table, Checkbox, Group, Flex, ScrollArea } from "@mantine/core";
import { Column, SortConfig } from "@/types/data-view.types";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { TbArrowDown, TbArrowUp, TbArrowsSort } from "react-icons/tb";

interface DataViewTableProps<T> {
  data: T[];
  columns: Column<T>[];
  selectedRows: string[];
  onSelectRow: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  idKey?: keyof T;
  RenderRowMenu?: (item: T) => React.ReactNode;
  RenderAllRowsMenu?: (selectedRows: string[]) => React.ReactNode;
  baseUrl?: string;
  sortConfig: SortConfig<T> | null;
  onSort: (config: SortConfig<T> | null) => void;
}

export default function DataViewTable<T>({
  data,
  columns,
  selectedRows,
  onSelectRow,
  onSelectAll,
  idKey = "id" as keyof T,
  RenderAllRowsMenu,
  RenderRowMenu,
  baseUrl,
  sortConfig,
  onSort,
}: DataViewTableProps<T>) {
  const router = useRouter();
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleRowClick = (item: T, event?: React.MouseEvent) => {
    if (!baseUrl) return;

    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;

    const url = `${baseUrl}/${String(item[idKey])}`;

    if (event?.button === 1) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    router.push(url);
  };

  const handleHeaderSort = (key: keyof T) => {
    const direction =
      sortConfig?.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    onSort({ key, direction });
  };

  const allSelected =
    data.length > 0 &&
    data.every((d) => selectedRows.includes(String(d[idKey])));
  const indeterminate = selectedRows.length > 0 && !allSelected;

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <ScrollArea>
        <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
          <Table.Thead className="bg-gray-50">
            <Table.Tr>
              <Table.Th w={50} className="rounded-tl-2xl">
                <Group gap="xs">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={indeterminate}
                    onChange={(e) => onSelectAll(e.currentTarget.checked)}
                    color="violet"
                  />
                  {selectedRows.length > 0 &&
                    RenderAllRowsMenu &&
                    RenderAllRowsMenu(selectedRows)}
                </Group>
              </Table.Th>

              {columns.map((col) => (
                <Table.Th
                  key={String(col.key)}
                  style={{
                    width: col.width,
                    minWidth: col.minWidth ?? 150,
                    textAlign: col.align || "left",
                  }}
                  className="whitespace-nowrap font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => col.sortable && handleHeaderSort(col.key)}
                >
                  <Group
                    justify={col.align === "right" ? "flex-end" : "flex-start"}
                    gap={4}
                  >
                    {col.label}
                    {col.sortable && (
                      <span className="text-gray-400 flex items-center">
                        {sortConfig?.key === col.key ? (
                          sortConfig.direction === "asc" ? (
                            <TbArrowUp size={14} className="text-violet-600" />
                          ) : (
                            <TbArrowDown
                              size={14}
                              className="text-violet-600"
                            />
                          )
                        ) : (
                          <TbArrowsSort size={14} />
                        )}
                      </span>
                    )}
                  </Group>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {data.map((item, idx) => {
              const id = String(item[idKey]);
              const isSelected = selectedRows.includes(id);

              return (
                <Table.Tr
                  key={id}
                  onClick={(e) => handleRowClick(item, e)}
                  onMouseDown={(e) => {
                    if (e.button === 1) {
                      e.preventDefault();
                      handleRowClick(item, e);
                    }
                  }}
                  onMouseEnter={() => setHoveredRow(id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`transition-colors duration-150 ${
                    baseUrl ? "cursor-pointer" : ""
                  }`}
                  bg={isSelected ? "var(--mantine-color-violet-0)" : undefined}
                >
                  <Table.Td>
                    <Flex align="center" gap="sm">
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) =>
                          onSelectRow(id, e.currentTarget.checked)
                        }
                        onClick={(e) => e.stopPropagation()}
                        color="violet"
                      />
                      {/* Mostra menu apenas no hover ou se selecionado para limpar UI */}
                      <div
                        className={`transition-opacity duration-200 ${
                          hoveredRow === id || isSelected
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      >
                        {RenderRowMenu && RenderRowMenu(item)}
                      </div>
                    </Flex>
                  </Table.Td>

                  {columns.map((col) => (
                    <Table.Td
                      key={String(col.key)}
                      style={{ textAlign: col.align || "left" }}
                      c="dimmed"
                      className="text-sm"
                    >
                      {col.render
                        ? col.render(item[col.key], item)
                        : String(item[col.key] ?? "")}
                    </Table.Td>
                  ))}
                </Table.Tr>
              );
            })}
            {/* Empty State na Tabela */}
            {data.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={columns.length + 1} align="center" py="xl">
                  <span className="text-gray-400 italic">
                    Sem dados para exibir
                  </span>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </div>
  );
}
