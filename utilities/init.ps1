<#
.SYNOPSIS
    init.ps1 — AI Development forgeAB Initializer (OpenSpec SDD Integrated)
.DESCRIPTION
    PowerShell native initializer for forgeAB on Windows environments.
    Usage:
        powershell -ExecutionPolicy Bypass -File utilities/init.ps1
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$UtilitiesDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ForgeABRoot = Split-Path -Parent $UtilitiesDir

if ((Test-Path "$ForgeABRoot\package.json") -or (Test-Path "$ForgeABRoot\.git")) {
    $ProjectRoot = $ForgeABRoot
} else {
    $ProjectRoot = Split-Path -Parent $ForgeABRoot
}

$TemplatesDir = Join-Path $UtilitiesDir "templates"
$LogsDir = Join-Path $ProjectRoot "project-logs"
$OpenSpecDir = Join-Path $ProjectRoot "openspec"
$DiagramsDir = Join-Path $ProjectRoot "diagrams"

function Write-Ok([string]$msg)   { Write-Host "  [OK]   $msg" -ForegroundColor Green }
function Write-Info([string]$msg) { Write-Host "  [INFO] $msg" -ForegroundColor Cyan }
function Write-Warn([string]$msg) { Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function Write-Fail([string]$msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "  AI Development forgeAB -- PowerShell Initializer (OpenSpec SDD)" -ForegroundColor Cyan
Write-Host "  -------------------------------------------------------------"
Write-Host ""

# ── 0. Environment review and security checks ────────────────────────────────
Write-Info "Running environment review and security checks..."

if ($ProjectRoot -match '^[a-zA-Z]:\\?$') {
    Write-Fail "The harness must not run in the drive root directory."
}
Write-Ok "Safe execution environment (Project at: $ProjectRoot)"

if (-not (Test-Path $TemplatesDir) -or -not (Test-Path "$UtilitiesDir\agents")) {
    Write-Fail "Harness base structure missing templates or agents folder."
}
Write-Ok "Harness base structure validated"

if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Ok "git detected in environment"
} else {
    Write-Warn "git is not installed or not in PATH."
}

if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    Write-Ok "pnpm detected in environment"
} else {
    Write-Warn "pnpm is strongly recommended for Node projects to enforce anti-CRAP gates."
}

Write-Host ""

# ── 1. State files initialization (project-logs/) ────────────────────────────
Write-Info "Verifying state files (project-logs/)..."
if (-not (Test-Path $LogsDir)) { New-Item -ItemType Directory -Path $LogsDir | Out-Null }

$stateFiles = @("current-dev.yaml", "story-dev.yaml", "error-log.yaml")
foreach ($sf in $stateFiles) {
    $target = Join-Path $LogsDir $sf
    if (-not (Test-Path $target)) {
        $tmpl = Join-Path $TemplatesDir $sf
        if (Test-Path $tmpl) {
            Copy-Item $tmpl $target
            Write-Ok "project-logs/$sf created from template"
        }
    } else {
        Write-Ok "project-logs/$sf already exists"
    }
}

# ── 2. OpenSpec structure deployment ─────────────────────────────────────────
Write-Info "Verifying OpenSpec structure (openspec/)..."
$specsDir = Join-Path $OpenSpecDir "specs"
$archiveDir = Join-Path $OpenSpecDir "changes\archive"
if (-not (Test-Path $specsDir)) { New-Item -ItemType Directory -Path $specsDir -Force | Out-Null }
if (-not (Test-Path $archiveDir)) { New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null }

$openSpecConfig = Join-Path $OpenSpecDir "config.yaml"
if (-not (Test-Path $openSpecConfig)) {
    $tmplConfig = Join-Path $TemplatesDir "openspec\config.yaml"
    if (Test-Path $tmplConfig) {
        Copy-Item $tmplConfig $openSpecConfig
        Write-Ok "openspec/config.yaml created"
    }
} else {
    Write-Ok "openspec/config.yaml already exists"
}

# ── 3. Architectural Diagrams (diagrams/) ────────────────────────────────────
Write-Info "Verifying architectural diagrams..."
if (-not (Test-Path $DiagramsDir)) { New-Item -ItemType Directory -Path $DiagramsDir | Out-Null }

$diagrams = @("class-diagram", "use-case", "sequence", "communication", "activity", "state")
foreach ($diag in $diagrams) {
    $target = Join-Path $DiagramsDir "${diag}.mmd"
    if (-not (Test-Path $target)) {
        $tmpl = Join-Path $TemplatesDir "diagrams\${diag}.mmd"
        if (Test-Path $tmpl) {
            Copy-Item $tmpl $target
            Write-Ok "diagrams/${diag}.mmd created"
        }
    } else {
        Write-Ok "diagrams/${diag}.mmd verified"
    }
}

# ── 4. Knowledge Base and Skills ─────────────────────────────────────────────
Write-Info "Verifying Knowledge Base and Skills..."
$kbDir = Join-Path $UtilitiesDir "knowledge_base"
if (-not (Test-Path $kbDir)) { New-Item -ItemType Directory -Path $kbDir | Out-Null }

$kbTarget = Join-Path $kbDir "security-guidelines.md"
if (-not (Test-Path $kbTarget)) {
    $tmpl = Join-Path $TemplatesDir "knowledge_base\security-guidelines.md"
    if (Test-Path $tmpl) {
        Copy-Item $tmpl $kbTarget
        Write-Ok "knowledge_base/security-guidelines.md created"
    }
} else {
    Write-Ok "knowledge_base/security-guidelines.md verified"
}

# ── 5. IDE Configurations ────────────────────────────────────────────────────
Write-Info "Verifying IDE configurations..."

# Claude Code
$claudeTarget = Join-Path $ProjectRoot "CLAUDE.md"
if (-not (Test-Path $claudeTarget)) {
    Copy-Item (Join-Path $UtilitiesDir "CLAUDE.md") $claudeTarget
    Write-Ok "CLAUDE.md initialized"
} else {
    Write-Ok "CLAUDE.md verified"
}

# OpenCode
$openCodeDir = Join-Path $ProjectRoot ".opencode"
if (-not (Test-Path $openCodeDir)) { New-Item -ItemType Directory -Path $openCodeDir | Out-Null }
$openCodeTarget = Join-Path $openCodeDir "instructions.md"
if (-not (Test-Path $openCodeTarget)) {
    Copy-Item (Join-Path $UtilitiesDir ".opencode\instructions.md") $openCodeTarget
    Write-Ok ".opencode/instructions.md initialized"
} else {
    Write-Ok ".opencode/instructions.md verified"
}

# Antigravity
$antigravityDir = Join-Path $ProjectRoot ".antigravity"
if (-not (Test-Path $antigravityDir)) { New-Item -ItemType Directory -Path $antigravityDir | Out-Null }
$antigravityTarget = Join-Path $antigravityDir "context.md"
if (-not (Test-Path $antigravityTarget)) {
    Copy-Item (Join-Path $UtilitiesDir ".antigravity\context.md") $antigravityTarget
    Write-Ok ".antigravity/context.md initialized"
} else {
    Write-Ok ".antigravity/context.md verified"
}

Write-Host ""
Write-Ok "forgeAB (OpenSpec SDD v1.4.0) initialized successfully on Windows PowerShell!"
Write-Host ""
