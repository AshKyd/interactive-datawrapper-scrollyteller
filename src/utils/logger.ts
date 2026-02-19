import { getTier } from '@abcnews/env-utils';

/**
 * A simple logger that only logs debug information when the environment tier is 'preview'.
 * This helps keep the production and live-preview environments clean while providing
 * useful information to authors during the preview stage.
 */
export const logger = {
  /**
   * Logs a debug message with optional arguments.
   * @param message The message to log.
   * @param args Optional arguments to include in the log.
   */
  debug: (message: string, ...args: any[]) => {
    if (getTier() === 'preview') {
      console.debug(message, ...args);
    }
  }
};
