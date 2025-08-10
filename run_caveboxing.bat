@echo off
title CaveBoxing Site Launcher
color 0A
setlocal EnableDelayedExpansion

:: === Change to your project directory ===
cd /d "C:\Users\humza\GitHub\caveboxingsitev0"

echo =====================================
echo      CaveBoxing Site Launcher
echo =====================================
echo.

:: Function to simulate progress bar
set "BAR="
for /L %%i in (1,1,50) do set "BAR=!BAR!¦"

:progress
setlocal
set "FILLED="
for /L %%i in (1,1,%1) do set "FILLED=!FILLED!¦"
set "EMPTY=!BAR:~%1!"
<nul set /p="[%FILLED%%EMPTY%] %2"
endlocal
echo.

:: Step 1: Pull latest code
call :progress 5 "Pulling latest code from GitHub..."
git pull origin main
if %errorlevel% neq 0 echo Git pull failed! && pause && exit /b
timeout /t 1 >nul

:: Step 2: Clean old build files
call :progress 15 "Cleaning old build files..."
rd /s /q .next 2>nul
rd /s /q node_modules 2>nul
timeout /t 1 >nul

:: Step 3: Install dependencies
call :progress 45 "Installing dependencies..."
pnpm install
if %errorlevel% neq 0 echo Dependency install failed! && pause && exit /b
timeout /t 1 >nul

:: Step 4: Build project
call :progress 75 "Building project..."
pnpm build
if %errorlevel% neq 0 echo Build failed! && pause && exit /b
timeout /t 1 >nul

:: Step 5: Launch site in new terminal
call :progress 90 "Launching site in new window..."
start cmd /k "cd /d C:\Users\humza\GitHub\caveboxingsitev0 && pnpm start"
timeout /t 3 >nul

:: Step 6: Open Microsoft Edge automatically
call :progress 100 "Opening in Microsoft Edge..."
start microsoft-edge:http://localhost:3000

echo.
echo =====================================
echo   Site launched successfully!
echo =====================================
pause
exit /b

