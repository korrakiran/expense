import { motion } from 'framer-motion';
import { AppLogo } from '@/components/ui/app-logo';

export function BrandedLoadingScreen() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-black">
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(48,144,255,0.4),transparent_40%)]"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,48,144,0.3),transparent_40%)]"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <div className="absolute inset-0 bg-black/80" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <AppLogo />
        </motion.div>
        <div className="h-0.5 w-16 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-white w-full"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <p className="text-xs font-medium tracking-[0.2em] text-white/50">LOADING</p>
      </div>
    </main>
  );
}
