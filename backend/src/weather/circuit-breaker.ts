import { Logger } from '@nestjs/common';

const FAILURE_THRESHOLD = 3;
const TIMEOUT_MS = 2500;
const COOLDOWN_MS = 30000;

enum BreakerState {
  CLOSED,
  OPEN,
}

/**
 * Minimal circuit breaker: trips after 3 consecutive failures or a call
 * exceeding TIMEOUT_MS, then short-circuits straight to the fallback for
 * COOLDOWN_MS before allowing a fresh attempt against the primary.
 */
export class CircuitBreaker {
  private readonly logger = new Logger(CircuitBreaker.name);
  private state: BreakerState = BreakerState.CLOSED;
  private consecutiveFailures = 0;
  private openedAt = 0;

  async execute<T>(
    primary: () => Promise<T>,
    fallback: () => Promise<T>,
  ): Promise<T> {
    if (this.state === BreakerState.OPEN) {
      if (Date.now() - this.openedAt < COOLDOWN_MS) {
        return fallback();
      }
      this.logger.log('Cooldown elapsed, attempting to close breaker');
    }

    try {
      const result = await this.withTimeout(primary());
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure(err);
      return fallback();
    }
  }

  private withTimeout<T>(promise: Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('Circuit breaker timeout')),
        TIMEOUT_MS,
      );
      promise
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  private onSuccess(): void {
    this.consecutiveFailures = 0;
    this.state = BreakerState.CLOSED;
  }

  private onFailure(err: unknown): void {
    this.consecutiveFailures += 1;
    this.logger.warn(
      `Primary provider call failed (${this.consecutiveFailures}/${FAILURE_THRESHOLD})`,
      err as Error,
    );
    if (this.consecutiveFailures >= FAILURE_THRESHOLD) {
      this.state = BreakerState.OPEN;
      this.openedAt = Date.now();
      this.logger.warn('Circuit breaker tripped, falling back for 30s');
    }
  }
}
