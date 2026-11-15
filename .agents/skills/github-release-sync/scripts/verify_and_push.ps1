param(
    [Parameter(Mandatory=$false)][string]$Version = "v1.0.0",
    [Parameter(Mandatory=$false)][string]$Message = "Verified error-free version update",
    [Parameter(Mandatory=$false)][string]$RepoName = "evoxxlaunch",
    [Parameter(Mandatory=$false)][string]$ProjectDir = (Get-Location).Path
)

$ErrorActionPreference = "Stop"
Set-Location $ProjectDir

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host " [1/4] Secret & Gitignore Safety Check               " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

if (-not (Test-Path ".gitignore")) {
    Write-Error "Missing .gitignore file! Refusing to proceed."
    exit 1
}

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host " [2/4] Verifying Backend (FastAPI + SQLAlchemy)      " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

if (Test-Path "backend/main.py") {
    python -c "from backend.main import app; print('Backend verification passed: FastAPI app loaded cleanly.')"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Backend verification failed! Aborting GitHub upload."
        exit 1
    }
}

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host " [3/4] Verifying Frontend Production Build (Vite)    " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

if (Test-Path "frontend/package.json") {
    Push-Location "frontend"
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        Write-Error "Frontend build failed! Aborting GitHub upload."
        exit 1
    }
    Pop-Location
    Write-Host "Frontend production build passed with zero errors." -ForegroundColor Green
}

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host " [4/4] Syncing Verified Version ($Version) to GitHub " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

if (-not (Test-Path ".git")) {
    git init
    git branch -M main
}

# Ensure .env is never staged
if (Test-Path ".env") {
    $ignored = git check-ignore ".env"
    if (-not $ignored) {
        Write-Error ".env is NOT ignored by git! Aborting to protect credentials."
        exit 1
    }
}

# Check or configure remote origin
$remoteUrl = $null
try {
    $remoteUrl = git remote get-url origin 2>$null
} catch {}

if (-not $remoteUrl) {
    # Retrieve token from git credential manager to ensure repo exists on GitHub
    $credInput = "protocol=https`nhost=github.com`n`n"
    $credOutput = $credInput | git credential fill
    $userLine = ($credOutput | Select-String "^username=(.+)$").Matches.Groups[1].Value.Trim()
    $passLine = ($credOutput | Select-String "^password=(.+)$").Matches.Groups[1].Value.Trim()

    if ($userLine -and $passLine) {
        $headers = @{
            "Authorization" = "token $passLine"
            "Accept"        = "application/vnd.github+json"
            "User-Agent"    = "EvoxxLaunch-Release-Skill"
        }
        try {
            $repoCheck = Invoke-RestMethod -Uri "https://api.github.com/repos/$userLine/$RepoName" -Headers $headers -Method Get -ErrorAction Stop
            Write-Host "Found existing GitHub repository: $($repoCheck.html_url)" -ForegroundColor Green
        } catch {
            Write-Host "Creating new GitHub repository '$RepoName' under '$userLine'..." -ForegroundColor Yellow
            $body = @{
                name        = $RepoName
                description = "EvoxxLaunch — Amazon India Product Automation Web App (FastAPI + React + SP-API)"
                private     = $false
            } | ConvertTo-Json
            $created = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Headers $headers -Method Post -Body $body -ContentType "application/json"
            Write-Host "Created GitHub repository: $($created.html_url)" -ForegroundColor Green
        }
        $remoteUrl = "https://github.com/$userLine/$RepoName.git"
        git remote add origin $remoteUrl
    } else {
        Write-Error "Could not retrieve GitHub credentials from Git Credential Manager."
        exit 1
    }
}

git add -A
$status = git status --porcelain
if ($status) {
    git commit -m "release($Version): $Message"
} else {
    Write-Host "Working tree already clean; verifying tag & remote push." -ForegroundColor Yellow
}

# Tag version if not already tagged
$existingTag = git tag -l $Version
if (-not $existingTag) {
    git tag -a $Version -m "Verified error-free release $Version - $Message"
}

git push -u origin main --tags
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to push to GitHub remote."
    exit 1
}

Write-Host "Successfully verified and pushed $Version to $remoteUrl" -ForegroundColor Green
