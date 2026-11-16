'use strict';
(function(){
const course=document.body.dataset.course,week=Number(document.body.dataset.week);
const bank=window.CACHIMBO_COURSES?.[course],current=bank?.[week];
const $=id=>document.getElementById(id);
if(!current||!$ ('lesson')){document.body.textContent='No se encontró el contenido de esta semana.';return;}
const names={historia:'Historia',geografia:'Geografía',lenguaje:'Lenguaje y Literatura',filosofia:'Filosofía',economia:'Economía'};
const name=names[course],review=week===10||week===16,level=week===8;
document.title=name+' · Semana '+week+' | CachimboLab';
const style=document.createElement('style');style.textContent=`:root{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#173953;background:#eff5fb}*{box-sizing:border-box}body{margin:0}header{background:#123d5e;color:white;padding:14px 20px;font-weight:800}main{max-width:880px;margin:0 auto;padding:22px 15px 65px}.hero{padding:24px;border-radius:17px;background:linear-gradient(120deg,#184b6b,#3986ae);color:white}.hero h1{font-size:clamp(23px,3vw,34px)}.tag{display:inline-block;border-radius:25px;padding:6px 12px;background:#dcf7e8;color:#085d4e;font-weight:800;font-size:12px}.nav{display:flex;flex-wrap:wrap;gap:8px;margin:17px 0}.nav a{border-radius:10px;padding:9px 11px;border:1px solid #c8dfef;background:#fff;color:#194969;text-decoration:none;font-size:13px;font-weight:700}.card{background:white;border:1px solid #d3e5f1;box-shadow:0 3px 15px #1a3f5911;border-radius:16px;padding:23px;margin:17px 0}.card h2{margin:14px 0;font-size:21px}.card p{line-height:1.7}.example{padding:14px;background:#eef7ff;border:1px solid #c7e0f2;border-radius:12px;margin:14px 0}.example strong{display:block;margin-bottom:7px}.explain{padding:14px;background:#effaf6;border-left:4px solid #168f73;border-radius:10px}.muted{color:#637d91}.btn,.choice,.flash{cursor:pointer;font:inherit;border-radius:10px;padding:12px;border:1px solid #bad6e7}.btn{background:#087d78;color:#fff;border:0;margin:7px 5px 0 0}.choice{display:block;background:#f5faff;width:100%;text-align:left;margin:8px 0}.choice.right{background:#def8ec;border-color:#148e64}.choice.wrong{background:#ffe6e9;border-color:#c95555}.choice:disabled{cursor:default}.flash{width:100%;min-height:118px;background:#f0f7ff;color:#143e5d;font-weight:700}.feedback{background:#e9f6fb;padding:14px;border-radius:10px;line-height:1.7;margin:10px 0}.steps{display:flex;flex-wrap:wrap;gap:9px;margin:14px 0}.pill{background:#e9f8f3;border-radius:20px;padding:8px 12px;font-size:13px;color:#174a57}.foot{font-size:13px;color:#698092}.controls{display:flex;align-items:center;flex-wrap:wrap;gap:8px}@media(max-width:600px){.card,.hero{padding:16px}}`;document.head.append(style);
const main=$('lesson');
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
function add(parent,...nodes){nodes.forEach(x=>parent.append(x));return parent}
add(main,add(el('section','hero'),el('span','tag',name.toUpperCase()+' · SEMANA '+week+' · '+(review?'REPASO':level?'NIVELACIÓN':'LECCIÓN INTERACTIVA')),el('h1','',current.title),el('p','',current.intro||'Marco teórico, ejemplos, narración de Atenea y aprendizaje activo.')));
const nav=el('nav','nav');for(let i=1;i<=8;i++){const a=el('a','',i<6?'0'+i+' · Estudia':i===6?'06 · Memoria':i===7?'07 · Reto':'08 · CPU');a.href='#p'+i;nav.append(a)}main.append(nav);
const sections=current.sections;if(!Array.isArray(sections)||sections.length!==5)throw Error('Se requieren cinco bloques teóricos por semana');
let speaking=null;
function read(section,button){if(!window.ateneaSpeak||!window.speechSynthesis)return;if(speaking===button){speechSynthesis.cancel();speaking=null;button.textContent='🔊 Escuchar con Atenea';return}speechSynthesis.cancel();document.querySelectorAll('[data-atenea]').forEach(x=>x.textContent='🔊 Escuchar con Atenea');const u=new SpeechSynthesisUtterance(section[0]+'. '+section[1]+'. Ejemplo: '+section[2]+'. Para recordar: '+section[3]);u.rate=.92;u.onend=()=>{if(speaking===button){speaking=null;button.textContent='🔊 Escuchar con Atenea'}};if(window.ateneaSpeak(u)){speaking=button;button.textContent='⏹ Detener a Atenea'}}
sections.forEach((s,i)=>{const p=el('section','card');p.id='p'+(i+1);add(p,el('span','tag',String(i+1).padStart(2,'0')+' · '+(review?'REPASAMOS':['DESCUBRE','EXPLORA','RELACIONA','APLICA','PROFUNDIZAMOS'][i])),el('h2','',s[0]),el('p','',s[1]),add(el('div','example'),el('strong','','Ejemplo explicado'),el('p','',s[2])),add(el('div','explain'),el('strong','','Idea clave'),el('p','',s[3])));const b=el('button','btn','🔊 Escuchar con Atenea');b.type='button';b.dataset.atenea='';b.onclick=()=>read(s,b);p.append(b);main.append(p)});
// Línea de tiempo interactiva: piloto pedagógico para Historia, semana 13.
if(course==='historia'&&week===13){
 const events=[
  {year:'1883',title:'Fin de la guerra y reconstrucción',what:'El Tratado de Ancón marcó el fin de la guerra entre Perú y Chile. El país afrontó graves daños económicos y políticos.',why:'Comienza la difícil recuperación nacional.'},
  {year:'1884',title:'Gobierno de Miguel Iglesias',what:'Miguel Iglesias gobernó en un escenario de fuertes divisiones políticas tras la guerra.',why:'Las disputas entre dirigentes dificultaron la estabilidad.'},
  {year:'1886',title:'Andrés Avelino Cáceres',what:'Cáceres inició su primer gobierno y buscó reorganizar la economía y las finanzas públicas.',why:'Fue una figura central del Segundo Militarismo.'},
  {year:'1889',title:'Contrato Grace',what:'El gobierno acordó una solución para la deuda externa mediante concesiones, incluidas las vinculadas a ferrocarriles.',why:'Influyó en la recuperación financiera y generó controversias.'},
  {year:'1895',title:'Cambio político',what:'La revolución encabezada por Nicolás de Piérola puso fin al predominio militar de esta etapa.',why:'Abrió paso a un nuevo periodo de predominio civil.'}
 ];
 const panel=el('section','card');panel.id='timeline-historia';add(panel,el('span','tag','VISUALIZA'),el('h2','','Línea de tiempo interactiva · Reconstrucción nacional'),el('p','muted','Selecciona un año para descubrir qué pasó y por qué importa.'));
 const controls=el('div','controls'),detail=el('div','explain');detail.setAttribute('aria-live','polite');
 let active=0;
 function showEvent(index){active=index;controls.querySelectorAll('button').forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===index));b.style.fontWeight=i===index?'700':'400'});const e=events[index];detail.replaceChildren(el('h3','',e.year+' · '+e.title),el('p','',e.what),el('p','','¿Por qué importa? '+e.why))}
 events.forEach((e,i)=>{const b=el('button','btn',e.year);b.type='button';b.onclick=()=>showEvent(i);controls.append(b)});
 add(panel,controls,detail);main.append(panel);showEvent(0);
}
if(course==='historia'&&week===13){
 const panel=el('section','card');add(panel,el('span','tag','RELACIONA'),el('h2','','Mapa de causas y consecuencias'),el('p','muted','Observa cómo un hecho histórico conduce a otros.'));
 const flow=el('div','');flow.style.cssText='display:flex;flex-wrap:wrap;align-items:center;gap:10px;justify-content:center;margin:16px 0';
 [['Guerra del Pacífico','Daños y crisis'],['Reconstrucción','Recuperar economía y gobierno'],['Segundo Militarismo','Dirigentes militares'],['Contrato Grace (1889)','Acuerdo sobre la deuda'],['Cambio de 1895','Predominio de gobiernos civiles']].forEach((entry,i)=>{
  if(i)flow.append(el('strong','','→'));
  const node=el('div','');node.style.cssText='flex:1 1 140px;max-width:240px;padding:12px;border:1px solid #bad6e7;border-radius:10px;background:#f0f7ff;text-align:center';
  add(node,el('strong','',entry[0]),el('p','muted',entry[1]));flow.append(node);
 });
 panel.append(flow);main.append(panel);
}
const memory=el('section','card');memory.id='p6';add(memory,el('span','tag','06 · RECUERDA'),el('h2','','Tarjetas de memoria'),el('p','muted','Responde con tus palabras y pulsa la tarjeta para comprobarlo.'));const counter=el('p','muted'),card=el('button','flash');card.type='button';let ci=0,flip=false;
function drawCard(){
 counter.textContent='Tarjeta '+(ci+1)+' de '+sections.length;
 const prompts=(course==='historia'&&week===13)?[
 '¿Qué significó reconstruir el Perú después de la Guerra del Pacífico?',
 '¿Qué fue el Segundo Militarismo y quiénes destacaron?',
 '¿Para qué se firmó el Contrato Grace en 1889?',
 '¿Qué caracterizó a la República Aristocrática?',
 '¿Qué cambios sociales acompañaron la reconstrucción?'
 ]:null;
 card.textContent=flip?sections[ci][3]:(prompts?prompts[ci]:'¿Cuál es la idea fundamental de «'+sections[ci][0]+'»?');
}card.onclick=()=>{flip=!flip;drawCard()};const prev=el('button','btn','← Anterior'),next=el('button','btn','Siguiente →');prev.onclick=()=>{ci=(ci-1+sections.length)%sections.length;flip=false;drawCard()};next.onclick=()=>{ci=(ci+1)%sections.length;flip=false;drawCard()};add(memory,counter,card,add(el('div','controls'),prev,next));main.append(memory);drawCard();
const quiz=el('section','card');quiz.id='p7';add(quiz,el('span','tag','07 · COMPRUEBA'),el('h2','','Reto de comprensión'));const quizHost=el('div');quiz.append(quizHost);main.append(quiz);let qi=0,hits=0,answered=false;const letter=i=>'ABCDE'[i];
function drawQuiz(){quizHost.replaceChildren();if(qi>=sections.length){add(quizHost,el('p','', 'Resultado: '+hits+' de '+sections.length+' respuestas correctas.'));const again=el('button','btn','Volver a practicar');again.onclick=()=>{qi=0;hits=0;drawQuiz()};quizHost.append(again);return}answered=false;const source=sections[qi],distractors=[(qi+1)%5,(qi+2)%5,(qi+3)%5];const correctPosition=(qi*2+1)%4;const indices=distractors.slice();indices.splice(correctPosition,0,qi);add(quizHost,el('p','muted','Pregunta '+(qi+1)+' de '+sections.length),el('h3','', 'En el siguiente caso, ¿qué concepto explica mejor la situación?'),add(el('div','example'),el('p','',source[2])));const options=el('div'),feedback=el('div','feedback');feedback.hidden=true;const following=el('button','btn','Siguiente pregunta →');following.hidden=true;following.onclick=()=>{qi++;drawQuiz()};
indices.forEach((item,pos)=>{const b=el('button','choice',letter(pos)+') '+sections[item][0]);b.onclick=()=>{if(answered)return;answered=true;if(item===qi)hits++;Array.from(options.children).forEach((x,j)=>{x.disabled=true;if(indices[j]===qi)x.classList.add('right');else if(j===pos)x.classList.add('wrong')});feedback.textContent=(item===qi?'¡Respuesta correcta! ':'Respuesta incorrecta. ')+'La respuesta es '+letter(correctPosition)+') '+source[0]+'. '+source[1]+' '+source[3];feedback.hidden=false;following.hidden=false};options.append(b)});add(quizHost,options,feedback,following)}drawQuiz();
const official=el('section','card');official.id='p8';
const availableWeeks={historia:[11,12],geografia:[11,12],lenguaje:[11,12],filosofia:[6,7,8,9,11,12,13],economia:[11,12]};
const hasPublished=(availableWeeks[course]||[]).includes(week);
const steps=el('div','steps');
['📖 Teoría','🧠 Comprensión',hasPublished?'🎯 Práctica oficial disponible':'🎯 Práctica oficial en preparación']
 .forEach(t=>steps.append(el('span','pill',t)));
add(official,el('span','tag','08 · PRÁCTICA CPU · SEPARATA'),el('h2','','Aplicamos lo aprendido'),steps);
main.append(official);
main.append(el('p','foot','CachimboLab · Contenido organizado según el temario CPU proporcionado. Los repasos conservan la progresión de las semanas anteriores.'));
const officialScript=document.createElement('script');officialScript.src='practica-nuevos-cursos.js?v=2';document.body.appendChild(officialScript);
window.addEventListener('pagehide',()=>{if(window.speechSynthesis)speechSynthesis.cancel()});
})();