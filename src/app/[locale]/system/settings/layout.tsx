import { auth } from "@/auth";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    return children;
}