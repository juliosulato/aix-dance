import { Checkbox, Textarea } from "@mantine/core";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction, useState } from "react";

export default function NewStudent__Checkboxies({ setGuardian }: { setGuardian: Dispatch<SetStateAction<boolean>> }) {
    const t = useTranslations("students-modals.forms.health");
    const [health, setHealth] = useState<{
        healthProblems: boolean;
        medicalAdvice: boolean;
        painOrDiscomfort: boolean;
    }>({
        healthProblems: false,
        medicalAdvice: false,
        painOrDiscomfort: false
    })

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4'">
            <Checkbox label={t("healthProblems.label")} id="healthProblemsCheckbox" name="healthProblemsCheckbox" onChange={(ev) => setHealth((prev) => ({ ...prev, healthProblems: ev.target.checked }))} />

            {health.healthProblems && (
                <Textarea
                    className="md:col-span-2 lg:col-span-3 3xl:col-span-4"
                    label={t("textarea")}
                    id="healthProblems"
                    name="healthProblems"
                />
            )}

            <Checkbox label={t("medicalAdvice.label")} name="medicalAdviceCheckbox" id="medicalAdviceCheckbox" onChange={(ev) => setHealth((prev) => ({ ...prev, medicalAdvice: ev.target.checked }))}/>
              {health.medicalAdvice && (
                <Textarea
                    className="md:col-span-2 lg:col-span-3 3xl:col-span-4"
                    label={t("textarea")}
                    id="medicalAdvice"
                    name="medicalAdvice"
                />
            )}
            <Checkbox label={t("painOrDiscomfort.label")} id="painOrDiscomfort" name="painOrDiscomfort" onChange={(ev) => setHealth((prev) => ({ ...prev, painOrDiscomfort: ev.target.checked }))}/>
              {health.painOrDiscomfort && (
                <Textarea
                    className="md:col-span-2 lg:col-span-3 3xl:col-span-4"
                    label={t("textarea")}
                    id="painOrDiscomfort"
                    name="painOrDiscomfort"
                />
            )}
            <Checkbox label={t("canLeaveAlone.label")} id="canLeaveAlone" name="canLeaveAlone" />
            <Checkbox label={t("haveGuardian.label")} id="guardian" name="guardian" onChange={(ev) => setGuardian(ev.target.checked)} />
        </div>
    )
}