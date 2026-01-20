import Image from "next/image";
import illustration from "@/assets/images/login.png";
import Login from "@/components/Login";
import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Realizar Login",
};

export default async function LoginPage() {
  const { user } = await requireAuth("/system");

  
  return (
    <main className="relative flex flex-col gap-4 md:h-screen xl:overflow-hidden">
      <Image
        src={illustration}
        alt=""
        className="hidden lg:block order-2 md:-order-1 object-center object-cover w-[60%]!"
        fill
        quality={100}
        loading="eager"
      />
      <Login />
    </main>
  );
}
