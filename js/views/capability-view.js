import { metadata, lookup } from '../store.js';
import { byId, icon } from '../utils.js';

export function renderCapabilityView() {
  const cap = metadata.businessCapabilities;
  const apps = metadata.applications;
  const container = byId('capability-grid');
  container.innerHTML = '';

  cap.forEach(c => {
    const appList = apps.filter(a => a.capabilityIds?.includes(c.id));
    const dataIds = new Set();
    appList.forEach(a => (a.dataIds || []).forEach(d => dataIds.add(d)));
    const dataItems = [...dataIds].map(id => lookup.data[id]).filter(Boolean);

    const card = document.createElement('div');
    card.className = 'grid-card';
    const subCaps = c.subCapabilities || [];
    card.innerHTML = `
      <div class="card-header">
        <div class="icon-wrap capability">${icon(c.icon, 'fa-lightbulb')}</div>
        <div>
          <h3>${c.name}</h3>
          <div class="desc">${c.description || ''}</div>
        </div>
      </div>
      ${subCaps.length ? `
      <div class="section-label">Sub-capabilities</div>
      <div class="pill-row pill-row-sub" style="margin-bottom:1rem;">
        ${subCaps.map(s => `<span class="pill capability pill-sub" title="${s.name}">${s.name}</span>`).join('')}
      </div>
      ` : ''}
      <div class="section-label">Applications</div>
      <div class="pill-row" style="margin-bottom:1rem;">
        ${appList.length ? appList.map(a => `
          <span class="pill application" title="${a.name}">${icon(a.icon)} ${a.name}</span>
        `).join('') : '<span class="pill" style="opacity:0.6;">—</span>'}
      </div>
      <div class="section-label">Data Architecture</div>
      <div class="pill-row">
        ${dataItems.length ? dataItems.map(d => `
          <span class="pill data clickable" data-data-id="${d.id}" title="Click for details">${icon(d.icon)} ${d.name}</span>
        `).join('') : '<span class="pill" style="opacity:0.6;">—</span>'}
      </div>
    `;
    container.appendChild(card);
  });
}
