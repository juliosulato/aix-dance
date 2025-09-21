import { auth } from "@/auth";
import ClassDetails from "@/components/(teachers)/ClassDetails";
import Breadcrumps from "@/components/ui/Breadcrumps";

export default async function TeacherClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authSession = await auth();

  if (!authSession) {
    return <p>Você precisa estar autenticado para acessar esta página.</p>;
  };

  return (
    <main>
      <ClassDetails
        classId={id}
        session={authSession}
      />
    </main>
  );
}