import { useState } from "react";
import { Button, Checkbox, NumberInput, Select, Table, Textarea, Tooltip, ActionIcon } from "@mantine/core";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { BiHelpCircle } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
import { Control, Controller, FieldErrors, useFieldArray, useWatch } from "react-hook-form";
import { CreateUserInput, UpdateUserInput } from "@/schemas/user.schema";
import { RemunerationType } from "@/types/bill.types";

type Props = {
    control: Control<CreateUserInput | UpdateUserInput>;
    errors: FieldErrors<CreateUserInput | UpdateUserInput>;
};

export default function Teacher__Remuneration({ control, errors }: Props) {

    const { fields, append, remove } = useFieldArray({
        control,
        name: "teacher.comissionTiers",
    });

    const remunerationType = useWatch({ control, name: "teacher.remunerationType" });
    const [presenceBonus, setPresenceBonus] = useState<boolean>(false);
    const [comission, setComission] = useState<boolean>(false);

    const contractTypeData = [
        { value: RemunerationType.HOURLY, label: "Hora-Aula" },
        { value: RemunerationType.FIXED, label: "Fixo" },
    ];

    const handleAddRange = () => {
        const lastTier = fields[fields.length - 1];
        const newFrom = lastTier ? (lastTier.maxStudents || 0) + 1 : 1;
        append({ minStudents: newFrom, maxStudents: 0, comission: 0 });
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{"Remuneração"}</h2>

            <Controller
                name="teacher.remunerationType"
                control={control}
                defaultValue={RemunerationType.HOURLY}
                render={({ field }) => (
                    <Select
                        label={"Tipo de Contrato"}
                        placeholder={"Selecione o tipo de contrato"}
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
                        label={remunerationType === "HOURLY" ? "Valor por Hora" : "Valor Fixo"}
                        leftSection={<RiMoneyDollarCircleLine size={18} />}
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
                        label={"Dia de Pagamento"}
                        min={1} max={31}
                        error={errors.teacher?.paymentDay?.message}
                    />
                )}
            />

        
            <Controller
                name="teacher.paymentData"
                control={control}
                render={({ field }) => (
                    <Textarea {...field} label={"Dados de Pagamento"} className="md:col-span-2 lg:col-span-3 3xl:col-span-4" />
                )}
            />
            
            <Controller
                name="teacher.observations"
                control={control}
                render={({ field }) => (
                     <Textarea {...field} label={"Observações"} className="md:col-span-2 lg:col-span-3 3xl:col-span-4" />
                )}
            />
            
            <div className="flex gap-4 flex-wrap md:col-span-2 lg:col-span-3 3xl:col-span-4">
                <div className="flex items-center gap-1">
                     <Checkbox label={"Bônus de Presença"} checked={presenceBonus} onChange={(ev) => setPresenceBonus(ev.target.checked)} />
                     <Tooltip label={"Define um valor extra que o professor recebe por dar todas as aulas. Útil para comissionamento."} color="violet" arrowOffset={50} arrowPosition="center" arrowRadius={3} arrowSize={5} position="bottom-end" multiline w={220}>
                         <BiHelpCircle size={18} className="cursor-pointer hover:text-primary" />
                     </Tooltip>
                </div>
                <div className="flex items-center gap-1">
                     <Checkbox label={"Bônus por Comissão"} checked={comission} onChange={(ev) => setComission(ev.target.checked)} />
                     <Tooltip label={"Cria faixas de comissão baseadas no número de alunos presentes na aula"} color="violet" arrowOffset={50} arrowPosition="center" arrowRadius={3} arrowSize={5} position="bottom-end" multiline w={220}>
                         <BiHelpCircle size={18} className="cursor-pointer hover:text-primary" />
                     </Tooltip>
                </div>
            </div>

            {presenceBonus && (
                <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4 md:col-span-2 lg:col-span-3 3xl:col-span-4">
                    <h2 className="text-lg font-bold">{"Bônus de Presença"}</h2>
                    <Controller
                        name="teacher.bonusForPresenceAmount"
                        control={control}
                        render={({ field }) => (
                            <NumberInput
                                {...field}
                                label={"Valor do Bônus"}
                                leftSection={<RiMoneyDollarCircleLine size={18} />}
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
                                    label={"Perde o Bônus se Ausente"}
                                    checked={field.value}
                                    onChange={(event) => field.onChange(event.currentTarget.checked)}
                                />
                                <Tooltip label={"Define se o professor perde o bônus de presença quando está ausente."} color="violet" arrowOffset={50} arrowPosition="center" arrowRadius={3} arrowSize={5} position="bottom-end" multiline w={220}>
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
                        <h2 className="text-lg font-bold">{"Faixas de Comissão"}</h2>
                        <Button type="button" color="#7439FA" radius="lg" size="sm" onClick={handleAddRange}>
                            {"Adicionar Faixa"}
                        </Button>
                    </div>
                    <div>
                        <Table classNames={{ table: "!border !border-neutral-300 " }}>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>{"Min. Alunos"}</Table.Th>
                                    <Table.Th>{"Max. Alunos"}</Table.Th>
                                    <Table.Th>{"Comissão"}</Table.Th>
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
                                                        leftSection={<RiMoneyDollarCircleLine size={18} />}
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
                                                onClick={() => remove(index)}
                                                disabled={fields.length <= 1}
                                            >
                                                <FaTrash size={16} />
                                            </ActionIcon>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                        {errors.teacher?.comissionTiers?.root?.message && (
                            <p className="text-red-500 text-xs mt-1">{errors.teacher.comissionTiers.root.message}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
