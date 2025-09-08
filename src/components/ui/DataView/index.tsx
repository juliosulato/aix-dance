"use client";

import { useTranslations } from "next-intl";
import DataViewHead from "./DataViewHead";
import React, { useState } from "react";
import DataViewTable from "./DataViewTable";
import { Grid, Pagination, ScrollArea, Select, Text } from "@mantine/core";
import DataViewGrid from "./DataViewGrid";
import { KeyedMutator } from "swr";
import dayjs from "dayjs";

// --- TIPOS ATUALIZADOS E NOVOS ---

export type SortDirection = 'asc' | 'desc';

export type SortConfig<T> = {
    key: keyof T;
    direction: SortDirection;
};

export type DateFilter<T> = {
    key: keyof T | 'createdAt' | 'updatedAt'; // Chaves pré-definidas ou do tipo T
    from: Date | null;
    to: Date | null;
};

export type DateFilterOption<T> = {
    key: keyof T | 'createdAt' | 'updatedAt';
    label: string;
};

export type FilterOption = {
    label: string;
    value: string;
};

export type Filter<T> = {
    key: keyof T;
    label: string;
    options: FilterOption[];
    type: 'select';
};

export type Column<T> = {
    key: keyof T;
    label: string;
    sortable?: boolean; // NOVO: Permite ordenação nesta coluna
    render?: (value: any, item: T) => React.ReactNode;
}

interface DataViewProps<T> {
    pageTitle: string;
    searchbarPlaceholder: string;
    data: T[];
    renderCard: (item: T) => React.ReactNode;
    columns: Column<T>[];
    openNewModal?: {
        label: string;
        func: () => void;
    };
    RenderRowMenu?: (item: T) => React.ReactNode;
    RenderAllRowsMenu?: (selectedRows: string[]) => React.ReactNode;
    filters?: Filter<T>[];
    dateFilterOptions?: DateFilterOption<T>[]; // NOVO: Opções para filtro de data
    mutate?: KeyedMutator<T[]>;
    baseUrl: string;
    disableTable?: boolean;
    renderHead?: () => React.ReactNode;
};


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
    dateFilterOptions, // NOVO
    mutate,
    baseUrl,
    disableTable,
    renderHead
}: DataViewProps<T>) {
    const t = useTranslations("");
    const [activeView, setActiveView] = React.useState<"table" | "grade">("grade");
    const [searchValue, setSearchValue] = React.useState<string>("");
    const [activePage, setPage] = React.useState(1);
    const [rowsPerPage, setRowsPerPage] = React.useState('12');
    const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
    const [activeFilters, setActiveFilters] = React.useState<{ [key: string]: string | null }>({});

    // --- NOVOS ESTADOS PARA ORDENAÇÃO E FILTRO DE DATA ---
    const [sortConfig, setSortConfig] = React.useState<SortConfig<T> | null>(null);
    const [dateFilter, setDateFilter] = useState<DateFilter<T> | null>(
        dateFilterOptions && dateFilterOptions.length > 0
            ? {
                key: dateFilterOptions[0].key, // Usa a primeira opção como chave padrão
                from: dayjs().startOf('day').toDate(), // De: hoje
                to: dayjs().add(30, 'day').endOf('day').toDate() // Até: 30 dias a partir de hoje
            }
            : null
    );
    React.useEffect(() => {
        const verifyPageSize = () => {
            if (window.innerWidth < 768) {
                setActiveView("grade");
                setRowsPerPage("12")
            } else if (!disableTable) {
                setActiveView("table")
                setRowsPerPage("10")
            }
        }

        verifyPageSize()
        window.addEventListener("resize", verifyPageSize)

        return () => {
            window.removeEventListener("resize", verifyPageSize)
        }
    }, [disableTable])

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

        // 1. Filtro de busca
        if (searchValue) {
            processed = processed.filter(item =>
                Object.values(item as any).some(value =>
                    String(value).toLowerCase().includes(searchValue.toLowerCase())
                )
            );
        }

        // 2. Filtros de Select
        const activeSelectFilters = Object.entries(activeFilters).filter(([, value]) => value);
        if (activeSelectFilters.length > 0) {
            processed = processed.filter(item =>
                activeSelectFilters.every(([key, value]) => String((item as any)[key]) === value)
            );
        }

        // 3. Filtro de Data (NOVO)
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

        // 4. Ordenação (NOVO)
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

    return (
        <div className="flex flex-col gap-4 md:gap-6">
            <DataViewHead
                t={t}
                pageTitle={pageTitle}
                searchbarPlaceholder={searchbarPlaceholder}
                activeView={activeView}
                setActiveView={setActiveView}
                openNewModal={openNewModal}
                filters={filters}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                dateFilterOptions={dateFilterOptions} // NOVO
                dateFilter={dateFilter} // NOVO
                onDateFilterChange={setDateFilter} // NOVO
                setSearchValue={setSearchValue}
                mutate={mutate}
                disableTable={disableTable}
                renderHead={renderHead}
            />

            {!disableTable && activeView === "table" && (
                <DataViewTable
                    columns={columns}
                    data={paginatedData}
                    selectedRows={selectedRows}
                    onSelectRow={handleSelectRow}
                    RenderAllRowsMenu={RenderAllRowsMenu}
                    RenderRowMenu={RenderRowMenu}
                    baseUrl={baseUrl}
                    sortConfig={sortConfig} // NOVO
                    onSort={setSortConfig} // NOVO
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
                            label={t("dataView.itemsPerPage")}
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
