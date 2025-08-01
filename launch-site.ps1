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

# 3️⃣ Clear cache and dependencies
Write-Host "`n3/7 Clearing cache..." -ForegroundColor Yellow
$paths = @('.next','node_modules','pnpm-lock.yaml')
foreach ($p in $paths) {
    if (Test-Path $p) { Remove-Item $p -Recurse -Force }
}

# 4️⃣ Install dependencies
Write-Host "`n4/7 Installing dependencies..." -ForegroundColor Yellow
pnpm install

# 5️⃣ Build the site
Write-Host "`n5/7 Building site..." -ForegroundColor Yellow
pnpm build

# 6️⃣ Start the site locally and open browser
Write-Host "`n6/7 Starting local server..." -ForegroundColor Yellow
Start-Job { Start-Sleep 5; Start-Process "http://localhost:3000" } | Out-Null
pnpm start

# 7️⃣ Keep window open after exit
Read-Host "`n7/7 Press Enter to close"
