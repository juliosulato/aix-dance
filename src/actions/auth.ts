"use server";

import { signIn } from "@/auth";

export async function loginWithCredentials(formData: FormData) {
  const userInput = formData.get("user") as string;
  const password = formData.get("password") as string;
  const remember = formData.get("remember") === "on";

  try {
    await signIn("credentials", {
      email: userInput,
      password: password,
      remember,
      redirect: false,
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Erro no login:", error);
    if (error?.type === "CredentialsSignin") {
      return {
        success: false,
        error: "Credenciais inválidas.",
      };
    }
    return {
      success: false,
      error: "Erro interno do servidor.",
    };
  }
}
