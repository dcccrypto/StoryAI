'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import MatrixRain from './matrix-rain';
import { Prompt } from './shared/Prompt';

interface MatrixWalletPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MatrixWalletPopup({ isOpen, onClose }: MatrixWalletPopupProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { publicKey } = useWallet();

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (publicKey) {
      onClose();
    }
  }, [publicKey, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100]">
      {/* Backdrop with matrix rain */}
      <div className="absolute inset-0 bg-black bg-opacity-90">
        <MatrixRain opacity={0.1} />
      </div>

      {/* Popup content */}
      <div 
        className={`
          relative z-10
          bg-[#0a0a0a] border-2 border-[#3af23a]
          w-[90%] max-w-lg
          transform transition-all duration-500
          ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          shadow-[0_0_30px_rgba(58,242,58,0.3)]
        `}
      >
        {/* Header */}
        <div className="border-b border-[#3af23a] p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-[#3af23a] text-xl font-mono animate-pulse">
              QUANTUM SECURE CONNECTION
            </h2>
            <button 
              onClick={onClose}
              className="text-[#3af23a] hover:text-[#3af23a]/70 font-mono"
            >
              [ ABORT ]
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-2 font-mono">
            <p className="text-[#3af23a] animate-pulse">
              <Prompt />Initializing connection protocol...
            </p>
            <p className="text-[#3af23a]/70 typewriter">
              <Prompt />Select wallet to establish quantum-encrypted tunnel
            </p>
          </div>

          <div className="flex justify-center py-4">
            <WalletMultiButton />
          </div>

          {/* Status indicators */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono text-[#3af23a]/60">
            <div className="space-y-1">
              <p><Prompt />ENCRYPTION: ACTIVE</p>
              <p><Prompt />PROTOCOL: QUANTUM</p>
            </div>
            <div className="space-y-1">
              <p><Prompt />NETWORK: MAINNET</p>
              <p><Prompt />STATUS: AWAITING</p>
            </div>
          </div>
        </div>

        {/* Scanlines effect */}
        <div className="absolute inset-0 pointer-events-none terminal-scanline opacity-10" />
      </div>
    </div>
  );
} 