(function(){
'use strict';
const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const M=s=>{const tex=String(s||'');try{return window.katex?window.katex.renderToString(tex,{displayMode:true,throwOnError:false,strict:'ignore'}):E(tex)}catch(_){return E(tex)}};
const definition=(d)=>Array.isArray(d)?d:[];
const labels=['MARCO TEÓRICO','CONCEPTOS, FÓRMULAS Y PROPIEDADES','EJEMPLOS RESUELTOS','MEMORIA ACTIVA','PREGUNTAS CPU · SEPARATA'];
function getData(course,week){const entries=course==='Química'?window.CACHIMBOLAB_CHEMISTRY_LESSONS:window.CACHIMBOLAB_BIOLOGY_LESSONS;return entries?.[Number(week)]||null;}
function render(course,week){
 const entry=getData(course,week);
 const n=Number(week);
 const slug=course==='Química'?'quimica':'biologia';
 const intro=entry?'<h3>'+E(entry.title)+'</h3><p>'+E(entry.intro)+'</p>'+entry.theory.map(([name,detail])=>'<article class="qb-note"><strong>'+E(name)+'</strong><p>'+E(detail)+'</p></article>').join(''):'<p>El temario de esta semana todavía está pendiente de confirmar. No se mostrarán explicaciones de otra semana.</p>';
 const formula=entry?definition(entry.formulas).map(([name,tex])=>'<article class="qb-formula"><strong>'+E(name)+'</strong><div class="qb-math">'+M(tex)+'</div></article>').join(''):'<p>Conceptos en preparación.</p>';
 const example=entry?'<div class="qb-carousel" data-qb-carousel="examples">'+entry.examples.map((ex,i)=>'<article class="qb-example" data-qb-page '+(i?'hidden':'')+'><span class="qb-counter">EJEMPLO '+(i+1)+' DE '+entry.examples.length+'</span><h3>'+E(ex.title)+'</h3>'+ex.steps.map(s=>String(s).includes('\\')?'<div class="qb-math">'+M(s)+'</div>':'<p>'+E(s)+'</p>').join('')+'</article>').join('')+'</div>':'<p>Ejemplos pendientes del temario.</p>';
 const cards=entry?'<div class="qb-carousel" data-qb-carousel="cards">'+entry.cards.map(([question,answer],i)=>'<article class="qb-flashcard" data-qb-page '+(i?'hidden':'')+'><span class="qb-counter">TARJETA '+(i+1)+' DE '+entry.cards.length+'</span><h3>'+E(question)+'</h3><div class="qb-answer" hidden>'+E(answer)+'</div><button type="button" data-qb-reveal>Mostrar respuesta</button></article>').join('')+'</div>':'<p>Las tarjetas de esta semana están en preparación.</p>';
 const practice='<iframe title="Práctica CPU · '+E(course)+' semana '+n+'" src="pilotos/'+slug+'-practica.html?week='+n+'&v=chem-bio-study-20261119" style="display:block;width:100%;height:680px;min-height:550px;border:0;border-radius:12px;background:#f1f7fc" loading="lazy"></iframe>';
 const blocks=[intro,formula||'<p>Se están preparando los conceptos.</p>',example,cards,practice];
 const items=labels.map((label,i)=>'<section class="qb-panel" id="qb-part-'+(i+1)+'"><span class="qb-eyebrow">'+String(i+1).padStart(2,'0')+' · '+label+'</span>'+blocks[i]+'</section>').join('');
 return '<div class="qb-lesson" data-qb-week="'+n+'" data-qb-course="'+E(course)+'"><style>.qb-lesson{font:inherit;color:#153a57;background:#eef5fb;padding:14px 12px;border-radius:15px}.qb-hero{background:linear-gradient(115deg,#195376,#348cb3);border-radius:13px;padding:22px;color:white}.qb-hero h2{font-size:clamp(21px,2.9vw,30px);color:white;margin:9px 0 0}.qb-badge{font-size:12px;font-weight:800;background:#dcf9ec;color:#006b56;border-radius:22px;padding:6px 11px}.qb-nav{display:flex;gap:7px;flex-wrap:wrap;margin:13px 0}.qb-nav a{color:#154667;background:#fff;border:1px solid #c3deef;border-radius:8px;font-size:12px;font-weight:800;padding:8px 10px;text-decoration:none}.qb-panel{background:#fff;border:1px solid #d2e4f2;border-radius:14px;margin:13px 0;padding:20px;scroll-margin-top:15px;line-height:1.65}.qb-eyebrow{display:inline-block;padding:6px 11px;border-radius:20px;background:#def8eb;color:#08674e;font-size:11px;font-weight:900;margin-bottom:12px}.qb-panel h3{font-size:17px;line-height:1.5;color:#163c58}.qb-note{border-top:1px solid #e0edf5;padding:14px 0}.qb-note p{margin:6px 0}.qb-formula{padding:12px 0;border-bottom:1px solid #deecf5}.qb-formula strong{display:block;margin-bottom:7px}.qb-math{background:#eaf4ff;border:1px solid #cbe1f4;border-radius:11px;padding:13px;margin:9px 0;overflow-x:auto;text-align:center}.qb-math .katex-display{margin:0}.qb-example{background:#f5faff;border:1px solid #cbe0ef;border-radius:12px;padding:17px}.qb-example p{margin:12px 0}.qb-counter{font-size:12px;font-weight:800;color:#087f79}.qb-flashcard{background:#f1f8ff;border:1px solid #bfdcf0;border-radius:13px;min-height:180px;padding:20px}.qb-flashcard h3{font-size:18px}.qb-answer{background:#e5f5ec;border-left:4px solid #18865d;border-radius:9px;margin:14px 0;padding:12px}.qb-flashcard button,.qb-controls button{background:#087f79;color:white;border:0;border-radius:9px;padding:10px 13px;font-weight:800;cursor:pointer}.qb-controls{background:#eaf4ff;border:1px solid #d2e6f4;padding:11px;border-radius:12px;display:flex;align-items:center;justify-content:space-between;gap:9px;margin-top:11px;flex-wrap:wrap}.qb-controls button:disabled{background:#e2ebf3;color:#7792a2;cursor:default}.qb-carousel [hidden],.qb-lesson [hidden]{display:none!important}.qb-lesson #qb-part-5{background:#f8fbff}@media(max-width:650px){.qb-lesson{padding:9px 5px}.qb-panel{padding:14px}.qb-controls{justify-content:center}}</style><header class="qb-hero"><span class="qb-badge">'+E(course.toUpperCase())+' · SEMANA '+n+'</span><h2>'+E(entry?.title||'Lección en preparación')+'</h2></header><nav class="qb-nav">'+labels.map((name,i)=>'<a href="#qb-part-'+(i+1)+'">'+String(i+1)+' · '+E(name)+'</a>').join('')+'</nav>'+items+'</div>';
}
function bind(){
 document.querySelectorAll('.qb-carousel').forEach(root=>{
  if(root.dataset.qbBound)return;root.dataset.qbBound='1';
  const pages=[...root.querySelectorAll('[data-qb-page]')];if(!pages.length)return;
  const controls=document.createElement('div');controls.className='qb-controls';
  const prev=document.createElement('button');prev.type='button';prev.textContent='← Anterior';
  const label=document.createElement('strong');label.style.fontSize='13px';
  const next=document.createElement('button');next.type='button';
  let index=0;const name=root.dataset.qbCarousel==='examples'?'Ejemplo':'Tarjeta';
  const draw=()=>{pages.forEach((page,i)=>page.hidden=i!==index);label.textContent=name+' '+(index+1)+' de '+pages.length;prev.disabled=index===0;next.textContent=index===pages.length-1?'Volver a empezar ↺':'Siguiente '+name.toLowerCase()+' →';};
  prev.onclick=()=>{if(index>0)index--;draw();};
  next.onclick=()=>{index=(index+1)%pages.length;draw();};
  controls.append(prev,label,next);root.after(controls);draw();
 });
 document.querySelectorAll('.qb-flashcard [data-qb-reveal]').forEach(button=>{
  button.onclick=()=>{const answer=button.parentElement.querySelector('.qb-answer');answer.hidden=!answer.hidden;button.textContent=answer.hidden?'Mostrar respuesta':'Ocultar respuesta';};
 });
}
window.CACHIMBOLAB_QB={render,bind,hasTopic:(course,week)=>!!getData(course,week)};
})();