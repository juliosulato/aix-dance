"use client";

import { fetcher } from "@/utils/fetcher";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import useSWR from "swr";
import deleteUsers from "./delete";
import { ActionIcon, Avatar, LoadingOverlay, Menu, Text, Tooltip } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import 'dayjs/locale/es';
import 'dayjs/locale/en';
import NewTeacher from "./modals/NewTeacher";
import UpdateTeacher, { TeacherFromApi } from "./modals/UpdateTeacher";
import toggleUserActive from "./toggleUserActive";
import { Teacher } from "@prisma/client";

interface MenuItemProps {
    teacher: TeacherFromApi;
    onUpdateClick: (t: TeacherFromApi) => void;
    onDeleteClick: (t: TeacherFromApi) => void;
}

interface MenuItemsProps {
    selectedIds: string[];
    onBulkDeleteClick: (ids: string[]) => void;
}

export default function AllTeachersData() {
    const t = useTranslations("");
    const locale = useLocale();
    dayjs.locale(locale);

    const { data: sessionData, status } = useSession();

    const [openNew, setOpenNew] = useState<boolean>(false);
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [selectedTeacher, setSelectedTeacher] = useState<TeacherFromApi | null>(null);
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const { data: teachers, error, isLoading, mutate } = useSWR<TeacherFromApi[]>(
        () => sessionData?.user?.tenancyId
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/users?role=TEACHER`
            : null,
        fetcher
    );

    const handleUpdateClick = (teacher: TeacherFromApi) => {
        setSelectedTeacher(teacher);
        setOpenUpdate(true);
    };

    const handleDeleteClick = (teacher: TeacherFromApi) => {
        setSelectedTeacher(teacher);
        setIdsToDelete([]);
        setConfirmModalOpen(true);
    };

    const handleBulkDeleteClick = (ids: string[]) => {
        setIdsToDelete(ids);
        setSelectedTeacher(null);
        setConfirmModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        const tenancyId = sessionData?.user?.tenancyId;
        if (!tenancyId) return;

        const finalIdsToDelete = idsToDelete.length > 0 ? idsToDelete : (selectedTeacher ? [selectedTeacher.id] : []);

        if (finalIdsToDelete.length === 0) {
            setIsDeleting(false);
            setConfirmModalOpen(false);
            return;
        }

        try {
            // Supondo que a função de delete seja adaptada para desativar usuários
            // await deactivateUsers(finalIdsToDelete, tenancyId, t, mutate as any);
            mutate();
        } catch (error) {
            console.error("Falha ao desativar professores:", error);
        } finally {
            setIsDeleting(false);
            setConfirmModalOpen(false);
            setSelectedTeacher(null);
            setIdsToDelete([]);
        }
    };

    const MenuItem = ({ teacher, onUpdateClick, onDeleteClick }: MenuItemProps) => (
        <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Menu shadow="md" width={200} withinPortal>
                <Menu.Target>
                    <ActionIcon variant="light" color="gray" radius={"md"}>
                        <BiDotsVerticalRounded />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Label>{t("general.actions.title")}</Menu.Label>
                    <Menu.Item leftSection={<GrUpdate size={14} />} onClick={() => onUpdateClick(teacher)}>
                        {t("general.actions.edit")}
                    </Menu.Item>
                    <Menu.Item color="red" leftSection={<BiTrash size={14} />} onClick={() => onDeleteClick(teacher)}>
                        {t("general.actions.delete")}
                    </Menu.Item>
                    <Menu.Item color={teacher.active ? "red" : "green"} leftSection={<GrUpdate size={14} />} onClick={() => toggleUserActive(teacher, sessionData?.user.tenancyId || "", t)}>
                        {teacher.active ? (
                            t("academic.teachers.status.update.ACTIVE")
                        ) : (
                            t("academic.teachers.status.update.INACTIVE")
                        )}
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </div>
    );

    const MenuItems = ({ selectedIds, onBulkDeleteClick }: MenuItemsProps) => (
        <Menu shadow="md" width={200} withinPortal>
            <Menu.Target>
                <ActionIcon variant="light" color="gray" radius={"md"}>
                    <BiDotsVerticalRounded />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Label>{t("general.actions.manyActions")}</Menu.Label>
                <Menu.Item color="red" leftSection={<BiTrash size={14} />} onClick={() => onBulkDeleteClick(selectedIds)}>
                    {t("general.actions.deleteMany", {
                        count: selectedIds.length
                    })}
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );

    if (status === "loading" || isLoading) return <LoadingOverlay visible />;
    if (status !== "authenticated") return <div>{t("general.errors.invalidSession")}</div>;
    if (error) return <p>{t("general.errors.loadingData")}</p>;

    const d = teachers?.map((teacher) => ({
        ...teacher,
        fullName: teacher.firstName + " " + teacher.lastName
    }))

    return (
        <>
            <DataView<TeacherFromApi & { fullName: string; }>
                data={d || []}
                openNewModal={{
                    func: () => setOpenNew(true),
                    label: t("academic.teachers.modals.create.title")
                }}
                baseUrl="/system/academic/teachers/"
                mutate={mutate as any}
                pageTitle={t("academic.teachers.title")}
                searchbarPlaceholder={t("academic.teachers.searchbarPlaceholder")}
                columns={[
                    {
                        key: "image", label: "", sortable: false,
                        render: (val, item) => (
                            val ?
                                <a href={val as string} target="_blank" onClick={(ev) => ev.stopPropagation()}><img src={val as string} alt={`Foto de ${item.firstName}`} className="object-cover w-16 h-16 rounded-2xl" /></a> :
                                <Avatar name={item.firstName} color="#7439FA" size="64px" radius={"16px"} />
                        )
                    },
                    { key: "fullName", label: t("forms.general-fields.fullName.label"), sortable: true },
                    {
                        key: "email",
                        label: t("forms.general-fields.email.label"),
                        sortable: true
                    },
                    {
                        key: "teacher",
                        label: t("academic.teachers.modals.create.remuneration.fields.contractType.label"),
                        sortable: false,
                        render: (teacher) => teacher?.remunerationType ? t(`academic.teachers.modals.create.remuneration.fields.contractType.options.${teacher.remunerationType}`) : "-"
                    },
                    {
                        key: "teacher",
                        sortable: false,
                        label: t("forms.general-fields.document.label"),
                        render: (teacher) => teacher?.document || "-"
                    },
                    {
                        key: "teacher",
                        label: t("academic.teachers.modals.create.remuneration.fields.baseAmount.label"),
                        sortable: false,
                        render: (teacher: Teacher) => new Intl.NumberFormat(locale, { style: "currency", currency: "BRL" }).format(Number(teacher.baseAmount)) || "-"
                    },
                    {
                        key: "teacher",
                        label: t("forms.general-fields.cellPhoneNumber.label"),
                        sortable: false,
                        render: (teacher) => teacher?.cellPhoneNumber ? <a href={`https://wa.me/${String(teacher.cellPhoneNumber).replace(/\D/g, "")}`}>{String(teacher.cellPhoneNumber)}</a> : "-"
                    },
                    {
                        key: "active",
                        label: t("academic.students.status.label"),
                        render: (active) => {
                            if (active) {
                                return (
                                    <Tooltip label={t("academic.students.status.ACTIVE")} color="green">
                                        <div className={`w-4 h-4 rounded-full bg-green-500`}></div>
                                    </Tooltip>
                                );
                            } else {
                                return (
                                    <Tooltip label={t("academic.students.status.INACTIVE")} color="red">
                                        <div className={`w-4 h-4 rounded-full bg-red-500`}></div>
                                    </Tooltip>
                                )
                            }
                        }
                    }
                ]}

                RenderRowMenu={(item) => <MenuItem teacher={item} onUpdateClick={handleUpdateClick} onDeleteClick={handleDeleteClick} />}
                RenderAllRowsMenu={(selectedIds) => <MenuItems selectedIds={selectedIds} onBulkDeleteClick={handleBulkDeleteClick} />}
                renderCard={(item) => (
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-row justify-between items-start">
                            <div className="flex items-center gap-4">
                                {item.image ? <img
                                    src={item.image}
                                    alt={`Foto de ${item.firstName}`}
                                    className="object-cover w-16 h-16 rounded-2xl"
                                /> : (
                                    <Avatar name={item.firstName} color="#7439FA" size="64px" radius={"16px"} />
                                )}
                                <div>
                                    <Text fw={700} size="lg" className="leading-tight">
                                        {`${item.firstName} ${item.lastName}`}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        {t("academic.teachers.view.registeredAt", { date: dayjs(item.createdAt).format("DD/MM/YYYY") })}
                                    </Text>
                                </div>
                            </div>
                            <MenuItem teacher={item} onUpdateClick={handleUpdateClick} onDeleteClick={handleDeleteClick} />
                        </div>
                        <div className="mt-2 border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Text size="sm" fw={500} className="w-28">{t("academic.teachers.modals.create.remuneration.fields.contractType.label")}:</Text>
                                <Text size="sm" c="dimmed">
                                    {item.teacher?.remunerationType ? t(`academic.teachers.modals.create.remuneration.fields.contractType.options.${item.teacher.remunerationType}`) : "-"}
                                </Text>
                            </div>
                            {item.teacher?.cellPhoneNumber && (
                                <div className="flex items-center gap-2 mt-2">
                                    <Text size="sm" fw={500} className="w-28">WhatsApp:</Text>
                                    <a
                                        href={`https://wa.me/${String(item.teacher?.cellPhoneNumber).replace(/\D/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-blue-500 hover:underline text-sm"
                                    >
                                        {item.teacher?.cellPhoneNumber}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            />

            <NewTeacher opened={openNew} onClose={() => setOpenNew(false)} mutate={mutate as any} />

            {selectedTeacher && (
                <UpdateTeacher
                    opened={openUpdate}
                    onClose={() => {
                        setOpenUpdate(false);
                        setSelectedTeacher(null);
                    }}
                    user={selectedTeacher}
                    mutate={mutate as any}
                />
            )}

            <ConfirmationModal
                opened={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title={t("academic.teachers.modals.confirmModal.title")}
                confirmLabel={t("general.actions.delete")}
                cancelLabel={t("general.actions.cancel")}
                loading={isDeleting}
            >
                {idsToDelete.length > 0 ? (
                    t("academic.teachers.modals.confirmModal.textArray", { count: idsToDelete.length })
                ) : (
                    t("academic.teachers.modals.confirmModal.text", {
                        teacher: selectedTeacher?.firstName + " " + selectedTeacher?.lastName || ""
                    })
                )}
                <br />
                <Text component="span" c="red" size="sm" fw={500} mt="md">{t("academic.teachers.modals.confirmModal.warn")}</Text>
            </ConfirmationModal>
        </>
    );
}

