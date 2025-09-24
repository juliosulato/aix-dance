"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { Divider } from "@mantine/core";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import deleteSuppliers from "./delete";
import UpdateSupplier from "./UpdateSupplier";
import { SupplierFromApi } from "./SupplierFromApi";

export default function SupplierView({ supplier, tenancyId }: { supplier: SupplierFromApi, tenancyId: string }) {
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);


    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteSuppliers([supplier.id], tenancyId);
            window.location.replace("/system/suppliers");
        } catch (error) {
            console.error("Falha ao excluir o fornecedor:", error);
            setIsDeleting(false);
            setConfirmModalOpen(false);
        }
    };

    return (
        <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
                <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">Detalhes do Fornecedor</h1>
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
                <InfoTerm label={"Nome"}>{supplier.name}</InfoTerm>
                <InfoTerm label={"Razão Social"}>{supplier.corporateReason}</InfoTerm>
                <InfoTerm label={"Documento"}>{supplier.document}</InfoTerm>
                <InfoTerm label={"Tipo de Documento"}>{supplier.documentType}</InfoTerm>
                <InfoTerm label={"Telefone"}>{supplier.phoneNumber}</InfoTerm>
                <InfoTerm label={"Celular"}>{supplier.cellPhoneNumber}</InfoTerm>
                <InfoTerm label={"E-mail"}>{supplier.email}</InfoTerm>
                <Divider className="md:col-span-2 lg:col-span-3" label={"Endereço"} labelPosition="center" />
                <InfoTerm label={"Logradouro"}>{`${supplier.address.publicPlace}`}</InfoTerm>
                <InfoTerm label={"Bairro"}>{supplier.address.neighborhood}</InfoTerm>
                <InfoTerm label={"Complemento"}>{supplier.address.complement}</InfoTerm>
                <InfoTerm label={"Número"}>{supplier.address.number}</InfoTerm>
                <InfoTerm label={"Cidade"}>{supplier.address.city}</InfoTerm>
                <InfoTerm label={"Estado"}>{supplier.address.state}</InfoTerm>
                <InfoTerm label={"CEP"}>{supplier.address.zipCode}</InfoTerm>
            </div>

            <UpdateSupplier supplier={supplier} onClose={() => setOpenUpdate(false)} opened={openUpdate} mutate={() => window.location.reload() as any} />
            <ConfirmationModal
                opened={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDelete}
                title="Confirmar Exclusão"
                confirmLabel="Sim, Excluir"
                confirmColor="red"
                loading={isDeleting}
            >
                {`Deseja excluir o fornecedor ${supplier?.name || ""}? Esta ação não pode ser desfeita.`}
            </ConfirmationModal>
        </div>
    );
}