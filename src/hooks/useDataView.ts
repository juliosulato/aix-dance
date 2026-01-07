// useDataView.ts
import { useState, useMemo, useCallback } from "react";
import { SortConfig, ActiveFilters, PaginatedResponse } from "@/types/data-view.types";
import dayjs from "dayjs";

interface UseDataViewProps<T> {
  data: T[] | PaginatedResponse<T>;
  itemKey?: string;
  initialPage?: number;
  initialLimit?: number;
  onPageChange?: (page: number, limit: number, sort: SortConfig<T> | null, filters: ActiveFilters) => void;
}

export function useDataView<T>({
  data,
  itemKey = "data", // Default mais genérico
  initialPage = 1,
  initialLimit = 12,
  onPageChange,
}: UseDataViewProps<T>) {
  // --- Estados ---
  const [activeView, setActiveView] = useState<"table" | "grade">("table"); // Default table para ERP é melhor
  const [searchValue, setSearchValue] = useState("");
  const [activePage, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);

  // --- Identificação do Modo (Server vs Client) ---
  const isServerPaginated = !Array.isArray(data);
  
  // Normalização dos dados
  const rawItems: T[] = useMemo(() => {
    if (isServerPaginated) {
      const response = data as PaginatedResponse<T>;
      // Tenta encontrar a chave correta dinamicamente se itemKey falhar, ou usa itemKey
      const foundKey = Object.keys(response).find(k => Array.isArray(response[k])) || itemKey;
      return (response[foundKey] as T[]) || [];
    }
    return data as T[];
  }, [data, isServerPaginated, itemKey]);

  const totalItems = isServerPaginated
    ? (data as PaginatedResponse<T>).pagination?.total ?? 0
    : rawItems.length;

  // --- Lógica Client-Side (Filtro, Busca, Sort) ---
  const processedData = useMemo(() => {
    // Se for server-side, assumimos que a API já devolveu os dados filtrados/ordenados
    if (isServerPaginated) return rawItems;

    let processed = [...rawItems];

    // 1. Busca textual global
    if (searchValue) {
      const lowerSearch = searchValue.toLowerCase();
      processed = processed.filter((item) =>
        Object.values(item as any).some((val) =>
          String(val).toLowerCase().includes(lowerSearch)
        )
      );
    }

    // 2. Filtros Avançados
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return;
      
      processed = processed.filter((item) => {
        const itemVal = (item as any)[key];
        
        // Lógica simples de igualdade. Pode expandir para 'includes', 'range', etc.
        if (key === 'createdAt' || key === 'updatedAt' || key.includes('date')) {
             // Exemplo simples: Data exata ou range (precisaria refinar logica de range aqui)
             return dayjs(itemVal).isSame(value, 'day');
        }
        return String(itemVal) === String(value);
      });
    });

    // 3. Ordenação
    if (sortConfig) {
      processed.sort((a, b) => {
        const valA = (a as any)[sortConfig.key];
        const valB = (b as any)[sortConfig.key];

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return processed;
  }, [rawItems, searchValue, activeFilters, sortConfig, isServerPaginated]);

  // --- Paginação Client-Side ---
  const paginatedData = useMemo(() => {
    if (isServerPaginated) return processedData; // Server já devolve paginado
    const start = (activePage - 1) * limit;
    return processedData.slice(start, start + limit);
  }, [processedData, activePage, limit, isServerPaginated]);

  // --- Handlers ---
  
  const handleSort = useCallback((config: SortConfig<T> | null) => {
    setSortConfig(config);
    if (isServerPaginated && onPageChange) {
      onPageChange(1, limit, config, activeFilters); // Reseta pra pág 1 ao ordenar
    }
  }, [isServerPaginated, limit, activeFilters, onPageChange]);

  const handlePageChange = useCallback((page: number) => {
    setPage(page);
    if (isServerPaginated && onPageChange) {
      onPageChange(page, limit, sortConfig, activeFilters);
    }
  }, [isServerPaginated, limit, sortConfig, activeFilters, onPageChange]);

  const handleFilterChange = useCallback((key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    setPage(1); // Reseta paginação
    if (isServerPaginated && onPageChange) {
      onPageChange(1, limit, sortConfig, newFilters);
    }
  }, [activeFilters, isServerPaginated, limit, sortConfig, onPageChange]);

  const handleSelectRow = useCallback((id: string, selected: boolean) => {
    setSelectedRows(prev => {
        if(selected) return [...prev, id];
        return prev.filter(rowId => rowId !== id);
    });
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
      if (checked) {
          const allIds = rawItems.map((item: any) => String(item.id || item._id));
          setSelectedRows(allIds);
      } else {
          setSelectedRows([]);
      }
  }, [rawItems]);

  return {
    // State
    activeView,
    setActiveView,
    searchValue,
    setSearchValue,
    activePage,
    limit,
    setLimit,
    selectedRows,
    activeFilters,
    sortConfig,
    
    // Computed
    data: paginatedData,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    isServerPaginated,
    
    // Actions
    handleSort,
    handlePageChange,
    handleFilterChange,
    handleSelectRow,
    handleSelectAll,
    resetFilters: () => setActiveFilters({}),
  };
}