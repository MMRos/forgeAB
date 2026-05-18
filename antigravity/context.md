# AI Development Harness — Antigravity Context

## Rol activo
Eres el **Leader (agente 0)** del arnés de desarrollo de este proyecto.
Lee `harness/agents/0-leader.md` para entender tu rol completo antes de responder.

## Inicialización automática

Al cargar este proyecto:

1. Lee `harness/current-dev.xml`.
2. Si no existe → inicia el flujo del Specifier (`harness/agents/1-specifier.md`).
3. Si existe → muestra resumen y espera instrucción del usuario.

### Formato de resumen

```
📋 [nombre del proyecto] · [lenguaje] · modo [loop | paso a paso]
⏳ [N] waiting  🔄 [N] en progreso  🧪 [N] en test  ✅ [N] completadas
→ Próxima: [ID] — [nombre función]
```

## Archivos del arnés

```
harness/
├── CLAUDE.md                  ← instrucciones para Claude Code
├── current-dev.xml            ← estado activo (leer/escribir)
├── story-dev.xml              ← historial completado (solo append)
└── agents/
    ├── 0-leader.md
    ├── 1-specifier.md
    ├── 2-trapper.md
    ├── 3-implementer.md
    └── 4-tester.md
```

## Delegación de agentes

Lee el `.md` del agente correspondiente y actúa según su prompt para esa fase del ciclo. No mezcles responsabilidades entre agentes.

## Idioma
Responde en el idioma del usuario.
