import { ActionIcon, Checkbox, CloseIcon, MultiSelect, NumberInput, Select, TextInput, Tooltip } from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { IoAdd } from "react-icons/io5";

export default function DayOfClassesAndHours() {
    const t = useTranslations("classes-modals.form.classDaysAndHours");
    const g = useTranslations("");

    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{t("title")}</h2>
            Dias das aulas:
            <div className="flex flex-col gap-2">
                <div className="grid grid-cols-[1fr__auto__1fr]">
                    <Checkbox label={t("days.sunday")} id="sunday" name="sunday" />
                    <div>
                        <span>{t("hours.from")}</span>
                        <TimeInput />
                        <span>{t("hours.to")}</span>
                    </div>
                    <Tooltip label={g("general.actions.remove")}>
                        <ActionIcon color="gray">
                            <CloseIcon />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label={g("general.actions.add")}>
                        <ActionIcon color="gray">
                            <IoAdd />
                        </ActionIcon>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}