import { useState, memo } from "react";
import { PhoneInput } from "@/components/ui/cellPhoneInput";
import { InputBase, Select, TextInput } from "@mantine/core";
import 'dayjs/locale/pt-br';
import DocumentInput from "@/components/ui/documentInput";
import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";
import { CreateStudentFormData } from "@/schemas/studentSchema";
import { IMaskInput } from "react-imask";
import { UpdateStudentInput } from "@/schemas/academic/student.schema";
import { FiAtSign } from "react-icons/fi";

type Props = {
    control: Control<CreateStudentFormData | UpdateStudentInput>;
    register: UseFormRegister<CreateStudentFormData | UpdateStudentInput>;
    errors: FieldErrors<CreateStudentFormData | UpdateStudentInput>;
}

function NewStudent__PersonalData({ control, register, errors }: Props) {
    const [gender, setGender] = useState<string | null>(null);

    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{"Informações Pessoais"}</h2>

            <TextInput
                label={"Primeiro Nome"}
                placeholder={"Digite o primeiro nome"}
                required

                error={errors.firstName?.message}
                {...register("firstName")}
            />
            <TextInput
                label={"Sobrenome"}
                placeholder={"Digite o sobrenome"}
                required

                error={errors.lastName?.message}
                {...register("lastName")}
            />

            <Controller
                name="cellPhoneNumber"
                control={control}
                render={({ field }) => (
                    <PhoneInput
                        label={"Celular"}
                        required
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
                        label={"Telefone"}
                        error={errors.phoneNumber?.message}
                        value={field.value}
                        onChange={field.onChange}
                        initialCountryCode="BR"
                    />
                )}
            />

            <TextInput
                label={"Email"}
                placeholder={"Digite o email"}
                required

                type="email"
                {...register("email")}
                error={errors.email?.message}
            />

            <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                    <InputBase
                        component={IMaskInput}
                        mask={"00/00/0000"}
                        required
                        value={field.value || ""}
                        label={"Data de Nascimento"}
                        error={errors.dateOfBirth?.message}
                        onAccept={(val: string) => field.onChange(val)}
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
                        required
                    />
                )}
            />
            <Controller
                name="gender"
                control={control}
                render={({ field }) => (

                    <Select
                        label={"Gênero"}
                        placeholder={"Selecione o gênero"}
                        data={[
                            { label: "Mulher", value: "FEMALE" },
                            { label: "Homem", value: "MALE" },
                            { label: "Não binário", value: "NON_BINARY" },
                            { label: "Outro", value: "OTHER" },
                        ]}
                        value={field.value ?? null}
                        onChange={(val) => {
                            field.onChange(val);
                            setGender(val as string | null);
                        }}
                        error={errors.gender?.message}
                        required

                    />
                )}
            />

            {gender && (gender === "NON_BINARY" || gender === "OTHER") && (
                <TextInput
                    label={"Pronome"}
                    placeholder={"Digite o pronome"}
                    {...register("pronoun")}
                    error={errors.pronoun?.message}
                />
            )}

            <Controller
                name="howDidYouMeetUs"
                control={control}
                render={({ field }) => (
                    <Select
                        label={"Como nos conheceu?"}
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
                label={"Instagram"}
                placeholder={"Digite o usuário do Instagram"}
                leftSection={<FiAtSign/>}
                {...register("instagramUser")}
                error={errors.instagramUser?.message}
            />
                <TextInput
                    label={"Usuário do Instagram"}
                    placeholder={"nome_de_usuario"}
                    leftSection={<FiAtSign/>}
                    {...register("instagramUser")}
                    error={errors.instagramUser?.message}
                />
        </div>
    );
}
export default memo(NewStudent__PersonalData);