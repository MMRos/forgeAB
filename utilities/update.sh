#!/usr/bin/env bash
# Copyright (c) 2026 MMRos. All rights reserved.
# ─────────────────────────────────────────────────────────────────────────────
# update.sh — Script to update forgeAB system files safely
# Keeps your project files (openspec/, project-logs/, diagrams/) intact.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

FORGEAB_REPO="https://github.com/MMRos/forgeAB.git"
REMOTE_NAME="forgeab-upstream"
BRANCH="master"

echo ""
echo "🚀 Starting forgeAB update..."
echo ""

# 1. Check if we are inside a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "❌ Error: You must run this script inside a Git repository."
  exit 1
fi

# 2. Add or update remote repository
if ! git remote | grep -q "^$REMOTE_NAME$"; then
  echo "🔗 Adding remote '$REMOTE_NAME'..."
  git remote add "$REMOTE_NAME" "$FORGEAB_REPO"
else
  git remote set-url "$REMOTE_NAME" "$FORGEAB_REPO"
fi

# 3. Fetch latest changes
echo "📥 Fetching updates from upstream repository..."
if ! git fetch "$REMOTE_NAME" "$BRANCH"; then
  echo "❌ Error: Could not connect to the remote repository. Check connection or URL."
  exit 1
fi

# 4. Update system files safely
SYSTEM_FILES="utilities/agents/*.md CLAUDE.md .antigravity/context.md .opencode/instructions.md utilities/VERSION utilities/CHANGELOG.md utilities/templates/ README.md .github/"

echo "🔄 Updating system files..."

if git checkout "$REMOTE_NAME/$BRANCH" -- $SYSTEM_FILES 2>/dev/null; then
  echo "✅ forgeAB updated successfully!"
  echo "Your project progress, openspec/ and project-logs/ files remain untouched."
  
  if [ -f "utilities/VERSION" ]; then
    NEW_VERSION=$(cat utilities/VERSION)
    echo -e "\n📦 Installed version: \033[1;32mv$NEW_VERSION\033[0m"
    echo "Recent changes:"
    head -n 20 utilities/CHANGELOG.md | grep -v "^#"
  fi

  echo ""
  echo "👉 Review changes with 'git status' and commit when ready:"
  echo "   git commit -m \"chore: update forgeAB from upstream\""
else
  echo "⚠️ Warning: Some files could not be checked out directly. Check 'git status'."
fi
