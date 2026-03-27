import { byId } from './utils.js';
import { metadata, setMetadata } from './store.js';
import { renderCapabilityView } from './views/capability-view.js';
import { renderApplicationView } from './views/application-view.js';
import { renderTechnologyView } from './views/technology-view.js';
import { initSearch } from './views/search-view.js';
import { initTabs } from './tabs.js';
import { initDataClicks, initApplicationClicks } from './events.js';
import { closeDataModal, closeApplicationModal, initModalCloseButtons } from './modals.js';

window.closeDataModal = closeDataModal;
window.closeApplicationModal = closeApplicationModal;

async function loadMetadata() {
  try {
    const res = await fetch('data/metadata.json');
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    setMetadata(data);
    byId('loading').style.display = 'none';
    byId('content').style.display = 'block';
    const metaTitle = metadata.meta?.title || 'E-Commerce SaaS';
    const lastUpdated = metadata.meta?.lastUpdated;
    const fmtDate = lastUpdated
      ? ((d) => {
          const [y, m, day] = d.split('-');
          const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(m, 10) - 1];
          return `${mo} ${parseInt(day, 10)}, ${y}`;
        })(lastUpdated)
      : '';
    byId('meta-title').textContent = fmtDate ? `${metaTitle} · Last updated ${fmtDate}` : metaTitle;
    renderCapabilityView();
    renderApplicationView();
    renderTechnologyView();
    initTabs();
    initSearch();
    initModalCloseButtons();
    initDataClicks();
    initApplicationClicks();
  } catch (e) {
    byId('loading').style.display = 'none';
    byId('error').style.display = 'block';
    byId('error').innerHTML = `<strong>Failed to load metadata:</strong> ${e.message}. Run a local server (e.g. <code>npx serve .</code>) to avoid CORS.`;
  }
}

loadMetadata();
