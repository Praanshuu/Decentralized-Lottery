# Complete Lottery Contract Test Workflow
# Tests the full lottery lifecycle: Purchase → Reveal → Finalize

$ErrorActionPreference = "Stop"

# Configuration
$LOTTERY_CONTRACT = "CBPXXFNCXGMFOUHGHRKF6OBKTKX7MVGGGNOXJ7LWGNURS74QXTKLK5YV"
$TOKEN_CONTRACT = "CBL6QNUKJAQVYJRL2M2SVHND2F7XAFBDSE77P7TLX5JXBYA7WSS7Y3CI"
$ADMIN_KEY = "praanshuu"
$ADMIN_ADDRESS = "SB45VDMW3XV7ZHRGNG5ZWJW6OJTLFRD2X7DEU2SWBMKOUJZG3ZK42ZBF"
$NETWORK = "testnet"

# Ticket price in stroops (100 stroops = 0.00001 XLM - very cheap!)
$TICKET_PRICE = 100

Write-Host "🎰 Complete Lottery Test Workflow" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ticket Price: $TICKET_PRICE stroops (0.00001 XLM) - Very Cheap!" -ForegroundColor Green
Write-Host ""

# Step 1: Create a short-duration round (1 hour) for testing
Write-Host "📋 Step 1: Creating test round..." -ForegroundColor Yellow
$roundResult = stellar contract invoke --id $LOTTERY_CONTRACT --source $ADMIN_KEY --network $NETWORK -- create_round --ticket_price $TICKET_PRICE --duration_hours 1 --allow_multiple false 2>&1

if ($LASTEXITCODE -eq 0) {
    $roundId = $roundResult[-1].Trim()
    Write-Host "  ✓ Round created: $roundId" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Round creation failed (might be active round exists)" -ForegroundColor Yellow
    Write-Host "  Checking existing round..." -ForegroundColor Yellow
    $roundInfo = stellar contract invoke --id $LOTTERY_CONTRACT --source $ADMIN_KEY --network $NETWORK -- view_round --round_id 1 2>&1 | ConvertFrom-Json
    $roundId = $roundInfo.round_id
    Write-Host "  Using existing round: $roundId" -ForegroundColor Cyan
}

# Step 2: Generate commit hash
Write-Host ""
Write-Host "📋 Step 2: Generating commit hash..." -ForegroundColor Yellow
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$seedHex = ($bytes | ForEach-Object { $_.ToString("X2") }) -join ''
$participantBytes = [System.Text.Encoding]::UTF8.GetBytes($ADMIN_ADDRESS)
$roundIdBytes = [System.BitConverter]::GetBytes([int]$roundId)
[Array]::Reverse($roundIdBytes)
$hashInput = $bytes + $participantBytes + $roundIdBytes
$sha256 = [System.Security.Cryptography.SHA256]::Create()
$hashBytes = $sha256.ComputeHash($hashInput)
$commitHash = ($hashBytes | ForEach-Object { $_.ToString("X2") }) -join ''

Write-Host "  ✓ Seed: $seedHex" -ForegroundColor Green
Write-Host "  ✓ Commit Hash: $commitHash" -ForegroundColor Green
$seedHex | Out-File -FilePath "test_seed.txt" -NoNewline
$commitHash | Out-File -FilePath "test_commit_hash.txt" -NoNewline

# Step 3: Approve tokens
Write-Host ""
Write-Host "📋 Step 3: Approving tokens..." -ForegroundColor Yellow
$approveResult = stellar contract invoke --id $TOKEN_CONTRACT --source $ADMIN_KEY --network $NETWORK -- approve --from $ADMIN_ADDRESS --spender $LOTTERY_CONTRACT --amount $TICKET_PRICE --expiration_ledger 2000000 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Tokens approved" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Approval might already exist or failed" -ForegroundColor Yellow
}

# Step 4: Buy ticket
Write-Host ""
Write-Host "📋 Step 4: Buying ticket..." -ForegroundColor Yellow
$buyResult = stellar contract invoke --id $LOTTERY_CONTRACT --source $ADMIN_KEY --network $NETWORK -- buy_ticket --round_id $roundId --participant $ADMIN_ADDRESS --amount $TICKET_PRICE --commit_hash $commitHash 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Ticket purchased successfully!" -ForegroundColor Green
} else {
    Write-Host "  ✗ Ticket purchase failed" -ForegroundColor Red
    Write-Host $buyResult
    exit 1
}

# Step 5: Verify round status
Write-Host ""
Write-Host "📋 Step 5: Verifying round status..." -ForegroundColor Yellow
$roundInfo = stellar contract invoke --id $LOTTERY_CONTRACT --source $ADMIN_KEY --network $NETWORK -- view_round --round_id $roundId 2>&1 | ConvertFrom-Json
Write-Host "  Round ID: $($roundInfo.round_id)" -ForegroundColor Cyan
Write-Host "  Participants: $($roundInfo.participants_count)" -ForegroundColor Cyan
Write-Host "  Total Pool: $($roundInfo.total_pool)" -ForegroundColor Cyan
Write-Host "  Is Active: $($roundInfo.is_active)" -ForegroundColor Cyan
Write-Host "  End Time: $($roundInfo.end_time)" -ForegroundColor Cyan

# Calculate wait time
$endTime = [long]$roundInfo.end_time
$currentTime = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$waitSeconds = $endTime - $currentTime

if ($waitSeconds -gt 0) {
    Write-Host ""
    Write-Host "⏳ Step 6: Waiting for round to end..." -ForegroundColor Yellow
    Write-Host "  Round ends in approximately $([math]::Floor($waitSeconds / 60)) minutes" -ForegroundColor Cyan
    Write-Host "  End time (Unix timestamp): $endTime" -ForegroundColor Cyan
    Write-Host "  Current time (Unix timestamp): $currentTime" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  For testing, you can:" -ForegroundColor Yellow
    Write-Host "  1. Wait for round to end naturally" -ForegroundColor White
    Write-Host "  2. Manually reveal seed after end_time" -ForegroundColor White
    Write-Host "  3. Manually finalize after reveal_deadline" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "📋 Step 6: Round has ended, revealing seed..." -ForegroundColor Yellow
    $seedBytes = [System.Convert]::FromHexString($seedHex)
    $revealResult = stellar contract invoke --id $LOTTERY_CONTRACT --source $ADMIN_KEY --network $NETWORK -- reveal_seed --round_id $roundId --participant $ADMIN_ADDRESS --seed $seedHex 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Seed revealed successfully!" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Seed reveal failed" -ForegroundColor Red
        Write-Host $revealResult
    }
}

Write-Host ""
Write-Host "✅ Test workflow completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Saved files:" -ForegroundColor Cyan
Write-Host "  - test_seed.txt (save this for reveal)" -ForegroundColor White
Write-Host "  - test_commit_hash.txt" -ForegroundColor White
Write-Host ""
Write-Host "Manual commands:" -ForegroundColor Yellow
Write-Host "  Reveal seed:" -ForegroundColor White
Write-Host "  stellar contract invoke --id $LOTTERY_CONTRACT --source $ADMIN_KEY --network $NETWORK -- reveal_seed --round_id $roundId --participant $ADMIN_ADDRESS --seed <SEED_FROM_FILE>" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Finalize round:" -ForegroundColor White
Write-Host "  stellar contract invoke --id $LOTTERY_CONTRACT --source $ADMIN_KEY --network $NETWORK -- finalize_round --round_id $roundId" -ForegroundColor Cyan

