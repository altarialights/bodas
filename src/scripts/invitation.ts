import { repository } from '../data/repository';
import { countdown, phaseAt, formatTime, calendarFile, formatDate } from '../domain/logic';
import { downloadFile, escapeHTML as e } from '../lib/dom';
import type { Phase, Wedding } from '../domain/types';

const root = document.querySelector<HTMLElement>('[data-invitation]');
if (root?.dataset.slug) void setup(root.dataset.slug);
async function setup(slug: string) {
  const bundle = await repository.getWedding(slug);
  if (!bundle) return;
  let wedding = bundle.wedding;
  const countdownUpdate = () => { const count = countdown(wedding.startsAt); for (const [key, value] of Object.entries(count)) { const node = document.querySelector(`[data-count="${key}"]`); if (node) node.textContent = String(value).padStart(2, '0'); } };
  countdownUpdate();
  const motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveal = motion ? new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.animate([{ opacity: .7, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)' });
      reveal!.unobserve(entry.target);
    }
  }, { threshold: .18 }) : undefined;
  document.querySelectorAll('.dedication, .section-heading, .participation-intro').forEach(element => reveal?.observe(element));
  const timer = window.setInterval(() => { countdownUpdate(); if (phaseSelect?.value === 'auto' && document.body.dataset.phase !== phaseAt(wedding)) void applyPhase(); }, 15000);
  document.querySelector('[data-calendar]')?.addEventListener('click', () => downloadFile(calendarFile({ ...bundle, wedding }), `${wedding.slug}.ics`, 'text/calendar;charset=utf-8'));
  const phaseSelect = document.querySelector<HTMLSelectElement>('[data-phase-select]');
  const applyPhase = async () => {
    const forced = phaseSelect?.value;
    const phase: Phase = forced === 'before' || forced === 'during' || forced === 'after' ? forced : phaseAt(wedding);
    document.body.dataset.phase = phase;
    const panel = document.querySelector<HTMLElement>('[data-phase-panel]');
    if (!panel) return;
    panel.hidden = phase === 'before';
    if (phase === 'before') { panel.innerHTML = ''; return; }
    root?.prepend(panel);
    const home = `/boda/${wedding.slug}`;
    const context = await repository.resolveInvitation(wedding.demoInvitationToken, wedding.id);
    if (phase === 'after') {
      panel.innerHTML = `<h2>El día pasa. Lo bonito se queda.</h2><p>${e(wedding.thankYou)}</p><a href="${home}/recuerdos" class="button primary">Abrir nuestros recuerdos <span aria-hidden="true">→</span></a><p class="phase-caption">${forced === 'after' ? 'Vista posterior forzada para demostración.' : 'Gracias por acompañarnos.'}</p>`;
    } else {
      const now = forced === 'during' ? Date.parse(wedding.startsAt) + 20 * 60000 : Date.now();
      const next = bundle.program.find(event => Date.parse(event.startsAt) > now);
      const current = [...bundle.program].reverse().find(event => Date.parse(event.startsAt) <= now);
      const event = next ?? current;
      const venue = bundle.venues.find(v => v.id === event?.venueId);
      const answers = context ? await repository.getResponses(wedding.id, context.invitation.id) : [];
      const routes = [...new Set(answers.flatMap(r => [r.outboundId, r.returnId]).filter(Boolean))].map(id => bundle.transport.find(t => t.id === id)).filter(Boolean);
      panel.innerHTML = `<h2>Hoy empieza todo.</h2><p>La información que necesitas, para dedicarte a disfrutar.</p><div class="phase-grid"><div><h3>${next ? 'A continuación' : 'Estamos celebrando'}</h3><p>${event ? `${e(formatTime(event.startsAt, wedding))} · ${e(event.title)}` : 'Consulta el programa'}</p><p>${e(venue?.name)}</p><a href="#guia" class="text-link">Indicaciones y ayuda →</a></div><div><h3>Tu invitación de ejemplo</h3><p>${context?.invitation.tablePublished ? `Mesa ${e(context.guests[0]?.table ?? 'por asignar')}` : 'La mesa todavía no se ha publicado.'}</p><p>${routes.length ? routes.map(r => `${e(r!.time)} · ${e(r!.label)}`).join('<br>') : 'No hay trayectos reservados para esta invitación de ejemplo.'}</p></div></div><ul>${wedding.notices.map(notice => `<li>${e(notice)}</li>`).join('')}</ul><a href="${home}/recuerdos#compartir" class="button primary">Compartir fotografías →</a><p class="phase-caption">${forced === 'during' ? 'Modo de demostración: reloj situado 20 minutos después de la ceremonia.' : ''} Solo se muestra la familia de ejemplo.</p>`;
    }
  };
  phaseSelect?.addEventListener('change', () => { void applyPhase(); });
  void applyPhase();
  document.querySelector('[data-personalize]')?.addEventListener('click', async () => {
    const context = await repository.resolveInvitation(wedding.demoInvitationToken, wedding.id);
    const greeting = document.querySelector<HTMLElement>('[data-personal-greeting]');
    if (greeting && context) { greeting.textContent = context.invitation.greeting; greeting.hidden = false; greeting.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' }); }
  });
  document.querySelectorAll<HTMLFormElement>('[data-participation]').forEach(form => {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
      const status = form.querySelector<HTMLElement>('.form-status')!;
      const data = new FormData(form);
      const value = (key: string) => String(data.get(key) ?? '').trim();
      const context = await repository.resolveInvitation(wedding.demoInvitationToken, wedding.id);
      if (!context) return;
      const base = { id: crypto.randomUUID(), companyId: wedding.companyId, weddingId: wedding.id, invitationId: context.invitation.id };
      button.disabled = true; status.textContent = 'Guardando en la memoria de esta página…'; status.classList.remove('error');
      try {
        if (form.dataset.participation === 'song') {
          if (!value('title') || !value('artist')) throw new Error('Escribe una canción y su artista.');
          await repository.proposeSong({ ...base, title: value('title'), artist: value('artist'), memory: value('memory') });
          status.textContent = 'Tu canción está en la lista de esta demo. No se ha enviado y se perderá al recargar.';
        } else {
          if (!value('author') || value('text').length < 10) throw new Error('Añade tu nombre y una carta de al menos 10 caracteres.');
          const release = new Date(wedding.startsAt); release.setUTCFullYear(release.getUTCFullYear() + 1);
          await repository.saveMemory({ ...base, author: value('author'), text: value('text'), kind: 'anniversary', status: 'sealed', releaseAt: release.toISOString() });
          status.textContent = 'Carta sellada en la memoria de esta demo. No se publica ni se envía. Se perderá al salir de la página.';
        }
        form.reset();
      } catch (error) { status.classList.add('error'); status.textContent = error instanceof Error ? error.message : 'No se ha podido guardar. Inténtalo de nuevo.'; }
      finally { button.disabled = false; }
    });
  });
  const opening = document.querySelector<HTMLDialogElement>('[data-opening]');
  let revealTimer: number | undefined;
  let closeTimer: number | undefined;
  if (opening && !new URLSearchParams(location.search).has('preview')) {
    let seen = true;
    try { seen = sessionStorage.getItem(`altaria:opened:${wedding.id}`) === 'yes'; sessionStorage.setItem(`altaria:opened:${wedding.id}`, 'yes'); } catch { /* Don't obstruct navigation when storage is unavailable. */ }
    if (!seen && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      opening.showModal();
      const close = () => { clearTimeout(revealTimer); clearTimeout(closeTimer); opening.close(); };
      opening.querySelector('[data-skip-opening]')?.addEventListener('click', close);
      opening.querySelector('[data-opening-details]')?.addEventListener('click', close);
      revealTimer = window.setTimeout(() => { opening.classList.add('revealing'); closeTimer = window.setTimeout(close, 650); }, 950);
    }
  }
  // Only non-sensitive wedding content crosses to the same-origin preview iframe.
  const onPreview = (event: MessageEvent<{ type: string; wedding: Wedding }>) => {
    if (!new URLSearchParams(location.search).has('preview') || event.origin !== location.origin || event.source !== parent || event.data?.type !== 'altaria:preview') return;
    const next = event.data.wedding;
    if (!next || next.id !== wedding.id || next.companyId !== wedding.companyId) return;
    wedding = next;
    const set = (selector: string, text: string) => { const node = document.querySelector(selector); if (node) node.textContent = text; };
    set('[data-name-first]', wedding.names[0]); set('[data-name-second]', wedding.names[1]); set('[data-dedication]', wedding.dedication); set('[data-welcome]', wedding.welcome); set('[data-date]', formatDate(wedding));
    document.querySelectorAll<HTMLElement>('[data-section]').forEach(section => { section.hidden = !wedding.sections[section.dataset.section as keyof Wedding['sections']]; });
    for (const [key, anchor] of [['story', 'historia'], ['program', 'programa'], ['guide', 'guia']] as const) document.querySelectorAll<HTMLAnchorElement>(`a[href$="#${anchor}"]`).forEach(link => { link.hidden = !wedding.sections[key]; });
    countdownUpdate();
  };
  window.addEventListener('message', onPreview);
  if (new URLSearchParams(location.search).has('preview')) { document.querySelector('[data-demo-controls]')?.remove(); document.querySelector('.bottom-tools')?.remove(); parent.postMessage({ type: 'altaria:preview-ready', weddingId: wedding.id }, location.origin); }
  document.querySelectorAll<HTMLButtonElement | HTMLSelectElement>('[data-personalize], [data-phase-select], [data-calendar], [data-participation] button[type="submit"]').forEach(control => { control.disabled = false; });
  window.addEventListener('pagehide', () => { clearInterval(timer); clearTimeout(revealTimer); clearTimeout(closeTimer); reveal?.disconnect(); window.removeEventListener('message', onPreview); }, { once: true });
}
