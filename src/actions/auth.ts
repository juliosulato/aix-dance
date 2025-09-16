"use server";

import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { compareHashedPasswords } from "@/utils/passwords";

export async function loginWithCredentials(formData: FormData) {
    const userInput = formData.get("user") as string;
    const password = formData.get("password") as string;
    const remember = formData.get("remember") === "on";

    try {
        let user = await prisma.user.findFirst({
                where: {
                    email: userInput
                }
            });
        if (!user) {
            return {
                success: false,
                error: "Este usuário não existe."
            };
        }

        const isPasswordValid = await compareHashedPasswords(password, user.password);

        if (!isPasswordValid) {
            return {
                success: false,
                error: "Senha inválida."
            };
        }

        await signIn("credentials", {
            emal: userInput,
            password: password,
            remember,
            redirect: false,
        });

        return {
            success: true
        };

    } catch (error) {
        console.error("Erro no login:", error);
        return {
            success: false,
            error: "Erro interno do servidor."
        };
    }
}