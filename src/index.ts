import { whenOdysseyLoaded } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import type { Mount } from '@abcnews/mount-utils';
import { loadScrollyteller } from '@abcnews/svelte-scrollyteller';
import App from './components/App/App.svelte';
import { mount } from 'svelte';

export type PanelData = {
  datawrapperUrl: string;
};

export type PanelDefinition<Data> = {
  data: Data;
  nodes: Element[];
  [key: string]: any;
};

whenOdysseyLoaded.then(() => {
  // Select all scrollyteller mounts
  const scrollyMounts = selectMounts('scrollytellerNAMEdatawrapper', { markAsUsed: false });

  // Loop through em
  scrollyMounts.forEach(mountEl => {
    const scrollyName = getMountValue(mountEl, 'scrollytellerNAME');
    const scrollyData = loadScrollyteller<PanelData>(scrollyName, 'u-full', 'mark');

    const cmid = window.location.pathname.match(/\/news\/....-..-..\/[^/]+\/(\d+)/)?.[1];
    const password = scrollyData.mountNode?.getAttribute('id')?.match(/PASSWORD(\d+)/)?.[1] || '0';

    // password is the CMID multiplied by two. We'll remove this check when we're sure this feature works.
    if (Math.round(Number(password) / 2) !== Number(cmid)) {
      console.log({ cmid, password });
      console.error('Wrong password, sorry this is a prerelease feature.');
      return;
    }

    // Pull Datawrapper charts out of the panels and put them in as props
    let datawrapperUrl = '';
    const modifiedPanels = scrollyData.panels.map(panel => {
      const newNodes = panel.nodes.filter(node => {
        const dwIframe = node.querySelector('iframe[src*=datawrapper]');
        if (dwIframe) {
          datawrapperUrl = dwIframe.getAttribute('src') || '';
          return false;
        }
        return true;
      });
      return {
        ...panel,
        data: { ...panel.data, datawrapperUrl },
        nodes: newNodes
      };
    });

    mount(App, {
      target: scrollyData.mountNode,
      props: {
        panels: modifiedPanels,
        mobileVariant: scrollyData.mountNode.id.includes('MOBILErows') ? 'rows' : 'blocks'
      }
    });
  });
});

if (process.env.NODE_ENV === 'development') {
  console.debug(`[interactive-datawrapper-scrollyteller] public path: ${__webpack_public_path__}`);
}
