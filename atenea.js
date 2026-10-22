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
 const lines=String(source).replace(/\r\n?/g,'\n').split('\n');let list=null;
 const inline=(parent,line)=>{const re=/(\*\*[^*\n]+\*\*|`[^`\n]+`)/g;let start=0,m;
  while((m=re.exec(line))){if(m.index>start)parent.append(document.createTextNode(line.slice(start,m.index)));
   const token=m[0],el=document.createElement(token.startsWith('**')?'strong':'code');el.textContent=token.startsWith('**')?token.slice(2,-2):token.slice(1,-1);parent.append(el);start=re.lastIndex;}
  if(start<line.length)parent.append(document.createTextNode(line.slice(start)));};
 for(const line of lines){if(!line.trim()){list=null;continue;}
  const bullet=line.match(/^\s*(?:[-*]|\d+\.)\s+(.+)$/);
  if(bullet){const kind=/^\s*\d+\./.test(line)?'ol':'ul';if(!list||list.tagName.toLowerCase()!==kind){list=document.createElement(kind);target.append(list);}const li=document.createElement('li');inline(li,bullet[1]);list.append(li);continue;}
  list=null;const heading=line.match(/^\s*#{1,4}\s+(.+)$/);const block=document.createElement(heading?'strong':'div');inline(block,heading?heading[1]:line);target.append(block);
 }
 if(typeof renderMathInElement==='function'){try{renderMathInElement(target,{delimiters:[{left:'$$',right:'$$',display:true},{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false},{left:'$',right:'$',display:false}],throwOnError:false,strict:'ignore'});}catch(e){console.warn('Atenea: error de formato matemático',e);}}
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
function mount(){if($('atenea-root'))return;
 const root=document.createElement('div');root.id='atenea-root';
 root.innerHTML=`<button id="atenea-toggle" type="button" aria-label="Abrir asistente Atenea" title="Habla con Atenea">✦ <span>Atenea</span></button><section id="atenea-panel" role="dialog" aria-label="Atenea, asistente académica" hidden><div class="atenea-top"><div class="atenea-mark">A</div><div><strong>ATENEA</strong><small>Tu guía inteligente hacia la UNSM</small></div><button type="button" id="atenea-close" aria-label="Cerrar">×</button></div><div id="atenea-feed" class="atenea-feed" aria-live="polite"></div><div class="atenea-shortcuts"><button type="button" data-ask="Dame una pista">💡 Pista</button><button type="button" data-ask="Explícame el concepto sin revelar la respuesta de la práctica">📘 Explicación</button><button type="button" data-ask="Motívame">💙 Ánimo</button></div><form id="atenea-form"><input id="atenea-input" maxlength="700" autocomplete="off" placeholder="Pregúntale a Atenea..." aria-label="Tu mensaje"/><button id="atenea-send" type="submit" aria-label="Enviar">➤</button></form><div class="atenea-foot"><label><input type="checkbox" id="atenea-voice"/> 🔊 Leer respuestas</label><span id="atenea-status">Atenea usa Gemini con cupos gratuitos.</span></div></section>`;
 document.body.append(root);
 $('atenea-toggle').onclick=()=>show(!state.open);$('atenea-close').onclick=()=>show(false);
 $('atenea-voice').onchange=e=>{state.voice=e.target.checked;if(!state.voice&&'speechSynthesis'in window)speechSynthesis.cancel();};
 $('atenea-form').onsubmit=e=>{e.preventDefault();const i=$('atenea-input'),msg=i.value.trim();if(!msg||state.busy)return;i.value='';void ask(msg);};
 root.querySelectorAll('[data-ask]').forEach(b=>b.onclick=()=>{if(!state.busy)void ask(b.dataset.ask);});
 add('bot','¡Hola, futuro cachimbo! 💙 Soy Atenea. Puedo ayudarte con conceptos, pistas y estrategias de estudio.',false);
}
function show(open){state.open=open;$('atenea-panel').hidden=!open;$('atenea-toggle').setAttribute('aria-expanded',String(open));if(open)$('atenea-input').focus();else if('speechSynthesis'in window)speechSynthesis.cancel();}
function sync(){if(canUse()){
 mount();$('atenea-root').hidden=false;
 if(state.userId!==user.id){state.userId=user.id;state.history=[];const feed=$('atenea-feed');if(feed)feed.textContent='';add('bot','¡Hola! 💙 Soy Atenea. ¿Qué tema te gustaría aprender hoy?',false);}
 }else if($('atenea-root')){$('atenea-root').hidden=true;state.history=[];state.userId=null;if(state.open)show(false);}}
const observer=new MutationObserver(sync);
window.addEventListener('DOMContentLoaded',()=>{sync();const target=$('account');if(target)observer.observe(target,{childList:true,subtree:true});});
})();
