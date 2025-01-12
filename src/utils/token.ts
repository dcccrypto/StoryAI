import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction 
} from '@solana/spl-token';
import { config } from '../utils/config';

// Add error type
interface RPCError extends Error {
  code?: number;
  message: string;
}

const FALLBACK_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com',
  'https://ssc-dao.genesysgo.net',
  'https://solana-api.projectserum.com',
  'https://mainnet.rpcpool.com',
];

async function getWorkingConnection(): Promise<Connection> {
  // Try primary endpoint first
  try {
    const connection = new Connection(config.rpcEndpoint);
    await connection.getLatestBlockhash();
    return connection;
  } catch (error) {
    console.log('Primary RPC failed, trying fallbacks...');
  }

  // Try fallbacks
  for (const endpoint of FALLBACK_ENDPOINTS) {
    try {
      const connection = new Connection(endpoint);
      await connection.getLatestBlockhash();
      return connection;
    } catch (error) {
      continue;
    }
  }

  throw new Error('All RPC endpoints failed');
}

export async function getTokenBalance(connection: Connection, walletAddress: PublicKey) {
  try {
    const workingConnection = await getWorkingConnection();
    
    console.log('=== Token Balance Check ===');
    console.log('Token Address:', config.tokenAddress);
    console.log('Wallet Address:', walletAddress.toBase58());

    // First, let's check if the token exists
    try {
      const tokenInfo = await workingConnection.getParsedAccountInfo(
        new PublicKey(config.tokenAddress)
      );
      console.log('Token Info:', tokenInfo.value ? 'Found' : 'Not Found');
    } catch (error) {
      console.error('Error checking token info:', error);
    }

    // Get all token accounts
    const tokenAccounts = await workingConnection.getParsedTokenAccountsByOwner(walletAddress, {
      programId: TOKEN_PROGRAM_ID,
    });

    console.log('Found token accounts:', tokenAccounts.value.length);
    
    // Log all token accounts for debugging
    tokenAccounts.value.forEach((acc, index) => {
      const info = acc.account.data.parsed.info;
      console.log(`Token Account ${index + 1}:`, {
        mint: info.mint,
        owner: info.owner,
        balance: info.tokenAmount.uiAmount,
        decimals: info.tokenAmount.decimals
      });
    });

    // Try to find our specific token
    const tokenAccount = tokenAccounts.value.find(account => {
      const mint = account.account.data.parsed.info.mint;
      const matches = mint.toLowerCase() === config.tokenAddress.toLowerCase();
      console.log('Comparing:', {
        accountMint: mint,
        configMint: config.tokenAddress,
        matches
      });
      return matches;
    });

    if (tokenAccount) {
      const balance = Number(tokenAccount.account.data.parsed.info.tokenAmount.uiAmount);
      console.log('=== Found Token Account ===');
      console.log('Balance:', balance);
      console.log('Decimals:', tokenAccount.account.data.parsed.info.tokenAmount.decimals);
      return balance;
    } else {
      console.log('=== No Matching Token Account Found ===');
      console.log('Available mints:', tokenAccounts.value.map(acc => acc.account.data.parsed.info.mint));
    }

    return 0;
  } catch (error: unknown) {
    console.error('=== Detailed Error in getTokenBalance ===');
    if (error instanceof Error) {
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Unknown error:', error);
    }
    return 0;
  }
}

export async function createTokenAccount(
  connection: Connection, 
  walletAddress: PublicKey
) {
  try {
    // Get a working connection
    const workingConnection = await getWorkingConnection();
    
    const associatedTokenAddress = await getAssociatedTokenAddress(
      new PublicKey(config.tokenAddress),
      walletAddress
    );

    const tokenAccountInfo = await workingConnection.getAccountInfo(associatedTokenAddress);

    if (!tokenAccountInfo) {
      console.log('Creating token account...');
      const instruction = createAssociatedTokenAccountInstruction(
        walletAddress, // payer
        associatedTokenAddress, // ata
        walletAddress, // owner
        new PublicKey(config.tokenAddress) // mint
      );

      const transaction = new Transaction().add(instruction);
      
      return {
        instruction,
        associatedTokenAddress
      };
    }

    return { associatedTokenAddress };
  } catch (error: unknown) {
    console.error('Error creating token account:', 
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
} 