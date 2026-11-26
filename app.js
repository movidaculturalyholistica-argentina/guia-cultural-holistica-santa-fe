
const API_URL = 'https://gestion.movidaculturalyholistica.com.ar/api/professionals/public';

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const search = document.querySelector('#search');
const area = document.querySelector('#area');
const localidad = document.querySelector('#localidad');
const directory = document.querySelector('#directory');
const count = document.querySelector('.directory-count');

let professionals = [];

menuButton?.addEventListener('click', () => {
  const opened = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(opened));
  menuButton.textContent = opened ? '×' : '☰';
});

document.querySelector('#year').textContent = new Date().getFullYear();

const style = document.createElement('style');
style.textContent = `
.directory-grid {
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:20px;
  margin-top:20px;
}
.professional-card {
  background:#fffdf8;
  border:1px solid #e6dfd2;
  padding:25px;
  min-width:0;
}
.professional-card.is-featured {
  grid-column:span 2;
  background:#f3f5ed;
  border:1px solid #b9c7ad;
  padding:32px;
}
.professional-top {
  display:flex;
  justify-content:space-between;
  gap:10px;
  flex-wrap:wrap;
  margin-bottom:15px;
}
.professional-plan {
  color:#526b50;
  font-size:9px;
  font-weight:700;
  letter-spacing:1.5px;
}
.is-featured .professional-plan { color:#c66f50; }
.professional-type {
  font-size:9px;
  color:#72776c;
  text-transform:uppercase;
}
.professional-card h3 {
  font:700 23px Manrope,sans-serif;
  color:#263e32;
  margin:0 0 5px;
}
.professional-location {
  font-size:11px;
  color:#72776c;
  margin-bottom:13px;
}
.professional-area {
  font-size:10px;
  color:#c66f50;
  font-weight:700;
  margin-bottom:12px;
}
.professional-disciplines {
  font-size:12px;
  color:#526b50;
  margin-bottom:12px;
}
.professional-description {
  font-size:12px;
  color:#646c60;
  margin:12px 0;
}
.professional-details {
  font-size:11px;
  color:#72776c;
  margin:10px 0;
}
.professional-links {
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  margin-top:18px;
}
.professional-links a {
  display:inline-block;
  padding:9px 13px;
  border:1px solid #526b50;
  color:#526b50;
  font-size:10px;
  font-weight:700;
}
.professional-links a:hover {
  background:#526b50;
  color:white;
}
@media(max-width:620px) {
  .directory-grid {grid-template-columns:1fr}
  .professional-card.is-featured {
    grid-column:span 1;
    padding:24px;
  }
  .professional-card {padding:22px}
}
`;
document.head.appendChild(style);

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function addText(parent, tag, className, value) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = value || '';
  parent.appendChild(element);
  return element;
}

function safeLink(value) {
  if (!value) return null;

  try {
    const url = new URL(
      value.startsWith('http') ? value : `https://${value}`
    );

    if (!['https:', 'http:'].includes(url.protocol)) return null;
    return url.href;
  } catch {
    return null;
  }
}

function addLink(container, label, value) {
  const url = safeLink(value);
  if (!url) return;

  const link = document.createElement('a');
  link.href = url;
  link.textContent = label;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  container.appendChild(link);
}

function createCard(person) {
  const featured = person.plan === 'featured';

  const card = document.createElement('article');
  card.className = `professional-card${featured ? ' is-featured' : ''}`;

  const top = document.createElement('div');
  top.className = 'professional-top';
  addText(top, 'span', 'professional-plan',
    featured ? '✳ PRESENCIA DESTACADA' : 'PRESENCIA BÁSICA');
  addText(top, 'span', 'professional-type',
    person.profile_type === 'space' ? 'Espacio' : 'Profesional');
  card.appendChild(top);

  addText(card, 'h3', '', person.public_name);

  const place = [person.locality, person.province || 'Santa Fe']
    .filter(Boolean).join(' · ');
  addText(card, 'div', 'professional-location', place);

  const areas = {
    cultural: 'Cultural',
    holistica: 'Holística',
    ambas: 'Cultural y Holística'
  };

  addText(card, 'div', 'professional-area',
    areas[normalize(person.area)] || person.area);

  const disciplines = Array.isArray(person.disciplines)
    ? person.disciplines.join(' · ')
    : '';

  if (disciplines) {
    addText(card, 'div', 'professional-disciplines', disciplines);
  }

  if (featured) {
    if (person.presentation) {
      addText(card, 'p', 'professional-description',
        person.presentation);
    }

    if (person.training) {
      addText(card, 'p', 'professional-details',
        `Formación: ${person.training}`);
    }

    if (person.experience) {
      addText(card, 'p', 'professional-details',
        `Experiencia: ${person.experience}`);
    }

    const links = document.createElement('div');
    links.className = 'professional-links';

    addLink(links, 'Sitio web ↗', person.website);
    addLink(links, 'Instagram ↗', person.instagram);
    addLink(links, 'Facebook ↗', person.facebook);

    if (links.children.length) card.appendChild(links);
  }

  return card;
}

function updateLocalities() {
  const selected = localidad.value;

  const places = [...new Set(
    professionals.map(p => p.locality).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, 'es'));

  localidad.replaceChildren();

  const all = document.createElement('option');
  all.value = '';
  all.textContent = 'Toda Santa Fe';
  localidad.appendChild(all);

  places.forEach(place => {
    const option = document.createElement('option');
    option.value = place;
    option.textContent = place;
    localidad.appendChild(option);
  });

  localidad.value = places.includes(selected) ? selected : '';
}

function renderDirectory() {
  const term = normalize(search.value);
  const selectedArea = normalize(area.value);
  const selectedPlace = localidad.value;

  const filtered = professionals.filter(person => {
    const personArea = normalize(person.area);

    const matchesArea =
      !selectedArea ||
      personArea === selectedArea ||
      personArea === 'ambas';

    const matchesPlace =
      !selectedPlace || person.locality === selectedPlace;

    const searchable = normalize([
      person.public_name,
      person.locality,
      person.province,
      person.area,
      ...(person.disciplines || [])
    ].join(' '));

    return matchesArea && matchesPlace && searchable.includes(term);
  });

  count.textContent = `${filtered.length} perfiles encontrados`;

  if (!filtered.length) {
    directory.className = 'empty-state';
    directory.replaceChildren();

    addText(directory, 'div', 'empty-icon', '✳');
    addText(directory, 'h3', '',
      professionals.length
        ? 'No encontramos resultados con esos filtros.'
        : 'Estamos preparando este espacio para vos.');
    addText(directory, 'p', '',
      professionals.length
        ? 'Probá con otra disciplina o localidad.'
        : 'Muy pronto vas a poder explorar los perfiles aprobados de Santa Fe.');

    const link = document.createElement('a');
    link.href = '#sumate';
    link.className = 'text-link';
    link.textContent = 'Sumá tu propuesta →';
    directory.appendChild(link);
    return;
  }

  directory.className = 'directory-grid';
  directory.replaceChildren();

  filtered.forEach(person => {
    directory.appendChild(createCard(person));
  });
}

async function loadProfessionals() {
  directory.className = 'empty-state';
  directory.textContent = 'Cargando profesionales y espacios...';

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    const data = await response.json();
    professionals = Array.isArray(data.professionals)
      ? data.professionals
      : [];

    updateLocalities();
    renderDirectory();

  } catch (error) {
    console.error('Error al cargar la Guía:', error);

    directory.className = 'empty-state';
    directory.replaceChildren();
    addText(directory, 'div', 'empty-icon', '✳');
    addText(directory, 'h3', '',
      'No pudimos cargar la Guía en este momento.');
    addText(directory, 'p', '',
      'Por favor, intentá nuevamente más tarde.');
  }
}

document.querySelector('#searchBtn')
  ?.addEventListener('click', renderDirectory);

search?.addEventListener('keydown', event => {
  if (event.key === 'Enter') renderDirectory();
});

area?.addEventListener('change', renderDirectory);
localidad?.addEventListener('change', renderDirectory);

loadProfessionals();
