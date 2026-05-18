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
RED='\033[0;31m'
NC='\033[0m'

ok()   { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${BLUE}→${NC} $1"; }
warn() { echo -e "${YELLOW}!${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; exit 1; }

echo ""
echo "  AI Development Harness — init"
echo "  ─────────────────────────────"
echo ""

# ── 0. Revisión del entorno y pruebas de seguridad ───────────────────────────
info "Realizando revisión del entorno y pruebas de seguridad..."

# Prueba 1: Verificación de entorno de ejecución
if [[ "$PROJECT_ROOT" == "/" || "$PROJECT_ROOT" =~ ^[a-zA-Z]:\\$ || "$PROJECT_ROOT" =~ ^[a-zA-Z]:/$ ]]; then
  fail "El arnés no debe ejecutarse en el directorio raíz del sistema."
fi
ok "Entorno de ejecución seguro (Proyecto en: $PROJECT_ROOT)"

# Prueba 2: Verificación de permisos de escritura
if [ ! -w "$PROJECT_ROOT" ]; then
  fail "No hay permisos de escritura en la raíz del proyecto."
fi
ok "Permisos de escritura verificados en la raíz del proyecto"

# Prueba 3: Verificación de estructura base del arnés
if [ ! -d "$TEMPLATES_DIR" ]; then
  fail "Carpeta de templates no encontrada ($TEMPLATES_DIR)."
fi
if [ ! -d "$HARNESS_DIR/agents" ]; then
  fail "Carpeta de agentes no encontrada ($HARNESS_DIR/agents)."
fi
ok "Estructura base del arnés validada"

# Prueba 4: Dependencias del entorno
if ! command -v git &> /dev/null; then
  warn "git no está instalado. Algunas funciones del arnés pueden requerirlo."
else
  ok "git detectado en el entorno"
fi

# Alias de npm a pnpm (solo si es un proyecto JavaScript/Node)
if [ -f "$PROJECT_ROOT/package.json" ]; then
  if command -v pnpm &> /dev/null; then
    shopt -s expand_aliases
    alias npm='pnpm'
    ok "pnpm detectado, configurado alias npm=pnpm"
  else
    warn "pnpm no está instalado. En proyectos Node, el arnés requiere pnpm para evitar npm."
    echo -ne "${BLUE}→${NC} ¿Deseas descargar e instalar pnpm directamente ahora? [s/N]: "
    read confirm
    if [[ "$confirm" =~ ^[sS](i|í|I|Í)?$ ]]; then
      info "Descargando e instalando pnpm de forma independiente..."
      if command -v curl &> /dev/null; then
        curl -fsSL https://get.pnpm.io/install.sh | sh -
      elif command -v wget &> /dev/null; then
        wget -qO- https://get.pnpm.io/install.sh | sh -
      else
        fail "No se encontró curl ni wget para descargar pnpm. Instálalo manualmente en https://pnpm.io/installation."
      fi
      
      # Intentar cargar PNPM en el PATH actual para que esté disponible de inmediato
      export PNPM_HOME="${HOME}/.local/share/pnpm"
      if [[ ":$PATH:" != *":$PNPM_HOME:"* ]]; then
        export PATH="$PNPM_HOME:$PATH"
      fi
      
      if command -v pnpm &> /dev/null || [ -x "$PNPM_HOME/pnpm" ]; then
        shopt -s expand_aliases
        alias npm='pnpm'
        ok "pnpm instalado exitosamente y configurado alias npm=pnpm"
      else
        warn "pnpm se instaló, pero es posible que debas reiniciar tu terminal para que los cambios surtan efecto."
      fi
    else
      fail "Instalación de pnpm cancelada. El arnés requiere pnpm de manera imperativa en proyectos Node."
    fi
  fi
else
  ok "No se detectó package.json. Omitiendo validación de pnpm."
fi

if [ "${BASH_VERSINFO:-0}" -lt 4 ]; then
  warn "Se recomienda bash versión 4 o superior (actual: $BASH_VERSION)."
else
  ok "Versión de bash adecuada (${BASH_VERSION%%.*})"
fi
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
