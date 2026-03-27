export function byId(id) {
  return document.getElementById(id);
}

export function icon(iconName, fallback = 'fa-circle') {
  if (!iconName) return `<i class="fa-solid ${fallback}"></i>`;
  if (iconName.startsWith('fa-brands')) return `<i class="${iconName}"></i>`;
  return `<i class="fa-solid ${iconName}"></i>`;
}
