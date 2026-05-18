#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# init.sh — AI Development Harness initializer
# Ejecutar desde la raíz del proyecto: bash harness/init.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

HARNESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$HARNESS_DIR")"
TEMPLATES_DIR="$HARNESS_DIR/templates"

# ── Colores ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ok()   { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${BLUE}→${NC} $1"; }
warn() { echo -e "${YELLOW}!${NC} $1"; }

echo ""
echo "  AI Development Harness — init"
echo "  ─────────────────────────────"
echo ""

# ── 1. Archivos XML de trabajo ───────────────────────────────────────────────
info "Verificando archivos de estado..."

if [ ! -f "$HARNESS_DIR/current-dev.xml" ]; then
  cp "$TEMPLATES_DIR/current-dev.xml" "$HARNESS_DIR/current-dev.xml"
  ok "current-dev.xml creado desde plantilla"
else
  warn "current-dev.xml ya existe — no se sobreescribe"
fi

if [ ! -f "$HARNESS_DIR/story-dev.xml" ]; then
  cp "$TEMPLATES_DIR/story-dev.xml" "$HARNESS_DIR/story-dev.xml"
  ok "story-dev.xml creado desde plantilla"
else
  warn "story-dev.xml ya existe — no se sobreescribe"
fi

if [ ! -f "$HARNESS_DIR/error-log.xml" ]; then
  cp "$TEMPLATES_DIR/error-log.xml" "$HARNESS_DIR/error-log.xml"
  ok "error-log.xml creado desde plantilla"
else
  warn "error-log.xml ya existe — no se sobreescribe"
fi

# ── 2. Carpeta de diagramas en la raíz del proyecto ──────────────────────────
info "Verificando carpeta de diagramas..."

DIAGRAMS_DIR="$PROJECT_ROOT/diagrams"
mkdir -p "$DIAGRAMS_DIR"

for diagram in class-diagram use-case sequence communication activity state; do
  TARGET="$DIAGRAMS_DIR/${diagram}.mmd"
  if [ ! -f "$TARGET" ]; then
    cp "$TEMPLATES_DIR/diagrams/${diagram}.mmd" "$TARGET"
    ok "diagrams/${diagram}.mmd creado"
  else
    warn "diagrams/${diagram}.mmd ya existe — no se sobreescribe"
  fi
done

# ── 3. Archivos de configuración por IDE ─────────────────────────────────────
info "Verificando archivos de configuración por IDE..."

# Claude Code
if [ ! -f "$PROJECT_ROOT/CLAUDE.md" ]; then
  cp "$HARNESS_DIR/CLAUDE.md" "$PROJECT_ROOT/CLAUDE.md"
  ok "CLAUDE.md copiado a la raíz"
else
  warn "CLAUDE.md ya existe en la raíz — no se sobreescribe"
fi

# OpenCode
mkdir -p "$PROJECT_ROOT/.opencode"
if [ ! -f "$PROJECT_ROOT/.opencode/instructions.md" ]; then
  cp "$HARNESS_DIR/.opencode/instructions.md" "$PROJECT_ROOT/.opencode/instructions.md"
  ok ".opencode/instructions.md copiado"
else
  warn ".opencode/instructions.md ya existe — no se sobreescribe"
fi

# Antigravity
mkdir -p "$PROJECT_ROOT/.antigravity"
if [ ! -f "$PROJECT_ROOT/.antigravity/context.md" ]; then
  cp "$HARNESS_DIR/.antigravity/context.md" "$PROJECT_ROOT/.antigravity/context.md"
  ok ".antigravity/context.md copiado"
else
  warn ".antigravity/context.md ya existe — no se sobreescribe"
fi

# ── 4. Verificación final ────────────────────────────────────────────────────
echo ""
info "Estructura resultante:"
echo ""
echo "  $PROJECT_ROOT/"
echo "  ├── CLAUDE.md"
echo "  ├── .opencode/instructions.md"
echo "  ├── .antigravity/context.md"
echo "  ├── diagrams/"
echo "  │   ├── class-diagram.mmd"
echo "  │   ├── use-case.mmd"
echo "  │   ├── sequence.mmd"
echo "  │   ├── communication.mmd"
echo "  │   ├── activity.mmd"
echo "  │   └── state.mmd"
echo "  └── harness/"
echo "      ├── current-dev.xml"
echo "      ├── story-dev.xml"
echo "      ├── error-log.xml"
echo "      ├── agents/  (0-leader … 5-planner)"
echo "      └── templates/"
echo ""
ok "Harness listo. Abre el proyecto en tu IDE para activar el Leader."
echo ""
