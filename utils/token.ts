import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { config } from './config';

export async function getTokenBalance(connection: Connection, walletAddress: PublicKey) {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletAddress, {
      programId: TOKEN_PROGRAM_ID,
    });

    const tokenAccount = tokenAccounts.value.find(
      account => account.account.data.parsed.info.mint === config.tokenAddress
    );

    if (tokenAccount) {
      return Number(tokenAccount.account.data.parsed.info.tokenAmount.uiAmount);
    }

    return 0;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return 0;
  }
} 