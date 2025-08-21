import { auth } from "@/auth"

export default async function Sistema() {
    const session = await auth();

    return (
        <main>
            <h1>Sistema</h1>
            {JSON.stringify(session)}
        </main>
    )
}