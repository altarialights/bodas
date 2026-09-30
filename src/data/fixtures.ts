import type { WeddingBundle, Invitation, Guest, IndividualResponse, Memory, Scoped } from '../domain/types';

export const company = { id: 'org-atelier-demo', name: 'Altaria · celebraciones', contactLabel: 'Equipo de organización (demostración)' };
const scope = (weddingId: string, id: string): Scoped => ({ id, weddingId, companyId: company.id });
const sections = { story: true, program: true, guide: true, participation: true, gifts: true, faq: true };
const makeBundle = (second: boolean): WeddingBundle => {
  const id = second ? 'wed-ines-gabriel' : 'wed-elena-marcos';
  const prefix = second ? 'ig' : 'em';
  const names: [string, string] = second ? ['Inés', 'Gabriel'] : ['Elena', 'Marcos'];
  const date = second ? '2027-09-18' : '2027-06-26';
  const s = (key: string) => scope(id, `${prefix}-${key}`);
  const venueName = second ? 'Casa de la Brisa' : 'Finca del Olivo';
  const region = second ? 'Menorca' : 'Toledo';
  return {
    company,
    wedding: {
      id, companyId: company.id, slug: second ? 'ines-y-gabriel' : 'elena-y-marcos', names, locale: 'es-ES', timezone: 'Europe/Madrid',
      startsAt: `${date}T17:00:00+02:00`, endsAt: `${second ? '2027-09-19' : '2027-06-27'}T04:00:00+02:00`, rsvpDeadline: second ? '2027-08-18' : '2027-05-26', phase: 'auto',
      visual: { accent: second ? '#79816a' : '#ac8748', accentDark: second ? '#4e5940' : '#80602d', paper: second ? '#fcfcf8' : '#fffefa', monogram: second ? 'I&G' : 'E&M', photoTreatment: second ? 'natural' : 'warm-mono', layout: 'editorial' },
      heroId: s('hero').id, detailId: s('detail').id, venueImageId: s('venue-photo').id, musicId: s('music').id,
      sections: { ...sections, gifts: !second }, headline: ['NOS', 'CASAMOS'],
      dedication: second ? 'De todos los lugares del mundo, nos quedamos contigo.' : 'Lo mejor de nuestra historia es la gente que forma parte de ella.',
      welcome: second ? 'Nos vemos donde el mar se encuentra con el cielo. Trae ganas de bailar descalzo.' : 'Después de tantos caminos compartidos, empieza nuestra aventura favorita. Y no la imaginamos sin ti.',
      story: second ? [
        { year: '2019', title: 'Un billete de ida.', text: 'Compartimos mesa en un pequeño café junto al puerto. El siguiente café ya lo pedimos juntos.', mediaId: s('hero').id },
        { year: '2023', title: 'Nuestra isla.', text: 'Una maleta, dos bicis y la certeza de haber encontrado nuestro lugar.', mediaId: s('venue-photo').id },
        { year: '2026', title: 'Una marea de síes.', text: 'Sin discursos, frente al mar. La respuesta llegó antes que la pregunta.', mediaId: s('detail').id },
      ] : [
        { year: '2018', title: 'Una casualidad.', text: 'Una cena de amigos, dos sillas juntas y una conversación que se nos hizo demasiado corta.', mediaId: s('hero').id },
        { year: '2022', title: 'Un mismo camino.', text: 'Aprendimos que casa no era un lugar. Eran los domingos lentos y el café para dos.', mediaId: s('detail').id },
        { year: '2026', title: 'Un sí, para todo.', text: 'Entre olivos, sin grandes planes. Solo una pregunta y todas las ganas del mundo.', mediaId: s('venue-photo').id },
      ],
      dressCode: second ? 'Lino, brisa y libertad.' : 'Elegante y cómodo.', dressNote: second ? 'Tonos naturales y zapatos para caminar por el jardín. El blanco lo guarda la novia.' : 'Evita el blanco, lo reserva la novia. El jardín agradece zapatos cómodos.',
      accessibility: 'Acceso sin escalones, aseos adaptados y una zona tranquila. Puedes indicarnos cualquier necesidad al confirmar.',
      rainPlan: second ? 'Si el viento o la lluvia nos visitan, celebraremos en el salón acristalado.' : 'Si llueve, nos esperan el invernadero y el salón de la finca. El horario se mantiene.',
      contact: 'La coordinación real se añadirá al preparar la invitación. En esta demo puedes consultar las preguntas frecuentes.',
      thankYou: second ? 'La isla se nos queda pequeña para tantas cosas bonitas que recordar. Gracias por estar.' : 'Volveríamos a vivir este día mil veces. Y en todas, os elegiríamos a vosotros.',
      giftMessage: 'Tenerte cerca es lo que de verdad nos hace ilusión. Si además quieres regalarnos algo, aquí compartiremos algunas ideas.',
      notices: ['La ceremonia comenzará puntual. Te esperamos 20 minutos antes.', 'El acceso al jardín está señalizado desde la entrada principal.'],
      menuOptions: [ { id: 'classic', label: 'Menú de temporada', childOnly: false }, { id: 'vegetarian', label: 'Vegetariano', childOnly: false }, { id: 'vegan', label: 'Vegano', childOnly: false }, { id: 'child', label: 'Menú infantil', childOnly: true } ],
      demoInvitationToken: second ? 'demo_h7Kp9Qx2Nz8B' : 'demo_f4Rz8Wx9Km2P',
    },
    media: [
      { ...s('music'), kind: 'audio', src: '/audio/entre-olivos.wav', alt: 'Entre olivos, miniatura instrumental original', origin: 'Composición y síntesis original en scripts/prepare-assets.mjs', license: 'Recurso original del proyecto. Sin muestras ni canciones comerciales.' },
      { ...s('hero'), kind: 'image', src: second ? '/images/ines-gabriel' : '/images/elena-marcos', alt: second ? 'Inés y Gabriel se abrazan junto al mar en una fotografía ficticia.' : 'Elena y Marcos sonríen con las frentes juntas en una fotografía ficticia.', width: 1536, height: 1024, origin: 'Generado con OpenAI ImageGen para esta demostración.', license: 'Recurso sintético del proyecto; no representa una pareja real.' },
      { ...s('detail'), kind: 'image', src: second ? '/images/manos-mar' : '/images/manos', alt: second ? 'Inés y Gabriel caminan de la mano junto al mar en una escena ficticia.' : 'La pareja camina de la mano entre los olivos.', width: 1536, height: 1024, origin: 'OpenAI ImageGen', license: 'Recurso sintético del proyecto.' },
      { ...s('venue-photo'), kind: 'image', src: '/images/mesa', alt: 'Una mesa de celebración al aire libre, en un lugar ficticio.', width: 1536, height: 1024, origin: 'OpenAI ImageGen', license: 'Recurso sintético del proyecto.' },
      ...(!second ? [{ ...s('dance'), kind: 'image' as const, src: '/images/baile', alt: 'Elena y Marcos bailan bajo las luces de su celebración ficticia.', width: 1536, height: 1024, origin: 'OpenAI ImageGen', license: 'Recurso sintético del proyecto.' }] : []),
    ],
    venues: [
      { ...s('ceremony'), name: second ? 'El jardín del mar' : 'El jardín de los olivos', region, description: 'Ceremonia al aire libre.', arrival: 'Accede por la entrada principal 20 minutos antes de la ceremonia.', parking: 'Aparcamiento junto a la entrada, con plazas accesibles señalizadas.', fictional: true },
      { ...s('reception'), name: venueName, region, description: second ? 'Una sobremesa con vistas al Mediterráneo.' : 'Una noche de verano entre olivos y gente querida.', arrival: 'La celebración está a cinco minutos a pie de la ceremonia.', parking: 'Puedes dejar tu coche hasta el día siguiente.', fictional: true },
    ],
    program: [
      { ...s('event-1'), startsAt: `${date}T17:00:00+02:00`, title: 'Ceremonia', description: 'El momento más importante, rodeados de las personas que más queremos.', venueId: s('ceremony').id },
      { ...s('event-2'), startsAt: `${date}T18:00:00+02:00`, title: 'Cóctel', description: 'Brindaremos juntos, sin prisa y con mucho que celebrar.', venueId: s('reception').id },
      { ...s('event-3'), startsAt: `${date}T20:00:00+02:00`, title: 'Cena y celebración', description: 'Una cena para recordar. Después, música y una pista que nos espera.', venueId: s('reception').id },
    ],
    transport: [
      { ...s('bus-go'), direction: 'outbound', label: 'Autobús a la ceremonia', time: '16:00', departure: 'Punto de encuentro por confirmar en la invitación definitiva', capacity: 50 },
      { ...s('bus-back-1'), direction: 'return', label: 'Primera vuelta', time: '01:00', departure: 'Entrada principal de la finca', capacity: 50 },
      { ...s('bus-back-2'), direction: 'return', label: 'Último baile', time: '03:30', departure: 'Entrada principal de la finca', capacity: 50 },
    ],
    accommodations: [ { ...s('stay-1'), name: 'Dormir cerca, despertar despacio.', description: 'Estamos preparando una selección de alojamientos próximos a la celebración.', note: 'No hay hoteles ni reservas reales en esta demostración.' } ],
    faqs: [
      { ...s('faq-1'), question: '¿Hasta cuándo puedo confirmar?', answer: `Nos ayudará saberlo antes del ${second ? '18 de agosto' : '26 de mayo'} de 2027. Puedes modificar tu respuesta durante esta sesión de demostración.` },
      { ...s('faq-2'), question: '¿Puedo llevar acompañante?', answer: 'En tu invitación aparecen las personas incluidas. La opción de acompañante solo está disponible cuando la pareja la ha habilitado.' },
      { ...s('faq-3'), question: '¿Y si tengo alguna alergia?', answer: 'En el segundo paso de la confirmación puedes indicar alergias y necesidades de cada persona. En la demo estos datos solo permanecen en memoria.' },
      { ...s('faq-4'), question: '¿Podremos compartir fotografías?', answer: 'Sí. En Recuerdos puedes elegir y previsualizar fotos en tu dispositivo. La subida real estará disponible al conectar el almacenamiento.' },
    ],
    gifts: [
      { ...s('gift-list'), kind: 'list', title: 'Pequeñas cosas para nuestra casa', description: 'La lista personal se publicará con la invitación definitiva. No hay compras habilitadas en la demo.' },
      { ...s('gift-trip'), kind: 'honeymoon', title: 'Nuestra próxima aventura', description: 'La aportación a la luna de miel se podrá configurar más adelante. Esta demo no recoge pagos ni datos bancarios.' },
    ],
  };
};
export const bundles = [makeBundle(false), makeBundle(true)];
export const invitations: Invitation[] = [];
export const guests: Guest[] = [];
export const responses: IndividualResponse[] = [];
export const memories: Memory[] = [];
for (const [weddingIndex, { wedding }] of bundles.entries()) {
  const firstNames = weddingIndex === 0 ? ['Lucía', 'Pablo', 'Clara', 'Diego', 'Vera', 'Mateo', 'Alba', 'Nicolás', 'Olivia', 'Hugo', 'Celia', 'Leo'] : ['Ana', 'Álex', 'Nora', 'Lucas', 'Julia', 'Bruno', 'Sara', 'Daniel'];
  for (let i = 0; i < firstNames.length; i += 2) {
    const invitationId = `${wedding.id}-family-${i / 2}`;
    const pair = firstNames.slice(i, i + 2);
    const guestIds = pair.map((_, j) => `${invitationId}-guest-${j}`);
    const allowCompanion = weddingIndex === 1 && i === 0;
    if (allowCompanion) guestIds.push(`${invitationId}-companion`);
    invitations.push({ ...scope(wedding.id, invitationId), opaqueToken: i === 0 ? wedding.demoInvitationToken : `demo_${weddingIndex}_family_${i}`, greeting: `${pair.join(' y ')}, queremos compartir este día con vosotros.`, guestIds, allowCompanion, companionGuestId: allowCompanion ? guestIds[2] : undefined, tablePublished: true });
    guestIds.forEach((guestId, j) => {
      guests.push({ ...scope(wedding.id, guestId), invitationId, name: pair[j] ?? 'Tu acompañante', optional: j === 2, child: i === 4 && j === 1, table: i === 0 ? 'Olivo · 04' : `Mesa ${i + 1}` });
      if (i > 0) responses.push({ ...scope(wedding.id, `${guestId}-response`), invitationId, guestId, attendance: i === 6 ? 'no' : i === 8 ? 'pending' : 'yes', menuId: i === 4 && j === 1 ? 'child' : j === 0 ? 'classic' : 'vegetarian', outboundId: i === 2 ? `${weddingIndex ? 'ig' : 'em'}-bus-go` : undefined, returnId: i === 2 ? `${weddingIndex ? 'ig' : 'em'}-bus-back-1` : undefined });
    });
  }
  memories.push({ ...scope(wedding.id, `${wedding.id}-memory-1`), invitationId: `${wedding.id}-family-1`, author: 'Una amiga de siempre', text: 'Me quedo con los abrazos largos, la última canción y esa manera vuestra de miraros. Por muchos días así.', kind: 'guestbook', status: 'published' });
}
