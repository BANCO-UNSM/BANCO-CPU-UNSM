'use strict';
const el=id=>document.getElementById(id);
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let exams=[],current=null,answers={},graded=false,lastReadingId=null,questionObserver=null;
const mobileView=()=>window.matchMedia('(max-width:850px)').matches;
async function cargarImagenesBeca(raiz){
 for(const img of raiz.querySelectorAll('img[data-beca-private-src]')){
  const ruta=img.dataset.becaPrivateSrc;
  try{
   const uri=ruta.startsWith('data:image/')?ruta:await window.becaPrivate.image(ruta);
   if(!img.isConnected)return;
   img.src=uri; const enlace=img.closest('a');if(enlace){enlace.removeAttribute('href');enlace.removeAttribute('target');}
  }catch(error){const caja=img.closest('figure')||img.closest('.question-image')||img;caja.textContent='La ilustración no se pudo cargar: '+error.message;}
 }
}

// Presentación de las lecturas: separar títulos, subtítulos y párrafos de su contenido.
const readingTitles={
 '2024-T1':'¡Todos a usar uniforme!',
 '2024-T2':'Medición de radiación UV a nivel nacional',
 '2024-T3':'¿Se debería prohibir la tarea?',
 '2024-T4':'Rosita',
 '2024-T5':'Dulces sueños',
 '2024-T6':'Cómo prepararse para un examen: estos son los mejores consejos para tener éxito',
 '2025-T1':'La Desinformación en Redes Sociales: ¿Es posible combatirla?',
 '2025-T2':'¿Qué ocurre cuando se produce una lesión cerebral?',
 '2025-T3':'La Inseguridad Ciudadana en el Perú',
 '2025-T4':'El Alma Turbulenta de Julián',
 '2025-T5':'Océanos de Plástico: Una Amenaza Invisible que Ahoga Nuestro Planeta',
 '2025-T6':'Cómo Organizar tu Tiempo con un Horario Efectivo'
};
function renderPassage(group){
 const container=el('readingText');
 container.replaceChildren();
 let raw=String(group.passage||'').trim();
 if(!raw){container.textContent='Texto pendiente de revisión.';return;}
 const lead=raw.match(/^(?:TEXTO|Texto)\s+(\d+)\s*(?:\n+|\s+)(?=[\s\S])/);
 if(lead){
   const badge=document.createElement('div');
   badge.className='passage-kicker';badge.textContent='TEXTO '+lead[1];
   container.append(badge);raw=raw.slice(lead[0].length).trim();
 }
 const title=readingTitles[group.id];
 if(title&&raw.toLocaleLowerCase('es').startsWith(title.toLocaleLowerCase('es'))){
   raw=raw.slice(title.length).trim();
   const h=document.createElement('h3');h.className='passage-title';h.textContent=title;container.append(h);
 }
 // Numeración original (1), (2)... separada en párrafos sin alterar las frases.
 raw=raw.replace(/\s+(?=\([1-9]\)\s)/g,'\n\n');
 const pieces=raw.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
 for(const part of pieces){
   const secondText=/^TEXTO 2$/i.test(part);
   const secondTitle=part==='Uniforme: Reglamentación innecesaria';
   const sectionTitle=/^Artículo \d+:/i.test(part);
   const source=/^(?:Fuente[.:]|Adaptado de)/i.test(part);
   const node=document.createElement(secondText?'div':secondTitle?'h3':sectionTitle?'h4':'p');
   if(secondText)node.className='passage-kicker';
   if(secondTitle)node.className='passage-title';
   if(source)node.className='passage-source';
   node.textContent=part;
   container.append(node);
 }
}
// Visor de imagen en la misma página, con zoom mediante botones, rueda y arrastre.
let imageZoomLevel=1,imageZoomPanning=false,imageZoomLast={x:0,y:0},imageZoomOffset={x:0,y:0},imageZoomPreviousFocus=null;
function updateImageZoom(){
 const img=el('zoomImage');if(!img)return;
 img.style.transform='translate('+imageZoomOffset.x+'px,'+imageZoomOffset.y+'px) scale('+imageZoomLevel+')';
 el('zoomPercent').textContent=Math.round(imageZoomLevel*100)+' %';
}
function setImageZoom(level){
 imageZoomLevel=Math.max(1,Math.min(5,level));
 if(imageZoomLevel===1)imageZoomOffset={x:0,y:0};
 updateImageZoom();
}
function openImageZoom(image){
 if(!image?.complete||!image.naturalWidth||!image.src)return;
 const modal=el('imageZoomModal');if(!modal)return;
 imageZoomPreviousFocus=document.activeElement;
 const displayed=el('zoomImage');displayed.src=image.src;displayed.alt=image.alt;
 modal.hidden=false;document.body.classList.add('zoom-open');
 setImageZoom(1);el('zoomClose').focus();
}
function closeImageZoom(){
 const modal=el('imageZoomModal');if(!modal||modal.hidden)return;
 modal.hidden=true;document.body.classList.remove('zoom-open');
 el('zoomImage').removeAttribute('src');
 if(imageZoomPreviousFocus?.isConnected)imageZoomPreviousFocus.focus();
}
function initImageZoom(){
 const modal=el('imageZoomModal');if(!modal)return;
 el('zoomClose').onclick=closeImageZoom;
 el('zoomIn').onclick=()=>setImageZoom(imageZoomLevel+.25);
 el('zoomOut').onclick=()=>setImageZoom(imageZoomLevel-.25);
 el('zoomReset').onclick=()=>setImageZoom(1);
 modal.addEventListener('click',e=>{if(e.target===modal||e.target.classList.contains('zoom-viewport'))closeImageZoom();});
 modal.addEventListener('wheel',e=>{if(modal.hidden)return;e.preventDefault();setImageZoom(imageZoomLevel+(e.deltaY<0?.2:-.2));},{passive:false});
 const view=el('zoomViewport');
 view.addEventListener('pointerdown',e=>{
  if(imageZoomLevel<=1||e.target!==el('zoomImage'))return;
  imageZoomPanning=true;imageZoomLast={x:e.clientX,y:e.clientY};view.setPointerCapture(e.pointerId);
 });
 view.addEventListener('pointermove',e=>{
  if(!imageZoomPanning)return;
  imageZoomOffset.x+=e.clientX-imageZoomLast.x;imageZoomOffset.y+=e.clientY-imageZoomLast.y;
  imageZoomLast={x:e.clientX,y:e.clientY};updateImageZoom();
 });
 view.addEventListener('pointerup',()=>{imageZoomPanning=false;});
 view.addEventListener('pointercancel',()=>{imageZoomPanning=false;});
 document.addEventListener('keydown',e=>{
  if(modal.hidden)return;
  if(e.key==='Escape')closeImageZoom();
  else if(e.key==='+'||e.key==='='){e.preventDefault();setImageZoom(imageZoomLevel+.25);}
  else if(e.key==='-'){e.preventDefault();setImageZoom(imageZoomLevel-.25);}
 });
}
function questionGroup(q){return current.groups[q.group]||{passage:'Lectura no disponible',pages:'—'};}
function selectedGroupIndex(){return current?.groups.findIndex(g=>g.id===lastReadingId)??-1;}
function navigateToGroup(index){
 if(!current||index<0||index>=current.groups.length)return;
 const group=current.groups[index];
 const first=current.questions.find(q=>q.group===index);
 if(!first)return;
 showReading(first);
 if(mobileView()){
  updateMobileQuestionGroup();
  document.querySelector('.exam-reading')?.scrollIntoView({behavior:'smooth',block:'start'});
  return;
 }
 const target=el('p'+first.number);
 const right=document.querySelector('.exam-questions');
 if(target&&right){right.scrollTop+=target.getBoundingClientRect().top-right.getBoundingClientRect().top-15;}
}
function refreshReadingNavigation(){
 if(!current)return;
 const index=selectedGroupIndex();
 el('readingSelect').value=String(index);
 el('readingCounter').textContent=(index+1)+' / '+current.groups.length;
 el('previousReading').disabled=index<=0;
 el('nextReading').disabled=index>=current.groups.length-1;
}
function updateMobileQuestionGroup(){
 if(!current)return;
 const index=selectedGroupIndex();
 const mobile=mobileView();
 el('mobileReadingGuide').hidden=!mobile;
 document.querySelector('.exam-questions')?.classList.toggle('mobile-last-reading',mobile&&index===current.groups.length-1);
 el('questionsTitle').textContent=mobile?'Preguntas del texto '+(index+1)+' · '+current.year:'Preguntas 31 a 60 · '+current.year;
 el('mobileReadingLabel').textContent='Texto '+(index+1)+' de '+current.groups.length+' · preguntas '+current.groups[index].first+'–'+current.groups[index].last;
 const next=el('mobileNextReading');
 next.textContent=index>=current.groups.length-1?'Último texto':'Siguiente texto →';
 next.disabled=index>=current.groups.length-1;
 el('questions').querySelectorAll('fieldset.question').forEach(fs=>{
  const q=current.questions.find(x=>x.number===Number(fs.dataset.number));
  fs.hidden=mobile&&q?.group!==index;
 });
}
function showReading(q){
 const g=questionGroup(q);
 if(lastReadingId===g.id)return;
 lastReadingId=g.id;
 refreshReadingNavigation();
 const left=document.querySelector('.exam-reading');
 if(left)left.scrollTop=0;
 el('readingTitle').textContent='Lectura del examen '+current.year+' · preguntas '+g.first+'–'+g.last;
 el('readingInfo').textContent='Lee el texto y observa las imágenes o infografías que aparecen al final.';
 renderPassage(g);
 const images=Array.isArray(g.images)?g.images:[];
 const holder=el('originalPages');
 if(holder){
  holder.innerHTML=images.map((src,i)=>'<figure class="exam-illustration"><button type="button" class="image-zoom-trigger" title="Ampliar la imagen sin salir del examen" aria-label="Ampliar ilustración '+(i+1)+'"><img data-beca-private-src="'+escapeHtml(src)+'" loading="lazy" alt="Gráfico o ilustración '+(i+1)+' correspondiente a la lectura '+escapeHtml(g.id)+'"></button><figcaption>🔍 Haz clic para ampliar la imagen</figcaption></figure>').join('');
   cargarImagenesBeca(holder);
  holder.hidden=images.length===0;
  holder.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.closest('figure').innerHTML='<p class="warning">La imagen correspondiente no está disponible. Consulta el PDF original.</p>';},{once:true}));
  holder.querySelectorAll('.image-zoom-trigger').forEach(btn=>btn.addEventListener('click',()=>openImageZoom(btn.querySelector('img'))));
 }
 updateMobileQuestionGroup();
}


// En celulares se muestra cada lectura inmediatamente antes de SUS preguntas.
// No depende de que el alumno pulse "Siguiente" ni de paneles independientes.
function renderMobileSequentialExam(){
 const host=el('questions');
 if(!mobileView()||!current||!host)return;
 document.body.classList.add('mobile-sequential-exam');
 const nodes=[...host.querySelectorAll('fieldset.question')];
 const groups=current.groups;
 host.replaceChildren();
 groups.forEach((g,i)=>{
  const section=document.createElement('section');
  section.className='mobile-exam-group';
  section.id='mobile-text-'+i;
  const title=document.createElement('h2');
  title.textContent='Texto '+(i+1)+' de '+groups.length+' · preguntas '+g.first+'–'+g.last;
  section.append(title);
  const passage=document.createElement('div');
  passage.className='reading-text mobile-passage';
  const titleText=readingTitles[g.id];
  let raw=String(g.passage||'').trim();
  raw=raw.replace(/^(?:TEXTO|Texto)\\s+\\d+\\s*/,'').trim();
  if(titleText&&raw.toLocaleLowerCase('es').startsWith(titleText.toLocaleLowerCase('es'))){
   const heading=document.createElement('h3');heading.className='passage-title';heading.textContent=titleText;passage.append(heading);
   raw=raw.slice(titleText.length).trim();
  }
  raw.split(/\\n\\s*\\n/).filter(Boolean).forEach(part=>{
   const p=document.createElement('p');p.textContent=part.trim();passage.append(p);
  });
  section.append(passage);
  const imgs=document.createElement('div');imgs.className='original-pages';
  (g.images||[]).forEach((src,k)=>{
   const figure=document.createElement('figure');figure.className='exam-illustration';
   const btn=document.createElement('button');btn.type='button';btn.className='image-zoom-trigger';btn.setAttribute('aria-label','Ampliar infografía '+(k+1));
   const img=document.createElement('img');img.dataset.becaPrivateSrc=src;img.alt='Infografía del texto '+(i+1);img.loading='lazy';
   btn.append(img);btn.addEventListener('click',()=>openImageZoom(img));
   const cap=document.createElement('figcaption');cap.textContent='🔍 Toca la imagen para ampliarla';
   figure.append(btn,cap);imgs.append(figure);
  });
  section.append(imgs);
  const qt=document.createElement('h3');qt.textContent='Preguntas '+g.first+'–'+g.last;section.append(qt);
  nodes.filter(fs=>current.questions.find(q=>q.number===Number(fs.dataset.number))?.group===i).forEach(fs=>{
   fs.hidden=false;
   fs.querySelectorAll('.visual-desktop').forEach(x=>x.remove());
   fs.querySelectorAll('.visual-mobile').forEach(x=>x.remove());
   section.append(fs);
  });
  if(i<groups.length-1){
   const next=document.createElement('button');next.type='button';next.className='mobile-next-inline';next.textContent='Continuar al texto '+(i+2)+' →';
   next.addEventListener('click',()=>document.getElementById('mobile-text-'+(i+1))?.scrollIntoView({behavior:'smooth',block:'start'}));
   section.append(next);
  }
  host.append(section);
  cargarImagenesBeca(imgs);
 });
 el('questionsTitle').textContent='Lecturas y preguntas · '+current.year;
}
function showExam(year){
 if(questionObserver){questionObserver.disconnect();questionObserver=null;}
 lastReadingId=null;
 current=exams.find(e=>e.year===year)||exams[0];answers={};graded=false;
 el('examNav').innerHTML=exams.map(e=>'<button type="button" data-year="'+e.year+'" class="'+(e.year===current.year?'selected':'')+'">Examen '+e.year+'</button>').join('')+'<a href="beca18-clases.html">📚 Volver a clases</a>';
 el('questionsTitle').textContent='Preguntas 31 a 60 · '+current.year;
 el('readingSelect').innerHTML=current.groups.map((g,i)=>'<option value="'+i+'">Texto '+(i+1)+' · preguntas '+g.first+'–'+g.last+'</option>').join('');
 el('readingSelect').onchange=e=>navigateToGroup(Number(e.target.value));
 el('previousReading').onclick=()=>navigateToGroup(selectedGroupIndex()-1);
 el('nextReading').onclick=()=>navigateToGroup(selectedGroupIndex()+1);
 el('mobileNextReading').onclick=()=>navigateToGroup(selectedGroupIndex()+1);
 el('questions').innerHTML=current.questions.map(q=>{
 const label=q.needs_visual?'<p class="warning small visual-desktop">Observa la infografía o ilustración que aparece debajo de la lectura, en el panel izquierdo.</p><p class="warning small visual-mobile">Consulta la infografía que aparece junto a esta lectura, antes de responder.</p>':'';
 const qimg=q.image?'<div class="question-image"><img loading="lazy" data-beca-private-src="'+escapeHtml(q.image)+'" alt="Imagen o figura asociada a la pregunta '+q.number+'"></div>':'';
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
  fs.addEventListener('focusin',()=>{if(!mobileView())showReading(q)});
  fs.addEventListener('click',()=>{if(!mobileView())showReading(q)});
 });
 // Al desplazarse por la lista de preguntas, cambiar de lectura solo cuando comienza otro bloque.
 // Durante las preguntas de un mismo texto, el panel izquierdo permanece inmóvil.
 const right=document.querySelector('.exam-questions');
 if(right&&!mobileView()&&'IntersectionObserver' in window){
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
 updateMobileQuestionGroup();
 renderMobileSequentialExam();
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
 initImageZoom();
 try{
  if(!window.supabase||!window.SUPABASE_URL||!window.SUPABASE_ANON_KEY)throw Error('Falta la configuración de acceso.');
  const client=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
  const {data:{session},error:authError}=await client.auth.getSession();
  if(authError||!session?.user)throw Error('Inicia sesión en CachimboLab.');
  const {data:granted,error:permissionError}=await client.rpc('has_service_access',{p_modality:'BECA18'});
  if(permissionError||granted!==true)throw Error('No tienes contratado Beca 18. Contacta al administrador.');
  const data=await window.becaPrivate.document('beca18-examenes-verbal.json');
  exams=data.exams||[];
  if(exams.length!==3||exams.some(x=>x.questions.length!==30))throw Error('Los bancos de preguntas no están completos.');
  el('grade').addEventListener('click',evaluate);
  el('restart').addEventListener('click',()=>showExam(current.year));
  showExam(2023);
  window.matchMedia('(max-width:850px)').addEventListener('change',()=>{
   if(!current)return;
   if(questionObserver){questionObserver.disconnect();questionObserver=null;}
   updateMobileQuestionGroup();
  });
 }catch(e){el('examStatus').textContent='Error de carga: '+e.message;}
}
init();
