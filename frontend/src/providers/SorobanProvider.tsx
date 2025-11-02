import React from 'react';
import { SorobanReactProvider } from '@soroban-react/core';
import { freighter } from '@soroban-react/freighter';
import { CONFIG, getNetworkPassphrase, getRpcUrl } from '../config';

interface SorobanProviderProps {
  children: React.ReactNode;
}

export const SorobanProvider: React.FC<SorobanProviderProps> = ({ children }) => {
  return (
    <SorobanReactProvider
      connectors={[freighter()]}
      network={{
        networkPassphrase: getNetworkPassphrase(),
        rpcUrl: getRpcUrl(),
      }}
    >
      {children}
    </SorobanReactProvider>
  );
};

