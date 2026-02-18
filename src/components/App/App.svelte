<script lang="ts">
  import Scrollyteller from '@abcnews/svelte-scrollyteller';
  import type { PanelDefinition, PanelData } from '../../index';
  import { untrack } from 'svelte';
  import DatawrapperIframe from '../DatawrapperIframe/DatawrapperIframe.svelte';

  let { panels, mobileVariant = 'rows' }: { panels: PanelDefinition<PanelData>[]; mobileVariant: 'blocks' | 'rows' } =
    $props();
  let data = $state(untrack(() => panels[0]?.data as PanelData));
  let innerHeight = $state(window.innerHeight);

  const preloadUrls = $derived([
    ...new Set(panels.map(p => p.data.datawrapperUrl as string).filter(Boolean))
  ] as string[]);
</script>

<svelte:window bind:innerHeight />

<Scrollyteller
  {panels}
  onMarker={newData => {
    data = newData;
  }}
  layout={{
    align: 'left',
    mobileVariant: innerHeight < 667 ? 'blocks' : mobileVariant
    // resizeInteractive: true
    // transparentFloat: true
  }}
>
  <div class="app">
    {#each preloadUrls as url (url)}
      <DatawrapperIframe src={url} visible={url == data.datawrapperUrl} />
    {/each}
  </div>
</Scrollyteller>

<style lang="scss">
  .app {
    width: 100%;
    height: 100%;
    overflow: hidden auto;
    display: flex;
    justify-content: center;
  }
</style>
