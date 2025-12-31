import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { notifications } from "@mantine/notifications";
import { deleteBanks } from "@/actions/financial/banks/delete";
import { Bank } from "@/types/bank.types";

export function useBankAccountsController() {
    const { data } = useSession();

    // Dados
    const [banks, setBanks] = useState<Bank[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    // Modais e Seleção
    const [openNew, setOpenNew] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    
    // Deleção
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchBanks = useCallback(async () => {
        if (!data?.user?.tenancyId) return;
        try {
            setIsLoading(true);
            setError(false);
            const response = await fetch(`/api/v1/tenancies/${data.user.tenancyId}/banks`);
            if (!response.ok) throw new Error("Falha ao carregar dados");
            const responseData = await response.json();
            setBanks(responseData);
        } catch (err) {
            console.error(err);
            setError(true);
            notifications.show({ title: 'Erro', message: 'Erro ao carregar bancos.', color: 'red' });
        } finally {
            setIsLoading(false);
        }
    }, [data?.user?.tenancyId]);

    useEffect(() => {
        if (data?.user?.tenancyId) fetchBanks();
    }, [fetchBanks, data?.user?.tenancyId]);

    const handleUpdateClick = (bank: Bank) => {
        setSelectedBank(bank);
        setOpenUpdate(true);
    };

    const handleDeleteClick = (bank: Bank) => {
        setIdsToDelete([bank.id]);
        setConfirmModalOpen(true);
    };

    const handleBulkDeleteClick = (ids: string[]) => {
        setIdsToDelete(ids);
        setConfirmModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (idsToDelete.length === 0) return;
        setIsDeleting(true);
        try {
            const result = await deleteBanks(idsToDelete);
            if (result.success) {
                notifications.show({ title: 'Sucesso', message: 'Excluído com sucesso.', color: 'green' });
                setBanks(curr => curr.filter(b => !idsToDelete.includes(b.id)));
                setConfirmModalOpen(false);
                setIdsToDelete([]);
            } else {
                throw new Error(result.error);
            }
        } catch (err: any) {
            notifications.show({ title: 'Erro', message: err.message || 'Falha ao excluir.', color: 'red' });
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        state: { banks, isLoading, error, openNew, openUpdate, selectedBank, isConfirmModalOpen, isDeleting, idsToDelete },
        actions: { setOpenNew, setOpenUpdate, setSelectedBank, setConfirmModalOpen, fetchBanks },
        handlers: { handleUpdateClick, handleDeleteClick, handleBulkDeleteClick, handleDeleteConfirm }
    };
}