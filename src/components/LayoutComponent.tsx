"use client";
import { Header } from "@/components/Header";
import { BookingProvider } from "@/app/context/Booking";
import SessionWrapper from "./providers/SessionWrapper";

export default function LayoutComponent({
  children,
  session,
  config,
}: {
  children: React.ReactNode;
  session: any;
  config?: any;
}) {
  return (
    <SessionWrapper>
      <BookingProvider session={session}>
         <Header session={session} config={config} />
         {children}
      </BookingProvider>
    </SessionWrapper>
  );
}