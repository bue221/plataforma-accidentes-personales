import { describe, expect, it } from 'vitest';
import { ConfigError, loadConfig } from '../../../../src/infrastructure/config/config.js';

describe('loadConfig', () => {
  it('applies safe defaults when only the required variables are present', () => {
    const config = loadConfig({ DB_PASSWORD: 'fictitious-password' });

    expect(config.server).toEqual({ host: '127.0.0.1', port: 3000 });
    expect(config.database).toMatchObject({ name: 'accidentes', user: 'accidentes_app' });
    expect(config.testDatabaseName).toBe('accidentes_test');
  });

  it('fails fast naming the missing variable', () => {
    expect(() => loadConfig({})).toThrowError(ConfigError);
    expect(() => loadConfig({})).toThrowError(/DB_PASSWORD/);
  });

  it('never echoes the invalid values back in the error message', () => {
    const leakedValue = 'super-secret-port-value';
    try {
      loadConfig({ DB_PASSWORD: 'fictitious-password', PORT: leakedValue });
      expect.unreachable('loadConfig should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigError);
      expect((error as ConfigError).message).toContain('PORT');
      expect((error as ConfigError).message).not.toContain(leakedValue);
    }
  });
});
