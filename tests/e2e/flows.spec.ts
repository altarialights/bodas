import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const home = '/boda/elena-y-marcos';
test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.title.includes('opening can')) return;
  await page.addInitScript(() => { sessionStorage.setItem('altaria:opened:wed-elena-marcos', 'yes'); sessionStorage.setItem('altaria:opened:wed-ines-gabriel', 'yes'); });
});

test('RSVP validates, preserves details, retries a failure, confirms and edits', async ({ page }) => {
  await page.goto(`${home}/confirmar`);
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Indica si esta persona asistirá.').first()).toBeVisible();
  await page.getByRole('group', { name: 'Lucía', exact: true }).getByLabel('Sí, allí estaré').check();
  await page.getByRole('group', { name: 'Pablo', exact: true }).getByLabel('No podré asistir').check();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('heading', { name: 'A tu medida.' })).toBeVisible();
  await expect(page.locator('.guest-details')).toHaveCount(1);
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Elige un menú para esta persona.')).toBeVisible();
  await page.getByLabel('Menú (obligatorio)').selectOption('vegetarian');
  await page.getByLabel('Alergias e intolerancias').fill('Frutos secos, dato de prueba');
  await page.getByLabel('Transporte de ida').selectOption('em-bus-go');
  await page.getByLabel('Transporte de vuelta').selectOption('em-bus-back-2');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Frutos secos, dato de prueba')).toBeVisible();
  await page.getByRole('button', { name: 'Volver', exact: true }).click();
  await expect(page.getByLabel('Alergias e intolerancias')).toHaveValue('Frutos secos, dato de prueba');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByText('Probar un error de la demo').click();
  await page.getByLabel('Simular fallo al confirmar').check();
  await page.getByRole('button', { name: 'Confirmar respuesta demo' }).click();
  await expect(page.getByRole('alert')).toContainText('No hemos podido completar');
  await page.getByRole('button', { name: 'Confirmar respuesta demo' }).click();
  await expect(page.getByRole('heading', { name: /Qué alegría/ })).toBeVisible();
  await page.getByRole('button', { name: 'Modificar mi respuesta' }).click();
  await expect(page.getByRole('group', { name: 'Lucía', exact: true }).getByLabel('Sí, allí estaré')).toBeChecked();
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain('Frutos');
  await page.reload();
  await expect(page.getByRole('group', { name: 'Lucía', exact: true }).getByLabel('Sí, allí estaré')).not.toBeChecked();
});

test('decline skips details and invitation token cannot cross weddings', async ({ page }) => {
  await page.goto(`${home}/confirmar`);
  await page.getByRole('group', { name: 'Lucía', exact: true }).getByLabel('No podré asistir').check();
  await page.getByRole('group', { name: 'Pablo', exact: true }).getByLabel('No podré asistir').check();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('heading', { name: 'Todo listo para el gran día.' })).toBeVisible();
  await page.getByRole('button', { name: 'Confirmar respuesta demo' }).click();
  await expect(page.getByRole('heading', { name: 'Te llevaremos con nosotros.' })).toBeVisible();
  await page.goto('/boda/ines-y-gabriel/confirmar?invitacion=demo_f4Rz8Wx9Km2P');
  await expect(page.getByRole('heading', { name: 'No encontramos tu invitación.' })).toBeVisible();
  await page.goto('/boda/ines-y-gabriel/confirmar');
  await expect(page.getByText('Acompañante autorizado · opcional')).toBeVisible();
  await expect(page.getByRole('group', { name: 'Ana', exact: true })).toBeVisible();
  await expect(page.getByText('Lucía')).toHaveCount(0);
});

test('phase controls, calendar, personalization, music and keyboard menu work', async ({ page }) => {
  await page.goto(home);
  await page.getByRole('button', { name: 'Mi invitación', exact: true }).click();
  await expect(page.locator('[data-personal-greeting]')).toContainText('Lucía y Pablo');
  await page.getByLabel('Fase de demostración').selectOption('during');
  await expect(page.getByRole('heading', { name: 'Hoy empieza todo.' })).toBeVisible();
  await expect(page.getByText('Mesa Olivo · 04')).toBeVisible();
  await page.getByLabel('Fase de demostración').selectOption('after');
  await expect(page.getByRole('link', { name: /Abrir nuestros recuerdos/ })).toBeVisible();
  await page.getByLabel('Fase de demostración').selectOption('before');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Añadir al calendario' }).click();
  const file = await download; expect(file.suggestedFilename()).toBe('elena-y-marcos.ics');
  const path = await file.path(); expect(await fs.readFile(path!, 'utf8')).toContain('DTSTART:20270626T150000Z');
  await page.getByRole('button', { name: 'Activar música' }).click();
  await expect(page.getByRole('button', { name: 'Pausar música' })).toBeVisible();
  await page.getByRole('button', { name: 'Pausar música' }).click();
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await expect(page.getByRole('dialog', { name: '' }).first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeFocused();
});

test('music failure is reported and reduced-motion opening is skipped', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('Playback blocked for test', 'NotAllowedError')); });
  await page.goto(home);
  await expect(page.locator('[data-opening]')).not.toBeVisible();
  await page.getByRole('button', { name: 'Activar música' }).click();
  await expect(page.locator('#music-status')).toContainText(/No se ha podido|no está disponible/);
  expect(await page.locator('[data-background-music]').evaluate((audio: HTMLAudioElement) => audio.paused)).toBe(true);
});

test('memory previews validate files, remove resources and post local text safely', async ({ page }) => {
  await page.goto(`${home}/recuerdos`);
  const input = page.locator('#memory-photos');
  await expect(input).toBeEnabled();
  await input.setInputFiles({ name: 'not-a-photo.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
  await expect(page.locator('[data-upload-status]')).toContainText('JPG, PNG o WebP');
  await input.setInputFiles('public/images/elena-marcos-480.webp');
  await expect(page.locator('.local-preview img')).toBeVisible();
  await page.getByRole('button', { name: 'Quitar elena-marcos-480.webp' }).click();
  await expect(page.locator('.local-preview')).toHaveCount(0);
  await page.getByLabel('Tu nombre', { exact: true }).fill('Invitado de prueba');
  await page.getByLabel('Tu recuerdo', { exact: true }).fill('Un abrazo <script>nunca se ejecuta</script> para vosotros.');
  await page.getByRole('button', { name: 'Dejar mi recuerdo' }).click();
  await expect(page.getByText('Invitado de prueba · recuerdo de demostración')).toBeVisible();
  await expect(page.locator('.guestbook-entry').last()).toContainText('<script>nunca se ejecuta</script>');
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain('Invitado');
});

test('management filters, accurate totals, CSV, errors and live isolated preview', async ({ page }) => {
  await page.goto('/gestion');
  await expect(page.locator('.dashboard-stat strong').first()).toHaveText('12');
  await page.getByLabel('Buscar invitado').fill('Clara');
  await expect(page.locator('.guest-table tbody tr')).toHaveCount(1);
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Exportar CSV' }).click();
  const file = await download; const filePath = await file.path(); const csv = await fs.readFile(filePath!, 'utf8');
  expect(csv).toContain('Clara'); expect(csv).not.toContain('Diego');
  await page.getByRole('button', { name: 'Ver respuesta de Clara' }).click();
  await expect(page.getByRole('dialog')).toContainText('Menú de temporada');
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await page.getByLabel('Buscar invitado').fill('Nadie-con-este-nombre');
  await expect(page.getByText('No hay invitados en esta vista.')).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await page.getByText('Estados de demostración').click();
  await page.getByRole('button', { name: 'Simular error de carga' }).click();
  await expect(page.getByRole('alert')).toContainText('No hemos podido completar');
  await page.getByRole('button', { name: 'Reintentar carga' }).click();
  await page.getByRole('tab', { name: 'Contenido y vista previa' }).click();
  await page.getByLabel('Primer nombre', { exact: true }).fill('Elena Demo');
  await page.getByLabel('Dedicatoria', { exact: true }).fill('Una dedicatoria editada en la sesión.');
  await page.getByLabel('Regalos', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Aplicar a la vista previa' }).click();
  await expect(page.getByRole('status')).toContainText('Vista previa actualizada');
  const frame = page.frameLocator('[data-preview-frame]');
  await expect(frame.locator('[data-name-first]')).toHaveText('Elena Demo');
  await expect(frame.locator('[data-dedication]')).toHaveText('Una dedicatoria editada en la sesión.');
  await expect(frame.locator('[data-section="gifts"]')).toBeHidden();
  await page.getByLabel('Boda que estás organizando').selectOption('ines-y-gabriel');
  await expect(page.getByLabel('Primer nombre', { exact: true })).toHaveValue('Inés');
  await page.getByLabel('Boda que estás organizando').selectOption('elena-y-marcos');
  await expect(page.getByLabel('Primer nombre', { exact: true })).toHaveValue('Elena Demo');
});

test('all routes have images and no horizontal overflow at 320, 390, 768 and 1440', async ({ page }) => {
  for (const route of [home, '/boda/ines-y-gabriel', `${home}/confirmar`, `${home}/recuerdos`, '/demo', '/gestion']) {
    await page.goto(route); await page.locator('.loading-state').waitFor({ state: 'hidden' }).catch(() => {});
    await page.evaluate(() => document.fonts.ready);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${route} at ${width}`).toBe(true);
    }
    for (const img of await page.locator('img').all()) { await img.scrollIntoViewIfNeeded(); await expect(img).toHaveJSProperty('complete', true); expect(await img.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0); }
  }
});

test('songs and anniversary letters provide honest local success', async ({ page }) => {
  await page.goto(home);
  await page.getByText('Una canción para bailar', { exact: true }).click();
  const song = page.locator('[data-participation="song"]');
  await song.getByLabel('Canción', { exact: true }).fill('Una canción inventada');
  await song.getByLabel('Artista', { exact: true }).fill('Grupo de demostración');
  await song.getByLabel('¿Qué recuerdo te trae?').fill('Aquel viaje al mar.');
  await song.getByRole('button', { name: 'Proponer canción' }).click();
  await expect(song.getByRole('status')).toContainText('No se ha enviado');
  await page.getByText('Una carta para el futuro', { exact: true }).click();
  const letter = page.locator('[data-participation="letter"]');
  await letter.getByLabel('Tu nombre', { exact: true }).fill('Persona de prueba');
  await letter.getByLabel('Tu carta', { exact: true }).fill('Que nunca os falten los domingos lentos y las risas compartidas.');
  await letter.getByRole('button', { name: 'Sellar mi carta' }).click();
  await expect(letter.getByRole('status')).toContainText('Carta sellada');
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain('domingos');
});

test('opening can be skipped and is not repeated in the same session', async ({ page }) => {
  await page.goto('/demo');
  await page.evaluate(() => sessionStorage.removeItem('altaria:opened:wed-elena-marcos'));
  await page.goto(home);
  const opening = page.locator('[data-opening]');
  await expect(opening).toBeVisible();
  await page.getByRole('button', { name: 'Saltar apertura' }).click();
  await expect(opening).not.toBeVisible();
  await page.goto(`${home}/confirmar`);
  await page.getByRole('link', { name: 'Volver a la invitación', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Mi invitación', exact: true })).toBeEnabled();
  await expect(opening).not.toBeVisible();
});
