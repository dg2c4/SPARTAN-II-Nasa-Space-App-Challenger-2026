const ic=$('#ic'),ix=ic.getContext('2d');let t0=0,run=true;const ST=Array.from({length:220},()=>[Math.random()*2-1,Math.random()*2-1,Math.random()]);
function intro(ts){if(!run)return;t0=t0||ts;const t=(ts-t0)/1000;ic.width=innerWidth;ic.height=innerHeight;const w=ic.width,h=ic.height;
 ix.fillStyle='#000';ix.fillRect(0,0,w,h);ix.fillStyle='#fff';
 ST.forEach(s=>{s[2]-=.004;if(s[2]<=.02)s[2]=1;ix.globalAlpha=1-s[2];ix.fillRect(w/2+s[0]/s[2]*w*.08,h/2+s[1]/s[2]*h*.08,1+(1-s[2])*2,1+(1-s[2])*2)});ix.globalAlpha=1;
 const r=Math.min(w,h)*(.08+Math.min(t,12)*.035),gd=ix.createRadialGradient(w/2-r*.3,h/2-r*.3,r*.1,w/2,h/2,r);
 gd.addColorStop(0,'#ff9a5c');gd.addColorStop(.6,'#b03a1a');gd.addColorStop(1,'#1a0502');ix.fillStyle=gd;ix.beginPath();ix.arc(w/2,h/2,r,0,7);ix.fill();
 const ln=T[L].lines;$('#line').textContent=ln[Math.min(ln.length-1,Math.floor(t/2.2))];requestAnimationFrame(intro)}
$('#start').onclick=()=>{run=false;$('#intro').style.opacity=0;setTimeout(()=>$('#intro').remove(),800)};
setLang(L);calc();requestAnimationFrame(intro);
