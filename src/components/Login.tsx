"use client";

import LogoSVG from "@/components/Logo";
import { Button, Checkbox, LoadingOverlay, PasswordInput, TextInput } from "@mantine/core";
import { FaRegUser } from "react-icons/fa";
import { PiPasswordLight } from "react-icons/pi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { FormEvent, useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { notifications } from '@mantine/notifications';
import { loginWithCredentials } from "@/actions/auth";
import { useDisclosure } from "@mantine/hooks";

export default function Login() {
    const [visible, { open, close }] = useDisclosure(false);

    const [error, setError] = useState<string>("");
    const router = useRouter();

    const session = useSession();

    useEffect(() => {
        if (session.status === "authenticated") {
            router.push("/system/academic/students");
        }
    }
    , [session.status, router]);

    const handleLoginWithCredentials = async (ev: FormEvent) => {
        ev.preventDefault();
        // evita múltiplos envios
        if (visible) return;
        open();

        notifications.show({
            title: "Não saia da página!",
            message: "Estamos realizando o seu login...",
            color: "yellow",
            withBorder: true,
            radius: "lg",
            position: "bottom-center",
            autoClose: 1000,
        });

        setError("");

        const formData = new FormData(ev.currentTarget as HTMLFormElement);

        try {
            const result = await loginWithCredentials(formData);

            if (result.success) {
                notifications.show({ title: "Login realizado com sucesso!", message: "Estamos te redirecionando para o sistema...", color: "green", withBorder: true, radius: "lg", position: "bottom-center", autoClose: 3000 });
                router.push("/system/");
            } else {
                setError((result as any).error);
            }
        } catch (err) {
            console.error("Erro no login:", err);
            setError("Erro inesperado. Tente novamente.");
        } finally {
            // garante que o overlay seja fechado mesmo em caso de erro
            close();
        }
    };

    const handleSocialLogin = async (provider: "google" | "facebook") => {
        return notifications.show({ message: "Função temporariamente desabilitada.", color: "yellow", withBorder: true, radius: "lg", position: "bottom-center", autoClose: 2000 });
        try {
            await signIn(provider, {
                redirectTo: "/system/academic/students"
            });
        } catch (error) {
            console.error(`Erro no login com ${provider}:`, error);
        }
    };

    useEffect(() => {
        if (error) {
            notifications.show({ title: "Erro ao realizar login.", message: error, color: "red", withBorder: true, radius: "lg", position: "bottom-center", autoClose: 500 });
        }
    }, [error]);


    return (
        <section className="flex flex-col items-center  gap-6 text-center p-5 lg:p-12 lg:overflow-auto lg:absolute lg:top-0 lg:right-0 lg:w-[50%] xl:w-[42%] md:bg-white xl:p-20 rounded-tl-4xl lg:rounded-bl-4xl lg:h-screen relative">
            <div className="flex items-center justify-center flex-col gap-4 w-full min-w-full">
                <LogoSVG width={"100px"} height="fit-content" />
                <h1 className="text-4xl font-bold text-primary">Bem-Vindo ao AIX Dance!</h1>
                <h2 className="whitespace-pre-line text-neutral-800">
                    O sistema ideal para escolas de dança.
 Fácil de usar, feito sob medida e com tudo que você precisa para crescer.
                </h2>
            </div>

            <form onSubmit={handleLoginWithCredentials} className="w-full min-w-full max-w-md space-y-4 text-left flex flex-col gap-2 my-8" >

                <TextInput
                    id="user"
                    name="user"
                    label="Digite seu usuário ou e-mail:"
                    placeholder="seuusuario"
                    className="w-full mb-4"
                    size="md"
                    leftSection={<FaRegUser />}
                    required
                />

                <div className="flex flex-col gap-0">
                    <PasswordInput
                        id="password"
                        name="password"
                        label="Digite sua senha:"
                        placeholder="********"
                        className="w-full mb-4"
                        size="md"
                        leftSection={<PiPasswordLight />}
                        required
                    />
                    <a href="/forgot-password" className="text-sm text-right w-full hover:underline text-neutral-600">Esqueci minha senha</a>
                </div>

                <Checkbox
                    id="remember"
                    name="remember"
                    label="Lembrar usuário"
                    className="mb-4"
                    size="md"
                    defaultChecked
                />

                <Button
                    type="submit"
                    color="#7439FA"
                    radius={"lg"}
                    size="xl"
                    fullWidth={false}
                    className="!text-base w-full md:!w-fit"
                    loading={visible}
                >Realizar Login</Button>
            </form>
            <p className="text-sm">
                Ainda não tem uma conta? <a href="/auth/create-account" className="underline text-primary">Crie uma.</a>
            </p>

            <div className="flex items-center gap-2 w-full">
                <hr className="flex-1 border-neutral-500" />
                <span className="px-4 text-gray-500">OU</span>
                <hr className="flex-1 border-neutral-500" />
            </div>

            <div className="flex flex-col gap-3 w-full">
                <button
                    onClick={() => handleSocialLogin("google")}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition hover:scale-105 font-medium"
                >
                    <FcGoogle className="h-8 w-8" />
                    Continuar com o Google
                </button>
                <button
                    onClick={() => handleSocialLogin("facebook")}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition hover:scale-105 font-medium"
                >
                    <FaFacebook className="text-blue-500 w-8 h-8" />
                    Continuar com o Facebook
                </button>
            </div>

            <p className="text-sm text-gray-600 max-w-md">
                Ao continuar, você concorda com nossos 
                <a href="/terms" className="text-primary underline">
                    Termos de Serviço
                </a>
                 e 
                <a href="/privacy" className="text-primary underline">
                    Política de Privacidade
                </a>
                .
            </p>
            <LoadingOverlay
                visible={visible}
                zIndex={1000}
                overlayProps={{ radius: 'sm', blur: 2 }}
                loaderProps={{ color: 'violet', type: 'dots' }}
                className="!fixed"
            />
        </section>
    );
}