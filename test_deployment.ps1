# Testnet Deployment Script for Lottery Contract
# Run this script to deploy and test the lottery contract on Stellar Testnet

$ErrorActionPreference = "Stop"

Write-Host "🎰 Lottery Contract Testnet Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Configuration
$CONTRACT_ID = "CBPXXFNCXGMFOUHGHRKF6OBKTKX7MVGGGNOXJ7LWGNURS74QXTKLK5YV"
$ADMIN_KEY = "praanshuu"
$ADMIN_ADDRESS = "SB45VDMW3XV7ZHRGNG5ZWJW6OJTLFRD2X7DEU2SWBMKOUJZG3ZK42ZBF"

Write-Host "`n📋 Configuration:" -ForegroundColor Yellow
Write-Host "  Contract ID: $CONTRACT_ID"
Write-Host "  Admin Key: $ADMIN_KEY"
Write-Host "  Admin Address: $ADMIN_ADDRESS"

# Step 1: Check contract is accessible
Write-Host "`n✅ Step 1: Verifying contract deployment..." -ForegroundColor Green
$result = stellar contract invoke --id $CONTRACT_ID --network testnet -- view_round --round_id 0 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Contract is accessible" -ForegroundColor Green
} else {
    Write-Host "  ✗ Contract not accessible. Please deploy first." -ForegroundColor Red
    exit 1
}

# Step 2: Note about token contract
Write-Host "`n⚠️  Step 2: Token Contract Required" -ForegroundColor Yellow
Write-Host "  To initialize the contract, you need a token contract address."
Write-Host "  Options:"
Write-Host "    1. Deploy a test token contract"
Write-Host "    2. Use an existing testnet token contract"
Write-Host ""
Write-Host "  For now, you can manually initialize with:"
Write-Host "  stellar contract invoke --id $CONTRACT_ID --source $ADMIN_KEY --network testnet -- init_admin --admin $ADMIN_ADDRESS --token TOKEN_CONTRACT_ADDRESS" -ForegroundColor Cyan

# Step 3: Instructions for manual testing
Write-Host "`n📝 Step 3: Manual Testing Steps" -ForegroundColor Yellow
Write-Host ""
Write-Host "After initializing with a token contract:"
Write-Host "  1. Create round:"
Write-Host "     stellar contract invoke --id $CONTRACT_ID --source $ADMIN_KEY --network testnet -- create_round --ticket_price 1000000 --duration_hours 1 --allow_multiple false" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. View round:"
Write-Host "     stellar contract invoke --id $CONTRACT_ID --network testnet -- view_round --round_id 1" -ForegroundColor Cyan

Write-Host "`n✅ Deployment script complete!" -ForegroundColor Green

