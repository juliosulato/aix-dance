// Início
import { GrHomeRounded } from "react-icons/gr";
import { MdOutlineBusinessCenter, MdPayment } from "react-icons/md";
import { FiCalendar } from "react-icons/fi";
import { IoExtensionPuzzleOutline } from "react-icons/io5";

// CRM
import { LuGraduationCap } from "react-icons/lu";

// Acadêmico
import { FaRegUser, FaChalkboardTeacher } from "react-icons/fa";
import { MdGroups } from "react-icons/md";

// Eventos
import { TbReportMoney, TbBuildingBank, TbContract } from "react-icons/tb";

// Financeiro
import { MdOutlineCategory } from "react-icons/md";
import { PiMoneyWavy } from "react-icons/pi";

// Financeiro e Estoque
import { BsBox } from "react-icons/bs";

import { RiMoneyDollarCircleLine } from "react-icons/ri";

const useMenuData = () => {
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
      label: "Início",
      subitems: [
        // { icon: <AiOutlineDashboard />, label: "Dashboard", href: "/system/dashboard" },
        { icon: <FiCalendar />, label: "Grade de Aulas", href: "/system/home/class-schedule" },
        // { icon: <MdOutlineViewAgenda />, label: "Agenda", href: "/system/calendar" },
        // { icon: <IoExtensionPuzzleOutline />, label: "Integrações", href: "/system/integracoes" },
        // { icon: <IoMdHelpCircleOutline />, label: "Ajuda", href: "/system/help" },
      ],
    },
    // {
    //   icon: <LuBrain />,
    //   label: "CRM",
    //   subitems: [
    //     { icon: <LuMap />, label: "Gerenciamento", href: "/system/crm/gerenciamento" },
    //     { icon: <LuMessageCircleMore />, label: "Conversas", href: "/system/crm/conversas" },
    //     { icon: <LuChartSpline />, label: "Relatórios", href: "/system/crm/reports" },
    //   ],
    // },
    {
      icon: <LuGraduationCap />,
      label: "Acadêmico",
      subitems: [
        { icon: <FaRegUser />, label: "Alunos", href: "/system/academic/students" },
        { icon: <MdGroups />, label: "Turmas", href: "/system/academic/classes" },
        { icon: <FaChalkboardTeacher />, label: "Professores", href: "/system/academic/teachers" },
        { icon: <MdOutlineCategory />, label: "Modalidades", href: "/system/academic/modalities" },
        { icon: <TbContract />, label: "Planos", href: "/system/academic/plans" },
        // { icon: <LuChartSpline />, label: "Relatórios", href: "/system/academic/reports" },
      ],
    },
    {
      icon: <RiMoneyDollarCircleLine/>,
      label: "PDV",
       href: "/system/point-of-sale"
    },
    // {
    //   icon: <TbCalendarEvent />,
    //   label: "Eventos",
    // },
    {
      icon: <TbReportMoney />,
      label: "Financeiro",
      subitems: [
        // { icon: <MdOutlineSpaceDashboard />, label: "Resumo", href: "/system/financial/resume" },
        { icon: <PiMoneyWavy />, label: "Gerenciador", href: "/system/financial/manager/" },
        { icon: <TbBuildingBank />, label: "Contas Bancárias", href: "/system/financial/banks" },
        { icon: <MdPayment />, label: "Formas de Recebimento", href: "/system/financial/forms-of-receipt" },
        { icon: <MdOutlineCategory />, label: "Categorias", href: "/system/financial/categories" },
        { icon: <BsBox />, label: "Grupos", href: "/system/financial/category-groups" },
        // { icon: <LuChartSpline />, label: "Relatórios", href: "/system/financial/reports" },
      ],
    },
  //  {
  //    icon: <BsBox />,
  //    label: "Estoque",
  //    subitems: [
  //      { icon: <MdBookmarkBorder />, label: "Produtos", href: "/system/inventory/products" },
  //      { icon: <FiInbox />, label: "Encomendas", href: "/system/inventory/orders" },
  //     //  { icon: <LuChartSpline />, label: "Relatórios", href: "/system/inventory/reports" },
  //    ],
  //  },
    {
      icon: <IoExtensionPuzzleOutline />,
      label: "Outros",
      subitems: [
        { icon: <TbContract />, label: "Modelos de Contratos", href: "/system/others/contract-models" },
        { icon: <MdOutlineBusinessCenter />, label: "Fornecedores", href: "/system/others/suppliers" },
      ]
    }
  ];

  return menuData;
};

export default useMenuData;
