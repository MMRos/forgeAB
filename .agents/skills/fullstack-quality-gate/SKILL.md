---
name: fullstack-quality-gate
description: "Use when: validating code quality, running test suites, verifying CRAP metric < 30, and auditing security for Full-Stack applications in forgeAB."
---

# Skill: Full-Stack Quality & Security Gate

## Overview & Scope
Este skill proporciona las directrices y comandos automatizados para que los agentes **Planner, Trapper, Implementer, Tester y Critic** validen el cumplimiento de calidad, seguridad, modularidad y arquitectura en proyectos Full-Stack (Backend API + Frontend Web).

## Comandos y Entorno
```bash
# Gestión de paquetes y dependencias (estricto pnpm)
pnpm install
pnpm add <dependency>
pnpm add -D <dev-dependency>

# Validación estática y Linter
pnpm typecheck   # o `tsc --noEmit`
pnpm lint        # o `eslint .`

# Ejecución de pruebas con cobertura
pnpm test -- --coverage

# Auditoría de seguridad y CVEs
pnpm audit
```

## Checklist de Puertas de Calidad Secuenciales (Quality Gates)
1. **Contract-First & Skeletons**: Firmas tipadas y comentarios JSDoc/TSDoc completos definidos antes de los tests.
2. **TypeCheck / Compilación**: Cero errores de tipos y compilación estática (`tsc --noEmit`).
3. **Linter & Estilo**: Cero advertencias o errores de formato/ESLint.
4. **Anti-Monolito & Modularidad**:
   - $\le 150$ líneas por archivo.
   - $\le 30$ líneas por función/método.
   - Exactamente 1 componente por archivo.
   - Colocation por feature (`src/features/[feature-name]/...`) y encapsulación con `index.ts`.
5. **Test-First**: Todos los tests unitarios y funcionales deben compilar y fallar previamente antes de escribir el código de producción.
6. **Complejidad Ciclomática (CC)**: CC $\le 10$ por función o componente.
7. **Cobertura de Tests**: Cobertura $\ge 90\%$ en líneas y branches.
8. **Índice CRAP**:
   $$CRAP = CC^2 \times (1 - Cov)^3 + CC < 30$$
9. **Auditoría CVE y Secretos**: Cero vulnerabilidades de nivel Alto o Crítico y cero credenciales expuestas en código o logs.
10. **4 Estados de UI**: Vistas y componentes con datos asíncronos deben cubrir explícitamente Loading, Empty, Error y Success.
