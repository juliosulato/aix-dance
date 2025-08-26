import { Checkbox, MultiSelect, NumberInput, Select, TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function AboutOfClass() {
    const t = useTranslations("classes-modals.form");
    const g = useTranslations("");

    return (
        <>
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{t("title")}</h2>
            <Select
                label={t("fields.modality.label")}
                description={<>{t("fields.modality.description")} <Link href={"/settings/modalities?newModal=true"}>{g("appShell.navbar.settings")}</Link></>}
                id="modality"
                name="modality"
                required
                withAsterisk
                placeholder={t("fields.modality.placeholder")}
            />
            <TextInput
                label={t("fields.class.label")}
                id="class"
                name="class"
                placeholder={t("fields.class.placeholder")}
                required
                withAsterisk
            />
            <MultiSelect
                label={t("fields.teachers.label")}
                id="teachers"
                name="teachers"
                required
                withAsterisk
                description={t("fields.teachers.description")}
                placeholder={t("fields.teachers.placeholder")}
            />
            <NumberInput
                label={t("fields.quantityMaxOfStudents.label")}
                id="quantityMaxOfStudents"
                name="quantityMaxOfStudents"
                required
                withAsterisk
                placeholder={t("fields.quantityMaxOfStudents.placeholder")}
            />
            <Checkbox id="onlineClass" name="onlineClass" label={t("fields.onlineClass.label")} />

           
        </div>
        </>

    );
}