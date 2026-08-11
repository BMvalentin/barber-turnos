"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import CookieModal from "@/components/comunes/CookieModal";
import PrivacyModal from "@/components/comunes/PrivacyModal";
import TermsModal from "@/components/comunes/TermsModal";
import { Footer } from "@/components/inicio/Footer";

type AppGateProps = {
  children: React.ReactNode;
  barberiaNombre?: string | null;
  logoUrl?: string | null;
  descripcion?: string | null;
  localidad?: string | null;
  isAdmin?: boolean;
};

export default function AppGate({
  children,
  barberiaNombre,
  logoUrl,
  descripcion,
  localidad,
  isAdmin = false
}: AppGateProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [acceptedCookies, setAcceptedCookies] = useState(false);

  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  useEffect(() => {
    const cookies = localStorage.getItem("cookiesAcknowledged");
    const terms = localStorage.getItem("termsAccepted");
    const privacySeen = localStorage.getItem("privacySeen");

    if (cookies) setAcceptedCookies(true);

    if (cookies) {
      if (!privacySeen) {
        setTimeout(() => setPrivacyOpen(true), 500);
      } else if (!terms) {
        setTimeout(() => setTermsOpen(true), 500);
      }
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem("cookiesAcknowledged", "true");
    setAcceptedCookies(true);

    setTimeout(() => {
      const privacySeen = localStorage.getItem("privacySeen");

      if (!privacySeen) {
        setPrivacyOpen(true);
        localStorage.setItem("privacySeen", "true");
      } else if (!localStorage.getItem("termsAccepted")) {
        setTermsOpen(true);
      }
    }, 1000);
  };

  const handleClosePrivacy = () => {
    setPrivacyOpen(false);

    if (!localStorage.getItem("termsAccepted")) {
      setTimeout(() => setTermsOpen(true), 300);
    }
  };

  const handleAcceptTerms = () => {
    localStorage.setItem("termsAccepted", "true");
    setTermsOpen(false);
  };

  const esAdmin = session?.user?.role === "ADMIN" || isAdmin;

  const hideFooter =
    pathname.startsWith("/admin") ||
    (pathname.startsWith("/turno") && esAdmin);

  return (
    <>
      {children}

      {!hideFooter && (
        <Footer
          barberiaNombre={barberiaNombre}
          logoUrl={logoUrl}
          descripcion={descripcion}
          localidad={localidad}
          openPrivacy={() => setPrivacyOpen(true)}
          openTerms={() => setTermsOpen(true)}
        />
      )}

      {!acceptedCookies && (
        <CookieModal onAccept={handleAcceptCookies} />
      )}

      <PrivacyModal
        isOpen={privacyOpen}
        onClose={handleClosePrivacy}
      />

      <TermsModal
        isOpen={termsOpen}
        onClose={handleAcceptTerms}
      />
    </>
  );
}