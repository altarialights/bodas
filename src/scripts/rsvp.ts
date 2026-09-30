import { repository } from '../data/repository';
import { cleanResponse, validateResponses } from '../domain/logic';
import { escapeHTML as e, statusText } from '../lib/dom';
import type { InvitationContext, IndividualResponse, WeddingBundle, Guest } from '../domain/types';

const root = document.querySelector<HTMLElement>('[data-rsvp]');
if (root?.dataset.slug) void init(root, root.dataset.slug);
async function init(root: HTMLElement, slug: string) {
  let bundle: WeddingBundle;
  let context: InvitationContext;
  let rows: IndividualResponse[] = [];
  let step = 1;
  let errors: Record<string, string> = {};
  let saving = false;
  let failSubmit = false;
  try {
    const found = await repository.getWedding(slug);
    if (!found) throw new Error('No se ha encontrado esta boda.');
    bundle = found;
    const token = new URLSearchParams(location.search).get('invitacion') ?? bundle.wedding.demoInvitationToken;
    const invitation = await repository.resolveInvitation(token, bundle.wedding.id);
    if (!invitation) { root.innerHTML = `<div class="empty-state"><h2>No encontramos tu invitación.</h2><p>El identificador no corresponde a esta boda. Revisa el enlace de tu tarjeta.</p><a class="text-link" href="/boda/${e(slug)}/confirmar">Abrir la invitación de ejemplo →</a></div>`; return; }
    context = invitation;
    const previous = await repository.getResponses(bundle.wedding.id, context.invitation.id);
    rows = context.guests.map(g => previous.find(r => r.guestId === g.id) ?? { id: `${g.id}-response`, companyId: g.companyId, weddingId: g.weddingId, invitationId: context.invitation.id, guestId: g.id, attendance: g.optional ? 'no' : 'pending' });
  } catch (error) { root.innerHTML = `<div role="alert" class="error-summary">${e(error instanceof Error ? error.message : 'No se ha podido cargar.')}</div><button class="button outline" data-retry>Cargar de nuevo</button>`; root.querySelector('[data-retry]')?.addEventListener('click', () => { void init(root, slug); }); return; }
  const w = bundle.wedding;
  const rowFor = (guest: Guest) => rows.find(r => r.guestId === guest.id)!;
  const errorFor = (id: string) => errors[id] ? `<span id="error-${e(id)}" class="field-error">${e(errors[id])}</span>` : '';
  const attrs = (id: string) => errors[id] ? `aria-invalid="true" aria-describedby="error-${e(id)}"` : '';
  function field(guest: Guest, key: keyof IndividualResponse, title: string, type = 'text', full = false) {
    const id = `${guest.id}-${key}`;
    const value = rowFor(guest)[key] ?? '';
    return `<label class="field ${full ? 'full' : ''}" for="${e(id)}">${title}<${type === 'textarea' ? 'textarea' : 'input'} id="${e(id)}" name="${e(key)}" data-guest="${guest.id}" ${attrs(id)} ${type === 'textarea' ? `rows="3" maxlength="600">${e(value)}</textarea>` : `type="${type}" value="${e(value)}" ${type === 'text' ? 'maxlength="600"' : ''}>`}${errorFor(id)}</label>`;
  }
  function select(guest: Guest, key: keyof IndividualResponse, title: string, options: { id: string; label: string }[], empty: string) {
    const id = `${guest.id}-${key}`;
    return `<label class="field" for="${id}">${title}<select id="${id}" name="${key}" data-guest="${guest.id}" ${attrs(id)}><option value="">${empty}</option>${options.map(option => `<option value="${e(option.id)}" ${rowFor(guest)[key] === option.id ? 'selected' : ''}>${e(option.label)}</option>`).join('')}</select>${errorFor(id)}</label>`;
  }
  function render(focus = false) {
    root.innerHTML = `<ol class="stepper" aria-label="Progreso de confirmación">${['Asistencia', 'Tus detalles', 'Revisión'].map((text, index) => `<li class="${step === index + 1 ? 'active' : ''}" ${step === index + 1 ? 'aria-current="step"' : ''}><span>0${index + 1}</span>${text}</li>`).join('')}</ol><form novalidate class="rsvp-form"><div class="form-stage"><h2 tabindex="-1" data-step-heading>${step === 1 ? '¿Nos acompañas?' : step === 2 ? 'A tu medida.' : 'Todo listo para el gran día.'}</h2><p>${step === 1 ? e(context.invitation.greeting) : step === 2 ? 'Los pequeños detalles para que todos estemos a gusto.' : 'Revisa las respuestas de tu invitación antes de confirmar.'}</p><div class="error-summary" role="alert" tabindex="-1">${errors.scope ? e(errors.scope) : Object.keys(errors).length ? 'Revisa los campos indicados antes de continuar.' : ''}</div>${step === 1 ? attendanceHTML() : step === 2 ? detailsHTML() : reviewHTML()}</div><div class="form-actions">${step > 1 ? '<button type="button" class="text-button" data-back>Volver</button>' : ''}<button type="submit" class="button primary">${step === 3 ? 'Confirmar respuesta demo' : 'Continuar'} <span aria-hidden="true">→</span></button></div>${step === 3 ? '<details class="simulation-tools"><summary>Probar un error de la demo</summary><label class="toggle-row"><input type="checkbox" data-fail-submit> Simular fallo al confirmar (solo el próximo intento)</label></details>' : ''}</form>`;
    root.querySelector('form')?.addEventListener('submit', submit);
    root.querySelector('[data-back]')?.addEventListener('click', () => { step = step === 3 && !rows.some(r => r.attendance === 'yes') ? 1 : step - 1; errors = {}; render(true); });
    root.querySelector<HTMLInputElement>('[data-fail-submit]')?.addEventListener('change', event => { failSubmit = (event.target as HTMLInputElement).checked; });
    root.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[data-guest]').forEach(input => {
      input.addEventListener('input', () => {
        const row = rows.find(r => r.guestId === input.dataset.guest);
        if (!row || (input instanceof HTMLInputElement && input.type === 'radio' && !input.checked)) return;
        if (input.name.startsWith('attendance-')) row.attendance = input.value === 'yes' ? 'yes' : 'no';
        else if (['menuId', 'allergies', 'arrival', 'outboundId', 'returnId', 'accessibility', 'comment'].includes(input.name)) (row as unknown as Record<string, unknown>)[input.name] = input.value;
      });
    });
    if (focus) {
      root.querySelector<HTMLElement>('[data-step-heading]')?.focus({ preventScroll: false });
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) root.querySelector('.form-stage')?.animate([{ opacity: .6, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 280, easing: 'ease-out' });
    }
  }
  function attendanceHTML() {
    return context.guests.map(guest => {
      const row = rowFor(guest); const key = `${guest.id}-attendance`;
      return `<fieldset class="guest-attendance" ${attrs(key)}><legend>${e(guest.name)}${guest.child ? '<small>Invitado infantil</small>' : guest.optional ? '<small>Acompañante autorizado · opcional</small>' : ''}</legend><div class="radio-options">${[['yes', 'Sí, allí estaré'], ['no', 'No podré asistir']].map(([value, label]) => `<label class="radio-choice"><input type="radio" name="attendance-${guest.id}" data-guest="${guest.id}" value="${value}" ${row.attendance === value ? 'checked' : ''}>${label}</label>`).join('')}</div>${errorFor(key)}</fieldset>`;
    }).join('') + `<p class="form-note" style="margin-top:22px">${context.invitation.allowCompanion ? 'Esta invitación permite el acompañante que aparece arriba.' : 'Esta invitación incluye únicamente a las personas indicadas.'}</p>`;
  }
  function detailsHTML() {
    return context.guests.filter(g => rowFor(g).attendance === 'yes').map(g => `<fieldset class="guest-details"><legend>${e(g.name)}</legend><div class="field-grid">${select(g, 'menuId', 'Menú <span>(obligatorio)</span>', w.menuOptions.filter(m => !m.childOnly || g.child), 'Selecciona tu menú')}${field(g, 'arrival', 'Llegada aproximada <span>(opcional)</span>', 'time')}${field(g, 'allergies', 'Alergias e intolerancias <span>(opcional)</span>', 'textarea', true)}${select(g, 'outboundId', 'Transporte de ida', bundle.transport.filter(t => t.direction === 'outbound').map(t => ({ id: t.id, label: `${t.time} · ${t.label}` })), 'Por mi cuenta')}${select(g, 'returnId', 'Transporte de vuelta', bundle.transport.filter(t => t.direction === 'return').map(t => ({ id: t.id, label: `${t.time} · ${t.label}` })), 'Por mi cuenta')}${field(g, 'accessibility', 'Necesidades de accesibilidad <span>(opcional)</span>', 'textarea', true)}${field(g, 'comment', 'Algo más que debamos saber <span>(opcional)</span>', 'textarea', true)}</div></fieldset>`).join('') + '<p class="form-note">Comparte solo lo que necesitemos para recibirte. Estos datos sensibles no se guardan en el navegador ni en un servidor.</p>';
  }
  function reviewHTML() {
    return context.guests.map(g => { const row = rowFor(g); return `<article class="review-guest"><h3>${e(g.name)}</h3><span class="status-label ${row.attendance}">${statusText(row.attendance)}</span>${row.attendance === 'yes' ? `<dl><dt>Menú</dt><dd>${e(w.menuOptions.find(m => m.id === row.menuId)?.label)}</dd><dt>Ida</dt><dd>${e(bundle.transport.find(t => t.id === row.outboundId)?.label ?? 'Por mi cuenta')}</dd><dt>Vuelta</dt><dd>${e(bundle.transport.find(t => t.id === row.returnId)?.label ?? 'Por mi cuenta')}</dd>${([['arrival', 'Llegada'], ['allergies', 'Alergias'], ['accessibility', 'Accesibilidad'], ['comment', 'Comentario']] as const).filter(([key]) => row[key]).map(([key, label]) => `<dt>${label}</dt><dd>${e(row[key])}</dd>`).join('')}</dl>` : ''}</article>`; }).join('');
  }
  async function submit(event: SubmitEvent) {
    event.preventDefault(); if (saving) return;
    errors = validateResponses(context, rows, bundle);
    if (step === 1) errors = Object.fromEntries(Object.entries(errors).filter(([key]) => key.endsWith('-attendance') || key === 'scope'));
    if (Object.keys(errors).length) { render(); (root.querySelector<HTMLElement>('[aria-invalid="true"] input, [aria-invalid="true"]') ?? root.querySelector<HTMLElement>('.error-summary'))?.focus(); return; }
    if (step < 3) { step = step === 1 && !rows.some(row => row.attendance === 'yes') ? 3 : step + 1; render(true); return; }
    saving = true;
    const button = root.querySelector<HTMLButtonElement>('button[type="submit"]')!; button.disabled = true; button.textContent = 'Confirmando…';
    try {
      if (failSubmit) { repository.failNext(); failSubmit = false; }
      await repository.saveResponses(context, rows.map(cleanResponse));
      rows = rows.map(cleanResponse);
      root.innerHTML = `<div class="success-state" tabindex="-1"><div class="success-mark" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="m4 12 5 5L20 6"/></svg></div><h2>${rows.some(r => r.attendance === 'yes') ? 'Qué alegría.<br>Contamos contigo.' : 'Te llevaremos con nosotros.'}</h2><p>Tu respuesta de demostración está confirmada en la memoria de esta página.</p><p class="form-note">No se ha enviado a una organización real. Si recargas o sales, se perderá.</p><button class="button outline" data-edit>Modificar mi respuesta</button><a class="text-link" href="/boda/${e(slug)}">Volver a la invitación →</a></div>`;
      root.querySelector<HTMLElement>('.success-state')?.focus();
      root.querySelector('[data-edit]')?.addEventListener('click', () => { step = 1; errors = {}; render(true); });
    } catch (error) { errors = { scope: error instanceof Error ? error.message : 'No se ha podido confirmar. Inténtalo de nuevo.' }; render(); root.querySelector<HTMLElement>('.error-summary')?.focus(); }
    finally { saving = false; }
  }
  render();
}
