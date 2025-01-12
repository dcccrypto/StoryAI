'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function WalletButton() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <WalletMultiButton className="wallet-adapter-button" />
    </div>
  );
} 