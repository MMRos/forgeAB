# Proposal: H002 — Arnés Adaptativo: Detección Dinámica de IDE/Modelos y Gobernanza de Gitignore

## Contexto y Motivación
El arnés forgeAB opera con múltiples asistentes de IA (Antigravity/Gemini, Claude Code, Cursor, Windsurf, VS Code/Copilot, OpenCode) y diversos modelos de lenguaje. En ocasiones, cuando se abre un proyecto en una IDE o se interactúa con un modelo que carece de directivas persistentes y visibles en la raíz, la IA tiende a "olvidar" que debe regirse por el flujo estricto de Spec-Driven Development (OpenSpec SDD), el uso de `pnpm`, la edición quirúrgica y las 7 Quality Gates anti-CRAP.

Asimismo, es imperativo que los archivos y carpetas que forman parte de la infraestructura interna del arnés o de la configuración de entornos locales de la IA queden excluidos del control de versiones (`.gitignore`), garantizando al mismo tiempo que los **manuales y especificaciones** (`README.md`, `openspec/`, `diagrams/`), **tests** (`tests/`, configs), **logs de proyecto** (`project-logs/`) y el código del proyecto (`src/`) se preserven y rastreen íntegramente.

## Cambios Propuestos
1. **Módulo de Detección de IDE (`ide-detector.ts`)**:
   - Detecta el entorno activo mediante variables de entorno (`ANTIGRAVITY_WORKSPACE`, `CURSOR_VERSION`, `WINDSURF_VERSION`, `VSCODE_PID`, `CLAUDE_PROJECT_DIR`, etc.), huellas en disco y procesos.
2. **Módulo de Detección de Modelos (`model-detector.ts`)**:
   - Detecta o infiere la familia de modelos en uso (Gemini, Claude, GPT, DeepSeek) e inyecta directivas y precauciones específicas adaptadas a cada modelo.
3. **Generador Adaptativo de Directivas Raíz (`root-generator.ts`)**:
   - Escribe y sincroniza los archivos de entrada correspondientes en la raíz del proyecto (`GEMINI.md`, `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.windsurfrules`, `.github/copilot-instructions.md`, `.antigravity/context.md`, `.opencode/instructions.md`) con órdenes explícitas e ineludibles para usar el arnés.
4. **Scripts de Adaptación e Inicialización (`harness-adapter.js`, `init.ps1`, `init.sh`)**:
   - Integra la detección y generación en el ciclo de inicialización nativo tanto en Windows PowerShell como en Bash.
5. **Gobernanza Estricta de `.gitignore`**:
   - Ignora la infraestructura local del arnés y anclajes generados, blindando mediante exclusiones explícitas (`!`) los manuales, tests, logs y código del proyecto.

## Alcance y No-Objetivos
- **Dentro del Alcance**:
  - Detección determinista de IDEs: Antigravity, Cursor, Windsurf, VS Code, Claude Code, OpenCode.
  - Detección o especificación de modelos de lenguaje comunes.
  - Generación de anclajes de contexto en la raíz con directivas SDD obligatorias.
  - Actualización de `init.ps1`, `init.sh` y `.gitignore`.
  - Suite de pruebas unitarias en Vitest con 100% de cobertura y CRAP < 30.
- **Fuera del Alcance (Non-Goals)**:
  - No altera los prompts internos de los agentes en `utilities/agents/`.
  - No borra archivos de código existentes del proyecto.

## Alineación con Directrices Maestras
- Cumple estrictamente con los límites anti-monolito ($\le 150$ líneas/archivo, $\le 30$ líneas/función).
- Modularidad por capas limpias en `src/shared/utils/harness/`.
- Verificación en las 7 Quality Gates.
