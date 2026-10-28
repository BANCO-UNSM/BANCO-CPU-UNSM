
function mostrarFormulas() {
  if (typeof renderMathInElement !== 'function') return;

  
const contenedor = document.getElementById('bankList')
  || document.getElementById('app');
  if (!contenedor) return;

  renderMathInElement(contenedor, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '\\(', right: '\\)', display: false },
      { left: '\\[', right: '\\]', display: true },
      { left: '$', right: '$', display: false }
    ],
    throwOnError: false
  });
}
'use strict';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ready=Boolean(window.supabase&&window.SUPABASE_URL&&window.SUPABASE_ANON_KEY);
// Identificador de instalación de este navegador. No constituye identificación física infalible.
const deviceKey='academia_unsm_device_v1';
let deviceId=localStorage.getItem(deviceKey);
if(!deviceId){deviceId=crypto.randomUUID();localStorage.setItem(deviceKey,deviceId)}
const db=ready?window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY):null;
async function subirImagenPregunta(archivo, carpeta) {
  if (!archivo || archivo.size === 0) return null;

  const tiposPermitidos = [
    'image/png',
    'image/jpeg',
    'image/webp'
  ];

  if (!tiposPermitidos.includes(archivo.type)) {
    throw new Error('Solo se permiten imágenes PNG, JPG o WEBP.');
  }

  if (archivo.size > 5 * 1024 * 1024) {
    throw new Error('La imagen no debe superar los 5 MB.');
  }

  if (!['enunciados', 'soluciones'].includes(carpeta)) {
    throw new Error('Carpeta de imágenes no permitida.');
  }

  const extension = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp'
  }[archivo.type];

  const nombre = `${carpeta}/${crypto.randomUUID()}.${extension}`;

  const { error } = await db.storage
    .from('soluciones-academia')
    .upload(nombre, archivo, {
      contentType: archivo.type,
      upsert: false
    });

  if (error) {
    throw new Error('No se pudo subir la imagen: ' + error.message);
  }

  return nombre;
}
// Las imágenes son privadas: se descargan con la sesión autenticada, sin enlaces públicos.
const imagenesTemporales=new Set();
function liberarImagenesPrivadas(raiz=document){
  raiz.querySelectorAll('img[data-private-object-url]').forEach(img=>{
    const url=img.dataset.privateObjectUrl;
    if(url){URL.revokeObjectURL(url);imagenesTemporales.delete(url);}
  });
}
function espacioImagenPrivada(ruta,descripcion){
  if(typeof ruta!=='string'||!ruta.trim())return '';
  if(!/^(enunciados|soluciones)\/[a-zA-Z0-9_-]+\.(png|jpg|webp)$/.test(ruta))return '';
  return `<div class="private-image-box" data-private-image="${esc(ruta)}"><p class="muted small">Cargando imagen...</p><img alt="${esc(descripcion)}" style="display:none;max-width:100%;height:auto;border-radius:8px;margin:10px 0"></div>`;
}
async function cargarImagenesPrivadas(raiz=document){
  if(!db)return;
  const nodos=[...raiz.querySelectorAll('[data-private-image]')];
  await Promise.all(nodos.map(async contenedor=>{
    if(contenedor.dataset.imageLoading==='yes')return;
    contenedor.dataset.imageLoading='yes';
    const ruta=contenedor.dataset.privateImage;
    const img=contenedor.querySelector('img');
    const mensaje=contenedor.querySelector('p');
    if(!img)return;
    let url=null;
    const temporizador=setTimeout(()=>{
      if(contenedor.isConnected&&mensaje&&mensaje.isConnected){
        mensaje.textContent='La imagen está tardando demasiado. Recarga la página para reintentar.';
      }
    },12000);
    try{
      const {data,error}=await db.storage.from('soluciones-academia').download(ruta);
      if(error)throw error;
      if(!data||!data.size)throw new Error('El archivo recibido está vacío.');
      if(!contenedor.isConnected)return;
      url=URL.createObjectURL(data);
      imagenesTemporales.add(url);
      img.dataset.privateObjectUrl=url;
      img.onload=()=>{
        clearTimeout(temporizador);
        if(mensaje)mensaje.remove();
      };
      img.onerror=()=>{
        clearTimeout(temporizador);
        img.style.display='none';
        if(mensaje)mensaje.textContent='No se pudo mostrar el archivo de imagen.';
      };
      img.src=url;
      img.style.display='block';
      if(img.complete&&img.naturalWidth>0){
        clearTimeout(temporizador);
        if(mensaje)mensaje.remove();
      }
    }catch(err){
      clearTimeout(temporizador);
      console.error('Error al cargar imagen privada:',ruta,err);
      if(contenedor.isConnected&&mensaje){
        mensaje.textContent='Imagen no disponible: '+(err?.message||'Comprueba el acceso al archivo');
      }
    }
  }));
}

let access=null,students=[],user=null,profile=null,questions=[],attempts=[],page='home',quiz=null,practice=null,bulkRows=[],bulkBusy=false,reviewRows=[],reviewSelected=null,reviewFilter={subject:'',week:'',status:''};
let activityRows=[],activityLoaded=false,activityError='';
let exams=[],examsError='',questionsError='',examTypeFilter='',examCycleFilter='',examActiveId='',examSession=null,examPreview=null;
let examPreviewRequest=0;
let relationItems=[],relationBusy=false,relationLoaded=false,relationError='',relationSelected=null,relationAnswers=[],relationGrade=null,relationReview=null;
let authMode='login';
let selectedModality='CPU-UNSM';
const modalityQuestions=()=>questions.filter(q=>q.modality===selectedModality);

const teacher=()=>['teacher','admin'].includes(profile?.role);
// Coincidencias exactas normalizadas en todas las modalidades, sin exponer claves.
const normalizarEnunciado=s=>String(s??'').trim().replace(/\s+/g,' ').toLowerCase();
const errorDuplicado=e=>e?.code==='23505'||/questions_unique_statement_normalized|duplicate key value|llave duplicada/i.test(e?.message||'');
async function buscarPreguntaDuplicada(enunciado){
  const texto=String(enunciado??'').trim();
  if(!texto)return null;
  const {data,error}=await db.rpc('find_duplicate_question',{p_statement:texto});
  if(error)throw new Error('No se pudo comprobar si la pregunta existe: '+error.message);
  return Array.isArray(data)?(data[0]||null):data;
}
function mensajeDuplicado(q){
  return `Esta pregunta ya existe en CachimboLab. Modalidad: ${q.modality}; materia: ${q.subject}; estado: ${q.status}. Enunciado existente: ${q.statement}`;
}
const notice=(s,bad=false)=>`<div class="card"><p ${bad?'style="color:#b45309"':''}>${esc(s)}</p></div>`;
async function init(){if(!ready){$('app').innerHTML=notice('Falta configurar config.js con la URL y la clave pública de Supabase.');$('nav').innerHTML='';return} const {data:{session}}=await db.auth.getSession();user=session?.user||null;await refresh();db.auth.onAuthStateChange(()=>setTimeout(async()=>{const {data:{session}}=await db.auth.getSession();user=session?.user||null;await refresh()},0));}
async function refresh(){
 relationLoaded=false;relationItems=[];relationReview=null;
 profile=null;access=null;questions=[];attempts=[];exams=[];examsError='';questionsError='';
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
   const q=await db.from('questions')
.select('id,exam_id,modality,cycle,week,subject,topic,page,original_number,statement,options,source,status,statement_image_path,solution_image_path').order('created_at',{ascending:false});
   if(q.error){
     console.error('Consulta de preguntas:',q.error.message);questionsError=q.error.message;
     // Compatibilidad con bases anteriores a la incorporación de modalidad.
     if(/modality|column|schema cache/i.test(q.error.message)){
       const old=await db.from('questions').select('id,cycle,week,subject,topic,page,original_number,statement,options,source,status,statement_image_path,solution_image_path').order('created_at',{ascending:false});
       if(old.error)console.error(old.error.message);else {questions=(old.data||[]).map(x=>({...x,modality:'CPU-UNSM'}));questionsError='La consulta alternativa no incluye exam_id; actualiza el esquema o los permisos.';}
     }
   }else questions=(q.data||[]).map(x=>({...x,modality:x.modality||'CPU-UNSM'}));
   const ex=await db.from('exams').select('id,code,title,exam_type,exam_year,cycle,exam_number,exam_date,status').order('exam_year',{ascending:false}).order('exam_number',{ascending:true});
   if(ex.error){examsError=ex.error.message;console.error('Exámenes:',examsError)}else exams=ex.data||[];
    // Solo en el panel docente: recuperar grupos visibles de preguntas si el catálogo está oculto por RLS.
    // No se inventa un estado de publicación ni se habilita su resolución.
    if(teacher()){
      const known={'2ace1472-a5d9-4e4f-a69b-9b38770c72c9':{title:'2.º Examen CPU 2026-II',code:'CPU-UNSM-2026-II-E02',exam_type:'CPU',exam_year:2026,cycle:'2026-II',exam_number:2,exam_date:'2026-10-24'}};
      for(const id of [...new Set(questions.filter(x=>x.exam_id).map(x=>x.exam_id))]){
        if(exams.some(e=>e.id===id))continue;
        const first=questions.find(x=>x.exam_id===id);
        const meta=known[id]||{};
        exams.push({id,code:meta.code||'',title:meta.title||('Examen · '+id.slice(0,8)),exam_type:meta.exam_type||'CPU',exam_year:meta.exam_year||Number(String(first?.cycle||'').slice(0,4))||null,cycle:meta.cycle||first?.cycle||'',exam_number:meta.exam_number||null,exam_date:meta.exam_date||null,status:'unknown',_localFallback:true});
      }
    }
   const r=await db.from('attempts').select('id,submitted_at,total,correct').order('submitted_at',{ascending:false}).limit(30);attempts=r.data||[];
  }
 }
 if(user&&(teacher()||access?.allowed))restoreTimedExam();
 render();
 if(quiz?.deadlineAt&&!quiz.result&&quizRemaining()===0)submitQuizTimed();
}
function render(){
 const allowed=teacher()||access?.allowed;
 const pages=user?(allowed?[['home','Inicio'],['bank','Banco académico'],['exams','Exámenes de admisión'],['quiz','Simulacros'],['practice','Práctica inmediata'],['results','Mis resultados'],...(teacher()?[['manage','Registrar pregunta'],['bulk','Carga masiva'],['review','Revisión y publicación']]:[]),...(admin()?[['students','Control de alumnos'],['activity','Seguimiento de estudiantes']]:[])]:[['access','Mi acceso']]):[];
 if(!pages.some(([id])=>id===page))page=allowed?'home':'access';
 $('nav').innerHTML=pages.map(([id,name])=>`<button data-page="${id}" class="${page===id?'active':''}">${name}</button>`).join('');
 document.querySelectorAll('[data-page]').forEach(x=>x.onclick=()=>{if(quiz?.deadlineAt&&!quiz.result){alert('Hay un examen cronometrado en curso. Entrégalo antes de salir.');return;}page=x.dataset.page;quiz=null;practice=null;examSession=null;render()});
 $('heading').textContent=({home:'Panel principal',bank:'Banco de preguntas',exams:'Exámenes de admisión',quiz:'Simulacros',practice:'Práctica inmediata',results:'Resultados',manage:'Panel docente',bulk:'Carga masiva de preguntas',review:'Revisión y publicación',access:'Estado de acceso',students:'Administración de alumnos',activity:'Seguimiento de estudiantes'})[page];
 $('account').innerHTML=user?`<span class="muted small">${esc(user.email)} · ${admin()?'Administrador':teacher()?'Docente':'Estudiante'}</span> <button class="secondary" id="logout">Salir</button>`:'';
 if(user)$('logout').onclick=()=>db.auth.signOut();
  liberarImagenesPrivadas($('app'));
 $('app').innerHTML=!user?login():!allowed?accessPage():({home,bank,exams:examsPage,quiz:quizPage,practice:practicePage,results,manage,bulk:bulkPage,review:reviewPage,students:studentsPage,activity:activityPage})[page]();
 bind();
 mostrarFormulas();
 // Carga imágenes privadas visibles después de dibujar cada pantalla.
 cargarImagenesPrivadas($('app'));
}
function accessPage(){
 const status=access?.status==='pending'?'Pendiente de autorización':access?.status==='suspended'?'Cuenta suspendida':access?.status==='device_blocked'?'Dispositivo no autorizado':access?.status==='setup_error'?'Actualización pendiente en Supabase':'Suscripción vencida';
 return `<div class="card"><h2>${esc(status)}</h2><p>El administrador debe confirmar tu pago y habilitar tu acceso. No se realizan cobros en esta página.</p><p class="muted">${esc(access?.message||'Si ya pagaste, contacta al administrador. Si cambiaste de equipo, solicita liberar el dispositivo anterior.')}</p>${access?.expires_at?`<p>Vencimiento: ${esc(new Date(access.expires_at).toLocaleString('es-PE'))}</p>`:''}<button id="reloadAccess">Actualizar mi estado</button></div>`;
}
function activityPage(){
 if(!admin())return notice('Acceso exclusivo para administradores',true);
 const n=activityRows.length,active=activityRows.filter(x=>Number(x.practice_count)+Number(x.attempt_count)>0).length;
 const date=v=>v?new Date(v).toLocaleString('es-PE',{timeZone:'America/Lima',dateStyle:'short',timeStyle:'short'}):'Sin registro';
 return `<div class="card"><h2>Seguimiento de estudiantes</h2><p class="muted">Consulta de actividad registrada. Un inicio de sesión no significa necesariamente que el alumno haya practicado. Los datos se actualizan al pulsar el botón.</p><button id="loadActivity">${activityLoaded?'Actualizar actividad':'Consultar actividad'}</button><p id="activityStatus" class="muted" role="status">${esc(activityError)}</p>${activityLoaded?`<div class="grid"><div class="card"><div class="muted">Estudiantes</div><div class="stat">${n}</div></div><div class="card"><div class="muted">Con actividad</div><div class="stat">${active}</div></div><div class="card"><div class="muted">Sin actividad registrada</div><div class="stat">${n-active}</div></div></div><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;text-align:left"><thead><tr><th>Estudiante</th><th>Último ingreso</th><th>Respuestas de práctica</th><th>Simulacros</th><th>Aciertos en simulacros</th><th>Último simulacro</th></tr></thead><tbody>${activityRows.map(x=>`<tr><td>${esc(x.student_name||'Sin nombre')}</td><td>${esc(date(x.last_sign_in_at))}</td><td>${Number(x.practice_count)||0}</td><td>${Number(x.attempt_count)||0}</td><td>${Number(x.quiz_correct)||0} / ${Number(x.quiz_questions)||0}</td><td>${esc(date(x.last_attempt))}</td></tr>`).join('')}</tbody></table></div>${!n?'<p>No hay estudiantes registrados.</p>':''}`:''}</div>`;
}
async function loadActivity(){
 const button=$('loadActivity');if(button)button.disabled=true;
 const {data,error}=await db.rpc('admin_student_activity');
 if(error){activityError='No se pudo consultar: '+error.message;const st=$('activityStatus');if(st)st.textContent=activityError;if(button)button.disabled=false;return;}
 activityRows=Array.isArray(data)?data:[];activityLoaded=true;activityError='';render();
}
function studentsPage(){
 if(!admin())return notice('Solo el administrador puede gestionar alumnos',true);
 return `<div class="card"><h2>Control de alumnos</h2><p class="muted">Los pagos se reciben fuera de la web. Solo tú autorizas, renuevas, suspendes y liberas navegadores.</p><button id="loadStudents">Actualizar lista</button><p id="studentsStatus" class="muted"></p><div id="studentsList">${students.map(x=>`<div class="listitem"><strong>${esc(x.student_name||'Estudiante sin nombre')}</strong><p class="small">Correo: ${esc(x.student_email||'No disponible')}</p><p class="small">ID: ${esc(x.student_id)} · ${esc(x.access_status)} · ${x.expires_at?esc(new Date(x.expires_at).toLocaleString('es-PE')):'Sin vencimiento'} · Navegador: ${x.device_registered?'vinculado':'sin vincular'}</p><p class="small muted">Pago: ${esc(x.payment_method||'sin registrar')} · S/ ${esc(x.payment_amount??'—')}</p><div class="actions"><button data-student-action="approve" data-student-id="${esc(x.student_id)}">Autorizar / renovar</button><button class="secondary" data-student-action="payment" data-student-id="${esc(x.student_id)}">Registrar pago</button><button class="secondary" data-student-action="release_device" data-student-id="${esc(x.student_id)}">Liberar navegador</button><button class="secondary" data-student-action="suspend" data-student-id="${esc(x.student_id)}">Suspender</button></div></div>`).join('')||'<p>Presiona «Actualizar lista» para cargar los alumnos.</p>'}</div></div>`;
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
function login(){
 const signup=authMode==='signup';
 return `<div class="card"><h2>${signup?'Crear cuenta de estudiante':'Ingresar a CachimboLab'}</h2><p class="muted">${signup?'Completa tus datos para solicitar una cuenta. El administrador debe autorizar tu acceso antes de utilizar el banco académico.':'Ingresa con tu correo y contraseña. Si eres nuevo, selecciona «Crear cuenta».'}</p><form id="authForm">${signup?'<div class="field"><label for="authName">Nombre completo y apellidos</label><input id="authName" name="fullName" type="text" autocomplete="name" minlength="3" maxlength="120" required placeholder="Ej.: María Pérez López"></div>':''}<div class="field"><label for="authEmail">Correo electrónico</label><input id="authEmail" type="email" name="email" autocomplete="email" required></div><div class="field"><label for="authPassword">Contraseña (mínimo 6 caracteres)</label><input id="authPassword" type="password" name="password" autocomplete="${signup?'new-password':'current-password'}" minlength="6" required></div>${signup?'<div class="field"><label for="authConfirm">Confirmar contraseña</label><input id="authConfirm" type="password" name="confirmPassword" autocomplete="new-password" minlength="6" required></div>':''}<div class="actions"><button id="authSubmit" type="submit">${signup?'Registrar mi cuenta':'Ingresar'}</button><button type="button" id="authSwitch" class="secondary">${signup?'Ya tengo cuenta':'Crear cuenta'}</button></div></form><p id="authStatus" class="muted" role="status" aria-live="polite"></p></div>`;
}
function home(){
  const cpu = questions.filter(q => q.modality === 'CPU-UNSM');
  const beca = questions.filter(q => q.modality === 'BECA18');

  return `
    <div class="card">
      <h2>🎯 Elige tu modalidad de preparación</h2>
      <p>Selecciona el programa para el que deseas prepararte.</p>

      <div class="grid">
        <div class="card">
          <h2>🎓 CPU-UNSM</h2>
          <p>Banco de preguntas, prácticas y simulacros.</p>
          <p class="muted">${cpu.length} preguntas registradas</p>
          <button type="button" id="selectCPU">
            Prepararme para CPU-UNSM
          </button>
        </div>

        <div class="card">
          <h2>🏆 Beca 18</h2>
          <p>Preparación académica con preguntas independientes.</p>
          <p class="muted">${beca.length} preguntas registradas</p>
          <button type="button" id="selectBeca">
            Prepararme para Beca 18
          </button>
          <p><a href="beca18-clases.html" class="button" style="display:inline-block;text-decoration:none;background:#0d759b">📚 Estudiar Números y Letras</a></p>
        </div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="muted">Preguntas visibles</div>
        <div class="stat">${questions.length}</div>
      </div>

      <div class="card">
        <div class="muted">Materias</div>
        <div class="stat">${new Set(questions.map(q=>q.subject)).size}</div>
      </div>

      <div class="card">
        <div class="muted">Simulacros completados</div>
        <div class="stat">${attempts.length}</div>
      </div>
    </div>

    <div class="card">
      <h2>${teacher()?'Gestión académica':'Preparación preuniversitaria'}</h2>
      <p>
        Consulta preguntas organizadas por semana y materia.
        ${teacher()
          ? 'Registra nuevas preguntas y decide cuándo publicarlas.'
          : 'Practica y revisa tu rendimiento con calificación segura.'}
      </p>
      <p class="muted">
        La carga de separatas y verificación de claves se realizará progresivamente.
      </p>
    </div>
  `;
}


// Ejercicios de relación: las claves solo se consultan después de calificar mediante RPC.
function relationRows(q,withAnswers=false){
 const left=Array.isArray(q.columna_izquierda)?q.columna_izquierda:[];
 const right=Array.isArray(q.columna_derecha)?q.columna_derecha:[];
 return `<div class="relation-head"><strong>COLUMNA A</strong><strong>COLUMNA B</strong></div><div class="relation-rows">${right.map((r,i)=>`<div class="relation-row"><span>${i+1}. ${esc(left[i]||'')}</span><label class="relation-answer">(<input data-rel-answer="${i}" type="number" min="1" max="${left.length}" step="1" inputmode="numeric" aria-label="Número correspondiente a ${esc(r)}" value="${esc(relationAnswers[i]??'')}" ${withAnswers?'':'disabled'} ${relationGrade?'disabled':''}>) <span>${esc(r)}</span></label>${relationGrade?`<span class="relation-result ${relationGrade.detalle?.[i]?.correcto?'ok':'bad'}">${relationGrade.detalle?.[i]?.correcto?'✓':`✕ ${Number(relationGrade.detalle?.[i]?.respuesta_correcta)||'—'}`}</span>`:''}</div>`).join('')}</div>`;
}
function relationBankPanel(){
 if(selectedModality!=='CPU-UNSM')return '';
 if(!relationLoaded&&!relationBusy)queueMicrotask(loadRelations);
 const filtered=relationItems.filter(q=>q.estado==='publicado'&&(!$('subjectFilter')?.value||$('subjectFilter').value==='Razonamiento Verbal')&&(!$('weekFilter')?.value||String(q.semana)===$('weekFilter').value));
 const q=filtered.find(q=>q.id===relationSelected);
 return `<div class="card" style="margin-top:14px"><h2>Ejercicios de relacionar · Razonamiento Verbal</h2>${relationError?`<p style="color:#b91c1c">${esc(relationError)}</p>`:''}${filtered.map(q=>`<button type="button" class="secondary" data-rel-id="${esc(q.id)}">Semana ${Number(q.semana)||6} · Pregunta ${Number(q.numero_original)||'—'} · ${esc(q.titulo)}</button>`).join('')||'<p class="muted">No hay ejercicios de relación publicados con estos filtros.</p>'}${q?`<div class="card"><h3>Pregunta ${Number(q.numero_original)} · ${esc(q.titulo)}</h3><p>${esc(q.enunciado)}</p>${relationRows(q,true)}${relationGrade?`<p class="relation-score">Resultado: ${Number(relationGrade.aciertos)||0} de ${Number(q.total_relaciones)} relaciones correctas.</p><button id="relationAgain" class="secondary">Volver a intentar</button>`:'<button id="relationCheck">Calificar relaciones</button>'}<p id="relationStatus" role="status"></p></div>`:''}</div>`;
}
async function loadRelations(){
 if(relationBusy)return;relationBusy=true;relationError='';
 const {data,error}=await db.rpc('cachimbolab_listar_relaciones',{p_device_token:deviceId});
 relationBusy=false;relationLoaded=true;
 if(error){relationError='No se pudieron cargar los ejercicios: '+error.message;relationItems=[];}
 else relationItems=Array.isArray(data)?data:[];
 if(page==='review'||page==='bank')render();
}
function bindRelations(){
 
 document.querySelectorAll('[data-rel-id]').forEach(b=>b.onclick=()=>{
  relationSelected=b.dataset.relId;relationAnswers=[];relationGrade=null;render();
 });
 document.querySelectorAll('[data-rel-answer]').forEach(el=>el.oninput=()=>{relationAnswers[Number(el.dataset.relAnswer)]=el.value});
 $('relationAgain')?.addEventListener('click',()=>{relationAnswers=[];relationGrade=null;render()});
 $('relationCheck')?.addEventListener('click',async()=>{
  const q=relationItems.find(x=>x.id===relationSelected);if(!q)return;
  const arr=Array.from({length:q.total_relaciones},(_,i)=>{const v=relationAnswers[i];return v===''||v==null?null:Number(v)});
  if(arr.some(v=>v!==null&&(!Number.isInteger(v)||v<1||v>q.total_relaciones))){$('relationStatus').textContent='Ingresa números enteros válidos dentro del rango.';return}
  const button=$('relationCheck');button.disabled=true;
  const {data,error}=await db.rpc('cachimbolab_calificar_relaciones',{p_id:q.id,p_respuestas:arr,p_device_token:deviceId});
  if(error){button.disabled=false;$('relationStatus').textContent='No se pudo calificar: '+error.message;return}
  relationGrade=data;render();
 });
}

// Vista previa exclusiva para administradores: no habilita el examen al estudiante.
// Convierte fracciones sencillas del texto a LaTeX SOLO en la vista previa.
function textoMatematicoVista(texto){
  const raw=String(texto??'');
  const safe=esc(raw);
  return safe.replace(/\b(\d+)\s*\/\s*(\d+)\b/g,(_match,a,b)=>`\\(${`\\frac{${a}}{${b}}`}\\)`);
}
function preguntasPublicadasVista(examId){
  return questions.filter(q=>q.exam_id===examId&&q.status==='published').sort(ordenarPreguntasPorNumero);
}
// Compacta saltos de línea redundantes alrededor de fórmulas en la vista previa.
// No modifica el contenido guardado en Supabase.
function explicacionCompactaVista(texto){
  return String(texto??'').trim()
    .replace(/\r\n?/g,'\n')
    // Normalizar delimitadores de fórmulas en bloque, incluso si están en líneas separadas.
    .replace(/\\\[\s*([\s\S]*?)\s*\\\]/g,(_m,formula)=>`$$${formula.trim()}$$`)
    .replace(/\n[ \t]*\n[ \t]*\n+/g,'\n\n');
}
// Interpreta **negritas** solo fuera de las fórmulas matemáticas.
// Los contenidos se escapan antes de producir HTML: no se ejecuta código del usuario.
function explicacionHtmlVista(texto){
  const normal=explicacionCompactaVista(texto);
  const partes=normal.split(/(\$\$[\s\S]*?\$\$|\\\([\s\S]*?\\\)|\$[^\n$]+\$)/g);
  return partes.map(parte=>{
    if(/^\$\$|^\\\(|^\$/.test(parte))return esc(parte);
    return esc(parte).replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');
  }).join('');
}
const estiloCompactoVista=`<style>
#examPreviewPanel .exam-preview-explanation{white-space:pre-line;line-height:1.35;margin:8px 0;overflow-wrap:anywhere}
#examPreviewPanel .exam-preview-explanation .katex-display{margin:.15em 0;overflow-x:auto;overflow-y:hidden;text-align:left}
#examPreviewPanel .exam-preview-explanation .katex-display>.katex{text-align:left}
#examPreviewPanel details>.card{padding:14px 18px}
#examPreviewPanel details h3{margin:8px 0}
</style>`;
function vistaPreviaExamen(){
  if(!admin()||!examPreview)return '';
  const e=examById(examPreview.examId);
  if(!e)return '';
  const publicadas=preguntasPublicadasVista(examPreview.examId);
  const posicion=publicadas.findIndex(x=>x.id===examPreview.questionId);
  const q=examPreview.data;
  const navegacion=`<div class="field"><label for="examPreviewSelect">Seleccionar pregunta publicada (${publicadas.length})</label><select id="examPreviewSelect">${publicadas.map((x,i)=>`<option value="${esc(x.id)}" ${x.id===examPreview.questionId?'selected':''}>Pregunta N.º ${esc(x.original_number??i+1)} · ${esc(x.subject)}</option>`).join('')}</select></div><div class="actions"><button type="button" class="secondary" id="examPreviewPrev" ${posicion<=0?'disabled':''}>← Anterior</button><button type="button" class="secondary" id="examPreviewNext" ${posicion<0||posicion>=publicadas.length-1?'disabled':''}>Siguiente →</button></div>`;
  const encabezado=`<h2>Vista previa de administrador · ${esc(e.title)}</h2><p class="muted">Solo para administradores. Puedes revisar las ${publicadas.length} preguntas publicadas sin habilitar el examen para estudiantes.</p>${navegacion}`;
  const cerrar=`<div class="actions" style="margin-top:15px"><button type="button" class="secondary" id="examPreviewClose">Cerrar vista previa</button></div>`;
  if(examPreview.error)return `<div class="card" id="examPreviewPanel">${encabezado}<p role="alert">${esc(examPreview.error)}</p>${cerrar}</div>`;
  if(!q||q.id!==examPreview.questionId)return `<div class="card" id="examPreviewPanel">${encabezado}<p role="status">Cargando pregunta publicada...</p>${cerrar}</div>`;
  const opts=Array.isArray(q.options)?q.options:[];
  const idx=q.correct_index==null?null:Number(q.correct_index);
  const valid=idx!==null&&Number.isInteger(idx)&&idx>=0&&idx<opts.length;
  return `<div class="card" id="examPreviewPanel">${estiloCompactoVista}${encabezado}<h3>Pregunta N.º ${esc(q.original_number??'—')} · ${esc(q.subject)}</h3><p style="white-space:pre-wrap;line-height:1.8">${textoMatematicoVista(q.statement)}</p>${espacioImagenPrivada(q.statement_image_path,'Figura original')}${opts.map((o,i)=>`<div class="option">${'ABCDE'[i]}) ${textoMatematicoVista(o)}</div>`).join('')}<details style="margin-top:18px"><summary style="cursor:pointer;font-weight:700">Ver respuesta y desarrollo (solo administrador)</summary><div class="card"><p><strong>${valid?'Respuesta correcta: '+ 'ABCDE'[idx]+') '+textoMatematicoVista(opts[idx]):'Clave pendiente'}</strong></p><h3>Desarrollo paso a paso</h3><div class="exam-preview-explanation">${explicacionHtmlVista(q.explanation||'Sin explicación registrada.')}</div>${espacioImagenPrivada(q.solution_image_path,'Imagen de la solución')}</div></details>${cerrar}</div>`;
}
async function cargarPreguntaVistaPrevia(examId,questionId){
  if(!admin())return;
  const publicada=preguntasPublicadasVista(examId).find(q=>q.id===questionId);
  if(!publicada)return;
  const solicitud=++examPreviewRequest;
  examPreview={examId,questionId,data:null,error:''};
  if(page==='exams')render();
  try{
    const {data,error}=await db.rpc('get_question_for_review',{p_question_id:questionId});
    if(error)throw error;
    if(!data)throw Error('No se recibió información de la pregunta.');
    if(solicitud!==examPreviewRequest||!examPreview||examPreview.examId!==examId)return;
    examPreview={examId,questionId,data:{...publicada,...data,id:questionId},error:''};
  }catch(err){
    if(solicitud!==examPreviewRequest||!examPreview)return;
    examPreview={examId,questionId,data:null,error:'No se pudo cargar la vista previa: '+(err?.message||'Error desconocido')};
  }
  if(page==='exams'){
    render();
    $('examPreviewPanel')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
}
// Módulo de exámenes: independiente de las separatas, sin mostrar claves antes de calificar.
function examsPage(){
 if(examsError&&!teacher())return notice('No se pudo consultar el catálogo de exámenes. Contacta al administrador.',true);
 const available=exams.filter(e=>teacher()||e.status==='published');
 // Categorías fijas: visibles aunque aún no existan exámenes cargados.
 // Se admiten códigos históricos para ordinarios y quinto de secundaria.
 const examCategory=t=>{
  const v=String(t||'').trim().toUpperCase().replace(/[ÁÀ]/g,'A').replace(/[ÉÈ]/g,'E').replace(/[ÍÌ]/g,'I').replace(/[ÓÒ]/g,'O').replace(/[ÚÙ]/g,'U').replace(/[\s-]+/g,'_');
  if(['CPU','CPU_UNSM','PREUNIVERSITARIO'].includes(v))return 'CPU';
  if(['EXTRAORDINARIO','EXTRAORDINARIA','EXTRAORDINARIOS','ADMISION_EXTRAORDINARIA'].includes(v))return 'EXTRAORDINARIO';
  if(['ADMISION','ORDINARIO','ORDINARIA','ORDINARIOS','ADMISION_ORDINARIA'].includes(v))return 'ORDINARIO';
  if(['QUINTO_SECUNDARIA','QUINTO','5TO','5TO_SECUNDARIA','5_SECUNDARIA','QUINTO_ANO','QUINTO_ANIO'].includes(v))return 'QUINTO_SECUNDARIA';
  return v;
 };
 const fixedTypes=['QUINTO_SECUNDARIA','EXTRAORDINARIO','ORDINARIO','CPU'];
 const types=[...fixedTypes,...new Set(available.map(e=>examCategory(e.exam_type)).filter(t=>t&&!fixedTypes.includes(t)))];
 const filteredType=available.filter(e=>!examTypeFilter||examCategory(e.exam_type)===examTypeFilter);
 const cycles=[...new Set(filteredType.map(e=>e.cycle||String(e.exam_year)))].sort().reverse();
 const visible=filteredType.filter(e=>!examCycleFilter||(e.cycle||String(e.exam_year))===examCycleFilter);
 const labels={CPU:'Exámenes CPU-UNSM',EXTRAORDINARIO:'Exámenes extraordinarios',ORDINARIO:'Exámenes ordinarios',QUINTO_SECUNDARIA:'Exámenes de 5.º de secundaria'};
 const filters=`<div class="filters"><select id="examType"><option value="">Todos los tipos</option>${types.map(t=>`<option value="${esc(t)}" ${examTypeFilter===t?'selected':''}>${esc(labels[t]||t)}</option>`).join('')}</select><select id="examCycle"><option value="">Todos los ciclos y años</option>${cycles.map(c=>`<option value="${esc(c)}" ${examCycleFilter===c?'selected':''}>${esc(c)}</option>`).join('')}</select></div>`;
 if(examSession){
  const e=examById(examSession.examId),q=examSession.items[examSession.i];
  if(!e||!q){examSession=null;return notice('El examen ya no está disponible.');}
  if(examSession.result){
   const details=Array.isArray(examSession.result.details)?examSession.result.details:[];
   const correct=Number(examSession.result.correct)||0,total=Number(examSession.result.total)||examSession.items.length;
   return `<div class="card"><h2>${esc(e.title)} · Resultado</h2><div class="stat">${correct}/${total}</div><p>Tiempo empleado: ${timeFmt(Date.now()-examSession.startedAt)}</p><button id="examFinish">Volver a exámenes</button></div><div class="card"><h3>Revisión de respuestas</h3>${examSession.items.map((item,i)=>{const d=details.find(x=>String(x.id)===String(item.id));const k=Number(d?.correct_index),valid=Boolean(d)&&Number.isInteger(k)&&k>=0&&k<item.options.length;return `<div class="listitem"><strong>N.º ${esc(item.original_number??i+1)} · ${esc(item.subject)}</strong><p>${esc(item.statement)}</p>${espacioImagenPrivada(item.statement_image_path,'Figura del examen')}<p>Tu respuesta: ${examSession.answers[i]==null?'En blanco':esc('ABCDE'[examSession.answers[i]])} · Correcta: ${valid?'ABCDE'[k]:'Clave pendiente'}</p>${valid?`<p>${esc(d.explanation||'Desarrollo aún no disponible.')}</p>${espacioImagenPrivada(item.solution_image_path,'Solución')}`:''}</div>`}).join('')}</div>`;
  }
  return `<div class="card"><h2>${esc(e.title)}</h2><p class="muted">Pregunta ${examSession.i+1} de ${examSession.items.length} · N.º ${esc(q.original_number??'—')} · ${esc(q.subject)}</p><h3>${esc(q.statement)}</h3>${espacioImagenPrivada(q.statement_image_path,'Figura del examen')}${(Array.isArray(q.options)?q.options:[]).map((o,i)=>`<label class="option"><input type="radio" name="examChoice" value="${i}" ${examSession.answers[examSession.i]===i?'checked':''}>${'ABCDE'[i]}) ${esc(o)}</label>`).join('')}<div class="actions"><button id="examPrev" class="secondary" ${examSession.i===0?'disabled':''}>Anterior</button><button id="examNext">${examSession.i===examSession.items.length-1?'Entregar examen':'Siguiente'}</button><button id="examCancel" class="secondary">Salir</button></div><p id="examStatus" class="muted" role="status"></p></div>`;
 }
 return `<div class="card"><h2>Exámenes de admisión</h2><p class="muted">Resuelve exámenes completos de CPU-UNSM, admisión ordinaria y 5.º de secundaria. Las separatas están en Banco académico.</p>${filters}${visible.map(e=>{const qs=questions.filter(q=>q.exam_id===e.id&&(teacher()||q.status==='published'));const published=qs.filter(q=>q.status==='published').length;const ready=!e._localFallback&&e.status==='published'&&qs.length>0&&qs.every(q=>q.status==='published');return `<div class="listitem"><strong>${esc(e.title)}</strong><p class="muted small">${esc(labels[examCategory(e.exam_type)]||e.exam_type)} · ${esc(e.cycle||e.exam_year)} · ${esc(e.exam_date||'Fecha por confirmar')} · ${qs.length} preguntas ${teacher()?'registradas':'publicadas'}</p>${teacher()?`<p class="muted small">${published} publicadas · ${qs.filter(q=>q.status==='draft').length} borradores · ${qs.filter(q=>q.status==='review').length} en revisión</p><span class="tag">${esc(e._localFallback?'Estado no verificable (RLS)':e.status)}</span> <button type="button" class="secondary" data-review-exam="${esc(e.id)}">Revisar sus preguntas</button> ${admin()&&published?`<button type="button" class="secondary" data-preview-exam="${esc(e.id)}">Vista previa (${published})</button>`:''} `:''}<button data-start-exam="${esc(e.id)}" ${ready?'':'disabled'}>${ready?'Resolver examen':'No disponible todavía'}</button></div>`}).join('')||'<p>Todavía no hay exámenes registrados o disponibles en esta categoría.</p>'}</div>${vistaPreviaExamen()}`;
}
function bindExams(){
  $('examPreviewClose')?.addEventListener('click',()=>{examPreviewRequest++;examPreview=null;render()});
  document.querySelectorAll('[data-preview-exam]').forEach(b=>b.onclick=()=>{
    if(!admin())return;
    const id=b.dataset.previewExam;
    const first=preguntasPublicadasVista(id)[0];
    if(first)cargarPreguntaVistaPrevia(id,first.id);
  });
  $('examPreviewSelect')?.addEventListener('change',e=>{
    if(examPreview)cargarPreguntaVistaPrevia(examPreview.examId,e.target.value);
  });
  for(const [buttonId,offset] of [['examPreviewPrev',-1],['examPreviewNext',1]]){
    $(buttonId)?.addEventListener('click',()=>{
      if(!examPreview)return;
      const items=preguntasPublicadasVista(examPreview.examId);
      const i=items.findIndex(x=>x.id===examPreview.questionId);
      if(i>=0&&items[i+offset])cargarPreguntaVistaPrevia(examPreview.examId,items[i+offset].id);
    });
  }
  $('examReload')?.addEventListener('click',refresh);
  document.querySelectorAll('[data-review-exam]').forEach(b=>b.onclick=()=>{selectedModality='CPU-UNSM';reviewFilter={subject:'',week:'exam-'+b.dataset.reviewExam,status:''};reviewSelected=null;relationReview=null;page='review';render();});
 $('examType')?.addEventListener('change',e=>{examTypeFilter=e.target.value;examCycleFilter='';render()});
 $('examCycle')?.addEventListener('change',e=>{examCycleFilter=e.target.value;render()});
 document.querySelectorAll('[data-start-exam]').forEach(b=>b.onclick=()=>{const e=examById(b.dataset.startExam);const qs=questions.filter(q=>q.exam_id===e?.id&&q.status==='published').sort(ordenarPreguntasPorNumero);if(!e||e.status!=='published'||!qs.length)return;examSession={examId:e.id,items:qs,i:0,answers:Array(qs.length).fill(null),startedAt:Date.now(),result:null};render()});
 $('examFinish')?.addEventListener('click',()=>{examSession=null;render()});
 $('examCancel')?.addEventListener('click',()=>{if(confirm('¿Salir del examen? Se perderán las respuestas no entregadas.')){examSession=null;render()}});
 $('examPrev')?.addEventListener('click',()=>{const choice=document.querySelector('input[name="examChoice"]:checked');examSession.answers[examSession.i]=choice?Number(choice.value):null;examSession.i--;render()});
 $('examNext')?.addEventListener('click',async()=>{const choice=document.querySelector('input[name="examChoice"]:checked');examSession.answers[examSession.i]=choice?Number(choice.value):null;if(examSession.i<examSession.items.length-1){examSession.i++;render();return}if(!confirm('¿Entregar el examen y recibir la calificación?'))return;const btn=$('examNext');btn.disabled=true;$('examStatus').textContent='Calificando...';const {data,error}=await db.rpc('grade_attempt',{p_answers:examSession.items.map((q,i)=>({id:q.id,selected:examSession.answers[i]}))});if(error){$('examStatus').textContent='No se pudo calificar: '+error.message;btn.disabled=false;return}examSession.result=data;render()});
}
function bank(){return `<div class="card"><h2>Banco académico · ${selectedModality==='BECA18'?'Beca 18':'CPU-UNSM'}</h2><div class="filters"><select id="subjectFilter"><option value="">Todas las materias</option>${[...new Set(modalityQuestions().map(q=>q.subject))].sort().map(s=>`<option>${esc(s)}</option>`).join('')}</select><select id="weekFilter"><option value="">Todas las semanas</option>${[...new Set(modalityQuestions().filter(q=>!q.exam_id&&q.week!=null).map(q=>q.week))].sort((a,b)=>a-b).map(w=>`<option value="${w}">Semana ${w}</option>`).join('')}</select><input id="searchFilter" placeholder="Buscar enunciado o tema"></div><div id="bankList"></div></div>`}
function bankList(){
 const contenedor=$('bankList');
 liberarImagenesPrivadas(contenedor);
 const s=$('subjectFilter').value,w=$('weekFilter').value,t=$('searchFilter').value.toLowerCase();
 contenedor.innerHTML=questions.filter(q=>!q.exam_id&&q.modality===selectedModality&&(!s||q.subject===s)
&&(!w||String(q.week)===w)&&(`${q.statement} ${q.topic}`.toLowerCase().includes(t))).sort(ordenarPreguntasPorOrigenYNumero).map(q=>`<div class="listitem"><strong>${esc(q.subject)} · ${esc(etiquetaOrigen(q))} · N.º ${q.original_number??'—'}</strong> <span class="tag">${esc(q.status)}</span><p>${esc(q.statement)}</p>${espacioImagenPrivada(q.statement_image_path,'Imagen del enunciado')}${q.options.map((o,i)=>`<div class="small">${'ABCDE'[i]}) ${esc(o)}</div>`).join('')}<p class="muted small">${esc(q.source||'Fuente pendiente')} · ${esc(q.topic)}</p>${admin()?`<button type="button" class="secondary" data-bank-solution="${esc(q.id)}">Ver solución</button><div class="bank-solution" id="bank-solution-${esc(q.id)}" hidden></div>`:''}</div>`).join('')||'<p>No hay preguntas con estos filtros.</p>';
 contenedor.insertAdjacentHTML('beforeend',relationBankPanel());
 bindRelations();
 mostrarFormulas();
 cargarImagenesPrivadas(contenedor);
 if(admin())bindBankSolutions();
}

function bindBankSolutions(){
  document.querySelectorAll('[data-bank-solution]').forEach(button=>{
    button.onclick=async()=>{
      if(!admin())return;
      const id=button.dataset.bankSolution;
      const target=document.getElementById('bank-solution-'+id);
      if(!target)return;
      if(!target.hidden){liberarImagenesPrivadas(target);target.innerHTML='';target.hidden=true;button.textContent='Ver solución';return;}
      button.disabled=true;button.textContent='Consultando...';
      const {data,error}=await db.rpc('get_question_for_review',{p_question_id:id});
      button.disabled=false;
      if(error||!data){
        target.innerHTML=`<p class="muted">${esc('No se pudo consultar la solución: '+(error?.message||'Sin datos'))}</p>`;
        target.hidden=false;button.textContent='Reintentar';return;
      }
      const index=Number(data.correct_index);
      const valid=Number.isInteger(index)&&index>=0&&index<5;
      const answer=valid?`${'ABCDE'[index]}) ${esc(data.options?.[index]||'')}`:'Clave no disponible';
      const imagenSolucion=data.solution_image_path || questions.find(q=>q.id===id)?.solution_image_path;
      const explicacion=(data.explanation||'').trim();
      const contenidoExplicacion=explicacion?`<p style="white-space:pre-wrap;line-height:1.75;margin:14px 0">${esc(explicacion)}</p>`:(imagenSolucion?'':'<p class="muted">Todavía no se ha registrado el desarrollo de esta pregunta.</p>');
      target.innerHTML=`<div class="card" style="padding:22px;border-radius:14px"><div style="font-weight:700;font-size:1.08rem;margin-bottom:12px">Respuesta correcta: ${answer}</div><h3 style="margin:0 0 14px">Desarrollo paso a paso</h3>${contenidoExplicacion}${espacioImagenPrivada(imagenSolucion,'Imagen de la solución')}</div>`;
      target.hidden=false;button.textContent='Ocultar solución';
      // La solución se descarga únicamente al abrirla.
      cargarImagenesPrivadas(target);
      if(typeof renderMathInElement==='function')renderMathInElement(target,{delimiters:[{left:'$$',right:'$$',display:true},{left:'\\(',right:'\\)',display:false},{left:'\\[',right:'\\]',display:true},{left:'$',right:'$',display:false}],throwOnError:false});
    };
  });
}
// Beca 18: panel compartido; el texto se obtiene de un recurso estático, sin exponer claves.
let becaReadings={};
fetch('beca18_readings.json').then(r=>r.ok?r.json():{}).then(d=>{becaReadings=d;}).catch(()=>{});
function becaReadingNumber(q){
 if(q?.modality!=='BECA18'||!String(q.cycle||'').includes('2023'))return 0;
 const n=Number(q.original_number);
 return n>=31&&n<=33?1:n>=34&&n<=37?2:n>=38&&n<=40?3:n>=41&&n<=44?4:n>=45&&n<=49?5:n>=50&&n<=53?6:n>=54&&n<=57?7:n>=58&&n<=60?8:0;
}
function becaReadingPanel(q){
 const n=becaReadingNumber(q);if(!n)return '';
 if(n===1)return `<section class="reading-panel"><h3>📖 Texto 1 · Lectura e infografía original</h3><div class="reading-scroll"><img src="beca18_texto1.png" alt="Texto e infografía originales del examen Beca 18 de 2023" style="max-width:100%;height:auto"></div></section>`;
 return `<section class="reading-panel"><h3>📖 Texto ${n} · Lectura compartida</h3><div class="reading-scroll" style="white-space:pre-wrap">${esc(becaReadings[String(n)]||'Lectura en preparación. No publicar este bloque hasta verificar el texto original.')}</div></section>`;
}
function timeFmt(ms){const sec=Math.max(0,Math.floor(ms/1000));return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`}
function tickQuizTime(){if(!quiz||quiz.result)return;const now=Date.now();if(quiz.lastTick){quiz.elapsed[quiz.i]+=Math.max(0,now-quiz.lastTick)}quiz.lastTick=now;saveTimedExam();}
let quizTimerHandle=null;
const THIRD_EXAM_DURATION=150*60*1000;
let quizSubmitting=false;
function timedExamStorageKey(){return 'cachimbolab_timed_exam_2026_ii_'+(user?.id||'anonymous');}
function saveTimedExam(){
 if(!user||!quiz?.deadlineAt||quiz.result)return;
 try{
  localStorage.setItem(timedExamStorageKey(),JSON.stringify({
   questionIds:quiz.items.map(q=>q.id),answers:quiz.answers,
   elapsed:quiz.elapsed,i:quiz.i,deadlineAt:quiz.deadlineAt,
   lastTick:Date.now(),savedAt:Date.now()
  }));
 }catch(error){console.warn('No se pudo guardar el progreso del examen',error);}
}
function restoreTimedExam(){
 if(!user||quiz)return;
 let saved;
 try{saved=JSON.parse(localStorage.getItem(timedExamStorageKey())||'null')}catch{return}
 if(!saved||!Array.isArray(saved.questionIds)||saved.questionIds.length!==100||!Number.isFinite(saved.deadlineAt))return;
 const byId=new Map(questions.map(q=>[q.id,q]));
 const items=saved.questionIds.map(id=>byId.get(id));
 if(items.some(q=>!q||q.status!=='published'))return;
 quiz={items,answers:Array.from({length:100},(_,i)=>Number.isInteger(saved.answers?.[i])?saved.answers[i]:null),
 elapsed:Array.from({length:100},(_,i)=>Number(saved.elapsed?.[i])||0),
 i:Math.min(99,Math.max(0,Number(saved.i)||0)),
 deadlineAt:saved.deadlineAt,lastTick:Date.now(),result:null};
 page='quiz';selectedModality='CPU-UNSM';
}
function clearTimedExam(){try{localStorage.removeItem(timedExamStorageKey())}catch{}}

// Orden, materias y cupos oficiales del III examen: nunca mezclar las posiciones.
const THIRD_EXAM_DISTRIBUTION=Object.freeze([
  ['Razonamiento Matemático',13],['Razonamiento Verbal',14],
  ['Cultura General',3],['Álgebra',4],['Geometría',4],['Aritmética',3],
  ['Trigonometría',3],['Física',6],['Biología',11],['Química',9],
  ['Lengua',4],['Literatura',3],['Historia',4],['Geografía',4],
  ['Economía',4],['Filosofía',4],['Psicología',3],['Educación Cívica',4]
]);
const THIRD_EXAM_HISTORY_KEY='cachimbolab_third_exam_2026_ii_history_v1';
function normalizedThirdSubject(value){
 const valueNormalized=String(value||'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
 const aliases={
  'razonamiento matematico':'Razonamiento Matemático','razonamiento verbal':'Razonamiento Verbal',
  'cultura general':'Cultura General','algebra':'Álgebra','geometria':'Geometría',
  'aritmetica':'Aritmética','trigonometria':'Trigonometría','fisica':'Física',
  'biologia':'Biología','quimica':'Química','lengua':'Lengua','lenguaje':'Lengua',
  'lengua y literatura':'Lengua','literatura':'Literatura','historia':'Historia',
  'historia del peru':'Historia','historia universal':'Historia',
  'geografia':'Geografía','economia':'Economía','filosofia':'Filosofía',
  'psicologia':'Psicología','civica':'Educación Cívica','educacion civica':'Educación Cívica'
 };
 return aliases[valueNormalized]||String(value||'').trim();
}
function thirdExamPool(){
 return questions.filter(q=>q.modality==='CPU-UNSM'&&!q.exam_id&&q.cycle==='2026-II'&&Number(q.week)>=11&&Number(q.week)<=16&&q.status==='published');
}
function thirdExamAvailability(){
 const pool=thirdExamPool();
 const counts=new Map();
 for(const q of pool){const subject=normalizedThirdSubject(q.subject);counts.set(subject,(counts.get(subject)||0)+1);}
 const missing=THIRD_EXAM_DISTRIBUTION.map(([name,required])=>({name,required,available:counts.get(name)||0})).filter(x=>x.available<x.required);
 return {pool,missing,ready:missing.length===0};
}
function thirdExamHistory(){
 try{const h=JSON.parse(localStorage.getItem(THIRD_EXAM_HISTORY_KEY)||'[]');return Array.isArray(h)?h.slice(-12):[];}catch{return [];}
}
function saveThirdExamHistory(ids){
 try{const h=thirdExamHistory();h.push(ids);localStorage.setItem(THIRD_EXAM_HISTORY_KEY,JSON.stringify(h.slice(-12)));}catch(error){console.warn('No se pudo conservar historial de variantes',error);}
}
function makeThirdExamItems(){
 const {pool,missing}=thirdExamAvailability();
 if(missing.length)throw new Error('Faltan preguntas publicadas: '+missing.map(x=>x.name+' ('+x.available+'/'+x.required+')').join(', '));
 const previous=thirdExamHistory(),last=new Set(previous[previous.length-1]||[]);
 const frequency=new Map();
 for(const ids of previous)for(const id of ids)frequency.set(id,(frequency.get(id)||0)+1);
 const selection=[];
 for(const [subject,amount] of THIRD_EXAM_DISTRIBUTION){
  const candidates=pool.filter(q=>normalizedThirdSubject(q.subject)===subject).map(q=>({q,tie:Math.random()}));
  const weeks=new Map();
  for(let i=0;i<amount;i++){
   // Prefiere preguntas no usadas en el intento anterior, menos repetidas y distribuidas entre semanas.
   candidates.sort((a,b)=>{
    const score=o=>(last.has(o.q.id)?1000:0)+(frequency.get(o.q.id)||0)*15+(weeks.get(Number(o.q.week))||0)*3;
    return score(a)-score(b)||a.tie-b.tie;
   });
   const chosen=candidates.shift();
   if(!chosen)throw new Error('No hay suficientes preguntas en '+subject);
   selection.push(chosen.q);
   const week=Number(chosen.q.week);weeks.set(week,(weeks.get(week)||0)+1);
  }
 }
 if(selection.length!==100||new Set(selection.map(q=>q.id)).size!==100)throw new Error('El simulacro no cumple las 100 preguntas únicas.');
 if(previous.length&&selection.every((q,i)=>q.id===previous[previous.length-1][i]))throw new Error('Todavía no hay suficientes preguntas distintas para generar una nueva versión del simulacro. Agrega y publica más preguntas del periodo 11–16.');
 return selection;
}
function quizRemaining(){return quiz?.deadlineAt?Math.max(0,quiz.deadlineAt-Date.now()):null;}
function examClock(ms){const seconds=Math.ceil(Math.max(0,ms)/1000);return [Math.floor(seconds/3600),Math.floor(seconds%3600/60),seconds%60].map(n=>String(n).padStart(2,'0')).join(':');}
async function submitQuizTimed(){
 if(!quiz||quiz.result||quizSubmitting)return;
 quizSubmitting=true;clearInterval(quizTimerHandle);tickQuizTime();
 const selected=document.querySelector('input[name=choice]:checked');if(selected)quiz.answers[quiz.i]=Number(selected.value);
 const b=$('nextQuiz');if(b)b.disabled=true;
 const st=$('quizError');if(st)st.textContent='Entregando y calificando...';
 const {data,error}=await db.rpc('grade_attempt',{p_answers:quiz.items.map((q,i)=>({id:q.id,selected:quiz.answers[i]}))});
 if(error){if(st)st.textContent='Error al entregar: '+error.message+'; reintenta.';if(b)b.disabled=false;quizSubmitting=false;return;}
 quiz.result=data;quizSubmitting=false;clearTimedExam();await refresh();
}
function bindQuizTimer(){clearInterval(quizTimerHandle);if(!quiz||quiz.result)return;quizTimerHandle=setInterval(()=>{if(!quiz||quiz.result){clearInterval(quizTimerHandle);return}tickQuizTime();const e=document.getElementById('questionTimer');if(e)e.textContent=timeFmt(quiz.elapsed[quiz.i]);const t=document.getElementById('totalTimer');if(t)t.textContent=timeFmt(quiz.elapsed.reduce((a,b)=>a+b,0));const left=document.getElementById('quizRemaining');if(left)left.textContent=examClock(quizRemaining());if(quiz.deadlineAt&&quizRemaining()===0)submitQuizTimed();},1000)}
function quizPage(){if(!quiz)return `<div class="card"><h2>Nuevo simulacro</h2><p class="muted">Se seleccionarán preguntas publicadas. Las claves no se descargan antes de enviar tus respuestas.</p><div class="field"><label>Materia</label><select id="quizSubject"><option value="">Todas</option>${[...new Set(modalityQuestions().filter(q=>!q.exam_id&&q.status==='published').map(q=>q.subject))].map(s=>`<option>${esc(s)}</option>`).join('')}</select></div>
<div class="field">
  <label>Semana del examen</label>
  <select id="quizWeek">
    <option value="">Todas las semanas</option>
    ${[...new Set(
      modalityQuestions()
        .filter(q => !q.exam_id && q.status === 'published')
        .map(q => Number(q.week))
        .filter(w => Number.isInteger(w) && w > 0)
    )]
      .sort((a, b) => a - b)
      .map(w => `<option value="${w}">Semana ${w}</option>`)
      .join('')}
  </select>
</div>
<div class="card"><h3>III Examen CPU-UNSM 2026-II</h3><p>Semanas 11–16 · 100 preguntas · 2 horas y 30 minutos.</p><p class="muted">Preguntas publicadas entre las semanas 11–16: ${thirdExamAvailability().pool.length}. ${thirdExamAvailability().ready?'Hay suficientes preguntas por curso.':'Faltan por curso: '+thirdExamAvailability().missing.map(x=>x.name+' ('+x.available+'/'+x.required+')').join(' · ')}</p><button id="startThirdExam" ${!thirdExamAvailability().ready?'disabled':''}>Iniciar III examen</button></div><div class="field"><label>Número de preguntas</label><input id="quizCount" type="number" min="1" max="100" value="10"></div><button id="startQuiz">Comenzar</button></div>`;if(quiz.result){return quizReviewPage();}const q=quiz.items[quiz.i];return `<div class="exam-layout">${becaReadingPanel(q)}<div class="card exam-question"><p class="muted">Pregunta ${quiz.i+1} de ${quiz.items.length} · <strong>Tiempo de esta pregunta: <span id="questionTimer">${timeFmt(quiz.elapsed[quiz.i])}</span></strong> · Total: <span id="totalTimer">${timeFmt(quiz.elapsed.reduce((a,b)=>a+b,0))}</span>${quiz.deadlineAt?' · Tiempo restante: <strong id="quizRemaining">'+examClock(quizRemaining())+'</strong>':''}</p><h2>${esc(q.statement)}</h2>${espacioImagenPrivada(q.statement_image_path,'Imagen del enunciado')}${q.options.map((o,i)=>`<label class="option"><input type="radio" name="choice" value="${i}" ${quiz.answers[quiz.i]===i?'checked':''}>${'ABCDE'[i]}) ${esc(o)}</label>`).join('')}${quiz.deadlineAt?'<button id="prevQuiz" class="secondary" '+(quiz.i===0?'disabled':'')+'>Anterior</button> ':''}<button id="nextQuiz">${quiz.i===quiz.items.length-1?'Entregar simulacro':'Siguiente'}</button>${quiz.deadlineAt?'<button id="deliverQuiz" class="secondary">Entregar ahora</button>':''}<p id="quizError" class="muted"></p></div></div>`}

// Corrección de simulacros: solo se muestran claves recibidas tras grade_attempt.
function quizReviewPage(){
  const result=quiz.result;
  const details=Array.isArray(result.details)?result.details:[];
  const total=Number(result.total)||quiz.items.length;
  const correct=Number(result.correct)||0;
  const blank=quiz.answers.filter(a=>a===null||a===undefined).length;
  const wrong=Math.max(0,total-correct-blank);
  const percent=total?Math.round(correct/total*100):0;
  const revision=quiz.items.map((q,i)=>{
    const d=details.find(x=>String(x.id)===String(q.id));
    const selected=quiz.answers[i];
    const blankAnswer=selected===null||selected===undefined;
    const key=Number(d?.correct_index);
    const hasKey=Boolean(d)&&Number.isInteger(key)&&key>=0&&key<q.options.length;
    const isCorrect=hasKey&&!blankAnswer&&Number(selected)===key;
    const state=blankAnswer?'Sin responder':!hasKey?'Pendiente de verificar':isCorrect?'Correcta':'Incorrecta';
    const stateColor=blankAnswer?'#64748b':isCorrect?'#2563eb':'#b91c1c';
    const options=q.options.map((option,j)=>{
      const correctOption=hasKey&&j===key;
      const wrongOption=!blankAnswer&&j===Number(selected)&&hasKey&&!isCorrect;
      const symbol=correctOption?'✓':wrongOption?'✕':'○';
      const color=correctOption?'#2563eb':wrongOption?'#b91c1c':'#64748b';
      const background=correctOption?'#eff6ff':wrongOption?'#fef2f2':'transparent';
      const annotation=correctOption?' — Respuesta correcta':wrongOption?' — Tu respuesta':'';
      return `<div style="display:flex;align-items:flex-start;gap:10px;margin:7px 0;padding:9px 11px;border-radius:9px;border:1px solid ${correctOption?'#bfdbfe':wrongOption?'#fecaca':'#e2e8f0'};background:${background}"><span aria-hidden="true" style="color:${color};font-weight:800;font-size:1.15rem;min-width:20px">${symbol}</span><span style="color:${correctOption||wrongOption?color:'inherit'}">${'ABCDE'[j]}) ${esc(option)}${annotation}</span></div>`;
    }).join('');
    const explanation=typeof d?.explanation==='string'?d.explanation.trim():'';
    const solutionImage=q.solution_image_path;
    const explanationHtml=explanation?`<p style="white-space:pre-wrap;line-height:1.75">${esc(explanation)}</p>`:(!solutionImage?'<p class="muted">Todavía no se ha registrado un desarrollo paso a paso para esta pregunta.</p>':'');
    return `<div class="listitem"><p class="muted small">Pregunta ${i+1} · ${esc(q.subject||'')} · Semana ${esc(q.week??'—')}</p><strong>${esc(q.statement)}</strong>${becaReadingPanel(q)}${espacioImagenPrivada(q.statement_image_path,'Imagen del enunciado')}<p style="font-weight:700;color:${stateColor}">${blankAnswer?'○':isCorrect?'✓':'✕'} ${esc(state)}</p>${options}${!hasKey?'<p class="muted">No se recibió una clave válida para esta pregunta. Consulta al administrador.</p>':''}<details style="margin-top:12px" ${explanation||solutionImage?'':'open'}><summary style="cursor:pointer;font-weight:700">Ver desarrollo paso a paso</summary><div class="card" style="margin-top:10px">${explanationHtml}${espacioImagenPrivada(solutionImage,'Imagen de la solución')}</div></details></div>`;
  }).join('');
  const times=quiz.elapsed||[];const totalTime=times.reduce((a,b)=>a+b,0);const timeSummary=`<p><strong>Tiempo total medido:</strong> ${timeFmt(totalTime)} · <strong>Promedio por pregunta:</strong> ${timeFmt(total?totalTime/total:0)}</p><details><summary>Ver tiempo por pregunta</summary><div class="time-grid">${times.map((ms,i)=>`<span>Pregunta ${i+1}: <strong>${timeFmt(ms)}</strong></span>`).join('')}</div></details>`;
  return `<div class="card"><h2>Resultado del simulacro</h2><div class="stat">${correct}/${total}</div><p>${percent}% de aciertos</p>${timeSummary}<p><strong style="color:#2563eb">✓ ${correct} correctas</strong> · <strong style="color:#b91c1c">✕ ${wrong} incorrectas</strong> · <strong style="color:#64748b">○ ${blank} en blanco</strong></p><p class="muted small">Las soluciones se muestran únicamente después de entregar el simulacro.</p><button id="restartQuiz">Otro simulacro</button></div><div class="card"><h2>Revisión de respuestas</h2>${revision}</div>`;
}

// La respuesta correcta nunca se obtiene antes de comprobar la pregunta en Supabase.
function practicePage(){
  const published=modalityQuestions().filter(q=>!q.exam_id&&q.status==='published');
  if(!practice)return `<div class="card"><h2>Práctica inmediata</h2><p class="muted">Resuelve una pregunta y recibe la corrección al instante. Tus respuestas se guardan en Supabase.</p><div class="field"><label>Materia</label><select id="practiceSubject"><option value="">Todas las materias</option>${[...new Set(published.map(q=>q.subject))].sort().map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('')}</select></div><div class="actions"><button id="startPractice" ${published.length?'':'disabled'}>Comenzar práctica</button><button id="reviewPractice" class="secondary">Repasar mis errores</button></div><p id="practiceStatus" class="muted">${published.length?`${published.length} pregunta(s) publicada(s) disponible(s).`:'Todavía no hay preguntas publicadas.'}</p></div>`;
  const q=practice.items[practice.i];
  if(!q)return `<div class="card"><h2>Práctica finalizada</h2><p>Has completado ${practice.items.length} pregunta(s).</p><p>Aciertos en esta sesión: <strong>${practice.hits}/${practice.items.length}</strong></p><button id="finishPractice">Volver al inicio de práctica</button></div>`;
  const d=practice.feedback;
  return `<div class="exam-layout">${becaReadingPanel(q)}<div class="card exam-question"><p class="muted">Pregunta ${practice.i+1} de ${practice.items.length} · ${esc(q.subject)} · Semana ${esc(q.week)}</p><h2>${esc(q.statement)}</h2>${espacioImagenPrivada(q.statement_image_path,'Imagen del enunciado')}${q.options.map((o,i)=>`<label class="option"><input type="radio" name="practiceChoice" value="${i}" ${d?'disabled':''} ${practice.selected===i?'checked':''}>${'ABCDE'[i]}) ${esc(o)}</label>`).join('')}${!d?`<button id="checkPractice">Comprobar respuesta</button>`:`<div class="card"><h3>${d.is_correct?'¡Respuesta correcta!':'Respuesta incorrecta'}</h3><p>Tu respuesta: ${practice.selected===null?'Sin responder':`${'ABCDE'[practice.selected]}) ${esc(q.options[practice.selected])}`}</p><p><strong>Respuesta correcta: ${'ABCDE'[d.correct_index]}) ${esc(q.options[d.correct_index])}</strong></p><h3>Desarrollo paso a paso</h3><p style="white-space:pre-wrap">${esc(d.explanation?.trim()||(q.solution_image_path?'':'Todavía no se ha registrado una explicación para esta pregunta.'))}</p>${espacioImagenPrivada(q.solution_image_path,'Imagen de la solución')}</div><button id="nextPractice">${practice.i===practice.items.length-1?'Ver resumen':'Siguiente pregunta'}</button>`}<p id="practiceError" class="muted"></p></div></div>`;
}
async function startPractice(items){
  if(!items.length){$('practiceStatus').textContent='No hay preguntas disponibles con este criterio.';return}
  practice={items:[...items].sort(()=>Math.random()-.5),i:0,selected:null,feedback:null,hits:0};render();
}
function bindPractice(){
  if($('startPractice'))$('startPractice').onclick=()=>{const subject=$('practiceSubject').value;startPractice(
questions.filter(q=>!q.exam_id&&q.modality===selectedModality&&q.status==='published'
&&(!subject||q.subject===subject)))};
  if($('reviewPractice'))$('reviewPractice').onclick=async()=>{
    const button=$('reviewPractice');button.disabled=true;$('practiceStatus').textContent='Buscando tus preguntas pendientes...';
    const {data,error}=await db.rpc('questions_to_review',{p_limit:100});
    if(error){$('practiceStatus').textContent='No se pudo consultar el repaso: '+error.message;button.disabled=false;return}
    const ids=new Set((data||[]).map(x=>x.question_id));const items=
questions.filter(q=>!q.exam_id&&q.modality===selectedModality&&q.status==='published'&&ids.has(q.id))
;
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
function manage(){
  if(!teacher()) return notice('Acceso exclusivo para docentes',true);

  return `<div class="card">
    <h2>Registrar pregunta original</h2>
    <p class="muted">Conserva ciclo, semana, número y página. La pregunta se guarda como borrador para revisión administrativa.</p>

    <form id="questionForm">
      <div class="form-grid">
        
<div class="field">
  <label>Modalidad de preparación</label>
  <select name="modality" required>
    <option value="CPU-UNSM">🎓 CPU-UNSM</option>
    <option value="BECA18">🏆 Beca 18</option>
  </select>
</div>
        <div class="field"><label>Ciclo</label><input name="cycle" value="2026-II" required></div>
        <div class="field"><label>Semana</label><input name="week" type="number" min="1" max="60" value="9" required></div>
        <div class="field"><label>Materia</label><input name="subject" required></div>
        <div class="field"><label>Tema</label><input name="topic" required></div>
        <div class="field"><label>Página</label><input name="page" type="number" min="1"></div>
        <div class="field"><label>Número original</label><input name="number" type="number" min="1"></div>
      </div>

      <div class="field">
        <label>Enunciado</label>
        <textarea name="statement" required></textarea>
        <p id="duplicateStatus" class="muted small" role="status" aria-live="polite"></p>
      </div>

      <div class="field">
        <label>Imagen del enunciado (opcional)</label>
        <input type="file" name="statementImage" accept="image/png,image/jpeg,image/webp">
        <p class="muted small">PNG, JPG o WEBP. Máximo 5 MB.</p>
      </div>

      ${'ABCDE'.split('').map(x=>`<div class="field" data-option-letter="${x}"><label>Alternativa ${x}</label><input name="option${x}" required></div>`).join('')}

      <div class="field">
        <label>Clave propuesta</label>
        <select name="correct">
          ${'ABCDE'.split('').map((x,i)=>`<option value="${i}">${x}</option>`).join('')}
        </select>
      </div>

      <div class="field">
        <label>Explicación</label>
        <textarea name="explanation"></textarea>
      </div>

      <div class="field">
        <label>Imagen de la solución (opcional)</label>
        <input type="file" name="solutionImage" accept="image/png,image/jpeg,image/webp">
        <p class="muted small">PNG, JPG o WEBP. Máximo 5 MB.</p>
      </div>

      <div class="field">
        <label>Referencia de origen</label>
        <input name="source" placeholder="Separata CPU-UNSM, semana 09, pág. 15">
      </div>

      <button type="submit">Guardar en Supabase</button>
    </form>

    <p id="saveStatus"></p>
  </div>`;
}

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
function bulkFingerprint(q){return normalizarEnunciado(q.statement)}
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
    <p>Nota: esta plantilla CSV todavía exige cinco alternativas. Para preguntas originales de Beca 18 con cuatro alternativas, utiliza el formulario individual o la importación SQL ya realizada.</p><p>Importa preguntas de la modalidad seleccionada sin registrarlas una por una. Prepara un CSV con la plantilla, revisa la vista previa y guarda únicamente las filas válidas. <strong>Todas se guardan como borradores</strong>: ninguna se publica automáticamente.</p>
    <p><a href="plantilla_preguntas.csv" download>Descargar plantilla CSV</a> · <span class="muted">Puedes editarla con Excel y guardarla como CSV UTF-8 (delimitado por comas).</span></p>
    
<div class="field">
  <label>Modalidad de las preguntas del CSV</label>
  <select id="bulkModality">
    <option value="CPU-UNSM">🎓 CPU-UNSM</option>
    <option value="BECA18">🏆 Beca 18</option>
  </select>
</div>
    <div class="field"><label>Selecciona tu archivo CSV</label><input id="bulkFile" type="file" accept=".csv,text/csv" ${bulkBusy?'disabled':''}></div>
    <p id="bulkStatus" class="muted" aria-live="polite">${bulkRows.length?`${bulkRows.length} filas analizadas: ${valid} listas, ${invalid} con observaciones.`:'Aún no se ha seleccionado un archivo.'}</p>
    <div class="actions"><button id="bulkImport" ${!valid||bulkBusy?'disabled':''}>Guardar ${valid} preguntas como borradores</button><button id="bulkClear" class="secondary" ${bulkBusy?'disabled':''}>Limpiar vista previa</button></div>
    <p class="muted small">No incluyas claves secretas de Supabase. El importador usa tu sesión y la función segura rpc('save_question'. La clave de cada pregunta es obligatoria para guardarla, pero debe revisarse antes de publicarla.</p>
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
     const importModality=$('bulkModality').value;
    for(let i=0;i<rows.length;i++){
      const r=rows[i];status.textContent=`Comprobando ${i+1} de ${rows.length}... (${saved} guardadas)`;
      let existente;
      try{existente=await buscarPreguntaDuplicada(r.statement);}
      catch(e){failures.push(`Fila ${r.line}: ${e.message}`);continue;}
      if(existente){failures.push(`Fila ${r.line}: ${mensajeDuplicado(existente)}`);continue;}
      const {error}=await db.rpc('save_question_by_modality',{
  p_modality:importModality,
  p_cycle:r.cycle,p_week:Number(r.week),p_subject:r.subject,p_topic:r.topic,

        p_page:r.page?Number(r.page):null,p_number:r.original_number?Number(r.original_number):null,
        p_statement:r.statement,p_options:['a','b','c','d','e'].map(x=>r['option_'+x]),
        p_source:r.source,p_correct:'ABCDE'.indexOf(r.correct.toUpperCase()),p_explanation:r.explanation
      });
      if(error)failures.push(`Fila ${r.line}: ${errorDuplicado(error)?'Esta pregunta ya existe en el banco.':error.message}`);else{saved++;r.errors.push('Guardada en Supabase');}
    }
    bulkBusy=false;await refresh();
    const result=$('bulkStatus');if(result)result.textContent=`Finalizado: ${saved} guardadas como borrador; ${failures.length} fallidas. ${failures.slice(0,5).join(' | ')}`;
    const importButton=$('bulkImport');if(importButton)importButton.disabled=true;
  };
}


// Panel protegido: las claves se consultan solo mediante RPC autorizadas.
const admin=()=>profile?.role==='admin';
// Clasificación visual compatible con los registros actuales, sin modificar Supabase.
const examById=id=>exams.find(e=>e.id===id);
const esExamenCPU=q=>Boolean(q.exam_id);
const etiquetaOrigen=q=>q.exam_id?(examById(q.exam_id)?.title||'Examen registrado'):(q.week==null?'Semana sin asignar':`Semana ${q.week}`);
const coincideOrigen=(q,f)=>!f||(f.startsWith('exam-')?q.exam_id===f.slice(5):f==='unassigned'?!q.exam_id&&q.week==null:f.startsWith('week-')&&!q.exam_id&&String(q.week)===f.slice(5));
// Orden estable por numeración original; los números no asignados van al final.
// Para vistas mixtas, primero se agrupa por origen (examen o separata).
const numeroOriginal=q=>{const n=Number(q.original_number);return Number.isInteger(n)&&n>0?n:Number.MAX_SAFE_INTEGER;};
const ordenarPreguntasPorNumero=(a,b)=>numeroOriginal(a)-numeroOriginal(b)||String(a.subject||'').localeCompare(String(b.subject||''),'es')||String(a.id||'').localeCompare(String(b.id||''));
const ordenarPreguntasPorOrigenYNumero=(a,b)=>{
 const origenA=a.exam_id?'exam-'+a.exam_id:'week-'+String(a.cycle||'')+'-'+String(a.week??'');
 const origenB=b.exam_id?'exam-'+b.exam_id:'week-'+String(b.cycle||'')+'-'+String(b.week??'');
 return origenA.localeCompare(origenB,'es',{numeric:true})||ordenarPreguntasPorNumero(a,b);
};
function reviewPage(){
 if(!teacher())return notice('Acceso exclusivo para docentes',true);
 if(selectedModality==='CPU-UNSM'&&!relationLoaded&&!relationBusy)queueMicrotask(loadRelations);
 const subjects=[...new Set([...modalityQuestions().map(q=>q.subject),...(selectedModality==='CPU-UNSM'?['Razonamiento Verbal']:[])])].sort();
 const weeks=[...new Set([...modalityQuestions().filter(q=>!esExamenCPU(q)&&q.week!=null).map(q=>q.week),...(selectedModality==='CPU-UNSM'?[6]:[])])].sort((a,b)=>a-b);
 const examOptions=exams.filter(e=>modalityQuestions().some(q=>q.exam_id===e.id));
 const hasUnassigned=modalityQuestions().some(q=>q.week==null&&!esExamenCPU(q));
 const opts=(values,current)=>values.map(v=>`<option value="${esc(v)}" ${String(v)===String(current)?'selected':''}>${esc(v)}</option>`).join('');
 const filtered=modalityQuestions().filter(q=>(!reviewFilter.subject||q.subject===reviewFilter.subject)&&coincideOrigen(q,reviewFilter.week)&&(!reviewFilter.status||q.status===reviewFilter.status)).sort(reviewFilter.week?ordenarPreguntasPorNumero:ordenarPreguntasPorOrigenYNumero);
 const detail=reviewSelected;
 const rels=selectedModality==='CPU-UNSM'?relationItems.filter(q=>(!reviewFilter.subject||reviewFilter.subject==='Razonamiento Verbal')&&(!reviewFilter.week||(reviewFilter.week.startsWith('week-')&&String(q.semana)===reviewFilter.week.slice(5)))&&(!reviewFilter.status||(q.estado==='borrador'?'draft':q.estado==='publicado'?'published':q.estado==='revision'?'review':q.estado)===reviewFilter.status)):[];
 return `<div class="card"><h2>Revisión y publicación</h2><p class="muted">Las preguntas importadas permanecen en borrador hasta su aprobación. ${admin()?'Tu cuenta tiene permisos de administrador.':'Puedes enviar borradores a revisión; solo un administrador puede publicarlos.'}</p><div class="field"><label for="reviewModality">Modalidad de preparación</label><select id="reviewModality"><option value="CPU-UNSM" ${selectedModality==='CPU-UNSM'?'selected':''}>🎓 CPU-UNSM</option><option value="BECA18" ${selectedModality==='BECA18'?'selected':''}>🏆 Beca 18</option></select></div><div class="filters"><select id="reviewSubject"><option value="">Todas las materias</option>${opts(subjects,reviewFilter.subject)}</select><select id="reviewWeek"><option value="">Todos los materiales</option>${examOptions.map(e=>`<option value="exam-${esc(e.id)}" ${reviewFilter.week===`exam-${e.id}`?'selected':''}>${esc(e.title)}</option>`).join('')}${weeks.map(w=>`<option value="week-${w}" ${`week-${w}`===reviewFilter.week?'selected':''}>Separata · Semana ${w}</option>`).join('')}${hasUnassigned?`<option value="unassigned" ${reviewFilter.week==='unassigned'?'selected':''}>Sin clasificar</option>`:''}</select><select id="reviewStatus"><option value="">Todos los estados</option>${opts(['draft','review','published'],reviewFilter.status)}</select></div><p class="muted small">${filtered.length+rels.length} preguntas encontradas · ${modalityQuestions().filter(q=>q.status==='draft').length} borradores · ${modalityQuestions().filter(q=>q.status==='review').length} en revisión · ${modalityQuestions().filter(q=>!q.exam_id&&q.status==='published').length} publicadas</p><div id="reviewMessage" class="muted" role="status"></div>${rels.map(q=>`<div class="listitem"><strong>Razonamiento Verbal · Semana ${Number(q.semana)||6} · N.º ${Number(q.numero_original)||'—'}</strong> <span class="tag">${esc(q.estado)}</span><p>${esc(q.titulo)}</p><button class="secondary" data-relation-review="${esc(q.id)}">Revisar pregunta</button></div>`).join('')}${filtered.map(q=>`<div class="listitem"><strong>${esc(q.subject)} · ${esc(etiquetaOrigen(q))} · N.º ${q.original_number??'—'}</strong> <span class="tag">${esc(q.status)}</span><p>${esc(q.statement)}</p>${espacioImagenPrivada(q.statement_image_path,'Imagen del enunciado')}<button class="secondary" data-review-id="${q.id}">Revisar pregunta</button></div>`).join('')}${!filtered.length&&!rels.length?'<p>No hay preguntas con estos filtros.</p>':''}${relationError?`<p style="color:#b91c1c">${esc(relationError)}</p>`:''}</div><div id="reviewDetail">${relationReview?relationReviewDetail(relationReview):(detail?reviewDetail(detail):'')}</div>`;
}
function reviewDetail(q){
 const editable=q.status!=='published'||admin();
 const letters='ABCDE'.slice(0,Array.isArray(q.options)&&q.options.length===4?4:5);
 return `<div class="card"><h2>Pregunta N.º ${q.original_number??'—'} · ${esc(q.status)}</h2><p class="muted small">Materia: ${esc(q.subject)} · ${esc(etiquetaOrigen(q))}</p>${becaReadingPanel(q)}<form id="reviewForm"><div class="form-grid"><div class="field"><label>Ciclo</label><input name="cycle" value="${esc(q.cycle)}" required ${editable?'':'disabled'}></div><div class="field"><label>Semana</label><input type="number" name="week" min="1" max="60" value="${q.week??''}" ${q.exam_id?'disabled':'required'} ${editable?'':'disabled'}></div><div class="field"><label>Materia</label><input name="subject" value="${esc(q.subject)}" required ${editable?'':'disabled'}></div><div class="field"><label>Tema</label><input name="topic" value="${esc(q.topic)}" required ${editable?'':'disabled'}></div><div class="field"><label>Página</label><input type="number" name="page" min="1" value="${q.page??''}" ${editable?'':'disabled'}></div><div class="field"><label>Número original</label><input type="number" name="number" min="1" value="${q.original_number??''}" ${editable?'':'disabled'}></div></div><div class="field"><label>Enunciado</label><textarea name="statement" required ${editable?'':'disabled'}>${esc(q.statement)}</textarea></div>${espacioImagenPrivada(q.statement_image_path,'Imagen del enunciado')}${letters.split('').map((letter,i)=>`<div class="field"><label>Alternativa ${letter}</label><input name="option${letter}" value="${esc(q.options[i]||'')}" required ${editable?'':'disabled'}></div>`).join('')}<div class="field"><label>Clave propuesta</label><select name="correct" ${editable?'':'disabled'}><option value="" ${q.correct_index==null?'selected':''}>— Clave pendiente —</option>${letters.split('').map((letter,i)=>`<option value="${i}" ${q.correct_index===i?'selected':''}>${letter}</option>`).join('')}</select></div><div class="field"><label>Explicación</label><textarea name="explanation" ${editable?'':'disabled'}>${esc(q.explanation||'')}</textarea></div>${espacioImagenPrivada(q.solution_image_path,'Imagen de la solución')}${admin()?`<div class="field"><label>Agregar o reemplazar imagen de la solución</label><input id="reviewSolutionImage" type="file" accept="image/png,image/jpeg,image/webp"><p class="muted small">PNG, JPG o WEBP, hasta 5 MB. Puedes guardar esta imagen sin modificar el texto, las alternativas ni la clave.</p><button type="button" id="reviewUploadSolution">Guardar imagen de solución</button><p id="reviewImageStatus" class="muted" role="status"></p></div>`:''}<div class="field"><label>Referencia</label><input name="source" value="${esc(q.source||'')}" ${editable?'':'disabled'}></div>${editable&&(!q.exam_id||admin())?'<button type="submit" id="reviewSave">'+(q.status==='published'?'Guardar cambios de pregunta publicada':'Guardar correcciones y clave')+'</button>':q.exam_id?'<p class="muted small">La edición de exámenes está reservada al administrador.</p>':''}</form><div class="actions" style="margin-top:12px">${q.status==='draft'?'<button id="reviewSubmit" class="secondary">Enviar a revisión</button>':''}${admin()&&q.status==='review'?'<button id="reviewPublish">Publicar pregunta</button>':''}<button id="reviewClose" class="secondary">Cerrar detalle</button></div><p id="reviewDetailStatus" class="muted" role="status"></p>${q.status==='published'?'<p class="muted small">'+(admin()?'Solo el administrador puede editar esta pregunta. Las calificaciones anteriores no se recalcularán. Cada cambio quedará registrado.':'Esta pregunta publicada solo puede ser editada por el administrador.')+'</p>':''}</div>`;
}
function bindReview(){
 document.querySelectorAll('[data-relation-review]').forEach(b=>b.onclick=async()=>{const msg=$('reviewMessage');msg.textContent='Cargando relaciones...';const {data,error}=await db.rpc('cachimbolab_revisar_relacion',{p_id:b.dataset.relationReview});if(error){msg.textContent=error.message;return}relationReview=data;reviewSelected=null;$('reviewDetail').innerHTML=relationReviewDetail(data);msg.textContent='';bindRelationReview();$('reviewDetail').scrollIntoView({behavior:'smooth',block:'start'});});
 if(relationReview)bindRelationReview();
 $('reviewModality').onchange=()=>{selectedModality=$('reviewModality').value;reviewFilter={subject:'',week:'',status:''};reviewSelected=null;relationReview=null;render()};
 for(const [id,key] of [['reviewSubject','subject'],['reviewWeek','week'],['reviewStatus','status']])$(id).onchange=()=>{reviewFilter[key]=$(id).value;reviewSelected=null;relationReview=null;render()};
 document.querySelectorAll('[data-review-id]').forEach(btn=>btn.onclick=async()=>{
   const message=$('reviewMessage');message.textContent='Cargando pregunta y clave...';
   const {data,error}=await db.rpc('get_question_for_review',{p_question_id:btn.dataset.reviewId});
   // Una pregunta de examen sin fila en answer_keys puede hacer fallar la RPC antigua.
   // Su contenido ya está disponible en la lista autorizada, pero NO inventamos la clave.
   const local=questions.find(q=>q.id===btn.dataset.reviewId);
   if(error&&!local?.exam_id){message.textContent='Error: '+error.message;return}
   if(!data&&!local){message.textContent='No se encontró la pregunta.';return}
   const detalle=data||{...local,correct_index:null,explanation:''};
   reviewSelected={...detalle,exam_id:questions.find(q=>q.id===detalle.id)?.exam_id??detalle.exam_id,statement_image_path:questions.find(q=>q.id===detalle.id)?.statement_image_path??detalle.statement_image_path,solution_image_path:questions.find(q=>q.id===detalle.id)?.solution_image_path??detalle.solution_image_path};liberarImagenesPrivadas($('reviewDetail'));$('reviewDetail').innerHTML=reviewDetail(reviewSelected);cargarImagenesPrivadas($('reviewDetail'));message.textContent=error?'Esta pregunta todavía no tiene clave registrada. Puedes asignarla y guardar las correcciones.':'';bindReviewDetail();$('reviewDetail').scrollIntoView({behavior:'smooth',block:'start'});
 });
 if(reviewSelected)bindReviewDetail();
}
function relationReviewDetail(q){
 const left=q.columna_izquierda||[],right=q.columna_derecha||[],key=q.clave||[];
 return `<div class="card"><h2>Pregunta ${Number(q.numero_original)} · ${esc(q.titulo)}</h2><p>Razonamiento Verbal · Semana ${Number(q.semana)} · ${esc(q.estado)}</p><p>${esc(q.enunciado)}</p><div class="relation-head"><strong>COLUMNA A</strong><strong>COLUMNA B (clave)</strong></div><div class="relation-rows">${right.map((r,i)=>`<div class="relation-row"><span>${i+1}. ${esc(left[i]||'')}</span><span>(${Number(key[i])||'—'}) ${esc(r)}</span></div>`).join('')}</div><div class="actions">${q.estado==='borrador'?'<button id="relationToReview" class="secondary">Enviar a revisión</button>':''}${admin()&&q.estado==='revision'?'<button id="relationPublish">Publicar pregunta</button>':''}${admin()&&q.estado==='publicado'?'<button id="relationUnpublish" class="secondary">Volver a borrador</button>':''}<button id="relationClose" class="secondary">Cerrar</button></div><p id="relationReviewStatus" role="status"></p></div>`;
}
function bindRelationReview(){
 $('relationClose')?.addEventListener('click',()=>{relationReview=null;$('reviewDetail').innerHTML=''});
 const change=async(estado)=>{
  if(!confirm(`¿Cambiar esta pregunta a ${estado}?`))return;
  const status=$('relationReviewStatus');status.textContent='Guardando...';
  const {data,error}=await db.rpc('cachimbolab_estado_relacion',{p_id:relationReview.id,p_estado:estado});
  if(error){status.textContent=error.message;return;}
  relationReview=null;relationLoaded=false;await loadRelations();
 };
 $('relationToReview')?.addEventListener('click',()=>change('revision'));
 $('relationPublish')?.addEventListener('click',()=>change('publicado'));
 $('relationUnpublish')?.addEventListener('click',()=>change('borrador'));
}
function bindReviewDetail(){
 const q=reviewSelected;if(!q)return;
 $('reviewClose').onclick=()=>{reviewSelected=null;$('reviewDetail').innerHTML=''};
 const form=$('reviewForm');
 const imageButton=$('reviewUploadSolution');
 if(imageButton&&admin())imageButton.onclick=async()=>{
   const input=$('reviewSolutionImage');
   const status=$('reviewImageStatus');
   const archivo=input?.files?.[0];
   if(!archivo||archivo.size===0){status.textContent='Selecciona una imagen antes de guardar.';return;}
   imageButton.disabled=true;
   let ruta=null;
   try{
     status.textContent='Subiendo imagen de la solución...';
     ruta=await subirImagenPregunta(archivo,'soluciones');
     const {error}=await db.rpc('admin_set_question_solution_image',{
       p_question_id:q.id,
       p_solution_image_path:ruta
     });
     if(error)throw error;
     // Solo actualizamos la imagen: no se modifican la clave ni los demás campos.
     q.solution_image_path=ruta;
     const enLista=questions.find(item=>item.id===q.id);
     if(enLista)enLista.solution_image_path=ruta;
     const previo=form.querySelector('[data-private-image^="soluciones/"]');
     if(previo){liberarImagenesPrivadas(previo);previo.remove();}
     input.insertAdjacentHTML('beforebegin',espacioImagenPrivada(ruta,'Imagen de la solución'));
     cargarImagenesPrivadas(form);
     input.value='';
     status.textContent='Imagen de solución guardada. La pregunta y su clave permanecen intactas.';
   }catch(err){
     status.textContent='No se pudo guardar la imagen: '+(err?.message||'Error desconocido')+'. No se cambió la pregunta.';
     // No borramos automáticamente: Storage puede carecer de permiso DELETE.
     if(ruta)console.warn('Imagen sin asociar en Storage:',ruta);
   }finally{imageButton.disabled=false;}
 };
 if((!q.exam_id||admin())&&(q.status!=='published'||admin()))form.onsubmit=async e=>{
   e.preventDefault();const b=$('reviewSave'),status=$('reviewDetailStatus');b.disabled=true;status.textContent='Guardando...';
   const v=Object.fromEntries(new FormData(form).entries());
    const published=q.status==='published';
    const keyChanged=published&&v.correct!==''&&Number(v.correct)!==q.correct_index;
    if(published){
      const warning=keyChanged?'ATENCIÓN: cambiarás la respuesta correcta. Las calificaciones anteriores se conservarán sin recalcular, pero la revisión posterior mostrará la nueva clave. ¿Confirmas?':'¿Guardar los cambios de esta pregunta publicada? Las calificaciones anteriores se conservarán y el cambio quedará registrado.';
      if(!confirm(warning)){b.disabled=false;status.textContent='Edición cancelada.';return}
    }
    // Un administrador puede solicitar la edición de una pregunta de examen publicada.
    // La autorización final se verifica en la función RPC de Supabase.
    if(!q.exam_id&&v.correct===''){status.textContent='Selecciona una clave antes de guardar esta separata.';b.disabled=false;return;}
    const args={p_question_id:q.id,p_cycle:v.cycle,p_week:v.week?Number(v.week):null,p_subject:v.subject,p_topic:v.topic,p_page:v.page?Number(v.page):null,p_number:v.number?Number(v.number):null,p_statement:v.statement,p_options:'ABCDE'.slice(0,Array.isArray(q.options)&&q.options.length===4?4:5).split('').map(c=>v['option'+c]),p_source:v.source||'',p_correct:v.correct===''?null:Number(v.correct),p_explanation:v.explanation||''};
    if(published&&!q.exam_id)args.p_confirm_key_change=keyChanged;
    // Para exámenes, p_week debe permanecer NULL y la vinculación exam_id se conserva.
    if(q.exam_id)args.p_week=null;
   const {error}=await db.rpc(q.exam_id?'admin_update_exam_question':published?'admin_update_published_question':'update_question_for_review',args);
   if(error){status.textContent='Error: '+error.message+(q.exam_id?' Verifica que hayas ejecutado el SQL adjunto en Supabase.':'');b.disabled=false;return}
   reviewSelected=null;await refresh();const m=$('reviewMessage');if(m)m.textContent='Correcciones guardadas. Abre nuevamente la pregunta para continuar.';
 };
 if($('reviewSubmit'))$('reviewSubmit').onclick=async()=>{
   if(q.exam_id&&q.correct_index==null){$('reviewDetailStatus').textContent='Primero registra y guarda la clave correcta antes de enviarla a revisión.';return;}
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

function bind(){

 if($('selectCPU')) $('selectCPU').onclick=()=>{selectedModality='CPU-UNSM';page='bank';quiz=null;practice=null;render();};
if($('selectBeca')) $('selectBeca').onclick=()=>{selectedModality='BECA18';page='bank';quiz=null;practice=null;render();};
  if(user&&page==='access'&&$('reloadAccess'))$('reloadAccess').onclick=refresh;if(user&&page==='students')bindStudents();if(user&&page==='activity'&&$('loadActivity'))$('loadActivity').onclick=loadActivity;if(!user){
 $('authSwitch').onclick=()=>{authMode=authMode==='login'?'signup':'login';render()};
 $('authForm').onsubmit=async e=>{
  e.preventDefault();
  const form=e.currentTarget, fields=form.elements, status=$('authStatus'), submit=$('authSubmit');
  if(!form.reportValidity())return;
  const email=fields.namedItem('email').value.trim();
  const password=fields.namedItem('password').value;
  let name='';
  if(authMode==='signup'){
   name=fields.namedItem('fullName').value.trim().replace(/\s+/g,' ');
   const confirmation=fields.namedItem('confirmPassword').value;
   if(name.length<3||name.length>120){status.textContent='Escribe tu nombre completo y apellidos (entre 3 y 120 caracteres).';return}
   if(password!==confirmation){status.textContent='Las contraseñas no coinciden. Revísalas e inténtalo de nuevo.';return}
  }
  submit.disabled=true;
  status.textContent=authMode==='signup'?'Registrando cuenta...':'Iniciando sesión...';
  try{
   if(authMode==='signup'){
    const {error}=await db.auth.signUp({
  email,
  password,
  options:{
    data:{name},
    emailRedirectTo:'https://banco-unsm.github.io/BANCO-CPU-UNSM/'
  }
});
    status.textContent=error?'No se pudo registrar: '+error.message:'Solicitud de registro enviada. Revisa tu correo si necesitas confirmarlo. El administrador deberá autorizar tu acceso.';
   }else{
    const {error}=await db.auth.signInWithPassword({email,password});
    status.textContent=error?'No se pudo ingresar: '+error.message:'Sesión iniciada.';
   }
  }catch(err){status.textContent='Error de conexión: '+(err?.message||'Inténtalo nuevamente.')}finally{submit.disabled=false}
 };
 return;
}
if(page==='bank'){
  for(const id of ['subjectFilter','weekFilter','searchFilter'])
    $(id).addEventListener(
      id==='searchFilter'?'input':'change',
      bankList
    );
  bankList();
}

if(page==='exams') bindExams();
if(page==='practice') bindPractice();
if(page==='bulk') bindBulk();
if(page==='review') bindReview();

if(page==='quiz'){
  bindQuizTimer();
  if($('startThirdExam')) $('startThirdExam').onclick=()=>{
    let items;
    try{items=makeThirdExamItems();}catch(error){alert(error.message);return;}
    selectedModality='CPU-UNSM';
    const now=Date.now();
    quiz={items,answers:Array(100).fill(null),elapsed:Array(100).fill(0),lastTick:now,deadlineAt:now+THIRD_EXAM_DURATION,i:0};
    saveThirdExamHistory(items.map(q=>q.id));
    saveTimedExam();
    render();
  };
  if($('startQuiz')) $('startQuiz').onclick=()=>{
const subject = $('quizSubject').value;
const week = $('quizWeek').value;

const pool = questions.filter(q =>
q.modality === selectedModality &&
  !q.exam_id &&
  q.status === 'published' &&
  (!subject || q.subject === subject) &&
  (!week || Number(q.week) === Number(week))
);
    if(!pool.length) return alert('No hay preguntas publicadas.');
    const count=Math.min(
      pool.length,
      Math.max(1,Number($('quizCount').value)||10)
    );
    quiz={
      items:pool.sort(()=>Math.random()-.5).slice(0,count),
      answers:Array(count).fill(null),
      elapsed:Array(count).fill(0),
      lastTick:Date.now(),
      i:0
    };
    render();
  };

  if($('prevQuiz')) $('prevQuiz').onclick=()=>{const choice=document.querySelector('input[name=choice]:checked');quiz.answers[quiz.i]=choice?Number(choice.value):null;tickQuizTime();quiz.i=Math.max(0,quiz.i-1);quiz.lastTick=Date.now();render();};
  if($('deliverQuiz')) $('deliverQuiz').onclick=()=>{if(confirm('¿Entregar tus respuestas?'))submitQuizTimed();};
  document.querySelectorAll('input[name=choice]').forEach(input=>input.onchange=()=>{if(!quiz?.deadlineAt)return;quiz.answers[quiz.i]=Number(input.value);saveTimedExam();});
  if($('nextQuiz')) $('nextQuiz').onclick=async()=>{
    const sel=document.querySelector('input[name=choice]:checked');
    quiz.answers[quiz.i]=sel?Number(sel.value):null;

    tickQuizTime();
    if(quiz.deadlineAt&&quizRemaining()===0){await submitQuizTimed();return;}
    if(quiz.i<quiz.items.length-1){
      quiz.i++;
      quiz.lastTick=Date.now();
      render();
      return;
    }

    if(quiz.deadlineAt){await submitQuizTimed();return;}
    $('nextQuiz').disabled=true;

    const {data,error}=await db.rpc('grade_attempt',{
      p_answers:quiz.items.map((q,i)=>({
        id:q.id,
        selected:quiz.answers[i]
      }))
    });

    if(error){
      $('quizError').textContent=error.message;
      $('nextQuiz').disabled=false;
      return;
    }

    quiz.result=data;
    clearInterval(quizTimerHandle);
    await refresh();
  };

  if($('restartQuiz')) $('restartQuiz').onclick=()=>{
    quiz=null;
    render();
  };
}

if(page==='manage'&&teacher()){
  const formularioPregunta=$('questionForm');
  const campoEnunciado=formularioPregunta.elements.namedItem('statement');
  const estadoDuplicado=$('duplicateStatus');
  let consultaDuplicado=0;
  async function comprobarEnunciado(){
    const version=++consultaDuplicado;
    const texto=campoEnunciado.value.trim();
    estadoDuplicado.textContent='';
    if(!texto)return null;
    estadoDuplicado.textContent='Comprobando si esta pregunta ya existe...';
    try{
      const existente=await buscarPreguntaDuplicada(texto);
      if(version!==consultaDuplicado||texto!==campoEnunciado.value.trim())return null;
      estadoDuplicado.textContent=existente?mensajeDuplicado(existente):'No se encontró una pregunta con el mismo enunciado.';
      estadoDuplicado.style.color=existente?'#b45309':'';
      return existente;
    }catch(error){
      if(version===consultaDuplicado)estadoDuplicado.textContent=error.message;
      return null;
    }
  }
  campoEnunciado.addEventListener('blur',comprobarEnunciado);
  campoEnunciado.addEventListener('input',()=>{consultaDuplicado++;estadoDuplicado.textContent='';});
  formularioPregunta.onsubmit=async e=>{
    e.preventDefault();

    const f=e.target;
    const values=Object.fromEntries(new FormData(f).entries());
    const boton=f.querySelector('button[type="submit"]');
    const status=$('saveStatus');

    boton.disabled=true;
    const rutasSubidas=[];

    try{
      if(status) status.textContent='Verificando duplicados antes de guardar...';
      const existente=await buscarPreguntaDuplicada(values.statement);
      if(existente){
        if(estadoDuplicado){estadoDuplicado.textContent=mensajeDuplicado(existente);estadoDuplicado.style.color='#b45309';}
        throw new Error('Esta pregunta ya existe en el banco. No se guardó nuevamente.');
      }
      if(status) status.textContent='Subiendo imágenes y guardando pregunta...';

      const statementImagePath=await subirImagenPregunta(
        values.statementImage,
        'enunciados'
      );
      if(statementImagePath) rutasSubidas.push(statementImagePath);

      const solutionImagePath=await subirImagenPregunta(
        values.solutionImage,
        'soluciones'
      );
      if(solutionImagePath) rutasSubidas.push(solutionImagePath);

      
const {error}=await db.rpc('save_question_by_modality',{
  p_modality:values.modality,
  p_cycle:values.cycle,
        p_week:Number(values.week),
        p_subject:values.subject,
        p_topic:values.topic,
        p_page:values.page?Number(values.page):null,
        p_number:values.number?Number(values.number):null,
        p_statement:values.statement,
        p_options:'ABCDE'.slice(0,values.modality==='BECA18'?4:5).split('').map(x=>values['option'+x]),
        p_source:values.source||'',
        p_correct:Number(values.correct),
        p_explanation:values.explanation||'',
        p_statement_image_path:statementImagePath,
        p_solution_image_path:solutionImagePath
      });

      if(error) throw error;

      f.reset();
      try { await refresh(); }
      catch(refreshError){ console.warn('Pregunta guardada, pero no se pudo actualizar la pantalla:',refreshError); }
      const mensaje=$('saveStatus');
      if(mensaje) mensaje.textContent='Pregunta guardada correctamente como borrador. Pendiente de revisión.';

    }catch(error){
      // No se intenta eliminar sin una política DELETE autorizada.
      // Un archivo subido antes del error podría requerir limpieza administrativa.
      if(rutasSubidas.length) console.warn('Posibles imágenes sin asociar:',rutasSubidas);

      const mensaje=$('saveStatus');
      if(mensaje) mensaje.textContent=errorDuplicado(error)?'Esta pregunta ya existe en el banco. No se guardó nuevamente.':'Error: '+error.message;

    }finally{
      if(boton.isConnected) boton.disabled=false;
    }
  };
}
}
init();
