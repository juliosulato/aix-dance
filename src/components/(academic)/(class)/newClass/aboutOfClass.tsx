import { Checkbox, MultiSelect, NumberInput, Select, TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { CreateClassInput } from "@/schemas/class.schema";
import { Control, FieldErrors, UseFormRegister } from "react-hook-form";

type Props = {
    control: Control<CreateClassInput>;
    errors: FieldErrors<CreateClassInput>;
    register: UseFormRegister<CreateClassInput>;
    tenancyId: string;
};

export default function NewClass__AboutOfClass({ control, errors, register, tenancyId }: Props) {
    const t = useTranslations("classes-modals.formSteps.one");
    const g = useTranslations("");

    return (
        <>
            <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
                <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{t("title")}</h2>
                <div className="flex flex-col gap-1">
                    <Select
                        label={t("fields.modality.label")}
                        id="modality"
                        name="modality"
                        required
                        placeholder={t("fields.modality.placeholder")}
                    />
                    <p className="text-xs text-neutral-500">{t("fields.modality.description")} <Link href={"/settings/modalities?newModal=true"}>{g("appShell.navbar.settings")}</Link></p>
                </div>
                <TextInput
                    label={t("fields.class.label")}
                    id="class"
                    name="class"
                    placeholder={t("fields.class.placeholder")}
                    required

                />
                <Select
                    label={t("fields.teacher.label")}
                    id="teacher"
                    name="teacher"
                    required
                    placeholder={t("fields.teacher.placeholder")}
                />
                <Select
                    label={t("fields.assistant.label")}
                    id="assistant"
                    name="assistant"
                    placeholder={t("fields.assistant.placeholder")}
                />
                <NumberInput
                    label={t("fields.quantityMaxOfStudents.label")}
                    id="quantityMaxOfStudents"
                    name="quantityMaxOfStudents"
                />
                <Checkbox id="onlineClass" name="onlineClass" label={t("fields.onlineClass.label")} className="md:col-span-2 lg:col-span-3 3xl:col-span-4" />


            </div>
        </>

    );
}