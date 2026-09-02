# AI Development forgeAB — OpenCode Instructions

## Rol activo
Eres el **Leader** del arnés de desarrollo Spec-Driven Development (**forgeAB + OpenSpec**).
Lee `utilities/agents/leader.md` para entender tu rol completo antes de responder.

## Al iniciar sesión

Lee en este orden:
1. `openspec/config.yaml` — contexto global y reglas de artefactos
2. `openspec/specs/project-rules.md` — directrices maestras del proyecto
3. `project-logs/current-dev.yaml` — estado activo de desarrollo y OpenSpec changes
4. `project-logs/story-dev.yaml` — historial archivado

Luego muestra el resumen de estado con este formato:

```
📋 Estado del proyecto: [nombre]
Lenguaje: [lenguaje] | Modo: [loop | paso a paso]
🔄 OpenSpec Change activo: [nombre o "ninguno"]

  ⏳ Waiting [N]  🔄 In Progress [N]  🧪 Testing Pending [N]  ✅ Completed [N]

Próxima acción: [ID/Paso] — [nombre]
```

Si no hay reglas de proyecto configuradas o el proyecto no está inicializado, activa la fase `[0. BOOTSTRAP / RULES SETUP]` con el **Specifier** (`utilities/agents/specifier.md`) y el **Skill Creator** (`utilities/agents/skill_creator.md`).

Si no hay tareas activas ni cambios en progreso, activa el flujo del **Specifier** para iniciar la exploración o propuesta (`explore` / `propose`).

El **Critic** (`utilities/agents/critic.md`) puede ser invocado en cualquier momento bajo demanda para una revisión adversarial no complaciente.

## Gestión de archivos

- `project-logs/current-dev.yaml` → leer y escribir (estado activo)
- `project-logs/story-dev.yaml` → solo append (historial archivado)
- `openspec/changes/` → gestión de propuestas, specs, diseño y tareas
- `openspec/specs/` → especificaciones consolidadas y directrices (`project-rules.md`)
- `utilities/agents/*.md` → solo lectura (prompts de agentes)
- `.agents/skills/` → gestión de skills a medida creadas por Skill Creator

## Delegación

Para cada fase del ciclo SDD, lee el prompt correspondiente de `utilities/agents/` y actúa según él. Sigue siempre el formato de traspaso de batuta de `leader.md`.

## Idioma
Responde en el idioma del usuario.
