/* Escena del hero: parallax por capas (cursor + scroll), polvo ambiental, entrada del título, menú activo. */
const sceneEl=$('#home'),still0=matchMedia('(prefers-reduced-motion:reduce)').matches;
const ttl=$('#ttl');function setTtl(){const t=T[L].ttl;ttl.setAttribute('aria-label',t);ttl.innerHTML=[...t].map((c,i)=>`<span aria-hidden="true" style="--i:${i}">${c===' '?'&nbsp;':c}</span>`).join('')}
document.addEventListener('langchange',setTtl);setTtl();
const go0=()=>document.body.classList.add('go');if(!$('#intro'))go0();else $('#start').addEventListener('click',()=>setTimeout(go0,350));
const pls=[...document.querySelectorAll('.pl')];let pmx=0,pmy=0,tx=0,ty=0,svis=true;
addEventListener('pointermove',e=>{tx=e.clientX/innerWidth*2-1;ty=e.clientY/innerHeight*2-1},{passive:true});
new IntersectionObserver(e=>svis=e[0].isIntersecting).observe(sceneEl);
/* polvo */
const dc=$('#dust'),dctx=dc.getContext('2d'),spr=document.createElement('canvas');spr.width=spr.height=32;
{const g=spr.getContext('2d'),gr=g.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,32,32)}
const COL=['#FFB45E','#FF713B','#F2EDF2'],DUST=Array.from({length:70},(_,i)=>({x:Math.random(),y:Math.random(),r:Math.random()*5+2,v:Math.random()*.00018+.00005,w:Math.random()*.00006,p:Math.random()*6.3,c:COL[i%3],z:Math.random()}));
function sizeDust(){dc.width=sceneEl.clientWidth;dc.height=sceneEl.clientHeight}addEventListener('resize',sizeDust);sizeDust();
function frame(t){requestAnimationFrame(frame);if(!svis)return;const sy=scrollY;
 pmx+=(tx-pmx)*.06;pmy+=(ty-pmy)*.06;
 if(!still0){pls.forEach(p=>{const d=+p.dataset.d;p.style.transform=`translate3d(${-pmx*d*46}px,${-pmy*d*20+sy*d*.45}px,0) scale(1.04)`});
  $('.ttl').style.transform=`translate3d(${pmx*-8}px,${sy*.25}px,0)`;$('.ttl').style.opacity=Math.max(0,1-sy/(innerHeight*.7))}
 dctx.clearRect(0,0,dc.width,dc.height);DUST.forEach(q=>{q.x-=q.v*(1+q.z*2)*16;q.y+=Math.sin(t*.0004+q.p)*q.w*16;if(q.x<-.02){q.x=1.02;q.y=Math.random()}
  dctx.globalAlpha=(.25+.5*Math.abs(Math.sin(t*.0008+q.p)))*(.4+q.z*.6);dctx.drawImage(spr,q.x*dc.width-q.r*(pmx*8),q.y*dc.height,q.r*(2+q.z*3),q.r*(2+q.z*3))});dctx.globalAlpha=1}
requestAnimationFrame(frame);
/* menú: sección activa */
const links=[...document.querySelectorAll('nav a')],secs=links.map(a=>document.querySelector(a.getAttribute('href')));
addEventListener('scroll',()=>document.querySelector('header').classList.toggle('solid',scrollY>40),{passive:true});
