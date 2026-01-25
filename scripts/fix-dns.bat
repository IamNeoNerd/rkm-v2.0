@echo off
:: Batch script to apply DNS workaround for Neon Database
:: This script must be run as Administrator

set "HOSTS_FILE=%SystemRoot%\System32\drivers\etc\hosts"
set "IP_ADDR=98.89.62.209"
set "HOST1=ep-patient-bird-ah9hhxtl-pooler.c-3.us-east-1.aws.neon.tech"
set "HOST2=api.c-3.us-east-1.aws.neon.tech"

echo Checking for Administrative privileges...
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Administrative privileges confirmed.
) else (
    echo [ERROR] Please right-click this file and select 'Run as administrator'.
    pause
    exit /b 1
)

echo.
echo Applying DNS mappings to: %HOSTS_FILE%

:: Check if already exists to avoid duplicates
findstr /C:"%HOST1%" "%HOSTS_FILE%" >nul
if %errorLevel% == 0 (
    echo [INFO] Mapping for %HOST1% already exists. Skipping.
) else (
    echo %IP_ADDR% %HOST1% >> "%HOSTS_FILE%"
    echo [OK] Added mapping for %HOST1%
)

findstr /C:"%HOST2%" "%HOSTS_FILE%" >nul
if %errorLevel% == 0 (
    echo [INFO] Mapping for %HOST2% already exists. Skipping.
) else (
    echo %IP_ADDR% %HOST2% >> "%HOSTS_FILE%"
    echo [OK] Added mapping for %HOST2%
)

echo.
echo Flushing DNS cache...
ipconfig /flushdns

echo.
echo ----------------------------------------------------
echo [SUCCESS] Workaround applied. 
echo You can now restart your dev server and log in.
echo ----------------------------------------------------
pause
