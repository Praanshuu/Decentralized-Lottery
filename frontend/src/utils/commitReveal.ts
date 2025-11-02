/**
 * Commit-Reveal Scheme Utilities
 * 
 * The commit-reveal scheme works as follows:
 * 1. Generate a random seed
 * 2. Compute: commit_hash = SHA256(seed || participant_address || round_id)
 * 3. Store the seed locally for later reveal
 * 4. Use commit_hash when buying ticket
 * 5. After round ends, reveal the seed to verify
 */

/**
 * Generate a random 32-byte seed
 */
export const generateSeed = (): Uint8Array => {
  const seed = new Uint8Array(32);
  crypto.getRandomValues(seed);
  return seed;
};

/**
 * Compute SHA256 hash
 */
const sha256 = async (data: Uint8Array): Promise<Uint8Array> => {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
};

/**
 * Compute commit hash: SHA256(seed || address || round_id)
 */
export const computeCommitHash = async (
  seed: Uint8Array,
  participantAddress: string,
  roundId: number
): Promise<Uint8Array> => {
  // Convert address to bytes
  const addressBytes = new TextEncoder().encode(participantAddress);
  
  // Convert round_id to 8-byte big-endian
  const roundIdBytes = new Uint8Array(8);
  const view = new DataView(roundIdBytes.buffer);
  view.setBigUint64(0, BigInt(roundId), false); // big-endian
  
  // Concatenate: seed || address || round_id
  const combined = new Uint8Array(seed.length + addressBytes.length + roundIdBytes.length);
  combined.set(seed, 0);
  combined.set(addressBytes, seed.length);
  combined.set(roundIdBytes, seed.length + addressBytes.length);
  
  // Compute SHA256
  return await sha256(combined);
};

/**
 * Convert bytes to hex string
 */
export const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Convert hex string to bytes
 */
export const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
};

/**
 * Store seed in localStorage for later reveal
 */
export const storeSeed = (roundId: number, seed: Uint8Array): void => {
  const key = `lottery_seed_${roundId}`;
  const hexSeed = bytesToHex(seed);
  localStorage.setItem(key, hexSeed);
};

/**
 * Retrieve seed from localStorage
 */
export const getStoredSeed = (roundId: number): Uint8Array | null => {
  const key = `lottery_seed_${roundId}`;
  const hexSeed = localStorage.getItem(key);
  if (!hexSeed) {
    return null;
  }
  return hexToBytes(hexSeed);
};

/**
 * Remove stored seed after reveal
 */
export const removeStoredSeed = (roundId: number): void => {
  const key = `lottery_seed_${roundId}`;
  localStorage.removeItem(key);
};
