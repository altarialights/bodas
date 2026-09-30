import { repository } from '../data/repository';
import { toCSV } from '../domain/logic';
import { escapeHTML as e, downloadFile, statusText } from '../lib/dom';
import type { Wedding, WeddingBundle, ManagementData, Section } from '../domain/types';
const root = document.querySelector<HTMLElement>('[data-management]');
if (root) void init(root);
async function init(root: HTMLElement) {
  const selector = document.querySelector<HTMLSelectElement>('#manage-wedding')!;
  let bundle: WeddingBundle;
  let data: ManagementData;
  let tab = 'guests';
  let search = '';
  let filter = 'all';
  let requestId = 0;
  let weddings: Wedding[] = [];
  try { weddings = await repository.listWeddings(); selector.innerHTML = weddings.map(w => `<option value="${e(w.slug)}">${e(w.names.join(' & '))}</option>`).join(''); selector.disabled = false; }
  catch { root.innerHTML = '<p role="alert">No se ha podido cargar el panel.</p><button class="button outline" data-retry>Cargar de nuevo</button>'; root.querySelector('[data-retry]')?.addEventListener('click', () => { void init(root); }); return; }
  async function load(slug: string) {
    const current = ++requestId;
    root.innerHTML = '<p class="loading-state" role="status">Cargando los datos de esta boda…</p>';
    try {
      const next = await repository.getWedding(slug); if (!next) throw new Error('Boda no encontrada.');
      const nextData = await repository.getManagement(next.wedding.id);
      if (current !== requestId) return;
      bundle = next; data = nextData; search = ''; filter = 'all'; render();
    } catch (error) { if (current !== requestId) return; root.innerHTML = `<div class="empty-state"><h2>Ha faltado un pequeño paso.</h2><p role="alert">${e(error instanceof Error ? error.message : 'Error al cargar.')}</p><button class="button outline" data-retry style="margin-top:20px">Reintentar carga</button></div>`; root.querySelector('[data-retry]')?.addEventListener('click', () => { void load(slug); }); }
  }
  selector.addEventListener('change', () => { void load(selector.value); });
  const responseFor = (id: string) => data.responses.find(r => r.guestId === id);
  const statusFor = (id: string) => responseFor(id)?.attendance ?? 'pending';
  const filtered = () => data.guests.filter(g => (!g.optional || statusFor(g.id) === 'yes') && (!search || g.name.toLocaleLowerCase('es').includes(search.toLocaleLowerCase('es'))) && (filter === 'all' || statusFor(g.id) === filter));
  const counts = () => { const actual = data.guests.filter(g => !g.optional || statusFor(g.id) === 'yes'); return { all: actual.length, yes: actual.filter(g => statusFor(g.id) === 'yes').length, pending: actual.filter(g => statusFor(g.id) === 'pending').length, no: actual.filter(g => statusFor(g.id) === 'no').length }; };
  function render() {
    root.innerHTML = `<div class="dashboard-tabs" role="tablist" aria-label="Organización">${[['guests', 'Invitados y respuestas'], ['content', 'Contenido y vista previa']].map(([id, label]) => `<button role="tab" id="tab-${id}" aria-selected="${tab === id}" aria-controls="management-panel" tabindex="${tab === id ? '0' : '-1'}" data-tab="${id}">${label}</button>`).join('')}</div><section id="management-panel" role="tabpanel" aria-labelledby="tab-${tab}" tabindex="0">${tab === 'guests' ? guestPanelHTML() : editorHTML()}</section>`;
    const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-tab]'));
    tabs.forEach((button, i) => {
      const activate = () => { tab = button.dataset.tab!; render(); root.querySelector<HTMLButtonElement>(`[data-tab="${tab}"]`)?.focus(); };
      button.addEventListener('click', activate);
      button.addEventListener('keydown', event => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const index = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; tabs[index]?.click(); } });
    });
    if (tab === 'guests') bindGuests(); else bindEditor();
  }
  function guestPanelHTML() {
    const c = counts();
    return `<div class="dashboard-summary">${[[c.all, 'Invitados incluidos'], [c.yes, 'Confirmados'], [c.pending, 'Pendientes'], [c.no, 'No asistirán']].map(([value, label]) => `<div class="dashboard-stat"><strong>${value}</strong><span>${label}</span></div>`).join('')}</div><div class="table-toolbar"><label for="guest-search">Buscar invitado<input id="guest-search" type="search" value="${e(search)}" placeholder="Nombre del invitado" autocomplete="off"></label><label for="guest-filter">Estado<select id="guest-filter"><option value="all">Todos</option><option value="yes">Confirmados</option><option value="pending">Pendientes</option><option value="no">No asistirán</option></select></label><button class="button outline" data-export>Exportar CSV</button></div><div data-table-region>${tableHTML()}</div><details class="simulation-tools"><summary>Estados de demostración</summary><button class="text-button" data-empty>Mostrar lista vacía</button><button class="text-button" data-error>Simular error de carga</button><button class="text-button" data-reset>Restablecer vista</button></details>`;
  }
  function tableHTML() {
    const list = filtered();
    if (!list.length) return '<div class="empty-state"><h3>No hay invitados en esta vista.</h3><p>Prueba otro nombre o restablece los filtros.</p><button class="text-button" data-clear>Limpiar filtros</button></div>';
    return `<div class="table-scroll"><table class="guest-table"><caption class="sr-only">Invitados ficticios de ${e(bundle.wedding.names.join(' y '))}</caption><thead><tr><th scope="col">Invitado</th><th scope="col">Respuesta</th><th scope="col">Menú</th><th scope="col">Transporte</th><th scope="col"><span class="sr-only">Detalle</span></th></tr></thead><tbody>${list.map(g => { const r = responseFor(g.id); return `<tr><td><strong>${e(g.name)}</strong><small>${g.child ? 'Menú infantil disponible' : g.optional ? 'Acompañante autorizado' : 'Invitado incluido'}</small></td><td data-label="Respuesta"><span class="status-label ${statusFor(g.id)}">${statusText(statusFor(g.id))}</span></td><td data-label="Menú">${e(r?.attendance === 'yes' ? bundle.wedding.menuOptions.find(m => m.id === r.menuId)?.label ?? 'Por elegir' : '—')}</td><td data-label="Transporte">${r?.attendance === 'yes' ? r.outboundId || r.returnId ? 'Autobús' : 'Por su cuenta' : '—'}</td><td><button class="text-button" data-guest-detail="${g.id}" aria-label="Ver respuesta de ${e(g.name)}">Ver detalle</button></td></tr>`; }).join('')}</tbody></table></div><p class="table-count" role="status">${list.length} de ${counts().all} invitados · Datos ficticios</p>`;
  }
  function updateTable() { const region = root.querySelector<HTMLElement>('[data-table-region]')!; region.innerHTML = tableHTML(); bindTable(); }
  function bindTable() {
    root.querySelector('[data-clear]')?.addEventListener('click', () => { search = ''; filter = 'all'; render(); });
    root.querySelectorAll<HTMLButtonElement>('[data-guest-detail]').forEach(button => button.addEventListener('click', () => {
      const guest = data.guests.find(g => g.id === button.dataset.guestDetail)!; const r = responseFor(guest.id);
      const dialog = document.createElement('dialog'); dialog.className = 'management-dialog';
      const values = [ ['Respuesta', statusText(statusFor(guest.id))], ['Menú', r?.attendance === 'yes' ? bundle.wedding.menuOptions.find(m => m.id === r.menuId)?.label ?? 'Por elegir' : 'No corresponde'], ['Alergias', r?.attendance === 'yes' ? r.allergies || 'No indicadas' : 'No corresponde'], ['Llegada', r?.arrival || 'No indicada'], ['Ida', bundle.transport.find(t => t.id === r?.outboundId)?.label ?? 'Sin autobús'], ['Vuelta', bundle.transport.find(t => t.id === r?.returnId)?.label ?? 'Sin autobús'], ['Accesibilidad', r?.accessibility || 'No indicada'], ['Comentario', r?.comment || 'Sin comentario'] ];
      dialog.innerHTML = `<div class="dialog-head"><h2 id="guest-dialog-title">${e(guest.name)}</h2><button class="text-button" data-close>Cerrar</button></div><p class="demo-note">Respuesta ficticia · ${e(bundle.wedding.names.join(' y '))}</p><dl>${values.map(([label, value]) => `<dt>${label}</dt><dd>${e(value)}</dd>`).join('')}</dl>`;
      dialog.setAttribute('aria-labelledby', 'guest-dialog-title'); document.body.append(dialog); dialog.showModal();
      dialog.querySelector('[data-close]')?.addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
      dialog.addEventListener('close', () => { dialog.remove(); button.focus(); }, { once: true });
    }));
  }
  function bindGuests() {
    const searchInput = root.querySelector<HTMLInputElement>('#guest-search')!;
    const select = root.querySelector<HTMLSelectElement>('#guest-filter')!; select.value = filter;
    searchInput.addEventListener('input', () => { search = searchInput.value; updateTable(); });
    select.addEventListener('change', () => { filter = select.value; updateTable(); });
    root.querySelector('[data-export]')?.addEventListener('click', () => {
      const rows: unknown[][] = [['Boda', 'Invitado', 'Estado', 'Menú', 'Ida', 'Vuelta']];
      for (const guest of filtered()) { const r = responseFor(guest.id); const attends = r?.attendance === 'yes'; rows.push([bundle.wedding.names.join(' y '), guest.name, statusText(statusFor(guest.id)), attends ? bundle.wedding.menuOptions.find(m => m.id === r?.menuId)?.label ?? '' : '', attends ? bundle.transport.find(t => t.id === r?.outboundId)?.label ?? 'Por su cuenta' : '', attends ? bundle.transport.find(t => t.id === r?.returnId)?.label ?? 'Por su cuenta' : '']); }
      downloadFile(toCSV(rows), `${bundle.wedding.slug}-invitados-demo.csv`, 'text/csv;charset=utf-8');
    });
    root.querySelector('[data-empty]')?.addEventListener('click', () => { search = 'sin-resultados-demo'; searchInput.value = search; updateTable(); });
    root.querySelector('[data-reset]')?.addEventListener('click', () => { search = ''; filter = 'all'; render(); });
    root.querySelector('[data-error]')?.addEventListener('click', () => { repository.failNext(); void load(bundle.wedding.slug); });
    bindTable();
  }
  function editorHTML() {
    const w = bundle.wedding;
    const sections: [Section, string][] = [['story', 'Nuestra historia'], ['program', 'Programa'], ['guide', 'Guía práctica'], ['participation', 'Canciones y cartas'], ['gifts', 'Regalos'], ['faq', 'Preguntas frecuentes']];
    return `<div class="editor-layout"><div><h2>Las palabras de vuestra historia.</h2><form data-content-editor class="stack-form"><div class="field-grid"><label class="field">Primer nombre<input name="firstName" required maxlength="40" value="${e(w.names[0])}"></label><label class="field">Segundo nombre<input name="secondName" required maxlength="40" value="${e(w.names[1])}"></label><label class="field full"><span id="dedication-label">Dedicatoria</span><textarea aria-labelledby="dedication-label" name="dedication" required maxlength="240" rows="3">${e(w.dedication)}</textarea></label><label class="field full"><span id="welcome-label">Mensaje de bienvenida</span><textarea aria-labelledby="welcome-label" name="welcome" required maxlength="600" rows="4">${e(w.welcome)}</textarea></label></div><fieldset class="section-toggles"><legend>Secciones de la invitación</legend>${sections.map(([key, title]) => `<label class="toggle-row"><input type="checkbox" name="section-${key}" ${w.sections[key] ? 'checked' : ''}>${title}</label>`).join('')}</fieldset><button type="submit" class="button primary">Aplicar a la vista previa</button><p class="form-status" role="status"></p></form><a class="preview-full-link" href="/boda/${w.slug}" target="_blank" rel="noopener">Abrir la demo original en otra pestaña ↗</a></div><div class="editor-preview"><h2>Así se verá.</h2><p>Vista móvil con los cambios de esta sesión. No se ha guardado nada en un servidor.</p><iframe data-preview-frame title="Vista previa de la invitación de ${e(w.names.join(' y '))}" src="/boda/${e(w.slug)}?preview=1"></iframe></div></div>`;
  }
  function sendPreview() { root.querySelector<HTMLIFrameElement>('[data-preview-frame]')?.contentWindow?.postMessage({ type: 'altaria:preview', wedding: bundle.wedding }, location.origin); }
  function bindEditor() {
    const form = root.querySelector<HTMLFormElement>('[data-content-editor]')!;
    root.querySelector<HTMLIFrameElement>('[data-preview-frame]')?.addEventListener('load', sendPreview);
    form.addEventListener('submit', async event => {
      event.preventDefault(); if (!form.reportValidity()) return;
      const values = new FormData(form); const first = String(values.get('firstName')).trim(); const second = String(values.get('secondName')).trim();
      const status = form.querySelector<HTMLElement>('.form-status')!; const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
      if (!first || !second || !String(values.get('dedication')).trim() || !String(values.get('welcome')).trim()) { status.textContent = 'Completa los nombres y los textos con al menos una palabra.'; return; }
      const updated = structuredClone(bundle.wedding); updated.names = [first, second]; updated.dedication = String(values.get('dedication')).trim(); updated.welcome = String(values.get('welcome')).trim();
      for (const key of Object.keys(updated.sections) as Section[]) updated.sections[key] = values.has(`section-${key}`);
      button.disabled = true; status.textContent = 'Aplicando los cambios…';
      try { await repository.updateWedding(updated); bundle.wedding = updated; const option = selector.selectedOptions[0]; if (option) option.textContent = first + ' & ' + second; sendPreview(); status.textContent = 'Vista previa actualizada. Cambios solo en memoria; se restablecen al recargar.'; }
      catch { status.textContent = 'No se ha podido actualizar. Tus cambios siguen en el formulario; vuelve a intentarlo.'; }
      finally { button.disabled = false; }
    });
  }
  const onMessage = (event: MessageEvent<{ type: string; weddingId: string }>) => { const frame = root.querySelector<HTMLIFrameElement>('[data-preview-frame]'); if (event.origin === location.origin && event.source === frame?.contentWindow && event.data?.type === 'altaria:preview-ready' && event.data.weddingId === bundle?.wedding.id) sendPreview(); };
  window.addEventListener('message', onMessage);
  window.addEventListener('pagehide', () => window.removeEventListener('message', onMessage), { once: true });
  if (weddings[0]) await load(weddings[0].slug);
}
