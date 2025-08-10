param(
  [switch]$CleanAll
)

Write-Host "=== CaveBoxing Site Launcher & Deployer ===" -ForegroundColor Cyan

# 1️⃣ Pull latest from origin/main
Write-Host "`n1/7 Pulling latest from GitHub..." -ForegroundColor Yellow
try {
  git pull origin main
} catch {
  Write-Host "⚠ Git pull failed" -ForegroundColor Red
}

# 2️⃣ Commit and push any local changes
Write-Host "`n2/7 Checking for local changes..." -ForegroundColor Yellow
if (git status --porcelain) {
  git add .
  $commitMsg = "Auto-deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
  git commit -m $commitMsg
  git push origin main
  Write-Host "Local changes committed and pushed." -ForegroundColor Green
} else {
  Write-Host "No local changes to commit." -ForegroundColor DarkGray
}

# Helper to remove paths quietly and robustly
function Remove-PathSafe {
  param([string]$Path)
  if (Test-Path -LiteralPath $Path) {
    Write-Host "Removing $Path ..." -ForegroundColor DarkGray
    try { Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction Stop } catch {}
    # Fallback to cmd rd to handle deep trees on Windows
    if (Test-Path -LiteralPath $Path) {
      try { cmd /c rd /s /q "$Path" | Out-Null } catch {}
    }
  }
}

# 3️⃣ Clear build cache (safe by default). Use -CleanAll to also nuke node_modules
Write-Host "`n3/7 Clearing cache..." -ForegroundColor Yellow
Remove-PathSafe ".next"
Remove-PathSafe ".turbo"
if ($CleanAll) {
  Write-Host "-CleanAll specified: removing node_modules and lockfile" -ForegroundColor DarkYellow
  Remove-PathSafe "node_modules"
  Remove-PathSafe "pnpm-lock.yaml"
}

# 4️⃣ Install dependencies
Write-Host "`n4/7 Installing dependencies..." -ForegroundColor Yellow
pnpm install

# 5️⃣ Build the site
Write-Host "`n5/7 Building site..." -ForegroundColor Yellow
pnpm build

# 6️⃣ Start the site locally and open browser
Write-Host "`n6/7 Starting local server..." -ForegroundColor Yellow

# Ensure port 3000 is free (kill any process listening on it)
try {
  $conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction Stop
  if ($conn) {
    $pid = $conn.OwningProcess
    Write-Host "Port 3000 busy - killing process $pid ..." -ForegroundColor DarkYellow
    Stop-Process -Id $conn.OwningProcess -Force
    Start-Sleep -Seconds 2
  }
} catch { }

# Launch browser after server starts
Start-Job { Start-Sleep 5; Start-Process 'http://localhost:3000' } | Out-Null
# Using pnpm exec; avoids extra -- token
pnpm exec next start . -p 3000

# 7. Keep window open after exit
Write-Host "";
Read-Host 'Press Enter to close'
