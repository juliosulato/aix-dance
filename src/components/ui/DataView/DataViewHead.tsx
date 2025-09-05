import { Translations } from "@/types/translations";
import { ActionIcon, Button, Select, TextInput, Tooltip } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import { IoAdd, IoReloadOutline } from "react-icons/io5";
import { LuSearch } from "react-icons/lu";
import { MdOutlineTableChart, MdSpaceDashboard } from "react-icons/md";
import { Filter } from ".";
import { KeyedMutator } from "swr";

interface DataViewProps<T> {
    pageTitle: string;
    searchbarPlaceholder: string;
    t: Translations;
    activeView: "table" | "grade";
    setActiveView: Dispatch<SetStateAction<"table" | "grade">>
    openNewModal: {
        label: string;
        func: () => void;
    };
    setSearchValue: Dispatch<SetStateAction<string>>;
    filters?: Filter<T>[];
    activeFilters?: { [key: string]: string | null };
    onFilterChange?: (filterKey: string, value: string | null) => void;
    mutate?: KeyedMutator<T[]>;
};

export default function DataViewHead<T>({ pageTitle, searchbarPlaceholder, t, activeView, setActiveView, openNewModal, setSearchValue, activeFilters, filters, onFilterChange, mutate }: DataViewProps<T>) {
    return (
        <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col  md:flex-row gap-4 justify-between items-center">
                <h1 className="text-2xl font-bold">{pageTitle}</h1>
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
            </div>

            <div className="flex flex-col gap-4 md:gap-6 p-4 rounded-2xl bg-white  md:flex-row justify-between">
                <div className="flex gap-2 items-center">
                    <TextInput
                        leftSection={<LuSearch />}
                        placeholder={searchbarPlaceholder}
                        onChange={(ev) => setSearchValue(ev.currentTarget.value)}
                        className="w-full md:max-w-[400px]"
                        size="md"
                        classNames={{ input: "!bg-neutral-100 placeholder:!text-neutral-400 !border-none !rounded-2xl" }}
                    />
                    {filters && filters.length > 0 && (
                        <div className="flex flex-wrap gap-4 pt-4 border-t border-neutral-100">
                            {filters.map(filter => (
                                <Select
                                    key={String(filter.key)}
                                    label={filter.label}
                                    placeholder="Todos"
                                    data={filter.options}
                                    value={activeFilters?.[String(filter.key)] || null}
                                    onChange={(value) => onFilterChange?.(String(filter.key), value)}
                                    clearable
                                    className="w-full md:w-auto md:min-w-[200px]"
                                />
                            ))}
                        </div>
                    )}
                    {mutate && (
                        <Tooltip label={t("dataView.head.refresh")}>
                            <ActionIcon
                                variant="outline"
                                color={"gray"}
                                radius="md" aria-label={t("dataView.head.refresh")}
                                autoContrast
                                size="lg"
                                onClick={() => mutate()}
                            >
                                <IoReloadOutline className="text-xl" />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </div>
                <div className="hidden md:flex flex-row flex-wrap gap-2 md:flex-nowrap justify-between items-center">
                    <Tooltip color="rgba(116, 57, 250, 1)" label={t("dataView.table.label")}>
                        <ActionIcon
                            variant="filled"
                            color={activeView == "table" ? "rgba(116, 57, 250, 1)" : "#F5F5F5"}
                            radius="md" aria-label={t("dataView.table.label")}
                            autoContrast
                            size="xl"
                            onClick={() => setActiveView("table")}
                        >
                            <MdOutlineTableChart className="text-2xl" />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip color="rgba(116, 57, 250, 1)" label={t("dataView.grade.label")}>
                        <ActionIcon
                            variant="filled"
                            color={activeView != "table" ? "rgba(116, 57, 250, 1)" : "#F5F5F5"}
                            radius="md"
                            size="xl"
                            aria-label={t("dataView.grade.label")}
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