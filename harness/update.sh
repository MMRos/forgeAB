#!/bin/bash

# ==============================================================================
# Script para actualizar los agentes y la documentación del arnés
# Mantiene intactos tus archivos de proyecto (current-dev.xml, story-dev.xml)
# ==============================================================================

# Cambia esta URL por la URL de tu repositorio principal de GitHub del arnés
HARNESS_REPO="https://github.com/MMRos/harness-v0.git"
REMOTE_NAME="harness-upstream"
BRANCH="main"

echo "🚀 Iniciando actualización del arnés..."
echo "Repositorio origen: $HARNESS_REPO"

# 1. Comprobar si estamos en un repositorio git
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "❌ Error: Debes ejecutar este script dentro de un repositorio Git."
    exit 1
fi

# 2. Añadir el repositorio remoto del arnés si no existe
if ! git remote | grep -q "^$REMOTE_NAME$"; then
    echo "🔗 Añadiendo remoto '$REMOTE_NAME'..."
    git remote add $REMOTE_NAME "$HARNESS_REPO"
fi

# 3. Descargar los últimos cambios (fetch en lugar de pull para evitar merges no deseados)
echo "📥 Descargando novedades desde GitHub..."
git fetch $REMOTE_NAME $BRANCH

if [ $? -ne 0 ]; then
    echo "❌ Error: No se pudo conectar con el repositorio remoto. Verifica la URL."
    exit 1
fi

# 4. Extraer (checkout) específicamente los archivos .md y scripts del arnés
echo "🔄 Actualizando archivos .md de los agentes y configuración..."

# Lista de archivos a actualizar (usamos checkout para sobreescribir solo estos archivos)
git checkout $REMOTE_NAME/$BRANCH -- \
    harness/agents/*.md \
    harness/CLAUDE.md \
    harness/.antigravity/context.md \
    harness/.opencode/instructions.md \
    harness/init.sh \
    README.md 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ ¡Arnés actualizado correctamente!"
    echo "Los agentes (.md), instrucciones y README han sido sincronizados."
    echo "Tus archivos de progreso (current-dev.xml, story-dev.xml, etc.) están INTACTOS."
    echo ""
    echo "👉 Revisa los cambios con 'git status' y haz commit cuando estés listo:"
    echo "   git commit -m \"chore: actualizar arnés desde upstream\""
else
    echo "⚠️ Hubo un problema al aplicar algunos archivos. Es posible que las rutas en el repositorio remoto no coincidan."
fi
