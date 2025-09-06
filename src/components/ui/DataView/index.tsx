"use client";

import { useTranslations } from "next-intl";
import DataViewHead from "./DataViewHead";
import React, { useEffect, useState } from "react";
import DataViewTable from "./DataViewTable";
import { Grid, Pagination, Select, Text } from "@mantine/core";
import DataViewGrid from "./DataViewGrid";
import { KeyedMutator } from "swr";

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
    render?: (value: any, item: T) => React.ReactNode;
}

interface DataViewProps<T> {
    pageTitle: string;
    searchbarPlaceholder: string;
    data: T[];
    renderCard: (item: T) => React.ReactNode; 
    columns: Column<T>[];
    openNewModal: {
        label: string;
        func: () => void;
    };
    RenderRowMenu?: (item: T) => React.ReactNode; 
    RenderAllRowsMenu?: (selectedRows: string[]) => React.ReactNode; 
    filters?: Filter<T>[];
    mutate?: KeyedMutator<T[]>;
    baseUrl: string;
    disableTable?: boolean;
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
    mutate,
    baseUrl,
    disableTable
}: DataViewProps<T>) {
    const t = useTranslations("");
    const [activeView, setActiveView] = useState<"table" | "grade">("grade"); 
    const [searchValue, setSearchValue] = useState<string>("");
    const [activePage, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState('12');
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [activeFilters, setActiveFilters] = useState<{ [key: string]: string | null }>({});

    useEffect(() => {
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
    }, [])


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
        setPage(1); // Reseta para a primeira página ao aplicar um filtro
    };

    // ALTERADO: Lógica de filtragem atualizada
    const filteredData = data
        // 1. Filtro de busca (como já existia)
        .filter(item => 
            Object.values(item as any).some(value => 
                String(value).toLowerCase().includes(searchValue.toLowerCase())
            )
        )
        // 2. Filtros de Select (lógica nova)
        .filter(item => {
            // Object.entries transforma { status: 'active' } em [['status', 'active']]
            return Object.entries(activeFilters).every(([key, value]) => {
                // Se o filtro não tiver valor (for null ou undefined), ignora ele
                if (!value) return true;
                // Compara o valor do item com o valor do filtro
                return String((item as any)[key]) === value;
            });
        });

    const itemsPerPage = parseInt(rowsPerPage, 10);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (activePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return (
        <div className="flex flex-col gap-4 md:gap-6">
            <DataViewHead
                t={t}
                pageTitle={pageTitle}
                searchbarPlaceholder={searchbarPlaceholder}
                activeView={activeView}
                setActiveView={setActiveView}
                openNewModal={openNewModal}
                filters={filters} // NOVO: Passa as definições de filtro
                activeFilters={activeFilters} // NOVO: Passa os filtros ativos
                onFilterChange={handleFilterChange} // NOVO: Passa a função de callback
                setSearchValue={setSearchValue}
                mutate={mutate}
                disableTable={disableTable}
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
                />
            )}
            
            {activeView === "grade" && (
                <DataViewGrid 
                    data={paginatedData}
                    renderCard={renderCard}
                    baseUrl={baseUrl}
                />
            )}


            {data.length >= 10 && (
                <Grid align="center" className="mt-2 md:mt-4 p-4 py-6 md:p-6 lg:py-3 lg:px-6 rounded-3xl bg-white">
                    <Grid.Col span={{ base: 12, md: 4}}>
                        <Text size="sm" c="dimmed" ta={{ base: 'center', md: 'left' }}>
                            Mostrando {startIndex + 1}–{Math.min(endIndex, filteredData.length)} de {filteredData.length}
                        </Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4}}>
                        <Pagination
                            total={totalPages}
                            value={activePage}
                            onChange={setPage}
                            radius="md"
                            size="md"
                            className="justify-center justify-self-center"
                        />
                    </Grid.Col>

                    {activeView == "table" ? (
                        <Grid.Col span={{ base: 12, md: 4}}>
                        <Select
                            value={rowsPerPage}
                            label={t("dataView.itemsPerPage")}
                            onChange={value => {
                                setRowsPerPage(value || '12');
                                setPage(1);
                            }}
                            data={['10', '20', '50', '100']} 
                            className="ml-auto"
                            w={{ base: '100%', sm: 250 }}
                        />
                    </Grid.Col>
                    ) : (
                        <Grid.Col span={{ base: 12, md: 4}}>
                        <Select
                            value={rowsPerPage}
                            label={t("dataView.itemsPerPage")}
                            onChange={value => {
                                setRowsPerPage(value || '12');
                                setPage(1);
                            }}
                            data={['12', '24', '48', '96']} 
                            className="ml-auto"
                            w={{ base: '100%', sm: 250 }}
                        />
                    </Grid.Col>
                    )}
                </Grid>
            )}
        </div>
    );
}