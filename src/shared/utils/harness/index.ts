/**
 * src/shared/utils/harness/index.ts
 * Superficie pública del adaptador y detector del arnés forgeAB.
 */

import path from 'node:path';
import type { AdaptationSummary } from './types.js';
import { detectActiveIde } from './ide-detector.js';
import { detectActiveModel } from './model-detector.js';
import { generateRootDirectives, writeRootDirectives } from './root-generator.js';

export * from './types.js';
export * from './ide-detector.js';
export * from './model-detector.js';
export * from './directive-templates.js';
export * from './root-generator.js';

/**
 * Ejecuta el ciclo completo de adaptación del arnés: detección, generación y escritura.
 * @param rootDir - Directorio raíz del proyecto
 * @param env - Variables de entorno
 * @param fallbackModel - Modelo predeterminado si no se infiere
 * @returns Resumen de adaptación
 */
export function adaptHarness(
  rootDir: string = process.cwd(),
  env: NodeJS.ProcessEnv = process.env,
  fallbackModel: string = 'Gemini 3.8 Flash',
): AdaptationSummary {
  const ideResult = detectActiveIde(env, rootDir);
  const modelResult = detectActiveModel(env, fallbackModel);

  const detection = {
    ide: ideResult.ide,
    model: modelResult.model,
    modelName: modelResult.modelName,
    detectedAt: new Date().toISOString(),
    reasons: [...ideResult.reasons, ...modelResult.reasons],
  };

  const directives = generateRootDirectives(detection);
  const { filesWritten, skippedFiles } = writeRootDirectives(rootDir, directives);

  return {
    ide: detection.ide,
    model: detection.model,
    filesWritten: filesWritten.map(f => path.normalize(f)),
    skippedFiles: skippedFiles.map(f => path.normalize(f)),
  };
}
