'use strict';
const BIB_AREAS={
 'Ciencias y números':['Razonamiento Matemático','Álgebra','Aritmética','Trigonometría','Geometría','Física','Química','Biología'],
 'Letras y humanidades':['Razonamiento Verbal','Cultura General','Educación Cívica','Historia','Geografía','Lenguaje y Literatura','Psicología','Filosofía','Economía']
};
let bibRows=[],bibLoading=false,bibError='',bibArea='Ciencias y números',bibMateria='',bibSemana='',bibFicha='',bibModalidad='CPU-UNSM',bibEditing='',bibCreating=false;
function bibSubjects(){return BIB_AREAS[bibArea]||[];}
const bibNuevosCursos=['Aritmética','Razonamiento Matemático','Álgebra','Historia','Geografía','Lenguaje y Literatura','Filosofía','Economía'];
const bibCursoSlug={'Aritmética':'aritmetica','Razonamiento Matemático':'razonamiento-matematico','Álgebra':'algebra','Razonamiento Verbal':'razonamiento-verbal','Educación Cívica':'educacion-civica','Cultura General':'cultura-general','Historia':'historia','Geografía':'geografia','Lenguaje y Literatura':'lenguaje','Filosofía':'filosofia','Economía':'economia'};
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
function bibDiagramaVenn(){
 return '<section class="card" style="margin-top:14px"><h3>Diagrama de Venn · Ejemplo visual</h3><p>En un salón de 40 estudiantes: 24 juegan fútbol, 18 vóley y 10 ambos. Observa cómo se distribuyen las cuatro regiones.</p><svg viewBox="0 0 650 330" role="img" aria-label="Diagrama de Venn: solo fútbol 14, ambos 10, solo vóley 8, ninguno 8" style="width:100%;max-width:700px;display:block;margin:auto;background:#f7fbff;border-radius:12px"><rect x="22" y="24" width="606" height="280" rx="18" fill="#f0f6ff" stroke="#6684a2" stroke-width="2"/><text x="44" y="52" font-size="20" font-weight="bold" fill="#173952">U = 40</text><circle cx="265" cy="164" r="111" fill="#76b9ed" fill-opacity=".42" stroke="#236aa7" stroke-width="3"/><circle cx="386" cy="164" r="111" fill="#f8bb73" fill-opacity=".43" stroke="#c17a22" stroke-width="3"/><g fill="#173952" font-family="Arial,sans-serif" text-anchor="middle"><text x="223" y="94" font-size="17" font-weight="bold">Fútbol</text><text x="429" y="94" font-size="17" font-weight="bold">Vóley</text><text x="222" y="176" font-size="34" font-weight="bold">14</text><text x="326" y="176" font-size="34" font-weight="bold">10</text><text x="430" y="176" font-size="34" font-weight="bold">8</text><text x="553" y="265" font-size="18">Ninguno: 8</text></g></svg><p><strong>Cómo se resuelve:</strong> primero se coloca 10 en la intersección. Luego, solo fútbol = 24 − 10 = 14; solo vóley = 18 − 10 = 8. Finalmente, ninguno = 40 − (14 + 10 + 8) = 8.</p><p class="muted">Cada número representa una región diferente. La suma 14 + 10 + 8 + 8 = 40 comprueba el resultado.</p></section>';
}

function bibAritEsc(v){return esc(String(v??''))}
function bibAritMath(v){
 const normalized=String(v||'').replace(/\\\\(?=[a-zA-Z])/g,'\\');
 return normalized.split(/(\$\$[\s\S]*?\$\$)/g).map(p=>{
  if(p.startsWith('$$')&&p.endsWith('$$')){
   const tex=p.slice(2,-2);
   try{if(window.katex)return '<div class="arit-formula">'+window.katex.renderToString(tex,{displayMode:true,throwOnError:false})+'</div>'}catch(e){}
   return '<div class="arit-formula">'+bibAritEsc(tex)+'</div>';
  }
  return bibAritEsc(p);
 }).join('');
}
function bibAritTextBlocks(value,kind){
 const raw=String(value||'');
 const lines=raw.split(/\r?\n/);
 const chunks=[];let current=null;
 const isHeading=(t)=>kind==='theory'?/^\d{1,2}\.\s+\S/.test(t):kind==='formula'?/^[A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ\s\-]+$/.test(t)&&t.length<65:/^EJEMPLO\s+\d+/i.test(t);
 for(const line of lines){
  const t=line.trim();
  if(isHeading(t)){if(current)chunks.push(current);current={heading:t,body:[]}}
  else{if(!current)current={heading:'',body:[]};current.body.push(line)}
 }
 if(current)chunks.push(current);
 if(chunks.length===1&&!chunks[0].heading&&kind==='theory'){
  const paragraphs=raw.split(/\n\s*\n/).filter(Boolean);
  return paragraphs.map(p=>'<p class="arit-paragraph">'+bibAritMath(p)+'</p>').join('');
 }
 return chunks.map((c,i)=>{
  const title=c.heading?'<h4>'+bibAritEsc(c.heading)+'</h4>':'';
  const body=c.body.join('\n').trim().split(/\n\s*\n/).filter(Boolean).map(p=>'<div class="arit-paragraph">'+bibAritMath(p).replace(/\n/g,'<br>')+'</div>').join('');
  return '<article class="arit-topic">'+title+body+'</article>';
 }).join('');
}
function bibAritLesson(ficha){
 const w=Number(bibSemanaPreparacion);
 const sections=[
  ['01','Marco teórico','Descubre los conceptos fundamentales'],
  ['02','Fórmulas y propiedades','Aprende a identificar y aplicar cada fórmula'],
  ['03','Ejemplos resueltos','Sigue el procedimiento paso a paso'],
  ['04','Errores frecuentes','Evita las confusiones más comunes'],
  ['05','Claves para recordar','Consolida lo aprendido'],
  ['06','Tarjetas de memoria','Repasa los conceptos esenciales'],
  ['07','Reto de aprendizaje','Comprueba lo que sabes'],
  ['08','Preguntas CPU','Practica con las preguntas de la semana']
 ];
 const card=(n,content)=>'<section class="arit-card" id="arit-p'+n+'"><span class="arit-eyebrow">'+sections[Number(n)-1][0]+' · '+sections[Number(n)-1][1].toUpperCase()+'</span><h3>'+sections[Number(n)-1][2]+'</h3>'+content+'</section>';
 const vennInteract=w===1?'<div class="arit-interactive"><h4>Explora el diagrama de Venn</h4><p>Selecciona una región para descubrir qué representa.</p><div class="arit-venn-controls"><button type="button" data-arit-venn="soloA">Solo fútbol</button><button type="button" data-arit-venn="ambos">Ambos</button><button type="button" data-arit-venn="soloB">Solo vóley</button><button type="button" data-arit-venn="ninguno">Ninguno</button></div><p class="arit-venn-result" aria-live="polite">Elige una región para comprobar cómo se cuentan los estudiantes.</p></div>':'';
 const intro=card(1,bibAritTextBlocks(ficha.teoria,'theory')+(w===1?bibDiagramaVenn()+vennInteract:''));
 const formulas=card(2,bibAritTextBlocks(ficha.formulas,'formula'));
 const ejemplos=card(3,bibAritTextBlocks(ficha.ejemplo,'example'));
 const errores=card(4,'<p class="arit-paragraph">'+bibAritMath(ficha.errores||'Identifica el tipo de problema y comprueba tus operaciones.')+'</p>');
 const claves=card(5,'<p class="arit-paragraph">'+bibAritMath(ficha.claves||'Identifica los datos, selecciona la propiedad adecuada y comprueba el resultado.')+'</p>');
 const memoria=card(6,'<p>Intenta recordar las fórmulas antes de abrir cada respuesta.</p><details class="arit-memory"><summary>Mostrar las fórmulas para recordar</summary>'+bibAritTextBlocks(ficha.formulas,'formula')+'</details>');
 const retos=w===1?[['Si A tiene 5 elementos, ¿cuántos subconjuntos tiene?',['10','25','32','31'],2,'El número total es 2⁵ = 32.'],['Si 20 alumnos estudian inglés, 12 francés y 5 ambos, ¿cuántos estudian al menos uno?',['27','32','37','17'],0,'Se aplica 20 + 12 − 5 = 27.']]:[['Si una letra de S/ 1000 se descuenta al 2 % mensual durante 3 meses, ¿cuánto es el descuento comercial?',['S/ 20','S/ 60','S/ 120','S/ 600'],1,'D = 1000 × 2 × 3 / 100 = S/ 60.']];
 const reto=card(7,'<p>Resuelve estos ejercicios nuevos, distintos de las preguntas de la separata.</p>'+retos.map((r,i)=>'<div class="arit-quiz" data-answer="'+r[2]+'"><strong>'+bibAritEsc(r[0])+'</strong><div class="arit-quiz-options">'+r[1].map((opt,j)=>'<button type="button" data-arit-choice="'+j+'">'+String.fromCharCode(65+j)+') '+bibAritEsc(opt)+'</button>').join('')+'</div><p class="arit-quiz-feedback" hidden aria-live="polite">'+bibAritEsc(r[3])+'</p></div>').join(''));
 const practica=card(8,'<iframe title="Práctica CPU · Aritmética semana '+w+'" src="pilotos/aritmetica-practica.html?week='+w+'&v=3" style="width:100%;height:78vh;min-height:660px;border:1px solid #d7e5f1;border-radius:14px;background:white" loading="eager"></iframe>');
 return '<div class="arit-lesson"><style>'+
 '.arit-lesson{background:#eef5fb;padding:18px 12px;border-radius:16px;color:#153a57;font-family:system-ui,sans-serif}.arit-hero{max-width:790px;margin:0 auto 14px;padding:26px 22px;background:linear-gradient(115deg,#195376,#348cb3);border-radius:15px;color:#fff}.arit-hero h2{font-size:clamp(24px,3vw,34px);margin:18px 0 10px;color:#fff}.arit-hero p{color:#fff;margin:0;line-height:1.6}.arit-chip{display:inline-block;background:#def9ec;color:#006c58;border-radius:20px;padding:7px 12px;font-size:12px;font-weight:800}.arit-nav{max-width:790px;margin:0 auto 18px;display:flex;flex-wrap:wrap;gap:7px}.arit-nav a{border:1px solid #c6e2f4;background:white;color:#164a72;border-radius:8px;padding:10px 12px;text-decoration:none;font-size:12px;font-weight:700}.arit-card{max-width:790px;margin:16px auto;background:white;border:1px solid #d1e3f2;border-radius:16px;padding:22px;box-shadow:0 4px 13px rgba(29,72,105,.04);scroll-margin-top:15px}.arit-card h3{font-size:21px;color:#133b58;margin:13px 0 20px}.arit-eyebrow{display:inline-block;background:#dcf7e8;color:#006b56;border-radius:30px;padding:7px 12px;font-size:11px;font-weight:800}.arit-topic{border-top:1px solid #e5eef5;padding:15px 0}.arit-topic:first-of-type{border-top:0}.arit-topic h4{font-size:16px;margin:2px 0 12px;color:#0f4668}.arit-paragraph{line-height:1.85;margin:10px 0 16px;white-space:normal;overflow-wrap:anywhere}.arit-formula{background:#f0f6fc;border-radius:10px;margin:12px 0;padding:15px 10px;max-width:100%;overflow-x:auto;text-align:center}.arit-formula .katex-display{margin:0}.arit-memory{padding:14px;border:1px solid #d1e3f2;border-radius:10px}.arit-memory summary{cursor:pointer;font-weight:700;color:#087f79}@media(max-width:650px){.arit-lesson{padding:10px 6px}.arit-card{padding:15px}.arit-hero{padding:22px 16px}.arit-nav a{padding:8px 9px}}'+
 '</style><div class="arit-hero"><span class="arit-chip">ARITMÉTICA · SEMANA '+w+' · LECCIÓN INTERACTIVA</span><h2>'+bibAritEsc(ficha.tema||'Lección de Aritmética')+'</h2><p>Aprende los conceptos, interpreta las fórmulas y practica paso a paso.</p></div>'+
 '<nav class="arit-nav" aria-label="Secciones de la lección">'+sections.map((x,i)=>'<button type="button" data-arit-tab="'+(i+1)+'" aria-pressed="'+(i===0?'true':'false')+'">'+x[0]+' · '+(i===7?'CPU':i===5?'Memoria':i===6?'Reto':'Estudia')+'</button>').join('')+'</nav>'+
 intro+formulas+ejemplos+errores+claves+memoria+reto+practica+'</div>';
}
function bibBindAritInteract(){
 const lesson=document.querySelector('.arit-lesson');if(!lesson)return;
 lesson.querySelectorAll('[data-arit-tab]').forEach(button=>button.addEventListener('click',()=>{
  const tab=Number(button.dataset.aritTab);
  lesson.querySelectorAll('[data-arit-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  lesson.querySelectorAll('.arit-card').forEach(card=>card.hidden=card.id!=='arit-p'+tab);
  lesson.querySelector('.arit-hero')?.scrollIntoView({block:'start',behavior:'smooth'});
 }));
 const explanations={soloA:'Solo fútbol: 24 − 10 = 14 estudiantes.',ambos:'Ambos deportes: 10 estudiantes, que se colocan primero en la intersección.',soloB:'Solo vóley: 18 − 10 = 8 estudiantes.',ninguno:'Ninguno: 40 − (14 + 10 + 8) = 8 estudiantes.'};
 lesson.querySelectorAll('[data-arit-venn]').forEach(b=>b.addEventListener('click',()=>{const el=lesson.querySelector('.arit-venn-result');if(el)el.textContent=explanations[b.dataset.aritVenn]}));
 lesson.querySelectorAll('[data-arit-choice]').forEach(b=>b.addEventListener('click',()=>{
  const quiz=b.closest('.arit-quiz');if(quiz.dataset.done)return;quiz.dataset.done='true';
  const hit=Number(b.dataset.aritChoice)===Number(quiz.dataset.answer);
  b.classList.add(hit?'arit-correct':'arit-wrong');
  quiz.querySelectorAll('button').forEach(btn=>{btn.disabled=true;if(Number(btn.dataset.aritChoice)===Number(quiz.dataset.answer))btn.classList.add('arit-correct')});
  const feedback=quiz.querySelector('.arit-quiz-feedback');feedback.hidden=false;feedback.prepend(document.createTextNode(hit?'✓ ¡Correcto! ':'✗ Revisa el procedimiento. '));
 }));
}
function bibFormatoEcuaciones(valor){return bibAritMath(valor)}
function bibRMContenido(){
 const esAritmetica=bibCursoPreparacion==='Aritmética';
 const ficha=bibRows.find(f=>f.materia===(esAritmetica?'Aritmética':'Razonamiento Matemático')&&Number(f.semana)===Number(bibSemanaPreparacion)&&f.modalidad==='CPU-UNSM');
 if(!ficha)return '<div class="card"><p class="muted">'+(bibLoading?'Cargando el marco teórico...':bibError?'No se pudo cargar el marco teórico. '+esc(bibError):'Esta semana todavía no tiene una ficha teórica publicada.')+'</p></div>';
 if(esAritmetica)return bibAritLesson(ficha);
 const bloque=(titulo,valor)=>'<section class="card" style="margin-top:14px"><h3>'+titulo+'</h3><div class="bib-rm-math" style="white-space:pre-wrap;line-height:1.9;overflow-wrap:anywhere">'+bibFormatoEcuaciones(valor)+'</div></section>';
 const extra=bibRMExtra[Number(bibSemanaPreparacion)];
 const memoria='<section class="card" style="margin-top:14px"><h3>07 · Repaso de fórmulas y ejercicio nuevo</h3><p class="muted">Repasa las propiedades de esta semana y practica con un ejercicio adicional creado para la lección, distinto del ejemplo teórico.</p><details><summary style="cursor:pointer;font-weight:700">Recordar las fórmulas</summary><div class="bib-rm-math" style="white-space:pre-wrap;overflow-x:auto;margin-top:12px">'+bibFormatoEcuaciones(ficha.formulas)+'</div></details>'+(extra?'<p style="margin-top:16px"><strong>Reto adicional:</strong> '+esc(extra[0])+'</p><details><summary style="cursor:pointer;color:#0b7362;font-weight:700">Ver solución explicada</summary><p>'+esc(extra[1])+'</p></details>':'')+'</section>';
 const separata='<section class="card" style="margin-top:14px"><h3>08 · Separata de la semana '+bibSemanaPreparacion+'</h3><p class="muted">Preguntas originales publicadas de la semana, con alternativas y explicación. Se muestran aquí mismo, sin abrir otra pantalla.</p><iframe title="Razonamiento Matemático semana '+bibSemanaPreparacion+'" src="pilotos/razonamiento-matematico-practica.html?week='+bibSemanaPreparacion+'&v=3" style="width:100%;height:78vh;min-height:660px;border:1px solid #d7e5f1;border-radius:14px;background:white" loading="eager"></iframe></section>';
 return '<div class="card"><h3>'+esc(ficha.tema||('Semana '+bibSemanaPreparacion))+'</h3><p>'+esc(ficha.resumen||'')+'</p>'+bloque('01 · Marco teórico',ficha.teoria)+bloque('02 · Fórmulas y propiedades',ficha.formulas)+bloque('03 · Ejemplos resueltos',ficha.ejemplo)+bloque('04 · Errores frecuentes',ficha.errores)+bloque('05 · Claves para recordar',ficha.claves)+bloque('06 · Comprueba lo aprendido','Explica con tus palabras cuándo se utiliza cada propiedad y verifica los pasos del ejemplo resuelto.')+memoria+separata+'</div>';
}
function bibPage(){
 if(bibCursoPreparacion){
  const nombre=esc(bibCursoPreparacion);
  const semanas=Array.from({length:16},(_,i)=>{const n=i+1,repaso=(n===10||n===16)||(bibCursoPreparacion==='Educación Cívica'&&n===8),listo=(bibCursoPreparacion==='Cultura General'?[1,9,11,12,13]:(bibCursoPreparacion==='Razonamiento Verbal'||bibCursoPreparacion==='Educación Cívica'||bibNuevosCursos.includes(bibCursoPreparacion))?[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]:[]).includes(n);return '<button type="button" class="secondary" data-bib-semana="'+n+'" aria-pressed="'+(bibSemanaPreparacion===n)+'" style="min-height:74px;border-radius:12px;padding:12px;background:'+(bibSemanaPreparacion===n?'#dceef8':listo?'#e8f8f2':'#f4f8fc')+';color:#163b58"><strong>Semana '+n+'</strong><small style="display:block;margin-top:5px">'+(listo?(repaso?'Ver repaso':'Ver lección'):repaso?'Repaso · En preparación':'En preparación')+'</small></button>'}).join('');
  return '<div class="card"><button type="button" class="secondary" id="bibVolverCursos">← Volver a los cursos</button><h2 style="margin-top:20px">📚 '+nombre+' · Lecciones interactivas</h2><p class="muted">Ciclo CPU-UNSM · 16 semanas. Las semanas de repaso se organizarán según la programación oficial del curso.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin:22px 0">'+semanas+'</div>'+((bibCursoPreparacion==='Razonamiento Matemático'||bibCursoPreparacion==='Aritmética')&&bibSemanaPreparacion?bibRMContenido():listoSemanaBib()?'<div class="card"><h3>Semana '+bibSemanaPreparacion+' · '+nombre+'</h3><p class="muted">Lección interactiva con teoría y práctica de aprendizaje. En Álgebra: fórmulas matemáticas y ejemplos.</p><iframe title="'+nombre+' semana '+bibSemanaPreparacion+'" src="pilotos/'+bibCursoSlug[bibCursoPreparacion]+'-semana-'+bibSemanaPreparacion+'.html?v=39" style="width:100%;height:76vh;min-height:600px;border:1px solid #d7e5f1;border-radius:14px;background:white" loading="lazy"></iframe>'+(bibNuevosCursos.includes(bibCursoPreparacion)||bibCursoPreparacion==='Filosofía'&&bibSemanaPreparacion===14?'':`<div class="actions" style="margin-top:12px"><button type="button" class="secondary" id="bibPracticeSelected">✏️ Practicar preguntas de esta semana</button></div>`)+'</div>':bibSemanaPreparacion?'<div class="listitem"><h3>Semana '+bibSemanaPreparacion+' · En preparación</h3><p>Esta lección se desarrollará a partir de las separatas y preguntas registradas de Cultura General, sin asignar temas de otros cursos.</p></div>':'<p class="muted">Selecciona una semana para consultar su estado.</p>')+'</div>';
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
 bibBindAritInteract();

 if(page!=='biblioteca'||bibliotecaLeccionesVista)return;
 document.querySelectorAll('[data-bib-area]').forEach(b=>b.addEventListener('click',()=>{bibVistaArea=b.dataset.bibArea;render()}));
 $('bibVolverAreas')?.addEventListener('click',()=>{bibVistaArea='';render()});
 $('bibAbrirVerbal')?.addEventListener('click',()=>{bibCursoPreparacion='Razonamiento Verbal';bibSemanaPreparacion=null;render()});
 $('bibAbrirCivica')?.addEventListener('click',()=>{bibCursoPreparacion='Educación Cívica';bibSemanaPreparacion=null;render()});
 $('bibAbrirCultura')?.addEventListener('click',()=>{bibCursoPreparacion='Cultura General';bibSemanaPreparacion=null;render()});
 $('bibPracticeSelected')?.addEventListener('click',()=>window.cachimbolabPracticeLesson?.(bibCursoPreparacion,bibSemanaPreparacion));
 $('bibVolverCursos')?.addEventListener('click',()=>{bibCursoPreparacion='';bibSemanaPreparacion=null;render()});
 document.querySelectorAll('[data-bib-semana]').forEach(b=>b.addEventListener('click',()=>{bibSemanaPreparacion=Number(b.dataset.bibSemana);window.cachimbolabRememberCPU?.(bibCursoPreparacion,bibSemanaPreparacion);render();if((bibCursoPreparacion==='Razonamiento Matemático'||bibCursoPreparacion==='Aritmética')&&!bibRows.length)bibLoad()}));
 document.querySelectorAll('[data-bib-curso]:not(#bibAbrirPsicologia):not(#bibAbrirCultura):not(#bibAbrirVerbal):not(#bibAbrirCivica)').forEach(b=>b.addEventListener('click',()=>{if(bibNuevosCursos.includes(b.dataset.bibCurso)){bibCursoPreparacion=b.dataset.bibCurso;bibSemanaPreparacion=null;render();if(bibCursoPreparacion==='Razonamiento Matemático'||bibCursoPreparacion==='Aritmética')bibLoad();return;}alert('Las lecciones de '+b.dataset.bibCurso+' se incorporarán próximamente.')}));
}
