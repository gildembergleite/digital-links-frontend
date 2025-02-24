'use client'
import Header from "@/components/header";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  useEffect(() => {
    if (isAuthenticated === false) {
     router.push("/")
    }
  }, [])
  return (
    <>
      <Header />
      {children}
    </>
  )
}