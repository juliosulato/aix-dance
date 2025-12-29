"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useSWR from "swr";
import { Tenancy } from "@/types/tenancy.types";
import { Plan } from "@/types/plan.types";
import { Student } from "@/types/student.types";
import {
  FaSearch,
  FaUser,
  FaPlusCircle,
  FaFileAlt,
  FaRegTrashAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  ActionIcon,
  Button,
  NumberInput,
  Select,
  TextInput,
  Alert,
  Text,
  Chip,
  Group,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { FiShoppingCart } from "react-icons/fi";
import { fetcher } from "@/utils/fetcher";
import { extractItemsFromResponse, PaginatedListResponse } from "@/utils/pagination";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import NewStudentContractModal from "./new";
import { StudentFromApi } from "../StudentFromApi";
import { useSession } from "next-auth/react";
import { authedFetch } from "@/utils/authedFetch";
import { FormsOfReceipt } from "@/types/receipt.types";

const saleFormSchema = z.object({
  studentId: z.string().min(1, { message: "Selecione um aluno." }),
  payments: z
    .array(
      z.object({
        formsOfReceiptId: z.string().min(1),
        amount: z.number().positive("O valor do pagamento deve ser positivo."),
        installments: z
          .number()
          .int()
          .min(1, "O mínimo é 1 parcela.")
          .default(1),
      })
    )
    .min(1, "Adicione pelo menos uma forma de pagamento."),
  discountPercentage: z.number().min(0).max(100).default(0),
});

type SaleFormValues = z.infer<typeof saleFormSchema>;

type Product = {
  id: string;
  name: string;
  amount: number;
  isPlan: boolean;
  isEnrollmentFee?: boolean;
  isActive?: boolean; 
};

type CartItem = {
  cartId: string;
  productId: string;
  name: string;
  amount: number;
  isPlan: boolean;
  contractModelId?: string | null;
  contractModelName?: string;
  contractHtmlContent?: string | null;
  isEnrollmentFee?: boolean;
};

// --- Componente Principal do PDV ---
export default function PointOfSale({
  studentId: preselectedStudentId,
}: {
  studentId?: string;
}) {
  const session = useSession();
  const tenancyId = session.data?.user.tenancyId || "";

  // --- Hooks de data fetching ---
  const { data: tenancy } = useSWR<Tenancy>(
    `/api/v1/tenancies/${tenancyId}`,
    fetcher
  );

  type PaginationInfo = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  type PaginatedResponseLocal<T> = {
    products: T[];
    pagination: PaginationInfo;
  };

  const { data: plansData } = useSWR<Plan[] | PaginatedResponseLocal<Plan>>(
    `/api/v1/tenancies/${tenancyId}/plans`,
    fetcher
  );
  const plans = Array.isArray(plansData)
    ? plansData
    : (plansData as any)?.products ?? (plansData as any)?.plans ?? undefined;

  // --- Estados do Componente ---
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isContractModalOpen, setContractModalOpen] = useState(false);
  const [currentItemForContract, setCurrentItemForContract] =
    useState<CartItem | null>(null);
  // filters: allow selecting multiple types to show in the product list
  const [selectedFilters, setSelectedFilters] = useState<string[]>([
    "products",
    "plans",
    "fee",
  ]);

  // Paginated products fetch: start with page 1, limit 30 and accumulate as user scrolls
  const [productPage, setProductPage] = useState<number>(1);
  const PRODUCT_PAGE_LIMIT = 30;
  const productsUrl = `/api/v1/tenancies/${tenancyId}/inventory/products?page=${productPage}&limit=${PRODUCT_PAGE_LIMIT}${
    searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : ""
  }`;

  const { data: productsData, isLoading: productsLoading } = useSWR<{
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  } | null>(tenancyId ? productsUrl : null, fetcher);

  const [accProducts, setAccProducts] = useState<Product[]>([]);
  const [totalProductPages, setTotalProductPages] = useState<number>(1);

  // accumulate pages; when searchTerm or tenancyId changes, reset
  useEffect(() => {
    setProductPage(1);
    setAccProducts([]);
  }, [searchTerm, tenancyId]);

  useEffect(() => {
    if (!productsData) return;
    const fetched = productsData.products || [];
    setTotalProductPages(
      (productsData.pagination && productsData.pagination.totalPages) || 1
    );
    setAccProducts((prev) => {
      // if loading first page or search changed, replace
      if (productPage === 1) return fetched;
      // append new unique products
      const existingIds = new Set(prev.map((p) => p.id));
      const toAppend = fetched.filter((p) => !existingIds.has(p.id));
      return [...prev, ...toAppend];
    });
  }, [productsData, productPage]);

  const products = accProducts;

  const studentsUrl = tenancyId
    ? `/api/v1/tenancies/${tenancyId}/students?limit=500`
    : null;
  const { data: studentsData } = useSWR<
    Student[] | PaginatedListResponse<Student>
  >(studentsUrl, fetcher);
  const students = extractItemsFromResponse(studentsData);

  const { data: formsOfReceiptData } = useSWR<
    FormsOfReceipt[] | PaginatedResponseLocal<FormsOfReceipt>
  >(
    `/api/v1/tenancies/${tenancyId}/forms-of-receipt`,
    fetcher
  );
  const formsOfReceipt = Array.isArray(formsOfReceiptData)
    ? formsOfReceiptData
    : (formsOfReceiptData as any)?.products ??
      (formsOfReceiptData as any)?.formsOfReceipt ??
      undefined;

  // --- Lógica do Formulário ---
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema) as any,
    defaultValues: {
      studentId: preselectedStudentId || "",
      payments: [],
      discountPercentage: 0,
    },
  });
  const {
    fields: paymentFields,
    append: appendPayment,
    remove: removePayment,
  } = useFieldArray({ control, name: "payments" });
  const discountPercentage = watch("discountPercentage");
  const selectedStudentId = watch("studentId");

  // --- SWR para buscar as assinaturas do aluno selecionado ---
  const { data: studentSubscriptions } = useSWR<StudentFromApi>(
    selectedStudentId
      ? `/api/v1/tenancies/${tenancyId}/students/${selectedStudentId}`
      : null,
    fetcher
  );

  // --- Buscar status do aluno selecionado ---
  const selectedStudent = useMemo(() => {
    if (!students || !selectedStudentId) return undefined;
    return students.find((s: Student) => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  // --- Lógica de Produtos e Carrinho ---
  // UUID generator with fallbacks (crypto.randomUUID -> crypto.getRandomValues -> Math.random)
  const generateId = (): string => {
    if (
      typeof crypto !== "undefined" &&
      typeof (crypto as any).randomUUID === "function"
    ) {
      try {
        return (crypto as any).randomUUID();
      } catch {
        /* fallback below */
      }
    }
    if (
      typeof crypto !== "undefined" &&
      typeof (crypto as any).getRandomValues === "function"
    ) {
      const arr = new Uint8Array(16);
      (crypto as any).getRandomValues(arr);
      arr[6] = (arr[6] & 0x0f) | 0x40;
      arr[8] = (arr[8] & 0x3f) | 0x80;
      const toHex = (n: number) => n.toString(16).padStart(2, "0");
      let i = 0;
      return `${toHex(arr[i++])}${toHex(arr[i++])}${toHex(arr[i++])}${toHex(
        arr[i++]
      )}-${toHex(arr[i++])}${toHex(arr[i++])}-${toHex(arr[i++])}${toHex(
        arr[i++]
      )}-${toHex(arr[i++])}${toHex(arr[i++])}-${toHex(arr[i++])}${toHex(
        arr[i++]
      )}${toHex(arr[i++])}${toHex(arr[i++])}${toHex(arr[i++])}${toHex(
        arr[i++]
      )}`;
    }
    // last resort (not cryptographically secure)
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };
  const productsContainerRef = useRef<HTMLDivElement | null>(null);

  const availableProducts = useMemo((): Product[] => {
    const productList: Product[] = [];
    if (tenancy?.enrollmentFee && Number(tenancy.enrollmentFee) > 0)
      productList.push({
        id: "enrollment-fee",
        name: "Taxa de Matrícula",
        amount: Number(tenancy.enrollmentFee),
        isPlan: false,
        isEnrollmentFee: true,
      });

    if (plans)
      plans.forEach((plan: Plan) =>
        productList.push({
          id: plan.id,
          name: plan.name,
          amount: Number(plan.amount),
          isPlan: true,
        })
      );

    // Include inventory products (non-plan items) — only active ones
    if (products) {
      products.forEach((p: Product) => {
        if (p.isActive) {
          const price = Number((p as any).price ?? 0);
          productList.push({
            id: p.id,
            name: p.name,
            amount: price,
            isPlan: false,
          });
        }
      });
    }

    return productList;
  }, [tenancy, plans, products]);

  const filteredProducts = availableProducts.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    // determine type
    const isPlan = !!p.isPlan;
    const isFee = !!p.isEnrollmentFee;
    const isProduct = !isPlan && !isFee;

    const matchesFilter =
      (isProduct && selectedFilters.includes("products")) ||
      (isPlan && selectedFilters.includes("plans")) ||
      (isFee && selectedFilters.includes("fee"));

    return matchesSearch && matchesFilter;
  });

  const handleProductsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (
      distanceToBottom < 120 &&
      !productsLoading &&
      productPage < totalProductPages
    ) {
      setProductPage((prev) => prev + 1);
    }
  };
  const addToCart = (product: Product) => {
    if (product.isPlan && cart.some((item) => item.isPlan)) {
      notifications.show({
        title: "Aviso",
        message: "Só é permitido adicionar um único plano ao carrinho.",
        color: "yellow",
      });
      return;
    }

    if (
      product.isEnrollmentFee &&
      cart.some((item) => item.productId === "enrollment-fee")
    ) {
      notifications.show({
        title: "Aviso",
        message: "A taxa de matrícula já foi adicionada.",
        color: "yellow",
      });
      return;
    }
    setCart((prev) => [
      ...prev,
      {
        cartId: generateId(),
        productId: product.id,
        name: product.name,
        amount: product.amount,
        isPlan: product.isPlan,
        isEnrollmentFee: product.isEnrollmentFee,
      },
    ]);
  };
  const removeFromCart = (cartId: string) =>
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  const cartSubtotal = useMemo(
    () => cart.reduce((total, item) => total + item.amount, 0),
    [cart]
  );
  const discountAmount = useMemo(
    () => (cartSubtotal * discountPercentage) / 100,
    [cartSubtotal, discountPercentage]
  );
  const baseTotal = useMemo(
    () => cartSubtotal - discountAmount,
    [cartSubtotal, discountAmount]
  );

  // surcharge: total of fees that are configured as customerInterest for the
  // selected payments. Calculated client-side to show the operator the final
  // amount the customer will be charged. We subscribe to payments using
  // useWatch so recalculation happens immediately when payments/forms change.
  const paymentsWatch = useWatch({ control, name: "payments" }) as
    | any[]
    | undefined;
  const isAdjustingPaymentsRef = useRef(false);
  const prevPaymentsRef = useRef<number[] | null>(null);
  const surchargeTotal = useMemo(() => {
    if (!formsOfReceipt) return 0;
    const payments: any[] = paymentsWatch || [];
    // Avoid circular calculation: compute surcharge over the baseTotal
    // (cart subtotal minus discount) split evenly among payments.
    const count = payments.length || 1;
    // Distribute baseTotal across payments (two decimals, remainder to last)
    const baseShare = Math.floor((baseTotal / count) * 100) / 100;
    const remainder = Number((baseTotal - baseShare * count).toFixed(2));

    let s = 0;
    for (let i = 0; i < count; i++) {
      const p = payments[i] || { formsOfReceiptId: undefined, installments: 1 };
      const assignedBase =
        i === count - 1
          ? Number((baseShare + remainder).toFixed(2))
          : baseShare;
      const f = formsOfReceipt.find(
        (fr: FormsOfReceipt) => fr.id === p.formsOfReceiptId
      ) as any;
      if (!f) continue;
      const feeRow = Array.isArray(f.fees)
        ? f.fees.find(
            (rr: any) =>
              (p.installments ?? 1) >= rr.minInstallments &&
              (p.installments ?? 1) <= rr.maxInstallments
          )
        : null;
      if (feeRow && feeRow.customerInterest) {
        const feeAmount = Number(
          ((feeRow.feePercentage / 100) * assignedBase).toFixed(2)
        );
        s += feeAmount;
      }
    }
    return Number(s.toFixed(2));
  }, [formsOfReceipt, paymentsWatch, baseTotal]);

  const finalTotal = useMemo(
    () => baseTotal + surchargeTotal,
    [baseTotal, surchargeTotal]
  );

  // --- Hooks para verificar plano ativo e plano no carrinho ---
  const activeStudentSubscription = useMemo(() => {
    if (!studentSubscriptions) return null;
    return studentSubscriptions.subscriptions.find(
      (sub) => sub.status === "ACTIVE"
    );
  }, [studentSubscriptions]);

  const planItemInCart = useMemo(
    () => cart.find((item) => item.isPlan),
    [cart]
  );

  useEffect(() => {
    if (activeStudentSubscription && planItemInCart) {
      notifications.show({
        title: "Aviso",
        message: `O aluno já possui um plano ativo. Ao finalizar, ele será substituído pelo plano ${planItemInCart.name}.`,
        color: "yellow",
      });
    }
  }, [activeStudentSubscription, planItemInCart]);

  // --- Lógica de Contrato ---
  const openContractModal = (cartItem: CartItem) => {
    if (!selectedStudentId) {
      notifications.show({
        title: "Atenção",
        message:
          "Por favor, selecione um aluno antes de adicionar um contrato.",
        color: "yellow",
      });
      return;
    }
    setCurrentItemForContract(cartItem);
    setContractModalOpen(true);
  };

  const handleConfirmContractFromModal = (data: {
    htmlContent: string;
    modelId: string;
    modelName: string;
  }) => {
    if (!currentItemForContract) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartId === currentItemForContract.cartId
          ? {
              ...item,
              contractHtmlContent: data.htmlContent,
              contractModelId: data.modelId,
              contractModelName: data.modelName,
            }
          : item
      )
    );
    setContractModalOpen(false);
    setCurrentItemForContract(null);
  };

  // --- Efeitos ---
  useEffect(() => {
    if (preselectedStudentId) setValue("studentId", preselectedStudentId);
  }, [preselectedStudentId, setValue]);

  useEffect(() => {
    if (
      formsOfReceipt &&
      formsOfReceipt.length > 0 &&
      paymentFields.length === 0
    ) {
      appendPayment({
        formsOfReceiptId: formsOfReceipt[0].id,
        amount: finalTotal,
        installments: 1,
      });
    }
  }, [formsOfReceipt, paymentFields.length, appendPayment, finalTotal]);

  useEffect(() => {
    if (paymentFields.length > 0) {
      // Divide de forma igualitária
      const baseValue =
        Math.floor((finalTotal / paymentFields.length) * 100) / 100; // 2 casas decimais
      const remainder = finalTotal - baseValue * paymentFields.length;

      // When programmatically setting payment values, avoid triggering the
      // user-edit adjustment logic. Use a ref to mark the update as internal.
      isAdjustingPaymentsRef.current = true;
      paymentFields.forEach((_, index) => {
        let value = baseValue;
        if (index === paymentFields.length - 1) {
          value += remainder; // último recebe o ajuste
        }
        setValue(`payments.${index}.amount`, Number(value.toFixed(2)), {
          shouldValidate: true,
        });
      });
      // store snapshot to detect future user edits
      prevPaymentsRef.current = paymentFields.map(() =>
        Number((finalTotal / paymentFields.length).toFixed(2))
      );
      // small delay to ensure setValue updates propagate
      setTimeout(() => (isAdjustingPaymentsRef.current = false), 0);
    }
  }, [finalTotal, paymentFields, paymentFields.length, setValue]);

  // When the user edits a payment amount manually, keep the total constant by
  // adjusting the other payments proportionally (or equally when others are 0).
  useEffect(() => {
    if (!paymentsWatch || paymentsWatch.length === 0) return;
    if (isAdjustingPaymentsRef.current) {
      // update snapshot and don't react to our own changes
      prevPaymentsRef.current = paymentsWatch.map((p) => Number(p.amount || 0));
      return;
    }

    const prev = prevPaymentsRef.current;
    if (!prev || prev.length !== paymentsWatch.length) {
      prevPaymentsRef.current = paymentsWatch.map((p) => Number(p.amount || 0));
      return;
    }

    // find which index changed
    let changedIndex = -1;
    for (let i = 0; i < paymentsWatch.length; i++) {
      const prevAmt = Number(prev[i] || 0);
      const currAmt = Number(paymentsWatch[i]?.amount || 0);
      if (Math.abs(currAmt - prevAmt) > 0.009) {
        changedIndex = i;
        break;
      }
    }
    if (changedIndex === -1) return;

    const sum = paymentsWatch.reduce((s, p) => s + Number(p.amount || 0), 0);
    const diff = Number((finalTotal - sum).toFixed(2));
    if (Math.abs(diff) < 0.01) {
      prevPaymentsRef.current = paymentsWatch.map((p) => Number(p.amount || 0));
      return;
    }

    const otherIndexes = paymentsWatch
      .map((_, i) => i)
      .filter((i) => i !== changedIndex);
    if (otherIndexes.length === 0) {
      // only one payment — adjust it to finalTotal
      isAdjustingPaymentsRef.current = true;
      setValue(
        `payments.${changedIndex}.amount`,
        Number(
          (Number(paymentsWatch[changedIndex].amount || 0) + diff).toFixed(2)
        ),
        {
          shouldValidate: true,
        }
      );
      prevPaymentsRef.current = paymentsWatch.map((p) => Number(p.amount || 0));
      isAdjustingPaymentsRef.current = false;
      return;
    }

    // distribute diff across other payments proportionally to their current amounts
    const othersTotal = otherIndexes.reduce(
      (s, i) => s + Number(paymentsWatch[i].amount || 0),
      0
    );
    isAdjustingPaymentsRef.current = true;
    if (othersTotal > 0.001) {
      for (const i of otherIndexes) {
        const curr = Number(paymentsWatch[i].amount || 0);
        const add = diff * (curr / othersTotal);
        const newVal = Number((curr + add).toFixed(2));
        setValue(`payments.${i}.amount`, newVal, { shouldValidate: true });
      }
    } else {
      // split equally
      const per = Number((diff / otherIndexes.length).toFixed(2));
      for (const i of otherIndexes) {
        const curr = Number(paymentsWatch[i].amount || 0);
        setValue(`payments.${i}.amount`, Number((curr + per).toFixed(2)), {
          shouldValidate: true,
        });
      }
    }
    // delay clearing the flag to allow setValue to propagate
    setTimeout(() => {
      isAdjustingPaymentsRef.current = false;
      prevPaymentsRef.current = paymentsWatch.map((p) => Number(p.amount || 0));
    }, 0);
  }, [paymentsWatch, finalTotal, setValue]);

  // --- Função de Submissão ---
  const onSubmit = async (data: SaleFormValues) => {
    const totalPaid = data.payments.reduce((sum, p) => sum + p.amount, 0);
    if (Math.abs(totalPaid - finalTotal) > 0.01) {
      notifications.show({
        title: "Erro de Validação",
        message:
          "A soma dos pagamentos não corresponde ao valor total da venda.",
        color: "red",
      });
      return;
    }

    // Include enrollment fee items directly in the items payload so the backend
    // Zod validation (which requires at least one item) is satisfied. We avoid
    // relying only on `chargeEnrollmentFee` because the schema validates items
    // before the service can merge the fee server-side.
    const itemsPayload = cart.map((item) => ({
      // backend requires either planId (for plans) or productId (for inventory products)
      planId: item.isPlan ? item.productId : undefined,
      productId:
        !item.isPlan && !item.isEnrollmentFee ? item.productId : undefined,
      description: item.isEnrollmentFee ? "Taxa de Matrícula" : item.name,
      quantity: 1,
      unitAmount: item.amount,
      contractHtmlContent: item.contractHtmlContent,
    }));

    if (surchargeTotal > 0) {
      itemsPayload.push({
        planId: undefined,
        productId: undefined,
        description: "Taxa (repassada ao cliente)",
        quantity: 1,
        unitAmount: surchargeTotal,
        contractHtmlContent: null,
      });
    }

    const payload = {
      ...data,
      chargeEnrollmentFee: false,
      items: itemsPayload,
      allowNegativeStock: true,
    };

    try {
      const response = await authedFetch(
        `/api/v1/tenancies/${tenancyId}/sales`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      // Parse body safely to extract detailed error messages when available
      let responseBody: any = null;
      try {
        responseBody = await response.json();
      } catch (err) {
        // ignore json parse errors
        void err;
      }

      if (!response.ok) {
        // Prefer structured messages from the API
        let errMsg = responseBody?.message || responseBody?.error || null;
        if (!errMsg && Array.isArray(responseBody?.details)) {
          errMsg = responseBody.details
            .map((d: any) => d.message || JSON.stringify(d))
            .join("; ");
        }
        if (!errMsg)
          errMsg =
            typeof responseBody === "string"
              ? responseBody
              : JSON.stringify(responseBody) || "Falha ao criar a venda.";
        throw new Error(errMsg);
      }

      await fetch(
        `/api/v1/tenancies/${tenancyId}/students/${data.studentId}/history`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: `Venda realizada de ${payload.items
              .map((item) => item.description)
              .join(", ")}`,
          }),
        }
      );

      notifications.show({
        title: "Sucesso!",
        message: "Venda realizada com sucesso!",
        color: "green",
      });
      setCart([]);
      if (!preselectedStudentId) setValue("studentId", "");
      setValue("discountPercentage", 0);
      setValue("payments", []);
    } catch (error) {
      console.error("Sale error:", error);
      const msg = (error as Error).message || "Falha ao criar a venda.";
      notifications.show({
        title: "Erro ao Salvar",
        message: msg,
        color: "red",
      });
    }
  };

  const preselectedStudent = useMemo(
    () => students?.find((s: Student) => s.id === preselectedStudentId),
    [students, preselectedStudentId]
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Ponto de Venda (PDV)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white p-4 md:p-6 lg:p-8 rounded-2xl shadow">
          <TextInput
            placeholder="Buscar por planos ou matrícula..."
            rightSection={<FaSearch className="text-neutral-400" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="lg"
          />
          <br />
          <div className="mb-3">
            <Chip.Group
              multiple
              value={selectedFilters}
              onChange={(val) =>
                setSelectedFilters(Array.isArray(val) ? val : [val])
              }
            >
              <Group gap={"6"}>
                <Chip value="products">Produtos</Chip>
                <Chip value="plans">Planos</Chip>
                <Chip value="fee">Taxa de Matrícula</Chip>
              </Group>
            </Chip.Group>
          </div>
          <div
            ref={productsContainerRef}
            onScroll={handleProductsScroll}
            className="space-y-2 max-h-[60vh] overflow-y-auto pr-2"
          >
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded-md border border-neutral-300 hover:opacity-50 transition"
              >
                <div>
                  <p className="font-semibold text-gray-700">{product.name} |  <span className="inline-block bg-neutral-100 text-neutral-700 py-0.5 rounded-full text-xs font-semibold">
                      {product.isPlan
                        ? "PLANO"
                        : product.isEnrollmentFee
                        ? "MATRÍCULA"
                        : "PRODUTO"}
                    </span></p>

                  {product.amount > 0 ? (
                    <p className="text-sm text-purple-600 font-medium mt-2">
                      {product.amount.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  ) : (
                    <p className="text-sm text-red-600 font-medium mt-2">
                      Sem preço definido
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  color={product.amount > 0 ? "#7439FA" : "gray"}
                  radius="lg"
                  size="lg"
                  className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
                  onClick={() => addToCart(product)}
                  leftSection={<FaPlusCircle />}
                  disabled={product.amount <= 0}
                  title={
                    product.amount <= 0
                      ? "Não é possível adicionar produtos sem preço"
                      : undefined
                  }
                >
                  {product.amount > 0 ? "Adicionar" : "Indisponível"}
                </Button>
              </div>
            ))}
            {productsLoading && (
              <div className="text-center py-3 text-sm text-gray-500">
                Carregando mais produtos...
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-4 md:p-6 lg:p-8 rounded-2xl shadow">
          <h2 className="text-xl font-semibold text-gray-800 border-b border-b-neutral-300 pb-2 mb-4 flex items-center gap-2">
            <FiShoppingCart size={24} /> Carrinho
          </h2>
          {cart.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              O carrinho está vazio.
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* --- Alerta de substituição de plano --- */}
              {activeStudentSubscription && planItemInCart && (
                <Alert
                  icon={<FaExclamationTriangle size={18} />}
                  title="Aviso de Substituição de Plano"
                  color="yellow"
                  radius="md"
                  mb="md"
                  variant="light"
                >
                  <Text size="sm">
                    O aluno já possui um plano. Ao finalizar, ele será
                    substituído pelo plano{" "}
                    <strong>{planItemInCart.name}</strong>.
                  </Text>
                </Alert>
              )}
              {/* --- Alerta de bloqueio acadêmico --- */}
              {selectedStudent && selectedStudent.active === false && (
                <Alert
                  icon={<FaExclamationTriangle size={18} />}
                  title="Ação Bloqueada"
                  color="red"
                  radius="md"
                  mb="md"
                  variant="light"
                >
                  <Text size="sm">
                    Este aluno está <strong>inativo</strong> devido a pendências
                    financeiras. Não é possível realizar novas matrículas,
                    vendas ou contratos enquanto o status estiver bloqueado.
                  </Text>
                </Alert>
              )}
              <div className="space-y-3 mb-4 max-h-[40vh] overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.cartId}
                    className="border border-neutral-300  p-3 rounded-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="mt-1">
                          <span className="inline-block bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                            {item.isPlan ? "PLANO" : item.isEnrollmentFee ? "MATRÍCULA" : "PRODUTO"}
                          </span>
                        </p>
                        <p className="text-gray-600 mt-2">
                          {item.amount.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                      </div>
                      <ActionIcon
                        onClick={() => removeFromCart(item.cartId)}
                        title="Remover Contrato"
                        variant="light"
                        color="red"
                      >
                        <FaRegTrashAlt />
                      </ActionIcon>
                    </div>
                    {item.isPlan && (
                      <div className="mt-2">
                        {item.contractModelId ? (
                          <div className="text-sm p-2 bg-green-50 text-green-700 rounded-md border border-neutral-300 flex justify-between items-center">
                            <span>Contrato: {item.contractModelName}</span>
                            <button
                              type="button"
                              onClick={() => openContractModal(item)}
                              className="font-semibold"
                            >
                              Trocar
                            </button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => openContractModal(item)}
                            leftSection={<FaFileAlt />}
                            variant="light"
                            fullWidth
                            radius="lg"
                            size="lg"
                            className="!text-sm !font-medium tracking-wider w-full"
                          >
                            Adicionar Contrato
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-300 pt-4">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>
                      {cartSubtotal.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Desconto (%):</span>
                    <Controller
                      name="discountPercentage"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          allowDecimal
                          decimalSeparator=","
                          {...field}
                          onChange={(e) => field.onChange(e || 0)}
                          suffix="%"
                          className="!w-fit !max-w-fit"
                          classNames={{ input: "!w-fit !max-w-fit" }}
                        />
                      )}
                    />
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>
                      {finalTotal.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  {preselectedStudentId && preselectedStudent ? (
                    <div>
                      <label className="block text-sm font-medium">Aluno</label>
                      <div className="w-full p-2.5 border border-neutral-300 rounded-md bg-neutral-50 flex items-center gap-2">
                        <FaUser size={16} />
                        <span>
                          {preselectedStudent.firstName}{" "}
                          {preselectedStudent.lastName}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <Controller
                      name="studentId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          onChange={(e) => field.onChange(e || "")}
                          searchable
                          className="w-full p-2 border border-neutral-300 rounded-md"
                          data={students?.map((s: Student) => ({
                            label: `${s.firstName} ${s.lastName}`,
                            value: s.id,
                          }))}
                          label="Aluno"
                          error={errors.studentId?.message}
                        />
                      )}
                    />
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Pagamentos
                    </label>
                    <br />
                    <div className="space-y-2">
                      {paymentFields.map((field, index) => (
                        <div key={field.id} className="flex flex-col gap-2">
                          <div className="flex gap-2 justify-between items-center">
                            <h3 className="font-semibold text-lg md:text-xl">
                              {index + 1}/{paymentFields.length}
                            </h3>
                            <ActionIcon
                              onClick={() => removePayment(index)}
                              title="Remover pagamento"
                              variant="light"
                              color="red"
                            >
                              {" "}
                              <FaRegTrashAlt />{" "}
                            </ActionIcon>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:col-span-3 items-center justify-center gap-2">
                            <Controller
                              name={`payments.${index}.formsOfReceiptId`}
                              control={control}
                              render={({ field }) => (
                                <Select
                                  data={
                                    formsOfReceipt?.map(
                                      (p: FormsOfReceipt) => ({
                                        value: p.id,
                                        label: p.name,
                                      })
                                    ) || []
                                  }
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Forma de pagamento"
                                  label="Forma de pagamento"
                                  size="md"
                                  radius="md"
                                />
                              )}
                            />
                            <Controller
                              name={`payments.${index}.installments`}
                              control={control}
                              render={({ field }) => {
                                // determine selected formsOfReceipt fees to set min/max
                                const selectedForm = formsOfReceipt?.find(
                                  (f: FormsOfReceipt) =>
                                    f.id ===
                                    (watch(
                                      `payments.${index}.formsOfReceiptId`
                                    ) as string)
                                ) as any;
                                const feesArray = Array.isArray(
                                  selectedForm?.fees
                                )
                                  ? selectedForm.fees
                                  : [];
                                const feeRow =
                                  feesArray.find(
                                    (fr: any) =>
                                      field.value >= fr.minInstallments &&
                                      field.value <= fr.maxInstallments
                                  ) || feesArray[0];
                                const min = feeRow?.minInstallments ?? 1;
                                const max = feeRow?.maxInstallments ?? 1;
                                return (
                                  <div>
                                    <NumberInput
                                      min={min}
                                      max={max}
                                      value={field.value}
                                      onChange={(e) =>
                                        field.onChange(Number(e) || min)
                                      }
                                      placeholder="Parc."
                                      label="Parc."
                                      size="md"
                                      radius="md"
                                    />
                                    {feesArray.length > 0 && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        Parcela: mínimo {min} - máximo {max}
                                      </div>
                                    )}
                                  </div>
                                );
                              }}
                            />
                            <Controller
                              name={`payments.${index}.amount`}
                              control={control}
                              render={({ field }) => (
                                <NumberInput
                                  allowDecimal
                                  decimalSeparator=","
                                  min={0}
                                  value={field.value}
                                  onChange={(val) => field.onChange(val)}
                                  placeholder="Valor"
                                  label="Valor"
                                  prefix="R$ "
                                  size="md"
                                  leftSection={<RiMoneyDollarCircleFill />}
                                  radius="md"
                                />
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        appendPayment({
                          formsOfReceiptId: formsOfReceipt?.[0]?.id || "",
                          amount: 0,
                          installments: 1,
                        })
                      }
                      className="mt-2 text-sm text-purple-600 font-semibold"
                    >
                      + Adicionar Pagamento
                    </button>
                  </div>
                </div>
                <br />
                <Button
                  loading={isSubmitting}
                  color="green"
                  fullWidth
                  size="lg"
                  radius="lg"
                  type="submit"
                  disabled={selectedStudent && selectedStudent.active === false}
                >
                  {selectedStudent && selectedStudent.active === false
                    ? "Ação Bloqueada"
                    : isSubmitting
                    ? "Processando..."
                    : "Finalizar Venda"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {isContractModalOpen && currentItemForContract && (
        <NewStudentContractModal
          opened={isContractModalOpen}
          onClose={() => {
            setContractModalOpen(false);
            setCurrentItemForContract(null);
          }}
          studentId={selectedStudentId}
          onConfirm={handleConfirmContractFromModal}
          planContext={plans?.find(
            (p: Plan) => p.id === currentItemForContract.productId
          )}
        />
      )}
    </div>
  );
}
