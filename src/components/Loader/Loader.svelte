<script lang="ts">
  /**
   * @file
   * A Svelte clone of the DLS loading spinner with News colours inserted.
   */
  interface Props {
    /** Size of the spinner in pixels. @default 32 */
    size?: 16 | 32 | 48;
    /** Colour variant of the spinner. @default "brand" */
    variant?: 'brand' | 'dark' | 'white';
    /** Accessible label for the loading state. @default "Loading" */
    label?: string;
    /** Whether to hide the label from sighted users. @default true */
    hideLabel?: boolean;
    /** Additional CSS classes for the wrapper. */
    class?: string;
    /** aria-live for the loading label and screen readers. @default "assertive" */
    'aria-live'?: 'off' | 'assertive' | 'polite';
    /** role for the loading label and screen readers. @default "alert" */
    role?: string;
    /** Any other attributes to apply to the wrapper. */
    [key: string]: any;
  }

  let {
    size = 32,
    variant = 'brand',
    label = 'Loading',
    hideLabel = true,
    class: className = '',
    'aria-live': ariaLive = 'assertive',
    role = 'alert',
    ...rest
  }: Props = $props();
</script>

<span data-component="Loading" data-print="inline-media" class="loading {className}" {...rest}>
  <span
    class="spinner"
    class:spinner-size-16={size === 16}
    class:spinner-size-32={size === 32}
    class:spinner-size-48={size === 48}
    class:spinner-colour-brand={variant === 'brand'}
    class:spinner-colour-dark={variant === 'dark'}
    class:spinner-colour-white={variant === 'white'}
  ></span>

  {#if !hideLabel}
    <span class="label" aria-live={ariaLive} {role}>
      {label}
    </span>
  {:else}
    <span class="sr-only" aria-live={ariaLive} {role}>
      {label}
    </span>
  {/if}
</span>

<style>
  .loading {
    display: flex;
    color: var(--text-primary, initial);
    flex-shrink: 1;
    align-items: center;
    font-family: 'ABCSans', sans-serif;

    --colour-accent-active: hsl(191 100% 50% / 70%);
    --colour-accent-faded: hsl(191 100% 50% / 25%);
    --colour-accent: hsl(191 100% 50%);
    --colour-assistant: hsl(214 100% 40%);
    --colour-assistant-dark: hsl(214 100% 65%);
    --colour-primary: hsl(191 100% 50%);
    --connect-social-fill: hsl(191 100% 50%);
    --footer-link-hover-text: var(--colour-accent);
    --masthead-fill: hsl(0 0% 0%);
    --masthead-brand-border-bottom-colour: var(--white-20-opacity);
    --masthead-parent-border-bottom-colour: var(--white-20-opacity);
    --masthead-text: hsl(0 0% 100%);
    --page-section-padding-top: 0;
    --product-template-padding-top: 0;
    --site-nav-item-active-border-colour: var(--colour-accent);
    --site-nav-item-active-text: var(--colour-accent);
    --site-nav-item-hover-border-colour: var(--colour-accent);
    --site-nav-item-hover-text: var(--colour-accent);
    --site-nav-item-text: hsl(0 0% 100%);
    --site-navigation-fill: var(--black-20-opacity);
    --brand-lockup-logo-colour: hsl(0 0% 100%);
    --brand-lockup-footer-height: 2rem;
    --text-assistant: hsl(0 0% 100%);
    --login-button-hover-text: hsl(0 0% 0%);
    --login-dropdown-fill: hsl(210 9% 13%);
    --login-dropdown-button-text: hsl(0 0% 100%);
    --login-skeleton-fill: hsl(0 0% 100% / 20%);
    --login-skeleton-shimmer-fill: linear-gradient(
      90deg,
      hsl(0 0% 100% / 0%) 0.5%,
      hsl(0 0% 100% / 5%) 50%,
      hsl(0 0% 100% / 0%) 99.5%
    );
    --schedule-item-live-label-fill: hsl(42 100% 50%);
    --schedule-item-live-label-text: hsl(0 0% 0%);
    --hero-image-with-cta-button-hover-text: hsl(0 0% 0%);

    /* Search filters */
    --toggle-button-filled-fill: hsl(191 100% 50% / 20%);
    --toggle-button-filled-selected-text: var(--colour-charcoal);
  }

  .spinner {
    display: inline-block;
    border: 2px solid;
    border-radius: 50%;
    flex: none;
    animation: load 1s infinite linear;
  }

  .spinner-colour-white {
    border-color: hsl(0 0% 100% / 25%);
    border-left-color: white;
  }

  .spinner-colour-dark {
    border-color: hsl(205 12% 19% / 30%);
    border-left-color: hsl(205 12% 19% / 60%);
  }

  .spinner-colour-brand {
    border-color: var(--loading-secondary-fill, var(--colour-accent-faded));
    border-left-color: var(--loading-fill, var(--colour-accent));
  }

  .spinner-size-16 {
    width: 1rem;
    height: 1rem;
  }

  .spinner-size-32 {
    width: 2rem;
    height: 2rem;
  }

  .spinner-size-48 {
    width: 3rem;
    height: 3rem;
  }

  @keyframes load {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .label {
    display: inline-block;
    margin-left: 0.66rem;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }
</style>
