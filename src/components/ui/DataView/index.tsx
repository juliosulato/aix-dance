"use client";

import DataViewHead from "./DataViewHead";
import React, { useState } from "react";
import DataViewTable from "./DataViewTable";
import { Button, Grid, Pagination, Select, Text } from "@mantine/core";
import DataViewGrid from "./DataViewGrid";
import { KeyedMutator } from "swr";
import dayjs from "dayjs";

// --- TIPOS (sem alterações) ---
export type SortDirection = 'asc' | 'desc';
export type SortConfig<T> = { key: keyof T; direction: SortDirection; };
export type DateFilter<T> = { key: keyof T | 'createdAt' | 'updatedAt'; from: Date | null; to: Date | null; };
export type DateFilterOption<T> = { key: keyof T | 'createdAt' | 'updatedAt'; label: string; };
export type FilterOption = { label: string; value: string; };
export type Filter<T> = { key: keyof T; label: string; options: FilterOption[]; type: 'select'; };
export type Column<T> = { key: keyof T; label: string; sortable?: boolean; render?: (value: any, item: T) => React.ReactNode; }

interface DataViewProps<T> {
    pageTitle: string;
    searchbarPlaceholder: string;
    data: T[];
    renderCard: (item: T) => React.ReactNode;
    columns: Column<T>[];
    openNewModal?: { label: string; func: () => void; };
    RenderRowMenu?: (item: T) => React.ReactNode;
    RenderAllRowsMenu?: (selectedRows: string[]) => React.ReactNode;
    filters?: Filter<T>[];
    dateFilterOptions?: DateFilterOption<T>[];
    mutate?: KeyedMutator<T[]>;
    baseUrl: string;
    disableTable?: boolean;
    renderHead?: () => React.ReactNode;
    printable?: boolean;
};

import notFound from "@/assets/images/not-found.png";
import Image from "next/image";
import { IoAdd } from "react-icons/io5";

export default function DataView<T>({
    data,
    pageTitle,
    renderCard,
    searchbarPlaceholder,
    openNewModal,
    columns,
    RenderAllRowsMenu,
    RenderRowMenu,
    filters,
    dateFilterOptions,
    mutate,
    baseUrl,
    disableTable,
    renderHead,
    printable = true
}: DataViewProps<T>) {
    const [activeView, setActiveView] = React.useState<"table" | "grade">("grade");
    const [searchValue, setSearchValue] = React.useState<string>("");
    const [activePage, setPage] = React.useState(1);
    const [rowsPerPage, setRowsPerPage] = React.useState('12');
    const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
    const [activeFilters, setActiveFilters] = React.useState<{ [key: string]: string | null }>({});

    const [sortConfig, setSortConfig] = React.useState<SortConfig<T> | null>(null);
    const [dateFilter, setDateFilter] = useState<DateFilter<T> | null>(
        dateFilterOptions && dateFilterOptions.length > 0
            ? {
                key: dateFilterOptions[0].key,
                from: null,
                to: null
            }
            : null
    );
    React.useEffect(() => {
        const verifyPageSize = () => {
            if (window.innerWidth < 768) {
                setActiveView("grade");
                setRowsPerPage("12");
            } else if (!disableTable) {
                setActiveView("table");
                setRowsPerPage("10");
            }
        };
        verifyPageSize();
        window.addEventListener("resize", verifyPageSize);
        return () => {
            window.removeEventListener("resize", verifyPageSize);
        };
    }, [disableTable]);

    const handleSelectRow = (id: string, selected: boolean) => {
        setSelectedRows(prev =>
            selected ? [...prev, id] : prev.filter(rowId => rowId !== id)
        );
    };

    const handleFilterChange = (filterKey: string, value: string | null) => {
        setActiveFilters(prev => ({
            ...prev,
            [filterKey]: value
        }));
        setPage(1);
    };

    const processedData = React.useMemo(() => {
        let processed = [...data];
        if (searchValue) {
            processed = processed.filter(item =>
                Object.values(item as any).some(value =>
                    String(value).toLowerCase().includes(searchValue.toLowerCase())
                )
            );
        }
        const activeSelectFilters = Object.entries(activeFilters).filter(([, value]) => value);
        if (activeSelectFilters.length > 0) {
            processed = processed.filter(item =>
                activeSelectFilters.every(([key, value]) => String((item as any)[key]) === value)
            );
        }

        if (dateFilter && dateFilter.key && (dateFilter.from || dateFilter.to)) {
            processed = processed.filter(item => {
                const itemDate = new Date((item as any)[dateFilter.key]);
                if (isNaN(itemDate.getTime())) return false;
                const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
                const toDate = dateFilter.to ? new Date(dateFilter.to) : null;
                if (fromDate) fromDate.setHours(0, 0, 0, 0);
                if (toDate) toDate.setHours(23, 59, 59, 999);
                if (fromDate && itemDate < fromDate) return false;
                if (toDate && itemDate > toDate) return false;
                return true;
            });
        }
        if (sortConfig) {
            processed.sort((a, b) => {
                const aValue = (a as any)[sortConfig.key];
                const bValue = (b as any)[sortConfig.key];
                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return processed;
    }, [data, searchValue, activeFilters, dateFilter, sortConfig]);

    const itemsPerPage = parseInt(rowsPerPage, 10);
    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const startIndex = (activePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = processedData.slice(startIndex, endIndex);

    // ✨ LÓGICA DE IMPRESSÃO ATUALIZADA (SEM NOVA ABA) ✨
    const handlePrint = () => {
        if (!processedData || processedData.length === 0) return;

        const tableHeaders = columns
            .filter(col => col.label)
            .map(col => `<th>${col.label}</th>`).join('');

        const tableRows = processedData.map(item => {
            const cells = columns
                .filter(col => col.label)
                .map(col => {
                    const value = (item as any)[col.key];
                    let cellContent = col.render ? col.render(value, item) : value;

                    if (React.isValidElement(cellContent)) {
                        const deepText = (el: React.ReactNode): string => {
                            if (typeof el === 'string') return el;
                            if (React.isValidElement(el) && (el.props as any).children) {
                                return React.Children.toArray((el.props as any).children).map(deepText).join('');
                            }
                            return '';
                        };
                        cellContent = deepText(cellContent);
                    }

                    return `<td>${cellContent || '-'}</td>`;
                }).join('');
            return `<tr>${cells}</tr>`;
        }).join('');

        const printContent = `
            <html>
                <head>
                    <title>${pageTitle}</title>
                    <style>
                        body { font-family: sans-serif; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        @page { size: A4 landscape; margin: 20mm; }
                    </style>
                </head>
                <body>
                    <h1>${pageTitle}</h1>
                    <p>Gerado em: ${dayjs().format("DD/MM/YYYY")}</p>
                    <table>
                        <thead><tr>${tableHeaders}</tr></thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                </body>
            </html>
        `;

        // Cria um iframe invisível para a impressão
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write(printContent);
            doc.close();
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
        }

        // Remove o iframe após a impressão
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 500);
    };


    return (
        <div className="flex flex-col gap-4 md:gap-6">
            <DataViewHead
                pageTitle={pageTitle}
                searchbarPlaceholder={searchbarPlaceholder}
                activeView={activeView}
                setActiveView={setActiveView}
                openNewModal={openNewModal}
                filters={filters}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                dateFilterOptions={dateFilterOptions}
                dateFilter={dateFilter}
                onDateFilterChange={setDateFilter}
                setSearchValue={setSearchValue}
                mutate={mutate}
                disableTable={disableTable}
                renderHead={renderHead}
                printable={printable}
                onPrint={handlePrint}
            />

            {data.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center bg-white gap-4 rounded-2xl shadow-sm p-3 md:p-6">
                    <Image src={notFound} alt="Nada encontrado" className="max-w-[250px]" />
                    <h2 className="font-semibold text-xl md:text-3xl">Ooops... não encontramos nada aqui.</h2>
                    {openNewModal && (
                        <Button
                            type="submit"
                            color="#7439FA"
                            radius="lg"
                            size="lg"
                            className="!text-sm !font-medium tracking-wider min-w-full w-full md:min-w-fit md:w-fit"
                            rightSection={<IoAdd />}
                            onClick={openNewModal.func}
                        >
                            {openNewModal.label}
                        </Button>
                    )}
                </div>
            )}

            {data.length > 0 && !disableTable && activeView === "table" && (
                <DataViewTable
                    columns={columns}
                    data={paginatedData}
                    selectedRows={selectedRows}
                    onSelectRow={handleSelectRow}
                    RenderAllRowsMenu={RenderAllRowsMenu}
                    RenderRowMenu={RenderRowMenu}
                    baseUrl={baseUrl}
                    sortConfig={sortConfig}
                    onSort={setSortConfig}
                />
            )}

            {activeView === "grade" && (
                <DataViewGrid
                    data={paginatedData}
                    renderCard={renderCard}
                    baseUrl={baseUrl}
                />
            )}

            {processedData.length > 10 && (
                <Grid align="center" className="mt-2 md:mt-4 p-4 py-6 md:p-6 lg:py-3 lg:px-6 rounded-3xl bg-white">
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Text size="sm" c="dimmed" ta={{ base: 'center', md: 'left' }}>
                            Mostrando {startIndex + 1}–{Math.min(endIndex, processedData.length)} de {processedData.length}
                        </Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Pagination
                            total={totalPages}
                            value={activePage}
                            onChange={setPage}
                            radius="md"
                            size="md"
                            className="justify-center justify-self-center"
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Select
                            value={rowsPerPage}
                            label={"Linhas por página"}
                            onChange={value => {
                                setRowsPerPage(value || '12');
                                setPage(1);
                            }}
                            data={activeView === "table" ? ['10', '20', '50', '100'] : ['12', '24', '48', '96']}
                            className="ml-auto"
                            w={{ base: '100%', sm: 250 }}
                        />
                    </Grid.Col>
                </Grid>
            )}
        </div>
    );
}

