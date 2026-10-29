'use strict';
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone=x=>JSON.parse(JSON.stringify(x));
let original=null,data=null,selected=null,kind='reading',userId='',storeKey='';
const statusName={borrador:'Borrador',en_revision:'En revisión',publicada:'Publicada'};
function msg(text,ok=true){$('feedback').textContent=text;$('feedback').className=ok?'success':'notice';}
function activeExam(){return data.exams.find(e=>e.year===Number($('year').value));}
function countChanges(){const count=Object.keys(diff()).length;$('pendingCount').textContent=count+' cambios locales pendientes de subir a GitHub';}
function diff(){
 const out={};if(!data||!original)return out;
 for(const e of data.exams){
  const o=original.exams.find(z=>z.year===e.year);
  for(let i=0;i<e.groups.length;i++){const a=e.groups[i],b=o.groups[i];if(JSON.stringify(a)!==JSON.stringify(b))out[a.id]=true;}
  for(let i=0;i<e.questions.length;i++){const a=e.questions[i],b=o.questions[i];if(JSON.stringify(a)!==JSON.stringify(b))out[a.id]=true;}
 }
 return out;
}
function persist(){
 const patch={};
 for(const e of data.exams){
  const base=original.exams.find(z=>z.year===e.year);
  for(let i=0;i<e.groups.length;i++){const q=e.groups[i];if(JSON.stringify(q)!==JSON.stringify(base.groups[i]))patch['reading:'+q.id]=q;}
  for(let i=0;i<e.questions.length;i++){const q=e.questions[i];if(JSON.stringify(q)!==JSON.stringify(base.questions[i]))patch['question:'+q.id]=q;}
 }
 try{localStorage.setItem(storeKey,JSON.stringify(patch));}catch{msg('No se pudo guardar el borrador local. Descarga el JSON para no perder los cambios.',false);}
 countChanges();
}
function restoreDrafts(){
 try{
  const patch=JSON.parse(localStorage.getItem(storeKey)||'{}');
  for(const e of data.exams){
   e.groups=e.groups.map(q=>patch['reading:'+q.id]&&patch['reading:'+q.id].id===q.id?{...q,...patch['reading:'+q.id]}:q);
   e.questions=e.questions.map(q=>patch['question:'+q.id]&&patch['question:'+q.id].id===q.id?{...q,...patch['question:'+q.id]}:q);
  }
 }catch{msg('Se encontró un borrador local inválido; se ignoró.',false);}
}
function items(){const exam=activeExam();return kind==='reading'?exam.groups:exam.questions;}
function renderList(){
 const entries=items();
 $('itemListTitle').textContent=(kind==='reading'?'Lecturas':'Preguntas')+' · '+$('year').value;
 $('itemList').innerHTML=entries.map(q=>{
  const active=q.id===selected?'active':'';
  const label=kind==='reading'?('Texto '+q.id.split('T').at(-1)+' · preguntas '+q.first+'–'+q.last):('Pregunta '+q.number);
  return '<button class="'+active+'" type="button" data-id="'+esc(q.id)+'">'+esc(label)+'<small>'+esc(statusName[q.editor_status]||'Sin revisar')+(diff()[q.id]?' · editado':'')+'</small></button>';
 }).join('');
 $('itemList').querySelectorAll('button').forEach(b=>b.onclick=()=>{selected=b.dataset.id;renderList();renderForm();});
 countChanges();
}
function selectedItem(){return items().find(q=>q.id===selected);}
function renderImages(){
 const roots=$('images').value.split('\n').map(s=>s.trim()).filter(Boolean);
 $('imagePreview').innerHTML=roots.map(s=>'<div><img src="'+esc(s)+'" alt="Vista previa de imagen asociada"></div>').join('');
}
function renderForm(){
 const q=selectedItem();
 if(!q)return;
 $('formTitle').textContent=kind==='reading'?'Editar lectura '+q.id:'Editar pregunta '+q.number+' · '+$('year').value;
 $('recordId').value=q.id;
 $('status').value=['borrador','en_revision','publicada'].includes(q.editor_status)?q.editor_status:'borrador';
 $('readingArea').classList.toggle('hidden',kind!=='reading');
 $('questionArea').classList.toggle('hidden',kind!=='question');
 if(kind==='reading'){
  $('passage').value=q.passage||'';
  $('images').value=(q.images||[]).join('\n');
  $('textPreview').textContent=q.passage||'';
  renderImages();
 }else{
  $('statement').value=q.statement||'';
  for(let i=0;i<4;i++)$('opt'+i).value=q.options?.[i]||'';
  $('correct').value=String(q.correct_index);
  $('explanation').value=q.editor_explanation||'';
  $('textPreview').textContent=q.statement+'\n'+q.options.map((x,i)=>'ABCD'[i]+') '+x).join('\n');
 }
 $('feedback').textContent='';
 $('feedback').className='muted';
}
function validateImages(images){
 for(const image of images){
  if(!/^beca18-illustrations\/20(?:23|24|25)\/[a-zA-Z0-9_-]+\.(?:png|webp|jpg|jpeg)$/.test(image))throw Error('Solo se admiten rutas de ilustraciones dentro de beca18-illustrations/2023, 2024 o 2025; no páginas completas.');
 }
}
function collect(){
 const q=selectedItem();if(!q)throw Error('Selecciona un elemento.');
 const status=$('status').value;
 if(!['borrador','en_revision','publicada'].includes(status))throw Error('Estado desconocido.');
 if(status==='publicada'&&!confirm('¿Confirmas marcar este contenido como PUBLICADA? No se enviará al sitio automáticamente; tendrás que subir el JSON a GitHub.'))return null;
 let next={...q,editor_status:status,editor_updated_at:new Date().toISOString()};
 if(kind==='reading'){
  const passage=$('passage').value.trim();
  if(passage.length<30)throw Error('La lectura debe contener al menos 30 caracteres.');
  const images=$('images').value.split('\n').map(s=>s.trim()).filter(Boolean);
  validateImages(images);
  next={...next,passage,images};
 }else{
  const statement=$('statement').value.trim();
  const options=[0,1,2,3].map(i=>$('opt'+i).value.trim());
  if(statement.length<12)throw Error('El enunciado debe tener al menos 12 caracteres.');
  if(options.some(x=>x.length<2))throw Error('Completa las cuatro alternativas.');
  if(new Set(options.map(s=>s.toLowerCase())).size!==4)throw Error('Las cuatro alternativas deben ser diferentes.');
  const correct=Number($('correct').value);
  if(!Number.isInteger(correct)||correct<0||correct>3)throw Error('Selecciona una clave de A a D.');
  if(status==='publicada'&&$('explanation').value.trim().length<30)throw Error('Antes de marcar como publicada, escribe una explicación de al menos 30 caracteres.');
  next={...next,statement,options,correct_index:correct,editor_explanation:$('explanation').value.trim()};
 }
 return next;
}
function save(){try{
 const next=collect();if(!next)return;
 const list=items();const idx=list.findIndex(q=>q.id===selected);if(idx<0)throw Error('Elemento no encontrado.');
 list[idx]=next;persist();renderList();renderForm();msg('Borrador guardado en este navegador. Para publicarlo en la plataforma descarga el archivo JSON y actualízalo en GitHub.');
 }catch(e){msg(e.message,false);}
}
function changeStatus(s){$('status').value=s;save();}
function undoItem(){
 const q=selectedItem();if(!q||!confirm('¿Restaurar este elemento a la versión publicada en GitHub?'))return;
 const exam=original.exams.find(e=>e.year===Number($('year').value));const base=(kind==='reading'?exam.groups:exam.questions).find(x=>x.id===selected);
 const list=items(),index=list.findIndex(x=>x.id===selected);
 list[index]=clone(base);persist();renderList();renderForm();msg('Elemento restaurado al contenido del repositorio.');
}
function download(){
 const filename='beca18-examenes-verbal-revisado-'+new Date().toISOString().slice(0,10)+'.json';
 const updated=clone(data);
 updated.editor_exported_at=new Date().toISOString();
 updated.editor_note='Archivo exportado desde el editor. Revisar cambios en un pull request antes de fusionar en main.';
 const blob=new Blob([JSON.stringify(updated,null,2)+'\n'],{type:'application/json;charset=utf-8'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),3000);
 msg('Archivo descargado. Reemplaza beca18-examenes-verbal.json en GitHub y revisa el cambio antes de fusionarlo.');
}
async function auth(){
 if(!window.supabase||!window.SUPABASE_URL||!window.SUPABASE_ANON_KEY)throw Error('No se encuentra la configuración Supabase.');
 const client=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
 const {data:{session},error}=await client.auth.getSession();
 if(error||!session?.user)throw Error('Inicia sesión como administrador desde CachimboLab.');
 userId=session.user.id;
 const {data:profile,error:profileError}=await client.from('profiles').select('role').eq('id',userId).maybeSingle();
 if(profileError||profile?.role!=='admin')throw Error('Acceso restringido: solo usuarios administradores pueden abrir el editor.');
}
async function init(){
 try{
  await auth();
  const response=await fetch('beca18-examenes-verbal.json',{cache:'no-store'});
  if(!response.ok)throw Error('No se pudo obtener el archivo de exámenes.');
  original=await response.json();
  if(!Array.isArray(original.exams)||original.exams.length!==3)throw Error('El banco de exámenes está incompleto.');
  data=clone(original);storeKey='beca18_editor_draft_v1_'+userId;
  restoreDrafts();
  $('year').innerHTML=data.exams.map(e=>'<option value="'+e.year+'">'+e.year+'</option>').join('');
  $('year').onchange=()=>{selected=items()[0]?.id;renderList();renderForm();};
  $('entryType').onchange=()=>{kind=$('entryType').value;selected=items()[0]?.id;renderList();renderForm();};
  $('editForm').onsubmit=e=>{e.preventDefault();save();};
  $('markReview').onclick=()=>changeStatus('en_revision');
  $('markPublished').onclick=()=>changeStatus('publicada');
  $('discardItem').onclick=undoItem;
  $('download').onclick=download;
  $('images').addEventListener('change',renderImages);
  $('resetAll').onclick=()=>{if(!confirm('¿Borrar TODOS los borradores locales del editor?'))return;localStorage.removeItem(storeKey);data=clone(original);selected=items()[0]?.id;renderList();renderForm();msg('Se descartaron todos los borradores locales.');};
  selected=items()[0]?.id;renderList();renderForm();
  $('authMessage').textContent='Acceso de administrador autorizado. Las ediciones se guardan localmente y requieren publicación por GitHub.';
  $('authMessage').className='card success';
  $('editor').classList.remove('hidden');
 }catch(e){$('authMessage').textContent=e.message+' El banco de estudiantes no se ha modificado.';$('authMessage').className='card notice';}
}
init();
