"use client";

import LogoSVG from "@/components/Logo";
import { Button, Checkbox, PasswordInput, TextInput } from "@mantine/core";
import { FaRegUser } from "react-icons/fa";
import { PiPasswordLight } from "react-icons/pi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/schemas/login";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

export default function Login() {
  const router = useRouter();
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = async (data: any) => {
    setIsGlobalLoading(true);

    await signIn.email(
      {
        email: data.email,
        password: data.password,
        rememberMe: data.remember, 
      },
      {
        onSuccess: () => {
          router.push("/system/");
          router.refresh();
        },
        onError: (ctx) => {
          setIsGlobalLoading(false);
          setError("root", { message: ctx.error.message });

          notifications.show({
            title: "Erro no Login",
            message: ctx.error.message,
            color: "red",
          });
        },
      }
    );
  };

  const handleSocialLogin = (provider: "facebook" | "google") => {
    notifications.show({
      message: "Esta opção ainda não está disponível.",
      color: "yellow",
      withBorder: true,
      radius: "lg",
      position: "bottom-center",
      autoClose: 3000,
    });
  };

  return (
    <section className="flex flex-col items-center  gap-6 text-center p-5 lg:p-12 lg:overflow-auto lg:absolute lg:top-0 lg:right-0 lg:w-[50%] xl:w-[42%] md:bg-white xl:p-20 rounded-tl-4xl lg:rounded-bl-4xl lg:h-screen relative">
      <div className="flex items-center justify-center flex-col gap-4 w-full min-w-full">
        <LogoSVG width={"100px"} height="fit-content" />
        <h1 className="text-4xl font-bold text-primary">
          Bem-Vindo ao AIX Dance!
        </h1>
        <h2 className="whitespace-pre-line text-neutral-800">
          O sistema ideal para escolas de dança. Fácil de usar, feito sob medida
          e com tudo que você precisa para crescer.
        </h2>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full min-w-full max-w-md space-y-4 text-left flex flex-col gap-2 my-8"
      >
        <TextInput
          label="Digite seu e-mail:"
          placeholder="seuemail@example.com"
          className="w-full mb-4"
          size="md"
          leftSection={<FaRegUser />}
          required
          error={errors?.email?.message}
          {...register("email")}
        />

        <PasswordInput
          label="Digite sua senha:"
          placeholder="********"
          className="w-full mb-4"
          size="md"
          leftSection={<PiPasswordLight />}
          error={errors?.password?.message}
          required
          {...register("password")}
        />
        <div className="flex gap-0">
          <Checkbox
            label="Lembrar usuário"
            className="mb-4"
            error={errors?.remember?.message}
            defaultChecked
            {...register("remember")}
          />
          <a
            href="/forgot-password"
            className="text-sm text-right w-full hover:underline text-neutral-600"
          >
            Esqueci minha senha
          </a>
        </div>

        <Button
          type="submit"
          color="#7439FA"
          radius={"lg"}
          size="xl"
          disabled={isGlobalLoading}
          fullWidth={false}
          className="text-base! w-full md:w-fit!"
        >
          Realizar Login
        </Button>
      </form>
      <p className="text-sm">
        Ainda não tem uma conta?{" "}
        <a href="/auth/create-account" className="underline text-primary">
          Crie uma.
        </a>
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
    </section>
  );
}
