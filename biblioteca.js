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
function bibAritFormulaCards(w,original){
 const formulas={
 1:[['Unión de conjuntos',String.raw`A\cup B=\{x:x\in A\ \text{o}\ x\in B\}`],['Intersección',String.raw`A\cap B=\{x:x\in A\ \text{y}\ x\in B\}`],['Dos conjuntos',String.raw`n(A\cup B)=n(A)+n(B)-n(A\cap B)`],['Tres conjuntos',String.raw`n(A\cup B\cup C)=n(A)+n(B)+n(C)-n(A\cap B)-n(A\cap C)-n(B\cap C)+n(A\cap B\cap C)`],['Subconjuntos',String.raw`N=2^n,\qquad N_{\text{propios}}=2^n-1`],['Subconjuntos de k elementos',String.raw`\binom nk=\frac{n!}{k!(n-k)!}`]],
 2:[['Valor posicional',String.raw`\overline{abc}_{(b)}=a\cdot b^2+b\cdot b+c`]],
 3:[['Algoritmo de división',String.raw`D=dq+r,\qquad 0\le r<d`]],
 4:[['Divisibilidad',String.raw`3\mid N\iff 3\mid\text{suma de sus cifras}`],['Divisibilidad por 9',String.raw`9\mid N\iff 9\mid\text{suma de sus cifras}`]],
 5:[['Número de divisores',String.raw`N=p^a q^b\Rightarrow d(N)=(a+1)(b+1)`]],
 6:[['Relación MCD y MCM',String.raw`a\cdot b=\operatorname{MCD}(a,b)\cdot\operatorname{MCM}(a,b)`]],
 7:[['Suma de fracciones',String.raw`\frac ab+\frac cd=\frac{ad+bc}{bd}`],['Multiplicación',String.raw`\frac ab\cdot\frac cd=\frac{ac}{bd}`],['División',String.raw`\frac ab\div\frac cd=\frac{ad}{bc}`]],
 8:[['Conteo de conjuntos',String.raw`n(A\cup B)=n(A)+n(B)-n(A\cap B)`],['MCD y MCM',String.raw`a\cdot b=\operatorname{MCD}(a,b)\operatorname{MCM}(a,b)`]],
 9:[['Proporción',String.raw`\frac ab=\frac cd\Longrightarrow ad=bc`],['Proporción continua',String.raw`\frac ab=\frac bc\Longrightarrow b^2=ac`]],
 10:[['Proporcionalidad directa',String.raw`y=kx`],['Proporcionalidad inversa',String.raw`xy=k`],['Reparto proporcional',String.raw`P_i=\frac{T\cdot p_i}{\sum p_i}`]],
 11:[['Regla de tres directa',String.raw`x=\frac{bc}{a}`],['Regla de tres inversa',String.raw`a\cdot b=c\cdot x`]],
 12:[['Porcentaje',String.raw`p\%\text{ de }N=\frac{Np}{100}`],['Aumento porcentual',String.raw`N_f=N\left(1+\frac p{100}\right)`],['Descuento porcentual',String.raw`N_f=N\left(1-\frac p{100}\right)`]],
 13:[['Interés simple',String.raw`I=\frac{C\cdot r\cdot t}{100}`],['Monto',String.raw`M=C+I`],['Tasa anual y tiempo en meses',String.raw`I=\frac{C\cdot r\cdot m}{1200}`],['Tasa anual y días comerciales',String.raw`I=\frac{C\cdot r\cdot d}{36000}`]],
 15:[['Precio medio de una mezcla',String.raw`P_m=\frac{q_1p_1+q_2p_2}{q_1+q_2}`],['Ley de aleación',String.raw`L=\frac{\text{masa de metal fino}}{\text{masa total}}`]],
 16:[['Proporción',String.raw`ad=bc`],['Interés simple',String.raw`I=\frac{Crt}{100}`],['Descuento comercial',String.raw`D_c=\frac{V_n dt}{100}`],['Mezcla ponderada',String.raw`P_m=\frac{\sum q_ip_i}{\sum q_i}`]]
 };
 if(w===14)return bibAritTextBlocks(original,'formula');
 const rows=formulas[w]||[];
 return rows.map(([name,tex])=>'<article class="arit-topic"><h4>'+bibAritEsc(name)+'</h4>'+bibAritMath('$'+tex+'$')+'</article>').join('');
}
function bibAritExampleCards(w,original){
 const steps={
 2:[String.raw`\overline{132}_{(5)}=1\cdot5^2+3\cdot5+2=42`],
 3:[String.raw`157=12\cdot13+1`],
 5:[String.raw`72=2^3\cdot3^2`,String.raw`d(72)=(3+1)(2+1)=12`],
 6:[String.raw`\operatorname{MCD}(12,18)=6`,String.raw`\operatorname{MCM}(12,18)=36`],
 7:[String.raw`\frac34+\frac23=\frac{9+8}{12}=\frac{17}{12}`],
 9:[String.raw`\frac35=\frac{x}{20}\Longrightarrow 5x=60\Longrightarrow x=12`],
 10:[String.raw`\frac{840\cdot2}{10}=168,\quad\frac{840\cdot3}{10}=252,\quad\frac{840\cdot5}{10}=420`],
 11:[String.raw`x=\frac{9\cdot240}{6}=360`],
 12:[String.raw`200\left(1+\frac{10}{100}\right)\left(1-\frac{10}{100}\right)=198`],
 13:[String.raw`I=\frac{3000\cdot8\cdot9}{1200}=\text{S/ }180`],
 15:[String.raw`P_m=\frac{4\cdot8+6\cdot13}{4+6}=\text{S/ }11`],
 16:[String.raw`D_c=\frac{2000\cdot12\cdot3}{1200}=\text{S/ }60`]
 };
 if(w===1||w===14||!steps[w])return bibAritTextBlocks(original,'example');
 return '<p class="arit-paragraph">'+bibAritEsc(original)+'</p>'+steps[w].map(tex=>bibAritMath('$'+tex+'$')).join('');
}
function bibAritLesson(ficha){
 const w=Number(bibSemanaPreparacion);
 const isRM=ficha.materia==='Razonamiento Matemático';
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
 const vennInteract=!isRM&&w===1?'<div class="arit-interactive"><h4>Explora el diagrama de Venn</h4><p>Selecciona una región para descubrir qué representa.</p><div class="arit-venn-controls"><button type="button" data-arit-venn="soloA">Solo fútbol</button><button type="button" data-arit-venn="ambos">Ambos</button><button type="button" data-arit-venn="soloB">Solo vóley</button><button type="button" data-arit-venn="ninguno">Ninguno</button></div><p class="arit-venn-result" aria-live="polite">Elige una región para comprobar cómo se cuentan los estudiantes.</p></div>':'';
 const intro=card(1,bibAritTextBlocks(ficha.teoria,'theory')+(!isRM&&w===1?bibDiagramaVenn()+vennInteract:''));
 const formulas=card(2,isRM?bibAritTextBlocks(ficha.formulas,'formula'):bibAritFormulaCards(w,ficha.formulas));
 const ejemplos=card(3,isRM?bibAritTextBlocks(ficha.ejemplo,'example'):bibAritExampleCards(w,ficha.ejemplo));
 const errores=card(4,'<p class="arit-paragraph">'+bibAritMath(ficha.errores||'Identifica el tipo de problema y comprueba tus operaciones.')+'</p>');
 const claves=card(5,'<p class="arit-paragraph">'+bibAritMath(ficha.claves||'Identifica los datos, selecciona la propiedad adecuada y comprueba el resultado.')+'</p>');
 const memoria=card(6,'<p>Intenta recordar las fórmulas antes de abrir cada respuesta.</p><details class="arit-memory"><summary>Mostrar las fórmulas para recordar</summary>'+ (isRM?bibAritTextBlocks(ficha.formulas,'formula'):bibAritFormulaCards(w,ficha.formulas))+'</details>');
 const retos=isRM?[[bibRMExtra[w]?.[0]||'Aplica la fórmula estudiada a un ejercicio propio.',['Mostrar procedimiento'],0,bibRMExtra[w]?.[1]||'Repasa el ejemplo resuelto y comprueba el resultado.']]:w===1?[['Si A tiene 5 elementos, ¿cuántos subconjuntos tiene?',['10','25','32','31'],2,'El número total es 2⁵ = 32.'],['Si 20 alumnos estudian inglés, 12 francés y 5 ambos, ¿cuántos estudian al menos uno?',['27','32','37','17'],0,'Se aplica 20 + 12 − 5 = 27.']]:[['Si una letra de S/ 1000 se descuenta al 2 % mensual durante 3 meses, ¿cuánto es el descuento comercial?',['S/ 20','S/ 60','S/ 120','S/ 600'],1,'D = 1000 × 2 × 3 / 100 = S/ 60.']];
 const reto=card(7,'<p>Resuelve estos ejercicios nuevos, distintos de las preguntas de la separata.</p>'+retos.map((r,i)=>'<div class="arit-quiz" data-answer="'+r[2]+'"><strong>'+bibAritEsc(r[0])+'</strong><div class="arit-quiz-options">'+r[1].map((opt,j)=>'<button type="button" data-arit-choice="'+j+'">'+String.fromCharCode(65+j)+') '+bibAritEsc(opt)+'</button>').join('')+'</div><p class="arit-quiz-feedback" hidden aria-live="polite">'+bibAritEsc(r[3])+'</p></div>').join(''));
 const practica=card(8,'<iframe title="Práctica CPU · '+(isRM?'Razonamiento Matemático':'Aritmética')+' semana '+w+'" src="pilotos/'+(isRM?'razonamiento-matematico':'aritmetica')+'-practica.html?week='+w+'&v=3" style="width:100%;height:78vh;min-height:660px;border:1px solid #d7e5f1;border-radius:14px;background:white" loading="eager"></iframe>');
 return '<div class="arit-lesson"><style>'+
 '.arit-lesson{background:#eef5fb;padding:18px 12px;border-radius:16px;color:#153a57;font-family:system-ui,sans-serif}.arit-hero{max-width:790px;margin:0 auto 14px;padding:26px 22px;background:linear-gradient(115deg,#195376,#348cb3);border-radius:15px;color:#fff}.arit-hero h2{font-size:clamp(24px,3vw,34px);margin:18px 0 10px;color:#fff}.arit-hero p{color:#fff;margin:0;line-height:1.6}.arit-chip{display:inline-block;background:#def9ec;color:#006c58;border-radius:20px;padding:7px 12px;font-size:12px;font-weight:800}.arit-nav{max-width:790px;margin:0 auto 18px;display:flex;flex-wrap:wrap;gap:7px}.arit-nav a{border:1px solid #c6e2f4;background:white;color:#164a72;border-radius:8px;padding:10px 12px;text-decoration:none;font-size:12px;font-weight:700}.arit-card{max-width:790px;margin:16px auto;background:white;border:1px solid #d1e3f2;border-radius:16px;padding:22px;box-shadow:0 4px 13px rgba(29,72,105,.04);scroll-margin-top:15px}.arit-card h3{font-size:21px;color:#133b58;margin:13px 0 20px}.arit-eyebrow{display:inline-block;background:#dcf7e8;color:#006b56;border-radius:30px;padding:7px 12px;font-size:11px;font-weight:800}.arit-topic{border-top:1px solid #e5eef5;padding:15px 0}.arit-topic:first-of-type{border-top:0}.arit-topic h4{font-size:16px;margin:2px 0 12px;color:#0f4668}.arit-paragraph{line-height:1.85;margin:10px 0 16px;white-space:normal;overflow-wrap:anywhere}.arit-formula{background:#f0f6fc;border-radius:10px;margin:12px 0;padding:15px 10px;max-width:100%;overflow-x:auto;text-align:center}.arit-formula .katex-display{margin:0}.arit-memory{padding:14px;border:1px solid #d1e3f2;border-radius:10px}.arit-memory summary{cursor:pointer;font-weight:700;color:#087f79}@media(max-width:650px){.arit-lesson{padding:10px 6px}.arit-card{padding:15px}.arit-hero{padding:22px 16px}.arit-nav a{padding:8px 9px}}'+
 '</style><div class="arit-hero"><span class="arit-chip">'+(isRM?'RAZONAMIENTO MATEMÁTICO':'ARITMÉTICA')+' · SEMANA '+w+' · LECCIÓN INTERACTIVA</span><h2>'+bibAritEsc(ficha.tema||'Lección de Aritmética')+'</h2><p>Aprende los conceptos, interpreta las fórmulas y practica paso a paso.</p></div>'+
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
 const rmFormulas=Array.from(lesson.querySelectorAll('.rm-formula-item .arit-formula')).map(el=>el.innerHTML);
 let rmIndex=0;
 lesson.querySelector('[data-rm-memory-show]')?.addEventListener('click',()=>{const el=lesson.querySelector('#rm-memory-formula');if(el)el.hidden=!el.hidden;});
 lesson.querySelector('[data-rm-memory-next]')?.addEventListener('click',()=>{if(!rmFormulas.length)return;rmIndex=(rmIndex+1)%rmFormulas.length;const el=lesson.querySelector('#rm-memory-formula');if(el){el.innerHTML=rmFormulas[rmIndex];el.hidden=true;}const label=lesson.querySelector('#rm-memory-label');if(label)label.textContent='Fórmula '+(rmIndex+1)+' de '+rmFormulas.length;});
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
 if(!ficha)return '<div class="card"><p class="muted">'+(bibLoading?'Cargando la lección...':bibError?'No se pudo cargar la lección. '+esc(bibError):'Esta semana todavía no tiene una ficha teórica publicada.')+'</p></div>';
 if(esAritmetica)return bibAritLesson(ficha);
 const w=Number(bibSemanaPreparacion), rawFormulas=String(ficha.formulas||'');
 const formulas=rawFormulas.split(/\$\$([\s\S]*?)\$\$/g).filter(x=>x.trim()).map(x=>x.trim());
 const formulaList=formulas.filter(x=>!x.startsWith('\n')&&x.includes('\\')||x.includes('=')||x.includes('^'));
 const renderFormula=(tex)=>bibAritMath('$$'+tex+'$$');
 const card=(num,eyebrow,title,content)=>'<section class="arit-card" id="rm-sec-'+num+'"><span class="arit-eyebrow">'+num+' · '+eyebrow+'</span><h3>'+title+'</h3>'+content+'</section>';
 const formulary=formulaList.map((tex,i)=>'<div class="rm-formula-item"><strong>Propiedad '+(i+1)+'</strong><div class="arit-formula">'+renderFormula(tex)+'</div></div>').join('');
 const example=bibAritTextBlocks(ficha.ejemplo,'example');
 const memoria='<p>Recuerda cada propiedad antes de mostrarla.</p><div class="rm-memory"><p id="rm-memory-label">Fórmula 1 de '+formulaList.length+'</p><div id="rm-memory-formula" hidden>'+renderFormula(formulaList[0]||'')+'</div><button type="button" class="secondary" data-rm-memory-show>Mostrar fórmula</button> <button type="button" class="secondary" data-rm-memory-next>Otra fórmula</button></div>';
 const extra=bibRMExtra[w];
 const challenge=extra?'<div class="rm-quiz"><p><strong>'+esc(extra[0])+'</strong></p><details><summary>Mostrar solución explicada</summary><p>'+esc(extra[1])+'</p></details></div>':'';
 const practice='<iframe title="Práctica CPU · Razonamiento Matemático semana '+w+'" src="pilotos/razonamiento-matematico-practica.html?week='+w+'&v=4" style="width:100%;height:78vh;min-height:660px;border:1px solid #d7e5f1;border-radius:14px;background:white" loading="eager"></iframe>';
 const nav=['Formulario','Ejemplo resuelto','Memoria activa','Comprueba lo aprendido','Práctica CPU'].map((name,i)=>'<a href="#rm-sec-'+(i+1)+'">'+String(i+1).padStart(2,'0')+' · '+name+'</a>').join('');
 return '<div class="arit-lesson rm-five"><style>'+ '.arit-lesson{background:#eef5fb;padding:18px 12px;border-radius:16px;color:#153a57;font-family:system-ui,sans-serif}.arit-hero{max-width:790px;margin:0 auto 14px;padding:26px 22px;background:linear-gradient(115deg,#195376,#348cb3);border-radius:15px;color:#fff}.arit-hero h2{font-size:clamp(24px,3vw,34px);margin:18px 0 10px;color:#fff}.arit-hero p{color:#fff;margin:0;line-height:1.6}.arit-chip{display:inline-block;background:#def9ec;color:#006c58;border-radius:20px;padding:7px 12px;font-size:12px;font-weight:800}.arit-nav{max-width:790px;margin:0 auto 18px;display:flex;flex-wrap:wrap;gap:7px}.arit-nav a{border:1px solid #c6e2f4;background:white;color:#164a72;border-radius:8px;padding:10px 12px;text-decoration:none;font-size:12px;font-weight:700}.arit-card{max-width:790px;margin:16px auto;background:white;border:1px solid #d1e3f2;border-radius:16px;padding:22px;box-shadow:0 4px 13px rgba(29,72,105,.04);scroll-margin-top:15px}.arit-card h3{font-size:21px;color:#133b58;margin:13px 0 20px}.arit-eyebrow{display:inline-block;background:#dcf7e8;color:#006b56;border-radius:30px;padding:7px 12px;font-size:11px;font-weight:800}.arit-topic{border-top:1px solid #e5eef5;padding:15px 0}.arit-topic:first-of-type{border-top:0}.arit-topic h4{font-size:16px;margin:2px 0 12px;color:#0f4668}.arit-paragraph{line-height:1.85;margin:10px 0 16px;white-space:normal;overflow-wrap:anywhere}.arit-formula{background:#f0f6fc;border-radius:10px;margin:12px 0;padding:15px 10px;max-width:100%;overflow-x:auto;text-align:center}.arit-formula .katex-display{margin:0}.arit-memory{padding:14px;border:1px solid #d1e3f2;border-radius:10px}.arit-memory summary{cursor:pointer;font-weight:700;color:#087f79}@media(max-width:650px){.arit-lesson{padding:10px 6px}.arit-card{padding:15px}.arit-hero{padding:22px 16px}.arit-nav a{padding:8px 9px}}'+'.rm-five .rm-formula-item{padding:14px 0;border-bottom:1px solid #e3edf5}.rm-five .rm-formula-item strong{display:block;margin-bottom:10px}.rm-five .arit-formula{background:#eff6fd;border-radius:9px;padding:12px;overflow-x:auto;text-align:center}.rm-five .rm-memory,.rm-five .rm-quiz{background:#f2f8fe;padding:16px;border-radius:10px}.rm-five .arit-card{max-width:790px}.rm-five details{margin-top:12px}.rm-five summary{cursor:pointer;color:#125b82;font-weight:700}</style><header class="arit-hero"><span class="arit-chip">RAZONAMIENTO MATEMÁTICO · SEMANA '+w+'</span><h2>'+esc(ficha.tema)+'</h2><p>'+esc(ficha.resumen||'Aprende los conceptos y practica paso a paso.')+'</p></header><nav class="arit-nav">'+nav+'</nav>'+
 card(1,'FORMULARIO','Fórmulas que debes dominar',formulary||'<p>Revisa las propiedades del tema.</p>')+
 card(2,'EJEMPLO RESUELTO','Aplicación directa',example)+
 card(3,'MEMORIA ACTIVA','¿Recuerdas la fórmula?',memoria)+
 card(4,'COMPRUEBA LO APRENDIDO','Ejercicio de comprensión',challenge||'<p>Explica con tus palabras cuándo se utiliza cada propiedad y verifica el ejemplo resuelto.</p>')+
 card(5,'PRÁCTICA CPU · SEPARATA','Aplicamos lo aprendido',practice)+'</div>';
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
