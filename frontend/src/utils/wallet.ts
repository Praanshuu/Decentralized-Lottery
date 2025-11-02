export interface WalletConnection {
  publicKey: string;
  isConnected: boolean;
}

/**
 * Check if Freighter wallet is installed
 */
export const isFreighterInstalled = async (): Promise<boolean> => {
  try {
    // Check for window.freighterApi (newer API)
    if (typeof window !== 'undefined' && (window as any).freighterApi) {
      return true;
    }
    
    // Check for older API
    if (typeof window !== 'undefined' && (window as any).stellar && (window as any).stellar.isConnected) {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
};

/**
 * Connect to Freighter wallet
 */
export const connectWallet = async (): Promise<WalletConnection | null> => {
  try {
    // Method 1: Check for window.freighterApi (newer Freighter API)
    if (typeof window !== 'undefined' && (window as any).freighterApi) {
      const freighter = (window as any).freighterApi;
      
      try {
        // Request access
        await freighter.setAllowed();
        
        // Get public key
        const publicKey = await freighter.getPublicKey();
        
        if (!publicKey) {
          throw new Error("No public key returned from wallet");
        }
        
        return {
          publicKey,
          isConnected: true,
        };
      } catch (error: any) {
        console.error("Freighter API error:", error);
        throw error;
      }
    }
    
    // Method 2: Try direct import (if available)
    try {
      const freighterApi = await import('@stellar/freighter-api');
      
      const allowed = await freighterApi.isConnected();
      
      if (!allowed) {
        await freighterApi.setAllowed();
      }
      
      // Try different methods to get public key
      let publicKey: string | null = null;
      
      if (typeof freighterApi.getPublicKey === 'function') {
        publicKey = await freighterApi.getPublicKey();
      } else if ((freighterApi as any).getPublicKeyAsync) {
        publicKey = await (freighterApi as any).getPublicKeyAsync();
      } else if ((freighterApi as any).getUserInfo) {
        const userInfo = await (freighterApi as any).getUserInfo();
        publicKey = userInfo?.publicKey || null;
      }
      
      if (!publicKey) {
        throw new Error("No public key returned from wallet");
      }
      
      return {
        publicKey,
        isConnected: true,
      };
    } catch (importError) {
      // If import fails, try window API
      console.warn("Direct import failed, trying window API");
    }
    
    // Method 3: Check for older stellar API
    if (typeof window !== 'undefined' && (window as any).stellar) {
      const stellar = (window as any).stellar;
      
      if (stellar.isConnected && await stellar.isConnected()) {
        const publicKey = await stellar.getPublicKey();
        
        if (publicKey) {
          return {
            publicKey,
            isConnected: true,
          };
        }
      }
    }
    
    throw new Error("Freighter wallet not found or not connected");
  } catch (error: any) {
    console.error("Failed to connect wallet:", error);
    throw error;
  }
};

/**
 * Sign a transaction with Freighter
 */
export const signTransactionWithWallet = async (
  transactionXdr: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<string> => {
  try {
    const networkPassphrase = network === 'testnet' 
      ? "Test SDF Network ; September 2015"
      : "Public Global Stellar Network ; September 2015";
    
    // Check for window.freighterApi (newer API)
    if (typeof window !== 'undefined' && (window as any).freighterApi) {
      const freighter = (window as any).freighterApi;
      return await freighter.signTransaction(transactionXdr, {
        network,
        networkPassphrase,
      });
    }
    
    // Fallback to direct import
    try {
      const freighterApi = await import('@stellar/freighter-api');
      
      if (typeof freighterApi.signTransaction === 'function') {
        return await freighterApi.signTransaction(transactionXdr, {
          network,
          networkPassphrase,
          accountToSign: undefined,
        });
      }
    } catch (importError) {
      // Try window API
    }
    
    // Check for older stellar API
    if (typeof window !== 'undefined' && (window as any).stellar) {
      const stellar = (window as any).stellar;
      return await stellar.signTransaction(transactionXdr, {
        network,
        networkPassphrase,
      });
    }
    
    throw new Error("Freighter signTransaction not available");
  } catch (error) {
    console.error("Failed to sign transaction:", error);
    throw error;
  }
};

/**
 * Get current wallet address
 */
export const getWalletAddress = async (): Promise<string | null> => {
  try {
    // Check for window.freighterApi (newer API)
    if (typeof window !== 'undefined' && (window as any).freighterApi) {
      const freighter = (window as any).freighterApi;
      const isConnected = await freighter.isConnected();
      if (isConnected) {
        return await freighter.getPublicKey();
      }
      return null;
    }
    
    // Fallback
    try {
      const freighterApi = await import('@stellar/freighter-api');
      
      if (typeof freighterApi.isConnected === 'function') {
        const allowed = await freighterApi.isConnected();
        if (!allowed) {
          return null;
        }
        
        if (typeof freighterApi.getPublicKey === 'function') {
          return await freighterApi.getPublicKey();
        }
      }
    } catch (importError) {
      // Continue to next method
    }
    
    // Check older API
    if (typeof window !== 'undefined' && (window as any).stellar) {
      const stellar = (window as any).stellar;
      if (await stellar.isConnected()) {
        return await stellar.getPublicKey();
      }
    }
    
    return null;
  } catch {
    return null;
  }
};
