import { CONFIG, getNetworkPassphrase, getRpcUrl } from '../config';
import { Server, xdr, Keypair } from 'soroban-client';
import { nativeToScVal, scValToNative, Horizon as StellarHorizon, Account, TransactionBuilder, Contract } from '@stellar/stellar-sdk';

// Contract interface types
export interface LotteryRound {
  round_id: number;
  ticket_price: bigint;
  total_pool: bigint;
  participants_count: number;
  is_active: boolean;
  winner: string | null;
  end_time: number;
  reveal_deadline: number;
  finalized: boolean;
  allow_multiple: boolean;
}

/**
 * Get RPC server instance
 */
export const getRpcServer = (): Server => {
  return new Server(getRpcUrl(), {
    allowHttp: true,
  });
};

/**
 * Get Stellar server for account lookups
 */
const getStellarServer = (): StellarHorizon.Server => {
  const horizonUrl = CONFIG.NETWORK === 'testnet'
    ? 'https://horizon-testnet.stellar.org'
    : 'https://horizon.stellar.org';
  return new StellarHorizon.Server(horizonUrl);
};

/**
 * Get or create account object for transaction building
 */
const getOrCreateAccount = async (address: string): Promise<Account> => {
  try {
    // Try to get account from Stellar Horizon
    const stellarServer = getStellarServer();
    const accountResponse = await stellarServer.loadAccount(address);
    // Create Account from response data
    return new Account(address, accountResponse.sequenceNumber());
  } catch (error) {
    // If account doesn't exist, create a dummy Account for simulation
    // For read-only operations, we don't need the actual account balance
    return new Account(address, '0');
  }
};

/**
 * Get contract instance
 */
export const getContract = (): Contract => {
  return new Contract(CONFIG.LOTTERY_CONTRACT_ID);
};

/**
 * Get token contract instance
 */
export const getTokenContract = (): Contract => {
  return new Contract(CONFIG.TOKEN_CONTRACT_ID);
};

/**
 * View lottery round details using Soroban SDK
 * Builds transaction directly using soroban-client to avoid SDK mixing issues
 */
export const viewRound = async (roundId: number): Promise<LotteryRound | null> => {
  try {
    const server = getRpcServer();
    const contract = getContract();
    
    // Create a random source account for read operations
    const sourceKeypair = Keypair.random();
    const sourceAccount = new Account(sourceKeypair.publicKey(), '0');
    
    // Build transaction - try using contract.call() but handle errors gracefully
    let transaction;
    try {
      // Contract.call() may fail with .functions error, but let's try
      const contractCallOp = (contract as any).call?.('view_round', nativeToScVal(roundId, { type: 'u64' }));
      
      if (!contractCallOp) {
        throw new Error('contract.call() returned undefined');
      }
      
      transaction = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: getNetworkPassphrase(),
      })
        .addOperation(contractCallOp as any)
        .setTimeout(60)
        .build();
    } catch (callError: any) {
      // If contract.call() fails, we can't proceed
      console.warn('Contract.call() failed for view_round:', callError.message);
      return null;
    }

    // Use server.simulateTransaction - it should accept the transaction
    // If conversion is needed, do it carefully
    let simResult;
    try {
      // Try direct call first
      simResult = await server.simulateTransaction(transaction as any);
    } catch (simError: any) {
      // If that fails, try converting to soroban-client format
      if (simError.message?.includes('Bad union') || simError.message?.includes('switch')) {
        // Conversion is problematic - return null for now
        console.warn('Transaction simulation failed due to XDR format mismatch');
        return null;
      }
      throw simError;
    }

    // Check for errors
    if ('error' in simResult || (simResult as any).error) {
      const error = (simResult as any).error || simResult;
      console.warn("Simulation error:", error);
      return null;
    }

    // Results is an array
    if (!simResult.results || !simResult.results[0]) {
      return null;
    }

    const result = simResult.results[0];
    if (!result || !('retval' in result) || !result.retval) {
      return null;
    }

    // Convert SCVal to native JavaScript
    // Try scValToNative directly first
    try {
      const roundObj = scValToNative(result.retval as any);
      return formatRoundData(roundObj);
    } catch (convertError) {
      // If direct conversion fails, try XDR roundtrip
      try {
        const retvalXdr = (result.retval as any).toXDR?.('base64');
        if (retvalXdr) {
          const { xdr: stellarXdr } = await import('@stellar/stellar-base');
          const stellarScVal = stellarXdr.ScVal.fromXDR(retvalXdr, 'base64');
          const roundObj = scValToNative(stellarScVal as any);
          return formatRoundData(roundObj);
        }
      } catch (e) {
        // Final fallback
        console.warn('Could not convert retval:', e);
      }
      return null;
    }
  } catch (error: any) {
    console.error("Error viewing round:", error);
    // Return null instead of throwing for read-only operations
    return null;
  }
};

/**
 * Helper to format round data from contract response
 */
function formatRoundData(roundObj: any): LotteryRound {
  // Handle struct conversion - could be object or array
  const roundData = roundObj;
  const isArray = Array.isArray(roundData);
  
  return {
    round_id: Number(isArray ? roundData[0] : roundData.round_id || 0),
    ticket_price: BigInt(String(isArray ? roundData[1] : roundData.ticket_price || 0)),
    total_pool: BigInt(String(isArray ? roundData[2] : roundData.total_pool || 0)),
    participants_count: Number(isArray ? roundData[3] : roundData.participants_count || 0),
    is_active: isArray ? Boolean(roundData[4]) : (roundData.is_active !== undefined ? Boolean(roundData.is_active) : false),
    winner: isArray ? (roundData[5] ? String(roundData[5]) : null) : (roundData.winner ? String(roundData.winner) : null),
    end_time: Number(isArray ? roundData[6] : roundData.end_time || 0),
    reveal_deadline: Number(isArray ? roundData[7] : roundData.reveal_deadline || 0),
    finalized: isArray ? Boolean(roundData[8]) : (roundData.finalized !== undefined ? Boolean(roundData.finalized) : false),
    allow_multiple: isArray ? Boolean(roundData[9]) : (roundData.allow_multiple !== undefined ? Boolean(roundData.allow_multiple) : false),
  };
}

/**
 * Approve token spending
 */
export const approveToken = async (
  userAddress: string,
  amount: bigint,
  expirationLedger: number
): Promise<string> => {
  try {
    const server = getRpcServer();
    const tokenContract = getTokenContract();

    const sourceAccount = await getOrCreateAccount(userAddress);

    const transaction = new TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: getNetworkPassphrase(),
    })
      .addOperation(
        tokenContract.call(
          'approve',
          nativeToScVal(userAddress, { type: 'address' }),
          nativeToScVal(CONFIG.LOTTERY_CONTRACT_ID, { type: 'address' }),
          nativeToScVal(amount, { type: 'i128' }),
          nativeToScVal(expirationLedger, { type: 'u32' })
        ) as any
      )
      .setTimeout(60)
      .build();

    // Convert @stellar/stellar-sdk transaction to soroban-client format
    const txXdrForSim = transaction.toXDR();
    const sorobanTxForSim = xdr.Transaction.fromXDR(txXdrForSim, 'base64') as any;
    
    const simResult = await server.simulateTransaction(sorobanTxForSim);

    if ('error' in simResult || (simResult as any).error) {
      const error = (simResult as any).error || simResult;
      const errorMsg = typeof error === 'object' ? JSON.stringify(error) : String(error);
      throw new Error(`Simulation error: ${errorMsg}`);
    }

    // Convert transaction for prepareTransaction
    const txXdrForPrep = transaction.toXDR();
    const sorobanTxForPrep = xdr.Transaction.fromXDR(txXdrForPrep, 'base64') as any;
    
    const preparedTx = await server.prepareTransaction(sorobanTxForPrep);

    return preparedTx.toXDR();
  } catch (error: any) {
    console.error("Error approving token:", error);
    throw error;
  }
};

/**
 * Buy lottery ticket
 */
export const buyTicket = async (
  userAddress: string,
  roundId: number,
  amount: bigint,
  commitHash: string // hex string
): Promise<string> => {
  try {
    const server = getRpcServer();
    const contract = getContract();

    // Convert commit hash hex string to BytesN<32>
    // Remove any whitespace and convert to lowercase
    const cleanHash = commitHash.trim().toLowerCase().replace(/\s/g, '');
    
    if (cleanHash.length !== 64) {
      throw new Error('Commit hash must be 64 hex characters (32 bytes)');
    }
    
    const hashBytes = new Uint8Array(32);
    for (let i = 0; i < cleanHash.length; i += 2) {
      hashBytes[i / 2] = parseInt(cleanHash.substr(i, 2), 16);
    }
    
    // Create ScVal BytesN<32> using stellar-sdk
    // BytesN requires fixed length, so we use 'bytes' type which Soroban will accept
    const hashScVal = nativeToScVal(hashBytes, { type: 'bytes' });

    const sourceAccount = await getOrCreateAccount(userAddress);

    const transaction = new TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: getNetworkPassphrase(),
    })
      .addOperation(
        contract.call(
          'buy_ticket',
          nativeToScVal(roundId, { type: 'u64' }),
          nativeToScVal(userAddress, { type: 'address' }),
          nativeToScVal(amount, { type: 'i128' }),
          hashScVal
        ) as any
      )
      .setTimeout(60)
      .build();

    // Convert @stellar/stellar-sdk transaction to soroban-client format
    const txXdrForSim = transaction.toXDR();
    const sorobanTxForSim = xdr.Transaction.fromXDR(txXdrForSim, 'base64') as any;
    
    const simResult = await server.simulateTransaction(sorobanTxForSim);

    if ('error' in simResult || (simResult as any).error) {
      const error = (simResult as any).error || simResult;
      const errorMsg = typeof error === 'object' ? JSON.stringify(error) : String(error);
      throw new Error(`Simulation error: ${errorMsg}`);
    }

    // Convert transaction for prepareTransaction
    const txXdrForPrep = transaction.toXDR();
    const sorobanTxForPrep = xdr.Transaction.fromXDR(txXdrForPrep, 'base64') as any;
    
    const preparedTx = await server.prepareTransaction(sorobanTxForPrep);

    return preparedTx.toXDR();
  } catch (error: any) {
    console.error("Error buying ticket:", error);
    throw error;
  }
};

/**
 * Reveal seed
 */
export const revealSeed = async (
  userAddress: string,
  roundId: number,
  seed: string // hex string
): Promise<string> => {
  try {
    const server = getRpcServer();
    const contract = getContract();

    // Convert seed hex string to Bytes
    // Remove any whitespace and convert to lowercase
    const cleanSeed = seed.trim().toLowerCase().replace(/\s/g, '');
    
    if (cleanSeed.length === 0 || cleanSeed.length % 2 !== 0) {
      throw new Error('Seed must be a valid hex string');
    }
    
    const seedBytes = new Uint8Array(cleanSeed.length / 2);
    for (let i = 0; i < cleanSeed.length; i += 2) {
      seedBytes[i / 2] = parseInt(cleanSeed.substr(i, 2), 16);
    }
    
    // Create ScVal bytes using stellar-sdk
    const seedScVal = nativeToScVal(seedBytes, { type: 'bytes' });

    const sourceAccount = await getOrCreateAccount(userAddress);

    const transaction = new TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: getNetworkPassphrase(),
    })
      .addOperation(
        contract.call(
          'reveal_seed',
          nativeToScVal(roundId, { type: 'u64' }),
          nativeToScVal(userAddress, { type: 'address' }),
          seedScVal
        ) as any
      )
      .setTimeout(60)
      .build();

    // Convert @stellar/stellar-sdk transaction to soroban-client format
    const txXdrForSim = transaction.toXDR();
    const sorobanTxForSim = xdr.Transaction.fromXDR(txXdrForSim, 'base64') as any;
    
    const simResult = await server.simulateTransaction(sorobanTxForSim);

    if ('error' in simResult || (simResult as any).error) {
      const error = (simResult as any).error || simResult;
      const errorMsg = typeof error === 'object' ? JSON.stringify(error) : String(error);
      throw new Error(`Simulation error: ${errorMsg}`);
    }

    // Convert transaction for prepareTransaction
    const txXdrForPrep = transaction.toXDR();
    const sorobanTxForPrep = xdr.Transaction.fromXDR(txXdrForPrep, 'base64') as any;
    
    const preparedTx = await server.prepareTransaction(sorobanTxForPrep);

    return preparedTx.toXDR();
  } catch (error: any) {
    console.error("Error revealing seed:", error);
    throw error;
  }
};

/**
 * Check token balance
 */
export const getTokenBalance = async (address: string): Promise<bigint> => {
  try {
    const server = getRpcServer();
    const tokenContract = getTokenContract();

    // Create a random source account for read operations
    const sourceKeypair = Keypair.random();
    const sourceAccount = new Account(sourceKeypair.publicKey(), '0');

    const transaction = new TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: getNetworkPassphrase(),
    })
      .addOperation(
        tokenContract.call(
          'balance',
          nativeToScVal(address, { type: 'address' })
        ) as any
      )
      .setTimeout(60)
      .build();

    // Simulate transaction (read-only call)
    // Convert @stellar/stellar-sdk transaction to soroban-client format
    const txXdrForBalance = transaction.toXDR();
    const sorobanTxForBalance = xdr.Transaction.fromXDR(txXdrForBalance, 'base64') as any;
    
    const simResult = await server.simulateTransaction(sorobanTxForBalance);

    if ('error' in simResult || (simResult as any).error) {
      return BigInt(0);
    }

    if (!simResult.results || !simResult.results[0]) {
      return BigInt(0);
    }

    const result = simResult.results[0];
    if (!result || !('retval' in result) || !result.retval) {
      return BigInt(0);
    }

    const balance = scValToNative(result.retval as any);
    return BigInt(balance || 0);
  } catch (error: any) {
    console.error("Error checking token balance:", error);
    return BigInt(0);
  }
};

/**
 * Submit signed transaction
 */
export const submitTransaction = async (signedXdr: string): Promise<string> => {
  try {
    const server = getRpcServer();
    const stellarTransaction = TransactionBuilder.fromXDR(signedXdr, getNetworkPassphrase());

    // Convert @stellar/stellar-sdk transaction to soroban-client format
    const txXdrForSend = stellarTransaction.toXDR();
    const sorobanTxForSend = xdr.Transaction.fromXDR(txXdrForSend, 'base64') as any;

    const result = await server.sendTransaction(sorobanTxForSend);

    if (result.status === 'PENDING') {
      // Poll for transaction completion
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const tx = await server.getTransaction(result.hash) as any;

        if (tx.status === 'SUCCESS') {
          return result.hash;
        } else if (tx.status === 'FAILED') {
          throw new Error(`Transaction failed: ${JSON.stringify(tx)}`);
        }

        attempts++;
      }

      throw new Error('Transaction timeout');
    }

    return result.hash;
  } catch (error) {
    console.error("Error submitting transaction:", error);
    throw error;
  }
};
