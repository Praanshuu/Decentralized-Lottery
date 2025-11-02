// Configuration for the lottery contract
// Update these with your deployed contract addresses

export const CONFIG = {
  // Contract addresses (update these after deployment)
  LOTTERY_CONTRACT_ID: import.meta.env.VITE_LOTTERY_CONTRACT_ID || "CBPXXFNCXGMFOUHGHRKF6OBKTKX7MVGGGNOXJ7LWGNURS74QXTKLK5YV",
  TOKEN_CONTRACT_ID: import.meta.env.VITE_TOKEN_CONTRACT_ID || "CBL6QNUKJAQVYJRL2M2SVHND2F7XAFBDSE77P7TLX5JXBYA7WSS7Y3CI",
  
  // Network configuration
  NETWORK: import.meta.env.VITE_NETWORK || "testnet", // "testnet" or "mainnet"
  
  // RPC endpoints
  TESTNET_RPC_URL: "https://soroban-testnet.stellar.org",
  MAINNET_RPC_URL: "https://soroban-rpc.mainnet.stellar.org",
  
  // App settings
  APP_NAME: "Decentralized Lottery",
};

export const getNetworkPassphrase = () => {
  return CONFIG.NETWORK === "testnet"
    ? "Test SDF Network ; September 2015"
    : "Public Global Stellar Network ; September 2015";
};

export const getRpcUrl = () => {
  return CONFIG.NETWORK === "testnet"
    ? CONFIG.TESTNET_RPC_URL
    : CONFIG.MAINNET_RPC_URL;
};
