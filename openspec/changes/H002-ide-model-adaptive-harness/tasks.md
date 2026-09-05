# Tasks: H002 — Arnés Adaptativo: Detección Dinámica de IDE/Modelos y Gobernanza de Gitignore

## 1. Skeletons & Contracts (Contract-First)
- [x] 1.1 Declarar interfaces y tipos en `src/shared/utils/harness/types.ts`
- [x] 1.2 Definir esqueletos con TSDoc formal para `detectActiveIde` y `detectActiveModel`
- [x] 1.3 Definir esqueletos con TSDoc formal para `generateRootDirectives` y `writeRootDirectives`
- [x] 1.4 Configurar barrel de exportación en `src/shared/utils/harness/index.ts`

## 2. Trapper Tests & Trampas de Calidad (Test-First)
- [x] 2.1 Crear suite de tests `tests/harness-detector.test.ts`
- [x] 2.2 Validar escenarios WHEN/THEN para detección de IDEs (Antigravity, Cursor, Windsurf, VS Code, etc.)
- [x] 2.3 Validar escenarios WHEN/THEN para detección y adaptación de modelos de IA
- [x] 2.4 Validar generación no destructiva de directivas raíz con reglas SDD obligatorias
- [x] 2.5 Ejecutar test suite (Verificación estado Red/Green)

## 3. Implementación Central (Implementer)
- [x] 3.1 Implementar lógica en `src/shared/utils/harness/ide-detector.ts` (<= 150 líneas, <= 30 líneas/fn)
- [x] 3.2 Implementar lógica en `src/shared/utils/harness/model-detector.ts` (<= 150 líneas, <= 30 líneas/fn)
- [x] 3.3 Implementar lógica en `src/shared/utils/harness/root-generator.ts` (<= 150 líneas, <= 30 líneas/fn)
- [x] 3.4 Validar paso a Green en `tests/harness-detector.test.ts`

## 4. Integración de Scripts y Gobernanza de Gitignore
- [x] 4.1 Crear script CLI `scripts/harness-adapter.js`
- [x] 4.2 Añadir script `harness:adapt` en `package.json`
- [x] 4.3 Actualizar `utilities/init.ps1` para ejecutar la detección y generación en Windows
- [x] 4.4 Actualizar `utilities/init.sh` para ejecutar la detección y generación en Bash
- [x] 4.5 Actualizar `.gitignore` con exclusiones e inmunidades rigurosas

## 5. Auditoría de Calidad y 7 Gates (Tester)
- [x] 5.1 Gate 1: Compilación y TypeCheck (`pnpm typecheck` -> 0 errores)
- [x] 5.2 Gate 2: Linter (`pnpm lint` -> 0 errores)
- [x] 5.3 Gate 3: Límites Anti-Monolito (<= 150 líneas/archivo, <= 30 líneas/función)
- [x] 5.4 Gate 4: Cobertura de Tests (100% líneas, 100% ramas)
- [x] 5.5 Gate 5: Métrica CRAP (< 30) y CC (<= 10)
- [x] 5.6 Gate 6: Auditoría de Seguridad y CVEs (`pnpm audit` -> 0 vulnerabilidades)
- [x] 5.7 Gate 7: Integridad de Catálogo (`pnpm harness:verify` -> 0 eliminaciones)

## 6. Sincronización y Archivo (Leader)
- [x] 6.1 Actualizar catálogo de funciones con `pnpm harness:index`
- [x] 6.2 Archivar cambio en `project-logs/current-dev.yaml` y `story-dev.yaml`
- [x] 6.3 Validar control de versiones y estado de Git
