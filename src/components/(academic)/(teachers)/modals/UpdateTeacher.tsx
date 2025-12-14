"use client"

import { Button, LoadingOverlay, Modal, Stepper } from "@mantine/core";
import Teacher__PersonalData from "./personalData";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import 'dayjs/locale/es';
import 'dayjs/locale/en';
import Teacher__RemunerationData from "./remuneration";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { updateUserSchema, UpdateUserInput } from "@/schemas/user.schema"; 
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import Address from "./address";
import AvatarUpload from "../../../avatarUpload";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyedMutator } from "swr";
import { Address as AddressType, CommissionTier, Teacher, User } from "@prisma/client";
import Teacher__AccessDataUpdate from "./accessDataUpdate";

export interface TeacherFromApi extends User {
    teacher: (Teacher & {
        comissionTiers: CommissionTier[];
        address: AddressType | null;
        document: string | null;
        cellPhoneNumber: string;
    }) | null; 
}

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: KeyedMutator<TeacherFromApi[]>;
    user: TeacherFromApi | null;
}

const prepareTeacherForForm = (teacher: TeacherFromApi): UpdateUserInput => {
  const newTeacher = JSON.parse(JSON.stringify(teacher));
  const traverse = (obj: any) => {
    for (const key in obj) {
      if (obj[key] === null) {
        obj[key] = undefined;
      } else if (typeof obj[key] === 'object') {
        traverse(obj[key]);
      }
    }
  };
  traverse(newTeacher);
  return newTeacher;
};



function UpdateTeacher({ opened, onClose, user, mutate }: Props) {
    const [active, setActive] = useState(0);
    const [visible, setVisible] = useState(true);
    const [avatar, setAvatar] = useState<string | null>(null);

    // Usamos o schema estático para atualização

    const { control, handleSubmit, formState: { errors }, register, reset, trigger } = useForm<UpdateUserInput>({
        resolver: zodResolver(updateUserSchema) as any,
        mode: 'all',
    });

    useEffect(() => {
        if (user) {
            const preparedData = prepareTeacherForForm(user);
            reset({ ...preparedData, teacher: { ...preparedData.teacher, dateOfBirth: dayjs(preparedData.teacher?.dateOfBirth).format("YYYY-MM-DD") }, password: undefined, confirmPassword: undefined });
            setVisible(false);
        }
    }, [user, reset])

    
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    const handleNextStep = async () => {
        let isValid = false;
        if (active === 0) {
            const firstStepFields: any[] = [ "firstName", "lastName", "email", "teacher.document", "teacher.gender" ];
            isValid = await trigger(firstStepFields);
        } else {
            isValid = true;
        }

        if (isValid) {
            setActive((current) => (current < 2 ? current + 1 : current));
        }
    };

    const { data: sessionData, status } = useSession();
    if (status === "loading" && !user) return <LoadingOverlay visible />;
    if (status !== "authenticated") return <div>Você precisa estar logado para editar professores.</div>;

    async function updateTeacher(data: UpdateUserInput) {
        if (!sessionData?.user.tenancyId || !user?.id) {
            notifications.show({ color: "red", message: "Sessão ou dados do professor inválidos." });
            return;
        }

        setVisible(true);
        try {
            const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/users/${user.id}`, {
                method: "PUT",
                body: JSON.stringify({...data, image: avatar || user.image}),
                headers: { "Content-Type": "application/json" },
            });

            if (!resp.ok) {
                const errorData = await resp.json();
                console.error("Erro do backend:", errorData);
                throw new Error("Erro ao atualizar professor");
            }

            notifications.show({ message: "Professor atualizado com sucesso!", color: "green" });
            mutate(); // Revalida os dados da lista
            onClose();
        } catch (err) {
            console.error(err);
            notifications.show({ color: "red", message: "Erro inesperado ao atualizar professor" });
        } finally {
            setVisible(false);
        }
    }

    return (
        <>
            <Modal opened={opened} onClose={onClose} title={"Atualizar Professor"} size="auto" radius="lg" centered classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300" }}>
                <form onSubmit={handleSubmit(updateTeacher)} className="flex flex-col gap-4 md:gap-6 lg:gap-8 max-w-[60vw] lg:p-6">
                    <Stepper active={active} onStepClick={setActive}>
                        <Stepper.Step>
                            <div className="flex flex-col gap-4">
                                <AvatarUpload
                                    onUploadComplete={(ev) => setAvatar(ev)}
                                    defaultUrl={user?.image ?? null}
                                    folder="teachers/avatars"
                                />
                                <Teacher__PersonalData register={register as any} errors={errors} control={control as any} />
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
                                    >{"Próximo"}</Button>
                                </div>
                            </div>
                        </Stepper.Step>
                        <Stepper.Step>
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
                                >{"Voltar"}</Button>
                                <Button
                                    type="submit"
                                    color="#7439FA"
                                    radius={"lg"}
                                    size="lg"
                                    fullWidth={false}
                                    className="!text-sm !font-medium tracking-wider w-full md!w-fit ml-auto"
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
    )
}
export default UpdateTeacher;
