import { repository } from '../data/repository';
import { imageMime, validatePhoto } from '../domain/logic';
import { escapeHTML as e } from '../lib/dom';
const root = document.querySelector<HTMLElement>('[data-memories]');
if (root?.dataset.slug) void init(root, root.dataset.slug);
async function init(root: HTMLElement, slug: string) {
  const bundle = await repository.getWedding(slug);
  if (!bundle) return;
  const w = bundle.wedding;
  const context = await repository.resolveInvitation(w.demoInvitationToken, w.id);
  const previews = root.querySelector<HTMLElement>('[data-upload-previews]')!;
  const uploadStatus = root.querySelector<HTMLElement>('[data-upload-status]')!;
  const urls = new Map<string, string>();
  const input = root.querySelector<HTMLInputElement>('#memory-photos')!;
  input.addEventListener('change', async () => {
    input.disabled = true;
    const errors: string[] = [];
    const files = Array.from(input.files ?? []);
    for (const file of files) {
      let type: string | undefined;
      try { type = await imageMime(file); } catch { /* Unreadable file gets the same actionable format message. */ }
      const error = validatePhoto({ type: type ?? '', size: file.size });
      if (error) { errors.push(`${file.name}: ${error}`); continue; }
      if (urls.size >= 8) { errors.push('Puedes previsualizar hasta 8 fotos. Elimina alguna antes de añadir más.'); break; }
      const id = crypto.randomUUID(); const url = URL.createObjectURL(file); urls.set(id, url);
      const item = document.createElement('article'); item.className = 'local-preview';
      const img = document.createElement('img'); img.src = url; img.alt = `Previsualización local de ${file.name}`; img.width = 300; img.height = 300;
      img.addEventListener('error', () => { URL.revokeObjectURL(url); urls.delete(id); item.remove(); uploadStatus.textContent = `${file.name}: no se ha podido leer la imagen. Elige otro archivo.`; }, { once: true });
      const name = document.createElement('p'); name.textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB · local`;
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Quitar foto'; remove.setAttribute('aria-label', `Quitar ${file.name}`);
      remove.addEventListener('click', () => { URL.revokeObjectURL(url); urls.delete(id); item.remove(); uploadStatus.textContent = urls.size ? `${urls.size} fotos locales. No se ha subido ningún archivo.` : 'No hay fotos seleccionadas.'; input.focus(); });
      item.append(img, name, remove); previews.append(item);
    }
    uploadStatus.textContent = errors.length ? errors.join(' ') : `${urls.size} fotos listas para previsualizar. No se han subido a ningún servidor.`;
    uploadStatus.classList.toggle('error', errors.length > 0); input.value = ''; input.disabled = false;
  });
  window.addEventListener('pagehide', () => { urls.forEach(url => URL.revokeObjectURL(url)); urls.clear(); }, { once: true });
  input.disabled = false;
  const list = root.querySelector<HTMLElement>('[data-guestbook-list]')!;
  async function renderBook() {
    try {
      const messages = await repository.getMemories(w.id, context?.invitation.id);
      const visible = messages.filter(m => m.kind === 'guestbook' && m.status === 'published');
      list.innerHTML = visible.length ? visible.map(message => `<article class="guestbook-entry"><blockquote>«${e(message.text)}»</blockquote><cite>${e(message.author)} · recuerdo de demostración</cite></article>`).join('') : '<p class="muted">Todavía no hay recuerdos. El primero puede ser el tuyo.</p>';
      const letters = messages.filter(m => m.kind === 'anniversary');
      const anniversary = root.querySelector<HTMLElement>('[data-anniversary-state]')!;
      anniversary.textContent = letters.length ? `${letters.length} carta(s) de esta invitación en memoria.` : 'No hay cartas guardadas en esta página de demostración.';
      for (const letter of letters) if (letter.status === 'published' && letter.releaseAt && Date.now() >= Date.parse(letter.releaseAt)) { const p = document.createElement('p'); p.textContent = letter.text; anniversary.append(p); }
    } catch { list.innerHTML = '<p role="alert">No se ha podido abrir el libro.</p><button class="text-button" data-book-retry>Volver a intentarlo</button>'; list.querySelector('[data-book-retry]')?.addEventListener('click', () => { void renderBook(); }); }
  }
  void renderBook();
  const form = root.querySelector<HTMLFormElement>('[data-guestbook-form]')!;
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (!form.reportValidity() || !context) return;
    const data = new FormData(form); const author = String(data.get('author') ?? '').trim(); const text = String(data.get('text') ?? '').trim();
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!; const status = form.querySelector<HTMLElement>('.form-status')!;
    if (!author || text.length < 10) { status.textContent = 'Escribe tu nombre y un recuerdo de al menos 10 caracteres.'; return; }
    button.disabled = true; status.textContent = 'Añadiendo tu recuerdo local…';
    try { await repository.saveMemory({ id: crypto.randomUUID(), companyId: w.companyId, weddingId: w.id, invitationId: context.invitation.id, author, text, kind: 'guestbook', status: 'published' }); await renderBook(); form.reset(); status.textContent = 'Tu recuerdo está en esta demo. Se perderá al recargar; no se ha publicado en un servidor.'; }
    catch { status.textContent = 'No se ha podido añadir. Conservamos el texto para que puedas reintentarlo.'; }
    finally { button.disabled = false; }
  });
  form.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled = false;
}
