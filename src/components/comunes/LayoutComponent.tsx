"use client";
import { Header } from "@/components/inicio/Header";
import SessionWrapper from "@/components/providers/SessionWrapper";
import type { Session } from "next-auth";

type ConfiguracionHeader = {
  name?: string | null;
  logo?: string | null;
};

export default function LayoutComponent({
  children,
  session,
  config,
}: {
  children: React.ReactNode;
  session: Session | null;
  config?: ConfiguracionHeader | null;
}) {
  return (
    <SessionWrapper>
      <Header config={config} />
      {children}
    </SessionWrapper>
  );
}