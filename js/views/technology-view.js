import { metadata, lookup } from '../store.js';
import { byId, icon } from '../utils.js';

export function renderTechnologyView() {
  const techs = metadata.technologies || [];
  const container = byId('technology-grid');
  container.innerHTML = '';

  techs.forEach(t => {
    const infraIds = t.infrastructureIds || [];
    const infraItems = infraIds.map(id => lookup.infrastructure[id]).filter(Boolean);

    const card = document.createElement('div');
    card.className = 'grid-card';
    card.innerHTML = `
      <div class="card-header">
        <div class="icon-wrap technology">${icon(t.icon, 'fa-microchip')}</div>
        <div>
          <h3>${t.name}</h3>
        </div>
      </div>
      <div class="section-label">Infrastructure</div>
      <div class="pill-row">
        ${infraItems.length ? infraItems.map(i => `
          <span class="pill infrastructure" title="${i.description || ''}">${icon(i.icon)} ${i.name}</span>
        `).join('') : '<span class="pill" style="opacity:0.6;">—</span>'}
      </div>
    `;
    container.appendChild(card);
  });
}
