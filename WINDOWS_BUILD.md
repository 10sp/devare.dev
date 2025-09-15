# Windows Build Instructions

This document provides instructions for building the Hackertab extension on Windows.

## Prerequisites

1. Node.js and Yarn installed
2. jq installed and available in PATH
3. PowerShell enabled

## Build Scripts

We've provided Windows-compatible scripts for building the extension:

### Batch Scripts (.bat)

- `script\build.bat` - General build script
- `script\build-chrome.bat` - Chrome extension build script
- `script\build-firefox.bat` - Firefox extension build script

### PowerShell Scripts (.ps1)

- `script\build.ps1` - General build script
- `script\build-chrome.ps1` - Chrome extension build script
- `script\build-firefox.ps1` - Firefox extension build script

## Usage

### Building for Web

```cmd
npm run build:web:windows
```

or with PowerShell:

```powershell
npm run build:web:powershell
```

### Building for Extension

```cmd
npm run build:ext:windows
```

or with PowerShell:

```powershell
npm run build:ext:powershell
```

### Building Chrome Extension

```cmd
npm run build:chrome:windows
```

or with PowerShell:

```powershell
npm run build:chrome:powershell
```

### Building Firefox Extension

```cmd
npm run build:firefox:windows
```

or with PowerShell:

```powershell
npm run build:firefox:powershell
```

## Manual Execution

You can also run the scripts directly:

### With Command Prompt

```cmd
script\build-chrome.bat
```

### With PowerShell

```powershell
script\build-chrome.ps1
```

## Notes

1. The scripts use PowerShell's Compress-Archive cmdlet to create ZIP files
2. Make sure jq is installed and available in your PATH
3. The environment variable syntax is different on Windows (using `set` command for batch, `$env:` for PowerShell)
4. You may need to enable PowerShell script execution with `Set-ExecutionPolicy RemoteSigned` if you haven't already
