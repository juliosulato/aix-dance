import { Gender } from "@prisma/client";
import { useState } from "react";
import { PhoneInput } from "@/components/ui/cellPhoneInput";
import { Select, TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import { DateInput } from "@mantine/dates";
import 'dayjs/locale/pt-br';
import DocumentInput from "@/components/ui/documentInput";
import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";
import { CreateStudentFormData } from "@/schemas/studentSchema";

type Props = {
    control: Control<CreateStudentFormData>;
    register: UseFormRegister<CreateStudentFormData>;
    errors: FieldErrors<CreateStudentFormData>;
}

export default function NewStudent__PersonalData({ control, register, errors }: Props) {
    const [gender, setGender] = useState<Gender | null>(null);
    const t = useTranslations("students-modals.forms.personalData");
    const g = useTranslations("forms.general-fields");

    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{t("title")}</h2>

            <TextInput
                label={g("firstName.label")}
                placeholder={g("firstName.placeholder")}
                required
                withAsterisk
                error={errors.firstName?.message}
                {...register("firstName")}
            />
            <TextInput
                label={g("lastName.label")}
                placeholder={g("lastName.placeholder")}
                required
                withAsterisk
                error={errors.lastName?.message}
                {...register("lastName")}
            />

            <Controller
                name="cellPhoneNumber"
                control={control}
                render={({ field }) => (
                    <PhoneInput
                        label={g("cellPhoneNumber.label")}
                        required
                        withAsterisk
                        error={errors.cellPhoneNumber?.message}
                        value={field.value}
                        onChange={field.onChange}
                        initialCountryCode="BR"
                    />
                )}
            />

            <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                    <PhoneInput
                        label={g("phoneNumber.label")}
                        error={errors.phoneNumber?.message}
                        value={field.value}
                        onChange={field.onChange}
                        initialCountryCode="BR"
                    />
                )}
            />

            <TextInput
                label={g("email.label")}
                placeholder={g("email.placeholder")}
                required
                withAsterisk
                type="email"
                {...register("email")}
                error={errors.email?.message}
            />

            <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                    <DateInput
                        label={g("dateOfBirth.label")}
                        placeholder={g("dateOfBirth.placeholder")}
                        withAsterisk
                        value={field.value}
                        onChange={field.onChange}
                        locale="pt-br"
                    />
                )}
            />

            <Controller
                name="documentOfIdentity"
                control={control}
                render={({ field }) => (
                    <DocumentInput
                        value={field.value}
                        onChange={field.onChange}
                    />
                )}
            />

            <Select
                label={g("gender.label")}
                placeholder={g("gender.placeholder")}
                data={[
                    { label: "Mulher", value: Gender.FEMALE },
                    { label: "Homem", value: Gender.MALE },
                    { label: "Não binário", value: Gender.NON_BINARY },
                    { label: "Outro", value: Gender.OTHER },
                ]}
                {...register("gender")}
                onChange={(val) => setGender(val as Gender)}
                error={errors.gender?.message}
            />

            {gender && (gender === Gender.NON_BINARY || gender === Gender.OTHER) && (
                <TextInput
                    label={g("pronoun.label")}
                    placeholder={g("pronoun.placeholder")}
                    {...register("pronoun")}
                    error={errors.pronoun?.message}
                />
            )}

            <Controller
                name="howDidYouMeetUs"
                control={control}
                render={({ field }) => (
                    <Select
                        label={t("howDidYouMeetUs.label")}
                        placeholder={t("howDidYouMeetUs.placeholder")}
                        data={[
                            { label: "Instagram", value: "instagram" },
                            { label: "Facebook", value: "facebook" },
                            { label: "Tiktok", value: "tiktok" },
                            { label: "Google", value: "google" },
                            { label: "Indicação", value: "indicacao" },
                            { label: "Outro", value: "outro" },
                        ]}
                        value={field.value ?? null}
                        onChange={(val) => field.onChange(val)}
                        error={errors.howDidYouMeetUs?.message}
                    />
                )}
            />


            <TextInput
                label={g("instagramUser.label")}
                placeholder={g("instagramUser.placeholder")}
                {...register("instagramUser")}
                error={errors.instagramUser?.message}
            />
        </div>
    );
}
