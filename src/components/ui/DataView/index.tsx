"use client";

import { useTranslations } from "next-intl";
import DataViewHead from "./DataViewHead";
import { useEffect, useState } from "react";
import DataViewTable from "./DataViewTable";
import { Grid, Pagination, Select, Text } from "@mantine/core";
import DataViewGrid from "./DataViewGrid"; // NOVO: Importa o componente de grade

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
    }
};


export default function DataView<T>({
    data,
    pageTitle,
    renderCard,
    searchbarPlaceholder,
    openNewModal,
    columns
}: DataViewProps<T>) {
    const t = useTranslations("");
    const [activeView, setActiveView] = useState<"table" | "grade">("grade"); 
    const [searchValue, setSearchValue] = useState<string>("");

    useEffect(() => {
        const verifyPageSize = () => {
            if (window.innerWidth < 768) {
                setActiveView("grade");
            } else {
                setActiveView("table")
            }
        }

        verifyPageSize()
        window.addEventListener("resize", verifyPageSize)

        return () => {
            window.removeEventListener("resize", verifyPageSize)
        }
    }, [])

    const [activePage, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState('12');
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    const handleSelectRow = (id: string, selected: boolean) => {
        setSelectedRows(prev =>
            selected ? [...prev, id] : prev.filter(rowId => rowId !== id)
        );
    };

    const filteredData = data.filter(item => 
        Object.values(item as any).some(value => 
            String(value).toLowerCase().includes(searchValue.toLowerCase())
        )
    );

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
                setSearchValue={setSearchValue}
            />

            {activeView === "table" && (
                <DataViewTable
                    columns={columns}
                    data={paginatedData}
                    selectedRows={selectedRows}
                    onSelectRow={handleSelectRow}
                />
            )}
            
            {activeView === "grade" && (
                <DataViewGrid 
                    data={paginatedData}
                    renderCard={renderCard}
                />
            )}


            {filteredData.length > parseInt(rowsPerPage) && (
                <Grid align="center" className="mt-2 md:mt-4 p-4 md:px-6 rounded-3xl bg-white">
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
                            size="lg"
                            className="justify-center"
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 4}}>
                        <Select
                            value={rowsPerPage}
                            label={t("table.itemsPerPage")}
                            onChange={value => {
                                setRowsPerPage(value || '12');
                                setPage(1);
                            }}
                            data={['12', '24', '48', '96']} 
                            className="ml-auto"
                            w={{ base: '100%', sm: 250 }}
                        />
                    </Grid.Col>
                </Grid>
            )}
        </div>
    );
}