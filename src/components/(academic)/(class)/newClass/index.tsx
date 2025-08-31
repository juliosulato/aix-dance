"use client"

import { Button, LoadingOverlay, Modal, Stepper } from "@mantine/core";
import { useTranslations } from "next-intl";
import 'dayjs/locale/pt-br';
import { useState } from "react";
import AboutOfClass from "./aboutOfClass";
import DayOfClassesAndHours from "./dayOfClassAndHours";
import NewClass__Students from "./students";
import NewClass__Resume from "./resume";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import { CreateClassInput, createClassSchema } from "@/schemas/class.schema";

type Props = {
    opened: boolean;
    onClose: () => void;
}

function NewClass({ opened, onClose }: Props) {
    const t = useTranslations("");
    const [active, setActive] = useState(0);
    const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));
    const [visible, setVisible] = useState(false);

    const { control, handleSubmit, formState: { errors }, register, watch, reset, setValue } = useForm<CreateClassInput>({
        resolver: zodResolver(createClassSchema),
        defaultValues: {
            schedules: {
                sunday: { enabled: false, ranges: [{ from: "", to: "" }] },
                monday: { enabled: false, ranges: [{ from: "", to: "" }] },
                tuesday: { enabled: false, ranges: [{ from: "", to: "" }] },
                wednesday: { enabled: false, ranges: [{ from: "", to: "" }] },
                thursday: { enabled: false, ranges: [{ from: "", to: "" }] },
                friday: { enabled: false, ranges: [{ from: "", to: "" }] },
                saturday: { enabled: false, ranges: [{ from: "", to: "" }] },
            },
        },
    });


    const { data: sessionData, status } = useSession();
    if (status === "loading") return <LoadingOverlay visible />;
    if (status !== "authenticated") return <div>Você precisa estar logado para criar estudantes.</div>;

    async function createClass(data: CreateClassInput) {
        console.log(data);
        if (!sessionData?.user.tenancyId) {
            notifications.show({ color: "red", message: "Sessão inválida" });
            return;
        }

        setVisible(true);

        try {
            const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/classes`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
            });

            if (!resp.ok) throw new Error("Erro ao criar turma");
            notifications.show({ message: "Turma criada com sucesso!", color: "green" });
            reset();
            onClose();
        } catch (err) {
            notifications.show({ color: "red", message: "Erro inesperado ao criar turma" });
        } finally {
            setVisible(false);
        }
    }

    return (
        <>
            <Modal opened={opened} onClose={onClose} title={t("classes-modals.titles.create")} size="auto" radius="lg" centered classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300" }}>
                <form onSubmit={handleSubmit(createClass)} className="flex flex-col gap-4 md:gap-6 lg:gap-8 w-full lg:w-[60vw] lg:p-6" >
                    <Stepper active={active} onStepClick={setActive}>
                        <Stepper.Step label={t("classes-modals.formSteps.one.step")} >
                            <div className="flex flex-col gap-4">
                                <AboutOfClass control={control} errors={errors} register={register} tenancyId={sessionData.user.tenancyId} />
                                <DayOfClassesAndHours control={control} errors={errors} register={register} watch={watch} setValue={setValue} />
                                <div className="flex flex-col md:flex-row items-end justify-end">
                                    <Button
                                        type="button"
                                        color="#7439FA"
                                        radius={"lg"}
                                        size="lg"
                                        fullWidth={false}
                                        onClick={nextStep}
                                        className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
                                    >{t("forms.next")}</Button>
                                </div>
                            </div>
                        </Stepper.Step>
                        <Stepper.Step label={t("classes-modals.formSteps.two.step")} >
                            <div className="flex flex-col gap-4">
                                <NewClass__Students control={control} errors={errors} register={register} tenancyId={sessionData.user.tenancyId} />
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
                                        type="button"
                                        color="#7439FA"
                                        radius={"lg"}
                                        size="lg"
                                        fullWidth={false}
                                        onClick={nextStep}
                                        className="!text-sm !font-medium tracking-wider w-full md:!w-fit"
                                    >{t("forms.next")}</Button>
                                </div>
                            </div>
                        </Stepper.Step>
                        <Stepper.Step label={t("classes-modals.formSteps.three.step")}>
                            <div className="flex flex-col gap-4">
                                <NewClass__Resume />
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
                                        onClick={nextStep}
                                        className="!text-sm !font-medium tracking-wider w-full md:!w-fit"
                                    >{t("forms.submit")}</Button>
                                </div>
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

export default NewClass;