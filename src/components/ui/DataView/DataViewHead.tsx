import { TextInput, Button, Select, ActionIcon, Tooltip } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { LuSearch, LuPlus, LuPrinter } from "react-icons/lu";
import { MdOutlineTableChart, MdSpaceDashboard } from "react-icons/md";
import { IoReloadOutline } from "react-icons/io5";
import { AdvancedFilter, ActiveFilters } from "@/types/data-view.types";
import dayjs from "dayjs";

interface DataViewHeadProps<T> {
  title: string;
  placeholder: string;
  activeView: "table" | "grade";
  onToggleView: (v: "table" | "grade") => void;
  searchValue: string;
  onSearchChange: (val: string) => void;
  filters?: AdvancedFilter<T>[];
  activeFilters: ActiveFilters;
  onFilterChange: (key: string, val: any) => void;
  onRefresh?: () => void;
  onPrint?: () => void;
  actionButton?: { label: string; onClick: () => void };
  disableTable?: boolean;
}

export default function DataViewHead<T>({
  title,
  placeholder,
  activeView,
  onToggleView,
  searchValue,
  onSearchChange,
  filters = [],
  activeFilters,
  onFilterChange,
  onRefresh,
  onPrint,
  actionButton,
  disableTable
}: DataViewHeadProps<T>) {
  
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          {onPrint && (
            <Button variant="default" leftSection={<LuPrinter />} onClick={onPrint}>
              Imprimir
            </Button>
          )}
          {actionButton && (
            <Button color="violet" leftSection={<LuPlus />} onClick={actionButton.onClick} className="flex-1 md:flex-none">
              {actionButton.label}
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 justify-between items-center">
        
        <div className="flex flex-1 w-full gap-3 flex-wrap items-center">
          <TextInput
            placeholder={placeholder}
            leftSection={<LuSearch className="text-gray-400" />}
            value={searchValue}
            onChange={(e) => onSearchChange(e.currentTarget.value)}
            radius="md"
            className="w-full md:max-w-xs"
          />

          {filters.map((filter) => {
              if (filter.type === 'select') {
                  return (
                    <Select
                        key={String(filter.key)}
                        placeholder={filter.label}
                        data={filter?.options ?? []}
                        value={activeFilters[String(filter.key)] || null}
                        onChange={(val) => onFilterChange(String(filter.key), val)}
                        clearable
                        radius="md"
                        className="min-w-150px"
                    />
                  )
              }
              if (filter.type === 'date') {
                  return (
                      <DateInput
                        key={String(filter.key)}
                        placeholder={filter.label}
                        value={activeFilters[String(filter.key)] ? new Date(activeFilters[String(filter.key)]) : null}
                        onChange={(date) => onFilterChange(String(filter.key), date ? dayjs(date).toISOString() : null)}
                        valueFormat="DD/MM/YYYY"
                        clearable
                        radius="md"
                        popoverProps={{ withinPortal: true }}
                      />
                  )
              }
              return null;
          })}

          {onRefresh && (
            <Tooltip label="Atualizar dados">
                <ActionIcon variant="light" color="gray" size="lg" radius="md" onClick={onRefresh}>
                    <IoReloadOutline size={18} />
                </ActionIcon>
            </Tooltip>
          )}
        </div>

        <div className="flex gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
           {!disableTable && (
               <ActionIcon 
                variant={activeView === 'table' ? 'white' : 'transparent'} 
                c={activeView === 'table' ? 'violet' : 'dimmed'}
                className={activeView === 'table' ? 'shadow-sm' : ''}
                onClick={() => onToggleView('table')}
                size="lg"
               >
                   <MdOutlineTableChart size={20} />
               </ActionIcon>
           )}
           <ActionIcon 
                variant={activeView === 'grade' ? 'white' : 'transparent'} 
                c={activeView === 'grade' ? 'violet' : 'dimmed'}
                className={activeView === 'grade' ? 'shadow-sm' : ''}
                onClick={() => onToggleView('grade')}
                size="lg"
               >
                   <MdSpaceDashboard size={20} />
               </ActionIcon>
        </div>
      </div>
    </div>
  );
}