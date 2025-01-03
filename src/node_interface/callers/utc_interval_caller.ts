import { PeriodicalCaller } from "./periodical_caller.ts";
import { SubscriptionManager } from "../../subscription_manager.ts";
import { logger } from "../../logger.ts";

interface UTCIntervalUpdate {
  type: "1h" | "1d";
  timestamp: Date;
  force?: boolean;
}

export class UTCIntervalCaller extends PeriodicalCaller<UTCIntervalUpdate> {
  private lastHourlyUpdate: Date | null = null;
  private lastDailyUpdate: Date | null = null;
  private subscriptionManager: SubscriptionManager;
  private initialUpdateDone = false;

  constructor() {
    // Check every minute for UTC hour/day changes
    super(60 * 1000, async (result) => {
      if (result.success) {
        await this.handleUpdate(result.data);
      }
    });
    this.subscriptionManager = new class extends SubscriptionManager {
      protected onFirstSubscription() {}
      protected onLastUnsubscription() {}
    }();
  }

  public getSubscriptionManager(): SubscriptionManager {
    return this.subscriptionManager;
  }

  public override start(): void {
    super.start();
    // Trigger initial updates immediately
    if (!this.initialUpdateDone) {
      this.triggerInitialUpdates();
    }
  }

  private async triggerInitialUpdates(): Promise<void> {
    const now = new Date();
    const utcNow = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
    ));

    // Trigger both hourly and daily updates
    await logger.log("Performing initial interval updates");

    this.lastHourlyUpdate = utcNow;
    this.lastDailyUpdate = utcNow;
    this.initialUpdateDone = true;

    // Don't force updates on startup - let Redis freshness check decide
    await this.handleUpdate({ type: "1h", timestamp: utcNow, force: false });
    await this.handleUpdate({ type: "1d", timestamp: utcNow, force: false });

    await logger.log("Initial interval updates completed");
  }

  protected async makeCall(): Promise<UTCIntervalUpdate | null> {
    const now = new Date();
    const utcNow = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
    ));

    // Check if we need to do an hourly update
    if (
      !this.lastHourlyUpdate ||
      this.hasHourChanged(this.lastHourlyUpdate, utcNow)
    ) {
      this.lastHourlyUpdate = utcNow;
      // Force update when hour changes
      return { type: "1h", timestamp: utcNow, force: true };
    }

    // Check if we need to do a daily update
    if (
      !this.lastDailyUpdate || this.hasDayChanged(this.lastDailyUpdate, utcNow)
    ) {
      this.lastDailyUpdate = utcNow;
      // Force update when day changes
      return { type: "1d", timestamp: utcNow, force: true };
    }

    return null;
  }

  private async handleUpdate(
    update: UTCIntervalUpdate & { force?: boolean },
  ): Promise<void> {
    // await logger.log(
    //   `Triggering ${update.type} update at ${update.timestamp.toISOString()}${
    //     update.force ? " (forced)" : ""
    //   }`,
    // );
    this.subscriptionManager.notifySubscribers("interval-update", {
      interval: update.type,
      force: false,
    });
  }

  private hasHourChanged(lastUpdate: Date, currentTime: Date): boolean {
    return lastUpdate.getUTCHours() !== currentTime.getUTCHours() ||
      lastUpdate.getUTCDate() !== currentTime.getUTCDate() ||
      lastUpdate.getUTCMonth() !== currentTime.getUTCMonth() ||
      lastUpdate.getUTCFullYear() !== currentTime.getUTCFullYear();
  }

  private hasDayChanged(lastUpdate: Date, currentTime: Date): boolean {
    return lastUpdate.getUTCDate() !== currentTime.getUTCDate() ||
      lastUpdate.getUTCMonth() !== currentTime.getUTCMonth() ||
      lastUpdate.getUTCFullYear() !== currentTime.getUTCFullYear();
  }
}
