/**
 * src/shared/utils/harness/model-detector.ts
 * Detección y adaptación por modelo de IA para el arnés forgeAB.
 */

import type { SupportedModel } from './types.js';

interface ModelMatch {
  model: SupportedModel;
  modelName: string;
  reason: string;
}

/**
 * Normaliza y clasifica un nombre de modelo en su familia correspondiente.
 * @param rawName - Nombre o cadena identificadora del modelo
 * @returns Coincidencia de modelo o null
 */
function classifyModelName(rawName: string): ModelMatch | null {
  const lower = rawName.toLowerCase();
  if (lower.includes('gemini')) {
    return { model: 'gemini', modelName: rawName, reason: `Modelo Gemini identificado: ${rawName}` };
  }
  if (lower.includes('claude') || lower.includes('anthropic') || lower.includes('sonnet')) {
    return { model: 'claude', modelName: rawName, reason: `Modelo Claude identificado: ${rawName}` };
  }
  if (lower.includes('gpt') || lower.includes('openai') || lower.includes('o1') || lower.includes('o3')) {
    return { model: 'gpt', modelName: rawName, reason: `Modelo OpenAI/GPT identificado: ${rawName}` };
  }
  if (lower.includes('deepseek')) {
    return { model: 'deepseek', modelName: rawName, reason: `Modelo DeepSeek identificado: ${rawName}` };
  }
  return null;
}

/**
 * Evalúa las variables de entorno para inferir el modelo activo.
 * @param env - Variables de entorno a evaluar
 * @returns Coincidencia de modelo o null
 */
function matchModelEnvVars(env: NodeJS.ProcessEnv): ModelMatch | null {
  const candidates = [
    env.AI_MODEL,
    env.MODEL,
    env.LLM_MODEL,
    env.GEMINI_MODEL,
    env.ANTHROPIC_MODEL,
    env.OPENAI_MODEL,
  ];

  for (const candidate of candidates) {
    if (candidate && candidate.trim()) {
      const match = classifyModelName(candidate.trim());
      if (match) return match;
    }
  }
  return null;
}

/**
 * Obtiene las directivas maestras adaptadas según la familia de modelo.
 * @param model - Familia de modelo activo
 * @returns Cadena con pautas específicas
 */
export function getModelGuidelines(model: SupportedModel): string {
  switch (model) {
    case 'gemini':
      return '- Rol: Leader de forgeAB. Lee AGENTS.md y GEMINI.md. No olvides la verificación en current-dev.yaml.';
    case 'claude':
      return '- Rol: Leader de forgeAB. Respeta el orden estricto de CLAUDE.md y la delegación de subagentes.';
    case 'gpt':
      return '- Rol: Leader de forgeAB. Descompón cambios en pasos atómicos y respeta el límite de 150 líneas/archivo.';
    case 'deepseek':
      return '- Rol: Leader de forgeAB. Aplica razonamiento riguroso y verifica las 7 Quality Gates sin excepciones.';
    default:
      return '- Rol: Leader de forgeAB. Sigue estrictamente el ciclo Spec-Driven Development.';
  }
}

/**
 * Detecta el modelo activo de IA o infiere su familia.
 * @param env - Variables de entorno
 * @param fallback - Nombre por defecto si no se detecta
 * @returns Resultado con el modelo y el motivo
 */
export function detectActiveModel(
  env: NodeJS.ProcessEnv = process.env,
  fallback: string = 'Gemini 3.8 Flash',
): { model: SupportedModel; modelName: string; reasons: string[] } {
  const envMatch = matchModelEnvVars(env);
  if (envMatch) {
    return { model: envMatch.model, modelName: envMatch.modelName, reasons: [envMatch.reason] };
  }

  const fallbackMatch = classifyModelName(fallback);
  if (fallbackMatch) {
    return {
      model: fallbackMatch.model,
      modelName: fallback,
      reasons: [`Inferencia predeterminada del entorno: ${fallback}`],
    };
  }

  return {
    model: 'generic',
    modelName: fallback,
    reasons: ['Modelo genérico configurado'],
  };
}
