/* Navegación por pestañas: cada opción del menú muestra SOLO su sección (sin scroll entre secciones). Ruta = #id, el botón Atrás funciona.
   Orden del menú: Mission Control · Systems · Mars Globe · Survival Protocol · Mars Atlas · Route Planner · Rover Exploration · Mission Report · Mission Sim · Survival Guide · Scientific Data */
(function(){const ids=['home','systems','globe','astro','atlas','route','rovers','report','sim','guide','data'],
 KEY={home:'n0',systems:'nsys',globe:'nglobe',astro:'n2',atlas:'n1',route:'nroute',rovers:'nrov',report:'nrep',sim:'nsim',guide:'nguide',data:'n4'},
 secs=ids.map(i=>document.getElementById(i)).filter(Boolean),links=[...document.querySelectorAll('#mainnav a')],bg=document.getElementById('burger'),hd=document.querySelector('header');
 let cur='home';
 const title=()=>{document.title=T[L][KEY[cur]]+' · SPARTANS II'};
 function show(id){if(!ids.includes(id))id='home';cur=id;secs.forEach(s=>s.classList.toggle('view',s.id===id));
  links.forEach(a=>{const on=a.getAttribute('href')==='#'+id;a.classList.toggle('act',on);a.classList.toggle('on',on);on?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')});
  document.body.dataset.view=id;document.body.classList.remove('menu');bg&&bg.setAttribute('aria-expanded','false');title();
  scrollTo(0,0);hh();if(id==='guide'){const f=document.getElementById('guideframe');f&&f.contentWindow&&f.contentWindow.postMessage({type:'guide-lang',lang:L},location.origin)}requestAnimationFrame(()=>dispatchEvent(new Event('resize')))}
 /* si el menú no cabe en una línea (los nombres en español son más largos), pasa al modo hamburguesa */
 function hh(){document.documentElement.style.setProperty('--hh',(hd.offsetHeight||64)+'px')}
 function fitNav(){document.body.classList.remove('navc');hh();if(innerWidth>1400&&hd.scrollWidth>hd.clientWidth+1)document.body.classList.add('navc')}
 addEventListener('hashchange',()=>show(location.hash.slice(1)));
 document.addEventListener('langchange',()=>{title();fitNav()});addEventListener('resize',fitNav);document.fonts&&document.fonts.ready.then(fitNav);
 const o=Element.prototype.scrollIntoView;Element.prototype.scrollIntoView=function(a){const s=this.closest&&this.closest('main>section');if(s&&!s.classList.contains('view'))show(s.id);else o.call(this,a)};
 bg&&bg.addEventListener('click',()=>{const on=document.body.classList.toggle('menu');bg.setAttribute('aria-expanded',on)});
 addEventListener('keydown',e=>{if(e.key==='Escape')document.body.classList.remove('menu')});
 window.openTab=show;show(location.hash.slice(1));fitNav()})();
