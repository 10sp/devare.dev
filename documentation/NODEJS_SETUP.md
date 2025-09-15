# Node.js Version Setup

This project requires Node.js version 18.x to ensure compatibility with all dependencies and build tools.

## Prerequisites

Before setting up the project, ensure you have Node Version Manager (NVM) installed:

### For macOS/Linux:
1. Install NVM by following the instructions at: https://github.com/nvm-sh/nvm#installing-and-updating
2. Restart your terminal after installation

### For Windows:
1. Install NVM for Windows from: https://github.com/coreybutler/nvm-windows#installation--upgrades
2. Restart your command prompt or PowerShell after installation

## Setting up Node.js 18

### Method 1: Automatic Setup (Recommended)

This project includes helper scripts to automatically set up the correct Node.js version:

**For macOS/Linux:**
```bash
$ ./script/ensure-node-version.sh
```

**For Windows:**
```cmd
> script\ensure-node-version.bat
```

These scripts will:
1. Check if the required Node.js version (18.20.0) is installed
2. Install it if missing
3. Switch to that version automatically

### Method 2: Manual Setup

1. Check the required Node.js version:
   ```bash
   $ cat .nvmrc
   ```

2. Install the required Node.js version:
   ```bash
   $ nvm install 18.20.0
   ```

3. Switch to the required Node.js version:
   ```bash
   $ nvm use 18.20.0
   ```

4. Verify the Node.js version:
   ```bash
   $ node --version
   # Should output: v18.20.0
   ```

## Verification

After setting up Node.js 18, you can verify your setup by running:

```bash
$ node --version
$ npm --version
```

Both commands should show versions compatible with Node.js 18.

## Troubleshooting

### "nvm: command not found"
- Make sure you've installed NVM correctly
- Restart your terminal/command prompt
- For macOS/Linux, ensure the NVM initialization script is in your shell profile

### "N/A: version "18.20.0 -> N/A" is not yet installed"
- Run `nvm install 18.20.0` to install the version first
- Then run `nvm use 18.20.0`

### "Your Node.js version is not supported"
- Ensure you're using the exact version specified in `.nvmrc`
- Check that you've run `nvm use` in your current terminal session