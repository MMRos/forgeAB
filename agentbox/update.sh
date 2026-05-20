#!/bin/bash
# Copyright (c) 2026 MMRos. Todos los derechos reservados.

# ==============================================================================
# Script para actualizar AgentBox (antes AI Development Harness)
# Mantiene intactos tus archivos de proyecto (current-dev.yaml, story-dev.yaml)
# ==============================================================================

AGENTBOX_REPO="https://github.com/MMRos/agentbox-v0.git"
REMOTE_NAME="agentbox-upstream"
BRANCH="master"

echo "🚀 Iniciando actualización de AgentBox..."

# --- 0. MIGRACIÓN HEREDADA (harness/forgeab -> agentbox) ---
for old_dir in harness forgeab; do
    if [ -d "$old_dir" ] && [ ! -d "agentbox" ]; then
        echo "📦 Detectada estructura heredada '$old_dir/'. Migrando a 'agentbox/'..."
        mv "$old_dir" agentbox
        echo "✅ Carpeta renombrada exitosamente."
    fi
done

# --- 0.5 MIGRACIÓN XML a YAML ---
for file in current-dev story-dev error-log; do
    if [ -f "agentbox/$file.xml" ] && [ ! -f "agentbox/$file.yaml" ]; then
        echo "📝 Migrando $file.xml a .yaml..."
        cp "agentbox/$file.xml" "agentbox/$file.xml.bak"
        # Conversión básica de XML a YAML usando sed
        # Reemplaza <etiqueta> por etiqueta: y borra </etiqueta>
        sed -e 's/<\([a-zA-Z0-9_-]*\)>/\1:/g' -e 's/<\/\([a-zA-Z0-9_-]*\)>//g' "agentbox/$file.xml.bak" > "agentbox/$file.yaml"
        rm -f "agentbox/$file.xml"
        echo "✅ $file.xml convertido a YAML híbrido (copia de seguridad en .xml.bak)."
        echo "   (El Leader Agent lo reestructurará en su primer ciclo)."
    fi
done

echo "Repositorio origen: $AGENTBOX_REPO"

# 1. Comprobar si estamos en un repositorio git
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "❌ Error: Debes ejecutar este script dentro de un repositorio Git."
    exit 1
fi

# 2. Añadir el repositorio remoto
if ! git remote | grep -q "^$REMOTE_NAME$"; then
    echo "🔗 Añadiendo remoto '$REMOTE_NAME'..."
    git remote add $REMOTE_NAME "$AGENTBOX_REPO"
else
    # Actualiza la URL por si apuntaba al viejo repo 'harness'
    git remote set-url $REMOTE_NAME "$AGENTBOX_REPO"
fi

# 3. Descargar los últimos cambios
echo "📥 Descargando novedades desde GitHub..."
git fetch $REMOTE_NAME $BRANCH

if [ $? -ne 0 ]; then
    echo "❌ Error: No se pudo conectar con el repositorio remoto. Verifica la URL."
    exit 1
fi

# 4. Actualizar archivos
ARCHIVOS="agentbox/agents/*.md agentbox/CLAUDE.md agentbox/.antigravity/context.md agentbox/.opencode/instructions.md agentbox/init.sh agentbox/VERSION agentbox/CHANGELOG.md README.md"

echo "🔄 Actualizando archivos del sistema..."

git stash push -m "Backup pre-update-agentbox" -- agentbox/ README.md >/dev/null 2>&1

if git checkout $REMOTE_NAME/$BRANCH -- $ARCHIVOS 2>/dev/null; then
    echo "✅ ¡AgentBox actualizado correctamente!"
    echo "Tus archivos de progreso (.yaml) están INTACTOS."
    
    # Mostrar versión
    if [ -f "agentbox/VERSION" ]; then
        NEW_VERSION=$(cat agentbox/VERSION)
        echo -e "\n📦 Versión instalada: \033[1;32mv$NEW_VERSION\033[0m"
        echo "Cambios recientes:"
        head -n 12 agentbox/CHANGELOG.md | grep -v "^#"
    fi

    echo ""
    echo "👉 Revisa los cambios con 'git status' y haz commit cuando estés listo:"
    echo "   git commit -m \"chore: actualizar AgentBox desde upstream\""
    
    git stash drop >/dev/null 2>&1 || true
else
    echo "⚠️ Hubo un error al aplicar los archivos. Restaurando versión original para evitar corrupción..."
    git reset HEAD -- agentbox/ README.md >/dev/null 2>&1
    git checkout -- agentbox/ README.md >/dev/null 2>&1
    git stash pop >/dev/null 2>&1 || true
    echo "❌ Actualización abortada. Comprueba la URL remota o si los archivos existen en la rama $BRANCH."
fi
