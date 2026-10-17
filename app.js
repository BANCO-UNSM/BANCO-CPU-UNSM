'use strict';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ready=Boolean(window.supabase&&window.SUPABASE_URL&&window.SUPABASE_ANON_KEY);
// Identificador de instalación de este navegador. No constituye identificación física infalible.
const deviceKey='academia_unsm_device_v1';
let deviceId=localStorage.getItem(deviceKey);
if(!deviceId){deviceId=crypto.randomUUID();localStorage.setItem(deviceKey,deviceId)}
const db=ready?window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY):null;
let access=null,students=[],user=null,profile=null,questions=[],attempts=[],page='home',quiz=null,practice=null,bulkRows=[],bulkBusy=false,reviewRows=[],reviewSelected=null,reviewFilter={subject:'',week:'',status:''};
const teacher=()=>['teacher','admin'].includes(profile?.role);
const notice=(s,bad=false)=>`<div class="card"><p ${bad?'style="color:#b45309"':''}>${esc(s)}</p></div>`;
async function init(){if(!ready){$('app').innerHTML=notice('Falta configurar config.js con la URL y la clave pública de Supabase.');$('nav').innerHTML='';return} const {data:{session}}=await db.auth.getSession();user=session?.user||null;await refresh();db.auth.onAuthStateChange(()=>setTimeout(async()=>{const {data:{session}}=await db.auth.getSession();user=session?.user||null;await refresh()},0));}
async function refresh(){
 profile=null;access=null;questions=[];attempts=[];
 if(user){
  const p=await db.from('profiles').select('role,name').eq('id',user.id).maybeSingle();profile=p.data;
  if(teacher()) access={status:'staff',allowed:true};
  else {
   // Primero se comprueba la suscripción: has_active_access exige una sesión ya vinculada.
   const {data:subscribed,error:subscriptionError}=await db.rpc('has_valid_subscription');
   if(subscriptionError)access={status:'setup_error',message:subscriptionError.message,allowed:false};
   else if(!subscribed)access={status:'pending',message:'Tu cuenta aún no tiene una autorización vigente. Contacta al administrador.',allowed:false};
   else {
    // Registra el navegador y la sesión de Supabase en una única operación segura.
    const {data:registered,error:deviceError}=await db.rpc('register_student_session',{p_device_token:deviceId});
    if(deviceError||!registered)access={status:'device_blocked',message:deviceError?.message||'Ya existe otra sesión autorizada. Solicita al administrador liberar el navegador anterior.',allowed:false};
    else {
     const {data:verified,error:verifyError}=await db.rpc('verify_student_device',{p_device_token:deviceId});
     const {data:active,error:activeError}=await db.rpc('has_active_access');
     const allowed=verified===true&&active===true&&!verifyError&&!activeError;
     access={status:allowed?'active':'device_blocked',allowed,message:verifyError?.message||activeError?.message||'No se pudo validar esta sesión.'};
    }
   }
  }
  if(teacher()||access?.allowed){
   const q=await db.from('questions').select('id,cycle,week,subject,topic,page,original_number,statement,options,source,status').order('created_at',{ascending:false});
   if(q.error)console.error(q.error.message);else questions=q.data||[];
   const r=await db.from('attempts').select('id,submitted_at,total,correct').order('submitted_at',{ascending:false}).limit(30);attempts=r.data||[];
  }
 }
 render();
}
function render(){
 const allowed=teacher()||access?.allowed;
 const pages=user?(allowed?[['home','Inicio'],['bank','Banco académico'],['quiz','Simulacros'],['practice','Práctica inmediata'],['results','Mis resultados'],...(teacher()?[['manage','Registrar pregunta'],['bulk','Carga masiva'],['review','Revisión y publicación']]:[]),...(admin()?[['students','Control de alumnos']]:[])]:[['access','Mi acceso']]):[];
 if(!pages.some(([id])=>id===page))page=allowed?'home':'access';
 $('nav').innerHTML=pages.map(([id,name])=>`<button data-page="${id}" class="${page===id?'active':''}">${name}</button>`).join('');
 document.querySelectorAll('[data-page]').forEach(x=>x.onclick=()=>{page=x.dataset.page;quiz=null;practice=null;render()});
 $('heading').textContent=({home:'Panel principal',bank:'Banco de preguntas',quiz:'Simulacros',practice:'Práctica inmediata',results:'Resultados',manage:'Panel docente',bulk:'Carga masiva de preguntas',review:'Revisión y publicación',access:'Estado de acceso',students:'Administración de alumnos'})[page];
 $('account').innerHTML=user?`<span class="muted small">${esc(user.email)} · ${admin()?'Administrador':teacher()?'Docente':'Estudiante'}</span> <button class="secondary" id="logout">Salir</button>`:'';
 if(user)$('logout').onclick=()=>db.auth.signOut();
 $('app').innerHTML=!user?login():!allowed?accessPage():({home,bank,quiz:quizPage,practice:practicePage,results,manage,bulk:bulkPage,review:reviewPage,students:studentsPage})[page]();
 bind();
}
function accessPage(){
 const status=access?.status==='pending'?'Pendiente de autorización':access?.status==='suspended'?'Cuenta suspendida':access?.status==='device_blocked'?'Dispositivo no autorizado':access?.status==='setup_error'?'Actualización pendiente en Supabase':'Suscripción vencida';
 return `<div class="card"><h2>${esc(status)}</h2><p>El administrador debe confirmar tu pago y habilitar tu acceso. No se realizan cobros en esta página.</p><p class="muted">${esc(access?.message||'Si ya pagaste, contacta al administrador. Si cambiaste de equipo, solicita liberar el dispositivo anterior.')}</p>${access?.expires_at?`<p>Vencimiento: ${esc(new Date(access.expires_at).toLocaleString('es-PE'))}</p>`:''}<button id="reloadAccess">Actualizar mi estado</button></div>`;
}
function studentsPage(){
 if(!admin())return notice('Solo el administrador puede gestionar alumnos',true);
 return `<div class="card"><h2>Control de alumnos</h2><p class="muted">Los pagos se reciben fuera de la web. Solo tú autorizas, renuevas, suspendes y liberas navegadores.</p><button id="loadStudents">Actualizar lista</button><p id="studentsStatus" class="muted"></p><div id="studentsList">${students.map(x=>`<div class="listitem"><strong>${esc(x.student_name||'Estudiante')}</strong><p class="small">ID: ${esc(x.student_id)} · ${esc(x.access_status)} · ${x.expires_at?esc(new Date(x.expires_at).toLocaleString('es-PE')):'Sin vencimiento'} · Navegador: ${x.device_registered?'vinculado':'sin vincular'}</p><p class="small muted">Pago: ${esc(x.payment_method||'sin registrar')} · S/ ${esc(x.payment_amount??'—')}</p><div class="actions"><button data-student-action="approve" data-student-id="${esc(x.student_id)}">Autorizar / renovar</button><button class="secondary" data-student-action="payment" data-student-id="${esc(x.student_id)}">Registrar pago</button><button class="secondary" data-student-action="release_device" data-student-id="${esc(x.student_id)}">Liberar navegador</button><button class="secondary" data-student-action="suspend" data-student-id="${esc(x.student_id)}">Suspender</button></div></div>`).join('')||'<p>Presiona «Actualizar lista» para cargar los alumnos.</p>'}</div></div>`;
}
async function loadStudents(){
 const {data,error}=await db.rpc('admin_list_students');
 if(error){const status=$('studentsStatus');if(status)status.textContent=error.message;return}
 students=data||[];render();
}
function bindStudents(){
 $('loadStudents').onclick=loadStudents;
 document.querySelectorAll('[data-student-action]').forEach(b=>b.onclick=async()=>{
  const id=b.dataset.studentId,action=b.dataset.studentAction,student=students.find(x=>x.student_id===id);
  if(!student)return;
  let rpc,args;
  if(action==='approve'){
   const suggested=student.expires_at&&new Date(student.expires_at)>new Date()?new Date(student.expires_at):new Date(Date.now()+30*86400000);
   const date=prompt('Fecha de vencimiento (AAAA-MM-DD):',suggested.toISOString().slice(0,10));
   if(date===null)return;
   if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date+'T23:59:59'))){alert('Fecha inválida');return}
   rpc='admin_authorize_student';args={p_student_id:id,p_expires_at:new Date(date+'T23:59:59').toISOString()};
  }else if(action==='payment'){
   const method=prompt('Medio de pago: Yape, Plin, Transferencia o Efectivo',student.payment_method||'Yape');
   if(method===null)return;
   const normalized=['Yape','Plin','Transferencia','Efectivo'].find(x=>x.toLowerCase()===method.trim().toLowerCase());
   if(!normalized){alert('Medio de pago inválido');return}
   const amount=prompt('Importe recibido en soles:',String(student.payment_amount??''));
   if(amount===null)return;
   if(!amount.trim()||!Number.isFinite(Number(amount))||Number(amount)<=0){alert('Importe inválido');return}
   const note=prompt('Observación (opcional):','');if(note===null)return;
   rpc='admin_register_payment';args={p_student_id:id,p_method:normalized,p_amount:Number(amount),p_notes:note};
  }else{
   if(!confirm(`¿Confirmas ${action==='suspend'?'suspender al alumno':'liberar su navegador'}?`))return;
   rpc=action==='suspend'?'admin_suspend_student':'admin_release_device';args={p_student_id:id};
  }
  b.disabled=true;
  const {error}=await db.rpc(rpc,args);
  if(error){alert('No se pudo actualizar: '+error.message);b.disabled=false;return}
  await loadStudents();
 });
}
function login(){return `<div class="card"><h2>Ingresar a Academia UNSM</h2><p class="muted">Regístrate como estudiante o inicia sesión. Un administrador debe habilitar las cuentas docentes.</p><form id="authForm"><div class="field"><label>Correo electrónico</label><input type="email" name="email" required></div><div class="field"><label>Contraseña (mínimo 6 caracteres)</label><input type="password" name="password" minlength="6" required></div><div class="actions"><button type="submit" name="action" value="login">Ingresar</button><button type="button" id="signup" class="secondary">Crear cuenta</button></div></form><p id="authStatus" class="muted"></p></div>`}
function home(){return `<div class="grid"><div class="card"><div class="muted">Preguntas visibles</div><div class="stat">${questions.length}</div></div><div class="card"><div class="muted">Materias</div><div class="stat">${new Set(questions.map(q=>q.subject)).size}</div></div><div class="card"><div class="muted">Simulacros completados</div><div class="stat">${attempts.length}</div></div></div><div class="card"><h2>${teacher()?'Gestión académica':'Preparación preuniversitaria'}</h2><p>Consulta preguntas organizadas por semana y materia. ${teacher()?'Registra nuevas preguntas y decide cuándo publicarlas.':'Practica y revisa tu rendimiento con calificación segura.'}</p><p class="muted">La carga de separatas y verificación de claves se realizará progresivamente.</p></div>`}
function bank(){return `<div class="card"><h2>Banco académico</h2><div class="filters"><select id="subjectFilter"><option value="">Todas las materias</option>${[...new Set(questions.map(q=>q.subject))].sort().map(s=>`<option>${esc(s)}</option>`).join('')}</select><select id="weekFilter"><option value="">Todas las semanas</option>${[...new Set(questions.map(q=>q.week))].sort((a,b)=>a-b).map(w=>`<option value="${w}">Semana ${w}</option>`).join('')}</select><input id="searchFilter" placeholder="Buscar enunciado o tema"></div><div id="bankList"></div></div>`}
function bankList(){const s=$('subjectFilter').value,w=$('weekFilter').value,t=$('searchFilter').value.toLowerCase();$('bankList').innerHTML=questions.filter(q=>(!s||q.subject===s)&&(!w||String(q.week)===w)&&(`${q.statement} ${q.topic}`.toLowerCase().includes(t))).map(q=>`<div class="listitem"><strong>${esc(q.subject)} · Semana ${q.week} · N.º ${q.original_number??'—'}</strong> <span class="tag">${esc(q.status)}</span><p>${esc(q.statement)}</p>${q.options.map((o,i)=>`<div class="small">${'ABCDE'[i]}) ${esc(o)}</div>`).join('')}<p class="muted small">${esc(q.source||'Fuente pendiente')} · ${esc(q.topic)}</p></div>`).join('')||'<p>No hay preguntas con estos filtros.</p>'}
function quizPage(){if(!quiz)return `<div class="card"><h2>Nuevo simulacro</h2><p class="muted">Se seleccionarán preguntas publicadas. Las claves no se descargan antes de enviar tus respuestas.</p><div class="field"><label>Materia</label><select id="quizSubject"><option value="">Todas</option>${[...new Set(questions.filter(q=>q.status==='published').map(q=>q.subject))].map(s=>`<option>${esc(s)}</option>`).join('')}</select></div><div class="field"><label>Número de preguntas</label><input id="quizCount" type="number" min="1" max="100" value="10"></div><button id="startQuiz">Comenzar</button></div>`;if(quiz.result){return `<div class="card"><h2>Resultado del simulacro</h2><div class="stat">${quiz.result.correct}/${quiz.result.total}</div><p>${Math.round(quiz.result.correct/quiz.result.total*100)}% de aciertos</p><button id="restartQuiz">Otro simulacro</button></div><div class="card"><h2>Revisión</h2>${quiz.items.map((q,i)=>{const d=quiz.result.details.find(d=>d.id===q.id);return `<div class="listitem"><strong>${esc(q.statement)}</strong><p>Tu respuesta: ${quiz.answers[i]===null?'Sin responder':esc(q.options[quiz.answers[i]])}</p><p>Clave: ${'ABCDE'[d.correct_index]}) ${esc(q.options[d.correct_index])} · ${d.is_correct?'Correcta':'Incorrecta'}</p>${d.explanation?`<div class="card"><strong>Desarrollo paso a paso</strong><p style="white-space:pre-wrap">${esc(d.explanation)}</p></div>`:'<p class="muted small">El desarrollo todavía no está disponible en el resultado del servidor.</p>'}</div>`}).join('')}</div>`}const q=quiz.items[quiz.i];return `<div class="card"><p>Pregunta ${quiz.i+1} de ${quiz.items.length}</p><h2>${esc(q.statement)}</h2>${q.options.map((o,i)=>`<label class="option"><input type="radio" name="choice" value="${i}" ${quiz.answers[quiz.i]===i?'checked':''}>${'ABCDE'[i]}) ${esc(o)}</label>`).join('')}<button id="nextQuiz">${quiz.i===quiz.items.length-1?'Entregar simulacro':'Siguiente'}</button><p id="quizError" class="muted"></p></div>`}

// La respuesta correcta nunca se obtiene antes de comprobar la pregunta en Supabase.
function practicePage(){
  const published=questions.filter(q=>q.status==='published');
  if(!practice)return `<div class="card"><h2>Práctica inmediata</h2><p class="muted">Resuelve una pregunta y recibe la corrección al instante. Tus respuestas se guardan en Supabase.</p><div class="field"><label>Materia</label><select id="practiceSubject"><option value="">Todas las materias</option>${[...new Set(published.map(q=>q.subject))].sort().map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('')}</select></div><div class="actions"><button id="startPractice" ${published.length?'':'disabled'}>Comenzar práctica</button><button id="reviewPractice" class="secondary">Repasar mis errores</button></div><p id="practiceStatus" class="muted">${published.length?`${published.length} pregunta(s) publicada(s) disponible(s).`:'Todavía no hay preguntas publicadas.'}</p></div>`;
  const q=practice.items[practice.i];
  if(!q)return `<div class="card"><h2>Práctica finalizada</h2><p>Has completado ${practice.items.length} pregunta(s).</p><p>Aciertos en esta sesión: <strong>${practice.hits}/${practice.items.length}</strong></p><button id="finishPractice">Volver al inicio de práctica</button></div>`;
  const d=practice.feedback;
  return `<div class="card"><p class="muted">Pregunta ${practice.i+1} de ${practice.items.length} · ${esc(q.subject)} · Semana ${esc(q.week)}</p><h2>${esc(q.statement)}</h2>${q.options.map((o,i)=>`<label class="option"><input type="radio" name="practiceChoice" value="${i}" ${d?'disabled':''} ${practice.selected===i?'checked':''}>${'ABCDE'[i]}) ${esc(o)}</label>`).join('')}${!d?`<button id="checkPractice">Comprobar respuesta</button>`:`<div class="card"><h3>${d.is_correct?'¡Respuesta correcta!':'Respuesta incorrecta'}</h3><p>Tu respuesta: ${practice.selected===null?'Sin responder':`${'ABCDE'[practice.selected]}) ${esc(q.options[practice.selected])}`}</p><p><strong>Respuesta correcta: ${'ABCDE'[d.correct_index]}) ${esc(q.options[d.correct_index])}</strong></p><h3>Desarrollo paso a paso</h3><p style="white-space:pre-wrap">${esc(d.explanation?.trim()||'Todavía no se ha registrado una explicación para esta pregunta.')}</p></div><button id="nextPractice">${practice.i===practice.items.length-1?'Ver resumen':'Siguiente pregunta'}</button>`}<p id="practiceError" class="muted"></p></div>`;
}
async function startPractice(items){
  if(!items.length){$('practiceStatus').textContent='No hay preguntas disponibles con este criterio.';return}
  practice={items:[...items].sort(()=>Math.random()-.5),i:0,selected:null,feedback:null,hits:0};render();
}
function bindPractice(){
  if($('startPractice'))$('startPractice').onclick=()=>{const subject=$('practiceSubject').value;startPractice(questions.filter(q=>q.status==='published'&&(!subject||q.subject===subject)))};
  if($('reviewPractice'))$('reviewPractice').onclick=async()=>{
    const button=$('reviewPractice');button.disabled=true;$('practiceStatus').textContent='Buscando tus preguntas pendientes...';
    const {data,error}=await db.rpc('questions_to_review',{p_limit:100});
    if(error){$('practiceStatus').textContent='No se pudo consultar el repaso: '+error.message;button.disabled=false;return}
    const ids=new Set((data||[]).map(x=>x.question_id));const items=questions.filter(q=>q.status==='published'&&ids.has(q.id));
    if(!items.length){$('practiceStatus').textContent='No tienes preguntas pendientes de repaso. ¡Buen trabajo!';button.disabled=false;return}
    startPractice(items);
  };
  if($('checkPractice'))$('checkPractice').onclick=async()=>{
    const selected=document.querySelector('input[name="practiceChoice"]:checked');
    if(!selected){$('practiceError').textContent='Selecciona una alternativa antes de comprobar.';return}
    const button=$('checkPractice');button.disabled=true;$('practiceError').textContent='Comprobando...';
    const answer=Number(selected.value),q=practice.items[practice.i];
    const {data,error}=await db.rpc('check_practice_answer',{p_question_id:q.id,p_selected_index:answer});
    if(error){$('practiceError').textContent='No se pudo comprobar: '+error.message;button.disabled=false;return}
    practice.selected=answer;practice.feedback=data;if(data.is_correct)practice.hits++;render();
  };
  if($('nextPractice'))$('nextPractice').onclick=()=>{practice.i++;practice.selected=null;practice.feedback=null;render()};
  if($('finishPractice'))$('finishPractice').onclick=()=>{practice=null;render()};
}

function results(){return `<div class="card"><h2>Mis resultados</h2>${attempts.map(a=>`<div class="listitem"><strong>${new Date(a.submitted_at).toLocaleString('es-PE')}</strong> · ${a.correct}/${a.total} (${Math.round(100*a.correct/a.total)}%)</div>`).join('')||'<p>Todavía no hay resultados.</p>'}</div>`}
function manage(){if(!teacher())return notice('Acceso exclusivo para docentes',true);return `<div class="card"><h2>Registrar pregunta original</h2><p class="muted">Conserva ciclo, semana, número y página. La pregunta se guarda como borrador para revisión administrativa.</p><form id="questionForm"><div class="form-grid"><div class="field"><label>Ciclo</label><input name="cycle" value="2026-II" required></div><div class="field"><label>Semana</label><input name="week" type="number" min="1" max="60" value="9" required></div><div class="field"><label>Materia</label><input name="subject" required></div><div class="field"><label>Tema</label><input name="topic" required></div><div class="field"><label>Página</label><input name="page" type="number" min="1"></div><div class="field"><label>Número original</label><input name="number" type="number" min="1"></div></div><div class="field"><label>Enunciado</label><textarea name="statement" required></textarea></div>${'ABCDE'.split('').map(x=>`<div class="field"><label>Alternativa ${x}</label><input name="option${x}" required></div>`).join('')}<div class="field"><label>Clave propuesta</label><select name="correct">${'ABCDE'.split('').map((x,i)=>`<option value="${i}">${x}</option>`).join('')}</select></div><div class="field"><label>Explicación</label><textarea name="explanation"></textarea></div><div class="field"><label>Referencia de origen</label><input name="source" placeholder="Separata CPU-UNSM, semana 09, pág. 15"></div><button type="submit">Guardar en Supabase</button></form><p id="saveStatus"></p></div>`}

// Importador CSV: la revisión se realiza ANTES de guardar, sin acceso directo a answer_keys.
const BULK_HEADERS=['cycle','week','subject','topic','page','original_number','statement','option_a','option_b','option_c','option_d','option_e','correct','explanation','source'];
function parseBulkCsv(text){
  const rows=[];let row=[],cell='',quoted=false;
  text=String(text).replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(quoted){if(c==='"'&&text[i+1]==='"'){cell+='"';i++}else if(c==='"')quoted=false;else cell+=c}
    else if(c==='"'){if(cell!=='')throw Error('Comillas incorrectas cerca de la fila '+(rows.length+1));quoted=true}
    else if(c===','){row.push(cell);cell=''}
    else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell=''}
    else cell+=c;
  }
  if(quoted)throw Error('Hay comillas sin cerrar en el archivo CSV.');
  row.push(cell);if(row.some(v=>v.trim()))rows.push(row);
  return rows;
}
function bulkFingerprint(q){return [String(q.cycle||'').trim().toLowerCase(),String(q.week||'').trim(),String(q.subject||'').trim().toLowerCase(),String(q.statement||'').trim().replace(/\s+/g,' ').toLowerCase()].join('|')}
function validateBulkRow(r){
  const errs=[],required=['cycle','week','subject','topic','statement','option_a','option_b','option_c','option_d','option_e','correct'];
  for(const f of required)if(!String(r[f]||'').trim())errs.push('Falta '+f);
  if(r.cycle.trim().length>100)errs.push('Ciclo muy largo');
  if(r.subject.trim().length>120||r.topic.trim().length>200)errs.push('Materia o tema demasiado largo');
  if(!/^\d+$/.test(r.week.trim())||Number(r.week)<1||Number(r.week)>60)errs.push('Semana inválida (1 a 60)');
  for(const f of ['page','original_number'])if(r[f].trim()&&(!/^\d+$/.test(r[f].trim())||Number(r[f])<1))errs.push(f+' debe ser positivo');
  if(!/^[ABCDE]$/i.test(r.correct.trim()))errs.push('Clave debe ser A, B, C, D o E');
  return errs;
}
function bulkPage(){
  if(!teacher())return notice('Acceso exclusivo para docentes',true);
  const valid=bulkRows.filter(r=>!r.errors.length).length;
  const invalid=bulkRows.length-valid;
  return `<div class="card"><h2>Carga masiva desde CSV</h2>
    <p>Importa preguntas de tus separatas CPU-UNSM sin registrarlas una por una. Prepara un CSV con la plantilla, revisa la vista previa y guarda únicamente las filas válidas. <strong>Todas se guardan como borradores</strong>: ninguna se publica automáticamente.</p>
    <p><a href="plantilla_preguntas.csv" download>Descargar plantilla CSV</a> · <span class="muted">Puedes editarla con Excel y guardarla como CSV UTF-8 (delimitado por comas).</span></p>
    <div class="field"><label>Selecciona tu archivo CSV</label><input id="bulkFile" type="file" accept=".csv,text/csv" ${bulkBusy?'disabled':''}></div>
    <p id="bulkStatus" class="muted" aria-live="polite">${bulkRows.length?`${bulkRows.length} filas analizadas: ${valid} listas, ${invalid} con observaciones.`:'Aún no se ha seleccionado un archivo.'}</p>
    <div class="actions"><button id="bulkImport" ${!valid||bulkBusy?'disabled':''}>Guardar ${valid} preguntas como borradores</button><button id="bulkClear" class="secondary" ${bulkBusy?'disabled':''}>Limpiar vista previa</button></div>
    <p class="muted small">No incluyas claves secretas de Supabase. El importador usa tu sesión y la función segura save_question. La clave de cada pregunta es obligatoria para guardarla, pero debe revisarse antes de publicarla.</p>
  </div>
  ${bulkRows.length?`<div class="card"><h2>Vista previa</h2><p class="muted">Se muestran las primeras 30 filas. Corrige el CSV y vuelve a seleccionarlo si encuentras errores.</p>
  ${bulkRows.slice(0,30).map(r=>`<div class="listitem"><strong>Fila ${r.line} · ${esc(r.subject)} · Semana ${esc(r.week)} · N.º ${esc(r.original_number||'—')}</strong> <span class="tag">${r.errors.length?'Revisar':'Lista'}</span><p>${esc(r.statement).slice(0,450)}</p><p class="small">Clave propuesta: ${esc(r.correct)} · ${esc(r.source||'Sin referencia')}</p>${r.errors.length?`<p style="color:#b45309">${esc(r.errors.join('; '))}</p>`:''}</div>`).join('')}</div>`:''}`;
}
function bindBulk(){
  const file=$('bulkFile'),status=$('bulkStatus');
  file.onchange=async()=>{
    if(!file.files.length)return;
    try{
      if(file.files[0].size>5*1024*1024)throw Error('El archivo supera 5 MB. Divídelo en varios CSV.');
      const matrix=parseBulkCsv(await file.files[0].text());
      if(!matrix.length)throw Error('El CSV está vacío.');
      const header=matrix.shift().map(x=>x.trim().toLowerCase());
      if(header.join('|')!==BULK_HEADERS.join('|'))throw Error('Las columnas no coinciden con la plantilla. Descarga la plantilla y conserva el orden de los encabezados.');
      if(matrix.length>500)throw Error('Máximo 500 preguntas por archivo. Divide el CSV.');
      const seen=new Set(questions.map(bulkFingerprint));
      bulkRows=matrix.map((values,i)=>{
        const r={line:i+2};BULK_HEADERS.forEach((h,j)=>r[h]=String(values[j]??'').trim());
        r.errors=validateBulkRow(r);
        if(values.length!==BULK_HEADERS.length)r.errors.push('Número de columnas incorrecto');
        const fp=bulkFingerprint(r);if(seen.has(fp))r.errors.push('Posible duplicado (ya existe o está repetida en el CSV)');seen.add(fp);
        return r;
      });
      render();
    }catch(e){bulkRows=[];render();$('bulkStatus').textContent='No se pudo leer: '+e.message}
  };
  $('bulkClear').onclick=()=>{bulkRows=[];render()};
  $('bulkImport').onclick=async()=>{
    if(bulkBusy||!confirm('¿Guardar las preguntas válidas como borradores en Supabase? No se publicarán automáticamente.'))return;
    const button=$('bulkImport');button.disabled=true;$('bulkClear').disabled=true;file.disabled=true;bulkBusy=true;
    const rows=bulkRows.filter(r=>!r.errors.length);let saved=0;const failures=[];
    for(let i=0;i<rows.length;i++){
      const r=rows[i];status.textContent=`Guardando ${i+1} de ${rows.length}... (${saved} correctas)`;
      const {error}=await db.rpc('save_question',{
        p_cycle:r.cycle,p_week:Number(r.week),p_subject:r.subject,p_topic:r.topic,
        p_page:r.page?Number(r.page):null,p_number:r.original_number?Number(r.original_number):null,
        p_statement:r.statement,p_options:['a','b','c','d','e'].map(x=>r['option_'+x]),
        p_source:r.source,p_correct:'ABCDE'.indexOf(r.correct.toUpperCase()),p_explanation:r.explanation,p_publish:false
      });
      if(error)failures.push(`Fila ${r.line}: ${error.message}`);else{saved++;r.errors.push('Guardada en Supabase');}
    }
    bulkBusy=false;await refresh();
    const result=$('bulkStatus');if(result)result.textContent=`Finalizado: ${saved} guardadas como borrador; ${failures.length} fallidas. ${failures.slice(0,5).join(' | ')}`;
    const importButton=$('bulkImport');if(importButton)importButton.disabled=true;
  };
}


// Panel protegido: las claves se consultan solo mediante RPC autorizadas.
const admin=()=>profile?.role==='admin';
function reviewPage(){
 if(!teacher())return notice('Acceso exclusivo para docentes',true);
 const subjects=[...new Set(questions.map(q=>q.subject))].sort();
 const weeks=[...new Set(questions.map(q=>q.week))].sort((a,b)=>a-b);
 const opts=(values,current)=>values.map(v=>`<option value="${esc(v)}" ${String(v)===String(current)?'selected':''}>${esc(v)}</option>`).join('');
 const filtered=questions.filter(q=>(!reviewFilter.subject||q.subject===reviewFilter.subject)&&(!reviewFilter.week||String(q.week)===reviewFilter.week)&&(!reviewFilter.status||q.status===reviewFilter.status));
 const detail=reviewSelected;
 return `<div class="card"><h2>Revisión y publicación</h2><p class="muted">Las preguntas importadas permanecen en borrador hasta su aprobación. ${admin()?'Tu cuenta tiene permisos de administrador.':'Puedes enviar borradores a revisión; solo un administrador puede publicarlos.'}</p><div class="filters"><select id="reviewSubject"><option value="">Todas las materias</option>${opts(subjects,reviewFilter.subject)}</select><select id="reviewWeek"><option value="">Todas las semanas</option>${weeks.map(w=>`<option value="${w}" ${String(w)===reviewFilter.week?'selected':''}>Semana ${w}</option>`).join('')}</select><select id="reviewStatus"><option value="">Todos los estados</option>${opts(['draft','review','published'],reviewFilter.status)}</select></div><p class="muted small">${filtered.length} preguntas encontradas · ${questions.filter(q=>q.status==='draft').length} borradores · ${questions.filter(q=>q.status==='review').length} en revisión · ${questions.filter(q=>q.status==='published').length} publicadas</p><div id="reviewMessage" class="muted" role="status"></div>${filtered.map(q=>`<div class="listitem"><strong>${esc(q.subject)} · Semana ${q.week} · N.º ${q.original_number??'—'}</strong> <span class="tag">${esc(q.status)}</span><p>${esc(q.statement)}</p><button class="secondary" data-review-id="${q.id}">Revisar pregunta</button></div>`).join('')||'<p>No hay preguntas con estos filtros.</p>'}</div><div id="reviewDetail">${detail?reviewDetail(detail):''}</div>`;
}
function reviewDetail(q){
 const editable=q.status!=='published';
 return `<div class="card"><h2>Pregunta N.º ${q.original_number??'—'} · ${esc(q.status)}</h2><p class="muted small">Materia: ${esc(q.subject)} · Semana ${q.week}</p><form id="reviewForm"><div class="form-grid"><div class="field"><label>Ciclo</label><input name="cycle" value="${esc(q.cycle)}" required ${editable?'':'disabled'}></div><div class="field"><label>Semana</label><input type="number" name="week" min="1" max="60" value="${q.week}" required ${editable?'':'disabled'}></div><div class="field"><label>Materia</label><input name="subject" value="${esc(q.subject)}" required ${editable?'':'disabled'}></div><div class="field"><label>Tema</label><input name="topic" value="${esc(q.topic)}" required ${editable?'':'disabled'}></div><div class="field"><label>Página</label><input type="number" name="page" min="1" value="${q.page??''}" ${editable?'':'disabled'}></div><div class="field"><label>Número original</label><input type="number" name="number" min="1" value="${q.original_number??''}" ${editable?'':'disabled'}></div></div><div class="field"><label>Enunciado</label><textarea name="statement" required ${editable?'':'disabled'}>${esc(q.statement)}</textarea></div>${'ABCDE'.split('').map((letter,i)=>`<div class="field"><label>Alternativa ${letter}</label><input name="option${letter}" value="${esc(q.options[i]||'')}" required ${editable?'':'disabled'}></div>`).join('')}<div class="field"><label>Clave propuesta</label><select name="correct" ${editable?'':'disabled'}>${'ABCDE'.split('').map((letter,i)=>`<option value="${i}" ${q.correct_index===i?'selected':''}>${letter}</option>`).join('')}</select></div><div class="field"><label>Explicación</label><textarea name="explanation" ${editable?'':'disabled'}>${esc(q.explanation||'')}</textarea></div><div class="field"><label>Referencia</label><input name="source" value="${esc(q.source||'')}" ${editable?'':'disabled'}></div>${editable?'<button type="submit" id="reviewSave">Guardar correcciones</button>':''}</form><div class="actions" style="margin-top:12px">${q.status==='draft'?'<button id="reviewSubmit" class="secondary">Enviar a revisión</button>':''}${admin()&&q.status==='review'?'<button id="reviewPublish">Publicar pregunta</button>':''}<button id="reviewClose" class="secondary">Cerrar detalle</button></div><p id="reviewDetailStatus" class="muted" role="status"></p>${q.status==='published'?'<p class="muted small">Las preguntas publicadas no se editan desde este panel para preservar los resultados de los estudiantes.</p>':''}</div>`;
}
function bindReview(){
 for(const [id,key] of [['reviewSubject','subject'],['reviewWeek','week'],['reviewStatus','status']])$(id).onchange=()=>{reviewFilter[key]=$(id).value;reviewSelected=null;render()};
 document.querySelectorAll('[data-review-id]').forEach(btn=>btn.onclick=async()=>{
   const message=$('reviewMessage');message.textContent='Cargando pregunta y clave...';
   const {data,error}=await db.rpc('get_question_for_review',{p_question_id:btn.dataset.reviewId});
   if(error){message.textContent='Error: '+error.message;return}
   reviewSelected=data;$('reviewDetail').innerHTML=reviewDetail(data);message.textContent='';bindReviewDetail();$('reviewDetail').scrollIntoView({behavior:'smooth',block:'start'});
 });
 if(reviewSelected)bindReviewDetail();
}
function bindReviewDetail(){
 const q=reviewSelected;if(!q)return;
 $('reviewClose').onclick=()=>{reviewSelected=null;$('reviewDetail').innerHTML=''};
 const form=$('reviewForm');
 if(q.status!=='published')form.onsubmit=async e=>{
   e.preventDefault();const b=$('reviewSave'),status=$('reviewDetailStatus');b.disabled=true;status.textContent='Guardando...';
   const v=Object.fromEntries(new FormData(form).entries());
   const {error}=await db.rpc('update_question_for_review',{p_question_id:q.id,p_cycle:v.cycle,p_week:Number(v.week),p_subject:v.subject,p_topic:v.topic,p_page:v.page?Number(v.page):null,p_number:v.number?Number(v.number):null,p_statement:v.statement,p_options:'ABCDE'.split('').map(c=>v['option'+c]),p_source:v.source||'',p_correct:Number(v.correct),p_explanation:v.explanation||''});
   if(error){status.textContent='Error: '+error.message;b.disabled=false;return}
   reviewSelected=null;await refresh();const m=$('reviewMessage');if(m)m.textContent='Correcciones guardadas. Abre nuevamente la pregunta para continuar.';
 };
 if($('reviewSubmit'))$('reviewSubmit').onclick=async()=>{
   if(!confirm('¿Enviar esta pregunta a revisión? Guarda antes cualquier corrección pendiente.'))return;
   const b=$('reviewSubmit');b.disabled=true;const {error}=await db.rpc('submit_question_for_review',{p_question_id:q.id});
   if(error){$('reviewDetailStatus').textContent='Error: '+error.message;b.disabled=false;return}
   reviewSelected=null;await refresh();$('reviewMessage').textContent='Pregunta enviada a revisión.';
 };
 if($('reviewPublish'))$('reviewPublish').onclick=async()=>{
   if(!confirm('¿Confirmas que revisaste la clave, alternativas y explicación y deseas publicar esta pregunta?'))return;
   const b=$('reviewPublish');b.disabled=true;const {error}=await db.rpc('publish_question',{p_question_id:q.id});
   if(error){$('reviewDetailStatus').textContent='Error: '+error.message;b.disabled=false;return}
   reviewSelected=null;await refresh();$('reviewMessage').textContent='Pregunta publicada correctamente.';
 };
}

function bind(){if(user&&page==='access'&&$('reloadAccess'))$('reloadAccess').onclick=refresh;if(user&&page==='students')bindStudents();if(!user){$('authForm').onsubmit=async e=>{e.preventDefault();const f=e.target;const {error}=await db.auth.signInWithPassword({email:f.email.value,password:f.password.value});$('authStatus').textContent=error?error.message:'Sesión iniciada'};$('signup').onclick=async()=>{const f=$('authForm');const {error}=await db.auth.signUp({email:f.email.value,password:f.password.value});$('authStatus').textContent=error?error.message:'Cuenta solicitada. Revisa tu correo para confirmarla si está habilitada.'};return}if(page==='bank'){for(const id of ['subjectFilter','weekFilter','searchFilter'])$(id).addEventListener(id==='searchFilter'?'input':'change',bankList);bankList()}if(page==='practice')bindPractice();if(page==='bulk')bindBulk();if(page==='review')bindReview();if(page==='quiz'){if($('startQuiz'))$('startQuiz').onclick=()=>{const subject=$('quizSubject').value;const pool=questions.filter(q=>q.status==='published'&&(!subject||q.subject===subject));if(!pool.length)return alert('No hay preguntas publicadas.');const count=Math.min(pool.length,Math.max(1,Number($('quizCount').value)||10));quiz={items:pool.sort(()=>Math.random()-.5).slice(0,count),answers:Array(count).fill(null),i:0};render()};if($('nextQuiz'))$('nextQuiz').onclick=async()=>{const sel=document.querySelector('input[name=choice]:checked');quiz.answers[quiz.i]=sel?Number(sel.value):null;if(quiz.i<quiz.items.length-1){quiz.i++;render();return}$('nextQuiz').disabled=true;const {data,error}=await db.rpc('grade_attempt',{p_answers:quiz.items.map((q,i)=>({id:q.id,selected:quiz.answers[i]}))});if(error){$('quizError').textContent=error.message;$('nextQuiz').disabled=false;return}quiz.result=data;await refresh()};if($('restartQuiz'))$('restartQuiz').onclick=()=>{quiz=null;render()}}if(page==='manage'&&teacher())$('questionForm').onsubmit=async e=>{e.preventDefault();const f=e.target,values=Object.fromEntries(new FormData(f).entries());const {error}=await db.rpc('save_question',{p_cycle:values.cycle,p_week:Number(values.week),p_subject:values.subject,p_topic:values.topic,p_page:values.page?Number(values.page):null,p_number:values.number?Number(values.number):null,p_statement:values.statement,p_options:'ABCDE'.split('').map(x=>values['option'+x]),p_source:values.source||'',p_correct:Number(values.correct),p_explanation:values.explanation||'',p_publish:false});if(error){$('saveStatus').textContent='Error: '+error.message}else{f.reset();await refresh();const status=$('saveStatus');if(status)status.textContent='Pregunta guardada correctamente como borrador. Pendiente de revisión.'}}}
init();
