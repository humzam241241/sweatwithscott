param(
  [switch]$CleanAll,
  [switch]$Prod
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

# 5️⃣ Build the site (only for -Prod). In dev we skip build.
Write-Host "`n5/7 Building site..." -ForegroundColor Yellow
if ($Prod) {
  pnpm build
  # Ensure production artifacts exist; if missing, force a rebuild
  function Test-BuildReady {
    return (Test-Path ".next/server/middleware-manifest.json") -and (Test-Path ".next/required-server-files.json")
  }
  if (-not (Test-BuildReady)) {
    Write-Host "Build artifacts missing; performing a clean rebuild..." -ForegroundColor DarkYellow
    try { Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue } catch {}
    pnpm build
  }
} else {
  Write-Host "Dev mode: skipping production build" -ForegroundColor DarkGray
}

# 6️⃣ Start the site locally and open browser
Write-Host "`n6/7 Starting local server..." -ForegroundColor Yellow

# Force port 3000 for Google OAuth redirect_uri to match console settings
$port = 3000
Write-Host "Using fixed port $port (required for Google OAuth redirect)" -ForegroundColor Green

# Launch browser after server starts
Start-Job { param($p) Start-Sleep 3; Start-Process ("http://localhost:" + $p) } -ArgumentList $port | Out-Null
 # Ensure NextAuth and app URL match the chosen port to avoid session cookie issues
 $env:NEXTAUTH_URL = "http://localhost:$port"
 $env:NEXT_PUBLIC_APP_URL = "http://localhost:$port"
 Write-Host "NEXTAUTH_URL set to $env:NEXTAUTH_URL" -ForegroundColor DarkGray
if ($Prod) {
  pnpm exec next start . -p $port
} else {
  pnpm dev --port $port
}

# 7. Keep window open after exit
Write-Host "";
Read-Host 'Press Enter to close'
