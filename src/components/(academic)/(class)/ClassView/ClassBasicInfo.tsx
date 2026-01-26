import InfoTerm from "@/components/ui/Infoterm";
import { Class, Modality } from "@/types/class.types";
import { User } from "@/types/user.types";

interface ClassBasicInfoProps {
  name: string;
  modality: Modality;
  teacher: User;
  assistant: User | null;
  online: boolean;
}

export function ClassBasicInfo({
  name,
  modality,
  teacher,
  assistant,
  online,
}: ClassBasicInfoProps) {
  return (
    <>
      <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 mb-2">
        Informações Básicas
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InfoTerm label="Nome">{name}</InfoTerm>
        <InfoTerm label="Modalidade">{modality.name}</InfoTerm>
        <InfoTerm label="Professor">
          {`${teacher.firstName} ${teacher.lastName}`}
        </InfoTerm>
        {assistant && (
          <InfoTerm label="Assistente">
            {`${assistant.firstName} ${assistant.lastName}`}
          </InfoTerm>
        )}
        <InfoTerm label="Online">{online ? "Sim" : "Não"}</InfoTerm>
      </div>
    </>
  );
}
