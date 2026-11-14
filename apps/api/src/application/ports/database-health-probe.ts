/**
 * Driven port. Implementations resolve to `false` when the database cannot be reached
 * (they are expected to log the cause) instead of rejecting.
 */
export interface DatabaseHealthProbe {
  isReachable(): Promise<boolean>;
}
