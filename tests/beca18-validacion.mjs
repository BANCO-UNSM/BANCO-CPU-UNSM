// Ejecutar desde la raíz: node tests/beca18-validacion.mjs
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';

const d=JSON.parse(readFileSync('beca18-clases.json','utf8'));
assert.equal(d.lessons.length,36,'El curso debe tener 36 clases');
assert.equal(d.lessons.filter(l=>l.area==='Números').length,12);
assert.equal(d.lessons.filter(l=>l.area==='Letras').length,12);
assert.equal(d.lessons.filter(l=>l.area==='Álgebra').length,12);
assert.ok(d.lessons.filter(l=>l.area==='Letras').every(l=>!/algebraico|polinomio|ecuaci[oó]n|factorizaci[oó]n|cuadr[aá]tic/i.test(l.title)),'Letras contiene temas de Álgebra');
assert.ok(d.lessons.filter(l=>l.area==='Álgebra').every(l=>l.id.startsWith('A')),'Los temas de Álgebra deben tener códigos A');
assert.ok(d.questions.length>=190,'Debe existir una práctica por tema');
const lessonIds=new Set();
for(const l of d.lessons){
 assert.ok(!lessonIds.has(l.id),'Clase duplicada: '+l.id);lessonIds.add(l.id);
 assert.ok(l.theory?.length>=3,'Teoría insuficiente: '+l.id);
 assert.ok(l.examples?.length>=3,'Ejemplos insuficientes: '+l.id);
 assert.ok(l.objectives?.length>=3,'Objetivos insuficientes: '+l.id);
}
const ids=new Set();
const keys=['correct','alternatives','memory','strategy'];
const prefixes=['RESPUESTA CORRECTA:','ANÁLISIS DE LAS OTRAS ALTERNATIVAS:','CLAVE PARA RECORDAR:','ESTRATEGIA DE EXAMEN:'];
for(const q of d.questions){
 assert.ok(lessonIds.has(q.lesson_id),'Clase desconocida: '+q.id);
 assert.ok(!ids.has(q.id),'Pregunta duplicada: '+q.id);ids.add(q.id);
 assert.equal(q.options.length,4,'La pregunta requiere 4 alternativas: '+q.id);
 assert.ok(q.options.every(o=>typeof o==='string'&&o.trim()),'Alternativa vacía: '+q.id);
 assert.ok(Number.isInteger(q.correct_index)&&q.correct_index>=0&&q.correct_index<4,'Índice de clave inválido: '+q.id);
 assert.equal(q.origin,'original_cachimbolab');
 for(let i=0;i<4;i++)assert.ok(q.explanation[keys[i]]?.startsWith(prefixes[i]),'Bloque faltante: '+q.id+' '+keys[i]);
 assert.ok(q.explanation.correct.includes(q.options[q.correct_index]),'Respuesta y clave discordantes: '+q.id);
}
for(const l of d.lessons)assert.ok(d.questions.some(q=>q.lesson_id===l.id),'Práctica faltante: '+l.id);
const html=readFileSync('beca18-clases.html','utf8');
const app=readFileSync('app.js','utf8');
assert.ok(html.includes('beca18-clases.js')&&html.includes('config.js'));
assert.ok(app.includes('href="beca18-clases.html"'),'Falta acceso desde CachimboLab');
const lessonJs=readFileSync('beca18-clases.js','utf8');
assert.ok(lessonJs.includes('function latestFullAttempt('),'Falta cálculo de intentos completos');
assert.ok(lessonJs.includes('function resetProgress('),'Falta borrado del progreso');
assert.ok(lessonJs.includes('wrongIds'),'Falta reintento de falladas');
assert.ok(lessonJs.includes('function progressSummary('),'Falta diagnóstico del alumno');
assert.ok(html.includes('data-area="Álgebra"')&&html.includes('data-area="Letras"'),'Faltan las rutas independientes');
assert.ok(html.includes('id="diagnostic"'),'Falta contenedor de diagnóstico');
assert.ok(html.includes('id="clearProgress"'),'Falta botón para borrar progreso');
const pronabec=JSON.parse(readFileSync('beca18-verbal-pronabec.json','utf8'));
assert.equal(pronabec.lessons.length,24,'El libro contiene 24 sesiones verbales');
assert.equal(pronabec.questions.length,72,'Se esperan 72 preguntas originales (3 por sesión)');
assert.ok(html.includes('data-area="Refuerzo verbal"'),'Falta conservar el refuerzo verbal');
assert.ok(lessonJs.includes("fetch('beca18-verbal-pronabec.json'"),'La interfaz no carga el libro de verbal');
const allLessonIds=new Set([...d.lessons.filter(l=>l.area!=='Letras').map(l=>l.id),...d.lessons.filter(l=>l.area==='Letras').map(l=>'R'+l.id.slice(1)),...pronabec.lessons.map(l=>l.id)]);
assert.equal(allLessonIds.size,60,'Las 60 clases deben tener identificadores únicos');
for(let i=0;i<24;i++){
 const id='L'+String(i+1).padStart(2,'0');
 const l=pronabec.lessons.find(x=>x.id===id);
 assert.ok(l,'Falta sesión '+id);
 assert.ok(l.theory?.length>=3&&l.examples?.length>=3,'Contenido incompleto en '+id);
 assert.equal(pronabec.questions.filter(q=>q.lesson_id===id).length,3,'Banco incompleto en '+id);
}
for(const q of pronabec.questions){
 assert.equal(q.options.length,4,q.id+' requiere 4 alternativas');
 assert.ok(q.options[q.correct_index],q.id+' clave inválida');
 for(let i=0;i<4;i++)assert.ok(q.explanation[keys[i]]?.startsWith(prefixes[i]),'Bloque faltante: '+q.id);
}

const previous=JSON.parse(readFileSync('beca18-examenes-verbal.json','utf8'));
assert.equal(previous.exams.length,3,'Se requieren tres convocatorias');
for(const exam of previous.exams){
 assert.ok([2023,2024,2025].includes(exam.year));
 assert.equal(exam.questions.length,30,'Se requieren 30 preguntas lectoras de '+exam.year);
 const expected=Array.from({length:30},(_,i)=>31+i);
 assert.deepEqual(exam.questions.map(q=>q.number),expected,'Numeración original incompleta: '+exam.year);
 for(const q of exam.questions){
  assert.equal(q.options.length,4,'Alternativas incorrectas en '+q.id);
  assert.ok(q.options.every(x=>typeof x==='string'&&x.trim().length>1),'Opción vacía '+q.id);
  assert.ok(q.statement.length>15,'Enunciado corto '+q.id);
  assert.ok(Number.isInteger(q.correct_index)&&q.correct_index>=0&&q.correct_index<4,'Clave inválida '+q.id);
  assert.ok(exam.groups[q.group]?.passage.length>50,'Falta lectura '+q.id);
 }
}
assert.ok(html.includes('beca18-examenes.html'),'Falta enlace de exámenes desde clases');
const examHtml=readFileSync('beca18-examenes.html','utf8');
const examJs=readFileSync('beca18-examenes.js','utf8');
assert.ok(examHtml.includes('beca18-examenes.js')&&examJs.includes('function evaluate('));
assert.ok(examHtml.includes('id="originalPages"'),'Falta contenedor de páginas originales');
assert.ok(examJs.includes("el('originalPages')"),'La interfaz no muestra las páginas originales');
for (const exam of previous.exams) {
 for (const g of exam.groups) {
  assert.ok(Array.isArray(g.images),'Formato de imágenes incorrecto para lectura '+g.id);
  for (const path of g.images) {
   assert.ok(readFileSync(path).length>5000,'Imagen original ausente o demasiado pequeña: '+path);
  }
 }
}


// Vista de lectura: texto directo seguido de gráficos sin imágenes de página completa.
assert.ok(examHtml.includes('id="readingText"'),'Falta texto transcrito');
assert.ok(examHtml.includes('id="originalPages"'),'Falta contenedor de ilustraciones');
assert.ok(!examHtml.includes('Mostrar transcripción de apoyo (opcional)'),'La transcripción no debe ocultarse tras un desplegable');
assert.ok(examJs.indexOf("el('readingText').textContent")<examJs.indexOf("el('originalPages')"),'El texto debe cargarse antes que las ilustraciones');
const illustrated=previous.exams.flatMap(e=>e.groups.flatMap(g=>g.images||[]));
assert.equal(illustrated.length,6,'Se requieren seis infografías recortadas y no las páginas enteras');
for(const path of illustrated){
 assert.ok(path.startsWith('beca18-illustrations/'),'No mostrar páginas completas: '+path);
 assert.ok(readFileSync(path).length>5000,'Infografía ausente o vacía: '+path);
}
const editorHtml=readFileSync('beca18-editor.html','utf8');
const editorJs=readFileSync('beca18-editor.js','utf8');
assert.ok(examHtml.includes('href="beca18-editor.html"'),'Falta acceso al editor desde exámenes');
assert.ok(editorHtml.includes('id="passage"')&&editorHtml.includes('id="images"'),'Faltan campos de lectura e imágenes');
assert.ok(editorHtml.includes('id="statement"')&&editorHtml.includes('id="correct"'),'Faltan campos de pregunta y clave');
assert.ok(editorHtml.includes('id="markReview"')&&editorHtml.includes('id="markPublished"'),'Faltan acciones de revisión y publicación editorial');
assert.ok(editorHtml.includes('id="download"'),'Falta descargar el JSON revisado');
assert.ok(editorJs.includes("profile?.role!=='admin'"),'El editor debe restringirse a administradores');
assert.ok(editorJs.includes("localStorage.setItem(storeKey"),'Las ediciones deben guardarse como borrador local');
assert.ok(editorJs.includes("JSON.stringify(updated,null,2)"),'Falta exportación de la versión revisada');
assert.ok(editorJs.includes("beca18-illustrations/"),'Solo se permiten ilustraciones, no páginas completas');
assert.ok(!editorJs.includes("SUPABASE_SERVICE_ROLE"),'Nunca introducir secretos del servidor en frontend');
assert.ok(app.includes('Abrir editor de textos, preguntas e imágenes'),'No hay acceso al editor desde Revisión y publicación');
assert.ok(editorHtml.includes('id="readingUpload"'),'Falta carga de imagen para lecturas');
assert.ok(editorHtml.includes('id="questionUpload"'),'Falta carga de imagen en el enunciado');
assert.ok(editorHtml.includes('id="removeReadingImages"')&&editorHtml.includes('id="removeQuestionImage"'),'Faltan controles para eliminar imágenes');
assert.ok(editorJs.includes('async function compressImage('),'Falta compresión automática de imágenes');
assert.ok(editorJs.includes('data:image'),'Falta soporte para imagen incrustada en el archivo exportado');
assert.ok(editorJs.includes('uploadedQuestion'),'Falta almacenar imagen en cada pregunta');
assert.ok(examJs.includes('q.image'),'La vista de estudiante no muestra la imagen del enunciado');
assert.ok(examHtml.includes('.exam-illustration img,.exam-page img{display:block;width:100%'),'La imagen debe ajustarse al contenedor sin scroll horizontal');
assert.ok(examHtml.includes('max-height:none!important;overflow:visible!important'),'No debe haber desplazamiento anidado de lectura');
assert.ok(examHtml.includes('overflow-y:auto!important'),'El texto debe permanecer fijo con desplazamiento independiente');
assert.ok(examHtml.includes('.exam-questions{')&&examHtml.includes('overscroll-behavior:contain'),'Las preguntas deben desplazarse sin mover el texto');
assert.ok(examJs.includes('lastReadingId===g.id'),'No debe reiniciarse la lectura con cada pregunta del mismo bloque');
assert.ok(examJs.includes('IntersectionObserver'),'Al cambiar de bloque debe actualizarse la lectura');
assert.ok(examHtml.includes('id="readingSelect"'),'Falta selector de textos');
assert.ok(examHtml.includes('id="previousReading"')&&examHtml.includes('id="nextReading"'),'Faltan botones para cambiar texto');
assert.ok(examJs.includes('function navigateToGroup('),'Falta navegación por lectura');
assert.ok(examJs.includes('current.groups.map((g,i)'),'La navegación debe mostrar todos los textos');
console.log('VALIDACIÓN BECA 18 CORRECTA:',d.lessons.length,'clases y',d.questions.length,'preguntas originales.');
