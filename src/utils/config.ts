export const config = {
  tokenAddress: process.env.NEXT_PUBLIC_TOKEN_ADDRESS || 'BwW3Gj2QDGLQyfLWzcuaWvXW9UtG4bLsUC8UPB6Cpump',
  network: process.env.NEXT_PUBLIC_NETWORK || 'mainnet-beta',
  rpcEndpoint: process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://rpc.ankr.com/solana'
};

console.log('Loaded token address:', process.env.NEXT_PUBLIC_TOKEN_ADDRESS); 