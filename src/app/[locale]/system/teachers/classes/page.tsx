import { auth } from "@/auth";
import Breadcrumps from "@/components/ui/Breadcrumps";
import { Button } from "@mantine/core";

async function getAllClasses(tenancyId: string, teacherId: string) {
    const classes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/classes`).then((res) => {
        if (!res.ok) {
            throw new Error("Failed to fetch classes");
        }
        return res.json();
    });

    const teacherClasses = classes.filter((c: any) => c.teacherId === teacherId).filter((c: any) => c.active);

    return { teacherClasses, classes: classes.filter((c: any) => c.active) };
}
export default async function TeachersClassesPage() {
    const session = await auth();

    const { teacherClasses, classes } = await getAllClasses(session?.user.tenancyId!, session?.user.id!);

    return (
        <main className="flex flex-col gap-4">
                  <Breadcrumps
                    items={[
                      "Turmas",
            
                    ]}
                    menu={[{
                      label: "Turmas", href: "/system/teachers/classes",
                    }
]}
                  />
            <div className="flex flex-col gap-4">
                <h1 className="text-lg md:text-3xl font-bold">Minhas Turmas</h1>
                {teacherClasses.length === 0 && <p>Você não está atribuído a nenhuma turma.</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 mb-8">
                    {teacherClasses.map((c: any) => (
                        <div key={c.id} className="bg-white p-4 2xl:p-6 rounded-2xl shadow flex flex-col gap-2" >
                            <h2 className="text-lg font-semibold">{c.name}</h2>
                            {c.online ? <p>Online</p> : <p>Presencial</p>}
                            <hr className="border-neutral-300" />
                            <p><strong>Modalidade:</strong> {c.modality.name}</p>
                            <p><strong>Professor:</strong> {c.teacher.firstName + " " + c.teacher.lastName}</p>
                            <Button component="a" href={`/system/teachers/classes/${c.id}`} radius={"md"} className="font-bold" fullWidth>Fazer Chamada</Button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <h2 className="text-lg md:text-2xl font-semibold">Todas as Turmas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 mb-8">
                    {classes.map((c: any) => (
                        <div key={c.id} className="bg-white p-4 2xl:p-6 rounded-2xl shadow flex flex-col gap-2" >
                            <h2 className="text-lg font-semibold">{c.name}</h2>
                            {c.online ? <p>Online</p> : <p>Presencial</p>}
                            <hr className="border-neutral-300" />
                            <p><strong>Modalidade:</strong> {c.modality.name}</p>
                            <p><strong>Professor:</strong> {c.teacher.firstName + " " + c.teacher.lastName}</p>
                            <Button component="a" href={`/system/teachers/classes/${c.id}`} radius={"md"} className="font-bold" fullWidth>Substituir Aula</Button>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}