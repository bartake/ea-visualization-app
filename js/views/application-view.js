import { metadata, lookup } from '../store.js';
import { byId, icon } from '../utils.js';

export function renderAppCard(a, isFoundation) {
  const techIds = a.technologyIds || [];
  const techItems = techIds.map(id => lookup.technology[id]).filter(Boolean);
  const desc = isFoundation
    ? (a.description || 'Foundation service used by applications')
    : `Capabilities: ${(a.capabilityIds || []).map(id => lookup.capability[id]?.name || id).join(', ') || '—'} · Click for details`;
  return `
    <div class="grid-card application-card clickable" data-application-id="${a.id}">
      <div class="card-header">
        <div class="icon-wrap ${isFoundation ? 'infrastructure' : 'application'}">${icon(a.icon, 'fa-cube')}</div>
        <div>
          <h3>${a.name}${isFoundation ? ' <span class="foundation-badge">Foundation</span>' : ''}</h3>
          <div class="desc">${desc}</div>
        </div>
      </div>
      <div class="section-label">Technology Stack</div>
      <div class="pill-row">
        ${techItems.length ? techItems.map(t => `
          <span class="pill technology" title="${t.name}">${icon(t.icon)} ${t.name}</span>
        `).join('') : '<span class="pill" style="opacity:0.6;">—</span>'}
      </div>
    </div>
  `;
}

export function getAppById(id) {
  return lookup.application[id] || null;
}

export function getAppDependencyLevel(app, visited) {
  const depIds = app.dependsOnIds || [];
  if (!depIds.length) return 0;
  visited = visited || new Set();
  if (visited.has(app.id)) return 0;
  visited.add(app.id);
  let max = 0;
  depIds.forEach(id => {
    const dep = getAppById(id);
    if (dep) max = Math.max(max, 1 + getAppDependencyLevel(dep, visited));
  });
  visited.delete(app.id);
  return max;
}

export function renderApplicationView() {
  const container = byId('application-grid');
  container.innerHTML = '';

  const foundations = metadata.foundationServices || [];
  const apps = metadata.applications || [];
  if (foundations.length) {
    const section = document.createElement('div');
    section.innerHTML = `<div class="section-label" style="margin-bottom:1rem;"><i class="fa-solid fa-layer-group"></i> Foundation Services (used by application layer)</div>`;
    container.appendChild(section);
    foundations.forEach(a => {
      const card = document.createElement('div');
      card.innerHTML = renderAppCard(a, true);
      container.appendChild(card.firstElementChild);
    });
  }
  if (apps.length) {
    const section = document.createElement('div');
    section.innerHTML = `<div class="section-label" style="margin:1.5rem 0 1rem;"><i class="fa-solid fa-sitemap"></i> Application Dependency Hierarchy</div>
    <p class="section-desc" style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem;">Applications ordered by dependency depth. Indented items depend on those above.</p>`;
    container.appendChild(section);
    const sortedApps = [...apps].sort((a, b) => getAppDependencyLevel(a) - getAppDependencyLevel(b));
    sortedApps.forEach(a => {
      const level = getAppDependencyLevel(a);
      const depIds = a.dependsOnIds || [];
      const depApps = depIds.map(id => getAppById(id)).filter(Boolean);
      const card = document.createElement('div');
      card.className = 'grid-card application-card clickable app-hierarchy-node';
      card.style.marginLeft = (level * 1.5) + 'rem';
      card.dataset.applicationId = a.id;
      card.innerHTML = `
        <div class="card-header">
          <div class="icon-wrap application">${icon(a.icon, 'fa-cube')}</div>
          <div>
            <h3>${a.name}</h3>
            <div class="desc">Capabilities: ${(a.capabilityIds || []).map(id => lookup.capability[id]?.name || id).join(', ') || '—'}</div>
          </div>
          ${level > 0 ? `<span class="dep-level-badge" title="Dependency level">L${level}</span>` : ''}
        </div>
        ${depApps.length ? `
        <div class="app-depends-on" style="margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid var(--border);">
          <div class="section-label"><i class="fa-solid fa-arrow-down"></i> Depends on</div>
          <div class="pill-row">
            ${depApps.map(d => `
              <span class="pill application clickable" data-application-id="${d.id}" title="${d.name}">${icon(d.icon)} ${d.name}</span>
            `).join('')}
          </div>
        </div>
        ` : ''}
        <div class="section-label" style="margin-top:0.75rem;">Technology Stack</div>
        <div class="pill-row">
          ${(a.technologyIds || []).map(id => lookup.technology[id]).filter(Boolean).map(t => `
            <span class="pill technology" title="${t.name}">${icon(t.icon)} ${t.name}</span>
          `).join('') || '<span class="pill" style="opacity:0.6;">—</span>'}
        </div>
      `;
      container.appendChild(card);
    });
  }
}
