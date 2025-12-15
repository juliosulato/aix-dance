"use client";
import Breadcrumps from "@/components/ui/Breadcrumps";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";

export default function AttendanceView({ attendanceId }: { attendanceId: string }) {
    const authSession = useSession().data;
    const tenancyId = authSession?.user.tenancyId;

    const { data: attendance, error } = useSWR<any>(
        tenancyId ? `/api/v1/tenancies/${tenancyId}/class-attendances/${attendanceId}` : null,
        fetcher
    );

    if (!authSession) {
        return <p>Você precisa estar autenticado para acessar esta página.</p>;
    };

    if (error) {
        return <p>Erro ao carregar a lista de chamada.</p>;
    }

    if (!attendance) {
        return <p>Carregando...</p>;
    }

    return (
        <main>
            <Breadcrumps
                items={[
                    "Minhas Turmas",
                    "Detalhes da Lista de Chamada"

                ]}
                menu={[{
                    label: "Minhas Turmas", href: "/system/teachers/classes",
                }, 
                
                { label: attendance.class.name, href: `/system/teachers/classes/${attendance.classId}` }]}
            />
            <h1 className="text-2xl font-bold mb-4">Detalhes da Lista de Chamada</h1>
            <p><strong>Data:</strong> {new Date(attendance.date).toLocaleString()}</p>
            <p><strong>Professor:</strong> {attendance.teacher.firstName} {attendance.teacher.lastName}</p>
            {attendance.isSubstitute && <p><em>Aula de substituição</em></p>}
            {attendance.notes && <p><strong>Notas:</strong> {attendance.notes}</p>}
            <h2 className="text-xl font-semibold mt-6 mb-2">Registros de Presença</h2>
            <table className="min-w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Aluno</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Presente</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Notas</th>
                    </tr>
                </thead>
                <tbody>
                    {attendance.attendanceRecords.map((record: any) => (
                        <tr key={record.studentId} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">{record.student.firstName} {record.student.lastName}</td>
                            <td className="border border-gray-300 px-4 py-2">{record.present ? "Sim" : "Não"}</td>
                            <td className="border border-gray-300 px-4 py-2">{record.notes || "-"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );    
}