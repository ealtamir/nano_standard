import { ensureDirSync } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";

export class Logger {
  private readonly logDir: string = "logs";
  private readonly maxFiles: number = 5;
  private readonly maxSize: number = 1024 * 1024; // 1MB
  private currentLogFile: string;

  constructor() {
    ensureDirSync(this.logDir);
    this.currentLogFile = this.getLatestLogFile();
  }

  private getLatestLogFile(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return join(this.logDir, `log-${timestamp}.txt`);
  }

  private async rotateLogsIfNeeded() {
    try {
      const fileInfo = await Deno.stat(this.currentLogFile);
      
      if (fileInfo.size >= this.maxSize) {
        const files = Array.from(Deno.readDirSync(this.logDir))
          .filter(entry => entry.isFile)
          .map(entry => entry.name)
          .sort();

        if (files.length >= this.maxFiles) {
          // Remove oldest file
          await Deno.remove(join(this.logDir, files[0]));
        }

        this.currentLogFile = this.getLatestLogFile();
      }
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        console.error("Error rotating logs:", error);
      }
    }
  }

  async log(message: string, level: "INFO" | "WARN" | "ERROR" = "INFO") {
    await this.rotateLogsIfNeeded();

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;

    console.log(logEntry.trim());
    try {
      await Deno.writeTextFile(
        this.currentLogFile,
        logEntry,
        { append: true }
      );
    } catch (error) {
      console.error("Error writing to log file:", error);
    }
  }
}

export const logger = new Logger();
