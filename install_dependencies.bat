@echo off
echo =============================================
echo   Installing Project Dependencies
echo =============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    echo Please ensure npm is properly installed with Node.js
    echo.
    pause
    exit /b 1
)

REM Display Node.js and npm versions
echo Node.js version:
node --version
echo npm version:
npm --version
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found in current directory
    echo Please run this script from the project root directory
    echo.
    pause
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
echo.
npm install

REM Check if installation was successful
if %errorlevel% equ 0 (
    echo.
    echo =============================================
    echo   Dependencies installed successfully!
    echo =============================================
    echo.
    echo You can now run the application using start_app.bat
) else (
    echo.
    echo =============================================
    echo   ERROR: Failed to install dependencies
    echo =============================================
    echo.
    echo Please check the error messages above and try again
)

echo.
pause
