"use client"

import { Button, LoadingOverlay, Modal, Stepper } from "@mantine/core";
import { useLocale, useTranslations } from "next-intl";
import Teacher__PersonalData from "./personalData";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import 'dayjs/locale/es';
import 'dayjs/locale/en';
import Teacher__AccessData from "./accessData";
import Teacher__RemunerationData from "./remuneration";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { CreateUserInput, getCreateUserSchema } from "@/schemas/user.schema"; // Importando a função
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import Address from "./address";
import AvatarUpload from "../../../avatarUpload";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyedMutator } from "swr";
import { Teacher } from "@prisma/client";

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: KeyedMutator<Teacher[]>;
}

function NewTeacher({ opened, onClose }: Props) {
    const t = useTranslations();
    const [active, setActive] = useState(0);
    const [visible, setVisible] = useState(false);
    const [avatar, setAvatar] = useState<string | null>(null);

    const createUserSchema = getCreateUserSchema(t);

    const { control, handleSubmit, formState: { errors }, register, reset, trigger } = useForm<CreateUserInput>({
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

    const locale = useLocale();
    dayjs.locale(locale);
    
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    const handleNextStep = async () => {
        let isValid = false;

        if (active === 0) {
            const firstStepFields: (keyof CreateUserInput | `teacher.${string}` | `teacher.address.${string}`)[] = [
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
            ];
            // @ts-ignore
            isValid = await trigger(firstStepFields);
        } else if (active === 1) {
            const secondStepFields: (keyof CreateUserInput)[] = [
                "user",
                "password",
                "confirmPassword",
            ];
             // @ts-ignore
            isValid = await trigger(secondStepFields);
        }

        if (isValid) {
            setActive((current) => current + 1);
        }
    };

    const { data: sessionData, status } = useSession();
    if (status === "loading") return <LoadingOverlay visible />;
    if (status !== "authenticated") return <div>Você precisa estar logado para criar professores.</div>;

    async function createTeacher(data: CreateUserInput) {
        if (!sessionData?.user.tenancyId) {
            notifications.show({ color: "red", message: "Sessão inválida" });
            return;
        }

        setVisible(true);
        try {
            const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/users`, {
                method: "POST",
                body: JSON.stringify({...data, image: avatar}),
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
            <Modal opened={opened} onClose={onClose} title={t("teachers.modals.create.title")} size="auto" radius="lg" centered classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300" }}>
                <form onSubmit={handleSubmit(createTeacher)} className="flex flex-col gap-4 md:gap-6 lg:gap-8 max-w-[60vw] lg:p-6">
                    <Stepper active={active} onStepClick={setActive}>
                        <Stepper.Step>
                            <div className="flex flex-col gap-4">
                                <AvatarUpload onUploadComplete={(ev) => setAvatar(ev)} />
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
                                        className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
                                    >{t("forms.next")}</Button>
                                </div>
                            </div>
                        </Stepper.Step>
                        <Stepper.Step>
                            <Teacher__AccessData register={register as any} errors={errors} control={control as any} />
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
                                    className="!text-sm !font-medium tracking-wider w-full md:!w-fit"
                                >{t("forms.prev")}</Button>
                                <Button
                                    type="submit"
                                    color="#7439FA"
                                    radius={"lg"}
                                    size="lg"
                                    fullWidth={false}
                                    className="!text-sm !font-medium tracking-wider w-full md!w-fit ml-auto"
                                >{t("forms.submit")}</Button>
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
    )
}
export default NewTeacher;
