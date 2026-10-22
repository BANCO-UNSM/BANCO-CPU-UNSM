/* Atenea v1: tutora guiada local. Sin claves privadas ni acceso a respuestas antes de contestar. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const state={open:false,voice:false,history:[]};
const canUse=()=>typeof user!=='undefined' && !!user && (typeof teacher==='function'&&teacher() || !!access?.allowed);
const context=()=>{
 const q=(typeof practice!=='undefined'&&practice?.items?.[practice.i])||null;
 return {q,answered:!!(typeof practice!=='undefined'&&practice?.feedback),feedback:typeof practice!=='undefined'?practice?.feedback:null};
};
const escText=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const speak=text=>{
 if(!state.voice||!('speechSynthesis'in window))return;
 speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(text.replace(/\s+/g,' ').slice(0,1800));u.lang='es-PE';u.rate=.91;u.pitch=1.02;
 const voices=speechSynthesis.getVoices();const voice=voices.find(v=>/^es[-_](PE|MX|CO|419)/i.test(v.lang)&&/female|mujer|paulina|sabina|helena|monica|luciana/i.test(v.name))||voices.find(v=>/^es/i.test(v.lang)&&/female|mujer|paulina|sabina|helena|monica|luciana/i.test(v.name))||voices.find(v=>/^es/i.test(v.lang));if(voice)u.voice=voice;
 speechSynthesis.speak(u);
};
const add=(who,text)=>{state.history.push({who,text});state.history=state.history.slice(-20);const feed=$('atenea-feed');if(!feed)return;const div=document.createElement('div');div.className='atenea-bubble '+(who==='user'?'atenea-user':'atenea-bot');div.textContent=text;feed.append(div);feed.scrollTop=feed.scrollHeight;if(who!=='user')speak(text);};
function answer(input){const t=input.toLocaleLowerCase('es');const {q,answered,feedback}=context();const subject=q?.subject||'la materia que estás estudiando';
 if(/(hola|buenas|saludos)/.test(t))return '¡Hola, futuro cachimbo! Soy Atenea. 💙 Estoy aquí para acompañarte en tu preparación para la UNSM. ¿Quieres una pista, una estrategia o motivación?';
 if(/(pista|ayuda|no entiendo|no sé|no se)/.test(t))return q&&!answered?`Estás practicando ${subject}, semana ${q.week}. Primero identifica qué concepto central aparece en el enunciado. Después descarta las alternativas que contradigan ese concepto. No te revelaré la clave antes de que respondas. ¿Qué opción te parece más razonable?`:'Puedo darte una pista cuando estés resolviendo una pregunta en «Práctica inmediata». Mientras tanto, identifica las palabras clave del tema y explica con tus propias palabras qué te pide la pregunta.';
 if(/(explica|explicación|explicacion|respuesta|correcta|por qué|porque)/.test(t)){
 if(q&&!answered)return 'Primero intenta responder la pregunta en «Práctica inmediata». Después podré ayudarte a revisar la explicación. Así aprendes a razonar sin depender de la clave.';
 if(q&&answered){const ex=String(feedback?.explanation||'').trim();return ex?`Revisemos la explicación de ${subject}:\n\n${ex}`:'Ya comprobaste tu respuesta. Revisa el desarrollo mostrado debajo de la pregunta; si aún no tiene explicación, el docente puede incorporarla.';}
 return 'Abre «Práctica inmediata» y selecciona una materia. Al comprobar una respuesta, podrás consultar su explicación conmigo.';
 }
 if(/(motiv|ánimo|animo|cansad|difícil|dificil)/.test(t))return 'Tu ingreso no depende de acertar todo hoy. 💙 Cada error que comprendes es una oportunidad de mejorar. Estudia con constancia, descansa cuando lo necesites y vuelve con una meta pequeña y concreta.';
 if(/(repas|estudi|consejo|estrategia)/.test(t))return `Te propongo un repaso en tres pasos: 1) recuerda las ideas esenciales de ${subject}; 2) resuelve una pregunta sin mirar la clave; 3) explica por qué descartaste cada alternativa. ¡Ese último paso fortalece mucho tu aprendizaje!`;
 return 'Puedo ayudarte con pistas, estrategias de estudio, motivación y explicaciones de preguntas que ya respondiste. Por ahora soy una tutora guiada; la conversación abierta con IA se añadirá en una siguiente etapa.';
}
function mount(){if($('atenea-root'))return;const root=document.createElement('div');root.id='atenea-root';root.innerHTML=`<button id="atenea-toggle" type="button" aria-label="Abrir asistente Atenea" title="Habla con Atenea">✦ <span>Atenea</span></button><section id="atenea-panel" role="dialog" aria-label="Atenea, asistente académica" hidden><div class="atenea-top"><div class="atenea-mark">A</div><div><strong>ATENEA</strong><small>Tu guía inteligente hacia la UNSM</small></div><button type="button" id="atenea-close" aria-label="Cerrar">×</button></div><div id="atenea-feed" class="atenea-feed" aria-live="polite"></div><div class="atenea-shortcuts"><button type="button" data-ask="Dame una pista">💡 Pista</button><button type="button" data-ask="Explícame la respuesta">📘 Explicación</button><button type="button" data-ask="Motívame">💙 Ánimo</button></div><form id="atenea-form"><input id="atenea-input" maxlength="350" autocomplete="off" placeholder="Pregúntale a Atenea..." aria-label="Tu mensaje"/><button type="submit" aria-label="Enviar">➤</button></form><div class="atenea-foot"><label><input type="checkbox" id="atenea-voice"/> 🔊 Leer respuestas</label><span>Voz disponible según tu navegador</span></div></section>`;document.body.append(root);
 $('atenea-toggle').onclick=()=>show(!state.open);$('atenea-close').onclick=()=>show(false);
 $('atenea-voice').onchange=e=>{state.voice=e.target.checked;if(!state.voice&&'speechSynthesis'in window)speechSynthesis.cancel();};
 $('atenea-form').onsubmit=e=>{e.preventDefault();const i=$('atenea-input');const msg=i.value.trim();if(!msg)return;i.value='';add('user',msg);add('bot',answer(msg));};
 root.querySelectorAll('[data-ask]').forEach(b=>b.onclick=()=>{const msg=b.dataset.ask;add('user',msg);add('bot',answer(msg));});
 add('bot','¡Hola, futuro cachimbo! 💙 Soy Atenea, tu compañera de estudio. ¿Necesitas una pista o quieres repasar una pregunta?');
}
function show(open){state.open=open;$('atenea-panel').hidden=!open;$('atenea-toggle').setAttribute('aria-expanded',String(open));if(open)$('atenea-input').focus();else if('speechSynthesis'in window)speechSynthesis.cancel();}
function sync(){if(canUse()){mount();$('atenea-root').hidden=false;}else{if($('atenea-root')){$('atenea-root').hidden=true;if(state.open)show(false);}}}
const observer=new MutationObserver(()=>sync());window.addEventListener('DOMContentLoaded',()=>{sync();const target=$('account');if(target)observer.observe(target,{childList:true,subtree:true});});
})();
