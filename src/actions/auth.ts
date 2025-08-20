"use server";

import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { compareHashedPasswords } from "@/utils/passwords";
import { redirect } from "next/navigation";

export async function loginWithCredentials(formData: FormData) {
    const userInput = formData.get("user") as string;
    const password = formData.get("password") as string;

    try {
        let user = null;

        if (userInput.includes("@")) {
            user = await prisma.user.findUnique({
                where: {
                    email: userInput
                }
            });
        } else {
            user = await prisma.user.findUnique({
                where: {
                    user: userInput
                }
            });
        }

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
            user: userInput,
            password: password,
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