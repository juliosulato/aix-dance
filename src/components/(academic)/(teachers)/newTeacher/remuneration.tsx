import { useState } from "react";
import { Button, Checkbox, NumberInput, Select, Table, Textarea, Tooltip, ActionIcon } from "@mantine/core";
import { useTranslations } from "next-intl";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import { BiHelpCircle } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
// Importações essenciais do react-hook-form
import { Control, Controller, FieldErrors, UseFormRegister, useFieldArray, useWatch } from "react-hook-form";
import { CreateUserInput } from "@/schemas/user.schema";
import { RemunerationType } from "@prisma/client";

dayjs.locale("pt-br");

type Props = {
    // Trocamos register por control, que é mais poderoso para componentes customizados
    control: Control<CreateUserInput>;
    errors: FieldErrors<CreateUserInput>;
};

// Removido o register das props, pois usaremos Controller para tudo aqui.
export default function NewTeacher__Remuneration({ control, errors }: Props) {
    const t = useTranslations("teachers.modals.create.remuneration");
    const g = useTranslations("general");

    // Hook para gerenciar o array dinâmico de comissões
    const { fields, append, remove } = useFieldArray({
        control,
        name: "teacher.comissionTiers",
    });

    // Usando `useWatch` para reagir a mudanças nos campos do formulário
    const remunerationType = useWatch({ control, name: "teacher.remunerationType" });
    const [presenceBonus, setPresenceBonus] = useState<boolean>(false);
    const [comission, setComission] = useState<boolean>(false);


    const contractTypeData = [
        { value: RemunerationType.HOURLY, label: t("contractType.options.HOURLY") },
        { value: RemunerationType.FIXED, label: t("contractType.options.FIXED") },
    ];

    const handleAddRange = () => {
        const lastTier = fields[fields.length - 1];
        // @ts-ignore
        const newFrom = lastTier ? (lastTier.maxStudents || 0) + 1 : 1;
        append({ minStudents: newFrom, maxStudents: 0, comission: 0 });
    };

    const handleRemoveRange = (index: number) => {
        if (fields.length <= 1) return;
        remove(index);
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{t("title")}</h2>

            {/* Todos os campos agora são controlados pelo <Controller> */}
            <Controller
                name="teacher.remunerationType"
                control={control}
                defaultValue={RemunerationType.HOURLY}
                render={({ field }) => (
                    <Select
                        label={t("contractType.label")}
                        placeholder={t("contractType.placeholder")}
                        data={contractTypeData}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.teacher?.remunerationType?.message}
                    />
                )}
            />

            <Controller
                name="teacher.baseAmount"
                control={control}
                render={({ field }) => (
                     <NumberInput
                        {...field}
                        label={remunerationType === "HOURLY" ? t("hourly.label") : t("fixed.label")}
                        leftSection={<RiMoneyDollarCircleLine size={24} />}
                        allowDecimal
                        decimalSeparator=","
                        min={0}
                        error={errors.teacher?.baseAmount?.message}
                    />
                )}
            />
            
            <Controller
                name="teacher.paymentDay"
                control={control}
                defaultValue={5}
                render={({ field }) => (
                    <NumberInput
                        {...field}
                        label={t("paymentDay.label")}
                        min={1} max={31}
                        error={errors.teacher?.paymentDay?.message}
                    />
                )}
            />

            <Controller
                name="teacher.paymentMethodId"
                control={control}
                render={({ field }) => (
                     <Select {...field} label={t("paymentMethod.label")} data={[]} nothingFoundMessage={g("notFound")} />
                )}
            />
           
            <Controller
                name="teacher.paymentData"
                control={control}
                render={({ field }) => (
                    <Textarea {...field} label={t("paymentDetails.label")} className="md:col-span-2 lg:col-span-3 3xl:col-span-4" />
                )}
            />
            
            <Controller
                name="teacher.observations"
                control={control}
                render={({ field }) => (
                     <Textarea {...field} label={t("notes.label")} className="md:col-span-2 lg:col-span-3 3xl:col-span-4" />
                )}
            />
            
            <div className="flex gap-4 flex-wrap md:col-span-2 lg:col-span-3 3xl:col-span-4">
                <div className="flex items-center gap-1">
                     <Checkbox label={t("presenceBonus.checkbox")} checked={presenceBonus} onChange={(ev) => setPresenceBonus(ev.target.checked)} />
                     <Tooltip label={t("presenceBonus.tooltip")} color="violet" arrowOffset={50} arrowPosition="center" arrowRadius={3} arrowSize={5} position="bottom-end" multiline w={220}>
                         <BiHelpCircle size={18} className="cursor-pointer hover:text-primary" />
                     </Tooltip>
                </div>
                <div className="flex items-center gap-1">
                     <Checkbox label={t("commission.checkbox")} checked={comission} onChange={(ev) => setComission(ev.target.checked)} />
                     <Tooltip label={t("commission.tooltip")} color="violet" arrowOffset={50} arrowPosition="center" arrowRadius={3} arrowSize={5} position="bottom-end" multiline w={220}>
                         <BiHelpCircle size={18} className="cursor-pointer hover:text-primary" />
                     </Tooltip>
                </div>
            </div>

            {presenceBonus && (
                <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4 md:col-span-2 lg:col-span-3 3xl:col-span-4">
                    <h2 className="text-lg font-bold">{t("presenceBonus.title")}</h2>
                    <Controller
                        name="teacher.bonusForPresenceAmount"
                        control={control}
                        render={({ field }) => (
                            <NumberInput
                                {...field}
                                label={t("presenceBonus.label")}
                                leftSection={<RiMoneyDollarCircleLine size={24} />}
                                allowDecimal
                                decimalSeparator=","
                                min={0}
                                error={errors.teacher?.bonusForPresenceAmount?.message}
                            />
                        )}
                    />
                    <Controller
                        name="teacher.loseBonusWhenAbsent"
                        control={control}
                        defaultValue={true}
                        render={({ field }) => (
                            <div className="flex items-center gap-1">
                                <Checkbox
                                    label={t("presenceBonus.loseBonusCheckbox")}
                                    checked={field.value}
                                    onChange={(event) => field.onChange(event.currentTarget.checked)}
                                />
                                <Tooltip label={t("presenceBonus.loseBonusTooltip")} color="violet" arrowOffset={50} arrowPosition="center" arrowRadius={3} arrowSize={5} position="bottom-end" multiline w={220}>
                                    <BiHelpCircle size={18} className="cursor-pointer hover:text-primary" />
                                </Tooltip>
                            </div>
                        )}
                    />
                </div>
            )}

            {comission && (
                <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4 md:col-span-2 lg:col-span-3 3xl:col-span-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold">{t("commission.title")}</h2>
                        <Button type="button" color="#743FA" radius="lg" size="sm" onClick={handleAddRange}>
                            {t("commission.addRange")}
                        </Button>
                    </div>
                    <div>
                        <Table classNames={{ table: "!border !border-neutral-300 " }}>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>{t("commission.tableHeaders.from")}</Table.Th>
                                    <Table.Th>{t("commission.tableHeaders.to")}</Table.Th>
                                    <Table.Th>{t("commission.tableHeaders.value")}</Table.Th>
                                    <Table.Th>Ações</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {fields.map((field, index) => (
                                    <Table.Tr key={field.id}>
                                        <Table.Td>
                                            <Controller
                                                name={`teacher.comissionTiers.${index}.minStudents`}
                                                control={control}
                                                render={({ field: controllerField }) => (
                                                    <NumberInput
                                                        {...controllerField}
                                                        min={1}
                                                        error={errors.teacher?.comissionTiers?.[index]?.minStudents?.message}
                                                    />
                                                )}
                                            />
                                        </Table.Td>
                                        <Table.Td>
                                            <Controller
                                                name={`teacher.comissionTiers.${index}.maxStudents`}
                                                control={control}
                                                render={({ field: controllerField }) => (
                                                    <NumberInput
                                                        {...controllerField}
                                                        min={1}
                                                        error={errors.teacher?.comissionTiers?.[index]?.maxStudents?.message}
                                                    />
                                                )}
                                            />
                                        </Table.Td>
                                        <Table.Td>
                                            <Controller
                                                name={`teacher.comissionTiers.${index}.comission`}
                                                control={control}
                                                render={({ field: controllerField }) => (
                                                    <NumberInput
                                                        {...controllerField}
                                                        leftSection={<RiMoneyDollarCircleLine size={24} />}
                                                        allowDecimal
                                                        decimalSeparator=","
                                                        min={0}
                                                        error={errors.teacher?.comissionTiers?.[index]?.comission?.message}
                                                    />
                                                )}
                                            />
                                        </Table.Td>
                                        <Table.Td>
                                            <ActionIcon
                                                color="red"
                                                variant="light"
                                                onClick={() => handleRemoveRange(index)}
                                                disabled={fields.length <= 1}
                                            >
                                                <FaTrash size={16} />
                                            </ActionIcon>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                        {errors.teacher?.comissionTiers?.message && (
                            <p className="text-red-500 text-xs mt-1">{errors.teacher.comissionTiers.message}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
