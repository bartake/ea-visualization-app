import { metadata, lookup } from '../store.js';
import { byId, icon } from '../utils.js';

export function matchQuery(str, q) {
  if (!str || !q) return false;
  return str.toLowerCase().includes(q.toLowerCase());
}

export function allApps() {
  return [...(metadata.foundationServices || []), ...(metadata.applications || [])];
}

export function pillForDep(d, clickable) {
  const cls = `pill ${d.type === 'application' ? 'application' : d.type === 'capability' || d.type === 'subCapability' ? 'capability' : d.type === 'data' ? 'data' : d.type === 'technology' ? 'technology' : 'infrastructure'}`;
  const extra = clickable && (d.type === 'data' || d.type === 'application') ? ' clickable' : '';
  const dataAttr = d.type === 'data' ? ` data-data-id="${d.item.id}"` : d.type === 'application' ? ` data-application-id="${d.item.id}"` : '';
  return `<span class="${cls}${extra}"${dataAttr} title="${d.label}">${d.type === 'capability' || d.type === 'subCapability' ? icon(lookup.capability[d.item.id]?.icon || d.parent?.icon) : d.type === 'data' ? icon(d.item.icon) : d.type === 'application' ? icon(d.item.icon) : d.type === 'technology' ? icon(d.item.icon) : icon(d.item.icon)} ${d.label}</span>`;
}

export function performSearch(q) {
  const query = (q || '').trim();
  if (!query || query.length < 2) return [];
  const results = [];
  metadata.businessCapabilities?.forEach(c => {
    if (matchQuery(c.name, query) || matchQuery(c.description, query)) {
      results.push({ type: 'capability', item: c, label: c.name });
    }
    (c.subCapabilities || []).forEach(s => {
      if (matchQuery(s.name, query)) results.push({ type: 'subCapability', item: s, parent: c, label: `${c.name} › ${s.name}` });
    });
  });
  allApps().forEach(a => {
    if (matchQuery(a.name, query) || matchQuery(a.description, query)) {
      results.push({ type: 'application', item: a, label: a.name });
    }
  });
  metadata.technologies?.forEach(t => {
    if (matchQuery(t.name, query) || matchQuery(t.description, query)) {
      results.push({ type: 'technology', item: t, label: t.name });
    }
  });
  metadata.dataArchitecture?.forEach(d => {
    if (matchQuery(d.name, query) || matchQuery(d.description, query)) {
      results.push({ type: 'data', item: d, label: d.name });
    }
  });
  return results;
}

export function getTopDown(r) {
  const deps = [];
  if (r.type === 'capability' || r.type === 'subCapability') {
    const capId = r.type === 'capability' ? r.item.id : r.parent.id;
    allApps().filter(a => a.capabilityIds?.includes(capId)).forEach(a => {
      deps.push({ type: 'application', item: a, label: a.name });
      (a.dataIds || []).forEach(id => { const d = lookup.data[id]; if (d && !deps.some(x => x.type === 'data' && x.item.id === d.id)) deps.push({ type: 'data', item: d, label: d.name }); });
      (a.technologyIds || []).forEach(id => { const t = lookup.technology[id]; if (t) { deps.push({ type: 'technology', item: t, label: t.name }); (t.infrastructureIds || []).forEach(iid => { const i = lookup.infrastructure[iid]; if (i && !deps.some(x => x.type === 'infrastructure' && x.item.id === i.id)) deps.push({ type: 'infrastructure', item: i, label: i.name }); }); } });
    });
  } else if (r.type === 'application') {
    (r.item.dataIds || []).forEach(id => { const d = lookup.data[id]; if (d) deps.push({ type: 'data', item: d, label: d.name }); });
    (r.item.technologyIds || []).forEach(id => { const t = lookup.technology[id]; if (t) { deps.push({ type: 'technology', item: t, label: t.name }); (t.infrastructureIds || []).forEach(iid => { const i = lookup.infrastructure[iid]; if (i) deps.push({ type: 'infrastructure', item: i, label: i.name }); }); } });
  } else if (r.type === 'technology') {
    (r.item.infrastructureIds || []).forEach(id => { const i = lookup.infrastructure[id]; if (i) deps.push({ type: 'infrastructure', item: i, label: i.name }); });
  }
  return deps;
}

export function getTopUp(r) {
  const deps = [];
  if (r.type === 'application') {
    (r.item.capabilityIds || []).forEach(id => { const c = lookup.capability[id]; if (c) deps.push({ type: 'capability', item: c, label: c.name }); });
  } else if (r.type === 'technology') {
    allApps().filter(a => (a.technologyIds || []).includes(r.item.id)).forEach(a => deps.push({ type: 'application', item: a, label: a.name }));
  } else if (r.type === 'infrastructure') {
    Object.values(lookup.technology).filter(t => (t.infrastructureIds || []).includes(r.item.id)).forEach(t => deps.push({ type: 'technology', item: t, label: t.name }));
  } else if (r.type === 'data') {
    allApps().filter(a => (a.dataIds || []).includes(r.item.id)).forEach(a => deps.push({ type: 'application', item: a, label: a.name }));
  } else if (r.type === 'subCapability') {
    deps.push({ type: 'capability', item: r.parent, label: r.parent.name });
  }
  return deps;
}

const DEP_TYPE_ORDER = ['capability', 'application', 'data', 'technology', 'infrastructure'];
const DEP_TYPE_LABELS = { capability: 'Capabilities', application: 'Applications', data: 'Data', technology: 'Technology', infrastructure: 'Infrastructure' };

export function renderGroupedDeps(deps) {
  const byType = {};
  deps.forEach(d => { if (!byType[d.type]) byType[d.type] = []; byType[d.type].push(d); });
  return DEP_TYPE_ORDER.filter(t => byType[t]?.length).map(t => {
    const deduped = [...new Map(byType[t].map(d => [d.item.id, d])).values()];
    return `<div class="dep-group"><div class="section-label dep-type-label">${DEP_TYPE_LABELS[t]}</div><div class="pill-row">${deduped.map(d => pillForDep(d, true)).join('')}</div></div>`;
  }).join('');
}

export function renderSearchResults(results, query) {
  const container = byId('search-results-grid');
  const q = (query || '').trim();
  byId('search-result-count').textContent = results.length ? `(${results.length} match${results.length !== 1 ? 'es' : ''})` : '';
  if (!results.length) {
    const msg = q.length < 2 ? 'Enter 2+ characters to search across capabilities, sub-capabilities, applications, technology, infrastructure, and data' : 'No matches found';
    container.innerHTML = `<div class="search-no-results"><i class="fa-solid fa-magnifying-glass" style="font-size:2rem;margin-bottom:0.5rem;opacity:0.5;"></i><p>${msg}</p></div>`;
    return;
  }
  container.innerHTML = '';
  const seen = new Set();
  results.forEach(r => {
    const key = `${r.type}:${r.type === 'capability' || r.type === 'subCapability' ? r.item.id : r.item.id}`;
    if (seen.has(key)) return;
    seen.add(key);
    const topDown = getTopDown(r);
    const topUp = getTopUp(r);
    const card = document.createElement('div');
    card.className = 'grid-card search-result-card';
    const typeLabel = r.type === 'subCapability' ? 'Sub-capability' : r.type.charAt(0).toUpperCase() + r.type.slice(1);
    const iconCls = r.type === 'capability' || r.type === 'subCapability' ? 'capability' : r.type === 'application' ? 'application' : r.type === 'data' ? 'data' : r.type === 'technology' ? 'technology' : 'infrastructure';
    const itemIcon = r.type === 'capability' || r.type === 'subCapability' ? (r.parent?.icon || r.item.icon) : r.item.icon;
    card.innerHTML = `
      <div class="card-header">
        <div class="icon-wrap ${iconCls}">${icon(itemIcon, 'fa-circle')}</div>
        <div>
          <h3>${r.label}</h3>
          <span class="type-badge" style="font-size:0.7rem;background:rgba(0,0,0,0.3);padding:0.15rem 0.4rem;border-radius:4px;">${typeLabel}</span>
        </div>
      </div>
      ${topDown.length ? `
      <div class="dep-section">
        <div class="section-label"><i class="fa-solid fa-arrow-down"></i> Top-down (uses)</div>
        ${renderGroupedDeps(topDown)}
      </div>
      ` : ''}
      ${topUp.length ? `
      <div class="dep-section">
        <div class="section-label"><i class="fa-solid fa-arrow-up"></i> Top-up (used by)</div>
        ${renderGroupedDeps(topUp)}
      </div>
      ` : ''}
      ${!topDown.length && !topUp.length ? '<div class="dep-section"><div class="section-label">No dependencies</div></div>' : ''}
    `;
    container.appendChild(card);
  });
}

export function initSearch() {
  const input = byId('search-input');
  const clearBtn = byId('search-clear');
  let debounce = null;
  function runSearch() {
    const q = input.value.trim();
    clearBtn.style.display = q ? 'block' : 'none';
    const results = performSearch(q);
    renderSearchResults(results, q);
    if (q.length >= 2) {
      document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      byId('tab-search').classList.add('active');
      byId('view-search').classList.add('active');
    }
  }
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(runSearch, 200);
  });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { clearTimeout(debounce); runSearch(); } });
  clearBtn.addEventListener('click', () => { input.value = ''; runSearch(); clearBtn.style.display = 'none'; document.querySelector('.tab[data-view="capability"]').click(); });
  document.querySelector('.tab[data-view="search"]').addEventListener('click', () => runSearch());
}
