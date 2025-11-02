import React, { useState } from 'react';
import { CONFIG } from '../config';
import { LotteryRound } from '../utils/contract';
import { getStoredSeed, bytesToHex } from '../utils/commitReveal';

interface CLIInstructionsProps {
  round: LotteryRound;
  walletAddress: string | null;
  operation: 'buy_ticket' | 'reveal_seed';
}

const CLIInstructions: React.FC<CLIInstructionsProps> = ({ round, walletAddress, operation }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!walletAddress) {
    return null;
  }

  if (operation === 'buy_ticket') {
    // Generate commit hash instructions
    const seedExample = "YOUR_GENERATED_SEED_HEX";
    const commitHashExample = "YOUR_COMMIT_HASH_HEX";
    
    const approveCommand = `stellar contract invoke \\
  --id ${CONFIG.TOKEN_CONTRACT_ID} \\
  --source YOUR_KEY_NAME \\
  --network ${CONFIG.NETWORK} \\
  -- approve \\
  --from ${walletAddress} \\
  --spender ${CONFIG.LOTTERY_CONTRACT_ID} \\
  --amount ${round.ticket_price} \\
  --expiration_ledger 2000000`;

    const buyTicketCommand = `stellar contract invoke \\
  --id ${CONFIG.LOTTERY_CONTRACT_ID} \\
  --source YOUR_KEY_NAME \\
  --network ${CONFIG.NETWORK} \\
  -- buy_ticket \\
  --round_id ${round.round_id} \\
  --participant ${walletAddress} \\
  --amount ${round.ticket_price} \\
  --commit_hash ${commitHashExample}`;

    return (
      <div className="cli-instructions">
        <h3>📋 CLI Instructions for Buying Ticket</h3>
        <p className="instruction-note">
          <strong>Note:</strong> The UI automatically generates and stores your seed when you click "Buy Ticket".
          For CLI usage, you'll need to generate a commit hash first.
        </p>
        
        <div className="command-section">
          <h4>Step 1: Generate Commit Hash</h4>
          <p>You need to:</p>
          <ol>
            <li>Generate a 32-byte random seed</li>
            <li>Compute: <code>SHA256(seed || address || round_id)</code></li>
            <li>Store the seed for later reveal</li>
          </ol>
          <p>Example using PowerShell (see <code>generate_commit_hash.ps1</code>):</p>
          <pre className="command-block">{`$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$seedHex = ($bytes | ForEach-Object { $_.ToString("X2") }) -join ''
# Then compute commit hash (see generate_commit_hash.ps1 for full code)`}</pre>
        </div>

        <div className="command-section">
          <h4>Step 2: Approve Tokens</h4>
          <button
            onClick={() => copyToClipboard(approveCommand)}
            className="copy-button"
          >
            {copied ? '✓ Copied!' : '📋 Copy Command'}
          </button>
          <pre className="command-block">{approveCommand}</pre>
        </div>

        <div className="command-section">
          <h4>Step 3: Buy Ticket</h4>
          <p>Replace <code>YOUR_KEY_NAME</code> with your key name and <code>COMMIT_HASH</code> with your computed hash:</p>
          <button
            onClick={() => copyToClipboard(buyTicketCommand)}
            className="copy-button"
          >
            {copied ? '✓ Copied!' : '📋 Copy Command'}
          </button>
          <pre className="command-block">{buyTicketCommand}</pre>
        </div>
      </div>
    );
  }

  if (operation === 'reveal_seed') {
    const storedSeed = walletAddress ? getStoredSeed(round.round_id) : null;
    const seedHex = storedSeed ? bytesToHex(storedSeed) : "YOUR_STORED_SEED_HEX";

    const revealCommand = `stellar contract invoke \\
  --id ${CONFIG.LOTTERY_CONTRACT_ID} \\
  --source YOUR_KEY_NAME \\
  --network ${CONFIG.NETWORK} \\
  -- reveal_seed \\
  --round_id ${round.round_id} \\
  --participant ${walletAddress} \\
  --seed ${seedHex}`;

    return (
      <div className="cli-instructions">
        <h3>📋 CLI Instructions for Revealing Seed</h3>
        {storedSeed ? (
          <div className="info-message">
            ✅ Seed found in browser storage: <code>{seedHex.slice(0, 16)}...</code>
          </div>
        ) : (
          <div className="warning-message">
            ⚠️ No stored seed found. You may not have purchased a ticket for this round.
          </div>
        )}
        
        <div className="command-section">
          <p>Replace <code>YOUR_KEY_NAME</code> with your key name:</p>
          <button
            onClick={() => copyToClipboard(revealCommand)}
            className="copy-button"
          >
            {copied ? '✓ Copied!' : '📋 Copy Command'}
          </button>
          <pre className="command-block">{revealCommand}</pre>
        </div>
      </div>
    );
  }

  return null;
};

export default CLIInstructions;
