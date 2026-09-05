# Specification Delta: H002 — Arnés Adaptativo: Detección Dinámica de IDE/Modelos y Gobernanza de Gitignore

## ADDED Requirements

### REQ-H002-01: Detección Determinista de IDE Activa
El sistema DEBE disponer de una utilidad de detección capaz de identificar si el entorno actual corresponde a: `antigravity`, `cursor`, `windsurf`, `vscode`, `claude-code`, `opencode` o `generic`.
- **Escenario 1.1**:
  - **WHEN**: La variable de entorno `ANTIGRAVITY_WORKSPACE` o `ANTIGRAVITY_IDE` está presente o existe el directorio `.antigravity`.
  - **THEN**: La función de detección retorna `ide: 'antigravity'` con confianza alta.
- **Escenario 1.2**:
  - **WHEN**: La variable de entorno `CURSOR_VERSION` está definida o existe el directorio `.cursor`.
  - **THEN**: La función de detección retorna `ide: 'cursor'`.
- **Escenario 1.3**:
  - **WHEN**: La variable de entorno `WINDSURF_VERSION` está definida o existe `.windsurf`.
  - **THEN**: La función de detección retorna `ide: 'windsurf'`.
- **Escenario 1.4**:
  - **WHEN**: La variable de entorno `VSCODE_PID` está presente y no es Cursor ni Windsurf.
  - **THEN**: La función de detección retorna `ide: 'vscode'`.
- **Escenario 1.5**:
  - **WHEN**: No se detecta ningún indicador específico de IDE.
  - **THEN**: La función de detección retorna `ide: 'generic'`.

### REQ-H002-02: Detección y Adaptación por Modelo de IA
El sistema DEBE identificar o inferir la familia de modelos en uso (`gemini`, `claude`, `gpt`, `deepseek` o `generic`) y proveer directivas específicas que mitiguen sesgos o tendencias a ignorar directrices.
- **Escenario 2.1**:
  - **WHEN**: Se detecta o especifica la familia `gemini` (e.g. Gemini 3.8 Flash o 1.5 Pro).
  - **THEN**: El contenido de las directivas incluye instrucciones estrictas sobre el seguimiento de `AGENTS.md`, `GEMINI.md`, uso de herramientas sin rodeos y verificación en `project-logs/current-dev.yaml`.
- **Escenario 2.2**:
  - **WHEN**: Se detecta o especifica la familia `claude`.
  - **THEN**: El contenido inyecta pautas para Claude Code en `CLAUDE.md` enfatizando los límites de subagentes y la lectura previa de `utilities/agents/leader.md`.
- **Escenario 2.3**:
  - **WHEN**: Se detecta o especifica la familia `gpt` u otros modelos.
  - **THEN**: Se inyectan pautas sobre razonamiento metódico, límites de archivos de 150 líneas y cero modificaciones colaterales.

### REQ-H002-03: Generación Persistente de Archivos de Entrada en la Raíz
El generador del arnés DEBE colocar en la raíz del proyecto los archivos de configuración requeridos para la IDE activa y los archivos universales (`GEMINI.md`, `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.windsurfrules`, `.github/copilot-instructions.md`, `.antigravity/context.md`, `.opencode/instructions.md`), asegurando que cualquier agente mantenga siempre presente el arnés forgeAB.
- **Escenario 3.1**:
  - **WHEN**: Se ejecuta la generación para cualquier entorno.
  - **THEN**: Los archivos generados contienen la advertencia imperativa de rol activo **Leader**, orden de lectura (`leader.md`, `config.yaml`, `project-rules.md`, `current-dev.yaml`), ciclo SDD estricto y las 7 Quality Gates.
- **Escenario 3.2**:
  - **WHEN**: Se ejecutan las funciones de generación.
  - **THEN**: No se sobrescriben destructivamente directrices personalizadas del proyecto que residan en `openspec/specs/project-rules.md`.

### REQ-H002-04: Gobernanza Estricta de Gitignore
El archivo `.gitignore` DEBE ignorar los archivos de scaffolding del arnés y de entorno de IDE, preservando invariablemente manuales, tests, logs y código del proyecto.
- **Escenario 4.1**:
  - **WHEN**: Se evalúa `.gitignore` contra archivos del arnés generados (`.cursorrules`, `.windsurfrules`, `.antigravity/`, `.opencode/`, temporales).
  - **THEN**: Quedan marcados como ignorados por Git.
- **Escenario 4.2**:
  - **WHEN**: Se evalúa `.gitignore` contra manuales (`README.md`, `openspec/**`, `diagrams/**`), tests (`tests/**`), logs (`project-logs/**`) y código (`src/**`).
  - **THEN**: Permanecen explícitamente rastreados y protegidos bajo control de versiones.

## MODIFIED Requirements
Ninguno.

## REMOVED Requirements
Ninguno.
