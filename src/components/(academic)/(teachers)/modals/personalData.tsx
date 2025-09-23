import { Gender } from "@prisma/client";
import { useState } from "react";
import { PhoneInput } from "@/components/ui/cellPhoneInput";
import { InputBase, Select, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates"
import DocumentInput from "@/components/ui/documentInput";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";
import { CreateUserInput, UpdateUserInput } from "@/schemas/user.schema";
import { IMaskInput } from "react-imask";

type Props = {
    control: Control<CreateUserInput | UpdateUserInput>;
    errors: FieldErrors<CreateUserInput | UpdateUserInput>;
    register: UseFormRegister<CreateUserInput | UpdateUserInput>;
};

export default function Teacher__PersonalData({ control, errors, register }: Props) {
    const [gender, setGender] = useState<Gender | null>(null);
    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{"Texto"}</h2>
            
            <TextInput
                label={g("firstName.label")}
                required
                {...register("firstName")}
                error={errors.firstName?.message}
                placeholder={g("firstName.placeholder")}
            />
            <TextInput
                label={g("lastName.label")}
                error={errors.lastName?.message}
                {...register("lastName")}
                required
                placeholder={g("lastName.placeholder")}
            />
            
            {/* Campos de professor agora com o prefixo 'teacher.' */}
            <Controller
                name="teacher.cellPhoneNumber"
                control={control}
                render={({ field }) => (
                    <PhoneInput
                        label={g("cellPhoneNumber.label")}
                        onChange={field.onChange}
                        value={field.value || ''}
                        error={errors.teacher?.cellPhoneNumber?.message}
                    />
                )}
            />
            <Controller
                name="teacher.phoneNumber"
                control={control}
                render={({ field }) => (
                    <PhoneInput
                        label={g("phoneNumber.label")}
                        onChange={field.onChange}
                        value={field.value || ''}
                        error={errors.teacher?.phoneNumber?.message}
                    />
                )}
            />
            <TextInput
                label={g("email.label")}
                {...register("email")}
                required
                error={errors.email?.message}
                type="email"
                placeholder={g("email.placeholder")}
            />
             <Controller
                name="teacher.dateOfBirth"
                control={control}
                render={({ field }) => (
                    <InputBase
                        component={IMaskInput}
                        mask={g("dateOfBirth.mask")}
                        required
                        value={field.value || ""}
                        label={g("dateOfBirth.label")}
                        placeholder={g("dateOfBirth.placeholder")}
                        error={errors.teacher?.dateOfBirth?.message}
                        onAccept={(val: string) => field.onChange(val)}
                    />
                )}
            />

            <Controller
                control={control}
                name="teacher.document"
                render={({ field }) => (
                    <DocumentInput
                        value={field.value || ''}
                        onChange={field.onChange}
                        required
                        error={errors?.teacher?.document?.message}
                    />
                )}
            />

            <Controller
                control={control}
                name="teacher.gender"
                render={({ field }) => (
                    <Select
                        value={field.value}
                        onChange={(ev) => {
                            field.onChange(ev);
                            setGender(ev as Gender);
                        }}
                        label={g("gender.label")}
                        placeholder={g("gender.placeholder")}
                        required
                        data={[
                            { label: "Mulher", value: Gender.FEMALE },
                            { label: "Homem", value: Gender.MALE },
                            { label: "Não binário", value: Gender.NON_BINARY },
                            { label: "Outro", value: Gender.OTHER },
                        ]}
                        error={errors?.teacher?.gender?.message}
                    />
                )}
            />
            {gender && (gender === Gender.NON_BINARY || gender === Gender.OTHER) && (
                <TextInput
                    label={g("pronoun.label")}
                    placeholder={g("pronoun.placeholder")}
                    {...register("teacher.pronoun")}
                    error={errors.teacher?.pronoun?.message}
                />
            )}

            <TextInput
                label={g("instagramUser.label")}
                placeholder={g("instagramUser.placeholder")}
                {...register("teacher.instagramUser")}
                error={errors?.teacher?.instagramUser?.message}
            />

            <TextInput
                label={"Texto"}
                placeholder={"Texto"}
                className="md:col-span-2 lg:col-span-3 3xl:col-span-4"
                {...register("teacher.professionalRegister")}
            />
        </div>
    )
}
