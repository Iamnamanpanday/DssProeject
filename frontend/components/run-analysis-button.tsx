'use client';

import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface RunAnalysisButtonProps {
  isLoading?: boolean;
  onClick: () => void;
}

export function RunAnalysisButton({ isLoading = false, onClick }: RunAnalysisButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={isLoading}
      className="w-full relative overflow-hidden rounded-lg px-6 py-4 font-semibold text-lg text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
      }}
    >
      {/* Animated glow effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100"
        animate={{
          boxShadow: [
            '0 0 16px rgba(59, 130, 246, 0.4)',
            '0 0 32px rgba(59, 130, 246, 0.6)',
            '0 0 16px rgba(59, 130, 246, 0.4)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative flex items-center justify-center gap-2">
        <motion.div
          animate={{
            rotate: isLoading ? 360 : 0,
          }}
          transition={{
            duration: isLoading ? 2 : 0,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <Zap className="w-5 h-5" />
        </motion.div>
        <span>{isLoading ? 'Analyzing...' : 'Run AI Analysis'}</span>
      </div>

      {/* Bottom shine effect */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.button>
  );
}
