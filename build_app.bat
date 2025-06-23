@echo off
echo =============================================
echo   Building Application for Production
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

REM Check if package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found in current directory
    echo Please run this script from the project root directory
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo ERROR: node_modules directory not found
    echo Please run install_dependencies.bat first
    echo.
    pause
    exit /b 1
)

REM Clean previous build
if exist "dist" (
    echo Cleaning previous build...
    rmdir /s /q "dist"
    echo.
)

REM Build the application
echo Building application...
echo.
npm run build

REM Check if build was successful
if %errorlevel% equ 0 (
    echo.
    echo =============================================
    echo   Build completed successfully!
    echo =============================================
    echo.
    echo Production files are available in the 'dist' directory
    echo You can deploy these files to your production server
    echo.
    echo To test the production build locally, run:
    echo npm run start
) else (
    echo.
    echo =============================================
    echo   ERROR: Build failed
    echo =============================================
    echo.
    echo Please check the error messages above and fix any issues
)

echo.
pause
