import { describe, expect, it } from 'vitest';
import { checkSystemHealth } from '@/shared/utils/health.js';

describe('System Health Utility', () => {
  it('WHEN uptime is 0 THEN returns healthy status', () => {
    const health = checkSystemHealth(0);
    expect(health.status).toBe('healthy');
    expect(health.uptimeSeconds).toBe(0);
    expect(health.timestamp).toBeDefined();
  });

  it('WHEN uptime exceeds 30 days THEN returns degraded status', () => {
    const health = checkSystemHealth(86400 * 31);
    expect(health.status).toBe('degraded');
  });

  it('WHEN uptime is negative THEN throws RangeError', () => {
    expect(() => checkSystemHealth(-1)).toThrow(RangeError);
  });
});
