import React from 'react';

interface WalletConnectProps {
  walletAddress: string | null;
  onConnect: () => void;
  loading: boolean;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ walletAddress, onConnect, loading }) => {
  if (walletAddress) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <span className="wallet-icon">🔗</span>
          <div>
            <div className="wallet-label">Connected</div>
            <div className="wallet-address">{walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      <button
        onClick={onConnect}
        disabled={loading}
        className="connect-button"
      >
        {loading ? 'Connecting...' : 'Connect Freighter Wallet'}
      </button>
      <p className="wallet-hint">
        Install <a href="https://freighter.app" target="_blank" rel="noopener noreferrer">Freighter</a> to connect your wallet
      </p>
    </div>
  );
};

export default WalletConnect;
