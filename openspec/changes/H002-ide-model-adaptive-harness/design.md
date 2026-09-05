# Design: H002 — Arnés Adaptativo: Detección Dinámica de IDE/Modelos y Gobernanza de Gitignore

## Enfoque Técnico y Arquitectura
Para garantizar la máxima fiabilidad, el sistema se estructurará siguiendo los estándares de **Clean Architecture**, **Feature Colocation** y límites estrictos **Anti-Monolito**:
1. Cada archivo tendrá $\le 150$ líneas de código.
2. Cada función tendrá $\le 30$ líneas de código, usando guard clauses y funciones auxiliares puras.
3. El código fuente residirá en `src/shared/utils/harness/`:
   - `types.ts`: Tipos, interfaces y enumeraciones.
   - `ide-detector.ts`: Lógica de inspección ambiental (variables de entorno, fs).
   - `model-detector.ts`: Lógica de resolución y adaptación de modelos.
   - `root-generator.ts`: Construcción y escritura segura de directivas en la raíz.
   - `index.ts`: Barrel de exportación pública.
4. Se proveerá un script ejecutable `scripts/harness-adapter.js` invocado por:
   - `package.json` (`pnpm harness:adapt`).
   - `utilities/init.ps1` (Windows PowerShell).
   - `utilities/init.sh` (Bash).

## Interfaces de Contrato (Types)

```typescript
export type SupportedIde = 'antigravity' | 'cursor' | 'windsurf' | 'vscode' | 'claude-code' | 'opencode' | 'generic';
export type SupportedModel = 'gemini' | 'claude' | 'gpt' | 'deepseek' | 'generic';

export interface DetectionResult {
  ide: SupportedIde;
  model: SupportedModel;
  detectedAt: string;
  reasons: string[];
}

export interface DirectiveFile {
  relativePath: string;
  content: string;
  description: string;
}
```

## Anti-Monolito y Mitigación de Complejidad
- Complejidad Ciclomática (CC) $\le 5$ por función.
- Cobertura de tests unitarios $\ge 95\%$ en Vitest.
- CRAP $< 15$ en todas las funciones.

## Estrategia de Gobernanza de Gitignore
El `.gitignore` se estructurará en secciones explícitas:
- Sección 1: Temporales y backups (`*.bak`, `*.tmp`, `*.log`).
- Sección 2: Logs del proyecto (ignorar logs crudos pero preservar explícitamente `catalog-index.yaml`, `current-dev.yaml`, `story-dev.yaml`, `error-log.yaml`).
- Sección 3: Manuales, especificaciones y tests protegidos (`!README.md`, `!openspec/**`, `!diagrams/**`, `!tests/**`).
- Sección 4: Infraestructura y anclajes de entorno del arnés (`.cursorrules`, `.cursor/`, `.windsurfrules`, `.windsurf/`, `.antigravity/`, `.opencode/`, etc.).
- Sección 5: Código de proyecto y dependencias estándar (`node_modules/`, `coverage/`, `dist/`).
