import { Gender } from "@/types/student.types";
import { useState } from "react";
import { PhoneInput } from "@/components/ui/CellPhoneInput";
import { InputBase, Select, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates"
import DocumentInput from "@/components/ui/documentInput";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';


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
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">Dados Pessoais</h2>
            
            <TextInput
                label={"Nome"}
                required
                {...register("firstName")}
                error={errors.firstName?.message}
                placeholder={"Digite o nome"}
            />
            <TextInput
                label={"Sobrenome"}
                error={errors.lastName?.message}
                {...register("lastName")}
                required
                placeholder={"Digite o sobrenome"}
            />
            
            {/* Campos de professor agora com o prefixo 'teacher.' */}
            <Controller
                name="teacher.cellPhoneNumber"
                control={control}
                render={({ field }) => (
                    <PhoneInput
                        label={"Celular"}
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
                        label={"Telefone"}
                        onChange={field.onChange}
                        value={field.value || ''}
                        error={errors.teacher?.phoneNumber?.message}
                    />
                )}
            />
            <TextInput
                label={"E-mail"}
                {...register("email")}
                required
                error={errors.email?.message}
                type="email"
                placeholder={"seu@email.com"}
            />
             <Controller
                name="teacher.dateOfBirth"
                control={control}
                render={({ field }) => (
                    <DateInput
                    {...field}
                        label={"Data de Nascimento"}
                        error={errors.teacher?.dateOfBirth?.message}
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
                        label={"Gênero"}
                        placeholder={"Selecione o gênero"}
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
                    label={"Pronome"}
                    placeholder={"Ex.: elu, ele, ela"}
                    {...register("teacher.pronoun")}
                    error={errors.teacher?.pronoun?.message}
                />
            )}

            <TextInput
                label={"Usuário do Instagram"}
                placeholder={"nome_de_usuario"}
                {...register("teacher.instagramUser")}
                error={errors?.teacher?.instagramUser?.message}
            />

            <TextInput
                label={"Registro profissional"}
                placeholder={"Registro/CREA/CRM, etc."}
                className="md:col-span-2 lg:col-span-3 3xl:col-span-4"
                {...register("teacher.professionalRegister")}
            />
        </div>
    )
}
