// Início
import { GrHomeRounded } from "react-icons/gr";
import { AiOutlineDashboard } from "react-icons/ai";
import { MdOutlineViewAgenda } from "react-icons/md";
import { FiCalendar } from "react-icons/fi";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { IoExtensionPuzzleOutline } from "react-icons/io5";

// CRM
import { LuBrain, LuMap, LuMessageCircleMore, LuGraduationCap, LuChartSpline } from "react-icons/lu";

// Acadêmico
import { FaRegUser, FaChalkboardTeacher } from "react-icons/fa";
import { MdGroups } from "react-icons/md";

// Eventos
import { TbCalendarEvent, TbReportMoney, TbBuildingBank } from "react-icons/tb";

// Financeiro
import { MdOutlineSpaceDashboard, MdOutlineCategory } from "react-icons/md";
import { PiMoneyWavy } from "react-icons/pi";

// Estoque
import { FiInbox } from "react-icons/fi";
import { BsBox } from "react-icons/bs";
import { MdBookmarkBorder } from "react-icons/md";

import { useTranslations } from "next-intl";

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
        { icon: <FiCalendar />, label: t("navbar.home.classSchedule"), href: "/system/grade-de-aulas" },
        { icon: <MdOutlineViewAgenda />, label: t("navbar.home.calendar"), href: "/system/agenda" },
        { icon: <IoExtensionPuzzleOutline />, label: t("navbar.home.integrations"), href: "/system/integracoes" },
        { icon: <IoMdHelpCircleOutline />, label: t("navbar.home.help"), href: "/system/ajuda" },
      ],
    },
    {
      icon: <LuBrain />,
      label: t("navbar.crm.label"),
      subitems: [
        { icon: <LuMap />, label: t("navbar.crm.crmManagement"), href: "/system/crm/gerenciamento" },
        { icon: <LuMessageCircleMore />, label: t("navbar.crm.crmConversations"), href: "/system/crm/conversas" },
        { icon: <LuChartSpline />, label: t("navbar.crm.crmReports"), href: "/system/crm/relatorios" },
      ],
    },
    {
      icon: <LuGraduationCap />,
      label: t("navbar.academic.label"),
      subitems: [
        { icon: <FaRegUser />, label: t("navbar.academic.students"), href: "/system/academico/alunos" },
        { icon: <MdGroups />, label: t("navbar.academic.classes"), href: "/system/academico/turmas" },
        { icon: <FaChalkboardTeacher />, label: t("navbar.academic.teachers"), href: "/system/academico/professores" },
        { icon: <LuChartSpline />, label: t("navbar.academic.academicReports"), href: "/system/academico/relatorios" },
      ],
    },
    {
      icon: <TbCalendarEvent />,
      label: t("navbar.events"),
    },
    {
      icon: <TbReportMoney />,
      label: t("navbar.financial.label"),
      subitems: [
        { icon: <MdOutlineSpaceDashboard />, label: t("navbar.financial.financialSummary"), href: "/system/financeiro/resumo" },
        { icon: <PiMoneyWavy />, label: t("navbar.financial.financialManager"), href: "/system/financeiro/gerenciador" },
        { icon: <MdOutlineCategory />, label: t("navbar.financial.financialCategories"), href: "/system/financeiro/categorias" },
        { icon: <TbBuildingBank />, label: t("navbar.financial.financialAccounts"), href: "/system/financeiro/contas-bancarias" },
        { icon: <LuChartSpline />, label: t("navbar.financial.financialReports"), href: "/system/financeiro/relatorios" },
      ],
    },
    {
      icon: <BsBox />,
      label: t("navbar.inventory.label"),
      subitems: [
        { icon: <BsBox />, label: t("navbar.inventory.inventoryControl"), href: "/system/estoque/controle" },
        { icon: <FiInbox />, label: t("navbar.inventory.orders"), href: "/system/estoque/encomendas" },
        { icon: <MdBookmarkBorder />, label: t("navbar.inventory.products"), href: "/system/estoque/produtos" },
        { icon: <LuChartSpline />, label: t("navbar.inventory.inventoryReports"), href: "/system/estoque/relatorios" },
      ],
    },
  ];

  return menuData;
};

export default useMenuData;
