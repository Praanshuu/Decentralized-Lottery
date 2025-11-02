# Verify commit hash matches stored value

$seed = "E78E2C6BF58BCA23FD02A1D1D3496761C42AECA87BABF699A16D0C294C64F44A"
$participant = "SB45VDMW3XV7ZHRGNG5ZWJW6OJTLFRD2X7DEU2SWBMKOUJZG3ZK42ZBF"
$roundId = 1

# Convert hex seed to bytes
$seedBytes = for ($i = 0; $i -lt $seed.Length; $i += 2) {
    [byte]::Parse($seed.Substring($i, 2), [System.Globalization.NumberStyles]::AllowHexSpecifier)
}

# Convert participant to bytes
$participantBytes = [System.Text.Encoding]::UTF8.GetBytes($participant)

# Convert round_id to bytes (big-endian)
$roundIdBytes = [System.BitConverter]::GetBytes($roundId)
[Array]::Reverse($roundIdBytes)

# Concatenate
$hashInput = $seedBytes + $participantBytes + $roundIdBytes

# Compute SHA256
$sha256 = [System.Security.Cryptography.SHA256]::Create()
$hashBytes = $sha256.ComputeHash($hashInput)
$computedCommit = ($hashBytes | ForEach-Object { $_.ToString("X2") }) -join ''

$storedCommit = (Get-Content "test_commit_hash.txt" -Raw).Trim()

Write-Host "Stored Commit:  $storedCommit" -ForegroundColor Cyan
Write-Host "Computed Commit: $computedCommit" -ForegroundColor Yellow

if ($storedCommit -eq $computedCommit) {
    Write-Host "Commit hashes MATCH!" -ForegroundColor Green
} else {
    Write-Host "Commit hashes DON'T match!" -ForegroundColor Red
}

