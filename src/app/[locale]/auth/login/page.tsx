import Image from "next/image";
import illustration from "@/assets/images/login.avif";
import Login from "@/components/Login";

export default function LoginPage() {
    return (
        <main className="relative flex flex-col gap-4 md:h-screen xl:overflow-hidden">
            <Image src={illustration} alt="" className="hidden lg:block order-2 md:-order-1 object-center object-cover !w-[60%]" fill quality={100} loading="eager"/>
            <Login />
        </main>
    )
}