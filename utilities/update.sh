#!/bin/bash
# Copyright (c) 2026 MMRos. All rights reserved.

# ==============================================================================
# Script to update forgeAB (utilities)
# Keeps your project files intact (current-dev.yaml, story-dev.yaml)
# ==============================================================================

AGENTBOX_REPO="https://github.com/MMRos/forgeAB.git"
REMOTE_NAME="forgeab-upstream"
BRANCH="master"

echo "🚀 Starting forgeAB update..."

# --- 0. LEGACY MIGRATION (harness -> forgeAB) ---
for old_dir in harness forgeab; do
    if [ -d "$old_dir" ] && [ ! -d "forgeAB" ]; then
        echo "📦 Legacy structure '$old_dir/' detected. Migrating to 'forgeAB/'..."
        mv "$old_dir" forgeAB
        echo "✅ Folder renamed successfully."
    fi
done

# --- 0.5 XML to YAML MIGRATION ---
LOGS_DIR="../project-logs"
for file in current-dev story-dev error-log; do
    if [ -f "$LOGS_DIR/$file.xml" ] && [ ! -f "$LOGS_DIR/$file.yaml" ]; then
        echo "📝 Migrating $file.xml to .yaml..."
        cp "$LOGS_DIR/$file.xml" "$LOGS_DIR/$file.xml.bak"
        # Basic XML to YAML conversion using sed
        # Replaces <tag> with tag: and removes </tag>
        sed -e 's/<\([a-zA-Z0-9_-]*\)>/\1:/g' -e 's/<\/\([a-zA-Z0-9_-]*\)>//g' "$LOGS_DIR/$file.xml.bak" > "$LOGS_DIR/$file.yaml"
        rm -f "$LOGS_DIR/$file.xml"
        echo "✅ $file.xml converted to hybrid YAML (backup at .xml.bak)."
        echo "   (The Leader Agent will restructure it on its first cycle)."
    fi
done

echo "Source repository: $AGENTBOX_REPO"

# 1. Check if we are inside a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "❌ Error: You must run this script inside a Git repository."
    exit 1
fi

# 2. Add the remote repository
if ! git remote | grep -q "^$REMOTE_NAME$"; then
    echo "🔗 Adding remote '$REMOTE_NAME'..."
    git remote add $REMOTE_NAME "$AGENTBOX_REPO"
else
    # Update the URL in case it was pointing to the old 'harness' repo
    git remote set-url $REMOTE_NAME "$AGENTBOX_REPO"
fi

# 3. Fetch latest changes
echo "📥 Fetching updates from GitHub..."
git fetch $REMOTE_NAME $BRANCH

if [ $? -ne 0 ]; then
    echo "❌ Error: Could not connect to the remote repository. Check the URL."
    exit 1
fi

# 4. Update files
ARCHIVOS="utilities/agents/*.md CLAUDE.md .antigravity/context.md .opencode/instructions.md utilities/VERSION utilities/CHANGELOG.md README.md"

echo "🔄 Updating system files..."

git stash push -m "Backup pre-update-utilities" -- utilities/ README.md >/dev/null 2>&1

if git checkout $REMOTE_NAME/$BRANCH -- $ARCHIVOS 2>/dev/null; then
    echo "✅ forgeAB updated successfully!"
    echo "Your progress files (.yaml) are INTACT."
    
    # Show version
    if [ -f "utilities/VERSION" ]; then
        NEW_VERSION=$(cat utilities/VERSION)
        echo -e "\n📦 Installed version: \033[1;32mv$NEW_VERSION\033[0m"
        echo "Recent changes:"
        head -n 12 utilities/CHANGELOG.md | grep -v "^#"
    fi

    echo ""
    echo "👉 Review changes with 'git status' and commit when ready:"
    echo "   git commit -m \"chore: update forgeAB from upstream\""
    
    git stash drop >/dev/null 2>&1 || true
else
    echo "⚠️ Error applying files. Restoring original version to avoid corruption..."
    git reset HEAD -- utilities/ README.md >/dev/null 2>&1
    git checkout -- utilities/ README.md >/dev/null 2>&1
    git stash pop >/dev/null 2>&1 || true
    echo "❌ Update aborted. Check the remote URL or if the files exist in branch $BRANCH."
fi
