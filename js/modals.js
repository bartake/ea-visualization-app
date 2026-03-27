import { byId, icon } from './utils.js';
import { lookup } from './store.js';

function closeOnOverlay(e) { if (e.target === byId('data-modal')) closeDataModal(); }
function closeOnEscape(e) { if (e.key === 'Escape') closeDataModal(); }
function closeAppModalOverlay(e) { if (e.target === byId('application-modal')) closeApplicationModal(); }
function closeAppModalEscape(e) { if (e.key === 'Escape') closeApplicationModal(); }

export function showDataModal(dataId) {
  const d = lookup.data[dataId];
  if (!d) return;
  byId('modal-icon').innerHTML = icon(d.icon, 'fa-database');
  byId('modal-title').textContent = d.name;
  byId('modal-type').textContent = d.type || 'Data';
  byId('modal-desc').textContent = d.description || '';
  const props = d.properties || [];
  byId('modal-props-body').innerHTML = props.map(p =>
    `<tr><td class="prop-name">${p.name}</td><td class="prop-type">${p.type}</td><td>${p.description || '—'}</td></tr>`
  ).join('') || '<tr><td colspan="3" style="color:var(--text-muted);">No properties defined</td></tr>';
  byId('data-modal').classList.add('visible');
  byId('data-modal').addEventListener('click', closeOnOverlay);
  document.addEventListener('keydown', closeOnEscape);
}

export function closeDataModal() {
  byId('data-modal').classList.remove('visible');
  byId('data-modal').removeEventListener('click', closeOnOverlay);
  document.removeEventListener('keydown', closeOnEscape);
}

export function showApplicationModal(appId) {
  const a = lookup.application[appId];
  if (!a) return;
  const isFoundation = !(a.capabilityIds?.length);
  byId('app-modal-icon').className = 'icon-wrap ' + (isFoundation ? 'infrastructure' : 'application');
  byId('app-modal-icon').innerHTML = icon(a.icon, 'fa-cube');
  byId('app-modal-title').textContent = a.name;
  byId('app-modal-subtitle').textContent = isFoundation ? 'Foundation Service' : 'Application';
  byId('app-modal-desc').textContent = a.description || '';
  const capIds = a.capabilityIds || [];
  const capPills = capIds.map(id => lookup.capability[id]).filter(Boolean)
    .map(c => `<span class="pill capability">${icon(c.icon)} ${c.name}</span>`).join('');
  byId('app-modal-capabilities').innerHTML = capPills || '<span class="pill" style="opacity:0.6;">—</span>';
  byId('app-modal-capabilities-wrap').style.display = capIds.length ? 'block' : 'none';
  const dataIds = a.dataIds || [];
  const dataPills = dataIds.map(id => lookup.data[id]).filter(Boolean)
    .map(d => `<span class="pill data">${icon(d.icon)} ${d.name}</span>`).join('');
  byId('app-modal-data').innerHTML = dataPills || '<span class="pill" style="opacity:0.6;">—</span>';
  const techIds = a.technologyIds || [];
  const techRows = techIds.map(id => lookup.technology[id]).filter(Boolean)
    .map(t => {
      const infraNames = (t.infrastructureIds || []).map(iid => lookup.infrastructure[iid]?.name || iid).join(', ');
      return `<tr><td class="prop-name">${icon(t.icon)} ${t.name}</td><td class="prop-type">${t.type || '—'}</td><td>${infraNames || '—'}</td></tr>`;
    }).join('');
  byId('app-modal-tech-body').innerHTML = techRows || '<tr><td colspan="3" style="color:var(--text-muted);">No technologies defined</td></tr>';
  byId('application-modal').classList.add('visible');
  byId('application-modal').addEventListener('click', closeAppModalOverlay);
  document.addEventListener('keydown', closeAppModalEscape);
}

export function closeApplicationModal() {
  byId('application-modal').classList.remove('visible');
  byId('application-modal').removeEventListener('click', closeAppModalOverlay);
  document.removeEventListener('keydown', closeAppModalEscape);
}

export function initModalCloseButtons() {
  byId('data-modal').querySelector('.modal-close')?.addEventListener('click', closeDataModal);
  byId('application-modal').querySelector('.modal-close')?.addEventListener('click', closeApplicationModal);
}
