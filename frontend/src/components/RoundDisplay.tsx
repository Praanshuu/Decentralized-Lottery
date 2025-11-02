import React, { useState, useEffect } from 'react';
import { LotteryRound } from '../utils/contract';
import { buyTicket, revealSeed, submitTransaction, approveToken, getTokenBalance } from '../utils/contract';
import { signTransactionWithWallet } from '../utils/wallet';
import { generateSeed, computeCommitHash, storeSeed, getStoredSeed, bytesToHex, hexToBytes, removeStoredSeed } from '../utils/commitReveal';
import { CONFIG } from '../config';
import CLIInstructions from './CLIInstructions';

interface RoundDisplayProps {
  round: LotteryRound;
  walletAddress: string | null;
  onRefresh: () => void;
}

const RoundDisplay: React.FC<RoundDisplayProps> = ({ round, walletAddress, onRefresh }) => {
  const [buyingTicket, setBuyingTicket] = useState(false);
  const [revealingSeed, setRevealingSeed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<bigint | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const currentTime = Math.floor(Date.now() / 1000);
  const isRoundActive = round.is_active && currentTime < round.end_time;
  const isRevealPhase = !round.is_active && currentTime >= round.end_time && currentTime < round.reveal_deadline;
  const canFinalize = round.reveal_deadline > 0 && currentTime >= round.reveal_deadline && !round.finalized;

  const formatTime = (timestamp: number): string => {
    if (timestamp === 0) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const formatAmount = (amount: bigint): string => {
    return (Number(amount) / 1000000).toFixed(6);
  };

  const handleBuyTicket = async () => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setBuyingTicket(true);
    setError(null);
    setSuccess(null);

    try {
      // Step 1: Generate seed and commit hash
      const seed = generateSeed();
      const commitHash = await computeCommitHash(seed, walletAddress, round.round_id);
      
      // Step 2: Store seed for later reveal
      storeSeed(round.round_id, seed);
      
      // Step 3: Approve tokens (if needed)
      const expirationLedger = 2000000; // Far future
      const approveXdr = await approveToken(
        walletAddress,
        round.ticket_price,
        expirationLedger
      );

      // Step 4: Sign approval transaction
      const signedApprove = await signTransactionWithWallet(approveXdr, CONFIG.NETWORK as 'testnet' | 'mainnet');
      await submitTransaction(signedApprove);

      // Step 5: Buy ticket
      const buyTicketXdr = await buyTicket(
        walletAddress,
        round.round_id,
        round.ticket_price,
        bytesToHex(commitHash)
      );

      // Step 6: Sign and submit buy ticket transaction
      const signedBuyTicket = await signTransactionWithWallet(buyTicketXdr, CONFIG.NETWORK as 'testnet' | 'mainnet');
      const txHash = await submitTransaction(signedBuyTicket);

      setSuccess(`✅ Ticket purchased successfully! Transaction: ${txHash.slice(0, 10)}...`);

      // Refresh round data and balance
      setTimeout(() => {
        onRefresh();
        loadTokenBalance();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to buy ticket');
    } finally {
      setBuyingTicket(false);
    }
  };

  const handleRevealSeed = async () => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setRevealingSeed(true);
    setError(null);
    setSuccess(null);

    try {
      // Get stored seed
      const storedSeed = getStoredSeed(round.round_id);
      
      if (!storedSeed) {
        setError('No seed found for this round. You may not have purchased a ticket.');
        return;
      }

      // Reveal seed
      const revealXdr = await revealSeed(
        walletAddress,
        round.round_id,
        bytesToHex(storedSeed)
      );

      // Sign and submit reveal transaction
      const signedReveal = await signTransactionWithWallet(revealXdr, CONFIG.NETWORK as 'testnet' | 'mainnet');
      const txHash = await submitTransaction(signedReveal);

      setSuccess(`✅ Seed revealed successfully! Transaction: ${txHash.slice(0, 10)}...`);

      // Remove stored seed after successful reveal
      removeStoredSeed(round.round_id);

      // Refresh round data and balance
      setTimeout(() => {
        onRefresh();
        loadTokenBalance();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reveal seed');
    } finally {
      setRevealingSeed(false);
    }
  };

  const hasStoredSeed = walletAddress ? getStoredSeed(round.round_id) !== null : false;

  // Load token balance when wallet is connected
  useEffect(() => {
    if (walletAddress) {
      loadTokenBalance();
    }
  }, [walletAddress]);

  const loadTokenBalance = async () => {
    if (!walletAddress) return;
    
    setLoadingBalance(true);
    try {
      const balance = await getTokenBalance(walletAddress);
      setTokenBalance(balance);
    } catch (err) {
      console.error('Failed to load token balance:', err);
    } finally {
      setLoadingBalance(false);
    }
  };

  const hasEnoughBalance = tokenBalance !== null && tokenBalance >= round.ticket_price;

  return (
    <div className="round-display">
      <div className="round-header">
        <h2>Round #{round.round_id}</h2>
        <div className={`round-status ${round.is_active ? 'active' : 'inactive'}`}>
          {round.is_active ? '🟢 Active' : '🔴 Inactive'}
          {round.finalized && ' ✓ Finalized'}
        </div>
      </div>

      <div className="round-info">
        <div className="info-item">
          <span className="info-label">Ticket Price:</span>
          <span className="info-value">{formatAmount(round.ticket_price)} tokens</span>
        </div>
        <div className="info-item">
          <span className="info-label">Prize Pool:</span>
          <span className="info-value">{formatAmount(round.total_pool)} tokens</span>
        </div>
        <div className="info-item">
          <span className="info-label">Participants:</span>
          <span className="info-value">{round.participants_count}</span>
        </div>
        <div className="info-item">
          <span className="info-label">End Time:</span>
          <span className="info-value">{formatTime(round.end_time)}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Reveal Deadline:</span>
          <span className="info-value">{formatTime(round.reveal_deadline)}</span>
        </div>
        {round.winner && (
          <div className="info-item winner">
            <span className="info-label">Winner:</span>
            <span className="info-value">{round.winner.slice(0, 8)}...{round.winner.slice(-8)}</span>
          </div>
        )}
        <div className="info-item">
          <span className="info-label">Allow Multiple:</span>
          <span className="info-value">{round.allow_multiple ? 'Yes' : 'No'}</span>
        </div>
        {walletAddress && (
          <div className="info-item">
            <span className="info-label">Your Token Balance:</span>
            <span className="info-value">
              {loadingBalance ? 'Loading...' : tokenBalance !== null ? formatAmount(tokenBalance) : 'N/A'} tokens
            </span>
            <button onClick={loadTokenBalance} className="refresh-balance-btn" style={{ marginLeft: '10px', padding: '4px 8px' }}>
              🔄
            </button>
          </div>
        )}
      </div>

        {(error || success) && (
          <div className={error ? "error-message" : "success-message"}>
            {error ? `⚠️ ${error}` : success}
          </div>
        )}

      <div className="round-actions">
        {isRoundActive && walletAddress && (
          <>
            {!hasEnoughBalance && tokenBalance !== null && (
              <div className="warning-message">
                ⚠️ Insufficient balance. You need {formatAmount(round.ticket_price)} tokens but have {formatAmount(tokenBalance)} tokens.
              </div>
            )}
            <button
              onClick={handleBuyTicket}
              disabled={buyingTicket || (tokenBalance !== null && !hasEnoughBalance)}
              className="action-button buy-button"
            >
              {buyingTicket ? 'Processing...' : `Buy Ticket (${formatAmount(round.ticket_price)} tokens)`}
            </button>
            <CLIInstructions round={round} walletAddress={walletAddress} operation="buy_ticket" />
          </>
        )}

        {isRevealPhase && walletAddress && hasStoredSeed && (
          <>
            <button
              onClick={handleRevealSeed}
              disabled={revealingSeed}
              className="action-button reveal-button"
            >
              {revealingSeed ? 'Preparing...' : 'Reveal Seed'}
            </button>
            <CLIInstructions round={round} walletAddress={walletAddress} operation="reveal_seed" />
          </>
        )}

        {isRevealPhase && walletAddress && !hasStoredSeed && (
          <div className="info-message">
            No stored seed found. You may not have purchased a ticket for this round.
          </div>
        )}

        {canFinalize && (
          <div className="info-message">
            ⏳ Round can be finalized by admin. Waiting for finalization...
          </div>
        )}
      </div>
    </div>
  );
};

export default RoundDisplay;
