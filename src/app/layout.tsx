'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import WalletContextProvider from './providers/WalletContextProvider';
import WalletStyles from '@/components/wallet-styles';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletStyles />
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}
