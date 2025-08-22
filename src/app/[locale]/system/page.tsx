import { auth } from "@/auth"

export default async function Sistema() {
    const session = await auth();

    return (
        <main>
        </main>
    )
}