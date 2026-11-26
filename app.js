const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('.main-nav');
menuButton?.addEventListener('click',()=>{const opened=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(opened));menuButton.textContent=opened?'×':'☰'});
document.querySelector('#year').textContent=new Date().getFullYear();
// La búsqueda se conectará al catálogo aprobado cuando esté disponible el backend de la Guía.
const search=document.querySelector('#search');
const area=document.querySelector('#area');
const localidad=document.querySelector('#localidad');
function announceSearch(){
  const directory=document.querySelector('#directory');
  directory.innerHTML='<div class="empty-icon">✳</div><h3>Estamos preparando este espacio para vos.</h3><p>La búsqueda estará disponible cuando se incorporen los primeros perfiles aprobados.</p><a href="#sumate" class="text-link">Sumá tu propuesta →</a>';
}
document.querySelector('#searchBtn')?.addEventListener('click',announceSearch);
search?.addEventListener('keydown',event=>{if(event.key==='Enter')announceSearch()});
