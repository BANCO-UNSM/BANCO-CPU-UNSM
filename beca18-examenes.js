'use strict';
const el=id=>document.getElementById(id);
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let exams=[],current=null,answers={},graded=false,lastReadingId=null,questionObserver=null;
function questionGroup(q){return current.groups[q.group]||{passage:'Lectura no disponible',pages:'—'};}
function showReading(q){
 const g=questionGroup(q);
 if(lastReadingId===g.id)return;
 lastReadingId=g.id;
 const left=document.querySelector('.exam-reading');
 if(left)left.scrollTop=0;
 el('readingTitle').textContent='Lectura del examen '+current.year+' · preguntas '+g.first+'–'+g.last;
 el('readingInfo').textContent='Lee el texto y observa las imágenes o infografías que aparecen al final.';
 el('readingText').textContent=g.passage||'Texto pendiente de cotejo con el cuadernillo original.';
 const images=Array.isArray(g.images)?g.images:[];
 const holder=el('originalPages');
 if(holder){
  holder.innerHTML=images.map((src,i)=>'<figure class="exam-illustration"><a href="'+escapeHtml(src)+'" target="_blank" rel="noopener" title="Ampliar ilustración"><img src="'+escapeHtml(src)+'" loading="lazy" alt="Gráfico o ilustración '+(i+1)+' correspondiente a la lectura '+escapeHtml(g.id)+'"></a></figure>').join('');
  holder.hidden=images.length===0;
  holder.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.closest('figure').innerHTML='<p class="warning">La imagen correspondiente no está disponible. Consulta el PDF original.</p>';},{once:true}));
 }
}

function showExam(year){
 if(questionObserver){questionObserver.disconnect();questionObserver=null;}
 lastReadingId=null;
 current=exams.find(e=>e.year===year)||exams[0];answers={};graded=false;
 el('examNav').innerHTML=exams.map(e=>'<button type="button" data-year="'+e.year+'" class="'+(e.year===current.year?'selected':'')+'">Examen '+e.year+'</button>').join('')+'<a href="beca18-clases.html">📚 Volver a clases</a>';
 el('questionsTitle').textContent='Preguntas 31 a 60 · '+current.year;
 el('questions').innerHTML=current.questions.map(q=>{
 const label=q.needs_visual?'<p class="warning small">Observa la infografía o ilustración que aparece debajo de la lectura, en el panel izquierdo.</p>':'';
 const qimg=q.image?'<div class="question-image"><img loading="lazy" src="'+escapeHtml(q.image)+'" alt="Imagen o figura asociada a la pregunta '+q.number+'"></div>':'';
 return '<fieldset class="question" data-number="'+q.number+'" id="p'+q.number+'"><legend>Pregunta '+q.number+'. '+escapeHtml(q.statement)+'</legend>'+qimg+label+
 q.options.map((opt,i)=>'<label><input type="radio" name="q'+q.number+'" value="'+i+'"> <strong>'+String.fromCharCode(65+i)+')</strong> '+escapeHtml(opt)+'</label>').join('')+'<div class="feedback"></div></fieldset>';
 }).join('');
 el('result').innerHTML='';
 el('grade').disabled=false;
 el('examStatus').textContent='Convocatoria '+current.year+' · '+current.questions.length+' preguntas · responde a tu ritmo. Tu avance de esta sesión no se envía a ningún servidor.';
 showReading(current.questions[0]);
 el('examNav').querySelectorAll('[data-year]').forEach(b=>b.addEventListener('click',()=>showExam(Number(b.dataset.year))));
 el('questions').querySelectorAll('fieldset').forEach(fs=>{
  const q=current.questions.find(x=>x.number===Number(fs.dataset.number));
  fs.addEventListener('focusin',()=>showReading(q));
  fs.addEventListener('click',()=>showReading(q));
 });
 // Al desplazarse por la lista de preguntas, cambiar de lectura solo cuando comienza otro bloque.
 // Durante las preguntas de un mismo texto, el panel izquierdo permanece inmóvil.
 const right=document.querySelector('.exam-questions');
 if(right&&'IntersectionObserver' in window){
  questionObserver=new IntersectionObserver(entries=>{
   const visible=entries.filter(x=>x.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
   if(visible.length){
    const num=Number(visible[0].target.dataset.number);
    const q=current.questions.find(x=>x.number===num);
    if(q)showReading(q);
   }
  },{root:right,rootMargin:'-12px 0px -72% 0px',threshold:0});
  right.querySelectorAll('fieldset.question').forEach(fs=>questionObserver.observe(fs));
 }
 if(right)right.scrollTop=0;
}
function evaluate(){
 if(!current)return;
 let correct=0,answered=0;
 for(const q of current.questions){
  const fs=el('p'+q.number);
  const checked=fs.querySelector('input:checked');
  if(checked){answered++;answers[q.number]=Number(checked.value);}
  const right=answers[q.number]===q.correct_index;
  if(right)correct++;
  fs.classList.toggle('correct',right);
  fs.classList.toggle('incorrect',!right);
  fs.querySelector('.feedback').innerHTML='<div class="key"><strong>'+ (right?'✅ Correcta':'📝 Revisa esta pregunta')+'</strong><br>CLAVE DEL CUADERNILLO: '+String.fromCharCode(65+q.correct_index)+') '+escapeHtml(q.options[q.correct_index])+'.<br><strong>RESPUESTA CORRECTA:</strong> corresponde a la alternativa indicada en la tabla de claves del PDF.<br><strong>ANÁLISIS DE LAS OTRAS ALTERNATIVAS:</strong> pendiente de revisión pedagógica individual; vuelve al texto y contrasta cada opción.<br><strong>CLAVE PARA RECORDAR:</strong> sustenta cada respuesta con información literal o una inferencia respaldada.<br><strong>ESTRATEGIA DE EXAMEN:</strong> identifica palabras determinantes y evita conclusiones absolutas no sustentadas.</div>';
  fs.querySelectorAll('input').forEach(x=>x.disabled=true);
 }
 graded=true;
 el('result').innerHTML='<h3>Resultado: '+correct+'/'+current.questions.length+' correctas ('+Math.round(correct/current.questions.length*100)+' %)</h3><p>Respondiste '+answered+' preguntas; '+(current.questions.length-answered)+' quedaron sin marcar. La calificación se basa en las claves publicadas en el cuadernillo y está sujeta a revisión de los textos digitalizados.</p>';
 el('grade').disabled=true;
 const right=document.querySelector('.exam-questions');
 if(right&&window.matchMedia('(min-width:851px)').matches)right.scrollTo({top:right.scrollHeight,behavior:'smooth'});
 else el('result').scrollIntoView({behavior:'smooth',block:'center'});
}
async function init(){
 try{
  if(!window.supabase||!window.SUPABASE_URL||!window.SUPABASE_ANON_KEY)throw Error('Falta la configuración de acceso.');
  const client=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
  const {data:{session},error:authError}=await client.auth.getSession();
  if(authError||!session?.user)throw Error('Inicia sesión en CachimboLab.');
  const {data:granted,error:permissionError}=await client.rpc('has_service_access',{p_modality:'BECA18'});
  if(permissionError||granted!==true)throw Error('No tienes contratado Beca 18. Contacta al administrador.');
  const r=await fetch('beca18-examenes-verbal.json',{cache:'no-store'});
  if(!r.ok)throw Error('No se pudo recuperar el banco de exámenes.');
  const data=await r.json();
  exams=data.exams||[];
  if(exams.length!==3||exams.some(x=>x.questions.length!==30))throw Error('Los bancos de preguntas no están completos.');
  el('grade').addEventListener('click',evaluate);
  el('restart').addEventListener('click',()=>showExam(current.year));
  showExam(2023);
 }catch(e){el('examStatus').textContent='Error de carga: '+e.message;}
}
init();
