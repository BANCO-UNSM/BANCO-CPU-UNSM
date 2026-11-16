'use strict';
const BIB_AREAS={
 'Ciencias y números':['Razonamiento Matemático','Álgebra','Aritmética','Trigonometría','Geometría','Física','Química','Biología'],
 'Letras y humanidades':['Razonamiento Verbal','Cultura General','Educación Cívica','Historia','Geografía','Lenguaje y Literatura','Psicología','Filosofía','Economía']
};
let bibRows=[],bibLoading=false,bibError='',bibArea='Ciencias y números',bibMateria='',bibSemana='',bibFicha='',bibModalidad='CPU-UNSM',bibEditing='',bibCreating=false;
function bibSubjects(){return BIB_AREAS[bibArea]||[];}
const bibNuevosCursos=['Razonamiento Matemático','Álgebra','Historia','Geografía','Lenguaje y Literatura','Filosofía','Economía'];
const bibCursoSlug={'Razonamiento Matemático':'razonamiento-matematico','Álgebra':'algebra','Razonamiento Verbal':'razonamiento-verbal','Educación Cívica':'educacion-civica','Cultura General':'cultura-general','Historia':'historia','Geografía':'geografia','Lenguaje y Literatura':'lenguaje','Filosofía':'filosofia','Economía':'economia'};
let bibVistaArea='';
let bibCursoPreparacion='';
let bibSemanaPreparacion=null;
function listoSemanaBib(){return (bibCursoPreparacion==='Cultura General'&&[1,9,11,12,13].includes(bibSemanaPreparacion))||(bibCursoPreparacion==='Razonamiento Verbal'&&[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].includes(bibSemanaPreparacion))||(bibCursoPreparacion==='Educación Cívica'&&bibSemanaPreparacion>=1&&bibSemanaPreparacion<=16)||(bibNuevosCursos.includes(bibCursoPreparacion)&&bibSemanaPreparacion>=1&&bibSemanaPreparacion<=16)}
const bibRMExtra={
 1:['Calcula mentalmente: 24 × 15.','24 × (10 + 5) = 240 + 120 = 360.'],
 2:['Halla el siguiente término: 3, 7, 11, 15, ...','La diferencia es 4. El siguiente término es 19.'],
 3:['Halla la suma: 4 + 8 + 12 + 16 + 20.','Hay 5 términos. S = (4 + 20) × 5 ÷ 2 = 60.'],
 4:['Si a ★ b = 2a + 3b, calcula 4 ★ 5.','2 × 4 + 3 × 5 = 8 + 15 = 23.'],
 5:['Tres números están en razón 2:3:4 y suman 81. Halla el mayor.','2k + 3k + 4k = 81; k = 9. Mayor: 4k = 36.'],
 6:['Una máquina termina una tarea en 8 horas y otra en 12. ¿Cuánto tardan juntas?','1/T = 1/8 + 1/12 = 5/24; T = 24/5 horas.'],
 7:['Un artículo de S/ 180 tiene descuento de 20 %. ¿Cuál es su precio final?','Descuento = 180 × 20/100 = 36. Precio = 180 − 36 = S/ 144.'],
 9:['Si compro 5 cuadernos me sobran S/ 8; si compro 7 me faltan S/ 10. ¿Cuánto cuesta cada uno?','Dos cuadernos adicionales requieren 8 + 10 = 18 soles; cada uno cuesta S/ 9.'],
 10:['Repaso: calcula el 25 % de 320.','320 × 25/100 = 80.'],
 11:['Si 4 obreros realizan un trabajo en 15 días, ¿cuánto tardan 6 obreros al mismo ritmo?','Magnitudes inversas: 4 × 15 = 6 × t; t = 10 días.'],
 12:['¿Qué ángulo menor forman las manecillas a las 3:00?','Minutero: 0°. Horario: 90°. Ángulo menor: 90°.'],
 13:['Dos móviles se acercan desde puntos separados 210 km a 60 y 45 km/h. ¿Cuándo se encuentran?','Velocidad de acercamiento = 60 + 45 = 105 km/h; t = 210/105 = 2 h.'],
 14:['Un cuadrado de 10 cm de lado contiene otro de 6 cm de lado. Halla el área entre ambos.','Área sombreada = 10² − 6² = 100 − 36 = 64 cm².'],
 15:['¿De cuántas maneras se puede elegir a 2 delegados entre 5 estudiantes?','C(5,2) = 5!/(2!3!) = 10 maneras.'],
 16:['Repaso: elige 3 representantes de 6 estudiantes. ¿Cuántos grupos hay?','C(6,3) = 6!/(3!3!) = 20 grupos.']
};
function bibRMContenido(){
 const ficha=bibRows.find(f=>f.materia==='Razonamiento Matemático'&&Number(f.semana)===Number(bibSemanaPreparacion)&&f.modalidad==='CPU-UNSM');
 if(!ficha)return '<div class="card"><p class="muted">'+(bibLoading?'Cargando el marco teórico...':bibError?'No se pudo cargar el marco teórico. '+esc(bibError):'Esta semana todavía no tiene una ficha teórica publicada.')+'</p></div>';
 const bloque=(titulo,valor)=>'<section class="card" style="margin-top:14px"><h3>'+titulo+'</h3><div class="bib-rm-math" style="white-space:pre-wrap;line-height:1.9;overflow-wrap:anywhere">'+esc(valor||'Pendiente de ampliación')+'</div></section>';
 const extra=bibRMExtra[Number(bibSemanaPreparacion)];
 const memoria='<section class="card" style="margin-top:14px"><h3>07 · Repaso de fórmulas y ejercicio nuevo</h3><p class="muted">Repasa las propiedades de esta semana y practica con un ejercicio adicional creado para la lección, distinto del ejemplo teórico.</p><details><summary style="cursor:pointer;font-weight:700">Recordar las fórmulas</summary><div class="bib-rm-math" style="white-space:pre-wrap;overflow-x:auto;margin-top:12px">'+esc(ficha.formulas||'Pendiente de ampliación')+'</div></details>'+(extra?'<p style="margin-top:16px"><strong>Reto adicional:</strong> '+esc(extra[0])+'</p><details><summary style="cursor:pointer;color:#0b7362;font-weight:700">Ver solución explicada</summary><p>'+esc(extra[1])+'</p></details>':'')+'</section>';
 const separata='<section class="card" style="margin-top:14px"><h3>08 · Separata de la semana '+bibSemanaPreparacion+'</h3><p class="muted">Consulta las preguntas correspondientes a esta semana. No se sustituyen las preguntas oficiales por ejercicios inventados.</p><button type="button" class="secondary" id="bibRMSeparata">Ver separata y preguntas de la semana</button></section>';
 return '<div class="card"><h3>'+esc(ficha.tema||('Semana '+bibSemanaPreparacion))+'</h3><p>'+esc(ficha.resumen||'')+'</p>'+bloque('01 · Marco teórico',ficha.teoria)+bloque('02 · Fórmulas y propiedades',ficha.formulas)+bloque('03 · Ejemplos resueltos',ficha.ejemplo)+bloque('04 · Errores frecuentes',ficha.errores)+bloque('05 · Claves para recordar',ficha.claves)+bloque('06 · Comprueba lo aprendido','Explica con tus palabras cuándo se utiliza cada propiedad y verifica los pasos del ejemplo resuelto.')+memoria+separata+'</div>';
}
function bibPage(){
 if(bibCursoPreparacion){
  const nombre=esc(bibCursoPreparacion);
  const semanas=Array.from({length:16},(_,i)=>{const n=i+1,repaso=(n===10||n===16)||(bibCursoPreparacion==='Educación Cívica'&&n===8),listo=(bibCursoPreparacion==='Cultura General'?[1,9,11,12,13]:(bibCursoPreparacion==='Razonamiento Verbal'||bibCursoPreparacion==='Educación Cívica'||bibNuevosCursos.includes(bibCursoPreparacion))?[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]:[]).includes(n);return '<button type="button" class="secondary" data-bib-semana="'+n+'" aria-pressed="'+(bibSemanaPreparacion===n)+'" style="min-height:74px;border-radius:12px;padding:12px;background:'+(bibSemanaPreparacion===n?'#dceef8':listo?'#e8f8f2':'#f4f8fc')+';color:#163b58"><strong>Semana '+n+'</strong><small style="display:block;margin-top:5px">'+(listo?(repaso?'Ver repaso':'Ver lección'):repaso?'Repaso · En preparación':'En preparación')+'</small></button>'}).join('');
  return '<div class="card"><button type="button" class="secondary" id="bibVolverCursos">← Volver a los cursos</button><h2 style="margin-top:20px">📚 '+nombre+' · Lecciones interactivas</h2><p class="muted">Ciclo CPU-UNSM · 16 semanas. Las semanas de repaso se organizarán según la programación oficial del curso.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin:22px 0">'+semanas+'</div>'+(bibCursoPreparacion==='Razonamiento Matemático'&&bibSemanaPreparacion?bibRMContenido():listoSemanaBib()?'<div class="card"><h3>Semana '+bibSemanaPreparacion+' · '+nombre+'</h3><p class="muted">Lección interactiva con teoría y práctica de aprendizaje. En Álgebra: fórmulas matemáticas y ejemplos.</p><iframe title="'+nombre+' semana '+bibSemanaPreparacion+'" src="pilotos/'+bibCursoSlug[bibCursoPreparacion]+'-semana-'+bibSemanaPreparacion+'.html?v=39" style="width:100%;height:76vh;min-height:600px;border:1px solid #d7e5f1;border-radius:14px;background:white" loading="lazy"></iframe>'+((bibCursoPreparacion==='Filosofía'&&bibSemanaPreparacion===14)||bibCursoPreparacion==='Álgebra'?'':`<div class="actions" style="margin-top:12px"><button type="button" class="secondary" id="bibPracticeSelected">✏️ Practicar preguntas de esta semana</button></div>`)+'</div>':bibSemanaPreparacion?'<div class="listitem"><h3>Semana '+bibSemanaPreparacion+' · En preparación</h3><p>Esta lección se desarrollará a partir de las separatas y preguntas registradas de Cultura General, sin asignar temas de otros cursos.</p></div>':'<p class="muted">Selecciona una semana para consultar su estado.</p>')+'</div>';
 }
 const area=bibVistaArea;
 const boton=(nombre,activo)=>'<button type="button" class="secondary" data-bib-curso="'+esc(nombre)+'" '+(activo?'id="bibAbrirPsicologia"':nombre==='Cultura General'?'id="bibAbrirCultura"':nombre==='Razonamiento Verbal'?'id="bibAbrirVerbal"':nombre==='Educación Cívica'?'id="bibAbrirCivica"':'')+' style="min-height:72px;text-align:left;padding:16px;border-radius:12px;width:100%"><strong>'+esc(nombre)+'</strong><small style="display:block;margin-top:6px">'+(activo?'Abrir lecciones interactivas':(nombre==='Cultura General'||nombre==='Razonamiento Verbal'||nombre==='Educación Cívica'||bibNuevosCursos.includes(nombre))?'Abrir lecciones interactivas':'Próximamente')+'</small></button>';
 if(!area)return '<div class="card"><h2>📚 Lecciones interactivas</h2><p class="muted">Selecciona un área para explorar los cursos y sus lecciones organizadas por semanas.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;margin-top:22px"><button type="button" data-bib-area="Ciencias y números" style="padding:28px 18px;min-height:170px;border-radius:16px;text-align:center"><span style="font-size:36px;display:block;margin-bottom:14px">🔬</span><strong style="font-size:22px">Ciencias</strong><span style="display:block;margin-top:9px;font-size:13px">Matemática, Física, Química y más</span></button><button type="button" data-bib-area="Letras y humanidades" style="padding:28px 18px;min-height:170px;border-radius:16px;text-align:center"><span style="font-size:36px;display:block;margin-bottom:14px">📖</span><strong style="font-size:22px">Letras</strong><span style="display:block;margin-top:9px;font-size:13px">Psicología, Filosofía, Historia y más</span></button></div></div>';
 const materias=BIB_AREAS[area]||[];
 return '<div class="card"><button type="button" class="secondary" id="bibVolverAreas">← Volver a Ciencias y Letras</button><h2 style="margin-top:18px">Lecciones interactivas · '+(area==='Ciencias y números'?'Ciencias':'Letras')+'</h2><p class="muted">Selecciona un curso para acceder a sus lecciones por semana.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin-top:18px">'+materias.map(m=>boton(m,m==='Psicología')).join('')+'</div></div>';
}
async function bibLoad(){
 bibLoading=true;bibError='';
 try{
  const {data,error}=await db.from('biblioteca_fichas').select('*').order('semana',{ascending:true}).order('tema',{ascending:true}).limit(1000);
  if(error)throw error;
  bibRows=data||[];
 }catch(e){bibError='No se pudo cargar la biblioteca: '+e.message;}
 finally{bibLoading=false;if(page==='biblioteca')render();}
}
function bibBind(){
 $('bibRMSeparata')?.addEventListener('click',()=>{if(typeof window.cachimbolabPracticeLesson==='function')window.cachimbolabPracticeLesson('Razonamiento Matemático',bibSemanaPreparacion);else alert('La separata de esta semana todavía no está disponible en el banco de preguntas.');});
 if(page!=='biblioteca'||bibliotecaLeccionesVista)return;
 document.querySelectorAll('[data-bib-area]').forEach(b=>b.addEventListener('click',()=>{bibVistaArea=b.dataset.bibArea;render()}));
 $('bibVolverAreas')?.addEventListener('click',()=>{bibVistaArea='';render()});
 $('bibAbrirVerbal')?.addEventListener('click',()=>{bibCursoPreparacion='Razonamiento Verbal';bibSemanaPreparacion=null;render()});
 $('bibAbrirCivica')?.addEventListener('click',()=>{bibCursoPreparacion='Educación Cívica';bibSemanaPreparacion=null;render()});
 $('bibAbrirCultura')?.addEventListener('click',()=>{bibCursoPreparacion='Cultura General';bibSemanaPreparacion=null;render()});
 $('bibPracticeSelected')?.addEventListener('click',()=>window.cachimbolabPracticeLesson?.(bibCursoPreparacion,bibSemanaPreparacion));
 $('bibVolverCursos')?.addEventListener('click',()=>{bibCursoPreparacion='';bibSemanaPreparacion=null;render()});
 document.querySelectorAll('[data-bib-semana]').forEach(b=>b.addEventListener('click',()=>{bibSemanaPreparacion=Number(b.dataset.bibSemana);window.cachimbolabRememberCPU?.(bibCursoPreparacion,bibSemanaPreparacion);render();if(bibCursoPreparacion==='Razonamiento Matemático'&&!bibRows.length)bibLoad()}));
 document.querySelectorAll('[data-bib-curso]:not(#bibAbrirPsicologia):not(#bibAbrirCultura):not(#bibAbrirVerbal):not(#bibAbrirCivica)').forEach(b=>b.addEventListener('click',()=>{if(bibNuevosCursos.includes(b.dataset.bibCurso)){bibCursoPreparacion=b.dataset.bibCurso;bibSemanaPreparacion=null;render();if(bibCursoPreparacion==='Razonamiento Matemático')bibLoad();return;}alert('Las lecciones de '+b.dataset.bibCurso+' se incorporarán próximamente.')}));
}
