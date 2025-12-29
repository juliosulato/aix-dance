"use server";

import { signIn } from "@/auth";
import { getErrorMessage } from "@/utils/getErrorMessage";

export async function loginWithCredentials(formData: FormData) {
  const userInput = formData.get("user");
  const passwordEntry = formData.get("password");
  const remember = formData.get("remember") === "on";

  if (typeof passwordEntry !== "string" || passwordEntry.trim().length < 8) {
    return {
      success: false,
      error: "Credenciais inválidas.",
    };
  }

  const password = passwordEntry;
  const email = typeof userInput === "string" ? userInput.trim() : "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    return {
      success: false,
      error: "E-mail inválido.",
    };
  }

  try {
    await signIn("credentials", {
      email,
      password: password,
      remember,
      redirect: false,
    });

    return {
      success: true,
    };
  } catch (error: unknown) {
    if ((error as any)?.type === "CredentialsSignin") {
      return {
        success: false,
        error: getErrorMessage(error, "Credenciais inválidas."),
      };
    }
    return {
      success: false,
      error: "Erro interno do servidor.",
    };
  }
}
