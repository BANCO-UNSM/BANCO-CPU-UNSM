/* Atenea v2: chat conectado a Supabase Edge Function atenea-chat (Gemini).
   No incluye claves privadas, respuestas oficiales ni llamadas directas a Gemini. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const state={open:false,voice:false,busy:false,history:[],userId:null};
const canUse=()=>typeof user!=='undefined'&&!!user&&!!access?.allowed;
const studyContext=()=>{
 const q=(typeof practice!=='undefined'&&practice?.items?.[practice.i])||null;
 if(!q)return null;
 // Nunca enviar claves, alternativas, feedback ni explicaciones oficiales.
 return {subject:String(q.subject||'').slice(0,100),topic:String(q.topic||'').slice(0,150),week:String(q.week??'').slice(0,10),statement:String(q.statement||'').slice(0,2500)};
};
const speak=text=>{
 if(!state.voice||!('speechSynthesis'in window))return;
 speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text.replace(/\s+/g,' ').slice(0,1800));u.lang='es-PE';u.rate=.91;u.pitch=1.02;
 const voices=speechSynthesis.getVoices();const v=voices.find(v=>/^es[-_](PE|MX|CO|419)/i.test(v.lang)&&/female|mujer|paulina|sabina|helena|monica|luciana/i.test(v.name))||voices.find(v=>/^es/i.test(v.lang)&&/female|mujer|paulina|sabina|helena|monica|luciana/i.test(v.name))||voices.find(v=>/^es/i.test(v.lang));if(v)u.voice=v;speechSynthesis.speak(u);
};
const formatText=(target,source)=>{
 // Normaliza saltos de línea reales y secuencias escapadas por la API.
 const raw=String(source??'').replace(/\r\n?/g,'\n').replace(/\\n/g,'\n')
  .replace(/\\([*`])/g,'$1');
 const appendInline=(parent,value)=>{
  // LaTeX se identifica antes del Markdown para no romper los delimitadores.
  const rx=/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?<!\$)\$(?!\$)[^\n$]+\$(?!\$)|\*\*[^*\n]+\*\*|`[^`\n]+`)/g;
  let pos=0,m;
  while((m=rx.exec(value))){
   if(m.index>pos)parent.append(document.createTextNode(value.slice(pos,m.index)));
   const token=m[0];
   if(token.startsWith('$')||token.startsWith('\\[')||token.startsWith('\\(')){
    const display=token.startsWith('$$')||token.startsWith('\\[');
    const formula=token.startsWith('$$')?token.slice(2,-2):token.startsWith('$')?token.slice(1,-1):token.slice(2,-2);
    const node=document.createElement(display?'div':'span');
    if(typeof katex!=='undefined'&&typeof katex.render==='function'){
     try{katex.render(formula,node,{displayMode:display,throwOnError:false,strict:'ignore',trust:false});}
     catch(e){node.textContent=token;}
    }else{node.textContent=token;}
    parent.append(node);
   }else if(token.startsWith('**')){
    const node=document.createElement('strong');appendInline(node,token.slice(2,-2));parent.append(node);
   }else{const node=document.createElement('code');node.textContent=token.slice(1,-1);parent.append(node);}
   pos=rx.lastIndex;
  }
  if(pos<value.length)parent.append(document.createTextNode(value.slice(pos)));
 };
 let list=null,code=null;
 for(const line of raw.split('\n')){
  if(/^\s*```/.test(line)){if(code){code=null;}else{const pre=document.createElement('pre');code=document.createElement('code');pre.append(code);target.append(pre);}list=null;continue;}
  if(code){code.append(document.createTextNode(line+'\n'));continue;}
  if(!line.trim()){list=null;continue;}
  if(/^\s*---+\s*$/.test(line)){target.append(document.createElement('hr'));list=null;continue;}
  const bullet=line.match(/^\s*([-*]|\d+\.)\s+(.+)$/);
  if(bullet){const kind=/\d/.test(bullet[1])?'ol':'ul';if(!list||list.tagName.toLowerCase()!==kind){list=document.createElement(kind);target.append(list);}
   const li=document.createElement('li');appendInline(li,bullet[2]);list.append(li);continue;}
  list=null;
  const heading=line.match(/^\s*(#{1,4})\s+(.+)$/);
  const tag=heading?'h'+Math.min(heading[1].length+2,6):'div';
  const block=document.createElement(tag);appendInline(block,heading?heading[2]:line);target.append(block);
 }
};
const add=(who,text,record=true)=>{
 if(record){state.history.push({role:who==='user'?'user':'assistant',content:text});state.history=state.history.slice(-16);}
 const feed=$('atenea-feed');if(!feed)return;const div=document.createElement('div');div.className='atenea-bubble '+(who==='user'?'atenea-user':'atenea-bot');formatText(div,text);feed.append(div);feed.scrollTop=feed.scrollHeight;if(who!=='user')speak(text);
};
function busy(on){state.busy=on;const i=$('atenea-input'),send=$('atenea-send');if(i)i.disabled=on;if(send)send.disabled=on;document.querySelectorAll('#atenea-root [data-ask]').forEach(b=>b.disabled=on);const status=$('atenea-status');if(status)status.textContent=on?'Atenea está preparando su respuesta…':'Atenea usa Gemini con cupos gratuitos.';}
async function ask(message){
 const msg=String(message||'').trim().slice(0,700);if(!msg||state.busy)return;
 if(!canUse()){add('bot','Tu sesión no tiene acceso autorizado a Atenea.',false);return;}
 const previous=state.history.slice(-8);add('user',msg);busy(true);
 try{
  if(typeof db==='undefined'||!db)throw new Error('No se pudo iniciar la conexión con Supabase.');
  const {data:{session},error:sessionError}=await db.auth.getSession();
  if(sessionError||!session?.access_token||session.user.id!==user?.id)throw new Error('Inicia sesión nuevamente para hablar con Atenea.');
  const {data,error}=await db.functions.invoke('atenea-chat',{
   method:'POST',headers:{Authorization:`Bearer ${session.access_token}`},
   body:{message:msg,history:previous,context:studyContext()}
  });
  if(error){let reason='No se pudo contactar a Atenea.';
   try{const details=await error.context?.json?.();if(typeof details?.error==='string')reason=details.error;}catch(_){/* Respuesta sin JSON */}
   throw new Error(reason);
  }
  if(typeof data?.reply!=='string'||!data.reply.trim())throw new Error(data?.error||'Atenea no devolvió una respuesta.');
  add('bot',data.reply.trim());
  if(Number.isInteger(data.remaining)){$('atenea-status').textContent=`Te quedan ${data.remaining} de 60 consultas hoy (hora de Perú).`;}
 }catch(err){console.warn('Atenea:',err?.message||err);add('bot','⚠️ '+(err?.message||'Ocurrió un problema temporal. Inténtalo más tarde.'),false);}
 finally{busy(false);if(state.open)$('atenea-input')?.focus();}
}
// Arrastre mediante Pointer Events, compatible con ratón y pantallas táctiles.
const dragState={moved:false};
function initCharacterDrag(){
 const el=$('atenea-personaje');if(!el)return;
 let start=null,suppressUntil=0;
 el.addEventListener('pointerdown',e=>{
  if(e.button!==0&&e.pointerType==='mouse')return;
  const r=el.getBoundingClientRect();
  start={id:e.pointerId,x:e.clientX,y:e.clientY,left:r.left,top:r.top,active:false};
  dragState.moved=false;el.setPointerCapture(e.pointerId);
 });
 el.addEventListener('pointermove',e=>{
  if(!start||start.id!==e.pointerId)return;
  const dx=e.clientX-start.x,dy=e.clientY-start.y;
  if(!start.active&&Math.hypot(dx,dy)<7)return;
  start.active=true;dragState.moved=true;
  const maxX=Math.max(0,window.innerWidth-el.offsetWidth),maxY=Math.max(0,window.innerHeight-el.offsetHeight);
  const x=Math.max(0,Math.min(maxX,start.left+dx)),y=Math.max(0,Math.min(maxY,start.top+dy));
  el.style.setProperty('position','fixed','important');
  el.style.setProperty('left',x+'px','important');el.style.setProperty('top',y+'px','important');
  el.style.setProperty('right','auto','important');el.style.setProperty('bottom','auto','important');
  el.classList.add('atenea-dragging');
 });
 const finish=e=>{if(!start||e.pointerId!==start.id)return;
  if(start.active){suppressUntil=Date.now()+350;dragState.moved=true;}
  start=null;el.classList.remove('atenea-dragging');
 };
 el.addEventListener('pointerup',finish);el.addEventListener('pointercancel',finish);
 el.addEventListener('click',e=>{if(Date.now()<suppressUntil){e.stopImmediatePropagation();e.preventDefault();}},true);
 window.addEventListener('resize',()=>{
  if(!el.style.left)return;const r=el.getBoundingClientRect();
  el.style.left=Math.max(0,Math.min(window.innerWidth-r.width,r.left))+'px';
  el.style.top=Math.max(0,Math.min(window.innerHeight-r.height,r.top))+'px';
 });
}
function mount(){if($('atenea-root'))return;
 const root=document.createElement('div');root.id='atenea-root';
 root.innerHTML=`<button id="atenea-personaje" type="button" aria-label="Abrir chat con Atenea" title="Habla con Atenea"><img src="atenea-cuerpo-entero-v29.png" alt="Atenea, tu tutora virtual" /></button><button id="atenea-minimize" type="button" aria-label="Ocultar figura de Atenea" title="Ocultar figura de Atenea">−</button><button id="atenea-toggle" type="button" aria-label="Abrir asistente Atenea" title="Habla con Atenea"><img class="atenea-toggle-avatar" src="atenea-retrato.png" alt="" /> <span>Atenea</span></button><section id="atenea-panel" role="dialog" aria-label="Atenea, asistente académica" hidden><div class="atenea-top"><div class="atenea-mark"><img src="atenea-retrato.png" alt="Atenea, tutora virtual de CachimboLab" /></div><div><strong>ATENEA</strong><small>Tu guía inteligente hacia la UNSM</small></div><button type="button" id="atenea-close" aria-label="Cerrar">×</button></div><div id="atenea-feed" class="atenea-feed" aria-live="polite"></div><div class="atenea-shortcuts"><button type="button" data-ask="Dame una pista">💡 Pista</button><button type="button" data-ask="Explícame el concepto sin revelar la respuesta de la práctica">📘 Explicación</button><button type="button" data-ask="Motívame">💙 Ánimo</button></div><form id="atenea-form"><input id="atenea-input" maxlength="700" autocomplete="off" placeholder="Pregúntale a Atenea..." aria-label="Tu mensaje"/><button id="atenea-send" type="submit" aria-label="Enviar">➤</button></form><div class="atenea-foot"><label><input type="checkbox" id="atenea-voice"/> 🔊 Leer respuestas</label><span id="atenea-status">Atenea usa Gemini con cupos gratuitos.</span></div></section>`;
 document.body.append(root);
 $('atenea-toggle').onclick=()=>show(!state.open);
 $('atenea-personaje').onclick=()=>{if(!dragState.moved)show(!state.open);};
 $('atenea-close').onclick=()=>show(false);
 $('atenea-minimize').onclick=()=>{
  const hidden=root.classList.toggle('atenea-figure-hidden');
  const btn=$('atenea-minimize');btn.textContent=hidden?'+':'−';
  btn.title=hidden?'Mostrar figura de Atenea':'Ocultar figura de Atenea';
  btn.setAttribute('aria-label',btn.title);
  try{sessionStorage.setItem('ateneaFigureHidden',String(hidden));}catch(_){}
 };
 try{if(sessionStorage.getItem('ateneaFigureHidden')==='true')$('atenea-minimize').click();}catch(_){}
 initCharacterDrag();
 $('atenea-voice').onchange=e=>{state.voice=e.target.checked;if(!state.voice&&'speechSynthesis'in window)speechSynthesis.cancel();};
 $('atenea-form').onsubmit=e=>{e.preventDefault();const i=$('atenea-input'),msg=i.value.trim();if(!msg||state.busy)return;i.value='';void ask(msg);};
 root.querySelectorAll('[data-ask]').forEach(b=>b.onclick=()=>{if(!state.busy)void ask(b.dataset.ask);});
 add('bot','¡Hola, futuro cachimbo! 💙 Soy Atenea. Puedo ayudarte con conceptos, pistas y estrategias de estudio.',false);
}
function show(open){state.open=open;$('atenea-panel').hidden=!open;$('atenea-toggle').setAttribute('aria-expanded',String(open));$('atenea-personaje').setAttribute('aria-expanded',String(open));if(open)$('atenea-input').focus();else if('speechSynthesis'in window)speechSynthesis.cancel();}
function sync(){if(canUse()){
 mount();$('atenea-root').hidden=false;
 if(state.userId!==user.id){state.userId=user.id;state.history=[];const feed=$('atenea-feed');if(feed)feed.textContent='';add('bot','¡Hola! 💙 Soy Atenea. ¿Qué tema te gustaría aprender hoy?',false);}
 }else if($('atenea-root')){$('atenea-root').hidden=true;state.history=[];state.userId=null;if(state.open)show(false);}}
const observer=new MutationObserver(sync);
window.addEventListener('DOMContentLoaded',()=>{sync();const target=$('account');if(target)observer.observe(target,{childList:true,subtree:true});});
})();
