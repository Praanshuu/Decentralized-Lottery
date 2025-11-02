import { useState, useEffect } from 'react';
import { useSorobanReact } from '@soroban-react/core';
import { viewRound, LotteryRound } from './utils/contract';
import { CONFIG } from './config';
import RoundDisplay from './components/RoundDisplay';
import WalletConnect from './components/WalletConnect';
import './App.css';

function App() {
  const sorobanContext = useSorobanReact();
  const walletAddress = sorobanContext.address || null;
  
  const [round, setRound] = useState<LotteryRound | null>(null);
  const [roundId, setRoundId] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to find active round by checking rounds 1-10
    findActiveRound();
  }, []);

  const findActiveRound = async () => {
    setLoading(true);
    setError(null);
    
    // Check rounds 1-10 to find active one
    for (let id = 1; id <= 10; id++) {
      try {
        const roundData = await viewRound(id);
        if (roundData && roundData.round_id > 0 && roundData.is_active) {
          setRound(roundData);
          setRoundId(id);
          setLoading(false);
          return;
        }
      } catch (err) {
        // Continue searching
      }
    }
    
    // If no active round found, load round 1
    loadRound(1);
  };

  const handleConnectWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      await sorobanContext.connect();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet. Please install Freighter extension.');
    } finally {
      setLoading(false);
    }
  };

  const loadRound = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const roundData = await viewRound(id);
      if (roundData && roundData.round_id > 0) {
        setRound(roundData);
        setRoundId(id);
        setError(null); // Clear any previous errors
      } else {
        setRound(null);
        setError(`Round ${id} not found`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load round');
      setRound(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRoundIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = parseInt(e.target.value) || 1;
    setRoundId(id);
    loadRound(id);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎰 {CONFIG.APP_NAME}</h1>
        <p className="subtitle">Provably Fair Lottery on Stellar</p>
      </header>

      <main className="app-main">
        <div className="wallet-section">
          <WalletConnect
            walletAddress={walletAddress}
            onConnect={handleConnectWallet}
            loading={loading}
          />
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <div className="round-section">
          <div className="round-selector">
            <label htmlFor="roundId">Round ID:</label>
            <input
              id="roundId"
              type="number"
              min="1"
              value={roundId}
              onChange={handleRoundIdChange}
              disabled={loading}
            />
            <button onClick={() => loadRound(roundId)} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {round && (
            <RoundDisplay
              round={round}
              walletAddress={walletAddress}
              onRefresh={() => loadRound(roundId)}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Contract: <code>{CONFIG.LOTTERY_CONTRACT_ID.slice(0, 10)}...</code> | 
          Network: <code>{CONFIG.NETWORK}</code>
        </p>
      </footer>
    </div>
  );
}

export default App;
