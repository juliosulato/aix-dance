import dayjs from "dayjs";
import { FaRegClock } from "react-icons/fa";
import { StudentFromApi } from "../StudentFromApi";

export default function StudentHistoryView(student: StudentFromApi) {
    const history = student.history.sort((a, b) => dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix());

    return (
        <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 text-center bg-white rounded-xl shadow-lg border border-neutral-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-2 text-left">Histórico do Aluno</h2>
            {history.map((entry) => (
                <div key={entry.id} className="mb-2 p-4 border-l-4 border-blue-400 bg-blue-50 rounded-lg shadow-sm">
                    <div className="flex items-center text-sm text-blue-700 mb-2">
                        <FaRegClock className="mr-2" />
                        {dayjs(entry.createdAt).format("DD/MM/YYYY HH:mm")}
                    </div>
                    <div className="text-gray-800 whitespace-pre-wrap">{entry.description}</div>
                </div>
            ))}

            <span className="text-sm text-gray-500 mt-4">
                Aluno(a) criado em {dayjs(student.createdAt).format("DD/MM/YYYY")}
            </span>
        </div>
    )
}