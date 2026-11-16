/* Recursos interactivos de Psicología: semanas 8, 9 y 11. */
(function(){
'use strict';
const week=Number(document.body.dataset.psicoWeek);
const plans={
8:{anchor:'tema1',heading:'Mapa interactivo: teorías de la inteligencia',intro:'Tres autores, tres formas de explicar la inteligencia. Toca cada autor para ver un ejemplo.',items:[
['🧠 Spearman','Factor general (g) y capacidades específicas (s).','Una persona puede mostrar facilidad general para aprender y, además, destacar especialmente en matemáticas.','Idea clave: inteligencia general + habilidades específicas.'],
['🧩 Thurstone','Propuso varias aptitudes mentales primarias, no una sola capacidad.','Alguien puede comprender palabras con facilidad y otra persona destacar en orientación espacial.','Idea clave: distintas aptitudes, como comprensión verbal o capacidad espacial.'],
['🔷 Guilford','Organizó las capacidades intelectuales según operaciones, contenidos y productos.','Ante un dibujo, puedes identificarlo (operación), trabajar con información visual (contenido) y hallar relaciones (producto).','Idea clave: cómo pensamos × con qué información × qué resultado obtenemos.']]},
9:{anchor:'tema2',heading:'Esquema interactivo: ¿qué ocurre cuando sentimos una emoción?',intro:'Piensa en esta situación: vas a exponer frente a tus compañeros. Selecciona cada componente.',items:[
['❤️ Cuerpo','Componente fisiológico.','Tu corazón puede latir más rápido y tus manos sudar.','Es lo que cambia en el organismo.'],
['💭 Experiencia','Componente subjetivo.','Piensas: «Estoy nervioso porque todos me miran».','Es lo que sientes y cómo interpretas la situación.'],
['🙂 Expresión','Componente conductual.','Tu voz tiembla o sonríes al terminar la exposición.','Es lo que los demás pueden observar.'],
['🌿 Regulación','Manejo de la respuesta emocional.','Respiras despacio, te preparas y comienzas a hablar.','Regular no significa dejar de sentir.']]},
11:{anchor:'tema2',heading:'Pirámide interactiva de Maslow',intro:'Toca cada nivel para ver una explicación y un ejemplo. Es un modelo teórico: las necesidades no siempre se satisfacen en orden rígido.',items:[
['⭐ Autorrealización','Desarrollar capacidades y proyectos personales.','Aprender una habilidad, crear algo o alcanzar una meta propia.','Nivel superior en el modelo clásico.'],
['🏅 Estima','Sentirse competente y valorado.','Reconocer tus avances y recibir respeto.','Incluye autoestima y reconocimiento.'],
['🤝 Pertenencia','Sentir afecto e integración social.','Tener amistades y sentirte parte de un grupo.','Incluye vínculos y aceptación.'],
['🛡️ Seguridad','Buscar protección y estabilidad.','Contar con un lugar seguro donde vivir.','Incluye seguridad física y estabilidad.'],
['🍎 Fisiológicas','Necesidades corporales básicas.','Comer, beber agua y dormir.','Son esenciales para el funcionamiento del organismo.']]}
};
function init(){
 const plan=plans[week];if(!plan)return;
 const anchor=document.getElementById(plan.anchor);if(!anchor)return;
 const panel=document.createElement('section');panel.className='card';panel.id='recurso-visual-interactivo';
 const tag=document.createElement('span');tag.className='tag';tag.textContent='VISUALIZA Y EXPLORA';
 const title=document.createElement('h2');title.textContent=plan.heading;
 const intro=document.createElement('p');intro.textContent=plan.intro;
 const layout=document.createElement('div');layout.style.cssText='display:flex;flex-wrap:wrap;gap:10px;align-items:stretch;margin:16px 0';
 const detail=document.createElement('div');detail.className='detail';detail.setAttribute('aria-live','polite');
 const buttons=[];
 plan.items.forEach((item,i)=>{
  const btn=document.createElement('button');btn.type='button';btn.className='stage';btn.textContent=item[0];btn.style.cssText=week===11?'display:block;width:'+ (42+i*13)+'%;min-width:155px;margin:0 auto;text-align:center;background:'+['#fce7f3','#e9e6ff','#e2f4ff','#e5f7e8','#fff1d6'][i]+';border-color:#a5b7cb':'flex:1 1 170px;min-height:72px;text-align:center';
  btn.addEventListener('click',()=>{buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));detail.replaceChildren();const h=document.createElement('strong');h.textContent=item[1];const example=document.createElement('p');example.textContent='Ejemplo: '+item[2];const key=document.createElement('p');key.textContent=item[3];detail.append(h,example,key)});
  buttons.push(btn);layout.append(btn);
 });
 if(week===11){layout.style.cssText='display:flex;flex-direction:column;gap:5px;align-items:stretch;margin:16px auto;max-width:580px';}
 panel.append(tag,title,intro,layout,detail);
 anchor.insertAdjacentElement('afterend',panel);
 buttons[0]?.click();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();