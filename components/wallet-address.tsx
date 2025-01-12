'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';

export default function WalletAddress() {
  const { publicKey } = useWallet();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (publicKey) {
      setIsVisible(true);
    }
  }, [publicKey]);

  if (!publicKey || !isVisible) return null;

  const shortenedAddress = `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`;

  return (
    <div className="fixed top-4 right-4 z-50 font-mono text-sm">
      <div className="bg-[#0a0a0a] border border-[#3af23a] px-3 py-2 rounded-none shadow-[0_0_10px_rgba(58,242,58,0.2)]">
        <span className="text-[#3af23a]">{shortenedAddress}</span>
      </div>
    </div>
  );
} 