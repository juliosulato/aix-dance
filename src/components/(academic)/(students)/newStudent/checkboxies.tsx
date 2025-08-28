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
                onChange={(ev) => {
                    setShowFields((prev) => ({ ...prev, healthProblems: ev.currentTarget.checked }));
                }}
            />
            {showFields.healthProblems && (
                <Controller
                    name="healthProblems"
                    control={control}
                    render={({ field }) => (
                        <Textarea
                            label={t("textarea")}
                            {...field}
                            error={errors.healthProblems?.message}
                            className="md:col-span-2 lg:col-span-3 3xl:col-span-4"
                        />
                    )}
                />
            )}

            <Checkbox
                label={t("medicalAdvice.label")}
                onChange={(ev) => {
                    setShowFields((prev) => ({ ...prev, medicalAdvice: ev.currentTarget.checked }));
                }}
            />
            {showFields.medicalAdvice && (
                <Controller
                    name="medicalAdvice"
                    control={control}
                    render={({ field }) => (
                        <Textarea
                            label={t("textarea")}
                            {...field}
                            error={errors.medicalAdvice?.message}
                            className="md:col-span-2 lg:col-span-3 3xl:col-span-4"
                        />
                    )}
                />
            )}

            <Checkbox
                label={t("painOrDiscomfort.label")}
                onChange={(ev) => {
                    setShowFields((prev) => ({ ...prev, painOrDiscomfort: ev.currentTarget.checked }));
                }}
            />

            {showFields.painOrDiscomfort && (
                <Controller
                    name="painOrDiscomfort"
                    control={control}
                    render={({ field }) => (
                        <Textarea
                            label={t("textarea")}
                            {...field}
                            error={errors.painOrDiscomfort?.message}
                            className="md:col-span-2 lg:col-span-3 3xl:col-span-4"
                        />
                    )}
                />
            )}

            <Controller
                name="canLeaveAlone"
                control={control}
                render={({ field }) => (
                    <Checkbox
                        label={t("canLeaveAlone.label")}
                        checked={field.value || false}
                        onChange={(ev) => field.onChange(ev.currentTarget.checked)}
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
                            if (ev.currentTarget.checked) {
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
