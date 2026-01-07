import { Column } from "@/components/ui/DataView";
import { Class } from "@/types/class.types";
import { StudentComplete } from "@/types/student.types";
import { Avatar, Badge } from "@mantine/core";

export const studentsTableColumns: Column<StudentComplete>[] = [
  {
    key: "firstName",
    label: "Nome",
    sortable: true,
    render: (_, item) => (
      <div className="flex gap-1 flex-row text-nowrap items-center">
        <Avatar
          src={item.image}
          name={item.firstName}
          color="#7439FA"
          size="48px"
          radius="10px"
        />
        <span className="ml-2">{`${item.firstName} ${item.lastName}`}</span>
      </div>
    ),
  },
  {
    key: "classes",
    label: "Turmas",
    render: (value) =>
      Array.isArray(value) ? value.map((c: Class) => c.name).join(", ") : "-",
  },
  {
    key: "subscriptions",
    label: "Plano",
    render: (val) => {
      if (Array.isArray(val) && val.length > 0) {
        return (
          val
            .slice(0, 2)
            .map((sub) => sub?.plan?.name)
            .join(", ") + (val.length > 2 ? ", ..." : "")
        );
      }
      return "-";
    },
  },
  { key: "documentOfIdentity", label: "Documento" },
  {
    key: "canLeaveAlone",
    label: "Pode sair sozinho?",
    render: (val) => (val ? "Sim" : "Não"),
  },
  {
    key: "attendanceAverage",
    label: "Frequência",
    render: (value: number) => {
      if (!value) return "-";
      const color =
        value < 50
          ? "text-red-500"
          : value < 70
          ? "text-yellow-500"
          : value < 90
          ? "text-blue-500"
          : "text-green-500";
      return <span className={color}>{value}%</span>;
    },
  },
  {
    key: "cellPhoneNumber",
    label: "Telefone",
    render: (value) => (
      <a href={`https://wa.me/${value.replace(/\D/g, "")}`}>{value}</a>
    ),
  },
  {
    key: "active",
    label: "Status",
    render: (active) => (
      <Badge color={active ? "green" : "red"} variant="filled">
        {active ? "Ativo" : "Inativo"}
      </Badge>
    ),
  },
];
