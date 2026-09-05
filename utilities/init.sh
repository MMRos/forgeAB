#!/usr/bin/env bash
# Copyright (c) 2026 MMRos. All rights reserved.
# ─────────────────────────────────────────────────────────────────────────────
# init.sh — AI Development forgeAB Initializer (OpenSpec SDD Integrated)
# Run from the project root: bash utilities/init.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

UTILITIES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FORGEAB_ROOT="$(cd "$UTILITIES_DIR/.." && pwd)"

# Detect if forgeAB is standalone or embedded in a parent project
if [ -f "$FORGEAB_ROOT/package.json" ] || [ -d "$FORGEAB_ROOT/.git" ]; then
  PROJECT_ROOT="$FORGEAB_ROOT"
else
  PROJECT_ROOT="$(dirname "$FORGEAB_ROOT")"
fi

TEMPLATES_DIR="$UTILITIES_DIR/templates"
LOGS_DIR="$PROJECT_ROOT/project-logs"
OPENSPEC_DIR="$PROJECT_ROOT/openspec"
DIAGRAMS_DIR="$PROJECT_ROOT/diagrams"

# ── Colors ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

ok()   { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${BLUE}→${NC} $1"; }
warn() { echo -e "${YELLOW}!${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; exit 1; }

echo ""
echo "  AI Development forgeAB — Initializer (OpenSpec SDD)"
echo "  ───────────────────────────────────────────────────"
echo ""

# ── 0. Environment review and security checks ────────────────────────────────
info "Running environment review and security checks..."

# Check 1: Execution environment validation
if [[ "$PROJECT_ROOT" == "/" || "$PROJECT_ROOT" =~ ^[a-zA-Z]:[\\/]$ ]]; then
  fail "The harness must not run in the system root directory."
fi
ok "Safe execution environment (Project at: $PROJECT_ROOT)"

# Check 2: Write permission verification
if [ ! -w "$PROJECT_ROOT" ]; then
  fail "No write permissions at the project root."
fi
ok "Write permissions verified at project root"

# Check 3: Harness base structure verification
if [ ! -d "$TEMPLATES_DIR" ]; then
  fail "Templates folder not found ($TEMPLATES_DIR)."
fi
if [ ! -d "$UTILITIES_DIR/agents" ]; then
  fail "Agents folder not found ($UTILITIES_DIR/agents)."
fi
ok "Harness base structure validated"

# Check 4: Git presence
if ! command -v git &> /dev/null; then
  warn "git is not installed. Version control and update functions may require it."
else
  ok "git detected in environment"
fi

# Check 5: pnpm verification for Node projects
if [ -f "$PROJECT_ROOT/package.json" ]; then
  if command -v pnpm &> /dev/null; then
    shopt -s expand_aliases 2>/dev/null || true
    alias npm='pnpm' 2>/dev/null || true
    ok "pnpm detected in Node project"
  else
    warn "pnpm is recommended for Node projects to avoid npm dependency pollution."
  fi
fi

echo ""

# ── 1. State files initialization ────────────────────────────────────────────
info "Verifying state files (project-logs/)..."
mkdir -p "$LOGS_DIR"

for state_file in current-dev.yaml story-dev.yaml error-log.yaml; do
  TARGET="$LOGS_DIR/$state_file"
  if [ ! -f "$TARGET" ]; then
    if [ -f "$TEMPLATES_DIR/$state_file" ]; then
      cp "$TEMPLATES_DIR/$state_file" "$TARGET"
      ok "project-logs/$state_file created from template"
    fi
  else
    ok "project-logs/$state_file already exists"
  fi
done

# ── 2. OpenSpec structure deployment ─────────────────────────────────────────
info "Verifying OpenSpec structure (openspec/)..."
mkdir -p "$OPENSPEC_DIR/specs" "$OPENSPEC_DIR/changes/archive"

if [ ! -f "$OPENSPEC_DIR/config.yaml" ]; then
  if [ -f "$TEMPLATES_DIR/openspec/config.yaml" ]; then
    cp "$TEMPLATES_DIR/openspec/config.yaml" "$OPENSPEC_DIR/config.yaml"
    ok "openspec/config.yaml created"
  fi
else
  ok "openspec/config.yaml already exists"
fi

# ── 3. Architectural Diagrams (diagrams/) ────────────────────────────────────
info "Verifying architectural diagrams..."
mkdir -p "$DIAGRAMS_DIR"

for diagram in class-diagram use-case sequence communication activity state; do
  TARGET="$DIAGRAMS_DIR/${diagram}.mmd"
  if [ ! -f "$TARGET" ]; then
    if [ -f "$TEMPLATES_DIR/diagrams/${diagram}.mmd" ]; then
      cp "$TEMPLATES_DIR/diagrams/${diagram}.mmd" "$TARGET"
      ok "diagrams/${diagram}.mmd created"
    fi
  else
    ok "diagrams/${diagram}.mmd already exists"
  fi
done

# ── 4. Knowledge Base and Skills ─────────────────────────────────────────────
info "Verifying Knowledge Base and Skills..."
KB_DIR="$UTILITIES_DIR/knowledge_base"
mkdir -p "$KB_DIR"
if [ ! -f "$KB_DIR/security-guidelines.md" ] && [ -f "$TEMPLATES_DIR/knowledge_base/security-guidelines.md" ]; then
  cp "$TEMPLATES_DIR/knowledge_base/security-guidelines.md" "$KB_DIR/security-guidelines.md"
  ok "knowledge_base/security-guidelines.md created"
else
  ok "knowledge_base/security-guidelines.md verified"
fi

SKILLS_DIR="$UTILITIES_DIR/skills"
mkdir -p "$SKILLS_DIR"
if [ ! -f "$SKILLS_DIR/cve-check.md" ] && [ -f "$TEMPLATES_DIR/skills/cve-check.md" ]; then
  cp "$TEMPLATES_DIR/skills/cve-check.md" "$SKILLS_DIR/cve-check.md"
  ok "skills/cve-check.md created"
else
  ok "skills/cve-check.md verified"
fi

# ── 5. Project Rules Templates ───────────────────────────────────────────────
info "Verifying Project Rules archetypes..."
if [ -d "$TEMPLATES_DIR/project-rules" ]; then
  ok "project-rules templates verified"
fi

# ── 6. IDE & AI Model Dynamic Adaptation ────────────────────────────────────
info "Running dynamic IDE & AI Model adaptation..."

ADAPTER_SCRIPT="$PROJECT_ROOT/scripts/harness-adapter.js"
if [ -f "$ADAPTER_SCRIPT" ] && command -v node &> /dev/null; then
  node "$ADAPTER_SCRIPT"
  ok "Harness adapter executed successfully via Node.js"
else
  # Native Bash fallback
  DETECTED_IDE="generic"
  if [ -n "${ANTIGRAVITY_WORKSPACE:-}" ] || [ -n "${ANTIGRAVITY_IDE:-}" ] || [ -d "$PROJECT_ROOT/.antigravity" ]; then
    DETECTED_IDE="antigravity"
  elif [ -n "${CURSOR_VERSION:-}" ] || [ -d "$PROJECT_ROOT/.cursor" ] || [ -f "$PROJECT_ROOT/.cursorrules" ]; then
    DETECTED_IDE="cursor"
  elif [ -n "${WINDSURF_VERSION:-}" ] || [ -d "$PROJECT_ROOT/.windsurf" ] || [ -f "$PROJECT_ROOT/.windsurfrules" ]; then
    DETECTED_IDE="windsurf"
  elif [ -n "${CLAUDE_PROJECT_DIR:-}" ] || [ -f "$PROJECT_ROOT/CLAUDE.md" ]; then
    DETECTED_IDE="claude-code"
  elif [ -n "${OPENCODE_VERSION:-}" ] || [ -d "$PROJECT_ROOT/.opencode" ]; then
    DETECTED_IDE="opencode"
  elif [ -n "${VSCODE_PID:-}" ]; then
    DETECTED_IDE="vscode"
  fi

  DETECTED_MODEL="${MODEL:-${AI_MODEL:-Gemini 3.8 Flash}}"
  ok "Environment detected: IDE = $DETECTED_IDE, Model = $DETECTED_MODEL"
fi

# ── 7. Final verification summary ────────────────────────────────────────────
echo ""
info "Resulting Structure:"
echo ""
echo "  $PROJECT_ROOT/"
echo "  ├── openspec/                  ← OpenSpec Spec-Driven Development"
echo "  │   ├── config.yaml            ← Global context & artifact rules"
echo "  │   ├── specs/                 ← Consolidated living specifications"
echo "  │   │   └── project-rules.md   ← Master project directrices"
echo "  │   └── changes/               ← Active proposals, delta specs, tasks"
echo "  ├── diagrams/                  ← Architecture diagrams (.mmd)"
echo "  ├── project-logs/              ← Development tracking (YAML)"
echo "  │   ├── current-dev.yaml"
echo "  │   ├── story-dev.yaml"
echo "  │   └── error-log.yaml"
echo "  ├── CLAUDE.md                  ← Claude Code entry"
echo "  ├── .antigravity/context.md    ← Antigravity entry"
echo "  ├── .opencode/instructions.md  ← OpenCode entry"
echo "  └── utilities/"
echo "      ├── agents/                ← Specialist agents (leader ... critic ... skill_creator)"
echo "      └── templates/             ← Base templates (project-rules, openspec, etc.)"
echo ""
ok "forgeAB (OpenSpec SDD v1.4.0) initialized successfully. Start your session with Leader!"
echo ""
