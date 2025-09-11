"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { FaEdit } from "react-icons/fa";
import { BiArchiveIn } from "react-icons/bi";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import archiveClasses from "../archive";
import UpdateClass from "../modals/UpdateClass";
import { ClassFromApi } from "..";
import { Avatar, Divider, Text } from "@mantine/core";
import { Student, StudentClass } from "@prisma/client";
import AssignStudents from "../modals/AssignStudents";
import { PiStudent } from "react-icons/pi";

// Interface para representar a matrícula com o aluno aninhado, como vem da API
interface StudentClassWithStudent extends StudentClass {
    student: Student;
}

// Tipagem estendida para garantir que 'days' e 'studentClasses' estejam presentes
export interface ClassViewData extends Omit<ClassFromApi, 'studentClasses'> {
    days: {
        dayOfWeek: string;
        initialHour: string;
        endHour: string;
    }[];
    // Adicionamos a definição correta de 'studentClasses' para este componente
    studentClasses: StudentClassWithStudent[];
}


// Componente para exibir os horários de forma organizada
const ScheduleSummary = ({ days }: { days: ClassViewData['days'] }) => {
    // Usamos o hook aqui para manter o componente mais independente
    const t = useTranslations("academic.classes");

    if (!days || days.length === 0) {
        return <InfoTerm label={t("modals.formSteps.one.classDaysAndHours.title")} children={"Nenhum horário definido"} />;
    }

    const groupedDays = days.reduce((acc, day) => {
        const dayKey = day.dayOfWeek.toLowerCase();
        if (!acc[dayKey]) {
            acc[dayKey] = {
                day: t(`modals.formSteps.one.classDaysAndHours.days.${dayKey}` as any),
                ranges: []
            };
        }
        acc[dayKey].ranges.push(`${day.initialHour} - ${day.endHour}`);
        return acc;
    }, {} as Record<string, { day: string, ranges: string[] }>);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:col-span-full">
            {Object.values(groupedDays).map(dayInfo => (
                <InfoTerm key={dayInfo.day} label={dayInfo.day} children={dayInfo.ranges.join(', ')} />
            ))}
        </div>
    );
};


export default function ClassView({ classData, tenancyId }: { classData: ClassViewData, tenancyId: string }) {
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [isOpenAssign, setIsOpenAssign] = useState<boolean>(false);
    const [isArchiving, setIsArchiving] = useState<boolean>(false);
    
    // Hooks de tradução com escopo para código mais limpo
    const t = useTranslations("academic.classes");
    const g = useTranslations("general");
    
    const router = useRouter();

    const handleArchive = async () => {
        setIsArchiving(true);
        try {
            await archiveClasses([classData.id], tenancyId, t as any);
            router.push("/system/academic/classes");
            router.refresh();
        } catch (error) {
            console.error("Falha ao arquivar a turma:", error);
        } finally {
            setIsArchiving(false);
            setConfirmModalOpen(false);
        }
    };

    return (
        <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
                <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">{t("view.title")}</h1>
                <div className="flex gap-4 md:gap-6">
                    <button className="text-orange-500 flex items-center gap-2 cursor-pointer hover:opacity-50 transition" onClick={() => setConfirmModalOpen(true)}>
                        <BiArchiveIn />
                        <span>{g("actions.archive")}</span>
                    </button>
                    <button className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition" onClick={() => setOpenUpdate(true)}>
                        <FaEdit />
                        <span>{g("actions.update")}</span>
                    </button>
                    <button className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition" onClick={() => setIsOpenAssign(true)}>
                        <PiStudent />
                        <span>{g("actions.assign")}</span>
                    </button>
                </div>
            </div>

            {/* --- SEÇÃO DE INFORMAÇÕES BÁSICAS --- */}
            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 mb-2">{t("modals.formSteps.one.title")}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={t("modals.formSteps.one.fields.name.label")} children={classData.name} />
                <InfoTerm label={t("modals.formSteps.one.fields.modality.label")} children={classData.modality.name} />
                <InfoTerm label={t("modals.formSteps.one.fields.teacher.label")} children={`${classData.teacher.firstName} ${classData.teacher.lastName}`} />
                {classData.assistant && (
                    <InfoTerm label={t("modals.formSteps.one.fields.assistant.label")} children={`${classData.assistant.firstName} ${classData.assistant.lastName}`} />
                )}
                <InfoTerm label={t("modals.formSteps.one.fields.online.label")} children={classData.online ? g("yes") : g("boolean.no")} />
            </div>

            {/* --- SEÇÃO DE DIAS E HORÁRIOS --- */}
            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">{t("modals.formSteps.one.classDaysAndHours.title")}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ScheduleSummary days={classData.days} />
            </div>

            {/* --- SEÇÃO DE ALUNOS ATIVOS --- */}
            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">{t("modals.formSteps.two.title")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classData.studentClasses?.some((link: any) => link.status === "ACTIVE") ? (
                    classData.studentClasses.map((link: any) => (
                        link.status === "ACTIVE" && (
                            <div onClick={() => router.replace(`/system/academic/students/${link.student.id}`)} key={link.student.id} className="flex items-center gap-3 bg-neutral-50 p-2 rounded-lg cursor-pointer">
                                <Avatar src={link.student.image || undefined} name={`${link.student.firstName} ${link.student.lastName}`} radius="xl" />
                                <div>
                                    <p className="font-semibold">{`${link.student.firstName} ${link.student.lastName}`}</p>
                                    <p className="text-sm text-neutral-500">{link.student.email}</p>
                                </div>
                            </div>
                        )
                    ))
                ) : (
                    <Text className="text-neutral-500 md:col-span-full">{t("view.noStudents")}</Text>
                )}
            </div>
            
            {/* --- SEÇÃO DE ALUNOS INATIVOS (só aparece se houver algum) --- */}
            {classData.studentClasses?.some((link: any) => link.status === "INACTIVE") && (
                <>
                    <Divider label={t("view.inactiveStudentsLabel")} labelPosition="center" my="md" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {classData.studentClasses.map((link: any) => (
                            link.status === "INACTIVE" && (
                                <div onClick={() => router.replace(`/system/academic/students/${link.student.id}`)} key={link.student.id} className="flex items-center gap-3 bg-neutral-200 hover:bg-neutral-50 p-2 rounded-lg cursor-pointer">
                                    <Avatar src={link.student.image || undefined} name={`${link.student.firstName} ${link.student.lastName}`} radius="xl" />
                                    <div>
                                        <p className="font-semibold">{`${link.student.firstName} ${link.student.lastName}`}</p>
                                        <p className="text-sm text-neutral-500">{link.student.email}</p>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </>
            )}

            {/* Modais de Ação */}
            <UpdateClass classData={classData as any} onClose={() => setOpenUpdate(false)} opened={openUpdate} mutate={() => window.location.reload() as any} />
            <AssignStudents classData={classData as any} onClose={() => setIsOpenAssign(false)} opened={isOpenAssign} mutate={() => window.location.reload() as any} />
            <ConfirmationModal
                opened={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleArchive}
                title={t("modals.archiveConfirm.title")}
                confirmLabel={g("actions.archive")}
                cancelLabel={g("actions.cancel")}
                confirmColor="orange"
                loading={isArchiving}
            >
                {t("modals.archiveConfirm.text", { class: classData?.name || "" })}
                <br />
                <Text component="span" c="orange" size="sm" fw={500} mt="md">{t("modals.archiveConfirm.warn")}</Text>
            </ConfirmationModal>
        </div>
    );
}
