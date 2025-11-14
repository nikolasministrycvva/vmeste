# Git setup script for Vместе project
# Run this script from the project directory: .\setup-git.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== Git Setup for Vместе Project ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Initialize git repository
Write-Host "[1/6] Initializing git repository..." -ForegroundColor Yellow
if (Test-Path .git) {
    Write-Host "  Git repository already exists, skipping init" -ForegroundColor Gray
} else {
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERROR: Failed to initialize git repository" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✓ Git repository initialized" -ForegroundColor Green
}

# Step 2: Add all project files
Write-Host "[2/6] Adding all project files..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Failed to add files" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Files added to staging area" -ForegroundColor Green

# Step 3: Create initial commit
Write-Host "[3/6] Creating initial commit..." -ForegroundColor Yellow
$commitOutput = git commit -m "Initial commit" 2>&1
if ($LASTEXITCODE -ne 0) {
    if ($commitOutput -match "nothing to commit") {
        Write-Host "  No changes to commit (repository may already have commits)" -ForegroundColor Gray
    } else {
        Write-Host "  ERROR: Failed to create commit" -ForegroundColor Red
        Write-Host "  $commitOutput" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✓ Initial commit created" -ForegroundColor Green
}

# Step 4: Set default branch to main
Write-Host "[4/6] Setting default branch to main..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    git branch -M main 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Branch renamed to main" -ForegroundColor Green
    } else {
        # Try creating main branch if it doesn't exist
        git checkout -b main 2>$null
        Write-Host "  ✓ Created and switched to main branch" -ForegroundColor Green
    }
} else {
    Write-Host "  ✓ Already on main branch" -ForegroundColor Green
}

# Step 5: Add remote origin
Write-Host "[5/6] Adding remote origin..." -ForegroundColor Yellow
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    git remote set-url origin https://github.com/novelromaxa/vmeste.git
    Write-Host "  ✓ Remote origin updated" -ForegroundColor Green
} else {
    git remote add origin https://github.com/novelromaxa/vmeste.git
    Write-Host "  ✓ Remote origin added" -ForegroundColor Green
}

# Step 6: Push to GitHub
Write-Host "[6/6] Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "  This may require authentication..." -ForegroundColor Gray
git push -u origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "  WARNING: Push failed. You may need to:" -ForegroundColor Yellow
    Write-Host "    1. Authenticate with GitHub (use Personal Access Token)" -ForegroundColor Yellow
    Write-Host "    2. Run: git push -u origin main" -ForegroundColor Yellow
} else {
    Write-Host "  ✓ Code pushed to GitHub successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host "Repository: https://github.com/novelromaxa/vmeste" -ForegroundColor Cyan

