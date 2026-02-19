import { logger } from '../../utils/logger';

type Resolve = () => void;

interface QueuedTask {
  id: string;
  resolve: Resolve;
  promise: Promise<void>;
  isCurrent: boolean;
}

export class LoadQueueManager {
  private queue: QueuedTask[] = [];
  private activeTask: QueuedTask | null = null;

  /**
   * Request a turn to load an iframe.
   * Returns a promise that resolves when it's your turn.
   */
  requestLoad(id: string, isCurrent: boolean): Promise<void> {
    // If it's already the active task, it's already allowed to load.
    if (this.activeTask?.id === id) {
      logger.debug(`[LoadQueue] Already active: ${id}`);
      return this.activeTask.promise;
    }

    // Check if it's already in the queue.
    const existingIndex = this.queue.findIndex(t => t.id === id);
    if (existingIndex !== -1) {
      const task = this.queue[existingIndex];
      if (isCurrent && !task.isCurrent) {
        logger.debug(`[LoadQueue] Promoting to front: ${id}`);
        this.queue.splice(existingIndex, 1);
        task.isCurrent = true;
        this.queue.unshift(task);
      }
      return task.promise;
    }

    // Create a new task.
    let resolveFn: Resolve;
    const promise = new Promise<void>(resolve => {
      resolveFn = resolve;
    });

    const task: QueuedTask = { id, resolve: resolveFn!, promise, isCurrent };

    if (isCurrent) {
      this.queue.unshift(task);
    } else {
      this.queue.push(task);
    }

    logger.debug(`[LoadQueue] Queued: ${id} (isCurrent: ${isCurrent}). Queue length: ${this.queue.length}`);
    this.processNext();
    return promise;
  }

  /**
   * Notify the queue that the load is complete (or failed).
   */
  notifyDone(id: string) {
    if (this.activeTask?.id === id) {
      logger.debug(`[LoadQueue] Completed/Handled: ${id}`);
      this.activeTask = null;
      this.processNext();
    }
  }

  /**
   * Cancel a pending load request (e.g. if the element scrolled out of view before it started).
   */
  cancelRequest(id: string) {
    this.cancelFromQueue(id);

    // If it was the active task, clear it so the next one can start.
    if (this.activeTask?.id === id) {
      logger.debug(`[LoadQueue] Cancelled (Active): ${id}`);
      this.activeTask = null;
      this.processNext();
    }
  }

  private cancelFromQueue(id: string) {
    const index = this.queue.findIndex(t => t.id === id);
    if (index !== -1) {
      logger.debug(`[LoadQueue] Cancelled (Queued): ${id}`);
      this.queue.splice(index, 1);
    }
  }

  private processNext() {
    if (this.activeTask || this.queue.length === 0) {
      return;
    }

    this.activeTask = this.queue.shift()!;
    logger.debug(`[LoadQueue] Popped: ${this.activeTask.id}. Remaining queue: ${this.queue.length}`);
    this.activeTask.resolve();
  }
}

export const queueManager = new LoadQueueManager();
