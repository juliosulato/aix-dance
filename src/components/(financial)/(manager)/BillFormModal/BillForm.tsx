import FileUpload from "@/components/FileUpload";
import {
  CreateBillInput,
  UpdateBillInput,
} from "@/schemas/financial/bill.schema";
import { Bank } from "@/types/bank.types";
import { BillComplete, PaymentMethod } from "@/types/bill.types";
import { CategoryBill } from "@/types/category.types";
import { Supplier } from "@/types/supplier.types";
import {
  Alert,
  Button,
  Group,
  NumberInput,
  Radio,
  Select,
  Tabs,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useState, useEffect } from "react";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import Installments from "./Installments";
import Subscription from "./Subscription";
import { DateInput } from "@mantine/dates";
import dayjs from "dayjs";
import { BiInfoCircle } from "react-icons/bi";

type CreateOrUpdateBill = CreateBillInput | UpdateBillInput;

type Props = {
  control: Control<any>;
  errors: FieldErrors<CreateOrUpdateBill>;
  register: UseFormRegister<CreateOrUpdateBill>;
  setValue: UseFormSetValue<CreateOrUpdateBill>;
  watch: UseFormWatch<CreateOrUpdateBill>;
  onSubmit: () => void;
  banks: Bank[];
  suppliers: Supplier[];
  categories: CategoryBill[];
  pending: boolean;
  isEditing?: BillComplete;
};

type TabValue = "ONE_TIME" | "INSTALLMENTS" | "SUBSCRIPTION";

export default function BillForm({
  register,
  control,
  errors,
  watch,
  setValue,
  onSubmit,
  banks,
  suppliers,
  categories,
  pending,
  isEditing,
}: Props) {
  const currentMode = watch("paymentMode");
  const dueDate = watch("dueDate");
  const [activeTab, setActiveTab] = useState<TabValue | null>(currentMode === "SUBSCRIPTION" ? "SUBSCRIPTION" : currentMode === "INSTALLMENTS" ? "INSTALLMENTS" : "ONE_TIME");

  useEffect(() => {
    if (currentMode === "SUBSCRIPTION") {
      setActiveTab("SUBSCRIPTION");
    } else if (currentMode === "INSTALLMENTS") {
      setActiveTab("INSTALLMENTS");
    } else {
      setActiveTab("ONE_TIME");
    }
  }, [currentMode]);

  const handleTabChange = (value: TabValue) => {
    setActiveTab(value);

    if (value === "INSTALLMENTS") {
      setValue("paymentMode", "INSTALLMENTS");
      setValue("installments", 2);
      setValue("recurrence", "NONE");
    } else if (value === "SUBSCRIPTION" ){
      setValue("paymentMode", "SUBSCRIPTION");
      setValue("installments", 1);
    } else {
      setValue("paymentMode", "ONE_TIME");
      setValue("recurrence", "NONE");
      setValue("installments", 1);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      {isEditing && (
        <input type="hidden" name="id" id="id" value={isEditing.id} />
      )}

      <input type="hidden" {...register("type")} value="PAYABLE" />

      <div className="form-card-grid">
        <h2 className="text-lg font-semibold col-span-full">
          Informações da Despesa
        </h2>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <NumberInput
              label={"Valor"}
              allowDecimal
              decimalSeparator=","
              required
              min={0}
              withAsterisk
              value={field.value as number | undefined}
              onChange={(val) => field.onChange(val ?? 0)}
              leftSection={<RiMoneyDollarCircleFill />}
              error={errors.amount?.message}
            />
          )}
        />

        <Controller
          name="bankId"
          control={control}
          render={({ field }) => (
            <Select
              label={"Banco / Conta de Saída"}
              data={
                banks?.map((bank) => ({
                  label: bank.name,
                  value: bank.id,
                })) || []
              }
              value={field.value}
              onChange={field.onChange}
              error={errors.bankId?.message}
              searchable
              withAsterisk
            />
          )}
        />
        <Controller
          name="supplierId"
          control={control}
          render={({ field }) => (
            <Select
              label={"Fornecedor"}
              placeholder="Selecione o fornecedor..."
              data={
                suppliers?.map((supplier) => ({
                  label: supplier.name,
                  value: supplier.id,
                })) || []
              }
              value={field.value}
              onChange={field.onChange}
              error={errors.supplierId?.message}
              searchable
              clearable
            />
          )}
        />
        <Controller
          name="paymentMethod"
          control={control}
          render={({ field }) => (
            <Select
              label={"Forma de Pagamento"}
              data={[
                { label: "Dinheiro", value: PaymentMethod.CASH },
                {
                  label: "Cartão de Crédito",
                  value: PaymentMethod.CREDIT_CARD,
                },
                { label: "Cartão de Débito", value: PaymentMethod.DEBIT_CARD },
                {
                  label: "Transferência Bancária",
                  value: PaymentMethod.BANK_TRANSFER,
                },
                { label: "PIX", value: PaymentMethod.PIX },
                { label: "Boleto", value: PaymentMethod.BANK_SLIP },
              ]}
              value={field.value}
              onChange={field.onChange}
              error={(errors as any).paymentMethod?.message}
              searchable
              clearable
            />
          )}
        />

        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <Select
              label={"Categoria de Despesa"}
              data={
                categories?.map((category) => ({
                  label: category.name,
                  value: category.id,
                })) || []
              }
              value={field.value}
              onChange={field.onChange}
              error={errors.categoryId?.message}
              searchable
              clearable
            />
          )}
        />

        <TextInput
          label={"Descrição"}
          error={errors.description?.message}
          {...register("description")}
          className="md:col-span-2 lg:col-span-3"
          placeholder="Ex: Conta de Luz, Aluguel, Compra de Material..."
        />

        <TextInput
          label={"Complemento"}
          error={(errors as any).complement?.message}
          {...register("complement")}
          className="md:col-span-2 lg:col-span-3"
        />
        <FileUpload
          onComplete={() => null}
          accept="image/png, image/jpeg, application/pdf"
        />
      </div>
      <div>
        <Tabs
          value={activeTab}
          onChange={(value) => handleTabChange(value as TabValue)}
          className="mt-6"
          color="#7439FA"
          variant="pills"
          keepMounted
          radius="lg"
          classNames={{ tab: "!p-4 md:!px-6 !font-semibold" }}
        >
          <Tabs.List>
            <Tabs.Tab value="ONE_TIME">Pagamento à vista</Tabs.Tab>
            <Tabs.Tab value="INSTALLMENTS">Parcelado</Tabs.Tab>
            <Tabs.Tab value="SUBSCRIPTION">Assinatura</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="ONE_TIME" pt="xs">
            <div className="form-card-grid">
              <input type="hidden" name="installments" value={1} />
              <Controller
                      control={control}
                      name="dueDate"
                      render={({ field }) => (
                        <DateInput
                          {...field}
                          label={"Data de Vencimento"}
                          value={field.value}
                          error={(errors as any)?.dueDate?.message}
                          required
                        />
                      )}
                    />
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="INSTALLMENTS" pt="xs">
            <Installments
              control={control}
              errors={errors}
              register={register}
            />
          </Tabs.Panel>

          <Tabs.Panel value="SUBSCRIPTION" pt="xs">
            <Subscription
              control={control}
              errors={errors}
              register={register}
              setValue={setValue}
              watch={watch}
            />
          </Tabs.Panel>
        </Tabs>
      </div>

      {isEditing && (
        <Controller
          name="updateScope"
          control={control}
          render={({ field }) => (
              <Radio.Group
              name="updateScope"
              label={
                "Você está editando uma despesa recorrente. Escolha o que deseja atualizar:"
              }
              value={field.value}
              onChange={field.onChange}
              error={(errors as any).updateScope?.message}
              className="mt-6"
            >
              <Group mt="xs">
                <Radio value="ONE" label="Apenas esta conta" color="#7439FA" />
                <Tooltip
                  label={
                    "Aplica a alteração a todas as contas futuras geradas por esta despesa recorrente. Valor, descrição e demais dados serão atualizados."
                  }
                  withArrow
                >
                  <Radio
                    value="ALL_FUTURE"
                    label="Esta e todas as futuras contas"
                    color="#7439FA"
                  />
                </Tooltip>
              </Group>
            </Radio.Group>
          )}
        />
      )}

      {dueDate && currentMode !== "ONE_TIME" && (
        <Alert className="mt-6" color="violet" variant="light" icon={<BiInfoCircle/>}>
          A data de vencimento da primeira parcela/assinatura está definida para todo dia {dayjs(dueDate).format("DD")}.
          {currentMode === "INSTALLMENTS" && (
            <> Todas as parcelas serão geradas agora automaticamente (ex.: Valor total R$ 100 em duas parcelas, gerará duas cobranças de R$ 50).</>
          )}

          {currentMode === "SUBSCRIPTION" && (
            <>As próximas assinaturas são geradas automaticamente todo dia 20 do mês anterior ao vencimento.</>
          )}
        </Alert>
      )}

      <div className="flex justify-end pt-6">
        <Button
          type="submit"
          color="#7439FA"
          radius="lg"
          size="md"
          loading={pending}
          className="text-sm! font-medium! tracking-wider"
        >
          Salvar Despesa
        </Button>
      </div>
    </form>
  );
}
