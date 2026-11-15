/* Tarjetas 3D (carrusel, volteo, inclinación con cursor) y sección de rovers. */
const CARDS=[
{id:'terrain',tag:'MOLA · MGS',to:'#atlas',src:'pds-geo',es:['TERRENO MARCIANO','Altimetría láser global (MOLA, Mars Global Surveyor): base de la topografía marciana. Las capas de elevación y relieve del atlas imitan este tipo de dato (aquí simulado).','Abrir atlas'],en:['MARS TERRAIN','Global laser altimetry (MOLA on Mars Global Surveyor) underpins Martian topography. The atlas elevation and relief layers mimic this kind of data (simulated here).','Open atlas']},
{id:'thermal',tag:'TES · MGS',to:'#data',src:'pds-geo',es:['ANÁLISIS TÉRMICO','El espectrómetro TES mide variaciones de temperatura de la superficie y la atmósfera. Los productos reales están en el PDS; este módulo aún no los procesa.','Ver fuentes'],en:['THERMAL ANALYSIS','The TES spectrometer measures surface and atmospheric temperature variations. Real products live in the PDS; this module does not process them yet.','View sources']},
{id:'geology',tag:'HiRISE · THEMIS',to:'#data',src:'hirise',es:['EXPLORACIÓN GEOLÓGICA','HiRISE fotografía el terreno a escala submétrica y THEMIS aporta propiedades térmicas y visibles que revelan el carácter del suelo.','Ver fuentes'],en:['GEOLOGICAL EXPLORATION','HiRISE images terrain at sub-metre scale and THEMIS adds thermal and visible properties that reveal ground character.','View sources']},
{id:'subsurface',tag:'MARSIS · SHARAD',to:'#data',src:'psa',es:['ANÁLISIS DEL SUBSUELO','Los radares sondean bajo la superficie para detectar depósitos en capas y posible hielo. MARSIS voló en Mars Express (ESA).','Ver fuentes'],en:['SUBSURFACE ANALYSIS','Radar sounders probe below the surface to detect layered deposits and possible ice. MARSIS flew on Mars Express (ESA).','View sources']},
{id:'route',tag:'ROUTE PLANNER',to:'#route',es:['RUTA DE MISIÓN','Planificar rutas exige pendiente y riesgo calculados con un DEM real. Por ahora puedes probar un descenso con gravedad marciana (3.71 m/s²) en el simulador.','Abrir planificador'],en:['MISSION ROUTE','Route planning needs slope and hazard derived from a real DEM. For now, test a descent under Martian gravity (3.71 m/s²) in the simulator.','Open route planner']},
{id:'health',tag:'SURVIVAL PROTOCOL',to:'#astro',es:['SALUD DEL ASTRONAUTA','Estima oxígeno, agua y energía a partir de peso, altura, sexo, edad y actividad.','Abrir calculador'],en:['ASTRONAUT HEALTH','Estimate oxygen, water and energy from weight, height, sex, age and activity.','Open calculator']}];
const ROVERS=[{img:'rover-perseverance',site:0,es:['Perseverance','Aterrizó en el cráter Jezero el 18 de febrero de 2021. Lleva MOXIE (oxígeno a partir del CO₂ marciano), PIXL, SHERLOC, SuperCam y MEDA.','Ver Jezero en el atlas'],en:['Perseverance','Landed in Jezero Crater on 18 February 2021. Carries MOXIE (oxygen from Martian CO₂), PIXL, SHERLOC, SuperCam and MEDA.','Show Jezero on the atlas']},
{img:'rover-curiosity',site:1,es:['Curiosity','Aterrizó en el cráter Gale en agosto de 2012. Lleva ChemCam, CheMin, SAM, REMS y RAD, entre otros.','Ver Gale en el atlas'],en:['Curiosity','Landed in Gale Crater in August 2012. Carries ChemCam, CheMin, SAM, REMS and RAD, among others.','Show Gale on the atlas']}];
const TG={'ROUTE PLANNER':'PLANIFICADOR DE RUTAS','SURVIVAL PROTOCOL':'PROTOCOLO DE SUPERVIVENCIA'},tg=c=>L==='es'&&TG[c.tag]||c.tag;
let cur=0;const deck=$('#deck'),N=CARDS.length,still=matchMedia('(prefers-reduced-motion:reduce)').matches;
function buildDeck(){const t=L;deck.innerHTML=CARDS.map((c,i)=>{const d=c[t],s=SOURCES.find(x=>x.id===c.src);
 return `<article class="card3d" data-n="${i}" aria-label="${d[0]}"><div class="tilt"><div class="inner"><div class="face front"><img src="assets/img/card-${c.id}.svg" alt=""><div class="cap"><small class="mono">${tg(c)}</small><h3>${d[0]}</h3></div><i class="gem a"></i><i class="gem b"></i><span class="glare"></span></div>
 <div class="face back"><small class="mono">${tg(c)}</small><h3>${d[0]}</h3><p>${d[1]}</p><a class="btn" href="${c.to}">${d[2]}</a>${s?`<a class="lnk mono" target="_blank" rel="noopener" href="${s.url}">${s.name} ↗</a>`:''}<i class="gem a"></i><i class="gem b"></i></div></div></div></article>`}).join('');
 $('#dots').innerHTML=CARDS.map((c,i)=>`<button data-n="${i}" aria-label="${c[t][0]}"></button>`).join('');
 deck.querySelectorAll('.card3d').forEach(el=>{el.onclick=e=>{const n=+el.dataset.n;
  /* Cara trasera: el hit-test 3D del navegador a veces entrega el clic a la tarjeta y no al botón; se resuelve por coordenadas. */
  if(n===cur&&el.classList.contains('flip')){const a=[...el.querySelectorAll('.face.back a')].find(a=>{const r=a.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom});
   if(a){e.preventDefault();if(a.target==='_blank')window.open(a.href,'_blank','noopener');else location.hash=a.getAttribute('href');return}}
  if(e.target.closest&&e.target.closest('a'))return;
  if(n===cur)el.classList.toggle('flip');else go(n)}});
 $('#dots').querySelectorAll('button').forEach(b=>b.onclick=()=>go(+b.dataset.n));place()}
function place(){deck.querySelectorAll('.card3d').forEach(el=>{const n=+el.dataset.n;let o=((n-cur)%N+N)%N;if(o>N/2)o-=N;el.style.setProperty('--o',o);el.style.setProperty('--a',Math.abs(o));
 el.classList.toggle('vis',Math.abs(o)<=1);el.classList.toggle('act',o===0);if(o!==0)el.classList.remove('flip');el.tabIndex=o===0?0:-1;el.style.zIndex=10-Math.abs(o)});
 $('#dots').querySelectorAll('button').forEach((b,i)=>b.classList.toggle('on',i===cur))}
function go(n){cur=(n+N)%N;place()}
$('#dprev').onclick=()=>go(cur-1);$('#dnext').onclick=()=>go(cur+1);
deck.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')go(cur-1);else if(e.key==='ArrowRight')go(cur+1);else if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('act')){e.preventDefault();e.target.classList.toggle('flip')}});
let swx=null;deck.addEventListener('pointerdown',e=>swx=e.clientX);deck.addEventListener('pointerup',e=>{if(swx!==null&&Math.abs(e.clientX-swx)>55){e.preventDefault();go(cur+(e.clientX<swx?1:-1))}swx=null});
/* inclinación según cursor */
deck.addEventListener('pointermove',e=>{if(still)return;const el=e.target.closest('.card3d.act');deck.querySelectorAll('.card3d.act').forEach(c=>{if(c!==el){c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg')}});if(!el)return;
 const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.setProperty('--ry',(x*16)+'deg');el.style.setProperty('--rx',(-y*16)+'deg');el.style.setProperty('--gx',(x+.5)*100+'%');el.style.setProperty('--gy',(y+.5)*100+'%')});
deck.addEventListener('pointerleave',()=>deck.querySelectorAll('.card3d').forEach(c=>{c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg')}));
/* rovers */
function buildRovers(){$('#rovs').innerHTML=ROVERS.map((r,i)=>{const d=r[L];return `<article class="hud rov rv in"><img src="assets/img/${r.img}.svg" alt="${d[0]}"><div><h3>${d[0]}</h3><p>${d[1]}</p><button class="btn" data-s="${r.site}">${d[2]}</button></div></article>`}).join('');
 $('#rovs').querySelectorAll('button').forEach(b=>b.onclick=()=>{const i=+b.dataset.s,s=SITES[i];sel=i;gt.value=i;fly(s[1],s[2],18);info();kick();document.getElementById('atlas').scrollIntoView({behavior:still?'auto':'smooth'})})}
document.addEventListener('langchange',()=>{buildDeck();buildRovers()});buildDeck();buildRovers();
