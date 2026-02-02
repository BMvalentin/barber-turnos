"use client";
import { BookingModal } from "@/components/BookingModal";
import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

interface BookingProviderProps {
  children: React.ReactNode;
  session: any;
}

const BookingContext = createContext({ onOpen: () => {} });

export const BookingProvider = ({ children, session }: BookingProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleOpen = () => {
    if (!session) {
      return router.push("/login");
    } else {
      setIsOpen(true);
    }
  };

  return (
    <BookingContext.Provider value={{ onOpen: handleOpen }}>
      {children}
      <BookingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);