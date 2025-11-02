# PowerShell script to generate commit hash for lottery ticket purchase
# Commit hash = SHA256(seed || participant_address || round_id)

param(
    [string]$Seed = "",
    [string]$Participant = "SB45VDMW3XV7ZHRGNG5ZWJW6OJTLFRD2X7DEU2SWBMKOUJZG3ZK42ZBF",
    [int]$RoundId = 1
)

# Generate random seed if not provided
if ([string]::IsNullOrEmpty($Seed)) {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $Seed = [System.BitConverter]::ToString($bytes) -replace '-', ''
    Write-Host "Generated Seed: $Seed" -ForegroundColor Green
}

# Convert hex seed to bytes
$seedBytes = [System.Convert]::FromHexString($Seed)

# Convert participant address to bytes
$participantBytes = [System.Text.Encoding]::UTF8.GetBytes($Participant)

# Convert round_id to bytes (big-endian)
$roundIdBytes = [System.BitConverter]::GetBytes($RoundId)
[Array]::Reverse($roundIdBytes)

# Concatenate: seed || participant || round_id
$hashInput = $seedBytes + $participantBytes + $roundIdBytes

# Compute SHA256
$sha256 = [System.Security.Cryptography.SHA256]::Create()
$hashBytes = $sha256.ComputeHash($hashInput)
$commitHash = [System.BitConverter]::ToString($hashBytes) -replace '-', ''

Write-Host "Commit Hash: $commitHash" -ForegroundColor Cyan
Write-Host ""
Write-Host "Save this seed for later reveal: $Seed" -ForegroundColor Yellow

# Return both seed and commit hash
return @{
    Seed = $Seed
    CommitHash = $commitHash
}

