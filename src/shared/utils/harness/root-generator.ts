/**
 * src/shared/utils/harness/root-generator.ts
 * Generador y escritor de directivas en la raíz del proyecto para forgeAB.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { DetectionResult, DirectiveFile } from './types.js';
import { buildCoreDirective } from './directive-templates.js';

/**
 * Genera la lista de archivos de directivas que deben colocarse en la raíz del proyecto.
 * @param result - Resultado de detección de IDE y modelo
 * @returns Array de archivos de directivas a sincronizar
 */
export function generateRootDirectives(result: DetectionResult): DirectiveFile[] {
  const coreContent = buildCoreDirective(result);
  const files: DirectiveFile[] = [
    { relativePath: 'GEMINI.md', content: coreContent, description: 'Directivas raíz para Gemini y Antigravity' },
    { relativePath: 'AGENTS.md', content: coreContent, description: 'Directivas universales de agentes' },
    { relativePath: 'CLAUDE.md', content: coreContent, description: 'Directivas raíz para Claude Code' },
    { relativePath: '.cursorrules', content: coreContent, description: 'Directivas de contexto para Cursor IDE' },
    { relativePath: '.windsurfrules', content: coreContent, description: 'Directivas de contexto para Windsurf IDE' },
    {
      relativePath: path.join('.github', 'copilot-instructions.md'),
      content: coreContent,
      description: 'Instrucciones para GitHub Copilot y VS Code',
    },
    {
      relativePath: path.join('.antigravity', 'context.md'),
      content: coreContent,
      description: 'Contexto de arnés para Google Antigravity',
    },
    {
      relativePath: path.join('.opencode', 'instructions.md'),
      content: coreContent,
      description: 'Instrucciones de arnés para OpenCode',
    },
  ];

  return files;
}

/**
 * Escribe los archivos de directivas en el directorio raíz sin alterar archivos no relacionados.
 * @param rootDir - Directorio raíz del proyecto
 * @param directives - Lista de directivas a escribir
 * @returns Resumen de archivos escritos y omitidos
 */
export function writeRootDirectives(
  rootDir: string,
  directives: DirectiveFile[],
): { filesWritten: string[]; skippedFiles: string[] } {
  const filesWritten: string[] = [];
  const skippedFiles: string[] = [];

  for (const item of directives) {
    const fullPath = path.join(rootDir, item.relativePath);
    const parentDir = path.dirname(fullPath);

    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    const currentContent = fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf-8') : null;
    if (currentContent !== item.content) {
      fs.writeFileSync(fullPath, item.content, 'utf-8');
      filesWritten.push(item.relativePath);
    } else {
      skippedFiles.push(item.relativePath);
    }
  }

  return { filesWritten, skippedFiles };
}
