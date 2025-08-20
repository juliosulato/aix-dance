"use client";

import LogoSVG from "@/components/Logo";
import { Button, Checkbox, PasswordInput, TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import { FaRegUser } from "react-icons/fa";
import { PiPasswordLight } from "react-icons/pi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { FormEvent, useEffect, useState } from "react";
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation";
import { notifications } from '@mantine/notifications';
import { loginWithCredentials } from "@/actions/auth";

export default function Login() {
    const t = useTranslations("login");

    const [error, setError] = useState<string>("");
    const router = useRouter();

    const handleLoginWithCredentials = async (ev: FormEvent) => {
        ev.preventDefault();
        notifications.show({ title: "Não saia da página!", message: "Estamos realizando o seu login...", color: "yellow", withBorder: true, radius: "lg", position: "bottom-center"})
        setError("");

        const formData = new FormData(ev.currentTarget as HTMLFormElement);

        try {
            const result = await loginWithCredentials(formData);

            if (result.success) {
                router.push("/sistema");
            } else {
                setError((result as any).error);
            }
        } catch (err) {
            console.error("Erro no login:", err);
            setError("Erro inesperado. Tente novamente.");
        }
    };

    const handleSocialLogin = async (provider: "google" | "facebook") => {
        try {
            await signIn(provider, {
                redirectTo: "/sistema/"
            });
        } catch (error) {
            console.error(`Erro no login com ${provider}:`, error);
        }
    };

    useEffect(() => {

        if (error) {
            notifications.show({ title: "Erro ao realizar login.", message: error, color: "red", withBorder: true, radius: "lg", position: "bottom-center"})
        }
    }, [error]);


    return (
        <section className="flex flex-col items-center  gap-6 text-center p-5 lg:p-12 lg:overflow-auto lg:absolute lg:top-0 lg:right-0 lg:w-[50%] xl:w-[42%] md:bg-white xl:p-20 rounded-tl-4xl lg:rounded-bl-4xl lg:h-screen ">
            <div className="flex items-center justify-center flex-col gap-4 w-full min-w-full">
                <LogoSVG width={"100px"} height="fit-content" />
                <h1 className="text-4xl font-bold text-primary">{t("title")}</h1>
                <h2 className="whitespace-pre-line text-neutral-800">
                    {t("subtitle")}
                </h2>
            </div>

            <form onSubmit={handleLoginWithCredentials} className="w-full min-w-full max-w-md space-y-4 text-left flex flex-col gap-2 my-8" >

                <TextInput
                    id="user"
                    name="user"
                    label={t("form.user.label")}
                    placeholder={t("form.user.placeholder")}
                    className="w-full mb-4"
                    size="md"
                    leftSection={<FaRegUser />}
                    required
                />

                <div className="flex flex-col gap-0">
                    <PasswordInput
                    id="password"
                    name="password"
                    label={t("form.password.label")}
                    placeholder={t("form.password.placeholder")}
                    className="w-full mb-4"
                    size="md"
                    leftSection={<PiPasswordLight />}
                    required
                />
                <a href="/forgot-password" className="text-sm text-right w-full hover:underline text-neutral-600">{t("form.forgotPassword")}</a>
                </div>

                <Checkbox
                    id="remember"
                    name="remember"
                    label={t("form.remember")}
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
                >{t("form.submit")}</Button>
            </form>

            <p className="text-sm">
                {t("or.createAccount")} <a href="/auth/create-account" className="underline text-primary">{t("or.createAccountLink")}</a>
            </p>

            <div className="flex items-center gap-2 w-full">
                <hr className="flex-1 border-neutral-500" />
                <span className="px-4 text-gray-500">{t("or.text").toUpperCase()}</span>
                <hr className="flex-1 border-neutral-500" />
            </div>

            <div className="flex flex-col gap-3 w-full">
                <button 
                    onClick={() => handleSocialLogin("google")}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition hover:scale-105 font-medium"
                >
                    <FcGoogle className="h-8 w-8" />
                    {t("or.google")}
                </button>
                <button 
                    onClick={() => handleSocialLogin("facebook")}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition hover:scale-105 font-medium"
                >
                    <FaFacebook className="text-blue-500 w-8 h-8" />
                    {t("or.facebook")}
                </button>
            </div>

            <p className="text-sm text-gray-600 max-w-md">
                {t("terms.text")}
                <a href="/terms" className="text-primary underline">
                    {t("terms.terms")}
                </a>
                {t("terms.link1")}
                <a href="/privacy" className="text-primary underline">
                    {t("terms.privacy")}
                </a>
                .
            </p>
        </section>
    );
}