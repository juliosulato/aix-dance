/* eslint-disable @next/next/no-img-element */
"use client";

import { fetcher } from "@/utils/fetcher";
import { useSession } from "@/lib/auth-client";
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


import NewTeacher from "./modals/NewTeacher";
import UpdateTeacher, { TeacherFromApi } from "./modals/UpdateTeacher";
import { RemunerationType } from "@/types/bill.types";
import { Teacher } from "@/types/teacher.types";

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

    const { data: sessionData, isPending } = useSession();

    const [openNew, setOpenNew] = useState<boolean>(false);
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [selectedTeacher, setSelectedTeacher] = useState<TeacherFromApi | null>(null);
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    type Item = TeacherFromApi & { fullName: string };
    type PaginationInfo = { page: number; limit: number; total: number; totalPages: number };
    type PaginatedResponseLocal<T> = { products: T[]; pagination: PaginationInfo };

    const { data: teachers, error, isLoading, mutate } = useSWR<Item[] | PaginatedResponseLocal<Item>>(
        () => sessionData?.user?.tenancyId
            ? `/api/v1/tenancies/${sessionData.user.tenancyId}/users?role=TEACHER`
            : null,
        async (url: string) => {
            const res = await fetcher<any>(url);
            const itemsRaw: TeacherFromApi[] = Array.isArray(res) ? res : res.teachers ?? res.users ?? [];
            const items: Item[] = itemsRaw.map(t => ({ ...t, fullName: t.firstName + " " + t.lastName }));
            if (Array.isArray(res)) return items;
            const pagination = res.pagination ?? { page: 1, limit: items.length || 10, total: items.length, totalPages: 1 };
            return { products: items, pagination } as PaginatedResponseLocal<Item>;
        }
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
            await deleteUsers(finalIdsToDelete, tenancyId, mutate as any);
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
                    <Menu.Label>{"Ações"}</Menu.Label>
                    <Menu.Item leftSection={<GrUpdate size={14} />} onClick={() => onUpdateClick(teacher)}>
                        {"Editar"}
                    </Menu.Item>
                    <Menu.Item color="red" leftSection={<BiTrash size={14} />} onClick={() => onDeleteClick(teacher)}>
                        {"Excluir"}
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
                <Menu.Label>{"Ações em Massa"}</Menu.Label>
                <Menu.Item color="red" leftSection={<BiTrash size={14} />} onClick={() => onBulkDeleteClick(selectedIds)}>
                    {"Excluir selecionados"}
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );

    if (status === "loading" || isLoading) return <LoadingOverlay visible />;
    
    if (error) return <p>{"Erro inesperado"}</p>;

    // `teachers` is already normalized by the fetcher to either Item[] or PaginatedResponseLocal<Item>
    const dataForDataView = teachers ?? [];

    return (
        <>
            <DataView<TeacherFromApi & { fullName: string; }>
                data={dataForDataView}
                openNewModal={{
                    func: () => setOpenNew(true),
                    label: "Novo Professor"
                }}
                baseUrl="/system/academic/teachers/"
                mutate={mutate}
                pageTitle={"Professores"}
                searchbarPlaceholder={"Pesquisar professores..."}
                columns={[
                    {
                        key: "image", label: "", sortable: false,
                        render: (val, item) => (
                            val ?
                                <a href={val as string} target="_blank" onClick={(ev) => ev.stopPropagation()}><img src={val as string} alt={`Foto de ${item.firstName}`} className="object-cover w-16 h-16 rounded-2xl" /></a> :
                                <Avatar name={item.firstName} color="#7439FA" size="64px" radius={"16px"} />
                        )
                    },
                    { key: "fullName", label: "Nome Completo", sortable: true },
                    {
                        key: "email",
                        label: "E-mail",
                        sortable: true
                    },
                    {
                        key: "teacher",
                        label: "Tipo Remuneração",
                        sortable: false,
                        render: (teacher: any) => (teacher?.remunerationType as RemunerationType) === "HOURLY" ? "Hora-Aula" : "Salário Fixo"
                    },
                    {
                        key: "teacher",
                        sortable: false,
                        label: "CPF",
                        render: (teacher) => teacher?.document || "-"
                    },
                    {
                        key: "teacher",
                        label: "Valor Base",
                        sortable: false,
                        render: (teacher: Teacher) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(teacher.baseAmount)) || "-"
                    },
                    {
                        key: "teacher",
                        label: "Celular",
                        sortable: false,
                        render: (teacher) => teacher?.cellPhoneNumber ? <a href={`https://wa.me/${String(teacher.cellPhoneNumber).replace(/\D/g, "")}`}>{String(teacher.cellPhoneNumber)}</a> : "-"
                    },
                    {
                        key: "active",
                        label: "Ativo",
                        render: (active) => {
                            if (active) {
                                return (
                                    <Tooltip label={"Ativo"} color="green">
                                        <div className={`w-4 h-4 rounded-full bg-green-500`}></div>
                                    </Tooltip>
                                );
                            } else {
                                return (
                                    <Tooltip label={"Inativo"} color="red">
                                        <div className={`w-4 h-4 rounded-full bg-red-500`}></div>
                                    </Tooltip>
                                );
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
                                        {`Registrado em ${dayjs(item.createdAt).format("DD/MM/YYYY")}`}
                                    </Text>
                                </div>
                            </div>
                            <MenuItem teacher={item} onUpdateClick={handleUpdateClick} onDeleteClick={handleDeleteClick} />
                        </div>
                        <div className="mt-2 border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Text size="sm" fw={500} className="w-28">{"Tipo"}:</Text>
                                <Text size="sm" c="dimmed">
                                    {item.teacher?.remunerationType || "-"}
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
                title={"Excluir Professor"}
                confirmLabel={"Excluir"}
                cancelLabel={"Cancelar"}
                loading={isDeleting}
            >
                {idsToDelete.length > 0 ? (
                    "Tem certeza que deseja excluir os professores selecionados?"
                ) : (
                    `Tem certeza que deseja excluir o professor ${selectedTeacher?.firstName + " " + selectedTeacher?.lastName || ""}?`
                )}
                <br />
                <Text component="span" c="red" size="sm" fw={500} mt="md">{"Atenção: esta ação é irreversível."}</Text>
            </ConfirmationModal>
        </>
    );
}

