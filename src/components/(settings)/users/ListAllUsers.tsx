"use client";

import { fetcher } from "@/utils/fetcher";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import useSWR from "swr";
import { ActionIcon, Avatar, LoadingOverlay, Menu, Text, Tooltip } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import 'dayjs/locale/es';
import 'dayjs/locale/en';
import NewTeacher from "./NewUser";
import { UserFromApi } from "./UserFromApi";
import UpdateUser from "./UpdateUser";
import deleteUsers from "./delete";
import { notifications } from "@mantine/notifications";

interface MenuItemProps {
    user: UserFromApi;
    onUpdateClick: (t: UserFromApi) => void;
    onDeleteClick: (t: UserFromApi) => void;
}

interface MenuItemsProps {
    selectedIds: string[];
    onBulkDeleteClick: (ids: string[]) => void;
}

export default function AllUsersData() {
    const t = useTranslations("");
    const locale = useLocale();
    dayjs.locale(locale);

    const { data: sessionData, status } = useSession();

    const [openNew, setOpenNew] = useState<boolean>(false);
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<UserFromApi | null>(null);
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const { data: users, error, isLoading, mutate } = useSWR<UserFromApi[]>(
        () => sessionData?.user?.tenancyId
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/users`
            : null,
        fetcher
    );
    const d = users?.filter((user) => !user.teacher)?.map((user) => ({
        ...user,
        fullName: user.firstName + " " + user.lastName
    }))

    const handleUpdateClick = (user: UserFromApi) => {
        setSelectedUser(user);
        setOpenUpdate(true);
    };

    const handleDeleteClick = (user: UserFromApi) => {
        setSelectedUser(user);
        setIdsToDelete([]);
        setConfirmModalOpen(true);
    };

    const handleBulkDeleteClick = (ids: string[]) => {
        setIdsToDelete(ids);
        setSelectedUser(null);
        setConfirmModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        const tenancyId = sessionData?.user?.tenancyId;
        if (!tenancyId) return;

        const finalIdsToDelete = idsToDelete.length > 0 ? idsToDelete : (selectedUser ? [selectedUser.id] : []);

        if (finalIdsToDelete.length === 0) {
            setIsDeleting(false);
            setConfirmModalOpen(false);
            return;
        }

        try {
            if (users?.length === 1) {
                return notifications.show({
                    message: t("settings.users.errors.lastUser"),
                    color: "red",
                });
            }


            await deleteUsers(finalIdsToDelete, tenancyId, t, mutate as any);
            mutate();
        } catch (error) {
            console.error("Falha ao desativar professores:", error);
        } finally {
            setIsDeleting(false);
            setConfirmModalOpen(false);
            setSelectedUser(null);
            setIdsToDelete([]);
        }
    };

    const MenuItem = ({ user, onUpdateClick, onDeleteClick }: MenuItemProps) => (
        <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Menu shadow="md" width={200} withinPortal>
                <Menu.Target>
                    <ActionIcon variant="light" color="gray" radius={"md"}>
                        <BiDotsVerticalRounded />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Label>{t("general.actions.title")}</Menu.Label>
                    <Menu.Item leftSection={<GrUpdate size={14} />} onClick={() => onUpdateClick(user)}>
                        {t("general.actions.edit")}
                    </Menu.Item>
                    <Menu.Item color="red" leftSection={<BiTrash size={14} />} onClick={() => {
                        if (d?.length === 1) {
                             notifications.show({
                                message: t("settings.users.errors.last_user"),
                                color: "red",
                            });
                            return;
                        } else {
                            onDeleteClick(user);
                        }
                        
                    }}>
                        {t("general.actions.delete")}
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </div>
    );


    if (status === "loading" || isLoading) return <LoadingOverlay visible />;
    if (status !== "authenticated") return <div>{t("general.errors.invalidSession")}</div>;
    if (error) return <p>{t("general.errors.loadingData")}</p>;


    return (
        <>
            <DataView<UserFromApi & { fullName: string; }>
                data={d || []}
                openNewModal={{
                    func: () => setOpenNew(true),
                    label: t("settings.users.modals.create.title")
                }}
                baseUrl=""
                mutate={mutate as any}
                pageTitle={t("settings.users.title")}
                searchbarPlaceholder={t("settings.users.searchbarPlaceholder")}
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
                        key: "role",
                        label: t("settings.users.role.label"),
                        sortable: true,
                        render: (val) => {
                            if (val === "ADMIN") {
                                return t("settings.users.role.admin");
                            } else if (val === "STAFF") {
                                return t("settings.users.role.staff");
                            } else {
                                return val;
                            }
                        }
                    }
                ]}

                RenderRowMenu={(item) => <MenuItem user={item} onUpdateClick={handleUpdateClick} onDeleteClick={handleDeleteClick} />}
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
                                        {t("settings.users.view.registeredAt", { date: dayjs(item.createdAt).format("DD/MM/YYYY") })}
                                    </Text>
                                </div>
                            </div>
                            <MenuItem user={item} onUpdateClick={handleUpdateClick} onDeleteClick={handleDeleteClick} />
                        </div>
                    </div>
                )}
            />

            <NewTeacher opened={openNew} onClose={() => setOpenNew(false)} mutate={mutate as any} />
            {selectedUser && (
                <UpdateUser
                    opened={openUpdate}
                    onClose={() => {
                        setOpenUpdate(false);
                        setSelectedUser(null);
                    }}
                    user={selectedUser}
                    tenancyId={sessionData.user.tenancyId}
                    mutate={mutate as any}
                />
            )}
            <ConfirmationModal
                opened={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title={t("settings.users.modals.confirmModal.title")}
                confirmLabel={t("general.actions.delete")}
                cancelLabel={t("general.actions.cancel")}
                loading={isDeleting}
            >
                {idsToDelete.length > 0 ? (
                    t("settings.users.modals.confirmModal.textArray", { count: idsToDelete.length })
                ) : (
                    t("settings.users.modals.confirmModal.text", {
                        user: selectedUser?.firstName + " " + selectedUser?.lastName || ""
                    })
                )}
                <br />
                <Text component="span" c="red" size="sm" fw={500} mt="md">{t("settings.users.modals.confirmModal.warn")}</Text>
            </ConfirmationModal>
        </>
    );
}

