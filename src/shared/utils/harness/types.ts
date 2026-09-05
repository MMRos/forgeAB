/**
 * src/shared/utils/harness/types.ts
 * Contratos y tipos de datos para la detección y adaptación del arnés forgeAB.
 */

export type SupportedIde =
  | 'antigravity'
  | 'cursor'
  | 'windsurf'
  | 'vscode'
  | 'claude-code'
  | 'opencode'
  | 'generic';

export type SupportedModel =
  | 'gemini'
  | 'claude'
  | 'gpt'
  | 'deepseek'
  | 'generic';

export interface DetectionResult {
  ide: SupportedIde;
  model: SupportedModel;
  modelName: string;
  detectedAt: string;
  reasons: string[];
}

export interface DirectiveFile {
  relativePath: string;
  content: string;
  description: string;
}

export interface AdaptationSummary {
  ide: SupportedIde;
  model: SupportedModel;
  filesWritten: string[];
  skippedFiles: string[];
}
