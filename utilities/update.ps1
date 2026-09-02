<#
.SYNOPSIS
    update.ps1 — Script to update forgeAB system files safely in PowerShell
.DESCRIPTION
    Keeps project files (openspec/, project-logs/, diagrams/) intact while updating system prompts.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$ForgeABRepo = "https://github.com/MMRos/forgeAB.git"
$RemoteName = "forgeab-upstream"
$Branch = "master"

Write-Host "`n🚀 Starting forgeAB update via PowerShell...`n" -ForegroundColor Cyan

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "git is not installed or not in PATH."
    exit 1
}

$remotes = git remote
if ($remotes -notcontains $RemoteName) {
    Write-Host "🔗 Adding remote '$RemoteName'..." -ForegroundColor Cyan
    git remote add $RemoteName $ForgeABRepo
} else {
    git remote set-url $RemoteName $ForgeABRepo
}

Write-Host "📥 Fetching updates from upstream repository..." -ForegroundColor Cyan
git fetch $RemoteName $Branch

$systemFiles = @(
    "utilities/agents/*.md",
    "CLAUDE.md",
    ".antigravity/context.md",
    ".opencode/instructions.md",
    "utilities/VERSION",
    "utilities/CHANGELOG.md",
    "utilities/templates/",
    "README.md",
    ".github/"
)

Write-Host "🔄 Updating system files..." -ForegroundColor Cyan
git checkout "$RemoteName/$Branch" -- $systemFiles

Write-Host "`n✅ forgeAB updated successfully!" -ForegroundColor Green
Write-Host "Your project progress, openspec/ and project-logs/ files remain untouched.`n"

if (Test-Path "utilities/VERSION") {
    $version = Get-Content "utilities/VERSION"
    Write-Host "📦 Installed version: v$version" -ForegroundColor Green
}
