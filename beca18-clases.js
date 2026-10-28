'use strict';let lessons=[],questions=[],area='Números',active='N01',progress={},progressKey='',startedAt=0,retryOnly=false;const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));function saveProgress(){try{if(progressKey)localStorage.setItem(progressKey,JSON.stringify(progress));}catch(e){console.warn('El navegador no pudo guardar el progreso local.',e);}}
function progressSummary(){
 const done=lessons.filter(l=>progress[l.id]?.total>0);
 const sum=done.length,avg=sum?Math.round(done.reduce((n,l)=>n+100*progress[l.id].score/progress[l.id].total,0)/sum):0;
 const el=$('progressSummary');
 if(el)el.textContent='Clases practicadas: '+sum+'/'+lessons.length+' · Promedio de últimos intentos: '+avg+' % · Progreso local (no sincronizado entre dispositivos).';
 const diag=$('diagnostic');
 if(!diag)return;
 const byArea=['Números','Letras'].map(a=>{const rows=lessons.filter(l=>l.area===a&&progress[l.id]?.total>0);const av=rows.length?Math.round(rows.reduce((v,l)=>v+100*progress[l.id].score/progress[l.id].total,0)/rows.length):0;return '<div class="box"><strong>'+esc(a)+'</strong><p>'+rows.length+'/12 clases practicadas · Promedio '+av+' %</p></div>'}).join('');
 const weakest=done.filter(l=>progress[l.id].score/progress[l.id].total<0.7).sort((a,b)=>progress[a.id].score/progress[a.id].total-progress[b.id].score/progress[b.id].total).slice(0,3);
 diag.innerHTML='<h3>Mi diagnóstico</h3>'+byArea+(weakest.length?'<p><strong>Refuerza:</strong> '+weakest.map(l=>esc(l.id)+' — '+esc(l.title)).join('; ')+'</p>':'<p class="muted">Completa prácticas para identificar temas que requieran refuerzo.</p>');
}
function draw(){
 startedAt=Date.now();
 document.querySelectorAll('[data-area]').forEach(b=>b.classList.toggle('active',b.dataset.area===area));
 $('topics').innerHTML=lessons.filter(x=>x.area===area).map(x=>'<button class="topic '+(x.id===active?'selected':'')+'" data-id="'+esc(x.id)+'"><strong>'+esc(x.id)+' · '+esc(x.title)+'</strong><br><small class="muted">'+(progress[x.id]?'Último intento: '+progress[x.id].score+'/'+progress[x.id].total:(x.status==='desarrollada_para_revision'?'Teoría y práctica':'Introducción disponible'))+'</small></button>').join('');
 document.querySelectorAll('.topic').forEach(b=>b.onclick=()=>{active=b.dataset.id;retryOnly=false;draw();});progressSummary();
 const x=lessons.find(z=>z.id===active);if(!x)return;
 const allQs=questions.filter(q=>q.lesson_id===x.id);
 const previouslyWrong=progress[x.id]?.wrongIds||[];
 const qs=retryOnly&&previouslyWrong.length?allQs.filter(q=>previouslyWrong.includes(q.id)):allQs;
 const objectives=Array.isArray(x.objectives)?'<h3>Objetivos</h3><ul>'+x.objectives.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>':'';
 const theory=Array.isArray(x.theory)?'<h3>📘 Teoría paso a paso</h3>'+x.theory.map(t=>'<section class="theory"><h4>'+esc(t.heading)+'</h4><p>'+esc(t.content)+'</p><div class="box"><strong>Recuerda:</strong> '+esc(t.key)+'</div></section>').join(''):'<div class="box"><strong>Idea clave</strong><p>'+esc(x.principle)+'</p></div>';
 const examples=Array.isArray(x.examples)?'<h3>🧠 Ejercicios resueltos</h3>'+x.examples.map(e=>'<section class="example"><h4>'+esc(e.title)+'</h4><p>'+esc(e.statement)+'</p><ol>'+e.steps.map(st=>'<li>'+esc(st)+'</li>').join('')+'</ol><strong>Resultado: '+esc(e.answer)+'</strong></section>').join(''):'<h3>Ejemplo introductorio</h3><p>'+esc(x.worked_example)+'</p>';
 const mistakes=Array.isArray(x.mistakes)?'<h3>⚠️ Errores frecuentes</h3><ul>'+x.mistakes.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>':'';
 const references=Array.isArray(x.references)?'<details><summary>Fuentes de referencia</summary><ul>'+x.references.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul></details>':'';
 const examRefs=Array.isArray(x.exam_references)&&x.exam_references.length?'<details><summary>📎 Referencias temáticas a exámenes 2023, 2024 y 2025</summary><p class="muted">Se indican año y número de pregunta para ubicarla en los exámenes adjuntos; los ejercicios aquí son originales.</p><ul>'+x.exam_references.map(r=>'<li>Convocatoria '+esc(r.year)+' · Pregunta '+esc(r.question)+'</li>').join('')+'</ul></details>':'';
 const practice=qs.length?'<h3>📝 Práctica: '+qs.length+' preguntas originales</h3><p class="muted">El resultado se muestra en pantalla. No se guarda en Supabase. Las preguntas y explicaciones están en revisión.</p><div id="practiceQuestions">'+qs.map((q,i)=>'<fieldset class="question"><legend>'+(i+1)+'. '+esc(q.statement)+'</legend>'+q.options.map((v,j)=>'<label><input type="radio" name="q'+i+'" value="'+j+'"> '+String.fromCharCode(65+j)+') '+esc(v)+'</label>').join('')+'</fieldset>').join('')+'</div><button class="check" id="check">Calificar práctica</button><div id="feedback" aria-live="polite"></div>':'<div class="box">Esta clase tiene una introducción; el banco de práctica está pendiente de elaboración.</div>';
 $('lesson').innerHTML='<span class="badge">'+esc(x.competence)+'</span><h2>'+esc(x.id)+' · '+esc(x.title)+'</h2><p><strong>Duración sugerida:</strong> '+esc(x.duration_minutes)+' minutos</p><p class="muted">Tema: '+esc(x.topics)+'</p>'+objectives+theory+examples+mistakes+references+examRefs+practice;
 if(qs.length){
 const retry=$('retryWrong');if(retry)retry.onclick=()=>{retryOnly=!retryOnly;draw();};
 $('check').onclick=()=>{
  let score=0,answered=0;
  const wrongIds=[];
  let details=qs.map((q,i)=>{
   const chosen=document.querySelector('input[name="q'+i+'"]:checked');
   if(chosen){answered++;if(Number(chosen.value)===q.correct_index)score++;else wrongIds.push(q.id);}else wrongIds.push(q.id);
   return '<details><summary>Pregunta '+(i+1)+' · '+(chosen?(Number(chosen.value)===q.correct_index?'Correcta':'Para revisar'):'Sin responder')+'</summary><p>'+esc(q.explanation.correct)+'</p><p>'+esc(q.explanation.alternatives)+'</p><p>'+esc(q.explanation.memory)+'</p><p>'+esc(q.explanation.strategy)+'</p></details>';
  }).join('');
  const seconds=Math.max(0,Math.round((Date.now()-startedAt)/1000));
  const wasRetry=retryOnly;
  const last=progress[x.id]||{};
  const mergedWrong=wasRetry?[...new Set([...(last.wrongIds||[]).filter(id=>!qs.some(q=>q.id===id)),...wrongIds])]:wrongIds;
  const attempt={score,total:qs.length,answered,seconds,date:new Date().toISOString(),wasRetry,wrongIds};
  progress[x.id]={...attempt,wrongIds:mergedWrong,history:[...(last.history||[]).slice(-9),attempt]};
  saveProgress();progressSummary();
  const retryButton=$('retryWrong');
  if(retryButton)retryButton.textContent=retryOnly?'Volver a práctica completa':'Reintentar '+mergedWrong.length+' preguntas falladas';
  const recommendation=score===qs.length?'¡Buen trabajo! Repasa la teoría antes de continuar.':score/qs.length>=0.7?'Vas avanzando. Revisa las preguntas falladas antes de la siguiente clase.':'Conviene repasar la teoría y los ejemplos de esta clase antes de intentarlo de nuevo.';
  $('feedback').innerHTML='<div class="feedback '+(score===qs.length?'':'wrong')+'"><strong>Puntaje: '+score+'/'+qs.length+'</strong> · Respondidas: '+answered+' · Tiempo: '+Math.floor(seconds/60)+' min '+(seconds%60)+' s<p>'+esc(recommendation)+'</p><p>Resultado almacenado localmente; no equivale a una calificación oficial de Beca 18.</p>'+details+'</div>';
 };
 }
}
document.querySelectorAll('[data-area]').forEach(b=>b.onclick=()=>{area=b.dataset.area;active=lessons.find(l=>l.area===area)?.id;retryOnly=false;draw()});async function validarAcceso(){if(!window.supabase||!window.SUPABASE_URL||!window.SUPABASE_ANON_KEY)throw Error('No se encuentra la configuración de acceso.');const client=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);const {data:{session},error}=await client.auth.getSession();if(error||!session?.user)throw Error('Inicia sesión desde CachimboLab para acceder a las clases.');progressKey='beca18_progress_v1_'+session.user.id;try{progress=JSON.parse(localStorage.getItem(progressKey)||'{}')||{};}catch(e){progress={};}const {data:profile,error:profileError}=await client.from('profiles').select('role').eq('id',session.user.id).maybeSingle();if(profileError)throw Error('No se pudo validar tu perfil.');if(!['teacher','admin'].includes(profile?.role)){const {data:active,error:accessError}=await client.rpc('has_valid_subscription');if(accessError||!active)throw Error('Tu suscripción no está activa. Accede desde el panel de CachimboLab.');}}
validarAcceso().then(()=>fetch('beca18-clases.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('No se pudo cargar el temario');return r.json()}).then(d=>{lessons=d.lessons;questions=d.questions;draw()})).catch(e=>{$('lesson').textContent=e.message;});