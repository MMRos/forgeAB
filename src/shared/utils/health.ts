/**
 * System Health Interface
 */
export interface SystemHealth {
  status: 'healthy' | 'degraded';
  timestamp: string;
  uptimeSeconds: number;
}

/**
 * Evaluates system operational status and returns standardized metrics.
 * 
 * @param {number} [uptime=0] - Current system uptime in seconds
 * @returns {SystemHealth} Health summary containing status, ISO timestamp, and uptime
 * @throws {RangeError} If uptime is negative
 */
export function checkSystemHealth(uptime: number = 0): SystemHealth {
  if (uptime < 0) {
    throw new RangeError('Uptime cannot be negative');
  }

  const isDegraded = uptime > 86400 * 30; // Degraded warning if > 30 days without restart

  return {
    status: isDegraded ? 'degraded' : 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: uptime,
  };
}
