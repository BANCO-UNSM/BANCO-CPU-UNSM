'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const topics={
1:{title:'Movimiento Rectilíneo Uniforme (MRU)',theory:['La cinemática describe el movimiento sin estudiar sus causas.','En MRU el móvil sigue una trayectoria recta con velocidad constante.','Rapidez: v = d/t; distancia: d = vt; tiempo: t = d/v.','Encuentro: t=d/(vA+vB). Alcance: t=d/(vA−vB), si vA>vB.','Para convertir km/h a m/s, multiplica por 5/18.']},
2:{title:'El átomo y su estructura',theory:['El átomo presenta núcleo (protones y neutrones) y región extranuclear (electrones).','Número atómico Z = protones. Número de masa A = protones + neutrones.','Átomo neutro: electrones = protones. En iones: electrones = Z − carga algebraica.','Catión: pierde electrones; anión: gana electrones.','Isótopos: mismo Z; isóbaros: mismo A; isótonos: mismo número de neutrones.']},
3:{title:'El método científico y las generalidades de la biología',theory:['El método científico comprende observación, formulación de hipótesis, experimentación, resultados y conclusiones.','Variable independiente: factor manipulado; variable dependiente: resultado medido.','Grupo experimental: recibe el factor; grupo control: no lo recibe.','Los seres vivos presentan metabolismo, homeostasis, respuesta a estímulos, reproducción, crecimiento y organización.','La biología estudia seres vivos; sus ramas incluyen genética, ecología, citología y bioquímica.']},
4:{title:'Movimiento rectilíneo uniformemente variado (MRUV)',theory:['En MRUV la trayectoria es recta y la aceleración es constante.','v_f=v_0+at.','v_f²=v_0²+2ad.','d=v_0t+(at²)/2.','d=(v_0+v_f)t/2; en eco, recuerda dividir el trayecto de ida y vuelta entre dos.']},
5:{title:'Diferenciamos a los átomos por su número cuántico',theory:['Los cuatro números cuánticos son principal n, secundario l, magnético m_l y espín m_s.','n señala la capa; l indica el subnivel (s=0, p=1, d=2, f=3).','m_l puede tomar valores enteros de −l hasta +l; m_s vale +1/2 o −1/2.','Reglas: n entero ≥1, 0≤l<n, −l≤m_l≤l.','La energía relativa se compara con la suma n+l; aplicar Hund y Pauli al llenar orbitales.']},
6:{title:'Estructura celular',theory:['La célula es la unidad básica estructural y funcional de los seres vivos.','Las procariotas no poseen núcleo delimitado por membrana; las eucariotas sí.','Ribosomas: síntesis proteica; mitocondrias: producción de ATP; aparato de Golgi: clasificación y transporte.','Las células vegetales poseen pared de celulosa y cloroplastos; la pared de los hongos incluye quitina.','La membrana plasmática es una bicapa de fosfolípidos con proteínas, glicolípidos y otras moléculas.']}
};
let questions=[],session=1,staff=false,db=null,stage='theory';
function formulas(root){if(typeof renderMathInElement==='function')renderMathInElement(root,{delimiters:[{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false},{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false});}
function render(){
 $('topics').innerHTML=Object.entries(topics).map(([num,t])=>'<button type="button" data-session="'+num+'" class="'+(Number(num)===session?'active':'')+'">Sesión '+num+'<br>'+esc(t.title)+'</button>').join('');
 $('topics').querySelectorAll('button').forEach(b=>b.onclick=()=>{session=Number(b.dataset.session);stage='theory';render();});
 const topic=topics[session],extra=window.CIENCIA_PRONABEC_CONTENIDO?.[session-1],list=questions.filter(q=>q.week===session).sort((a,b)=>a.original_number-b.original_number);
 $('count').textContent='Sesión '+session+' · '+(extra?.problems?.length||0)+' situaciones resueltas · '+list.length+' de 5 retos'+(staff?' · Vista docente':'');
 const stageNames={theory:'1. Estudia la teoría',practice:'2. Ejercicios resueltos',challenges:'3. Pon a prueba lo aprendido'};
 const stages=['theory','practice','challenges'];
 $('stageNav').innerHTML=stages.map((name,i)=>'<button type="button" class="'+(stage===name?'active':'')+'" data-stage="'+name+'">'+stageNames[name]+'</button>').join('');
 $('stageNav').querySelectorAll('button').forEach(b=>b.onclick=()=>{stage=b.dataset.stage;render();});
 $('lesson').hidden=stage!=='theory';$('practice').hidden=stage!=='practice';$('challenge').hidden=stage!=='challenges';
 if(stage==='theory'){
  $('lesson').innerHTML='<h2>📖 Teoría · '+esc(topic.title)+'</h2><p>Estudia los conceptos antes de resolver los ejercicios desarrollados.</p>'+
  (extra?.sections?.map(sec=>'<section class="lesson"><h3>'+esc(sec.title)+'</h3><ul>'+sec.body.map(p=>'<li class="formula">'+esc(p)+'</li>').join('')+'</ul></section>').join('')||'<p>Sin contenidos teóricos.</p>')+
  '<div class="actions next-step"><button type="button" data-next="practice">Continuar a ejercicios resueltos →</button></div>';
 }
 if(stage==='practice'){
  $('practice').innerHTML='<h2>✍️ Situaciones problemáticas resueltas</h2><p>Son los dos ejemplos desarrollados de la sesión, explicados paso a paso antes de los retos.</p>'+
  (extra?.problems?.map((p,i)=>'<article class="question"><h3>'+esc(p.title)+'</h3><p class="formula">'+esc(p.statement)+'</p>'+p.options.map((o,k)=>'<div class="option formula">'+('ABCDE'[k])+') '+esc(o)+'</div>').join('')+
  '<div class="solved"><h4>✅ RESPUESTA CORRECTA: '+('ABCDE'[p.key])+') '+esc(p.options[p.key])+'</h4><ol>'+p.steps.map(a=>'<li class="formula">'+esc(a)+'</li>').join('')+'</ol><p><strong>CLAVE PARA RECORDAR:</strong> '+esc(p.tip)+'</p></div></article>').join('')||'<p>Sin ejercicios resueltos.</p>')+
  '<div class="actions next-step"><button type="button" class="secondary" data-next="theory">← Volver a la teoría</button><button type="button" data-next="challenges">Continuar a los retos →</button></div>';
 }
 if(stage==='challenges'){
  $('items').innerHTML=list.length?list.map(q=>'<article class="question"><h3 class="formula">Reto '+q.original_number+'. '+esc(q.statement)+'</h3>'+(q.options||[]).map((v,i)=>'<div class="option formula">'+('ABCDE'[i]||'?')+') '+esc(v)+'</div>').join('')+'<span class="tag">'+(q.status==='published'?'Publicada':'Borrador · pendiente de revisión')+'</span>'+(staff?'<details data-id="'+esc(q.id)+'"><summary>Mostrar clave y desarrollo</summary><div class="solution">Cargando…</div></details>':'')+'</article>').join(''):'<p>No hay preguntas publicadas de esta sesión. Las preguntas en borrador solamente aparecen al equipo docente.</p>';
  $('items').querySelectorAll('details').forEach(d=>d.addEventListener('toggle',async()=>{
   if(!d.open||d.dataset.loaded)return;
   d.dataset.loaded='true';
   const {data,error}=await db.rpc('get_question_for_review',{p_question_id:d.dataset.id});
   const box=d.querySelector('.solution');
   box.textContent=error?'Error al consultar explicación: '+error.message:!data?'La clave no está disponible.':'CLAVE: '+('ABCDE'[data.correct_index]||'?')+'\n\n'+(data.explanation||'Sin explicación registrada');
   formulas(d);
  }));
 }
 document.querySelectorAll('[data-next]').forEach(button=>button.onclick=()=>{stage=button.dataset.next;render();document.getElementById('stageNav').scrollIntoView({behavior:'smooth',block:'start'});});
 ['lesson','practice','items'].forEach(id=>formulas($(id)));
}
async function init(){
 try{
  if(!window.supabase||!window.SUPABASE_URL||!window.SUPABASE_ANON_KEY)throw Error('No se encontró la configuración.');
  db=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
  const {data:{session:auth},error:authErr}=await db.auth.getSession();
  if(authErr||!auth?.user)throw Error('Inicia sesión en CachimboLab.');
  const {data:profile,error:profileErr}=await db.from('profiles').select('role').eq('id',auth.user.id).maybeSingle();
  if(profileErr)throw profileErr;
  staff=['teacher','admin'].includes(profile?.role);
  if(!staff){
   const {data:has,error:serviceErr}=await db.rpc('has_service_access',{p_modality:'BECA18'});
   if(serviceErr||has!==true)throw Error('Se necesita autorización del servicio Beca 18.');
  }
  const {data,error}=await db.from('questions').select('id,cycle,week,subject,topic,original_number,statement,options,status').eq('modality','BECA18').eq('cycle','PRONABEC-2ED').eq('subject','Ciencia y Tecnología').in('status',staff?['draft','review','published']:['published']).order('week').order('original_number');
  if(error)throw error;
  questions=data||[];
  $('status').hidden=true;$('content').hidden=false;render();
 }catch(err){$('status').textContent='No fue posible abrir Ciencia y Tecnología: '+(err.message||err);}
}
document.addEventListener('DOMContentLoaded',init);