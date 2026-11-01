'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const years=[['2023-E01','2023 · Examen 1'],['2024-E02','2024 · Examen 2'],['2025-E03','2025 · Examen 3']];
let data=[],cycle='2023-E01',staff=false,db=null;
function math(root){if(typeof renderMathInElement==='function')renderMathInElement(root,{delimiters:[{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false},{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false});}
function render(){
 $('years').innerHTML=years.map(([key,label])=>'<button type="button" data-year="'+key+'" class="'+(cycle===key?'active':'')+'">'+label+'</button>').join('');
 $('years').querySelectorAll('button').forEach(b=>b.onclick=()=>{cycle=b.dataset.year;render();});
 const selected=data.filter(q=>q.cycle===cycle).sort((a,b)=>a.original_number-b.original_number);
 $('count').textContent=selected.length+' de 30 preguntas registradas · '+(staff?'Vista de revisión docente':'Vista de estudiante');
 $('items').innerHTML=selected.length?selected.map(q=>{
 const opts=Array.isArray(q.options)?q.options:[];
 return '<article class="question"><h3 class="math">Pregunta '+esc(q.original_number)+'. '+esc(q.statement)+'</h3>'+opts.map((o,i)=>'<div class="option math">'+('ABCDE'[i]||'?')+') '+esc(o)+'</div>').join('')+'<span class="badge">'+(q.status==='published'?'Publicada':'Borrador · no visible a estudiantes')+'</span>'+(staff?'<details data-id="'+esc(q.id)+'"><summary>Mostrar explicación y clave (docente)</summary><div class="solution">Cargando explicación…</div></details>':'')+'</article>';
 }).join(''):'<p>No hay preguntas disponibles para esta convocatoria.</p>';
 math($('items'));
 $('items').querySelectorAll('details').forEach(d=>d.addEventListener('toggle',async()=>{
  if(!d.open||d.dataset.loaded)return;
  d.dataset.loaded='1';
  const {data:a,error}=await db.from('answer_keys').select('correct_index,explanation').eq('question_id',d.dataset.id).maybeSingle();
  const text=error?'No fue posible consultar la clave: '+error.message:!a?'Clave no disponible':('CLAVE: '+('ABCDE'[a.correct_index]||'?')+'\n\n'+(a.explanation||'Sin explicación'));
  d.querySelector('.solution').textContent=text;
  math(d);
 }));
}
async function init(){
 try{
  if(!window.supabase||!window.SUPABASE_URL||!window.SUPABASE_ANON_KEY)throw Error('Configuración de Supabase no disponible.');
  db=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
  const {data:{session}}=await db.auth.getSession();
  if(!session?.user)throw Error('Inicia sesión en CachimboLab para ver las preguntas.');
  const {data:profile,error:profileError}=await db.from('profiles').select('role').eq('id',session.user.id).maybeSingle();
  if(profileError)throw profileError;
  staff=['admin','teacher'].includes(profile?.role);
  if(!staff){
   const {data:granted,error}=await db.rpc('has_service_access',{p_modality:'BECA18'});
   if(error||!granted)throw Error('Necesitas acceso autorizado a Beca 18.');
  }
  const {data:questions,error}=await db.from('questions').select('id,cycle,original_number,statement,options,topic,status').eq('modality','BECA18').eq('subject','Competencia matemática').in('cycle',years.map(x=>x[0])).in('status',staff?['draft','review','published']:['published']).order('original_number');
  if(error)throw error;
  data=questions||[];
  $('status').hidden=true;$('content').hidden=false;render();
 }catch(e){$('status').textContent='No fue posible mostrar Matemática: '+(e?.message||e);}
}
document.addEventListener('DOMContentLoaded',init);