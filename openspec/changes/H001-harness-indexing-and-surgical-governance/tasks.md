# Tasks: H001 — Gobernanza de Indexación, Integridad de Catálogo y Edición Quirúrgica

## 1. Preparación de Herramientas y Esquemas
- [x] 1.1 Definir estructura del catálogo vivo en `project-logs/catalog-index.yaml`
- [x] 1.2 Implementar script de indexación y verificación en `scripts/harness-indexer.js`
- [x] 1.3 Configurar comandos `harness:index` y `harness:verify` en `package.json`

## 2. Implementación de Salvaguardas y Calidad (Core Implementation)
- [x] 2.1 Integrar Gate 7 (Catalog Integrity & No-Regression Audit) en `scripts/quality-gate.js`
- [x] 2.2 Actualizar directrices maestras en `openspec/specs/project-rules.md`
- [x] 2.3 Actualizar prompts de agentes en `utilities/agents/`:
  - `leader.md`: git commit por loop y sincronización de catálogo
  - `specifier.md`: checkpoint mandatorio de revisión del Critic
  - `critic.md`: auditoría de conversación Specifier-Usuario e inspección de diffs quirúrgicos
  - `planner.md`: diseño modular por secciones y política de reutilización
  - `implementer.md`: principio de edición quirúrgica semántica y preservación de contexto
  - `trapper.md`: trampas de integridad de catálogo y accesibilidad UI/UX
  - `tester.md`: ejecución de Gate 7 de integridad de catálogo
- [x] 2.4 Actualizar skill de calidad en `.agents/skills/fullstack-quality-gate/SKILL.md`

## 3. Verificación y Auditoría
- [x] 3.1 Ejecutar `pnpm harness:index` para generar el catálogo inicial
- [x] 3.2 Ejecutar `pnpm harness:verify` para validar consistencia
- [x] 3.3 Ejecutar `pnpm quality-gate` y verificar paso de los 7 gates
- [x] 3.4 Actualizar `project-logs/current-dev.yaml`
