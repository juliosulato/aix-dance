import InfoTerm from "@/components/ui/Infoterm";
import { useTranslations } from "next-intl";

export default function NewClass__Resume() {
    const t = useTranslations("classes-modals.formSteps");
    const g = useTranslations("");

    return (
        <div className="mt-4 flex flex-col gap-4 w-full ">
            <h2 className="text-lg font-bold">{t("three.title")}</h2>
            <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 lg:gap-6">
                <h3 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4 text-primary">{t("one.title")}</h3>
                <InfoTerm
                    label={t("one.fields.modality.label")}
                />
                <InfoTerm
                    label={t("one.fields.class.label")}
                />
                <InfoTerm
                    label={t("one.fields.teachers.label")}
                />
                <InfoTerm
                    label={t("one.fields.quantityMaxOfStudents.label")}
                />
                <InfoTerm
                    label={t("one.fields.onlineClass.label")}
                />

                <h3 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4 text-primary">{t("one.classDaysAndHours.title")}</h3>

            </div>

            <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 lg:gap-6">
                <h3 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4 text-primary">{t("three.stepTwoTitle")}</h3>
                <InfoTerm
                    label={t("two.fields.students.label")}
                />
                <InfoTerm
                    label={t("one.fields.class.label")}
                />
                <InfoTerm
                    label={t("one.fields.teachers.label")}
                />
                <InfoTerm
                    label={t("one.fields.quantityMaxOfStudents.label")}
                />
                <InfoTerm
                    label={t("one.fields.onlineClass.label")}
                />
            </div>

        </div>
    )
}