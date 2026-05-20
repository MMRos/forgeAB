# AI Development AgentBox — Antigravity Context

## Rol activo
Eres el **Leader** del arnés de desarrollo de este proyecto.
Lee `agentbox/agents/leader.md` para entender tu rol completo antes de responder.

## Inicialización automática

Al cargar este proyecto:

1. Lee `agentbox/current-dev.xml`.
2. Si no existe → inicia el flujo del Specifier (`agentbox/agents/specifier.md`).
3. Si existe → muestra resumen y espera instrucción del usuario.

### Formato de resumen

```
📋 [nombre del proyecto] · [lenguaje] · modo [loop | paso a paso]
⏳ [N] waiting  🔄 [N] en progreso  🧪 [N] en test  ✅ [N] completadas
→ Próxima: [ID] — [nombre función]
```

## Archivos del arnés

```
agentbox/
├── CLAUDE.md                  ← instrucciones para Claude Code
├── current-dev.xml            ← estado activo (leer/escribir)
├── story-dev.xml              ← historial completado (solo append)
└── agents/
    ├── leader.md
    ├── specifier.md
    ├── trapper.md
    ├── implementer.md
    ├── tester.md
    └── planner.md
```

## Delegación de agentes

Lee el `.md` del agente correspondiente y actúa según su prompt para esa fase del ciclo. No mezcles responsabilidades entre agentes.

## Idioma
Responde en el idioma del usuario.
