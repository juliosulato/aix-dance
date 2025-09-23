import { ActionIcon, Button, Select, TextInput, Tooltip, Text, Popover } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import React, { useState } from "react";
import { IoAdd, IoReloadOutline } from "react-icons/io5";
import { LuSearch } from "react-icons/lu";
import { MdClose, MdOutlineTableChart, MdSpaceDashboard } from "react-icons/md";
import { Filter, DateFilter, DateFilterOption } from ".";
import { KeyedMutator } from "swr";
import { FaFilter, FaPrint } from "react-icons/fa"; // Adicionado FaPrint
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import "dayjs/locale/es";
import "dayjs/locale/en";

interface DataViewProps<T> {
    pageTitle: string;
    searchbarPlaceholder: string;
    activeView: "table" | "grade";
    setActiveView: React.Dispatch<React.SetStateAction<"table" | "grade">>
    openNewModal?: {
        label: string;
        func: () => void;
    };
    setSearchValue: React.Dispatch<React.SetStateAction<string>>;
    filters?: Filter<T>[];
    activeFilters?: { [key: string]: string | null };
    onFilterChange?: (filterKey: string, value: string | null) => void;
    dateFilterOptions?: DateFilterOption<T>[];
    dateFilter: DateFilter<T> | null;
    onDateFilterChange: React.Dispatch<React.SetStateAction<DateFilter<T> | null>>;
    mutate?: KeyedMutator<T[]>;
    disableTable?: boolean;
    renderHead?: () => React.ReactNode;
    printable?: boolean; // ✨ NOVA PROPRIEDADE
    onPrint?: () => void; // ✨ NOVA PROPRIEDADE
};

export default function DataViewHead<T>({
    pageTitle,
    searchbarPlaceholder,
    activeView,
    setActiveView,
    openNewModal,
    setSearchValue,
    activeFilters,
    filters,
    onFilterChange,
    dateFilterOptions,
    dateFilter,
    onDateFilterChange,
    mutate,
    disableTable,
    renderHead,
    printable, // ✨
    onPrint,   // ✨
}: DataViewProps<T>) {
    const [isDatePopoverOpened, setDatePopoverOpened] = useState(false);
    const [localDateFilter, setLocalDateFilter] = useState(dateFilter);

    const handleApplyDateFilter = () => {
        onDateFilterChange(localDateFilter);
        setDatePopoverOpened(false);
    };
    const handleClearDateFilter = () => {
        setLocalDateFilter(null);
        onDateFilterChange(null);
        setDatePopoverOpened(false);
    };
    React.useEffect(() => {
        setLocalDateFilter(dateFilter);
    }, [dateFilter]);

    const isDateFilterActive = dateFilter && (dateFilter.from || dateFilter.to);

    return (
        <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <h1 className="text-2xl font-bold">{pageTitle}</h1>
                <div className="flex flex-col gap-4 md:flex-row md:flex-wrap lg:flex-nowrap items-center justify-center">
                    {renderHead && renderHead()}
                    
                    {/* ✨ BOTÃO DE IMPRIMIR ✨ */}
                    {printable && (
                        <Button
                            variant="default"
                            leftSection={<FaPrint size={14} />}
                            onClick={onPrint}
                            size="lg"
                            radius="lg"
                            className="!text-sm !font-medium tracking-wider w-full md:w-fit"
                        >
                            {"Aplicar Filtros"}
                        </Button>
                    )}

                    {openNewModal && openNewModal.label && openNewModal.func && (
                        <Button
                            type="submit"
                            color="#7439FA"
                            radius="lg"
                            size="lg"
                            className="!text-sm !font-medium tracking-wider ml-auto min-w-full w-full md:min-w-fit md:w-fit"
                            rightSection={<IoAdd />}
                            onClick={openNewModal.func}
                        >
                            {openNewModal.label}
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-4 md:gap-6 p-4 rounded-2xl bg-white md:flex-row justify-between">
                <div className="flex flex-nowrap gap-2 items-center">
                    <TextInput
                        leftSection={<LuSearch />}
                        placeholder={searchbarPlaceholder}
                        onChange={(ev) => setSearchValue(ev.currentTarget.value)}
                        className="w-full md:max-w-[400px] flex-grow"
                        size="md"
                        classNames={{ input: "!bg-neutral-100 placeholder:!text-neutral-400 !border-none !rounded-2xl" }}
                    />

                    {filters?.map(filter => (
                        <Select
                            key={String(filter.key)}
                            label={filter.label}
                            placeholder="Todos"
                            data={filter.options}
                            value={activeFilters?.[String(filter.key)] || null}
                            onChange={(value) => onFilterChange?.(String(filter.key), value)}
                            clearable
                            className="w-full sm:w-auto sm:min-w-[180px]"
                        />
                    ))}

                    {dateFilterOptions && dateFilterOptions.length > 0 && (
                        <Popover
                            width={300}
                            position="bottom-end"
                            withArrow
                            shadow="md"
                            opened={isDatePopoverOpened}
                            onChange={setDatePopoverOpened}
                            closeOnClickOutside={false}
                        >
                            <Popover.Target>
                                <ActionIcon
                                    variant="outline"
                                    color={isDateFilterActive ? "#7439FA" : "gray"}
                                    radius="md"
                                    size="lg"
                                    onClick={() => setDatePopoverOpened((o) => !o)}
                                >
                                    <FaFilter className="text-lg" />
                                </ActionIcon>
                            </Popover.Target>
                            <Popover.Dropdown>
                                <div className="flex flex-col gap-3">
                                    <Text size="sm" fw={500}>{"Filtro por Data"}</Text>
                                    <Select
                                        label={"Campo de data"}
                                        data={dateFilterOptions.map(opt => ({ label: opt.label, value: String(opt.key) }))}
                                        value={String(localDateFilter?.key || dateFilterOptions[0].key)}
                                        onChange={(key) => setLocalDateFilter(prev => ({ ...prev, key: key as any, from: prev?.from || null, to: prev?.to || null }))}
                                    />
                                    <DateInput
                                        label={"Data inicial"}
                                        value={localDateFilter?.from || null}
                                        onChange={(date) => setLocalDateFilter((prev: any) => ({ ...prev, key: prev?.key || dateFilterOptions?.[0]?.key!, from: date, to: prev?.to || null }))}
                                        clearable
                                    />
                                    <DateInput
                                        label={"Data final"}
                                        value={localDateFilter?.to || null}
                                        onChange={(date) => setLocalDateFilter((prev: any) => ({ ...prev, key: prev?.key || dateFilterOptions?.[0]?.key!, from: prev?.from || null, to: date }))}
                                        clearable
                                        minDate={localDateFilter?.from || undefined}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-neutral-200">
                                    <Button variant="default" onClick={handleClearDateFilter} size="xs">
                                        {"Limpar"}
                                    </Button>
                                    <Button onClick={handleApplyDateFilter} size="xs" color="#7439FA">
                                        {"Aplicar"}
                                    </Button>
                                </div>
                            </Popover.Dropdown>
                        </Popover>
                    )}

                    {mutate && (
                        <Tooltip label={"Atualizar"}>
                            <ActionIcon
                                variant="outline"
                                color={"gray"}
                                radius="md" aria-label={"Atualizar dados"}
                                autoContrast
                                size="lg"
                                onClick={() => mutate()}
                            >
                                <IoReloadOutline className="text-xl" />
                            </ActionIcon>
                        </Tooltip>
                    )}
                    {dateFilter?.from && <button onClick={() => onDateFilterChange(prev => ({ ...prev!, from: null }))} className="text-nowrap flex flex-nowrap gap-2 items-center justify-center hover:opacity-50 transition cursor-pointer text-primary bg-violet-100 !text-sm px-4 py-2 border border-primary rounded-full">{"De"} {dayjs(dateFilter.from).format("DD/MM/YYYY")} <MdClose /></button>}
                    {dateFilter?.to && <button onClick={() => onDateFilterChange(prev => ({ ...prev!, to: null }))} className="text-nowrap flex flex-nowrap gap-2 items-center justify-center hover:opacity-50 transition cursor-pointer text-primary bg-violet-100 !text-sm px-4 py-2 border border-primary rounded-full">{"Até"} {dayjs(dateFilter.to).format("DD/MM/YYYY")} <MdClose /></button>}
                </div>

                <div className="hidden md:flex flex-row flex-wrap gap-2 md:flex-nowrap justify-between items-center">
                    {!disableTable && (
                        <Tooltip color="rgba(116, 57, 250, 1)" label={"Visualizar como tabela"}>
                            <ActionIcon
                                variant="filled"
                                color={activeView === "table" ? "rgba(116, 57, 250, 1)" : "#F5F5F5"}
                                radius="md" aria-label={"Visualizar como tabela"}
                                autoContrast
                                size="xl"
                                onClick={() => setActiveView("table")}
                            >
                                <MdOutlineTableChart className="text-2xl" />
                            </ActionIcon>
                        </Tooltip>
                    )}
                    <Tooltip color="rgba(116, 57, 250, 1)" label={"Visualizar como cards"}>
                        <ActionIcon
                            variant="filled"
                            color={activeView !== "table" ? "rgba(116, 57, 250, 1)" : "#F5F5F5"}
                            radius="md"
                            size="xl"
                            aria-label={"Visualizar como cards"}
                            autoContrast
                            onClick={() => setActiveView("grade")}
                        >
                            <MdSpaceDashboard className="text-2xl" />
                        </ActionIcon>
                    </Tooltip>
                </div>
            </div>
        </div>
    )
}
