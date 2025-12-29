"use client";

import { Button, LoadingOverlay, Modal, Stepper } from "@mantine/core";
import Teacher__PersonalData from "./personalData";
import 'dayjs/locale/pt-br';
import 'dayjs/locale/es';
import 'dayjs/locale/en';
import Teacher__AccessData from "./accessData";
import Teacher__RemunerationData from "./remuneration";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { CreateUserInput, createUserSchema } from "@/schemas/user.schema"; // Importando a função
import { useSession } from "@/lib/auth-client";
import { notifications } from "@mantine/notifications";

import Address from "./address";
import AvatarUpload from "../../../avatarUpload";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyedMutator } from "swr";
import { Teacher } from "@/types/teacher.types";

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: KeyedMutator<Teacher[]>;
}

function NewTeacher({ opened, onClose }: Props) {
    const [active, setActive] = useState(0);
    const [visible, setVisible] = useState(false);
    const [avatar, setAvatar] = useState<string | null>(null);

    // Usamos o schema estático

    const { control, handleSubmit, formState: { errors }, register, reset, trigger , watch} = useForm<CreateUserInput>({
        resolver: zodResolver(createUserSchema) as any,
        defaultValues: {
            teacher: {
                comissionTiers: [{ minStudents: 1, maxStudents: 10, comission: 0 }],
                loseBonusWhenAbsent: true,
                paymentDay: 5,
            }
        },
        mode: 'all',
    });

    
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    const handleNextStep = async () => {
        let isValid = false;

        if (active === 0) {
            const firstStepFields = [
                "firstName",
                "lastName",
                "email",
                "teacher.cellPhoneNumber",
                "teacher.phoneNumber",
                "teacher.dateOfBirth",
                "teacher.document",
                "teacher.gender",
                "teacher.instagramUser",
                "teacher.professionalRegister",
                "teacher.address.publicPlace",
                "teacher.address.number",
                "teacher.address.complement",
                "teacher.address.neighborhood",
                "teacher.address.zipCode",
                "teacher.address.city",
                "teacher.address.state"
            ] as const;
            isValid = await trigger(firstStepFields as any);
        } else if (active === 1) {
            const secondStepFields: (keyof CreateUserInput)[] = [
                "password",
                "confirmPassword",
            ];
            isValid = await trigger(secondStepFields);
        }

        if (isValid) {
            setActive((current) => current + 1);
        }
    };

    const { data: sessionData, isPending } = useSession();
    if (isPending) return <LoadingOverlay visible />;
    if (!sessionData) return <div>Você precisa estar logado para criar professores.</div>;

    async function createTeacher(data: CreateUserInput) {
        if (!sessionData?.user.tenancyId) {
            notifications.show({ color: "red", message: "Sessão inválida" });
            return;
        }

        setVisible(true);
        try {
            const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/users`, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({...data, image: avatar, role: "TEACHER" }),
                headers: { "Content-Type": "application/json" },
            });

            if (!resp.ok) {
                const errorData = await resp.json();
                console.error("Erro do backend:", errorData);
                throw new Error("Erro ao criar professor");
            }

            notifications.show({ message: "Professor criado com sucesso!", color: "green" });
            reset();
            onClose();
        } catch (err) {
            console.error(err);
            notifications.show({ color: "red", message: "Erro inesperado ao criar professor" });
        } finally {
            setVisible(false);
        }
    }

    return (
        <>
            <Modal opened={opened} onClose={onClose} title={"Novo Professor"} size="auto" radius="lg" centered classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300" }}>
                <form onSubmit={handleSubmit(createTeacher)} className="flex flex-col gap-4 md:gap-6 lg:gap-8 max-w-[60vw] lg:p-6">
                    <Stepper active={active} onStepClick={setActive}>
                        <Stepper.Step>
                            <div className="flex flex-col gap-4">
                                <AvatarUpload onUploadComplete={(ev) => setAvatar(ev)} folder="teachers/avatars" />
                                <Teacher__PersonalData register={register as any} errors={errors} control={control as any} />
                                {/* Passando o caminho base para o componente de Endereço */}
                                <Address register={register as any} errors={errors} fieldPath="teacher.address" />
                                <div className="flex flex-col md:flex-row items-end justify-end">
                                    <Button
                                        type="button"
                                        color="#7439FA"
                                        radius={"lg"}
                                        size="lg"
                                        fullWidth={false}
                                        onClick={handleNextStep}
                                        className="text-sm! font-medium! tracking-wider w-full md:w-fit! ml-auto"
                                    >{"Próximo"}</Button>
                                </div>
                            </div>
                        </Stepper.Step>
                        <Stepper.Step>
                            <Teacher__AccessData watch={watch as any} errors={errors} control={control as any} />
                            <br />
                            <Teacher__RemunerationData errors={errors} control={control as any} />
                            <br />
                            <div className="flex flex-col md:flex-row items-center justify-between">
                                <Button
                                    type="button"
                                    color="#7439FA"
                                    radius={"lg"}
                                    size="lg"
                                    fullWidth={false}
                                    onClick={prevStep}
                                    className="text-sm! font-medium! tracking-wider w-full md:w-fit!"
                                >{"Voltar"}</Button>
                                <Button
                                    type="submit"
                                    color="#7439FA"
                                    radius={"lg"}
                                    size="lg"
                                    fullWidth={false}
                                    className="text-sm! font-medium! tracking-wider w-full md:w-fit! ml-auto"
                                >{"Salvar"}</Button>
                            </div>
                        </Stepper.Step>
                    </Stepper>
                </form>
            </Modal>
            <LoadingOverlay
                visible={visible}
                zIndex={9999}
                overlayProps={{ radius: 'sm', blur: 2 }}
                loaderProps={{ color: 'violet', type: 'dots' }}
                pos="fixed"
                h="100vh"
                w="100vw"
            />
        </>
    );
}
export default NewTeacher;
