<script lang="ts">
  interface Props {
    /** The URL of the iframe contents. */
    src: string;
    /** Whether the iframe matches the current view (for accessibility) */
    current?: boolean;
    /** Title for the iframe */
    title?: string;
    /** Additional CSS classes for the iframe */
    className?: string;
  }

  import { queueManager } from './utils';
  import { untrack } from 'svelte';
  import { logger } from '../../utils/logger';

  let { src, current = true, title = '', className = '' }: Props = $props();

  let container: HTMLDivElement | undefined = $state();
  let iframeEl: HTMLIFrameElement | undefined = $state();
  let height = $state('400'); // Default height
  let hasEnteredViewport = $state(false);
  let canLoad = $state(false);
  let isPending = $state(false);

  /**
   * We use an effect to handle the viewport detection.
   */
  $effect(() => {
    if (!container) return;

    // Reset state when src changes
    canLoad = false;
    hasEnteredViewport = false;

    const observer = new IntersectionObserver(
      entries => {
        const isIntersecting = entries[0].isIntersecting;
        if (isIntersecting !== hasEnteredViewport) {
          if (isIntersecting) {
            if (!canLoad && !isPending) {
              isPending = true;
              logger.debug(`[LazyIframe] Queuing frame: ${src}`);
              queueManager
                .requestLoad(
                  src,
                  untrack(() => current)
                )
                .then(() => {
                  if (untrack(() => hasEnteredViewport)) {
                    isPending = false;
                    canLoad = true;
                    logger.debug(`[LazyIframe] Loading frame: ${src}`);
                  } else {
                    logger.debug(`[LazyIframe] Scrolled out while waiting for queue: ${src}`);
                    isPending = false;
                    queueManager.notifyDone(src);
                  }
                });
            }
          } else {
            logger.debug(`[LazyIframe] Unloading frame: ${src}`);
            if (!canLoad) {
              queueManager.cancelRequest(src);
            } else {
              queueManager.notifyDone(src);
            }
            canLoad = false;
            isPending = false;
          }
        }
        hasEnteredViewport = isIntersecting;
      },
      {
        rootMargin: '100% 0px' // Load/unload when within 1 screen height
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      if (!canLoad) {
        queueManager.cancelRequest(src);
      } else {
        queueManager.notifyDone(src);
      }
    };
  });

  /**
   * Boost priority if this frame becomes 'current' while waiting in queue.
   */
  $effect(() => {
    if (hasEnteredViewport && !canLoad && !isPending && current) {
      isPending = true;
      queueManager.requestLoad(src, true).then(() => {
        if (untrack(() => hasEnteredViewport)) {
          isPending = false;
          canLoad = true;
        } else {
          isPending = false;
          queueManager.notifyDone(src);
        }
      });
    }
  });

  const handleLoad = () => {
    queueManager.notifyDone(src);
  };

  /**
   * Handle messages from Datawrapper for auto-resizing.
   */
  const handleMessage = (event: MessageEvent) => {
    if (typeof event.data['datawrapper-height'] !== 'undefined') {
      // Check if the message came from our iframe (if it exists)
      if (iframeEl && iframeEl.contentWindow === event.source) {
        for (const chartId in event.data['datawrapper-height']) {
          height = event.data['datawrapper-height'][chartId] + 20;
        }
      }
    }
  };
</script>

<svelte:window onmessage={handleMessage} />

<div bind:this={container} class="lazy-iframe-container {className}" style:height="{height}px">
  {#if hasEnteredViewport && canLoad}
    <iframe
      bind:this={iframeEl}
      {src}
      {title}
      style:height="{height}px"
      aria-hidden={!current}
      onload={handleLoad}
      onerror={handleLoad}
    ></iframe>
  {/if}
</div>

<style lang="scss">
  iframe {
    width: 100%;
    border: none;
    display: block;
  }
</style>
