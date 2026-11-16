(function(){
'use strict';
const root=document.getElementById('p8');if(!root)return;
const week=Number(document.body.dataset.week||0),course=document.body.dataset.course;
if(!week)return;
const available=Boolean(course)&&week>=1&&week<=16;
const host=document.createElement('div');host.id='cpu-official-practice';
host.innerHTML='<p id="cpu-practice-status" aria-live="polite">Cargando práctica oficial…</p><div id="cpu-practice-body"></div>';
const oldNotice=root.querySelector(':scope > p:last-of-type');if(oldNotice)oldNotice.hidden=true;
root.appendChild(host);
const style=document.createElement('style');style.textContent='#cpu-official-practice{margin-top:16px;padding:16px;border:1px solid #c9dfed;border-radius:14px;background:#f5faff;color:#15344d}#cpu-official-practice .cpu-question{font-weight:700;white-space:pre-wrap;margin:14px 0}#cpu-official-practice .cpu-option{display:block;width:100%;text-align:left;margin:7px 0;padding:11px;border:1px solid #b7cfe1;border-radius:9px;background:#fff;color:#15344d;cursor:pointer}#cpu-official-practice .cpu-option:disabled{cursor:default}#cpu-official-practice .cpu-option.cpu-correct{border-color:#1874c7;background:#e4f2ff}#cpu-official-practice .cpu-option.cpu-incorrect{border-color:#c24c55;background:#ffe9ec}#cpu-official-practice .cpu-explanation{white-space:pre-wrap;line-height:1.6;background:#eaf3f8;padding:12px;border-radius:9px;margin:12px 0}#cpu-official-practice .cpu-progress{font-size:13px;color:#47657b}#cpu-official-practice .cpu-next{padding:10px 15px;background:#087f79;color:white;border:0;border-radius:9px;cursor:pointer} #cpu-official-practice .cpu-verdict{display:flex;align-items:center;gap:9px;margin:13px 0 8px;font-weight:750;font-size:16px}#cpu-official-practice .cpu-verdict.correct{color:#1269bd}#cpu-official-practice .cpu-verdict.incorrect{color:#c12637}#cpu-official-practice .cpu-symbol{font-size:21px;font-weight:900}#cpu-official-practice .cpu-answer{font-weight:700;margin:6px 0 12px}';document.head.appendChild(style);
const status=host.querySelector('#cpu-practice-status'),body=host.querySelector('#cpu-practice-body');
const label=i=>String.fromCharCode(65+i);
const cleanOption=opt=>String(opt??'').replace(/^\s*(?:\(?[A-Ea-e]\s*[).:\-]\s*)+/, '').trim();
let pendingAnswer=null;
let questions=[],index=0,correct=0,answered=false,totalQuestions=0,complete=false;
function explanationFor(q){return String(q.explanation||'').replace(/^\s*RESPUESTA\s+CORRECTA\s*:\s*[^\r\n]*(?:\r?\n)*/i,'').trim();}

function textEl(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;el.textContent=String(text??'');return el}
function draw(){body.replaceChildren();if(index>=questions.length){if(!complete){status.textContent='Preparando las siguientes preguntas…';body.append(textEl('p','', 'Las siguientes preguntas aparecerán automáticamente.'));return}status.textContent='Práctica oficial completada.';body.append(textEl('h3','', 'Resultado: '+correct+' de '+questions.length+' respuestas correctas.'));const restart=textEl('button','cpu-next','Volver a practicar');restart.onclick=()=>{index=0;correct=0;draw()};body.append(restart);return}
 const q=questions[index];answered=false;status.textContent='Pregunta '+(index+1)+' de '+(totalQuestions||questions.length)+' · Semana '+week;

 body.append(textEl('div','cpu-question',q.statement));
 const choices=document.createElement('div');const verdict=textEl('div','cpu-verdict','');verdict.hidden=true;verdict.setAttribute('role','status');const answer=textEl('p','cpu-answer','');answer.hidden=true;const feedback=textEl('div','cpu-explanation','');feedback.hidden=true;
 const next=textEl('button','cpu-next',index===questions.length-1&&complete?'Ver resultado':'Siguiente pregunta →');next.hidden=true;next.onclick=()=>{index++;draw()};
 (q.options||[]).forEach((opt,j)=>{const btn=textEl('button','cpu-option',label(j)+') '+cleanOption(opt));btn.type='button';btn.onclick=()=>{if(answered)return;
if(q.secure===true&&!Number.isInteger(q.correct_index)){
 if(pendingAnswer)return;
 pendingAnswer={id:q.id,index:j,button:btn};
 window.parent.postMessage({type:'cachimbolab-library-check',question_id:q.id,selected_index:j},'*');
 return;
}
answered=true;const hit=j===q.correct_index;if(hit)correct++;choices.querySelectorAll('button').forEach((b,k)=>{b.disabled=true;if(k===q.correct_index)b.classList.add('cpu-correct');else if(k===j)b.classList.add('cpu-incorrect')});verdict.className='cpu-verdict '+(hit?'correct':'incorrect');verdict.replaceChildren(textEl('span','cpu-symbol',hit?'✓':'✗'),textEl('span','',hit?'¡Respuesta correcta!':'Respuesta incorrecta'));verdict.hidden=false;if(!hit){answer.textContent='La respuesta correcta es: '+label(q.correct_index)+') '+q.options[q.correct_index];answer.hidden=false}const explanation=explanationFor(q);if(explanation){feedback.textContent='Explicación: '+explanation;feedback.hidden=false}else{feedback.textContent='';feedback.hidden=true}next.hidden=false};choices.append(btn)});
 body.append(choices,verdict,answer,feedback,next);
}
window.addEventListener('message',e=>{
 if(e.source!==window.parent||e.data?.type!=='cachimbolab-library-result'||!pendingAnswer||e.data.question_id!==pendingAnswer.id)return;
 const pending=pendingAnswer;
 if(e.data.error){status.textContent='No se pudo comprobar la respuesta: '+String(e.data.error);pendingAnswer=null;return;}
 const q=questions[index];
 if(!q||q.id!==pending.id)return;
 q.correct_index=Number(e.data.correct_index);
 q.explanation=String(e.data.explanation||'');
 if(!Number.isInteger(q.correct_index)||q.correct_index<0||q.correct_index>=q.options.length){
  status.textContent='No se pudo verificar la clave de esta pregunta.';pendingAnswer=null;return;
 }
 pendingAnswer=null;
 pending.button.click();
});
window.addEventListener('message',e=>{
 if(e.source!==window.parent||e.origin!==window.location.origin||e.data?.type!=='cachimbolab-nuevos-questions'||Number(e.data.week)!==week||e.data.course!==course)return;
 if(e.data.error){if(!questions.length)status.textContent=e.data.error;return}
 const items=e.data.questions;if(!Array.isArray(items))return;
 const valid=items.filter(q=>q&&typeof q.statement==='string'&&Array.isArray(q.options)&&(q.secure===true||(Number.isInteger(q.correct_index)&&q.correct_index>=0&&q.correct_index<q.options.length)));
 if(e.data.append){
   const previous=questions.length;const known=new Set(questions.map(q=>q.id));
   questions.push(...valid.filter(q=>!known.has(q.id)));
   complete=Boolean(e.data.complete);
   if(index>=previous&&questions.length>previous)draw();
   else if(index<questions.length)status.textContent='Pregunta '+(index+1)+' de '+(totalQuestions||questions.length)+' · Semana '+week;
 }else{
   questions=valid;index=0;correct=0;totalQuestions=Number(e.data.total)||valid.length;complete=Boolean(e.data.complete);
   if(!questions.length){status.textContent='No se encontraron preguntas oficiales completas para esta semana.';return}
   draw();
 }
});
if(!available){status.textContent='La práctica oficial se cargará cuando existan preguntas publicadas para esta semana.';return}
if(window.parent===window){status.textContent='Para realizar las preguntas oficiales, abre esta semana desde la biblioteca de CachimboLab.';return}
status.textContent='Esperando las preguntas oficiales del banco de CachimboLab…';
window.parent.postMessage({type:'cachimbolab-nuevos-ready',week,course},window.location.origin);
})();