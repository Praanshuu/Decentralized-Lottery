/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LOTTERY_CONTRACT_ID?: string;
  readonly VITE_TOKEN_CONTRACT_ID?: string;
  readonly VITE_NETWORK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '@stellar/freighter-api' {
  export function isConnected(): Promise<boolean>;
  export function setAllowed(): Promise<void>;
  export function getPublicKey(): Promise<string>;
  export function signTransaction(
    transactionXdr: string,
    options?: {
      network?: 'testnet' | 'mainnet';
      networkPassphrase?: string;
      accountToSign?: string;
    }
  ): Promise<string>;
}
