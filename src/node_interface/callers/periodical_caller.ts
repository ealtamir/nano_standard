import { logger } from "../../logger.ts";

type CallResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: Error;
};

type CallbackFunction<T> = (result: CallResult<T>) => void | Promise<void>;

export abstract class PeriodicalCaller<T> {
  private timerId?: number;
  private isRunning: boolean = false;
  private intervalMs: number;
  private callback: CallbackFunction<T>;

  constructor(intervalMs: number, callback: CallbackFunction<T>) {
    this.intervalMs = intervalMs;
    this.callback = callback;
    logger.log(`${this.constructor.name} initialized with ${intervalMs}ms interval`, "INFO");
  }

  /**
   * Abstract method that implementations must define to make the actual API call
   * @returns Promise of type T representing the API call result
   */
  protected abstract makeCall(): Promise<T>;

  /**
   * Starts the periodic calls
   */
  public start(): void {
    if (this.isRunning) {
      logger.log(`${this.constructor.name}: Start requested but already running`, "INFO");
      return;
    }

    logger.log(`${this.constructor.name}: Starting periodic calls`, "INFO");
    this.isRunning = true;
    this.executeCall();
    this.timerId = setInterval(() => this.executeCall(), this.intervalMs);
  }

  /**
   * Stops the periodic calls
   */
  public stop(): void {
    if (!this.isRunning) {
      logger.log(`${this.constructor.name}: Stop requested but already stopped`, "INFO");
      return;
    }

    logger.log(`${this.constructor.name}: Stopping periodic calls`, "INFO");
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }
    this.isRunning = false;
  }

  /**
   * Executes a single call and handles the result
   */
  private async executeCall(): Promise<void> {
    logger.log(`${this.constructor.name}: Executing call`, "INFO");
    try {
      const data = await this.makeCall();
      logger.log(`${this.constructor.name}: Call successful`, "INFO");
      await this.callback({ success: true, data });
    } catch (error) {
      logger.log(`${this.constructor.name}: Call failed`, "ERROR");
      await this.callback({
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      });
    }
  }

  /**
   * Updates the interval for future calls
   */
  public updateInterval(newIntervalMs: number): void {
    logger.log(`${this.constructor.name}: Updating interval from ${this.intervalMs}ms to ${newIntervalMs}ms`, "INFO");
    this.intervalMs = newIntervalMs;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  public isActive(): boolean {
    return this.isRunning;
  }
}
