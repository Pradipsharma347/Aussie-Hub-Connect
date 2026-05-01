@echo off
echo ========================================
echo   Kaam App - Frontend (Expo)
echo ========================================

REM Auto-detect local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set RAW_IP=%%a
    goto :found
)

:found
REM Remove leading space from IP
set LOCAL_IP=%RAW_IP:~1%

echo Detected IP: %LOCAL_IP%
echo Backend URL: http://%LOCAL_IP%:5000
echo.
echo Make sure your phone is on the SAME WiFi as this laptop!
echo.

set EXPO_PUBLIC_DOMAIN=%LOCAL_IP%:5000
npx expo start
pause
