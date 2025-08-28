"use client";
import { Checkbox, Textarea } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { CreateStudentFormData } from "@/schemas/studentSchema";

type Props = {
    control: Control<CreateStudentFormData>;
    errors: FieldErrors<CreateStudentFormData>;
};

export default function NewStudent__Checkboxies({ control, errors }: Props) {
    const t = useTranslations("students-modals.forms.health");
    const [showFields, setShowFields] = useState({
        healthProblems: false,
        medicalAdvice: false,
        painOrDiscomfort: false,
    });

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">

            <Checkbox
                label={t("healthProblems.label")}
                name="healthProblemsCheckbox"
                id="healthProblemsCheckbox"
                onChange={(ev) => {
                    const checked = Boolean(ev.target.checked); // mais seguro que currentTarget
                    setShowFields((prev) => ({ ...prev, healthProblems: checked }));
                }}
            />

            <Controller
                name="healthProblems"
                control={control}
                render={({ field }) => (
                    <Textarea
                        label={t("textarea")}
                        {...field}
                        defaultValue={""}
                        error={errors.healthProblems?.message}
                        className="md:col-span-2 lg:col-span-3 3xl:col-span-4"
                        style={{ display: showFields.healthProblems ? 'block' : 'none' }}
                    />
                )}
            />


            <Checkbox
                label={t("medicalAdvice.label")}
                name="medicalAdviceCheckbox"
                id="medicalAdviceCheckbox"
                onChange={(ev) => {
                    const checked = Boolean(ev.target.checked); // mais seguro que currentTarget
                    setShowFields((prev) => ({ ...prev, medicalAdvice: checked }));
                }}
            />


            <Controller
                name="medicalAdvice"
                control={control}
                render={({ field }) => (
                    <Textarea
                        label={t("textarea")}
                        {...field}
                        defaultValue={""}
                        error={errors.medicalAdvice?.message}
                        className="md:col-span-2 lg:col-span-3 3xl:col-span-4"
                        style={{ display: showFields.medicalAdvice ? 'block' : 'none' }}
                    />
                )}
            />
            <Checkbox
                label={t("painOrDiscomfort.label")}
                name="painOrDiscomfortCheckbox"
                id="painOrDiscomfortCheckbox"
                onChange={(ev) => {
                    const checked = Boolean(ev.target.checked); // mais seguro que currentTarget
                    setShowFields((prev) => ({ ...prev, painOrDiscomfort: checked }));
                }}
            />

            <Controller
                name="painOrDiscomfort"
                control={control}
                render={({ field }) => (
                    <Textarea
                        label={t("textarea")}
                        {...field}
                        error={errors.painOrDiscomfort?.message}
                        className="md:col-span-2 lg:col-span-3 3xl:col-span-4"
                        style={{ display: showFields.painOrDiscomfort ? 'block' : 'none' }}
                    />
                )}
            />

            <Controller
                name="canLeaveAlone"
                control={control}
                render={({ field }) => (
                    <Checkbox
                        label={t("canLeaveAlone.label")}
                        checked={field.value || false}
                        onChange={(ev) => field.onChange(ev?.currentTarget?.checked ?? false)}
                    />
                )}
            />

            <Controller
                name="guardian"
                control={control}
                render={({ field }) => (
                    <Checkbox
                        label={t("haveGuardian.label")}
                        checked={Array.isArray(field.value) && field.value.length > 0}
                        onChange={(ev) => {
                            if (ev?.currentTarget?.checked ?? false) {
                                field.onChange([{ firstName: "", lastName: "", relationship: "", cellPhoneNumber: "", phoneNumber: "", email: "", documentOfIdentity: "" }]);
                            } else {
                                field.onChange([]);
                            }
                        }}
                    />
                )}
            />

        </div>
    );
}
