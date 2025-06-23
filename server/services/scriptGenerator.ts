export interface ScriptTemplate {
  name: string;
  content: string;
  description: string;
}

export function generateInstallDependenciesScript(): ScriptTemplate {
  return {
    name: 'install_dependencies.bat',
    description: 'Installs project dependencies using npm',
    content: `@echo off
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
pause`
  };
}

export function generateStartAppScript(): ScriptTemplate {
  return {
    name: 'start_app.bat',
    description: 'Starts the development server',
    content: `@echo off
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
pause`
  };
}

export function generateBuildAppScript(): ScriptTemplate {
  return {
    name: 'build_app.bat',
    description: 'Builds the application for production',
    content: `@echo off
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
pause`
  };
}

export function getAllScriptTemplates(): ScriptTemplate[] {
  return [
    generateInstallDependenciesScript(),
    generateStartAppScript(),
    generateBuildAppScript(),
  ];
}
