import ClassDetails from "@/components/(teachers)/ClassDetails";

export default async function TeacherClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main>
      <ClassDetails
        classId={id}
      />
    </main>
  );
}