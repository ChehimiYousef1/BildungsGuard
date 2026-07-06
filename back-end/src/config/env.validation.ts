/** Minimal required-env check at boot. Extend as needed. */
export function validateEnv(config: Record<string, any>): Record<string, any> {
  const required = ['DATABASE_URL'];
  const missing = required.filter((k) => !config[k]);
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.warn(`[config] Missing env vars: ${missing.join(', ')} — using defaults where possible.`);
  }
  return config;
}
