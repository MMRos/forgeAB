#!/usr/bin/env node
/**
 * scripts/harness-indexer.js
 * forgeAB Automated Function & Data Catalog Indexer and Verification Engine
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, 'src');
const CATALOG_PATH = path.join(ROOT_DIR, 'project-logs', 'catalog-index.yaml');
const OPENSPEC_CHANGES_DIR = path.join(ROOT_DIR, 'openspec', 'changes');

/**
 * Recursively collects all source files
 */
function getSourceFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
      files.push(...getSourceFiles(fullPath));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Extracts exported functions, interfaces/types and components from a source file
 */
function extractExports(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
  const lines = content.split('\n');
  const items = { functions: {}, data: {}, ui: {} };

  const isUiFile = filePath.endsWith('.tsx') || filePath.endsWith('.jsx');

  for (const line of lines) {
    const trimmed = line.trim();
    // Match export function or export const/let fn =
    const fnMatch = trimmed.match(/export\s+(?:async\s+)?function\s+([a-zA-Z0-9_$]+)/) ||
                    trimmed.match(/export\s+const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>/);
    if (fnMatch) {
      const name = fnMatch[1];
      const isComponent = isUiFile && /^[A-Z]/.test(name);
      if (isComponent) {
        items.ui[name] = { file: relPath, type: 'component' };
      } else {
        items.functions[name] = { file: relPath, type: 'function', has_ui: isUiFile };
      }
    }

    // Match export interface / export type
    const dataMatch = trimmed.match(/export\s+(?:interface|type|class)\s+([a-zA-Z0-9_$]+)/);
    if (dataMatch) {
      const name = dataMatch[1];
      items.data[name] = { file: relPath, type: 'data_structure' };
    }
  }
  return items;
}

/**
 * Builds the complete catalog index from source files
 */
export function buildCatalog() {
  const files = getSourceFiles(SRC_DIR);
  const catalog = {
    version: 1,
    updated_at: new Date().toISOString(),
    functions: {},
    data_structures: {},
    ui_components: {},
  };

  for (const file of files) {
    const extracted = extractExports(file);
    Object.assign(catalog.functions, extracted.functions);
    Object.assign(catalog.data_structures, extracted.data);
    Object.assign(catalog.ui_components, extracted.ui);
  }
  return catalog;
}

/**
 * Serializes catalog object to YAML formatted string
 */
function serializeToYaml(catalog) {
  let out = `# catalog-index.yaml\n# Inventario acumulativo y continuo de funciones, datos y UI de forgeAB.\n`;
  out += `version: ${catalog.version}\nupdated_at: "${catalog.updated_at}"\n\n`;

  out += `functions:\n`;
  for (const [name, info] of Object.entries(catalog.functions)) {
    out += `  ${name}:\n    file: "${info.file}"\n    type: "${info.type}"\n    has_ui: ${info.has_ui}\n`;
  }

  out += `\ndata_structures:\n`;
  for (const [name, info] of Object.entries(catalog.data_structures)) {
    out += `  ${name}:\n    file: "${info.file}"\n    type: "${info.type}"\n`;
  }

  out += `\nui_components:\n`;
  for (const [name, info] of Object.entries(catalog.ui_components)) {
    out += `  ${name}:\n    file: "${info.file}"\n    type: "${info.type}"\n`;
  }
  return out;
}

/**
 * Reads existing YAML catalog
 */
function readCatalog() {
  if (!fs.existsSync(CATALOG_PATH)) return null;
  const content = fs.readFileSync(CATALOG_PATH, 'utf-8');
  const catalog = { functions: {}, data_structures: {}, ui_components: {} };

  let currentSection = null;
  let currentKey = null;

  for (const line of content.split('\n')) {
    if (line.startsWith('functions:')) currentSection = 'functions';
    else if (line.startsWith('data_structures:')) currentSection = 'data_structures';
    else if (line.startsWith('ui_components:')) currentSection = 'ui_components';
    else if (currentSection && line.match(/^ {2}([a-zA-Z0-9_$]+):/)) {
      currentKey = line.match(/^ {2}([a-zA-Z0-9_$]+):/)[1];
      catalog[currentSection][currentKey] = {};
    } else if (currentSection && currentKey && line.match(/^ {4}([a-zA-Z0-9_$]+):\s*(.+)$/)) {
      const [, prop, val] = line.match(/^ {4}([a-zA-Z0-9_$]+):\s*(.+)$/);
      catalog[currentSection][currentKey][prop] = val.replace(/^"|"$/g, '').trim();
    }
  }
  return catalog;
}

/**
 * Checks if a name is authorized for deletion in OpenSpec ## REMOVED Requirements
 */
function isAuthorizedRemoval(name) {
  if (!fs.existsSync(OPENSPEC_CHANGES_DIR)) return false;
  const changes = fs.readdirSync(OPENSPEC_CHANGES_DIR, { withFileTypes: true });
  for (const ch of changes) {
    if (ch.isDirectory() && ch.name !== 'archive') {
      const specsDir = path.join(OPENSPEC_CHANGES_DIR, ch.name, 'specs');
      if (fs.existsSync(specsDir)) {
        const specFiles = fs.readdirSync(specsDir).filter(f => f.endsWith('.md'));
        for (const sf of specFiles) {
          const content = fs.readFileSync(path.join(specsDir, sf), 'utf-8');
          const removedSection = content.split('## REMOVED Requirements')[1] || '';
          if (removedSection.includes(name)) return true;
        }
      }
    }
  }
  return false;
}

/**
 * Command: index
 */
function cmdIndex() {
  const current = buildCatalog();
  const existing = readCatalog();
  if (existing) {
    // Preserve previously indexed items unless removed
    Object.assign(existing.functions, current.functions);
    Object.assign(existing.data_structures, current.data_structures);
    Object.assign(existing.ui_components, current.ui_components);
    existing.updated_at = new Date().toISOString();
    existing.version = (existing.version || 1);
    fs.writeFileSync(CATALOG_PATH, serializeToYaml(existing), 'utf-8');
  } else {
    fs.writeFileSync(CATALOG_PATH, serializeToYaml(current), 'utf-8');
  }
  console.log(`✓ Catálogo indexado correctamente en: ${path.relative(ROOT_DIR, CATALOG_PATH)}`);
}

/**
 * Command: verify
 */
export function verifyCatalogIntegrity() {
  const saved = readCatalog();
  if (!saved) {
    console.log('ℹ No se encontró catálogo previo. Ejecutando indexación inicial...');
    cmdIndex();
    return { ok: true, errors: [] };
  }

  const current = buildCatalog();
  const errors = [];

  // Check functions
  for (const [fnName, meta] of Object.entries(saved.functions)) {
    if (!current.functions[fnName]) {
      if (!isAuthorizedRemoval(fnName)) {
        errors.push(`[ACCIÓN DESTRUCTIVA DETECTADA] La función '${fnName}' (${meta.file}) ha sido eliminada por error y no figura en ## REMOVED Requirements.`);
      }
    } else if (meta.has_ui === 'true' || meta.has_ui === true) {
      if (!fs.existsSync(path.join(ROOT_DIR, meta.file))) {
        errors.push(`[REGRESIÓN UI/UX] El componente visual o ruta de '${fnName}' (${meta.file}) no es accesible.`);
      }
    }
  }

  // Check data structures
  for (const [dataName, meta] of Object.entries(saved.data_structures)) {
    if (!current.data_structures[dataName]) {
      if (!isAuthorizedRemoval(dataName)) {
        errors.push(`[ESTRUCTURA DE DATOS PERDIDA] El tipo/interfaz '${dataName}' (${meta.file}) ha sido eliminado accidentalmente.`);
      }
    }
  }

  // Check UI components
  for (const [compName, meta] of Object.entries(saved.ui_components)) {
    if (!current.ui_components[compName]) {
      if (!isAuthorizedRemoval(compName)) {
        errors.push(`[COMPONENTE UI PERDIDO] El componente '${compName}' (${meta.file}) ha sido eliminado sin autorización.`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

// CLI entry point
const mode = process.argv[2] || 'index';
if (mode === 'index') {
  cmdIndex();
} else if (mode === 'verify') {
  const result = verifyCatalogIntegrity();
  if (result.ok) {
    console.log('✓ Integridad de catálogo verificada: 0 eliminaciones accidentales detectadas.');
    process.exit(0);
  } else {
    console.error('✗ ERROR CRÍTICO DE INTEGRIDAD DE CATÁLOGO:');
    result.errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }
}
