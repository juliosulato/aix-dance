import { Translations } from "@/types/translations";
import { ActionIcon, Button, TextInput, Tooltip } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import { LuSearch } from "react-icons/lu";
import { MdOutlineTableChart, MdSpaceDashboard } from "react-icons/md";

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
    setSearchValue: Dispatch<SetStateAction<string>>
};

export default function DataViewHead<T>({ pageTitle, searchbarPlaceholder, t, activeView, setActiveView, openNewModal, setSearchValue }: DataViewProps<T>) {
    return (
        <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex flex-wrap justify-between items-center">
                <h1 className="text-2xl font-bold">{pageTitle}</h1>
                <div>
                    <Button
                        type="submit"
                        color="#7439FA"
                        radius="lg"
                        size="lg"
                        className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
                        onClick={openNewModal.func}
                    >
                        {openNewModal.label}
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-4 md:gap-6 p-4 rounded-2xl bg-white  md:flex-row justify-between">
                <TextInput
                    leftSection={<LuSearch />}
                    placeholder={searchbarPlaceholder}
                    onChange={(ev) => setSearchValue(ev.currentTarget.value)}
                    className="md:max-w-[400px]"
                    size="md"
                    classNames={{ input: "!bg-neutral-100 placeholder:!text-neutral-400 !border-none !rounded-md" }}
                />
                <div className="hidden md:flex flex-row flex-wrap gap-2 md:flex-nowrap justify-between items-center">
                    <Tooltip color="rgba(116, 57, 250, 1)" label="Visualização em Tabela">
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
                    <Tooltip color="rgba(116, 57, 250, 1)" label="Visualização em Grade">
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