import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const cv=document.getElementById('mars3d'),host=cv.parentElement,still=matchMedia('(prefers-reduced-motion:reduce)').matches;
const rd=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:'high-performance'});
rd.setPixelRatio(Math.min(devicePixelRatio,2));rd.toneMapping=THREE.ACESFilmicToneMapping;rd.toneMappingExposure=1.18;
const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(38,1,.1,100);cam.position.set(0,.25,7.1);
const tc=document.createElement('canvas');tc.width=1024;tc.height=512;const tx=tc.getContext('2d');
function paintMarsTex(){tx.globalCompositeOperation='source-over';tx.drawImage(off,0,0,1024,512);tx.globalCompositeOperation='multiply';tx.fillStyle='#e88b5a';tx.fillRect(0,0,1024,512);
 tx.globalCompositeOperation='screen';const g=tx.createLinearGradient(0,0,0,512);g.addColorStop(0,'rgba(255,220,190,.22)');g.addColorStop(.5,'rgba(255,115,55,.18)');g.addColorStop(1,'rgba(255,220,190,.22)');tx.fillStyle=g;tx.fillRect(0,0,1024,512);tx.globalCompositeOperation='source-over'}
paintMarsTex();const tex=new THREE.CanvasTexture(tc);tex.colorSpace=THREE.SRGBColorSpace;
document.addEventListener('demloaded',()=>{paintMarsTex();tex.needsUpdate=true});
const mars=new THREE.Mesh(new THREE.SphereGeometry(2.15,112,112),new THREE.MeshStandardMaterial({map:tex,bumpMap:tex,bumpScale:.085,roughness:.88,metalness:.04,emissive:new THREE.Color(0x3a1106),emissiveIntensity:.35}));sc.add(mars);
const VS='varying vec3 n;void main(){n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
const glow=(r,side,fs)=>new THREE.Mesh(new THREE.SphereGeometry(r,72,72),new THREE.ShaderMaterial({transparent:true,side,blending:THREE.AdditiveBlending,depthWrite:false,vertexShader:VS,fragmentShader:fs}));
const atm=glow(2.34,THREE.BackSide,'varying vec3 n;void main(){float i=pow(0.76-dot(n,vec3(0.,0.,1.)),2.8);gl_FragColor=vec4(1.0,.44,.18,1.)*i*1.35;}');
const rim=glow(2.165,THREE.FrontSide,'varying vec3 n;void main(){float f=pow(1.-max(0.,dot(n,vec3(0.,0.,1.))),3.4);gl_FragColor=vec4(1.,.52,.24,.75)*f;}');sc.add(atm,rim);
const sun=new THREE.DirectionalLight(0xffb88c,3.6);sun.position.set(-4.5,2.2,4.5);sc.add(sun,new THREE.AmbientLight(0x3a150b,.85));
const sp=new Float32Array(2400);for(let i=0;i<2400;i++)sp[i]=(Math.random()-.5)*70;const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(sp,3));
sc.add(new THREE.Points(sg,new THREE.PointsMaterial({size:.045,color:0xf4f1ee,transparent:true,opacity:.85})));
const moon=(r,c)=>{const m=new THREE.Mesh(new THREE.IcosahedronGeometry(r,2),new THREE.MeshStandardMaterial({color:c,roughness:.9,flatShading:true}));sc.add(m);return m};
const ph=moon(.065,0x9c928c),de=moon(.048,0x827871);
const v3=(la,lo,r)=>{const p=(lo+180)*Math.PI/180,t=(90-la)*Math.PI/180;return new THREE.Vector3(-Math.cos(p)*Math.sin(t),Math.cos(t),Math.sin(p)*Math.sin(t)).multiplyScalar(r)};
const mk=[];SITES.forEach((s,i)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.038,12,12),new THREE.MeshBasicMaterial({color:0xff8c42}));m.position.copy(v3(s[1],s[2],2.18));m.userData.i=i;mars.add(m);mk.push(m)});
const ctl=new OrbitControls(cam,cv);ctl.enableDamping=true;ctl.enablePan=false;ctl.minDistance=3.8;ctl.maxDistance=11;ctl.autoRotate=!still;ctl.autoRotateSpeed=.55;
let vis=true;new IntersectionObserver(e=>vis=e[0].isIntersecting).observe(host);
function size(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;rd.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();mars.position.x=w>920?1.15:0;atm.position.x=rim.position.x=mars.position.x}
addEventListener('resize',size);size();
const ray=new THREE.Raycaster(),pt=new THREE.Vector2();let goal=null;
function show(){const i=cv.dataset.sel,t=document.getElementById('tgt'),tl=document.getElementById('tltgt');
 if(i===undefined){if(t)t.textContent=T[L].none;if(tl)tl.textContent=T[L].none;return}
 const s=SITES[i],html=`<b style="color:#FFB45E">${s[0]}</b><br>${s[3]} · ${s[1]}°, ${s[2]}°`;if(t)t.innerHTML=html;if(tl)tl.innerHTML=html}
let dn=null;cv.addEventListener('pointerdown',e=>dn=[e.clientX,e.clientY]);
cv.addEventListener('pointerup',e=>{if(!dn||Math.hypot(e.clientX-dn[0],e.clientY-dn[1])>5)return;const r=cv.getBoundingClientRect();
 pt.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pt,cam);const h=ray.intersectObjects(mk)[0];
 if(h){const i=h.object.userData.i;cv.dataset.sel=i;sel=i;goal=h.object.getWorldPosition(new THREE.Vector3()).sub(mars.position).normalize().multiplyScalar(6.2).add(new THREE.Vector3(mars.position.x,0,0));ctl.autoRotate=false;show();info();draw()}});
document.addEventListener('langchange',show);show();
const clk=new THREE.Clock();let T0=0;
(function loop(){requestAnimationFrame(loop);if(!vis)return;const dt=Math.min(clk.getDelta(),.05);T0+=dt;
 if(!still){mars.rotation.y+=dt*.035;const a=T0*.85,b=a*7.65/30.3;ph.position.set(mars.position.x+Math.cos(a)*3.05,Math.sin(a*.3)*.25,Math.sin(a)*3.05);de.position.set(mars.position.x+Math.cos(b)*4.35,Math.sin(b*.3)*.4,Math.sin(b)*4.35)}
 mk.forEach(m=>m.scale.setScalar(1+.28*Math.sin(T0*3.2+m.userData.i)));
 if(goal){cam.position.lerp(goal,.06);if(cam.position.distanceTo(goal)<.05)goal=null}
 ctl.target.set(mars.position.x,0,0);ctl.update();
 const d=cam.position.clone().sub(mars.position).normalize().applyMatrix4(new THREE.Matrix4().copy(mars.matrixWorld).invert().setPosition(0,0,0));
 const la=(Math.asin(d.y)*180/Math.PI).toFixed(1)+'°',rl=Math.atan2(d.z,-d.x)*180/Math.PI-180,lo=(rl<-180?rl+360:rl).toFixed(1)+'°';
 ['clat','tlat'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=la});['clon','tlon'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=lo});
 rd.render(sc,cam)})();
