import { auth } from "@/auth"
import { redirect } from "next/navigation";

export default async function System() {
    const session = await auth();
    if (!session) {
        return <p>Acesso negado</p>;
    }

    const userRole = session?.user?.role;

    if (userRole === "ADMIN" || userRole === "STAFF") {
        redirect(`/system/academic/students`);
    }

    if (userRole === "TEACHER") {
        redirect(`/system/teachers/classes`);
    }
    return (
        <main>
        </main>
    )
}