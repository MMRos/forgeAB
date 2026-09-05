import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  adaptHarness,
  detectActiveIde,
  detectActiveModel,
  generateRootDirectives,
  getModelGuidelines,
  writeRootDirectives,
} from '@/shared/utils/harness/index.js';

describe('Harness Detector & Root Directives Engine (H002)', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'forgeab-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('detectActiveIde', () => {
    it('WHEN ANTIGRAVITY_WORKSPACE is set THEN returns ide antigravity', () => {
      const res = detectActiveIde({ ANTIGRAVITY_WORKSPACE: 'true' }, tempDir);
      expect(res.ide).toBe('antigravity');
      expect(res.reasons[0]).toContain('ANTIGRAVITY');
    });

    it('WHEN CURSOR_VERSION is set THEN returns ide cursor', () => {
      const res = detectActiveIde({ CURSOR_VERSION: '0.42.0' }, tempDir);
      expect(res.ide).toBe('cursor');
    });

    it('WHEN WINDSURF_VERSION is set THEN returns ide windsurf', () => {
      const res = detectActiveIde({ WINDSURF_VERSION: '1.0.0' }, tempDir);
      expect(res.ide).toBe('windsurf');
    });

    it('WHEN CLAUDE_PROJECT_DIR is set THEN returns ide claude-code', () => {
      const res = detectActiveIde({ CLAUDE_PROJECT_DIR: '/project' }, tempDir);
      expect(res.ide).toBe('claude-code');
    });

    it('WHEN OPENCODE_VERSION is set THEN returns ide opencode', () => {
      const res = detectActiveIde({ OPENCODE_VERSION: '2.1' }, tempDir);
      expect(res.ide).toBe('opencode');
    });

    it('WHEN VSCODE_PID is set THEN returns ide vscode', () => {
      const res = detectActiveIde({ VSCODE_PID: '1234' }, tempDir);
      expect(res.ide).toBe('vscode');
    });

    it('WHEN disk contains .antigravity folder THEN detects antigravity', () => {
      fs.mkdirSync(path.join(tempDir, '.antigravity'));
      const res = detectActiveIde({}, tempDir);
      expect(res.ide).toBe('antigravity');
    });

    it('WHEN disk contains .cursor or .cursorrules THEN detects cursor', () => {
      fs.writeFileSync(path.join(tempDir, '.cursorrules'), 'test');
      const res = detectActiveIde({}, tempDir);
      expect(res.ide).toBe('cursor');
    });

    it('WHEN disk contains .windsurf or .windsurfrules THEN detects windsurf', () => {
      fs.writeFileSync(path.join(tempDir, '.windsurfrules'), 'test');
      const res = detectActiveIde({}, tempDir);
      expect(res.ide).toBe('windsurf');
    });

    it('WHEN disk contains .opencode THEN detects opencode', () => {
      fs.mkdirSync(path.join(tempDir, '.opencode'));
      const res = detectActiveIde({}, tempDir);
      expect(res.ide).toBe('opencode');
    });

    it('WHEN disk contains .vscode THEN detects vscode', () => {
      fs.mkdirSync(path.join(tempDir, '.vscode'));
      const res = detectActiveIde({}, tempDir);
      expect(res.ide).toBe('vscode');
    });

    it('WHEN no environment indicators present THEN returns generic', () => {
      const res = detectActiveIde({}, tempDir);
      expect(res.ide).toBe('generic');
    });
  });

  describe('detectActiveModel and guidelines', () => {
    it('WHEN model name contains gemini THEN classifies as gemini', () => {
      const res = detectActiveModel({ MODEL: 'gemini-2.0-flash' });
      expect(res.model).toBe('gemini');
    });

    it('WHEN model name contains claude or sonnet THEN classifies as claude', () => {
      const res = detectActiveModel({ MODEL: 'claude-3-7-sonnet' });
      expect(res.model).toBe('claude');
    });

    it('WHEN model name contains gpt or o1 THEN classifies as gpt', () => {
      const res = detectActiveModel({ MODEL: 'gpt-4o-mini' });
      expect(res.model).toBe('gpt');
    });

    it('WHEN model name contains deepseek THEN classifies as deepseek', () => {
      const res = detectActiveModel({ MODEL: 'deepseek-r1' });
      expect(res.model).toBe('deepseek');
    });

    it('WHEN no env model present THEN falls back cleanly', () => {
      const res = detectActiveModel({}, 'Gemini 3.8 Flash');
      expect(res.model).toBe('gemini');
      expect(res.modelName).toBe('Gemini 3.8 Flash');
    });

    it('WHEN fallback is an unknown custom model THEN sets generic model', () => {
      const res = detectActiveModel({}, 'CustomLlama');
      expect(res.model).toBe('generic');
      expect(res.modelName).toBe('CustomLlama');
    });

    it('WHEN getting guidelines for different models THEN returns model-specific advice', () => {
      expect(getModelGuidelines('gemini')).toContain('AGENTS.md');
      expect(getModelGuidelines('claude')).toContain('CLAUDE.md');
      expect(getModelGuidelines('gpt')).toContain('150 líneas');
      expect(getModelGuidelines('deepseek')).toContain('razonamiento');
      expect(getModelGuidelines('generic')).toContain('Spec-Driven Development');
    });
  });

  describe('generateRootDirectives and writeRootDirectives', () => {
    it('WHEN directives are generated THEN all target IDE files are created with SDD rules', () => {
      const detection = {
        ide: 'antigravity' as const,
        model: 'gemini' as const,
        modelName: 'Gemini 3.8 Flash',
        detectedAt: new Date().toISOString(),
        reasons: ['test'],
      };

      const directives = generateRootDirectives(detection);
      expect(directives.some(d => d.relativePath === 'GEMINI.md')).toBe(true);
      expect(directives.some(d => d.relativePath === 'AGENTS.md')).toBe(true);
      expect(directives.some(d => d.relativePath === 'CLAUDE.md')).toBe(true);

      const writeResult = writeRootDirectives(tempDir, directives);
      expect(writeResult.filesWritten.length).toBe(directives.length);

      const geminiContent = fs.readFileSync(path.join(tempDir, 'GEMINI.md'), 'utf-8');
      expect(geminiContent).toContain('forgeAB AI Harness Directive');
      expect(geminiContent).toContain('utilities/agents/leader.md');
      expect(geminiContent).toContain('pnpm');

      // Writing again skips unchanged files
      const writeAgain = writeRootDirectives(tempDir, directives);
      expect(writeAgain.filesWritten.length).toBe(0);
      expect(writeAgain.skippedFiles.length).toBe(directives.length);
    });

    it('WHEN adaptHarness is executed THEN runs end-to-end detection and writes files', () => {
      const summary = adaptHarness(tempDir, { ANTIGRAVITY_WORKSPACE: '1', MODEL: 'gemini-flash' });
      expect(summary.ide).toBe('antigravity');
      expect(summary.model).toBe('gemini');
      expect(summary.filesWritten.length).toBeGreaterThan(0);
      expect(fs.existsSync(path.join(tempDir, 'AGENTS.md'))).toBe(true);
    });
  });
});
