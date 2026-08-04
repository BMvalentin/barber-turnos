"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import CookieModal from "@/components/CookieModal";
import PrivacyModal from "@/components/PrivacyModal";
import TermsModal from "@/components/TermsModal";
import { Footer } from "./Footer";

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
  const [acceptedCookies, setAcceptedCookies] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const cookies = localStorage.getItem("cookiesAcknowledged");
    const terms = localStorage.getItem("termsAccepted");
    const privacySeen = localStorage.getItem("privacySeen");

    if (cookies) setAcceptedCookies(true);
    if (terms) setAcceptedTerms(true);

    if (cookies) {
      if (!privacySeen) {
        setTimeout(() => setPrivacyOpen(true), 500);
      } else if (!terms) {
        setTimeout(() => setTermsOpen(true), 500);
      }
    }

    setInitialized(true);
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
    setAcceptedTerms(true);
    setTermsOpen(false);
  };

  const isFullyAccepted = acceptedCookies && acceptedTerms;

  if (!initialized) return null;

  const hideFooter =
    pathname.startsWith("/admin") ||
    (pathname.startsWith("/turno") && isAdmin);

  return (
    <>
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

      {isFullyAccepted && children}

      {isFullyAccepted && !hideFooter && (
        <Footer
          barberiaNombre={barberiaNombre}
          logoUrl={logoUrl}
          descripcion={descripcion}
          localidad={localidad}
          openPrivacy={() => setPrivacyOpen(true)}
          openTerms={() => setTermsOpen(true)}
        />
      )}
    </>
  );
}