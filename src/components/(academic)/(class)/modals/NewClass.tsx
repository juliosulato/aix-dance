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
import { CreateClassInput, getCreateClassSchema } from "@/schemas/academic/class.schema";
import { DayOfWeek } from "@prisma/client";
import { KeyedMutator } from "swr";

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: KeyedMutator<any>;
}

function NewClass({ opened, onClose, mutate }: Props) {
    const t = useTranslations("");
    const [active, setActive] = useState(0);
    const [visible, setVisible] = useState(false);

    const createClassSchema = getCreateClassSchema(t);

    const { control, handleSubmit, formState: { errors }, watch, reset, setValue, trigger } = useForm<CreateClassInput>({
        resolver: zodResolver(createClassSchema),
        defaultValues: {
            online: false,
            students: [],
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
        mode: 'onTouched' // 'onTouched' é geralmente melhor para performance que 'onChange'
    });

    const handleNextStep = async () => {
        let fieldsToValidate: (keyof CreateClassInput)[] = [];
        if (active === 0) {
            // Campos da primeira etapa
            fieldsToValidate = ['name', 'modalityId', 'teacherId', 'schedules'];
        } else if (active === 1) {
            // Campos da segunda etapa
            fieldsToValidate = ['students'];
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setActive((current) => (current < 3 ? current + 1 : current));
        }
    };
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    const { data: sessionData, status } = useSession();
    if (status === "loading") return <LoadingOverlay visible />;
    if (status !== "authenticated") return <div>Você precisa estar logado.</div>;

    async function createClass(data: CreateClassInput) {
        if (!sessionData?.user.tenancyId) {
            notifications.show({ color: "red", message: "Sessão inválida" });
            return;
        }

        setVisible(true);

        // Transforma 'schedules' em 'days' para o backend
        const daysPayload = Object.entries(data.schedules)
            .filter(([, day]) => day.enabled && day.ranges.some(r => r.from && r.to))
            .flatMap(([dayKey, day]) => 
                day.ranges
                .filter(range => range.from && range.to) // Garante que apenas ranges completos sejam enviados
                .map(range => ({
                    dayOfWeek: dayKey.toUpperCase() as DayOfWeek,
                    initialHour: range.from,
                    endHour: range.to,
                }))
            );
        
        const finalData = { ...data, days: daysPayload };

        try {
            const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/classes`, {
                method: "POST",
                body: JSON.stringify(finalData),
                headers: { "Content-Type": "application/json" },
            });

            if (!resp.ok) throw new Error("Erro ao criar turma");
            notifications.show({ message: t("academic.classes.modals.create.notifications.success"), color: "green" });
            reset();
            setActive(0);
            mutate();
            onClose();
        } catch (err) {
            notifications.show({ color: "red", message: t("academic.classes.modals.create.notifications.error") });
        } finally {
            setVisible(false);
        }
    }

    return (
        <>
            <Modal opened={opened} onClose={onClose} title={t("academic.classes.modals.create.title")} size="auto" radius="lg" centered classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300" }}>
                <form onSubmit={handleSubmit(createClass)} className="flex flex-col gap-4 md:gap-6 lg:gap-8 w-full lg:w-[60vw] lg:p-6" >
                    <Stepper active={active} onStepClick={setActive}>
                        <Stepper.Step label={t("academic.classes.modals.formSteps.one.step")} >
                            <div className="flex flex-col gap-4">
                                <AboutOfClass control={control as any} errors={errors} tenancyId={sessionData.user.tenancyId} />
                                <DayOfClassesAndHours 
                                    watch={watch} 
                                    setValue={setValue as any} 
                                    errors={errors} 
                                />
                                <div className="flex justify-end">
                                    <Button type="button" color="#7439FA" radius={"lg"} size="md" onClick={handleNextStep}>{t("forms.next")}</Button>
                                </div>
                            </div>
                        </Stepper.Step>
                        <Stepper.Step label={t("academic.classes.modals.formSteps.two.step")} >
                            <div className="flex flex-col gap-4">
                                <NewClass__Students control={control as any} errors={errors} tenancyId={sessionData.user.tenancyId} />
                                <div className="flex justify-between">
                                    <Button type="button" color="#7439FA" radius={"lg"} size="lg" onClick={prevStep}>{t("forms.prev")}</Button>
                                    <Button type="button" color="#7439FA" radius={"lg"} size="lg" onClick={handleNextStep}>{t("forms.next")}</Button>
                                </div>
                            </div>
                        </Stepper.Step>
                        <Stepper.Step label={t("academic.classes.modals.formSteps.three.step")}>
                            <div className="flex flex-col gap-4">
                                <NewClass__Resume control={control as any} tenancyId={sessionData.user.tenancyId} />
                                <div className="flex justify-between">
                                    <Button type="button" color="#7439FA" radius={"lg"} size="lg" onClick={prevStep}>{t("forms.prev")}</Button>
                                    <Button type="submit" color="#7439FA" radius={"lg"} size="lg">{t("forms.submit")}</Button>
                                </div>
                            </div>
                        </Stepper.Step>
                    </Stepper>
                </form>
            </Modal>
            <LoadingOverlay visible={visible} zIndex={9999} overlayProps={{ radius: 'sm', blur: 2 }} loaderProps={{ color: 'violet', type: 'dots' }} pos="fixed" h="100vh" w="100vw"/>
        </>
    )
}

export default NewClass;
