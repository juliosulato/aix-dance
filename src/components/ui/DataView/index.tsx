"use client";

import React from "react";
import { Pagination, Select, Text, LoadingOverlay } from "@mantine/core";
import { KeyedMutator } from "swr";

import DataViewHead from "./DataViewHead";
import DataViewTable from "./DataViewTable";
import DataViewGrid from "./DataViewGrid";
import { useDataView } from "@/hooks/useDataView"; 
import { printData } from "./print";
import { AdvancedFilter, Column, PaginatedResponse, SortConfig, ActiveFilters } from "@/types/data-view.types";

interface DataViewProps<T> {
  data: T[] | PaginatedResponse<T>;
  isLoading?: boolean; 
  mutate?: KeyedMutator<any>;
  
  pageTitle: string;
  itemKey?: string;
  baseUrl?: string;
  searchPlaceholder?: string;
  disableTable?: boolean;
  
  columns: Column<T>[];
  filters?: AdvancedFilter<T>[];
  enableAdvancedDateFilter?: boolean;

  renderCard: (item: T) => React.ReactNode;
  RenderRowMenu?: (item: T) => React.ReactNode;
  RenderAllRowsMenu?: (selectedRows: string[]) => React.ReactNode;
  openNewModal?: { label: string; func: () => void };
  
  onPageChange?: (page: number, limit: number, sort: SortConfig<T> | null, filters: ActiveFilters) => void;
}

export default function DataView<T>({
  data,
  isLoading = false,
  mutate,
  pageTitle,
  itemKey,
  baseUrl,
  searchPlaceholder = "Buscar...",
  columns,
  filters = [],
  enableAdvancedDateFilter = false,
  renderCard,
  RenderRowMenu,
  RenderAllRowsMenu,
  openNewModal,
  disableTable,
  onPageChange,
}: DataViewProps<T>) {

  const allFilters = React.useMemo(() => {
      const finalFilters = [...filters];
      if (enableAdvancedDateFilter) {
          finalFilters.push(
              { key: 'createdAt', label: 'Criado em', type: 'date' },
              { key: 'updatedAt', label: 'Atualizado em', type: 'date' }
          );
      }
      return finalFilters;
  }, [filters, enableAdvancedDateFilter]);

  const logic = useDataView({
    data,
    itemKey,
    onPageChange
  });

  const handlePrint = () => {
    printData(pageTitle, logic.data, columns);
  };

  return (
    <div className="relative flex flex-col gap-6 min-h-500px">
      <LoadingOverlay visible={isLoading} overlayProps={{ radius: "sm", blur: 2 }} />

      <DataViewHead
        title={pageTitle}
        placeholder={searchPlaceholder}
        activeView={logic.activeView}
        onToggleView={logic.setActiveView}
        searchValue={logic.searchValue}
        onSearchChange={logic.setSearchValue}
        filters={allFilters}
        activeFilters={logic.activeFilters}
        onFilterChange={logic.handleFilterChange}
        onRefresh={() => mutate?.()}
        onPrint={handlePrint}
        actionButton={openNewModal ? { label: openNewModal.label, onClick: openNewModal.func } : undefined}
        disableTable={disableTable}
      />

      <div className="flex-1">
        {logic.data.length === 0 && !isLoading ? (
             <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                 <Text c="dimmed" size="lg">Nenhum registro encontrado</Text>
             </div>
        ) : (
            <>
                {logic.activeView === "table" && !disableTable ? (
                <DataViewTable
                    data={logic.data}
                    columns={columns}
                    selectedRows={logic.selectedRows}
                    onSelectRow={logic.handleSelectRow}
                    onSelectAll={logic.handleSelectAll}
                    idKey={"id" as keyof T} 
                    baseUrl={baseUrl}
                    sortConfig={logic.sortConfig}
                    onSort={logic.handleSort}
                    RenderRowMenu={RenderRowMenu}
                    RenderAllRowsMenu={RenderAllRowsMenu}
                />
                ) : (
                <DataViewGrid
                    data={logic.data}
                    renderCard={renderCard}
                    baseUrl={baseUrl}
                    idKey={"id" as keyof T}
                />
                )}
            </>
        )}
      </div>

      {logic.totalItems > logic.limit && (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <Text size="sm" c="dimmed">
                Total de <b>{logic.totalItems}</b> registros
            </Text>

            <Pagination 
                total={logic.totalPages} 
                value={logic.activePage} 
                onChange={logic.handlePageChange} 
                color="violet"
                radius="md"
            />

            <Select
                value={String(logic.limit)}
                onChange={(val) => logic.setLimit(Number(val))}
                data={['12', '24', '48', '100']}
                w={100}
                allowDeselect={false}
            />
        </div>
      )}
    </div>
  );
}