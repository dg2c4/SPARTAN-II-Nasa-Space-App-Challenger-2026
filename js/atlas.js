/* Atlas: terreno procedural. PARA DATOS REALES: sustituye E[] por un DEM MOLA procesado (ver README). */
const W=720,H=360;let seed=7;const R=()=>(seed=(seed*16807)%2147483647)/2147483647;
const hv=(x,y)=>{let n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)};
function vn(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return hv(xi,yi)*(1-u)*(1-v)+hv(xi+1,yi)*u*(1-v)+hv(xi,yi+1)*(1-u)*v+hv(xi+1,yi+1)*u*v}
const fbm=(x,y)=>{let s=0,a=.5,f=1;for(let i=0;i<5;i++){s+=a*vn(x*f,y*f);a/=2;f*=2}return s};
const dl=(a,b)=>{let d=Math.abs(a-b);return d>180?360-d:d};
const g=(la,lo,a,b,r)=>Math.exp(-((la-a)**2+dl(lo,b)**2)/(r*r));
const SITES=[["Jezero · Perseverance",18.4,77.5,"Mars 2020"],["Gale · Curiosity",-5.4,137.8,"MSL"],["Olympus Mons",18.65,-133.8,"MOLA"],["Valles Marineris",-14,-59,"MOLA"],["Elysium · InSight",4.5,135.6,"InSight"],["Hellas Planitia",-42.7,70,"MOLA"],["Viking 1",22.3,-47.9,"Viking"],["Viking 2",48.3,-134.3,"Viking"],["Meridiani · Opportunity",-1.95,-5.5,"MER"],["Gusev · Spirit",-14.57,175.5,"MER"]];
const CR=Array.from({length:70},()=>[R()*160-80,R()*360-180,1+R()*3.5,.1+R()*.2]);
const E=new Float32Array(W*H);let mn=9,mx=-9;
for(let j=0;j<H;j++)for(let i=0;i<W;i++){const lo=i/W*360-180,la=90-j/H*180;let e=-la/90*.3+fbm(i/40,j/40)*.4;
 e+=g(la,lo,18.6,-134,6)*1.1+g(la,lo,0,-105,20)*.45-g(la,lo,-42,70,14)*.9-g(la,lo,-50,-43,8)*.4;
 e-=.45*Math.exp(-(((la+10)/1.8)**2))*(lo>-90&&lo<-45?1:0);
 for(const c of CR){const d=Math.hypot(la-c[0],dl(lo,c[1]));if(d<c[2]*1.4)e+=(d<c[2]?-c[3]*(1-d/c[2]*.4):c[3]*.3*(1.4-d/c[2]))*.5}
 E[j*W+i]=e;if(e<mn)mn=e;if(e>mx)mx=e}
for(let k=0;k<E.length;k++)E[k]=(E[k]-mn)/(mx-mn);
let REAL=false,EK0=-10.64,ESP=28;const hmKm=e=>EK0+e*ESP,press=e=>610*Math.exp(-hmKm(e)/11.1),iceF=la=>Math.min(1,Math.max(0,(Math.abs(la)-40)/35));
const ramp=(t,st)=>{t=Math.min(.999,Math.max(0,t))*(st.length-1);const i=Math.floor(t),f=t-i,a=st[i],b=st[i+1];return a.map((v,k)=>v+(b[k]-v)*f)};
const ELEV=[[40,20,90],[30,80,160],[70,150,150],[190,170,90],[200,100,50],[240,220,210]],O2R=[[10,10,40],[90,20,120],[220,60,60],[255,200,60],[255,255,200]],ICER=[[30,20,20],[60,90,120],[150,210,240],[255,255,255]];

/* ===== Vista tipo Google Maps: zoom +/-, arrastre con inercia, pinch, doble clic, mundo continuo en longitud ===== */
const off=document.createElement('canvas');off.width=W;off.height=H;   /* textura base (la usa el globo 3D) */
function buildOff(){const c=off.getContext('2d'),im0=c.createImageData(W,H);for(let j=0;j<H;j++)for(let i=0;i<W;i++){const k=j*W+i,e=E[k],sh=((E[k+1]||e)-e+((E[k+W]||e)-e))*14,col=ramp(e,ELEV),p=k*4,s=1+sh*.6;im0.data[p]=col[0]*s;im0.data[p+1]=col[1]*s;im0.data[p+2]=col[2]*s;im0.data[p+3]=255}c.putImageData(im0,0,0)}buildOff();
const cv=$('#map'),cx=cv.getContext('2d'),buf=document.createElement('canvas'),bx=buf.getContext('2d');
const mkLut=st=>Array.from({length:256},(_,i)=>ramp(i/255,st)),LUT=[mkLut(ELEV),null,mkLut(O2R),mkLut(ICER)];
const pts=new Map();
let layer=0,sel=null,cLon=0,cLat=0,ppd=2,zt=null,za=null,fl=null,vel={x:0,y:0},dirty=true,low=false,running=false,idleT,cw=300,ch=300,dpr=1,hb,im,inited=0,moved=0,pinch=null,lastMove=0;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),wrap=l=>((l+180)%360+360)%360-180,MAXZ=70,minZ=()=>Math.max(ch/180,1e-3),fmt=v=>(Math.round(v*100)/100)+'°';
const geo=(px,py)=>({lo:cLon+(px-cw/2)/ppd,la:cLat-(py-ch/2)/ppd});
function kick(){dirty=true;if(!running){running=true;requestAnimationFrame(tick)}}
const draw=kick;
function view(){ppd=clamp(ppd,minZ(),MAXZ);const hh=ch/2/ppd;cLat=hh>=90?0:clamp(cLat,-90+hh,90-hh);cLon=wrap(cLon)}
function zoomBy(f,px=cw/2,py=ch/2){const g=geo(px,py);za={px,py,la:g.la,lo:g.lo};zt=clamp((zt||ppd)*f,minZ(),MAXZ);fl=null;low=true;kick()}
function fly(la,lo,z){fl={la,lo,z:clamp(z,minZ(),MAXZ)};zt=null;low=true;kick()}
function tick(){let busy=false;
 if(zt!==null){const d=zt-ppd;if(Math.abs(d)<ppd*.002){ppd=zt;zt=null}else ppd+=d*.22;cLon=za.lo-(za.px-cw/2)/ppd;cLat=za.la+(za.py-ch/2)/ppd;busy=true}
 if(fl){const dl=wrap(fl.lo-cLon);ppd*=Math.pow(fl.z/ppd,.12);cLon+=dl*.12;cLat+=(fl.la-cLat)*.12;busy=true;if(Math.abs(dl)*ppd<.5&&Math.abs(fl.la-cLat)*ppd<.5&&Math.abs(Math.log(fl.z/ppd))<.01)fl=null}
 if(!pts.size&&(Math.abs(vel.x)>.05||Math.abs(vel.y)>.05)){cLon-=vel.x/ppd;cLat+=vel.y/ppd;vel.x*=.93;vel.y*=.93;busy=true}
 view();
 if(dirty||busy){render(low?420:1100);paint();dirty=false}
 if(busy||pts.size){clearTimeout(idleT);low=true;idleT=setTimeout(()=>{low=false;kick()},150)}
 if(busy||dirty)requestAnimationFrame(tick);else running=false}
function render(maxW){const f=Math.min(1,maxW/cw),rw=Math.max(2,Math.round(cw*f)),rh=Math.max(2,Math.round(ch*f));
 if(buf.width!==rw||buf.height!==rh){buf.width=rw;buf.height=rh;hb=new Float32Array(rw*rh);im=bx.createImageData(rw,rh)}
 const k=ppd*f,dw=clamp((Math.log2(ppd)-1)/3.5,0,1),d=im.data,L0=LUT[layer],sk=5*k;
 for(let j=0;j<rh;j++){const la=cLat-(j-rh/2)/k,fy=clamp((90-la)/180*H-.5,0,H-1.001),j0=fy|0,ty=fy-j0;
  for(let i=0;i<rw;i++){const lo=((cLon+(i-rw/2)/k+180)%360+360)%360,fx=lo/360*W-.5,i0=Math.floor(fx),tx=fx-i0,a=(i0+W)%W,b=(a+1)%W,
   e=(E[j0*W+a]*(1-tx)+E[j0*W+b]*tx)*(1-ty)+(E[(j0+1)*W+a]*(1-tx)+E[(j0+1)*W+b]*tx)*ty;
   hb[j*rw+i]=dw>0?e+((vn(lo*5,la*5)-.5)*.03+(vn(lo*24,la*24)-.5)*.012+(vn(lo*90,la*90)-.5)*.004)*dw:e}}
 for(let j=0;j<rh;j++){const la=cLat-(j-rh/2)/k;
  for(let i=0;i<rw;i++){const p=j*rw+i,e=hb[p],sh=clamp(((hb[p+(i<rw-1?1:0)]-e)+(hb[p+(j<rh-1?rw:0)]-e))*sk,-1.2,1.2),s=1+sh*.6;let r,g,b,c;
   if(layer===0){c=L0[clamp(e*255,0,255)|0];r=c[0]*s;g=c[1]*s;b=c[2]*s}
   else if(layer===1){const v=150+sh*70+e*50;r=v*1.1;g=v*.62;b=v*.4}
   else if(layer===2){c=L0[clamp(610*Math.exp(-(e-.38)*28/11.1)/1000*1.2*255,0,255)|0];r=c[0]*s;g=c[1]*s;b=c[2]*s}
   else{const lo=cLon+(i-rw/2)/k;c=L0[clamp(iceF(la)*(.6+.4*vn(lo/9,la/9))*255,0,255)|0];r=c[0]*s;g=c[1]*s;b=c[2]*s}
   const q=p*4;d[q]=r;d[q+1]=g;d[q+2]=b;d[q+3]=255}}
 bx.putImageData(im,0,0)}
function paint(){cx.setTransform(dpr,0,0,dpr,0,0);cx.imageSmoothingEnabled=true;cx.drawImage(buf,0,0,cw,ch);grat();marks();if(typeof routeDraw==='function')routeDraw();scaleBar()}
function grat(){const S=[90,45,30,15,10,5,2,1,.5,.2,.1,.05],st=S.find(s=>s*ppd>=90)||.05;
 cx.strokeStyle='rgba(244,241,238,.18)';cx.fillStyle='rgba(244,241,238,.7)';cx.font='11px IBM Plex Mono,monospace';cx.lineWidth=1;cx.beginPath();
 const l0=cLon-cw/2/ppd,l1=cLon+cw/2/ppd,t0=cLat-ch/2/ppd,t1=cLat+ch/2/ppd;
 for(let lo=Math.ceil(l0/st)*st;lo<=l1;lo+=st){const x=cw/2+(lo-cLon)*ppd;cx.moveTo(x,0);cx.lineTo(x,ch);cx.fillText(fmt(wrap(lo)),x+3,12)}
 for(let la=Math.ceil(t0/st)*st;la<=t1;la+=st){const y=ch/2-(la-cLat)*ppd;cx.moveTo(0,y);cx.lineTo(cw,y);cx.fillText(fmt(la),3,y-3)}cx.stroke()}
const spos=s=>[cw/2+wrap(s[2]-cLon)*ppd,ch/2-(s[1]-cLat)*ppd];
function marks(){SITES.forEach((s,i)=>{const p=spos(s);for(const o of[-1,0,1]){const x=p[0]+o*360*ppd,y=p[1];if(x<-40||x>cw+40||y<-20||y>ch+20)continue;
 cx.beginPath();cx.arc(x,y,i===sel?8:5,0,7);cx.fillStyle=i===sel?'#F4F1EE':'#FF7A45';cx.fill();cx.strokeStyle='#08090D';cx.lineWidth=2;cx.stroke();
 if(ppd>3||i===sel){cx.font='600 13px IBM Plex Sans,sans-serif';cx.lineWidth=3;cx.strokeText(s[0],x+11,y+4);cx.fillStyle='#F4F1EE';cx.fillText(s[0],x+11,y+4)}}})}
function scaleBar(){const kpp=59.29/ppd,n=[.5,1,2,5,10,20,50,100,200,500,1000,2000,5000].find(v=>v/kpp>=70)||5000,w=n/kpp;
 cx.strokeStyle='#F4F1EE';cx.lineWidth=2;cx.beginPath();cx.moveTo(cw-14-w,ch-14);cx.lineTo(cw-14-w,ch-8);cx.lineTo(cw-14,ch-8);cx.lineTo(cw-14,ch-14);cx.stroke();
 cx.fillStyle='#F4F1EE';cx.font='11px IBM Plex Mono,monospace';cx.textAlign='right';cx.fillText(n+' '+lg('km (ec.)','km (eq.)'),cw-14,ch-18);cx.textAlign='left'}
function val(la,lo){const i=Math.min(W-1,Math.max(0,Math.floor((lo+180)/360*W))),j=Math.min(H-1,Math.max(0,Math.floor((90-la)/180*H))),e=E[j*W+i];return{km:hmKm(e),o2:press(e)*.0013,ice:iceF(la)}}
function hover(px,py){const g=geo(px,py);if(Math.abs(g.la)<=90){const v=val(g.la,wrap(g.lo));$('#hud').textContent=`${g.la.toFixed(2)}° ${wrap(g.lo).toFixed(2)}° · ${v.km.toFixed(1)} km · O₂ ${v.o2.toFixed(2)} Pa · z${Math.log2(ppd/minZ()).toFixed(1)}`}}
const gt=$('#goto');
function info(){const t=T[L];if(sel===null){$('#info').textContent=t.atlasd;return}const s=SITES[sel],v=val(s[1],s[2]);
 $('#info').innerHTML=`<b>${s[0]}</b><br><small>${s[3]} · ${s[1]}°, ${s[2]}°</small><br>${t.el}: <b>${v.km.toFixed(1)} km</b> · ${t.o2}: <b>${v.o2.toFixed(2)} Pa</b> · ${t.ice}: <b>${Math.round(v.ice*100)}%</b>`}
function layers(){badge();const t=T[L];$('#layers').innerHTML=t.ly.map((n,i)=>`<button class="${i===layer?'on':''}" data-y="${i}">${n}</button>`).join('');
 document.querySelectorAll('[data-y]').forEach(b=>b.onclick=()=>{layer=+b.dataset.y;layers();kick()});
 gt.innerHTML=`<option value="">${t.goto}</option>`+SITES.map((s,i)=>`<option value="${i}">${s[0]}</option>`).join('');gt.value=sel===null?'':sel;
 [['zin','zin'],['zout','zout'],['zhome','zhome'],['zfs','zfs']].forEach(([id,k])=>{$('#'+id).title=$('#'+id).ariaLabel=t[k]})}
gt.onchange=()=>{if(gt.value==='')return;sel=+gt.value;const s=SITES[sel];fly(s[1],s[2],Math.max(ppd,14));info();kick()};
function pick(px,py){if(typeof routePick==='function'&&routePick(px,py))return;let b=null,bd=22;SITES.forEach((s,i)=>{const p=spos(s);for(const o of[-1,0,1]){const dd=Math.hypot(p[0]+o*360*ppd-px,p[1]-py);if(dd<bd){bd=dd;b=i}}});sel=b;gt.value=b===null?'':b;info();kick()}
/* ---- gestos ---- */
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);cv.focus({preventScroll:true});pts.set(e.pointerId,[e.clientX,e.clientY]);moved=0;fl=null;zt=null;vel={x:0,y:0};
 if(pts.size===2){const[a,b]=[...pts.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1])||1,p:ppd}}kick()});
cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top;hover(px,py);if(!pts.has(e.pointerId))return;
 const o=pts.get(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);lastMove=performance.now();
 if(pts.size===1){const dx=e.clientX-o[0],dy=e.clientY-o[1];moved+=Math.abs(dx)+Math.abs(dy);cLon-=dx/ppd;cLat+=dy/ppd;vel={x:vel.x*.5+dx*.5,y:vel.y*.5+dy*.5}}
 else if(pts.size===2&&pinch){const[a,b]=[...pts.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]),mx=(a[0]+b[0])/2-r.left,my=(a[1]+b[1])/2-r.top,g=geo(mx,my);ppd=clamp(pinch.p*d/pinch.d,minZ(),MAXZ);cLon=g.lo-(mx-cw/2)/ppd;cLat=g.la+(my-ch/2)/ppd;moved=99}
 low=true;kick()});
cv.addEventListener('pointerup',e=>{const r=cv.getBoundingClientRect();pts.delete(e.pointerId);if(pts.size<2)pinch=null;if(performance.now()-lastMove>80)vel={x:0,y:0};
 if(moved<6&&!pts.size)pick(e.clientX-r.left,e.clientY-r.top);kick()});
cv.addEventListener('pointercancel',e=>{pts.delete(e.pointerId);pinch=null});
cv.addEventListener('wheel',e=>{e.preventDefault();const r=cv.getBoundingClientRect();zoomBy(Math.exp(-e.deltaY*(e.ctrlKey?.01:.002)),e.clientX-r.left,e.clientY-r.top)},{passive:false});
cv.addEventListener('dblclick',e=>{const r=cv.getBoundingClientRect();zoomBy(2,e.clientX-r.left,e.clientY-r.top)});
cv.addEventListener('keydown',e=>{const k=e.key,m=60/ppd;if(k==='+'||k==='=')zoomBy(1.6);else if(k==='-'||k==='_')zoomBy(1/1.6);else if(k==='ArrowLeft')cLon-=m;else if(k==='ArrowRight')cLon+=m;else if(k==='ArrowUp')cLat+=m;else if(k==='ArrowDown')cLat-=m;else return;e.preventDefault();kick()});
const home=()=>fly(0,0,Math.max(cw/360,ch/180));
$('#zin').onclick=()=>zoomBy(1.8);$('#zout').onclick=()=>zoomBy(1/1.8);$('#zhome').onclick=home;
const fsEl=$('#mapwrap');if(!fsEl.requestFullscreen)$('#zfs').style.display='none';
$('#zfs').onclick=()=>document.fullscreenElement?document.exitFullscreen():fsEl.requestFullscreen();
new ResizeObserver(()=>{const r=fsEl.getBoundingClientRect();cw=Math.max(100,r.width);ch=Math.max(100,r.height);dpr=Math.min(devicePixelRatio||1,2);cv.width=Math.round(cw*dpr);cv.height=Math.round(ch*dpr);
 if(!inited){ppd=Math.max(cw/360,ch/180);inited=1}kick()}).observe(fsEl);
document.addEventListener('langchange',()=>{layers();info()});

/* ===== Origen de los datos (honesto): DEM real MOLA si existe data/mola_720x360.json; si no, procedural SIMULADO ===== */
function badge(){const b=$('#dsrc');if(!b)return;const real=REAL&&layer===0;b.className='chip '+(real?'real':'sim');
 b.textContent=real?lg('DATOS REALES · MOLA (DEM procesado)','REAL DATA · MOLA (processed DEM)'):(REAL?lg('DERIVADO / SIMULADO sobre DEM MOLA real','DERIVED / SIMULATED over real MOLA DEM'):lg('DATOS SIMULADOS · terreno procedural','SIMULATED DATA · procedural terrain'));
 b.title=REAL?lg('Elevación y pendientes: MOLA. Térmica, O₂ y hielo siguen siendo modelos simples, no productos THEMIS/TES/SHARAD.','Elevation and slopes: MOLA. Thermal, O₂ and ice remain simple models, not THEMIS/TES/SHARAD products.'):lg('No se encontró data/mola_720x360.json. Ejecuta tools/make_dem.py (ver README).','data/mola_720x360.json not found. Run tools/make_dem.py (see README).')}
fetch('data/mola_720x360.json').then(r=>r.ok?r.json():Promise.reject()).then(j=>{
 if(j.w!==W||j.h!==H||!j.e||j.e.length!==W*H)throw 0;
 for(let k=0;k<E.length;k++)E[k]=j.e[k];EK0=j.km0;ESP=j.span;REAL=true;buildOff();
 document.dispatchEvent(new Event('demloaded'));badge();info();kick()}).catch(()=>{badge()});
