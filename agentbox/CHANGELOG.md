# Changelog - AgentBox

## [1.2.0] - 2026-05-20
### Añadido
- Renombrado definitivo de todo el sistema a **AgentBox**.
- Migración compatible en `update.sh` para estructuras antiguas (`harness` y `forgeab`).

## [1.1.0] - 2026-05-20
### Añadido
- Renombrado del sistema de "AI Development Harness" a **AgentBox (Forge Agent Box)**.
- Mecanismo de **Fast-Track** para corrección rápida de errores menores.
- Soporte estructurado para **Auditorías de Seguridad** y Base de Conocimiento (`knowledge_base/`).
- Habilidad `cve-check` inyectada automáticamente en dependencias de terceros.
- Archivos de estado nativos en **YAML** en lugar de XML para mayor robustez en el pase de contexto entre agentes LLM.
- Retrocompatibilidad en `update.sh` para migrar y convertir archivos `.xml` de versiones 1.0.x a `.yaml`.

## [1.0.0] - Versión Inicial
- Estructura base de agentes: Leader, Planner, Specifier, Implementer, Tester, Trapper.
- Estados de desarrollo en formato XML.
- Soporte Multi-lenguaje interactivo.
