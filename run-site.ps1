Write-Host "=== CaveBoxing Site Launcher & Deployer ===" -ForegroundColor Cyan

# Go to the project folder
Set-Location "C:\Users\humza\GitHub\caveboxingsitev0"

# 1️⃣ Pull latest from GitHub
Write-Host "`n1/7 Pulling latest from GitHub..." -ForegroundColor Yellow
try {
    git pull origin main
} catch {
    Write-Host "⚠ Git pull failed" -ForegroundColor Red
}

# 2️⃣ Stage any local changes
Write-Host "`n2/7 Staging changes..." -ForegroundColor Yellow
git add .

# 3️⃣ Commit changes if there are any
Write-Host "`n3/7 Committing changes..." -ForegroundColor Yellow
$commitMsg = "Auto-deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
try {
    git commit -m "$commitMsg"
} catch {
    Write-Host "⚠ Nothing to commit" -ForegroundColor DarkGray
}

# 4️⃣ Push to GitHub (this triggers hosting to deploy)
Write-Host "`n4/7 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

# 5️⃣ Clear cache and dependencies locally
Write-Host "`n5/7 Clearing cache..." -ForegroundColor Yellow
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
if (Test-Path "pnpm-lock.yaml") { Remove-Item -Force "pnpm-lock.yaml" }

# 6️⃣ Install dependencies and build locally
Write-Host "`n6/7 Installing dependencies & building site..." -ForegroundColor Yellow
pnpm install
pnpm build

# 7️⃣ Start local dev server
Write-Host "`n7/7 Starting local server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "pnpm start" -WorkingDirectory "C:\Users\humza\GitHub\caveboxingsitev0"

# Open browser to local site
Start-Process "msedge.exe" "http://localhost:3000"

Write-Host "`n=== Done! Site changes have been pushed and are deploying online. ===" -ForegroundColor Green
Pause
