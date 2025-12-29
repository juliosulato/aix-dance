"use client";

import { Button, LoadingOverlay, Modal, Stepper } from "@mantine/core";
import 'dayjs/locale/pt-br';
import { useEffect, useState } from "react";
import AboutOfClass from "./aboutOfClass";
import DayOfClassesAndHours from "./dayOfClassAndHours";
import NewClass__Students from "./students";
import NewClass__Resume from "./resume";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSession } from "@/lib/auth-client";
import { notifications } from "@mantine/notifications";

import { UpdateClassInput, updateClassSchema } from "@/schemas/academic/class.schema";
import { KeyedMutator } from "swr";
import { ClassFromApi } from "..";
import { DayOfWeek } from "@/types/class.types";

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: KeyedMutator<ClassFromApi>;
    classData: (ClassFromApi & { days: any[], students: any[] }) | null;
}

// Função para transformar os 'days' da API no formato 'schedules' do formulário
const transformDaysToSchedules = (days: any[]) => {
    const schedules = {
        sunday: { enabled: false, ranges: [{ from: "", to: "" }] },
        monday: { enabled: false, ranges: [{ from: "", to: "" }] },
        tuesday: { enabled: false, ranges: [{ from: "", to: "" }] },
        wednesday: { enabled: false, ranges: [{ from: "", to: "" }] },
        thursday: { enabled: false, ranges: [{ from: "", to: "" }] },
        friday: { enabled: false, ranges: [{ from: "", to: "" }] },
        saturday: { enabled: false, ranges: [{ from: "", to: "" }] },
    };

    days.forEach(day => {
        const dayKey = day.dayOfWeek.toLowerCase() as keyof typeof schedules;
        if (schedules[dayKey]) {
            if (!schedules[dayKey].enabled) {
                schedules[dayKey].enabled = true;
                schedules[dayKey].ranges = []; // Limpa o range inicial vazio
            }
            schedules[dayKey].ranges.push({ from: day.initialHour, to: day.endHour });
        }
    });
    return schedules;
};


function UpdateClass({ opened, onClose, mutate, classData }: Props) {
    const [active, setActive] = useState(0);
    const [visible, setVisible] = useState(false);

    const classSchema = updateClassSchema;

    const { control, handleSubmit, formState: { errors }, watch, reset, trigger, setValue } = useForm<UpdateClassInput>({
        resolver: zodResolver(classSchema),
    });

    useEffect(() => {
        if (classData) {
            const transformedSchedules = transformDaysToSchedules(classData.days);
            reset({
                name: classData.name,
                modalityId: (classData as any).modalityId, // Assumindo que a API retorna modalityId
                teacherId: classData.teacherId,
                assistantId: classData.assistantId ?? undefined,
                online: classData.online,
                students: (classData?.studentClasses as  ClassFromApi["studentClasses"])?.map((s) => s.id),
                schedules: transformedSchedules,
            });
        }
    }, [classData, reset]);


    const handleNextStep = async () => {
        const isValid = await trigger();
        if (isValid) {
            setActive((current) => (current < 2 ? current + 1 : current));
        }
    };
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    const { data: sessionData, isPending } = useSession();
    if (isPending) return <LoadingOverlay visible />;

    async function updateClass(data: UpdateClassInput) {
        if (!sessionData?.user.tenancyId || !classData?.id) {
            notifications.show({ color: "red", message: "Sessão ou dados da turma inválidos." });
            return;
        }
        setVisible(true);

        const daysPayload = Object.entries(data.schedules || {})
            .filter(([, day]) => day?.enabled && day.ranges.some(r => r.from && r.to))
            .flatMap(([dayKey, day]) => 
                day.ranges.map(range => ({
                    dayOfWeek: dayKey.toUpperCase() as keyof typeof DayOfWeek,
                    initialHour: range.from,
                    endHour: range.to,
                }))
            );
        
        const finalData = { ...data, days: daysPayload };

        try {
            const resp = await fetch(`/api/v1/tenancies/${sessionData.user.tenancyId}/classes/${classData.id}`, {
                method: "PUT",
                credentials: "include",
                body: JSON.stringify(finalData),
                headers: { "Content-Type": "application/json" },
            });

            if (!resp.ok) throw new Error("Erro ao atualizar turma");
            notifications.show({ message: "Turma atualizada com sucesso", color: "green" });
            mutate();
            onClose();
        } catch (err) {
            console.error(err);
            notifications.show({ color: "red", message: "Erro ao atualizar turma" });
        } finally {
            setVisible(false);
        }
    }

    return sessionData && (
        <>
            <Modal opened={opened} onClose={onClose} title={"Atualizar Turma"} size="auto" radius="lg" centered classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300" }}>
                <form onSubmit={handleSubmit(updateClass)} className="flex flex-col gap-4 md:gap-6 lg:gap-8 w-full lg:w-[60vw] lg:p-6" >
                    <Stepper active={active} onStepClick={setActive}>
                        <Stepper.Step label={"Sobre a Turma"} >
                           <div className="flex flex-col gap-4">
                                <AboutOfClass control={control} errors={errors} tenancyId={sessionData.user.tenancyId} />
                                <DayOfClassesAndHours setValue={setValue} watch={watch}  errors={errors} />
                                <div className="flex justify-end"><Button type="button" color="#7439FA" radius={"lg"} size="lg" onClick={handleNextStep}>{"Próximo"}</Button></div>
                            </div>
                        </Stepper.Step>
                        <Stepper.Step label={"Alunos"} >
                            <div className="flex flex-col gap-4">
                                <NewClass__Students control={control} errors={errors} tenancyId={sessionData.user.tenancyId} />
                                <div className="flex justify-between">
                                    <Button type="button" color="#7439FA" radius={"lg"} size="lg" onClick={prevStep}>{"Voltar"}</Button>
                                    <Button type="button" color="#7439FA" radius={"lg"} size="lg" onClick={handleNextStep}>{"Próximo"}</Button>
                                </div>
                            </div>
                        </Stepper.Step>
                        <Stepper.Step label={"Resumo"}>
                            <div className="flex flex-col gap-4">
                                <NewClass__Resume control={control as any} tenancyId={sessionData.user.tenancyId} />
                                <div className="flex justify-between">
                                    <Button type="button" color="#7439FA" radius={"lg"} size="lg" onClick={prevStep}>{"Voltar"}</Button>
                                    <Button type="submit" color="#7439FA" radius={"lg"} size="lg">{"Salvar"}</Button>
                                </div>
                            </div>
                        </Stepper.Step>
                    </Stepper>
                </form>
            </Modal>
            <LoadingOverlay visible={visible} zIndex={9999} overlayProps={{ radius: 'sm', blur: 2 }} loaderProps={{ color: 'violet', type: 'dots' }} pos="fixed" h="100vh" w="100vw"/>
        </>
    );
}

export default UpdateClass;

