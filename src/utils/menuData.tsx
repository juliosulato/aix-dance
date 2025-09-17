// Início
import { GrHomeRounded } from "react-icons/gr";
import { AiOutlineDashboard } from "react-icons/ai";
import { MdOutlineBusinessCenter, MdOutlineViewAgenda, MdPayment } from "react-icons/md";
import { FiCalendar } from "react-icons/fi";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { IoExtensionPuzzleOutline } from "react-icons/io5";

// CRM
import { LuBrain, LuMap, LuMessageCircleMore, LuGraduationCap, LuChartSpline, LuSchool } from "react-icons/lu";

// Acadêmico
import { FaRegUser, FaChalkboardTeacher } from "react-icons/fa";
import { MdGroups } from "react-icons/md";

// Eventos
import { TbCalendarEvent, TbReportMoney, TbBuildingBank, TbCategory2, TbContract } from "react-icons/tb";

// Financeiro
import { MdOutlineSpaceDashboard, MdOutlineCategory } from "react-icons/md";
import { PiMoneyWavy } from "react-icons/pi";

// Estoque
import { FiInbox } from "react-icons/fi";
import { BsBox } from "react-icons/bs";
import { MdBookmarkBorder } from "react-icons/md";

import { useTranslations } from "next-intl";
import { RiMoneyDollarCircleLine } from "react-icons/ri";

const useMenuData = () => {
  const t = useTranslations("appShell");

  const menuData: {
    icon: React.ReactNode;
    label: string;
    subitems?: {
      icon: React.ReactNode;
      label: string;
      href?: string;
    }[];
    href?: string;
  }[] = [
    {
      icon: <GrHomeRounded />,
      label: t("navbar.home.label"),
      subitems: [
        { icon: <AiOutlineDashboard />, label: t("navbar.home.dashboard"), href: "/system/dashboard" },
        { icon: <FiCalendar />, label: t("navbar.home.classSchedule"), href: "/system/class-schedule" },
        { icon: <MdOutlineViewAgenda />, label: t("navbar.home.calendar"), href: "/system/calendar" },
        // { icon: <IoExtensionPuzzleOutline />, label: t("navbar.home.integrations"), href: "/system/integracoes" },
        // { icon: <IoMdHelpCircleOutline />, label: t("navbar.home.help"), href: "/system/help" },
      ],
    },
    // {
    //   icon: <LuBrain />,
    //   label: t("navbar.crm.label"),
    //   subitems: [
    //     { icon: <LuMap />, label: t("navbar.crm.crmManagement"), href: "/system/crm/gerenciamento" },
    //     { icon: <LuMessageCircleMore />, label: t("navbar.crm.crmConversations"), href: "/system/crm/conversas" },
    //     { icon: <LuChartSpline />, label: t("navbar.crm.crmReports"), href: "/system/crm/reports" },
    //   ],
    // },
    {
      icon: <LuGraduationCap />,
      label: t("navbar.academic.label"),
      subitems: [
        { icon: <FaRegUser />, label: t("navbar.academic.students"), href: "/system/academic/students" },
        { icon: <MdGroups />, label: t("navbar.academic.classes"), href: "/system/academic/classes" },
        { icon: <FaChalkboardTeacher />, label: t("navbar.academic.teachers"), href: "/system/academic/teachers" },
        { icon: <MdOutlineCategory />, label: t("navbar.academic.modalities"), href: "/system/academic/modalities" },
        { icon: <TbContract />, label: t("navbar.academic.plans"), href: "/system/academic/plans" },
        // { icon: <LuChartSpline />, label: t("navbar.academic.academicReports"), href: "/system/academic/reports" },
      ],
    },
    {
      icon: <RiMoneyDollarCircleLine/>,
      label: "PDV",
       href: "/system/point-of-sale"
    },
    // {
    //   icon: <TbCalendarEvent />,
    //   label: t("navbar.events"),
    // },
    {
      icon: <TbReportMoney />,
      label: t("navbar.financial.label"),
      subitems: [
        // { icon: <MdOutlineSpaceDashboard />, label: t("navbar.financial.financialSummary"), href: "/system/financial/resume" },
        { icon: <PiMoneyWavy />, label: t("navbar.financial.financialManager"), href: "/system/financial/manager/" },
        { icon: <TbBuildingBank />, label: t("navbar.financial.financialAccounts"), href: "/system/financial/bank-accounts" },
        { icon: <MdPayment />, label: t("navbar.financial.financialPaymentMethods"), href: "/system/financial/payment-methods" },
        { icon: <MdOutlineCategory />, label: t("navbar.financial.financialCategories"), href: "/system/financial/categories" },
        { icon: <BsBox />, label: t("navbar.financial.financialGroups"), href: "/system/financial/groups" },
        // { icon: <LuChartSpline />, label: t("navbar.financial.financialReports"), href: "/system/financial/reports" },
      ],
    },
    // {
    //   icon: <BsBox />,
    //   label: t("navbar.inventory.label"),
    //   subitems: [
    //     { icon: <BsBox />, label: t("navbar.inventory.inventoryControl"), href: "/system/estoque/controle" },
    //     { icon: <FiInbox />, label: t("navbar.inventory.orders"), href: "/system/estoque/encomendas" },
    //     { icon: <MdBookmarkBorder />, label: t("navbar.inventory.products"), href: "/system/estoque/produtos" },
    //     { icon: <LuChartSpline />, label: t("navbar.inventory.inventoryReports"), href: "/system/estoque/reports" },
    //   ],
    // },
    {
      icon: <IoExtensionPuzzleOutline />,
      label: t("navbar.others.label"),
      subitems: [
        { icon: <TbContract />, label: "Modelos de Contratos", href: "/system/others/contract-models" },
        { icon: <MdOutlineBusinessCenter />, label: t("navbar.others.suppliers"), href: "/system/others/suppliers" },
      ]
    }
  ];

  return menuData;
};

export default useMenuData;
