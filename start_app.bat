@echo off
echo =============================================
echo   Starting Development Server
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
    echo WARNING: node_modules directory not found
    echo Please run install_dependencies.bat first
    echo.
    set /p continue="Continue anyway? (y/N): "
    if /i not "%continue%"=="y" (
        echo.
        echo Run install_dependencies.bat to install dependencies first
        echo.
        pause
        exit /b 1
    )
)

REM Start the development server
echo Starting development server...
echo.
echo The application will be available at http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

npm run dev

REM If the server stops unexpectedly
if %errorlevel% neq 0 (
    echo.
    echo =============================================
    echo   Development server stopped with an error
    echo =============================================
    echo.
    echo Please check the error messages above
)

echo.
pause
