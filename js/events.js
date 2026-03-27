import { showDataModal, showApplicationModal } from './modals.js';

export function initDataClicks() {
  document.addEventListener('click', (e) => {
    const pill = e.target.closest('.pill.data.clickable');
    if (pill?.dataset?.dataId) showDataModal(pill.dataset.dataId);
  });
}

export function initApplicationClicks() {
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.application-card');
    const pill = e.target.closest('.pill.application[data-application-id]');
    const target = card || pill;
    if (target?.dataset?.applicationId) showApplicationModal(target.dataset.applicationId);
  });
}
