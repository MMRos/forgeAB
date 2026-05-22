# AgentBox (Forge Agent Box)
## Entorno de desarrollo asistido por IA
Un sistema de agentes coordinados para desarrollar software de forma estructurada, trazable y segura. Adaptable a cualquier lenguaje de programación y equipado con validaciones de entorno para una ejecución confiable.

---

## Estructura del proyecto

```
agentbox/
├── init.sh                    ← script de inicialización y seguridad
├── CLAUDE.md                  ← instrucciones de entrada para Claude Code
├── .antigravity/              ← instrucciones de entrada para Antigravity
├── .opencode/                 ← instrucciones de entrada para OpenCode
├── templates/                 ← plantillas base para archivos de estado y diagramas
└── agents/
    ├── leader.md              ← prompt del agente director
    ├── specifier.md           ← prompt del agente especificador
    ├── trapper.md             ← prompt del agente de pruebas
    ├── implementer.md         ← prompt del agente implementador
    ├── tester.md              ← prompt del agente tester
    └── planner.md             ← prompt del agente planificador arquitectónico

Generados en tiempo de ejecución por init.sh (en agentbox/):
├── current-dev.yaml            ← estado activo del desarrollo (gestionado por Leader)
├── story-dev.yaml              ← historial de funciones completadas
└── error-log.yaml              ← registro de errores activos
```

---

## Inicialización y Seguridad (`init.sh`)

Para preparar el entorno de trabajo, el arnés incluye un script de inicialización robusto que debe ejecutarse desde la raíz de tu proyecto:

```bash
bash agentbox/init.sh
```

**Durante la inicialización, el script realiza:**
1. **Revisión del entorno:** Valida que el arnés no se ejecute en la raíz del sistema operativo y comprueba los permisos de escritura del proyecto.
2. **Pruebas de seguridad:** Verifica la integridad de la estructura base requerida (carpetas `templates/` y `agents/`).
3. **Gestión estricta de dependencias (pnpm):** El arnés requiere `pnpm` y prohíbe explícitamente el uso de `npm`. Si `pnpm` no está instalado, el script te guiará para descargar e instalar el binario oficial de forma independiente (vía `curl` o `wget`), configurando los alias automáticamente.
4. **Despliegue de plantillas:** Configura los archivos de estado XML (`current-dev.yaml`, `story-dev.yaml`), crea la estructura de diagramas y genera las configuraciones específicas por IDE.

---

## Diagramas Arquitectónicos (`diagrams/`)

El arnés utiliza diagramas en formato Mermaid (`.mmd`) para mantener una visión clara del sistema. Estos diagramas son generados y actualizados por el agente **Planner**:
- `class-diagram.mmd`: Estructura de clases, entidades y sus relaciones.
- `use-case.mmd`: Interacciones de los actores con el sistema (casos de uso).
- `sequence.mmd`: Flujo temporal de mensajes entre componentes.
- `communication.mmd`: Flujo de mensajes estructural entre objetos.
- `activity.mmd`: Flujo de control o de datos paso a paso.
- `state.mmd`: Transiciones de estado de las entidades principales.

---

## Flujo de trabajo

```
Flujo principal:
Usuario → Specifier → Planner → Leader → [Trapper → Leader → Implementer → Tester] × N
                                          ↑                                  |
                                          └───────── (si falla) ─────────────┘
                                          ↓
                                  Specifier → usuario

Flujo de errores reportados por usuario:
Usuario → Leader (documenta error) → Trapper (recaba info/test) → Leader → Specifier (ajusta specs) → Planner → ... (ciclo normal)
```

### Estados de una función

```
Waiting → In Progress → Testing Pending → Completed
                ↑                              |
                └─── (si falla el test) ───────┘
```

---

## Cómo usar el arnés

### Opción A — Con un modelo de IA conversacional (Claude, GPT, etc.)

1. Abre una conversación nueva.
2. Pega el contenido de `agents/specifier.md` como system prompt (o como primer mensaje indicando el rol).
3. Describe tu proyecto o funcionalidad al agente.
4. El Specifier te guiará para clarificar requisitos.
5. Cuando el Specifier pase la batuta al Leader, cambia al prompt de `agents/leader.md`.
6. Continúa el ciclo según el flujo, cambiando de prompt al agent indicado.

### Opción B — Con un sistema multi-agente automatizado

Configura cada agente con su prompt correspondiente en tu framework (LangGraph, AutoGen, CrewAI, etc.):

```python
# Ejemplo conceptual con cualquier framework multi-agente
agents = {
    "leader":      load_prompt("agents/leader.md"),
    "specifier":   load_prompt("agents/specifier.md"),
    "trapper":     load_prompt("agents/trapper.md"),
    "implementer": load_prompt("agents/implementer.md"),
    "tester":      load_prompt("agents/tester.md"),
    "planner":     load_prompt("agents/planner.md"),
}

# El estado compartido son los archivos YAML
shared_state = {
    "current_dev": parse_yaml("current-dev.yaml"),
    "story_dev":   parse_yaml("story-dev.yaml"),
}
```

### Opción C — Manual con cualquier IA

Para cada función, sigue este orden:
1. Da el prompt de Specifier + describe la función → obtén specs.
2. Da el prompt de Planner + specs → obtén arquitectura y diagramas actualizados.
3. Da el prompt de Trapper + specs → obtén suite de tests.
4. Da el prompt de Implementer + specs + tests → obtén código.
5. Da el prompt de Tester + código + tests → obtén resultados.
6. Si todo pasa: mueve la función a `story-dev.yaml`.
7. Si falla: da el prompt de Specifier (o Leader) + datos del error → ajusta y repite.

---

## Adaptación a lenguajes

El arnés no asume ningún lenguaje. Cada agente adapta su output al lenguaje especificado en `meta/language` de `current-dev.yaml`.

Ejemplos de adaptaciones automáticas:

| Concepto          | Python           | JavaScript/TS     | Java/Kotlin         | Rust              |
|-------------------|------------------|-------------------|---------------------|-------------------|
| Manejo de errores | try/except       | try/catch         | try/catch           | Result<T, E>      |
| Logging           | logging.getLogger| console.error / winston | Logger (SLF4J) | log::error!       |
| Módulos           | módulos/paquetes | módulos ES / CommonJS | paquetes/clases | crates/módulos    |
| Constantes        | SCREAMING_SNAKE  | SCREAMING_SNAKE   | static final        | const SCREAMING   |

---
## Base de Conocimiento (Knowledge Base)

Para mantener a los agentes alineados con las reglas y restricciones específicas de tu proyecto (especialmente de seguridad y dependencias obsoletas), puedes dejar notas en formato Markdown dentro de `agentbox/knowledge_base/`.
Por defecto, el script de inicialización crea un archivo `security-guidelines.md`. El **Implementer** y el **Tester** están obligados a leer el contenido de esta carpeta antes de escribir o evaluar código.

---

## Skills y Auditoría de Seguridad

El arnés obliga al Tester a ejecutar comandos de auditoría del ecosistema (ej. `npm audit`, `cargo audit`) siempre que se enfrente a un test de seguridad.

Adicionalmente, si usas un sistema de skills (como el de Claude), el Leader indicará en cada traspaso de batuta qué skills debe revisar el subagente. Añade tus skills en la carpeta `agentbox/skills/` y referéncialos en `current-dev.yaml`.
**Por defecto se incluye el skill `cve-check`**, el cual el Trapper inyectará automáticamente si hay dependencias externas, instruyendo al Tester para que investigue vulnerabilidades (CVEs) en internet.

```yaml
skills_required:
  - docx
  - pdf-reading
  - cve-check
```

---

## Principios de diseño

- **Contexto mínimo por agente**: cada subagente recibe solo lo que necesita para su tarea.
- **Trazabilidad**: todo cambio queda registrado en los YAML con timestamps.
- **Separación de responsabilidades**: tareas, errores y soluciones viven en archivos distintos.
- **Seguridad por defecto**: toda función tiene pruebas de seguridad antes de implementarse.
- **Modularidad coherente**: el código se divide por lógica, no por límite de líneas.
- **Idioma del usuario**: todos los agentes responden en el idioma del usuario.

---

## Licencia
Copyright (c) 2026 MMRos. Todos los derechos reservados.
Este software es propietario. Consulta el archivo [LICENSE](./LICENSE) para más detalles sobre las restricciones de uso y distribución.
