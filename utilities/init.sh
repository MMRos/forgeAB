#!/usr/bin/env bash
# Copyright (c) 2026 MMRos. All rights reserved.
# ─────────────────────────────────────────────────────────────────────────────
# init.sh — AI Development forgeAB initializer
# Run from the project root: bash utilities/init.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

AGENTBOX_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FORGEAB_ROOT="$(dirname "$AGENTBOX_DIR")"
PROJECT_ROOT="$(dirname "$FORGEAB_ROOT")"
TEMPLATES_DIR="$AGENTBOX_DIR/templates"
LOGS_DIR="$PROJECT_ROOT/project-logs"

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
echo "  AI Development forgeAB — init"
echo "  ─────────────────────────────"
echo ""

# ── 0. Environment review and security checks ────────────────────────────────
info "Running environment review and security checks..."

# Check 1: Execution environment validation
if [[ "$PROJECT_ROOT" == "/" || "$PROJECT_ROOT" =~ ^[a-zA-Z]:\\$ || "$PROJECT_ROOT" =~ ^[a-zA-Z]:/$ ]]; then
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
if [ ! -d "$AGENTBOX_DIR/agents" ]; then
  fail "Agents folder not found ($AGENTBOX_DIR/agents)."
fi
ok "Harness base structure validated"

# Check 4: Environment dependencies
if ! command -v git &> /dev/null; then
  warn "git is not installed. Some harness functions may require it."
else
  ok "git detected in environment"
fi

# npm → pnpm alias (only for JavaScript/Node projects)
if [ -f "$PROJECT_ROOT/package.json" ]; then
  if command -v pnpm &> /dev/null; then
    shopt -s expand_aliases
    alias npm='pnpm'
    ok "pnpm detected, npm=pnpm alias configured"
  else
    warn "pnpm is not installed. In Node projects, the harness requires pnpm to avoid npm."
    echo -ne "${BLUE}→${NC} Would you like to download and install pnpm now? [y/N]: "
    read confirm
    if [[ "$confirm" =~ ^[yY](es)?$ ]]; then
      info "Downloading and installing pnpm independently..."
      if command -v curl &> /dev/null; then
        curl -fsSL https://get.pnpm.io/install.sh | sh -
      elif command -v wget &> /dev/null; then
        wget -qO- https://get.pnpm.io/install.sh | sh -
      else
        fail "Neither curl nor wget found to download pnpm. Install manually at https://pnpm.io/installation."
      fi
      
      # Try to load PNPM into current PATH so it's available immediately
      export PNPM_HOME="${HOME}/.local/share/pnpm"
      if [[ ":$PATH:" != *":$PNPM_HOME:"* ]]; then
        export PATH="$PNPM_HOME:$PATH"
      fi
      
      if command -v pnpm &> /dev/null || [ -x "$PNPM_HOME/pnpm" ]; then
        shopt -s expand_aliases
        alias npm='pnpm'
        ok "pnpm installed successfully and npm=pnpm alias configured"
      else
        warn "pnpm was installed, but you may need to restart your terminal for changes to take effect."
      fi
    else
      fail "pnpm installation cancelled. The harness strictly requires pnpm in Node projects."
    fi
  fi
else
  ok "No package.json detected. Skipping pnpm validation."
fi

if [ "${BASH_VERSINFO:-0}" -lt 4 ]; then
  warn "bash version 4 or higher is recommended (current: $BASH_VERSION)."
else
  ok "Adequate bash version (${BASH_VERSION%%.*})"
fi
echo ""

# ── 0.5 Harness Sync (Update) ─────────────────────────────────────────────────
info "Checking for harness updates..."

if [ -f "$AGENTBOX_DIR/update.sh" ]; then
    # Extract the user's custom URL
    LOCAL_REPO=$(grep "^AGENTBOX_REPO=" "$AGENTBOX_DIR/update.sh" | cut -d'"' -f2 || true)
    
    if [[ "$LOCAL_REPO" =~ ^https://github.com/([^/]+)/([^.]+)\.git$ ]]; then
        GITHUB_USER="${BASH_REMATCH[1]}"
        GITHUB_REPO="${BASH_REMATCH[2]}"
        RAW_URL="https://raw.githubusercontent.com/$GITHUB_USER/$GITHUB_REPO/main/utilities/update.sh"
        
        info "Checking for a new version of update.sh..."
        if command -v curl &> /dev/null && curl -s -f -o "$AGENTBOX_DIR/update.sh.tmp" "$RAW_URL"; then
            # Restore the custom URL in the newly downloaded file
            sed -i "s|^AGENTBOX_REPO=.*|AGENTBOX_REPO=\"$LOCAL_REPO\"|" "$AGENTBOX_DIR/update.sh.tmp"
            mv "$AGENTBOX_DIR/update.sh.tmp" "$AGENTBOX_DIR/update.sh"
            chmod +x "$AGENTBOX_DIR/update.sh"
            ok "update.sh updated successfully."
        else
            rm -f "$AGENTBOX_DIR/update.sh.tmp"
        fi
    fi
    
    # Run the update script
    bash "$AGENTBOX_DIR/update.sh"
    echo ""
else
    warn "update.sh not found. Skipping sync."
    echo ""
fi

# ── 1. Work YAML files ───────────────────────────────────────────────────────
info "Verifying state files..."

mkdir -p "$LOGS_DIR"

if [ ! -f "$LOGS_DIR/current-dev.yaml" ] && [ ! -f "$LOGS_DIR/current-dev.xml" ]; then
  cp "$TEMPLATES_DIR/current-dev.yaml" "$LOGS_DIR/current-dev.yaml"
  ok "project-logs/current-dev.yaml created from template"
else
  warn "project-logs/current-dev.yaml already exists — not overwritten"
fi

if [ ! -f "$LOGS_DIR/story-dev.yaml" ] && [ ! -f "$LOGS_DIR/story-dev.xml" ]; then
  cp "$TEMPLATES_DIR/story-dev.yaml" "$LOGS_DIR/story-dev.yaml"
  ok "project-logs/story-dev.yaml created from template"
else
  warn "project-logs/story-dev.yaml already exists — not overwritten"
fi

if [ ! -f "$LOGS_DIR/error-log.yaml" ] && [ ! -f "$LOGS_DIR/error-log.xml" ]; then
  cp "$TEMPLATES_DIR/error-log.yaml" "$LOGS_DIR/error-log.yaml"
  ok "project-logs/error-log.yaml created from template"
else
  warn "project-logs/error-log.yaml already exists — not overwritten"
fi

# ── 1.5 Language Configuration ────────────────────────────────────────────────
info "Language configuration..."
if grep -q 'language: "" # Main language(s)' "$LOGS_DIR/current-dev.yaml" 2>/dev/null || \
   grep -q 'language: "" # Lenguaje' "$LOGS_DIR/current-dev.yaml" 2>/dev/null; then
  echo ""
  echo -e "${YELLOW}What is the main language of this project?${NC}"
  echo "  1) JavaScript / TypeScript"
  echo "  2) Python"
  echo "  3) Java"
  echo "  4) Rust"
  echo "  5) Other"
  echo -ne "${BLUE}→${NC} Choose an option [1-5] (default 1): "
  read lang_choice
  
  case "$lang_choice" in
    2) LANG_VAL="Python" ;;
    3) LANG_VAL="Java" ;;
    4) LANG_VAL="Rust" ;;
    5)
      echo -ne "${BLUE}→${NC} Enter the language: "
      read custom_lang
      LANG_VAL="${custom_lang:-Unknown}"
      ;;
    *) LANG_VAL="JavaScript/TypeScript" ;;
  esac
  
  sed -i "s|language: \"\" # Lenguaje(s) principal(es)|language: \"$LANG_VAL\"|g" "$LOGS_DIR/current-dev.yaml"
  sed -i "s|language: \"\" # Lenguaje(s)|language: \"$LANG_VAL\"|g" "$LOGS_DIR/story-dev.yaml" 2>/dev/null || true
  sed -i "s|language: \"\" # Lenguaje(s)|language: \"$LANG_VAL\"|g" "$LOGS_DIR/error-log.yaml" 2>/dev/null || true
  ok "Language set to: $LANG_VAL"
else
  CURRENT_LANG=$(grep "language:" "$LOGS_DIR/current-dev.yaml" | head -n 1 | sed -E 's/.*language: "(.*)".*/\1/')
  ok "Language already configured ($CURRENT_LANG)"
fi

# ── 2. Diagrams folder at project root ───────────────────────────────────────
info "Verifying diagrams folder..."

DIAGRAMS_DIR="$FORGEAB_ROOT/diagrams"
mkdir -p "$DIAGRAMS_DIR"

for diagram in class-diagram use-case sequence communication activity state; do
  TARGET="$DIAGRAMS_DIR/${diagram}.mmd"
  if [ ! -f "$TARGET" ]; then
    cp "$TEMPLATES_DIR/diagrams/${diagram}.mmd" "$TARGET"
    ok "diagrams/${diagram}.mmd created"
  else
    warn "diagrams/${diagram}.mmd already exists — not overwritten"
  fi
done

# ── 2.5 Knowledge Base and Skills ─────────────────────────────────────────────
info "Verifying Knowledge Base and Skills..."

KB_DIR="$AGENTBOX_DIR/knowledge_base"
mkdir -p "$KB_DIR"
if [ ! -f "$KB_DIR/security-guidelines.md" ]; then
  cp "$TEMPLATES_DIR/knowledge_base/security-guidelines.md" "$KB_DIR/security-guidelines.md"
  ok "knowledge_base/security-guidelines.md created"
else
  warn "knowledge_base/security-guidelines.md already exists"
fi

SKILLS_DIR="$AGENTBOX_DIR/skills"
mkdir -p "$SKILLS_DIR"
if [ ! -f "$SKILLS_DIR/cve-check.md" ]; then
  cp "$TEMPLATES_DIR/skills/cve-check.md" "$SKILLS_DIR/cve-check.md"
  ok "skills/cve-check.md created"
else
  warn "skills/cve-check.md already exists"
fi

# ── 3. IDE configuration files ───────────────────────────────────────────────
info "Verifying IDE configuration files..."

# Claude Code
if [ ! -f "$FORGEAB_ROOT/CLAUDE.md" ]; then
  cp "$AGENTBOX_DIR/CLAUDE.md" "$FORGEAB_ROOT/CLAUDE.md"
  ok "CLAUDE.md copied to forgeAB/"
else
  warn "CLAUDE.md already exists in forgeAB/ — not overwritten"
fi

# OpenCode
mkdir -p "$FORGEAB_ROOT/.opencode"
if [ ! -f "$FORGEAB_ROOT/.opencode/instructions.md" ]; then
  cp "$AGENTBOX_DIR/.opencode/instructions.md" "$FORGEAB_ROOT/.opencode/instructions.md"
  ok ".opencode/instructions.md copied to forgeAB/"
else
  warn ".opencode/instructions.md already exists — not overwritten"
fi

# Antigravity
mkdir -p "$FORGEAB_ROOT/.antigravity"
if [ ! -f "$FORGEAB_ROOT/.antigravity/context.md" ]; then
  cp "$AGENTBOX_DIR/.antigravity/context.md" "$FORGEAB_ROOT/.antigravity/context.md"
  ok ".antigravity/context.md copied to forgeAB/"
else
  warn ".antigravity/context.md already exists — not overwritten"
fi

# ── 3.5 Update .gitignore ────────────────────────────────────────────────────
info "Verifying .gitignore to exclude utilities/forgeAB..."

GITIGNORE_PATH="$PROJECT_ROOT/.gitignore"
if [ ! -f "$GITIGNORE_PATH" ]; then
  touch "$GITIGNORE_PATH"
  ok ".gitignore created"
fi

if ! grep -q "# forgeAB utilities content" "$GITIGNORE_PATH" 2>/dev/null; then
  cat << 'EOF' >> "$GITIGNORE_PATH"

# forgeAB utilities content
/forgeAB/
EOF
  ok ".gitignore updated to ignore utilities/forgeAB"
else
  ok "forgeAB rules already present in .gitignore"
fi

# ── 4. Final verification ────────────────────────────────────────────────────
echo ""
info "Resulting structure:"
echo ""
echo "  $PROJECT_ROOT/"
echo "  └── forgeAB"
echo "  |   ├── CLAUDE.md"
echo "  |   ├── .opencode/instructions.md"
echo "  |   ├── .antigravity/context.md"
echo "  |   ├── diagrams/"
echo "  |   │   ├── class-diagram.mmd"
echo "  |   │   ├── use-case.mmd"
echo "  |   │   ├── sequence.mmd"
echo "  |   │   ├── communication.mmd"
echo "  |   │   ├── activity.mmd"
echo "  |   │   └── state.mmd"
echo "  |   └── utilities/"
echo "  |     ├── agents/  (leader … planner)"
echo "  |     └── templates/"
echo "  └── project-logs"
echo "      ├── current-dev.xml"
echo "      ├── story-dev.xml"
echo "      └── error-log.xml"
echo ""
ok "forgeAB ready. Open the project in your IDE to activate the Leader."
echo ""
