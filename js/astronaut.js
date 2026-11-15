function calc(){const t=T[L],f=id=>+$(id).value,m=$('#sx').value==='m',w=f('#wt'),h=f('#ht'),a=f('#ag'),d=f('#dy');
 const bmr=10*w+6.25*h-5*a+(m?5:-161),kc=bmr*f('#ac'),o2L=kc/4.86,o2=o2L*1.429/1000,co=o2L*.87*1.977/1000,wa=w*.035+2.5,mox=o2*1000/(5.5*24);
 const r=(l,v,u,x='')=>`<div><small>${l}</small><b>${v}</b> ${u} <small>${x}</small></div>`;
 $('#res').className='res';$('#res').innerHTML=r(t.kc,Math.round(kc),'kcal')+r(t.o2d,o2.toFixed(2),'kg',Math.round(o2L)+' L')+r(t.co,co.toFixed(2),'kg')+r(t.wa,wa.toFixed(1),'L')+
 r(`${t.tot} (${d} d)`,(o2*d).toFixed(0),'kg O₂',`${(wa*d).toFixed(0)} L · ${Math.round(kc*d/1000)} Mcal`)+r(t.mox,Math.ceil(mox),'×','5.5 g/h')}
document.querySelectorAll('#astro input,#astro select').forEach(e=>e.oninput=calc);document.addEventListener('langchange',calc);
