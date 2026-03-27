export let metadata = null;
export const lookup = { capability: {}, application: {}, data: {}, technology: {}, infrastructure: {} };

export function lookupInit() {
  if (!metadata) return;
  metadata.businessCapabilities?.forEach(c => { lookup.capability[c.id] = c; });
  metadata.applications?.forEach(a => { lookup.application[a.id] = a; });
  metadata.foundationServices?.forEach(a => { lookup.application[a.id] = a; });
  metadata.dataArchitecture?.forEach(d => { lookup.data[d.id] = d; });
  metadata.technologies?.forEach(t => { lookup.technology[t.id] = t; });
  metadata.infrastructure?.forEach(i => { lookup.infrastructure[i.id] = i; });
}

export function setMetadata(data) {
  metadata = data;
  lookupInit();
}
