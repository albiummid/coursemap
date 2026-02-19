import { motion } from 'framer-motion';
import { Code2 } from 'lucide-react';
import { usePlaygroundStore } from '@/stores/usePlaygroundStore';

export default function PlaygroundFloat() {
  const { open, isOpen } = usePlaygroundStore();

  if (isOpen) return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => open()}
      className="fixed bottom-8 right-8 z-[90] w-14 h-14 bg-amber-500 rounded-2xl shadow-2xl shadow-amber-500/20 flex items-center justify-center text-black group transition-all"
    >
      <Code2 size={24} className="group-hover:rotate-12 transition-transform" />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-4 px-3 py-1.5 bg-[#1a1a1a] text-white text-xs font-semibold rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
        Open Playground
      </span>
      
      {/* Subtle pulse ring */}
      <span className="absolute inset-0 rounded-2xl border-2 border-amber-500/50 animate-ping opacity-20" />
    </motion.button>
  );
}
