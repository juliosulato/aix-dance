"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import deleteCategories from "../delete";
import UpdateCategoryBill from "../modals/UpdateCategory";
import { useSession } from "next-auth/react";
import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";
import { CategoryBill } from "@/types/bill.types";

export default function CategoryBillView({ id }: { id: string }) {

    const session = useSession();
    const tenancyId = session?.data?.user.tenancyId as string;

    const { data: category, error } = useSWR<CategoryBill>(
        `/api/v1/tenancies/${tenancyId}/category-bills/${id}`,
        fetcher
    );


    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);


    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteCategories([category?.id || ""], tenancyId);
            window.location.replace("/system/financial/categories");
        } catch (error) {
            console.error("Falha ao excluir o grupo:", error);
            setIsDeleting(false);
            setConfirmModalOpen(false);
        }
    };

    if (error) {
        console.error("Falha ao carregar os dados do grupo:", error);
        return <div>Falha ao carregar os dados do grupo.</div>;
    }

    if (!category) {
        return <div>Carregando...</div>;
    }

    return (
        <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
                <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">{category.name}</h1>
                <div className="flex gap-4 md:gap-6">
                    <button className="text-red-500 flex items-center gap-2 cursor-pointer hover:opacity-50 transition" onClick={() => setConfirmModalOpen(true)}>
                        <FaTrash />
                        <span>{"Excluir"}</span>
                    </button>
                    <button className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition" onClick={() => setOpenUpdate(true)}>
                        <FaEdit />
                        <span>{"Atualizar"}</span>
                    </button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={"Nome"}>{category.name}</InfoTerm>

                <UpdateCategoryBill category={category} onClose={() => setOpenUpdate(false)} opened={openUpdate} mutate={() => window.location.reload() as any} />
                <ConfirmationModal
                    opened={isConfirmModalOpen}
                    onClose={() => setConfirmModalOpen(false)}
                    onConfirm={handleDelete}
                    title="Confirmar Exclusão"
                    confirmLabel="Sim, Excluir"
                    confirmColor="red"
                    loading={isDeleting}
                >
                    {`Tem certeza que deseja excluir o grupo "${category?.name || ''}"?`}
                </ConfirmationModal>
            </div>
        </div>
    );
}