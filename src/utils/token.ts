import { Connection, PublicKey } from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction 
} from '@solana/spl-token';
import { config } from '../utils/config';

const FALLBACK_ENDPOINTS = [
  'https://api.devnet.solana.com',
  'https://solana-mainnet.g.alchemy.com/v2/demo',
  'https://rpc.ankr.com/solana',
];

// Add connection caching
let cachedConnection: Connection | null = null;
let lastConnectionTime: number = 0;
const CONNECTION_CACHE_DURATION = 30000; // 30 seconds

async function getWorkingConnection(): Promise<Connection> {
  // Return cached connection if valid
  if (cachedConnection && (Date.now() - lastConnectionTime < CONNECTION_CACHE_DURATION)) {
    return cachedConnection;
  }

  // Try primary endpoint
  try {
    const connection = new Connection(config.rpcEndpoint, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000
    });
    
    // Only test connection if we're creating a new one
    await connection.getVersion();  // Lighter weight call than getLatestBlockhash
    
    // Cache the working connection
    cachedConnection = connection;
    lastConnectionTime = Date.now();
    return connection;
  } catch (err) {
    console.warn('Primary RPC failed, trying fallbacks...', err);
  }

  // Try fallbacks with delay between attempts
  for (const endpoint of FALLBACK_ENDPOINTS) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Add delay between attempts
      const connection = new Connection(endpoint, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000
      });
      await connection.getVersion();
      
      cachedConnection = connection;
      lastConnectionTime = Date.now();
      return connection;
    } catch (err) {
      if (err instanceof Error) {
        console.warn(`Fallback RPC ${endpoint} failed:`, err.message);
      }
      continue;
    }
  }

  throw new Error('Unable to connect to Solana network. Please try again later.');
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
    } catch (err) {
      console.error('Error checking token info:', err);
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
  } catch (err) {
    console.error('=== Detailed Error in getTokenBalance ===');
    if (err instanceof Error) {
      console.error('Error type:', err.constructor.name);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
    } else {
      console.error('Unknown error:', err);
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

      return {
        instruction,
        associatedTokenAddress
      };
    }

    return { associatedTokenAddress };
  } catch (err) {
    console.error('Error creating token account:', 
      err instanceof Error ? err.message : 'Unknown error'
    );
    throw err;
  }
} 