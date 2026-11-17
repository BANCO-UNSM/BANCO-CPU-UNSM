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
const mobileMathStyle=document.createElement('style');mobileMathStyle.textContent='#cpu-official-practice .cpu-explanation{white-space:normal;min-width:0;max-width:100%;overflow:hidden}#cpu-official-practice .cpu-explanation-title{font-weight:800;margin-bottom:10px;white-space:normal}#cpu-official-practice .cpu-explanation-line{display:block;width:100%;max-width:100%;overflow-x:auto;overflow-y:hidden;white-space:nowrap;overflow-wrap:normal;word-break:normal;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y;padding:8px 2px;box-sizing:border-box;scrollbar-width:thin}#cpu-official-practice .cpu-explanation-line .katex{white-space:nowrap}#cpu-official-practice .cpu-explanation-line .katex-display{margin:.3em 0;text-align:left;overflow:visible}#cpu-official-practice .cpu-explanation-line .cpu-math{display:inline-block;vertical-align:middle}';mobileMathStyle.textContent += '#cpu-official-practice .cpu-explanation-line{white-space:normal;overflow-x:visible;overflow-wrap:anywhere;word-break:normal;line-height:1.7;padding:6px 0}#cpu-official-practice .cpu-explanation{overflow:visible}#cpu-official-practice .cpu-explanation-line .katex-display{overflow-x:auto;max-width:100%}';mobileMathStyle.textContent += '#cpu-official-practice .cpu-equation{overflow-x:auto!important;overflow-wrap:normal!important;white-space:nowrap!important}#cpu-official-practice .cpu-equation .katex-display{min-width:max-content;max-width:none;overflow:visible}#cpu-official-practice .cpu-math-error{color:#b42318;white-space:pre-wrap}';mobileMathStyle.textContent += '#cpu-official-practice .cpu-explanation{font-size:14px;line-height:1.55}#cpu-official-practice .cpu-explanation .katex{font-size:1.1em}#cpu-official-practice .cpu-explanation{width:100%;max-width:100%;padding:14px;box-sizing:border-box;overflow-wrap:anywhere}#cpu-official-practice .cpu-explanation-line{display:block;max-width:100%;margin:0 0 12px;white-space:normal!important;overflow-wrap:break-word!important;word-break:normal!important;line-height:1.65;text-align:left;overflow-x:visible!important}#cpu-official-practice .cpu-explanation-line:last-child{margin-bottom:0}';document.head.appendChild(mobileMathStyle);
const status=host.querySelector('#cpu-practice-status'),body=host.querySelector('#cpu-practice-body');
const label=i=>String.fromCharCode(65+i);
const cleanOption=opt=>String(opt??'').replace(/^\s*(?:\(?[A-Ea-e]\s*[).:\-]\s*)+/, '').trim();
let pendingAnswer=null;
let questions=[],index=0,correct=0,answered=false,totalQuestions=0,complete=false;

function normalizeExplanation(value){
 let s=String(value||'').replace(/\r\n?/g,'\n');
 // Recover delimiters split by the import process: backslash, newline, bracket.
 s=s.replace(/\\[ \t]*\n[ \t]*([\[\]()])/g,'\\$1');
 // Reduce duplicated command slashes, without destroying aligned row breaks.
 s=s.replace(/\\{2,}(?=(?:begin|end|frac|dfrac|tfrac|text|boxed|cdot|times|div|left|right|sqrt|displaystyle|mathrm|overline|underbrace|quad|qquad)\b)/g,'\\');
 s=s.replace(/\\{2,}([\[\]()])/g,'\\$1');
 // Some records have a bare math environment instead of display delimiters.
 s=s.replace(/\\begin\{(aligned|align|gathered|array|equation|split)\}[\s\S]*?\\end\{\1\}/g,(block,env,offset,all)=>{
   const before=all.slice(0,offset).trimEnd(),after=all.slice(offset+block.length).trimStart();
   if(before.endsWith('\\[')||before.endsWith('$$')||after.startsWith('\\]')||after.startsWith('$$'))return block;
   return '\\['+block+'\\]';
 });
 return s;
}
function explanationFor(q){return String(q.explanation||'').replace(/^\s*RESPUESTA\s+CORRECTA\s*:\s*[^\r\n]*(?:\r?\n)*/i,'').trim();}

function textEl(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;el.textContent=String(text??'');return el}
function renderMath(tex,display){
 const node=document.createElement(display?'div':'span');node.className='cpu-math';
 if(!window.katex){node.textContent=tex;return node;}
 try{window.katex.render(tex,node,{throwOnError:true,displayMode:display,strict:'ignore',trust:false});}
 catch(err){node.classList.add('cpu-math-error');node.textContent=tex;}
 return node;
}
function appendFormattedMath(container,value){
 const raw=normalizeExplanation(value);
 const token=/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g;
 let pos=0,match;
 while((match=token.exec(raw))){
  if(match.index>pos)container.append(document.createTextNode(raw.slice(pos,match.index)));
  const t=match[0],display=t.startsWith('\\[')||t.startsWith('$$');
  container.append(renderMath(t.slice(display?2:t.startsWith('\\(')?2:1,display?-2:t.startsWith('\\(')?-2:-1),display));
  pos=token.lastIndex;
 }
 if(pos<raw.length)container.append(document.createTextNode(raw.slice(pos)));
}
function formatMath(container){
 const raw=container.textContent||'';container.replaceChildren();appendFormattedMath(container,raw);
}
function formatSolutionStep(line){
 const value=String(line||'').trim();
 if(!value||/\\\[|\\\(|\$\$|\\begin\{/.test(value))return value;
 if(!/[=<>]/.test(value)||/[¿?¡!]/.test(value))return value;
 // Only convert standalone equations, never prose or explanatory sentences.
 if(/[ÁÉÍÓÚáéíóú]|(?:\b(?:por|para|según|entonces|donde|respuesta|resultado)\b)/i.test(value))return value;
 if(!/^[\w\s.,+\-*/^()=<>×÷%]+$/.test(value))return value;
 let tex=value.replace(/(\d+)\s*\/\s*\(([^()]+)\)/g,(_,n,den)=>'\\frac{'+n+'}{'+den+'}')
  .replace(/(\d+)\s*\/\s*([a-zA-Z]\w*)/g,(_,n,den)=>'\\frac{'+n+'}{'+den+'}')
  .replace(/([a-zA-Z0-9])\s*\^\s*(\d+)/g,'$1^{$2}')
  .replace(/×/g,'\\cdot ').replace(/÷/g,'\\div ');
 return '\\['+tex+'\\]';
}
function mathText(tag,cls,value){const node=textEl(tag,cls,value);formatMath(node);return node}
function draw(){body.replaceChildren();if(index>=questions.length){if(!complete){status.textContent='Preparando las siguientes preguntas…';body.append(textEl('p','', 'Las siguientes preguntas aparecerán automáticamente.'));return}status.textContent='Práctica oficial completada.';body.append(textEl('h3','', 'Resultado: '+correct+' de '+questions.length+' respuestas correctas.'));const restart=textEl('button','cpu-next','Volver a practicar');restart.onclick=()=>{index=0;correct=0;draw()};body.append(restart);return}
 const q=questions[index];answered=false;status.textContent='Pregunta '+(index+1)+' de '+(totalQuestions||questions.length)+' · Semana '+week;

 body.append(mathText('div','cpu-question',q.statement));
 const choices=document.createElement('div');const verdict=textEl('div','cpu-verdict','');verdict.hidden=true;verdict.setAttribute('role','status');const answer=textEl('p','cpu-answer','');answer.hidden=true;const feedback=textEl('div','cpu-explanation','');feedback.hidden=true;
 const next=textEl('button','cpu-next',index===questions.length-1&&complete?'Ver resultado':'Siguiente pregunta →');next.hidden=true;next.onclick=()=>{index++;draw()};
 (q.options||[]).forEach((opt,j)=>{const btn=mathText('button','cpu-option',label(j)+') '+cleanOption(opt));btn.type='button';btn.onclick=()=>{if(answered)return;
if(q.secure===true&&!Number.isInteger(q.correct_index)){
 if(pendingAnswer)return;
 pendingAnswer={id:q.id,index:j,button:btn};
 window.parent.postMessage({type:'cachimbolab-library-check',question_id:q.id,selected_index:j},'*');
 return;
}
answered=true;const hit=j===q.correct_index;if(hit)correct++;choices.querySelectorAll('button').forEach((b,k)=>{b.disabled=true;if(k===q.correct_index)b.classList.add('cpu-correct');else if(k===j)b.classList.add('cpu-incorrect')});verdict.className='cpu-verdict '+(hit?'correct':'incorrect');verdict.replaceChildren(textEl('span','cpu-symbol',hit?'✓':'✗'),textEl('span','',hit?'¡Respuesta correcta!':'Respuesta incorrecta'));verdict.hidden=false;if(!hit){answer.textContent='La respuesta correcta es: '+label(q.correct_index)+') '+q.options[q.correct_index];formatMath(answer);answer.hidden=false}const explanation=explanationFor(q);if(explanation){feedback.replaceChildren();const heading=textEl('div','cpu-explanation-title','Explicación');feedback.append(heading);const normalized=normalizeExplanation(explanation);
const parts=normalized.split(/(\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\\\([\s\S]*?\\\))/g);
parts.forEach(part=>{
 if(!part.trim())return;
 const display=(part.startsWith('\\[')&&part.endsWith('\\]'))||(part.startsWith('$$')&&part.endsWith('$$'));
 const inline=part.startsWith('\\(')&&part.endsWith('\\)');
 if(display||inline){
  const row=document.createElement('div');row.className='cpu-explanation-line cpu-equation';row.setAttribute('tabindex','0');
  const tex=part.slice(2,-2).trim();
  row.append(renderMath(tex,display));feedback.append(row);
 }else{
  part.split(/\r?\n/).forEach(line=>{
   if(!line.trim())return;
   const row=textEl('p','cpu-explanation-line',formatSolutionStep(line.trim()));
   row.setAttribute('tabindex','0');formatMath(row);feedback.append(row);
  });
 }
});feedback.hidden=false}else{feedback.textContent='';feedback.hidden=true}next.hidden=false};choices.append(btn)});
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