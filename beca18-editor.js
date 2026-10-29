'use strict';
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone=x=>JSON.parse(JSON.stringify(x));
let original=null,data=null,selected=null,kind='reading',userId='',storeKey='',uploadedReading=null,uploadedQuestion=null;
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
function isEmbeddedImage(src){return /^data:image\/(?:jpeg|webp|png);base64,/.test(src);}
function validateSingleImage(src){
 if(isEmbeddedImage(src)){if(src.length>380000)throw Error('La imagen es demasiado grande: elige una imagen menor o más sencilla.');return;}
 if(!/^beca18-illustrations\/20(?:23|24|25)\/[a-zA-Z0-9_-]+\.(?:png|webp|jpg|jpeg)$/.test(src))throw Error('Solo se aceptan imágenes embebidas o rutas beca18-illustrations/año/nombre.jpg.');
}
function renderImages(){
 const q=selectedItem();
 const paths=$('images').value.split('\n').map(x=>x.trim()).filter(Boolean);
 const embedded=uploadedReading!==null?uploadedReading:(q?.images||[]).filter(isEmbeddedImage);
 const images=[...paths,...embedded];
 $('imagePreview').innerHTML=images.map(src=>'<div><img alt="Vista previa de ilustración" src="'+esc(src)+'"></div>').join('');
}
function renderQuestionImage(){
 const src=uploadedQuestion!==null?uploadedQuestion:(selectedItem()?.image||'');
 $('questionImagePreview').innerHTML=src?'<img alt="Imagen del enunciado" src="'+esc(src)+'">':'<span class="muted">Sin imagen en el enunciado.</span>';
}
async function compressImage(file){
 if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Selecciona una imagen PNG, JPG o WEBP.');
 if(file.size>12*1024*1024)throw Error('El archivo original supera 12 MB.');
 const url=URL.createObjectURL(file);
 try{
  const img=new Image();
  await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('No se pudo leer la imagen.'));img.src=url;});
  let max=1200,quality=.83;
  for(let attempt=0;attempt<7;attempt++){
   const scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
   const canvas=document.createElement('canvas');
   canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
   canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
   const ctx=canvas.getContext('2d');if(!ctx)throw Error('El navegador no permite preparar imágenes.');
   ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);
   ctx.drawImage(img,0,0,canvas.width,canvas.height);
   const result=canvas.toDataURL('image/jpeg',quality);
   if(result.length<=340000)return result;
   max=Math.round(max*.82);quality=Math.max(.56,quality-.05);
  }
  throw Error('Esta imagen no se pudo optimizar. Intenta con un recorte de menor tamaño.');
 }finally{URL.revokeObjectURL(url);}
}
async function uploadImage(target){
 const input=$(target==='reading'?'readingUpload':'questionUpload');
 if(!input.files?.[0])return;
 try{
  const encoded=await compressImage(input.files[0]);
  if(target==='reading'){uploadedReading=[encoded];$('images').value='';renderImages();}
  else{uploadedQuestion=encoded;renderQuestionImage();}
  msg('Imagen preparada y ajustada. Presiona «Guardar borrador local» para conservarla y luego descarga el JSON para publicarla.');
 }catch(e){msg(e.message,false);}
 finally{input.value='';}
}
function renderForm(){
 const q=selectedItem();
 if(!q)return;
 uploadedReading=null;uploadedQuestion=null;
 $('formTitle').textContent=kind==='reading'?'Editar lectura '+q.id:'Editar pregunta '+q.number+' · '+$('year').value;
 $('recordId').value=q.id;
 $('status').value=['borrador','en_revision','publicada'].includes(q.editor_status)?q.editor_status:'borrador';
 $('readingArea').classList.toggle('hidden',kind!=='reading');
 $('questionArea').classList.toggle('hidden',kind!=='question');
 if(kind==='reading'){
  $('passage').value=q.passage||'';
  $('images').value=(q.images||[]).filter(x=>!isEmbeddedImage(x)).join('\n');
  $('textPreview').textContent=q.passage||'';
  renderImages();
 }else{
  $('statement').value=q.statement||'';
  for(let i=0;i<4;i++)$('opt'+i).value=q.options?.[i]||'';
  $('correct').value=String(q.correct_index);
  $('explanation').value=q.editor_explanation||'';
  $('textPreview').textContent=q.statement+'\n'+q.options.map((x,i)=>'ABCD'[i]+') '+x).join('\n');
  renderQuestionImage();
 }
 $('feedback').textContent='';
 $('feedback').className='muted';
}
function validateImages(images){for(const src of images)validateSingleImage(src);}
function collect(){
 const q=selectedItem();if(!q)throw Error('Selecciona un elemento.');
 const status=$('status').value;
 if(!['borrador','en_revision','publicada'].includes(status))throw Error('Estado desconocido.');
 if(status==='publicada'&&!confirm('¿Confirmas marcar este contenido como PUBLICADA? No se enviará al sitio automáticamente; tendrás que subir el JSON a GitHub.'))return null;
 let next={...q,editor_status:status,editor_updated_at:new Date().toISOString()};
 if(kind==='reading'){
  const passage=$('passage').value.trim();
  if(passage.length<30)throw Error('La lectura debe contener al menos 30 caracteres.');
  const paths=$('images').value.split('\n').map(s=>s.trim()).filter(Boolean);
  const embedded=uploadedReading!==null?uploadedReading:(q.images||[]).filter(isEmbeddedImage);
  const images=[...paths,...embedded];
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
  const image=uploadedQuestion!==null?uploadedQuestion:(q.image||'');
  if(image)validateSingleImage(image);
  next={...next,statement,options,correct_index:correct,image,editor_explanation:$('explanation').value.trim()};
 }
 return next;
}
function save(){try{
 const next=collect();if(!next)return;
 const list=items();const idx=list.findIndex(q=>q.id===selected);if(idx<0)throw Error('Elemento no encontrado.');
 list[idx]=next;persist();renderList();renderForm();msg('Borrador guardado en este navegador. Usa «Guardar cambios privados» para actualizar el banco protegido.');
 }catch(e){msg(e.message,false);}
}
function changeStatus(s){$('status').value=s;save();}
function undoItem(){
 const q=selectedItem();if(!q||!confirm('¿Restaurar este elemento a la versión privada actual de Supabase?'))return;
 const exam=original.exams.find(e=>e.year===Number($('year').value));const base=(kind==='reading'?exam.groups:exam.questions).find(x=>x.id===selected);
 const list=items(),index=list.findIndex(x=>x.id===selected);
 list[index]=clone(base);persist();renderList();renderForm();msg('Elemento restaurado al banco privado de Supabase.');
}
function download(){
 const filename='beca18-examenes-verbal-revisado-'+new Date().toISOString().slice(0,10)+'.json';
 const updated=clone(data);
 updated.editor_exported_at=new Date().toISOString();
 updated.editor_note='Copia de respaldo privada. No publicar este documento en GitHub Pages.';
 const blob=new Blob([JSON.stringify(updated,null,2)+'\n'],{type:'application/json;charset=utf-8'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),3000);
 msg('Respaldo descargado. No subas este archivo a repositorios públicos: usa «Guardar cambios privados».');
}
async function guardarBancoPrivado(){
 if(!data||!Array.isArray(data.exams))return;
 if(!confirm('¿Guardar el banco completo en Supabase privado? Tus cambios serán visibles solo para alumnos autorizados Beca 18.'))return;
 const b=$('savePrivate');
 if(b)b.disabled=true;
 try{
  const client=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
  const {error}=await client.rpc('admin_save_private_beca_exams',{p_document:data});
  if(error)throw error;
  original=clone(data);
  localStorage.removeItem(storeKey);
  msg('Banco de exámenes actualizado en Supabase privado. Ningún archivo público ha sido modificado.');
 }catch(e){msg('No se pudo guardar en Supabase: '+e.message,false);}
 finally{if(b)b.disabled=false;}
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
  original=await window.becaPrivate.document('beca18-examenes-verbal.json');
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
  $('savePrivate').onclick=guardarBancoPrivado;
  $('images').addEventListener('change',renderImages);
  $('readingUpload').addEventListener('change',()=>uploadImage('reading'));
  $('questionUpload').addEventListener('change',()=>uploadImage('question'));
  $('removeReadingImages').onclick=()=>{$('images').value='';uploadedReading=[];renderImages();};
  $('removeQuestionImage').onclick=()=>{uploadedQuestion='';renderQuestionImage();};
  $('resetAll').onclick=()=>{if(!confirm('¿Borrar TODOS los borradores locales del editor?'))return;localStorage.removeItem(storeKey);data=clone(original);selected=items()[0]?.id;renderList();renderForm();msg('Se descartaron todos los borradores locales.');};
  selected=items()[0]?.id;renderList();renderForm();
  $('authMessage').textContent='Acceso de administrador autorizado. Las ediciones se guardan localmente y requieren publicación por GitHub.';
  $('authMessage').className='card success';
  $('editor').classList.remove('hidden');
 }catch(e){$('authMessage').textContent=e.message+' El banco de estudiantes no se ha modificado.';$('authMessage').className='card notice';}
}
init();
