import ListAllUsers from "@/components/(settings)/users/ListAllUsers";
import Breadcrumps from "@/components/ui/Breadcrumps";

export default async function UsersPage() {

    return (
        <main>
            <Breadcrumps
                items={["Início", "Configurações"]}
                menu={[
                    { label: "Minha Academia", href: "/system/settings/company" },
                    { label: "Usuários", href: "/system/settings/users" },
                ]}
            />
            <ListAllUsers />
        </main>
    );
}