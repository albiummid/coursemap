import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePlaygroundStore } from '@/stores/usePlaygroundStore';
import PlaygroundPanel from './PlaygroundPanel';

export default function PlaygroundModal() {
  const { isOpen, close } = usePlaygroundStore();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [close]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        />
        
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-6xl h-[85vh] bg-[#1e1e1e] rounded-2xl shadow-2xl border border-white/10 overflow-hidden pointer-events-auto flex flex-col"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#1a1a1a]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <code className="text-amber-500 font-bold text-xs">JS</code>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Code Playground</h3>
                <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium">Safe Sandbox Environment</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={close}
                className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white/80 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Panel */}
          <div className="flex-1 min-h-0">
            <PlaygroundPanel />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
