import { motion } from "framer-motion";

interface AuthProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="z-10 w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}