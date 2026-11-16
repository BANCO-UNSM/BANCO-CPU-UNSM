(function(){
'use strict';
/* Estructura uniforme CachimboLab: 01–05 teoría y aplicaciones, 06 tarjetas,
   07 preguntas nuevas, 08 separata CPU. Conserva IDs y controles existentes. */
function normalize(){
 const main=document.querySelector('main');if(!main||main.dataset.eightPointStructure==='ready')return;
 const cards=Array.from(main.children).filter(el=>el.tagName==='SECTION'&&el.classList.contains('card'));
 const label=section=>section.querySelector(':scope > .tag');
 const badge=section=>label(section)?.textContent?.trim()||'';
 const study=cards.filter(section=>/^\d\d\s*[·.\-]/.test(badge(section))||/^REPASO|^COMPARAMOS$|^APLICAMOS$|^CONTINUACIÓN/.test(badge(section)));
 let memory=main.querySelector('#tarjetas, #recordar');
 let check=main.querySelector('#reto, #evaluacion');
 let official=main.querySelector('#practica');
 if(!official)official=cards.find(x=>/PRACTI|PRÁCTI|SEPARATA/i.test(badge(x))&&x!==memory&&x!==check);
 if(!memory||!check||!official)return;
 if(!official.id)official.id='practica';
 const stop=new Set([memory,check,official]);
 // Los apartados de teoría preceden a las tarjetas de memoria.
 let topics=cards.filter(s=>!stop.has(s)&&Boolean(s.compareDocumentPosition(memory)&Node.DOCUMENT_POSITION_FOLLOWING));
 if(!topics.length)return;
 const heading=s=>s.querySelector(':scope > h2')?.textContent?.trim()||'Concepto de estudio';
 const overview=s=>{const p=s.querySelector(':scope > p');return p?.textContent?.trim()||'Relaciona los ejemplos y las ideas del tema.';};
 const lessonLabel=(i)=>String(i+1).padStart(2,'0')+(i===4?' · APLICA E INTEGRA':' · APRENDE');
 while(topics.length<5){
  const number=topics.length;
  const source=topics.slice();
  const section=document.createElement('section');
  section.className='card';
  section.id='tema'+number;
  const tag=document.createElement('span');tag.className='tag';tag.textContent=lessonLabel(number);
  const h=document.createElement('h2');
  h.textContent=['','', 'Relacionamos los conceptos', 'Aplicación en situaciones', 'Síntesis y comparación'][number]||'Practicamos la teoría';
  const intro=document.createElement('p');intro.textContent='Analiza estas situaciones y vincúlalas con los conceptos estudiados.';
  section.append(tag,h,intro);
  const examples=source.flatMap(item=>{
   const elements=Array.from(item.querySelectorAll('.stage, .tile, .scenario, .info'));
   return elements.map(el=>{
    const key=el.querySelector('strong, b')?.textContent?.trim()||heading(item);
    const clue=el.querySelector('p, span')?.textContent?.trim()||el.textContent?.replace(key,'').trim()||overview(item);
    return {key,clue,context:heading(item)};
   }).filter(x=>x.clue&&x.clue.length>8);
  });
  const selected=examples.length?Array.from({length:Math.min(3,examples.length)},(_,i)=>examples[((number-2)*3+i)%examples.length]):
   source.slice(0,3).map(item=>({key:heading(item),clue:overview(item),context:heading(item)}));
  selected.forEach((item,i)=>{
   const details=document.createElement('details');
   details.style.cssText='border:1px solid #c8dcea;border-radius:10px;padding:12px;margin:9px 0;background:#f3f9ff';
   const summary=document.createElement('summary');
   summary.textContent='Caso '+(i+1)+': '+item.clue.slice(0,170)+' ¿Con qué concepto lo relacionas?';
   const p=document.createElement('p');
   p.textContent='Se relaciona con «'+item.key+'», dentro de '+item.context+'. Comprueba esta relación con la teoría anterior.';
   details.append(summary,p);section.append(details);
  });
  const btn=document.createElement('button');btn.type='button';btn.className='audio-btn';
  btn.textContent='🔊 Escuchar con Atenea';
  btn.addEventListener('click',()=>{
   if(!window.ateneaSpeak||!window.speechSynthesis)return;
   const u=new SpeechSynthesisUtterance(h.textContent+'. '+intro.textContent+'. '+source.map(heading).join('; '));
   u.rate=.9;window.speechSynthesis.cancel();window.ateneaSpeak(u);
  });
  section.append(btn);
  memory.before(section);topics.push(section);
 }
 if(topics.length>5){
  const mainFive=topics[4];
  topics.slice(5).forEach(other=>{
   if(other===mainFive)return;
   other.classList.remove('card');
   other.classList.add('eight-point-subtopic');
   other.style.cssText='margin:20px 0 0;border-top:1px solid #d1e3ee;padding:18px 0 0';
   const tag=label(other);if(tag)tag.textContent='CONTINUACIÓN DEL PUNTO 05';
   mainFive.appendChild(other);
  });
  topics=topics.slice(0,5);
 }
 const review=/(?:REPASO|NIVELACIÓN)/i.test(main.querySelector('.hero .tag')?.textContent||'')||/(?:repaso|nivelación)/i.test(main.querySelector('.hero h1')?.textContent||'');
 topics.forEach((t,i)=>{
  const tag=label(t);
  if(tag)tag.textContent=String(i+1).padStart(2,'0')+(review?' · REPASO':' · '+['DESCUBRE','EXPLORA','RELACIONA','APLICA','PROFUNDIZAMOS'][i]);
 });
 [[memory,'06 · RECUERDA'],[check,'07 · COMPRUEBA'],[official,'08 · PRÁCTICA CPU · SEPARATA']].forEach(([section,title])=>{
  const tag=label(section);if(tag)tag.textContent=title;
 });
 const nav=main.querySelector('nav.nav');
 if(nav){
  const links=Array.from(nav.querySelectorAll('a'));
  const isStudy=a=>/^#tema\d+$/.test(a.getAttribute('href')||'')||['#conceptos','#procesos','#ramas','#metodos','#historia','#escuelas','#socializacion','#agentes','#neuronas','#sistemas','#cerebro','#hormonas','#desarrollo','#etapas','#freud','#comparacion','#introduccion','#sensacion','#percepcion','#principios'].includes(a.getAttribute('href')||'');
  const seen=new Set(topics.map(x=>x.id));
  links.filter(isStudy).forEach(a=>{const id=(a.getAttribute('href')||'').slice(1);if(!seen.has(id))a.remove()});
  const existing=new Set(Array.from(nav.querySelectorAll('a')).map(x=>x.getAttribute('href')));
  for(const t of topics){if(!existing.has('#'+t.id)){const link=document.createElement('a');link.href='#'+t.id;link.textContent=heading(t);const mem=nav.querySelector('a[href="#tarjetas"], a[href="#recordar"]');if(mem)mem.before(link);else nav.append(link);}}
 }
 main.dataset.eightPointStructure='ready';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',normalize,{once:true});
else normalize();
})();