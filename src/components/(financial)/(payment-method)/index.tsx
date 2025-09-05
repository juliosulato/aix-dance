"use client";
import DataView from "@/components/ui/DataView";
import { useEffect, useState } from "react";
import NewPaymentMethod from "./newPaymentMethod";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { ActionIcon, LoadingOverlay, Menu } from "@mantine/core";
import { useSession } from "next-auth/react";
import { PaymentFee, PaymentMethod as PrismaPaymentMethod } from "@prisma/client";
import { BiMenu, BiTrash } from "react-icons/bi";
import dayjs from "dayjs";
dayjs.locale("pt-br");
import 'dayjs/locale/pt-br';
import deletePaymentMethod from "./deletePaymentMethod";
import UpdatePaymentMethod from "./updatePaymentMethod";
import { GrUpdate } from "react-icons/gr";

export interface PaymentMethod extends PrismaPaymentMethod {
    fees: PaymentFee[];
}

interface MenuItemProps {
    paymentMethod: PaymentMethod;
}

interface MenuItemsProps {
    selectedIds: string[];
}

export default function PaymentMethodsView() {
    const [open, setOpen] = useState<boolean>(false);
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

    const t = useTranslations("");


    const { data: sessionData, status } = useSession();
    const { data: paymentMethods, error, isLoading, mutate } = useSWR<PaymentMethod[]>(
        () =>
            sessionData?.user?.tenancyId
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/payment-methods`
                : null,
        fetcher
    );

    useEffect(() => {
        if (selectedPaymentMethod) {
            setOpenUpdate(true);
        }
    }, [selectedPaymentMethod])

    if (status === "loading" || isLoading) return <LoadingOverlay visible />;
    if (status !== "authenticated") return <div>Você precisa estar logado para criar estudantes.</div>;
    if (error) return <p>Error</p>;

    const MenuItem = ({ paymentMethod }: MenuItemProps) => (
        <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Menu>
                <Menu.Target>
                    <ActionIcon variant="filled" color="rgba(219, 219, 219, 1)" radius={"md"}>
                        <BiMenu className="text-neutral-600" />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Item leftSection={<GrUpdate />} onClick={() => {
                        setSelectedPaymentMethod(paymentMethod);
                    }}>
                        Atualizar {paymentMethod.name}
                    </Menu.Item>
                    <Menu.Item leftSection={<BiTrash />} onClick={() => deletePaymentMethod(paymentMethod, mutate, sessionData.user.tenancyId)}>
                        Excluir {paymentMethod.name}
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </div>

    );

    const MenuItems = ({ selectedIds }: MenuItemsProps) => (
        <Menu>
            <Menu.Target>
                <ActionIcon variant="filled" color="rgba(219, 219, 219, 1)" radius={"md"}>
                    <BiMenu className="text-neutral-600" />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item leftSection={<BiTrash />} onClick={() => deletePaymentMethod(selectedIds, mutate, sessionData.user.tenancyId)}>
                    Excluir {selectedIds.length} Itens
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );

    return (
        <>
            <DataView<PaymentMethod>
                data={paymentMethods || []}
                openNewModal={{
                    func: () => setOpen(true),
                    label: "Nova Forma de Pagamento"
                }}
                baseUrl="/system/financial/payment-methods/"
                mutate={mutate}
                pageTitle="Formas de Pagamento"
                renderCard={(item) => (
                    <>
                        <div className="flex flex-row gap-0 justify-between">
                            <div className="flex flex-col gap-4">
                                <h2 className="font-semibold text-lg">{item.name}</h2>
                                {item.operator && <span><strong>Operador:</strong> {item.operator}</span>}
                            </div>
                            <MenuItem paymentMethod={item} />
                        </div>
                        <span className="text-neutral-500 text-sm">{dayjs(item.createdAt).format("DD [de] MMMM [de] YYYY")}</span>
                    </>
                )
                }
                columns={[
                    { key: "name", label: "Nome" },
                    { key: "operator", label: "Operador" },
                ]}
                searchbarPlaceholder="Pesquise por alguma informação..."
                RenderRowMenu={(item) => <MenuItem paymentMethod={item} />}
                RenderAllRowsMenu={(selectedIds) => <MenuItems selectedIds={selectedIds} />}
            />
            <NewPaymentMethod opened={open} onClose={() => setOpen(false)} />
            <UpdatePaymentMethod opened={openUpdate} onClose={() => {
                setOpenUpdate(false);
                setSelectedPaymentMethod(null);
            }} paymentMethod={selectedPaymentMethod} mutate={mutate} />
        </>
    );
}