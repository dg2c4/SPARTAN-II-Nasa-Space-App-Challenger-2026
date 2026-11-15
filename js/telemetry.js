/* Telemetría fija (video). Valores de referencia + resultados reales de los módulos (Survival y Ruta). */
(function(){const q=id=>document.getElementById(id);
function upd(){const s=typeof SIM!=='undefined'&&SIM,r=typeof RT!=='undefined'&&RT.g;
 q('tl1').textContent=s?Math.round(SIM.kc)+' kcal/d':'—';q('tl2').textContent=r?RT.g.gcd.toFixed(0)+' km (recta)':'—'}
document.addEventListener('simchange',upd);setInterval(upd,2000);upd()})();
