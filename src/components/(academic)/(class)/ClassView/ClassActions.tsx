import { FaEdit } from "react-icons/fa";
import { BiArchiveIn } from "react-icons/bi";
import { PiStudent } from "react-icons/pi";

interface ClassActionsProps {
  onUpdate: () => void;
  onAssign: () => void;
  onArchive: () => void;
}

export function ClassActions({
  onUpdate,
  onAssign,
  onArchive,
}: ClassActionsProps) {
  return (
    <div className="flex gap-4 md:gap-6">
      <button
        className="text-orange-500 flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
        onClick={onArchive}
        type="button"
      >
        <BiArchiveIn />
        <span>Arquivar</span>
      </button>
      <button
        className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
        onClick={onUpdate}
        type="button"
      >
        <FaEdit />
        <span>Atualizar</span>
      </button>
      <button
        className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
        onClick={onAssign}
        type="button"
      >
        <PiStudent />
        <span>Atribuir</span>
      </button>
    </div>
  );
}
