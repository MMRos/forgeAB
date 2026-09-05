/**
 * src/shared/utils/harness/ide-detector.ts
 * Detección determinista de IDE para el arnés forgeAB.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { SupportedIde } from './types.js';

interface IdeMatch {
  ide: SupportedIde;
  reason: string;
}

/**
 * Evalúa variables de entorno para entornos especializados (Antigravity, Cursor, Windsurf).
 */
function matchSpecializedEnv(env: NodeJS.ProcessEnv): IdeMatch | null {
  if (env.ANTIGRAVITY_WORKSPACE || env.ANTIGRAVITY_IDE) {
    return { ide: 'antigravity', reason: 'Variable de entorno ANTIGRAVITY detectada' };
  }
  if (env.CURSOR_VERSION || env.CURSOR_TRACE_ID) {
    return { ide: 'cursor', reason: 'Variable de entorno CURSOR detectada' };
  }
  if (env.WINDSURF_VERSION) {
    return { ide: 'windsurf', reason: 'Variable de entorno WINDSURF detectada' };
  }
  return null;
}

/**
 * Evalúa variables de entorno para entornos estándar (Claude, OpenCode, VSCode).
 */
function matchStandardEnv(env: NodeJS.ProcessEnv): IdeMatch | null {
  if (env.CLAUDE_PROJECT_DIR || env.CLAUDE_CODE_ENTRY) {
    return { ide: 'claude-code', reason: 'Variable de entorno CLAUDE detectada' };
  }
  if (env.OPENCODE_VERSION) {
    return { ide: 'opencode', reason: 'Variable de entorno OPENCODE detectada' };
  }
  if (env.VSCODE_PID || env.TERM_PROGRAM === 'vscode') {
    return { ide: 'vscode', reason: 'Variable de entorno VSCODE detectada' };
  }
  return null;
}

/**
 * Evalúa huellas en disco para identificar la IDE configurada.
 */
function matchDirectoryFootprint(cwd: string): IdeMatch | null {
  if (fs.existsSync(path.join(cwd, '.antigravity'))) {
    return { ide: 'antigravity', reason: 'Directorio .antigravity/ presente' };
  }
  if (fs.existsSync(path.join(cwd, '.cursor')) || fs.existsSync(path.join(cwd, '.cursorrules'))) {
    return { ide: 'cursor', reason: 'Configuración de Cursor detectada' };
  }
  if (fs.existsSync(path.join(cwd, '.windsurf')) || fs.existsSync(path.join(cwd, '.windsurfrules'))) {
    return { ide: 'windsurf', reason: 'Configuración de Windsurf detectada' };
  }
  if (fs.existsSync(path.join(cwd, '.opencode'))) {
    return { ide: 'opencode', reason: 'Directorio .opencode/ presente' };
  }
  if (fs.existsSync(path.join(cwd, '.vscode'))) {
    return { ide: 'vscode', reason: 'Directorio .vscode/ presente' };
  }
  return null;
}

/**
 * Detecta la IDE activa de forma determinista y sin efectos secundarios.
 * @param env - Variables de entorno opcionales
 * @param cwd - Ruta de trabajo actual opcional
 * @returns Resultado con el IDE detectado y los motivos
 */
export function detectActiveIde(
  env: NodeJS.ProcessEnv = process.env,
  cwd: string = process.cwd(),
): { ide: SupportedIde; reasons: string[] } {
  const specialized = matchSpecializedEnv(env);
  if (specialized) {
    return { ide: specialized.ide, reasons: [specialized.reason] };
  }

  const standard = matchStandardEnv(env);
  if (standard) {
    return { ide: standard.ide, reasons: [standard.reason] };
  }

  const fsMatch = matchDirectoryFootprint(cwd);
  if (fsMatch) {
    return { ide: fsMatch.ide, reasons: [fsMatch.reason] };
  }

  return { ide: 'generic', reasons: ['Sin huella específica de IDE; aplicando perfil genérico'] };
}
