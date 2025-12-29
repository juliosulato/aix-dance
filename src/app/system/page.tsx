"use client";

import { useSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default function System() {
  const session = useSession();

  if (!session) {
    return <p>Acesso negado</p>;
  }
  
  const userRole = session?.data?.user?.role;

  if (userRole === "ADMIN" || userRole === "STAFF") {
    redirect(`/system/academic/students`);
  }

  if (userRole === "TEACHER") {
    redirect(`/system/teachers/classes`);
  }
  return <main></main>;
}
