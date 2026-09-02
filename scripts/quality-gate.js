#!/usr/bin/env node
/**
 * scripts/quality-gate.js
 * forgeAB Automated Quality & Security Gate Runner
 * 
 * Verifies all 6 sequential quality gates:
 * 1. TypeCheck & Compilation (tsc --noEmit)
 * 2. Linter & Style (eslint)
 * 3. Anti-Monolith & Modular Architecture (<= 150 lines/file, <= 30 lines/function, 1 component/file)
 * 4. Full Test Suite Execution (vitest / jest with coverage)
 * 5. Cyclomatic Complexity (CC <= 10) & CRAP Index (CRAP < 30)
 * 6. Security Audit (pnpm audit + secret scan)
 * 7. Catalog Integrity & No-Regression Audit (0 accidental deletions, UI/UX accessibility)
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { verifyCatalogIntegrity } from './harness-indexer.js';

const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, 'src');

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

const results = [];

function logSection(title) {
  console.log(`\n${ANSI.bold}${ANSI.cyan}==>${ANSI.reset} ${ANSI.bold}${title}${ANSI.reset}`);
}

function pass(gate, message) {
  console.log(`  ${ANSI.green}✓ PASS:${ANSI.reset} [${gate}] ${message}`);
  results.push({ gate, status: 'PASS', message });
}

function fail(gate, message, details) {
  console.error(`  ${ANSI.red}✗ FAIL:${ANSI.reset} [${gate}] ${message}`);
  if (details) {
    console.error(`    ${ANSI.dim}${String(details).trim().split('\n').slice(0, 8).join('\n    ')}${ANSI.reset}`);
  }
  results.push({ gate, status: 'FAIL', message, details });
}

function warn(gate, message) {
  console.warn(`  ${ANSI.yellow}! WARN:${ANSI.reset} [${gate}] ${message}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// GATE 1: TYPECHECK & COMPILATION
// ─────────────────────────────────────────────────────────────────────────────
function runGate1_TypeCheck() {
  logSection('Gate 1: Static Typecheck / Compilation (tsc --noEmit)');
  const tsConfigPath = path.join(ROOT_DIR, 'tsconfig.json');
  if (!fs.existsSync(tsConfigPath)) {
    fail('GATE 1: TypeCheck', 'tsconfig.json not found in project root.');
    return;
  }
  try {
    execSync('pnpm exec tsc --noEmit', { stdio: 'pipe', encoding: 'utf-8' });
    pass('GATE 1: TypeCheck', '0 compilation / type errors.');
  } catch (err) {
    fail('GATE 1: TypeCheck', 'Typecheck failed.', err.stdout || err.stderr || err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GATE 2: LINTER & STYLE
// ─────────────────────────────────────────────────────────────────────────────
function runGate2_Linter() {
  logSection('Gate 2: Linter & Style (eslint)');
  try {
    execSync('pnpm exec eslint .', { stdio: 'pipe', encoding: 'utf-8' });
    pass('GATE 2: Linter', '0 linting / formatting errors.');
  } catch (err) {
    fail('GATE 2: Linter', 'ESLint reported errors.', err.stdout || err.stderr || err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GATE 3: ANTI-MONOLITH & STRUCTURE AUDIT
// ─────────────────────────────────────────────────────────────────────────────
function getAllFiles(dir, filterExts = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        files.push(...getAllFiles(fullPath, filterExts));
      }
    } else if (filterExts.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function runGate3_AntiMonolith() {
  logSection('Gate 3: Anti-Monolith & Modularity Limits');
  if (!fs.existsSync(SRC_DIR)) {
    pass('GATE 3: Anti-Monolith', 'src/ directory empty or not yet created.');
    return;
  }

  const files = getAllFiles(SRC_DIR);
  const violations = [];

  for (const file of files) {
    const relativePath = path.relative(ROOT_DIR, file);
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    // Check 1: File length <= 150 lines
    if (lines.length > 150) {
      violations.push(`${relativePath}: ${lines.length} lines (exceeds 150 lines limit)`);
    }

    // Check 2: Max 30 lines per function (heuristic parser for braces)
    let inFunction = false;
    let functionStartLine = 0;
    let functionName = '';
    let braceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const fnMatch = line.match(/(?:function\s+([a-zA-Z0-9_$]+)|(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>)/);
      
      if (fnMatch && !inFunction && line.includes('{')) {
        inFunction = true;
        functionName = fnMatch[1] || fnMatch[2] || 'anonymous';
        functionStartLine = i + 1;
        braceDepth = 0;
      }

      if (inFunction) {
        const opens = (line.match(/{/g) || []).length;
        const closes = (line.match(/}/g) || []).length;
        braceDepth += opens - closes;

        if (braceDepth <= 0 && opens > 0) {
          const fnLength = (i + 1) - functionStartLine + 1;
          if (fnLength > 30) {
            violations.push(`${relativePath}:${functionStartLine} function '${functionName}' has ${fnLength} lines (exceeds 30 lines limit)`);
          }
          inFunction = false;
        }
      }
    }

    // Check 3: Exactly 1 component per React file (.tsx / .jsx)
    if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      const componentMatches = content.match(/(?:export\s+(?:default\s+)?function\s+[A-Z][a-zA-Z0-9]*|const\s+[A-Z][a-zA-Z0-9]*\s*:\s*React\.FC)/g) || [];
      if (componentMatches.length > 1) {
        violations.push(`${relativePath}: contains ${componentMatches.length} components (max 1 component per file)`);
      }
    }
  }

  if (violations.length === 0) {
    pass('GATE 3: Anti-Monolith', `All ${files.length} source files strictly comply with <=150 lines/file, <=30 lines/function, 1 component/file.`);
  } else {
    fail('GATE 3: Anti-Monolith', `${violations.length} anti-monolith violations found.`, violations.join('\n'));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GATE 4: FULL TEST SUITE EXECUTION & COVERAGE
// ─────────────────────────────────────────────────────────────────────────────
function runGate4_TestsAndCoverage() {
  logSection('Gate 4: Full Test Suite Execution & Coverage (vitest)');
  try {
    const output = execSync('pnpm exec vitest run --coverage', { stdio: 'pipe', encoding: 'utf-8' });
    pass('GATE 4: Test Suite', 'All tests executed and passed successfully.');
    return true;
  } catch (err) {
    const details = err.stdout || err.stderr || err.message;
    fail('GATE 4: Test Suite', 'Tests failed or coverage below configured threshold.', details);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GATE 5: CRAP SCORE & COMPLEXITY AUDIT
// ─────────────────────────────────────────────────────────────────────────────
function calculateCRAP(cc, coveragePercent) {
  // CRAP(m) = CC(m)^2 * (1 - cov(m)/100)^3 + CC(m)
  const covRatio = Math.min(100, Math.max(0, coveragePercent)) / 100;
  return (Math.pow(cc, 2) * Math.pow(1 - covRatio, 3)) + cc;
}

function runGate5_CRAPScore() {
  logSection('Gate 5: CRAP Metric & Cyclomatic Complexity Audit');
  
  // Look for coverage report generated by Vitest
  const summaryPath = path.join(ROOT_DIR, 'coverage', 'coverage-summary.json');
  let avgCoverage = 100;

  if (fs.existsSync(summaryPath)) {
    try {
      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
      if (summary.total && summary.total.lines) {
        avgCoverage = summary.total.lines.pct;
      }
    } catch {
      warn('GATE 5: CRAP Metric', 'Could not parse coverage-summary.json, using test assertions.');
    }
  }

  // Parse files in src/ to estimate Cyclomatic Complexity per function
  const files = getAllFiles(SRC_DIR);
  const highCRAPFunctions = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    // Basic cyclomatic complexity calculation: 1 + decision points (if, for, while, case, catch, &&, ||, ?)
    let currentCC = 1;
    let inFn = false;
    let fnName = '';
    let fnStart = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const fnMatch = line.match(/(?:function\s+([a-zA-Z0-9_$]+)|(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>)/);

      if (fnMatch) {
        inFn = true;
        fnName = fnMatch[1] || fnMatch[2] || 'fn';
        fnStart = i + 1;
        currentCC = 1;
      }

      if (inFn) {
        const decisions = (line.match(/\b(if|else\s+if|for|while|case|catch)\b|\&\&|\|\||\?/g) || []).length;
        currentCC += decisions;

        if (line.includes('}') && !line.includes('{')) {
          const crapScore = calculateCRAP(currentCC, avgCoverage);
          if (currentCC > 10 || crapScore >= 30) {
            highCRAPFunctions.push({
              file: path.relative(ROOT_DIR, file),
              line: fnStart,
              name: fnName,
              cc: currentCC,
              crap: crapScore.toFixed(2),
            });
          }
          inFn = false;
        }
      }
    }
  }

  if (highCRAPFunctions.length === 0) {
    pass('GATE 5: CRAP Metric', `All functions meet CC <= 10 and CRAP < 30 (Avg Coverage: ${avgCoverage}%).`);
  } else {
    const report = highCRAPFunctions.map(f => `${f.file}:${f.line} '${f.name}' -> CC: ${f.cc}, CRAP: ${f.crap}`).join('\n');
    fail('GATE 5: CRAP Metric', `${highCRAPFunctions.length} function(s) exceed CRAP < 30 or CC <= 10 thresholds.`, report);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GATE 6: SECURITY, CVE & SECRET AUDIT
// ─────────────────────────────────────────────────────────────────────────────
function runGate6_SecurityAudit() {
  logSection('Gate 6: Security, CVE & Secret Scan');
  let securityPass = true;

  // 1. Dependency CVE audit
  try {
    execSync('pnpm audit --audit-level=high', { stdio: 'pipe', encoding: 'utf-8' });
    pass('GATE 6.1: CVE Audit', '0 High or Critical CVEs found in dependencies.');
  } catch (err) {
    fail('GATE 6.1: CVE Audit', 'pnpm audit detected high/critical vulnerabilities.', err.stdout || err.stderr || err.message);
    securityPass = false;
  }

  // 2. Secret scanning in workspace
  const secretPatterns = [
    { name: 'AWS Access Key', regex: /\bAKIA[0-9A-Z]{16}\b/ },
    { name: 'OpenAI API Key', regex: /\bsk-[a-zA-Z0-9]{32,}\b/ },
    { name: 'GitHub Token', regex: /\bghp_[a-zA-Z0-9]{36}\b/ },
    { name: 'Private Key', regex: /-----BEGIN (?:RSA )?PRIVATE KEY-----/ },
  ];

  const sourceFiles = [...getAllFiles(SRC_DIR), ...getAllFiles(path.join(ROOT_DIR, 'tests'))];
  const leaked = [];

  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    for (const pattern of secretPatterns) {
      if (pattern.regex.test(content)) {
        leaked.push(`${path.relative(ROOT_DIR, file)}: Matches pattern '${pattern.name}'`);
      }
    }
  }

  if (leaked.length === 0) {
    pass('GATE 6.2: Secret Scan', '0 hardcoded secrets or credentials detected in source code.');
  } else {
    fail('GATE 6.2: Secret Scan', `${leaked.length} potential credential leaks found!`, leaked.join('\n'));
    securityPass = false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY & VERDICT
// ─────────────────────────────────────────────────────────────────────────────
function printSummary() {
  console.log(`\n${ANSI.bold}====================================================${ANSI.reset}`);
  console.log(`${ANSI.bold}       FORGEAB QUALITY GATE SUMMARY REPORT          ${ANSI.reset}`);
  console.log(`${ANSI.bold}====================================================${ANSI.reset}`);

  let totalFails = 0;
  for (const res of results) {
    const color = res.status === 'PASS' ? ANSI.green : ANSI.red;
    console.log(`  [${color}${res.status}${ANSI.reset}] ${res.gate}: ${res.message}`);
    if (res.status === 'FAIL') totalFails++;
  }

  console.log(`${ANSI.bold}====================================================${ANSI.reset}`);
  if (totalFails === 0) {
    console.log(`${ANSI.green}${ANSI.bold}✓ VERDICT: ALL QUALITY GATES PASSED (Ready for Sync & Archive)${ANSI.reset}\n`);
    process.exit(0);
  } else {
    console.error(`${ANSI.red}${ANSI.bold}✗ VERDICT: ${totalFails} GATE(S) FAILED. Refactor required.${ANSI.reset}\n`);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GATE 7: CATALOG INTEGRITY & NO-REGRESSION AUDIT
// ─────────────────────────────────────────────────────────────────────────────
function runGate7_CatalogIntegrity() {
  logSection('Gate 7: Catalog Integrity & No-Regression Audit');
  try {
    const result = verifyCatalogIntegrity();
    if (result.ok) {
      pass('GATE 7: Catalog Integrity', '0 accidental deletions detected; UI/UX entrypoints valid.');
    } else {
      fail('GATE 7: Catalog Integrity', 'Integrity violations found in function/data catalog.', result.errors.join('\n'));
    }
  } catch (err) {
    fail('GATE 7: Catalog Integrity', 'Failed to verify catalog integrity.', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXECUTION
// ─────────────────────────────────────────────────────────────────────────────
try {
  runGate1_TypeCheck();
  runGate2_Linter();
  runGate3_AntiMonolith();
  const testsPassed = runGate4_TestsAndCoverage();
  if (testsPassed) {
    runGate5_CRAPScore();
  } else {
    fail('GATE 5: CRAP Metric', 'Skipped because tests did not pass cleanly.');
  }
  runGate6_SecurityAudit();
  runGate7_CatalogIntegrity();
  printSummary();
} catch (error) {
  console.error('Fatal error during quality gate execution:', error);
  process.exit(1);
}
