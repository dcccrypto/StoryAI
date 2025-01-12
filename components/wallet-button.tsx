'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

export default function WalletButton() {
  const { publicKey } = useWallet();

  return (
    <div className="fixed top-4 right-4 z-50">
      <WalletMultiButton className="wallet-adapter-button" />
    </div>
  );
} 