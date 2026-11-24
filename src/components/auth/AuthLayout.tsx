import FondoRegistro from "@/components/auth/FondoRegistro";

interface AuthProps {
  children: React.ReactNode;
  imagenFondo?: string;
}

export default function AuthLayout({ children, imagenFondo }: AuthProps) {
  return (
    <main className="relative isolate flex min-h-svh w-full items-center justify-center bg-[var(--page-bg)] px-4 pt-20 pb-4 text-[var(--page-bg-foreground)] sm:pt-24 sm:pb-8">
      <FondoRegistro imagen={imagenFondo} />
      {children}
    </main>
  );
}
