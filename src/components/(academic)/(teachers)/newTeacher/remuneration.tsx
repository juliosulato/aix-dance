import { ContractType } from "@prisma/client";
import { useState, useRef } from "react";
import { Button, Checkbox, NumberInput, Select, Table, Textarea, Tooltip, ActionIcon } from "@mantine/core";
import { useTranslations } from "next-intl";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import { BiHelpCircle } from "react-icons/bi";
import { FaTrash } from "react-icons/fa"; // Ícone de lixeira

dayjs.locale("pt-br");

// Definindo um tipo para clareza
type CommissionRange = {
    id: number;
    from: number | '';
    to: number | '';
    value: number | '';
};

export default function NewTeacher__Remuneration() {
    const t = useTranslations("teachers.modals.create.remuneration");
    const g = useTranslations("general");

    const [contractType, setContractType] = useState<ContractType>("HOURLY");
    const [presenceBonus, setPresenceBonus] = useState<boolean>(false);
    const [comission, setComission] = useState<boolean>(false);

    const [commissionRanges, setCommissionRanges] = useState<CommissionRange[]>([
        { id: 1, from: 1, to: 4, value: 1 },
    ]);
    const nextId = useRef(2);

    const contractTypeData = [
        { value: "HOURLY", label: t("contractType.options.HOURLY") },
        { value: "FIXED", label: t("contractType.options.FIXED") },
    ];

    // 2. Função para adicionar uma nova faixa de comissão
    const handleAddRange = () => {
        const lastRange = commissionRanges[commissionRanges.length - 1];
        const newFrom = lastRange && typeof lastRange.to === 'number' ? lastRange.to + 1 : 1;

        const newRange: CommissionRange = {
            id: nextId.current,
            from: newFrom,
            to: '', // Valor padrão
            value: '', // Valor padrão
        };
        setCommissionRanges([...commissionRanges, newRange]);
        nextId.current++; // Incrementa o ID para a próxima adição
    };

    // 3. Função para atualizar os valores de uma faixa específica
    const handleRangeChange = (id: number, field: keyof Omit<CommissionRange, 'id'>, value: number | string) => {
        setCommissionRanges(prevRanges =>
            prevRanges.map(range =>
                range.id === id ? { ...range, [field]: value } : range
            )
        );
    };

    // 4. Função para remover uma faixa de comissão
    const handleRemoveRange = (id: number) => {
        // Impede a remoção da última faixa
        if (commissionRanges.length <= 1) return;
        setCommissionRanges(prevRanges => prevRanges.filter(range => range.id !== id));
    };

    const commissionRows = commissionRanges.map((range, index) => (
        <Table.Tr key={range.id}>
            <Table.Td>
                <NumberInput
                    value={range.from}
                    onChange={(val) => handleRangeChange(range.id, 'from', val)}
                    min={1}
                />
            </Table.Td>
            <Table.Td>
                <NumberInput
                    value={range.to}
                    onChange={(val) => handleRangeChange(range.id, 'to', val)}
                    min={typeof range.from === 'number' ? range.from : 1}
                />
            </Table.Td>
            <Table.Td>
                <NumberInput
                    value={range.value}
                    onChange={(val) => handleRangeChange(range.id, 'value', val)}
                    leftSection={<RiMoneyDollarCircleLine size={24} />}
                    allowDecimal
                    decimalSeparator=","
                    min={0}
                />
            </Table.Td>
            <Table.Td>
                <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => handleRemoveRange(range.id)}
                    disabled={commissionRanges.length <= 1} // Desabilita o botão se for a única linha
                >
                    <FaTrash size={16} />
                </ActionIcon>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{t("title")}</h2>
            <Select
                label={t("contractType.label")}
                placeholder={t("contractType.placeholder")}
                data={contractTypeData}
                value={contractType}
                onChange={(value) => setContractType(value as ContractType)}
            />

            {contractType === "HOURLY" && (
                <NumberInput label={t("hourly.label")}
                    leftSection={<RiMoneyDollarCircleLine size={24} />}
                />
            )}

            {contractType === "FIXED" && (
                <NumberInput label={t("fixed.label")} />
            )}

            {contractType === "PER_CLASS" && (
                <NumberInput label={t("perClass.label")} />
            )}

            {contractType === "PERCENTAGE" && (
                <NumberInput label={t("percentage.label")} />
            )}

            <NumberInput label={t("paymentDay.label")} min={1} max={31} defaultValue={5} />
            <div className="flex flex-col gap-1">
                <Select name="paymentMethod" id="paymentMethod" label={t("paymentMethod.label")} data={[]} nothingFoundMessage={g("notFound")} />
            </div>
            <Textarea label={t("paymentDetails.label")} className="md:col-span-2 lg:col-span-3 3xl:col-span-4" />
            <Textarea label={t("notes.label")} className="md:col-span-2 lg:col-span-3 3xl:col-span-4" />


            <div className="flex gap-4 flex-wrap md:col-span-2 lg:col-span-3 3xl:col-span-4">
                <div className="flex items-center gap-1">
                    <Checkbox label={t("presenceBonus.checkbox")} onChange={(ev) => setPresenceBonus(ev.target.checked)} />
                    <Tooltip label={t("presenceBonus.tooltip")} color="violet" arrowOffset={50} arrowPosition="center" arrowRadius={3} arrowSize={5} position="bottom-end" multiline w={220}>
                        <BiHelpCircle size={18} className="cursor-pointer hover:text-primary" />
                    </Tooltip>
                </div>
                <div className="flex items-center gap-1">
                    <Checkbox label={t("commission.checkbox")} onChange={(ev) => setComission(ev.target.checked)} />
                    <Tooltip label={t("commission.tooltip")} color="violet" arrowOffset={50} arrowPosition="center" arrowRadius={3} arrowSize={5} position="bottom-end" multiline w={220}>
                        <BiHelpCircle size={18} className="cursor-pointer hover:text-primary" />
                    </Tooltip>
                </div>
                <br />
            </div>
            {presenceBonus && (
                <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4 md:col-span-2 lg:col-span-3 3xl:col-span-4">
                    <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{t("presenceBonus.title")}</h2>
                    <NumberInput
                        label={t("presenceBonus.label")}
                        leftSection={<RiMoneyDollarCircleLine size={24} />}
                        allowDecimal
                        decimalSeparator=","
                        min={0}
                    />

                    <div className="flex items-center gap-1">
                        <Checkbox label={t("presenceBonus.loseBonusCheckbox")} defaultChecked={true} />
                        <Tooltip label={t("presenceBonus.loseBonusTooltip")} color="violet" arrowOffset={50} arrowPosition="center" arrowRadius={3} arrowSize={5} position="bottom-end" multiline w={220}>
                            <BiHelpCircle size={18} className="cursor-pointer hover:text-primary" />
                        </Tooltip>
                    </div>
                </div>
            )}

            {comission && (
                <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4 md:col-span-2 lg:col-span-3 3xl:col-span-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold">{t("commission.title")}</h2>
                        <Button
                            type="button"
                            color="#7439FA"
                            radius={"lg"}
                            size="sm" // Ajustado para "sm"
                            onClick={handleAddRange} // Adicionado o onClick
                        >{t("commission.addRange")}</Button>
                    </div>
                    <div>
                        <Table classNames={{ table: "!border !border-neutral-300 " }}>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>{t("commission.tableHeaders.from")}</Table.Th>
                                    <Table.Th>{t("commission.tableHeaders.to")}</Table.Th>
                                    <Table.Th>{t("commission.tableHeaders.value")}</Table.Th>
                                    <Table.Th>Ações</Table.Th> {/* Coluna extra para ações */}
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {commissionRows}
                            </Table.Tbody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    )
}