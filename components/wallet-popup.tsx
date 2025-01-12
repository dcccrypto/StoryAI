'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';

interface WalletPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletPopup({ isOpen, onClose }: WalletPopupProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { publicKey } = useWallet();

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  // Auto-close when wallet is connected
  useEffect(() => {
    if (publicKey) {
      onClose();
    }
  }, [publicKey, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div 
        className={`
          bg-[#0a0a0a] border border-[#3af23a] p-6 rounded-none max-w-md w-full mx-4
          transform transition-all duration-300
          ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          shadow-[0_0_20px_rgba(58,242,58,0.3)]
          relative overflow-hidden
        `}
      >
        {/* Matrix rain overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="matrix-rain"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[#3af23a] text-xl font-mono animate-pulse">
              > INITIALIZING WALLET CONNECTION
            </h2>
            <button 
              onClick={onClose}
              className="text-[#3af23a] hover:text-[#3af23a]/70 font-mono text-xl"
            >
              [X]
            </button>
          </div>
          
          <div className="border-t border-[#3af23a]/30 my-4"></div>
          
          <div className="space-y-4 font-mono">
            <p className="text-[#3af23a]/70 text-sm typewriter">
              > SELECT WALLET PROVIDER TO ESTABLISH SECURE CONNECTION...
            </p>
            
            <div className="flex justify-center py-4">
              <WalletMultiButton />
            </div>
            
            <div className="text-[#3af23a]/50 text-xs">
              <p>> STATUS: AWAITING USER AUTHENTICATION</p>
              <p>> ENCRYPTION: ENABLED</p>
              <p>> PROTOCOL: WEB3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 