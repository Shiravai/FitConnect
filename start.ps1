Write-Host "`n=== FitConnect Startup ===" -ForegroundColor Cyan

# 1. Start the backend server
Write-Host "`n[1/3] Starting backend server..." -ForegroundColor Yellow
$serverJob = Start-Job -ScriptBlock {
    Set-Location "$using:PSScriptRoot\server"
    node server.js 2>&1
}
Start-Sleep 3
$serverOutput = Receive-Job $serverJob
if ($serverOutput -match "Server running") {
    Write-Host "  Backend running on http://localhost:5000" -ForegroundColor Green
} else {
    Write-Host "  Backend output: $serverOutput" -ForegroundColor Red
    Write-Host "  Make sure server/.env exists with MONGO_URI" -ForegroundColor Red
}

# 2. Start Cloudflare tunnel for backend (free, no signup)
Write-Host "`n[2/3] Starting Cloudflare tunnel for backend..." -ForegroundColor Yellow
$tunnelLog = "$env:TEMP\fc_tunnel.log"
$tunnelProc = Start-Process -FilePath "npx" -ArgumentList "cloudflared tunnel --url http://localhost:5000" `
    -RedirectStandardError $tunnelLog -WindowStyle Hidden -PassThru

# Wait for tunnel URL
$apiUrl = $null
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep 1
    if (Test-Path $tunnelLog) {
        $match = Select-String -Path $tunnelLog -Pattern "https://[a-z0-9-]+\.trycloudflare\.com" | Select-Object -First 1
        if ($match) {
            $apiUrl = ($match.Matches[0].Value)
            break
        }
    }
}

if ($apiUrl) {
    Write-Host "  Backend tunnel: $apiUrl" -ForegroundColor Green
} else {
    Write-Host "  Tunnel failed. Check $tunnelLog" -ForegroundColor Red
    Write-Host "  App will still work on same WiFi (LAN mode)" -ForegroundColor Yellow
}

# 3. Start Expo with tunnel
Write-Host "`n[3/3] Starting Expo..." -ForegroundColor Yellow
Write-Host "  Scan the QR code with Expo Go on your phone" -ForegroundColor Yellow

if ($apiUrl) {
    Write-Host "`n  Share this with friends/professor:" -ForegroundColor Cyan
    Write-Host "  Backend API: $apiUrl" -ForegroundColor White
}

Write-Host "`n  Press Ctrl+C to stop everything.`n" -ForegroundColor Gray

# Set API_URL env var and start Expo
$env:API_URL = $apiUrl
Set-Location "$PSScriptRoot\mobile"
npx expo start --tunnel

# Cleanup on exit
if ($tunnelProc -and !$tunnelProc.HasExited) { $tunnelProc.Kill() }
Stop-Job $serverJob -ErrorAction SilentlyContinue
Remove-Job $serverJob -ErrorAction SilentlyContinue
