# AI Development Harness
## Arnés de desarrollo asistido por IA

Un sistema de agentes coordinados para desarrollar software de forma estructurada, trazable y segura. Adaptable a cualquier lenguaje de programación.

---

## Estructura del proyecto

```
harness/
├── README.md                  ← este archivo
├── current-dev.xml            ← estado activo del desarrollo (gestionado por Leader)
├── story-dev.xml              ← historial de funciones completadas
└── agents/
    ├── 0-leader.md            ← prompt del agente director
    ├── 1-specifier.md         ← prompt del agente especificador
    ├── 2-trapper.md           ← prompt del agente de pruebas
    ├── 3-implementer.md       ← prompt del agente implementador
    └── 4-tester.md            ← prompt del agente tester
```

---

## Flujo de trabajo

```
Usuario → Specifier → Leader → [Trapper → Leader → Implementer → Tester] × N
                                              ↑                       |
                                              └──── (si falla) ───────┘
                                                       ↓
                                                  Specifier → usuario
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
2. Pega el contenido de `agents/1-specifier.md` como system prompt (o como primer mensaje indicando el rol).
3. Describe tu proyecto o funcionalidad al agente.
4. El Specifier te guiará para clarificar requisitos.
5. Cuando el Specifier pase la batuta al Leader, cambia al prompt de `agents/0-leader.md`.
6. Continúa el ciclo según el flujo, cambiando de prompt al agent indicado.

### Opción B — Con un sistema multi-agente automatizado

Configura cada agente con su prompt correspondiente en tu framework (LangGraph, AutoGen, CrewAI, etc.):

```python
# Ejemplo conceptual con cualquier framework multi-agente
agents = {
    "leader":      load_prompt("agents/0-leader.md"),
    "specifier":   load_prompt("agents/1-specifier.md"),
    "trapper":     load_prompt("agents/2-trapper.md"),
    "implementer": load_prompt("agents/3-implementer.md"),
    "tester":      load_prompt("agents/4-tester.md"),
}

# El estado compartido son los archivos XML
shared_state = {
    "current_dev": parse_xml("current-dev.xml"),
    "story_dev":   parse_xml("story-dev.xml"),
}
```

### Opción C — Manual con cualquier IA

Para cada función, sigue este orden:
1. Da el prompt de Specifier + describe la función → obtén specs.
2. Da el prompt de Trapper + specs → obtén suite de tests.
3. Da el prompt de Implementer + specs + tests → obtén código.
4. Da el prompt de Tester + código + tests → obtén resultados.
5. Si todo pasa: mueve la función a `story-dev.xml`.
6. Si falla: da el prompt de Specifier + datos del error → ajusta y repite.

---

## Adaptación a lenguajes

El arnés no asume ningún lenguaje. Cada agente adapta su output al lenguaje especificado en `<meta><language>` de `current-dev.xml`.

Ejemplos de adaptaciones automáticas:

| Concepto          | Python           | JavaScript/TS     | Java/Kotlin         | Rust              |
|-------------------|------------------|-------------------|---------------------|-------------------|
| Manejo de errores | try/except       | try/catch         | try/catch           | Result<T, E>      |
| Logging           | logging.getLogger| console.error / winston | Logger (SLF4J) | log::error!       |
| Módulos           | módulos/paquetes | módulos ES / CommonJS | paquetes/clases | crates/módulos    |
| Constantes        | SCREAMING_SNAKE  | SCREAMING_SNAKE   | static final        | const SCREAMING   |

---

## Skills

Si usas un sistema de skills (como el de Claude), el Leader indicará en cada traspaso de batuta qué skills debe revisar el subagente. Añade tus skills en la carpeta `skills/` y referéncialos en el campo `<skills_required>` de cada función en `current-dev.xml`.

```xml
<skills_required>
  <skill>docx</skill>
  <skill>pdf-reading</skill>
</skills_required>
```

---

## Principios de diseño

- **Contexto mínimo por agente**: cada subagente recibe solo lo que necesita para su tarea.
- **Trazabilidad**: todo cambio queda registrado en los XML con timestamps.
- **Separación de responsabilidades**: tareas, errores y soluciones viven en archivos distintos.
- **Seguridad por defecto**: toda función tiene pruebas de seguridad antes de implementarse.
- **Modularidad coherente**: el código se divide por lógica, no por límite de líneas.
- **Idioma del usuario**: todos los agentes responden en el idioma del usuario.

---

## Licencia

Este arnés es una plantilla de libre uso. Adáptalo a tus necesidades.
