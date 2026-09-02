# Proposal: H001 — Gobernanza de Indexación, Integridad de Catálogo y Edición Quirúrgica

## Contexto y Motivación
Durante la evolución y mantenimiento iterativo de software asistido por IA, existen riesgos sistemáticos de regresión destructiva:
1. Eliminación accidental o refactorización indebida de funciones y estructuras de datos previamente construidas.
2. Pérdida de accesibilidad desde la interfaz de usuario (UI/UX) hacia funciones expuestas.
3. Modificaciones indiscriminadas en bloques de código que alteran variables o estilos adyacentes no solicitados.
4. Diseños monolíticos de páginas o vistas que ignoran la reutilización de componentes atómicos existentes.
5. Falta de persistencia versionada (commits) al cierre de cada ciclo de desarrollo (loop).
6. Falta de una auditoría crítica adversarial inmediata sobre las conclusiones alcanzadas entre el Specifier y el usuario.

Esta propuesta implementa salvaguardas estructurales en el arnés forgeAB para erradicar estos riesgos mediante herramientas deterministas, reglas maestras y roles de agentes refinados.

## Cambios Propuestos
1. **Motor de Indexación Continua (`harness-indexer.js`)**: Indexador automático que registra funciones de negocio, modelos de datos, endpoints y rutas/componentes UI en `project-logs/catalog-index.yaml`.
2. **Puerta de Calidad de Integridad de Catálogo (Gate 7)**: Validación determinista que bloquea cualquier eliminación o desaparición de funciones/datos que no esté explícitamente justificada y aprobada en `## REMOVED Requirements`.
3. **Verificación de Accesibilidad UI/UX**: Regla de comprobación que verifica que cada función o dato con interfaz de usuario declarada mantenga su componente visual y ruta accesible.
4. **Regla de Edición Quirúrgica Semántica**: Prohibición de alterar propiedades, estilos o variables vecinas fuera del ámbito estricto del cambio pedido; contraste obligatorio de diff.
5. **Diseño Modular por Secciones y Reutilización**: Obligación en el Planner de estructurar páginas por secciones atómicas y verificar componentes reutilizables en `src/shared/` y `src/features/`.
6. **Git Commit Automático por Loop**: El Leader realizará un commit atómico en la rama activa al concluir con éxito la fase de sincronización y archivo de cada loop.
7. **Auditoría Sistemática del Critic**: Revisión adversarial obligatoria del Critic tras la conversación Specifier-Usuario antes de avanzar a diseño técnico.

## Alcance y No-Objetivos
- **Dentro del Alcance**:
  - Scripts de indexación y verificación en Node.js (`scripts/harness-indexer.js`).
  - Integración en `scripts/quality-gate.js` y `package.json`.
  - Actualización de directrices maestras en `openspec/specs/project-rules.md`.
  - Actualización de prompts de agentes en `utilities/agents/`.
  - Actualización de la skill `fullstack-quality-gate`.
- **Fuera del Alcance (Non-Goals)**:
  - No sustituye la suite de pruebas funcionales ni los tests unitarios existentes.
  - No realiza `git push` autónomo a repositorios remotos (solo commits locales).

## Alineación con Directrices Maestras
- Cumple con los límites anti-monolito ($\le 150$ líneas/archivo, $\le 30$ líneas/función).
- Refuerza la filosofía Test-First y los Quality Gates intransigentes de forgeAB.
- Fortalece el rol del Critic con criterios de inspección de diffs quirúrgicos.
