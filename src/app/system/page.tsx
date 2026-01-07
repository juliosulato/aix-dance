import { requireAuth } from "@/lib/auth-guards";
import { Alert } from "@mantine/core";
import { BiInfoCircle } from "react-icons/bi";

export default async function System() {
  const { user } = await requireAuth();

  const getGreetingMessage = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Bom dia";
    }

    if (hour < 18) {
      return "Boa tarde";
    }

    return "Boa noite";
  };

  return (
    <main>
      <h1 className="font-bold text-3xl">
        {getGreetingMessage()}, {user.firstName}!
      </h1>
      <br />
      <Alert icon={<BiInfoCircle/>} color="yellow">Em breve haverá gráficos e outras informações importantes nesta tela.</Alert>
    </main>
  );
}
