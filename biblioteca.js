'use strict';
const BIB_AREAS={
 'Ciencias y números':['Razonamiento Matemático','Álgebra','Aritmética','Trigonometría','Geometría','Física','Química','Biología'],
 'Letras y humanidades':['Razonamiento Verbal','Cultura General','Educación Cívica','Historia','Geografía','Lenguaje y Literatura','Psicología','Filosofía','Economía']
};
let bibRows=[],bibLoading=false,bibError='',bibArea='Ciencias y números',bibMateria='',bibSemana='',bibFicha='',bibModalidad='CPU-UNSM',bibEditing='',bibCreating=false;
function bibSubjects(){return BIB_AREAS[bibArea]||[];}
const bibNuevosCursos=['Aritmética','Razonamiento Matemático','Álgebra','Trigonometría','Geometría','Física','Química','Biología','Historia','Geografía','Lenguaje y Literatura','Filosofía','Economía'];
const bibSeparataOnlyCursos=['Química','Biología'];
const bibCienciasSeisCursos=['Trigonometría','Geometría','Física'];
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
  ['04','Tarjetas de memoria','Repasa los conceptos esenciales'],
  ['05','Reto de aprendizaje','Comprueba lo que sabes'],
  ['06','Preguntas CPU','Practica con las preguntas de la semana']
 ];
 const card=(n,content)=>'<section class="arit-card" id="arit-p'+n+'"><span class="arit-eyebrow">'+sections[Number(n)-1][0]+' · '+sections[Number(n)-1][1].toUpperCase()+'</span><h3>'+sections[Number(n)-1][2]+'</h3>'+content+'</section>';
 const vennInteract=!isRM&&w===1?'<div class="arit-interactive"><h4>Explora el diagrama de Venn</h4><p>Selecciona una región para descubrir qué representa.</p><div class="arit-venn-controls"><button type="button" data-arit-venn="soloA">Solo fútbol</button><button type="button" data-arit-venn="ambos">Ambos</button><button type="button" data-arit-venn="soloB">Solo vóley</button><button type="button" data-arit-venn="ninguno">Ninguno</button></div><p class="arit-venn-result" aria-live="polite">Elige una región para comprobar cómo se cuentan los estudiantes.</p></div>':'';
 const intro=card(1,bibAritTextBlocks(ficha.teoria,'theory')+(!isRM&&w===1?bibDiagramaVenn()+vennInteract:''));
 const formulas=card(2,isRM?bibAritTextBlocks(ficha.formulas,'formula'):bibAritFormulaCards(w,ficha.formulas));
 const ejemplos=card(3,isRM?bibAritTextBlocks(ficha.ejemplo,'example'):bibAritExampleCards(w,ficha.ejemplo));
 const formulaItems=(bibAritFormulaCards(w,ficha.formulas).match(/<article class="arit-topic">[\s\S]*?<\/article>/g)||[]);
 const cards=formulaItems.length?formulaItems.slice(0,12).map((html,i)=>'<div class="arit-flip-item" data-arit-flip-card><span class="arit-flip-count">TARJETA '+(i+1)+' / '+Math.min(formulaItems.length,12)+'</span><div class="arit-flip-front">'+'<h4>'+bibAritEsc((html.match(/<h4>([\s\S]*?)<\/h4>/)||[])[1]?.replace(/<[^>]*>/g,'')||'Propiedad '+(i+1))+'</h4><p>¿Qué fórmula corresponde a este concepto?</p>'+'</div><div class="arit-flip-back" hidden>'+html+'</div><button type="button" class="arit-flip-toggle" data-arit-flip>Mostrar respuesta</button></div>').join(''):'<div class="arit-flip-item" data-arit-flip-card><strong>¿Recuerdas las propiedades de esta semana?</strong><div class="arit-flip-back" hidden>'+bibAritTextBlocks(ficha.formulas,'formula')+'</div><button type="button" class="arit-flip-toggle" data-arit-flip>Mostrar respuesta</button></div>';
 const memoria=card(4,'<p class="arit-help">Intenta recordar la propiedad antes de descubrir la respuesta. Usa las tarjetas para estudiar activamente.</p><div class="arit-flip-grid">'+cards+'</div>');
 const retosPorSemana={
  1:[
   ['Si A tiene 5 elementos, ¿cuántos subconjuntos tiene?',['10','25','32','31'],2,'El número total de subconjuntos es 2⁵ = 32.'],
   ['Si 20 alumnos estudian inglés, 12 francés y 5 ambos, ¿cuántos estudian al menos uno?',['27','32','37','17'],0,'Unión de conjuntos: 20 + 12 − 5 = 27.']
  ],
  2:[
   ['¿Cuánto representa 132 en base 5 expresado en base 10?',['32','42','52','62'],1,'1×5² + 3×5 + 2 = 25 + 15 + 2 = 42.'],
   ['¿Cuál es la mayor cifra permitida en base 7?',['5','6','7','8'],1,'En una base b se utilizan las cifras desde 0 hasta b−1. En base 7, la cifra máxima es 6.']
  ],
  3:[
   ['Calcula 6 + 4 × (12 − 7)² ÷ 5.',['26','46','106','30'],0,'Primero (12−7)=5; después 5²=25; finalmente 6+4×25÷5=6+20=26.'],
   ['¿Cuál es el resultado de 128 ÷ 8 + 3 × 7?',['37','35','19','49'],0,'Primero divisiones y multiplicaciones: 128÷8=16 y 3×7=21. Entonces 16+21=37.']
  ],
  4:[
   ['¿Cuál de los siguientes números es divisible entre 9?',['235','342','421','506'],1,'3 + 4 + 2 = 9, que es múltiplo de 9. Por eso 342 es divisible entre 9.'],
   ['¿Cuál es el residuo de dividir 157 entre 13?',['0','1','2','3'],1,'13 × 12 = 156. Así, 157 = 13 × 12 + 1; el residuo es 1.']
  ],
  5:[
   ['¿Cuántos divisores positivos tiene 72?',['8','10','12','14'],2,'72 = 2³ × 3². Cantidad de divisores: (3+1)(2+1)=12.'],
   ['¿Cuál de estos números es primo?',['21','29','33','39'],1,'29 solo tiene dos divisores positivos: 1 y 29.']
  ],
  6:[
   ['¿Cuál es el MCD de 12 y 18?',['3','6','12','36'],1,'Los divisores comunes de 12 y 18 son 1, 2, 3 y 6; el mayor es 6.'],
   ['¿Cuál es el MCM de 12 y 18?',['6','18','36','72'],2,'12 = 2²×3 y 18 = 2×3². Se toman las potencias mayores: 2²×3² = 36.']
  ],
  7:[
   ['Calcula 3/4 + 2/3.',['5/7','13/12','17/12','19/12'],2,'El mínimo común denominador es 12: 3/4=9/12 y 2/3=8/12. Suma=17/12.'],
   ['Calcula 5/6 − 1/4.',['7/12','3/8','1/2','2/3'],0,'Denominador común 12: 10/12 − 3/12 = 7/12.']
  ],
  8:[
   ['Repaso: ¿cuál es el MCD de 24 y 36?',['6','12','18','72'],1,'24=2³×3 y 36=2²×3². MCD=2²×3=12.'],
   ['Repaso: ¿cuánto es 2/5 + 1/10?',['3/15','1/2','3/10','2/15'],1,'2/5=4/10. Por eso 4/10+1/10=5/10=1/2.']
  ],
  9:[
   ['Si 3/5 = x/20, ¿cuánto vale x?',['8','10','12','15'],2,'Producto cruzado: 5x = 3×20 = 60; entonces x=12.'],
   ['Dos cantidades están en razón 2:3 y suman 50. ¿Cuál es la mayor?',['20','25','30','35'],2,'Son 2k y 3k: 5k=50, k=10. La mayor es 3k=30.']
  ],
  10:[
   ['Reparte S/ 840 en partes directamente proporcionales a 2, 3 y 5. ¿Cuál es la mayor?',['S/ 168','S/ 252','S/ 336','S/ 420'],3,'Total de partes: 2+3+5=10. La mayor es 840×5/10=S/ 420.'],
   ['Si 4 obreros producen 40 piezas en una jornada, ¿cuántas producirán 7 obreros iguales?',['56','70','80','100'],1,'A igual tiempo, las cantidades son directamente proporcionales: 40×7/4=70.']
  ],
  15:[
   ['Se mezclan 4 kg de un producto a S/ 8/kg y 6 kg a S/ 13/kg. ¿Cuál es el precio promedio por kg?',['S/ 10','S/ 11','S/ 12','S/ 13'],1,'Precio medio=(4×8+6×13)/(4+6)=110/10=S/ 11 por kg.'],
   ['Una aleación tiene 30 g de metal fino en 50 g de masa total. ¿Cuál es su ley?',['0,3','0,5','0,6','0,8'],2,'Ley=masa de metal fino/masa total = 30/50 = 0,6.']
  ],
  16:[
   ['Repaso: ¿cuánto es el 20 % de S/ 450?',['S/ 45','S/ 80','S/ 90','S/ 100'],2,'450×20/100 = S/ 90.'],
   ['Repaso: ¿qué interés simple produce S/ 2000 al 6 % anual durante 6 meses?',['S/ 30','S/ 60','S/ 120','S/ 600'],1,'I = 2000×6×6/1200=S/ 60, porque el tiempo está en meses.']
  ],
  11:[
   ['Si 6 trabajadores terminan una obra en 12 días, ¿cuántos días necesitan 9 trabajadores al mismo ritmo?',['6 días','8 días','10 días','18 días'],1,'Es una proporcionalidad inversa: 6 × 12 = 9 × t; por tanto, t = 8 días.'],
   ['Si 5 cuadernos cuestan S/ 30, ¿cuánto cuestan 8 cuadernos iguales?',['S/ 36','S/ 42','S/ 48','S/ 54'],2,'Cada cuaderno cuesta S/ 6. Entonces 8 × 6 = S/ 48.']
  ],
  12:[
   ['¿Cuánto es el 15 % de 240?',['24','30','36','48'],2,'Calculamos 240 × 15 / 100 = 36.'],
   ['Un producto de S/ 200 tiene un descuento del 10 %. ¿Cuál es su precio final?',['S/ 180','S/ 190','S/ 210','S/ 220'],0,'Descuento = 200 × 10 / 100 = S/ 20; precio final = S/ 180.']
  ],
  13:[
   ['¿Qué interés simple produce S/ 3000 al 8 % anual durante 9 meses?',['S/ 120','S/ 180','S/ 200','S/ 240'],1,'Como el tiempo está en meses y la tasa es anual: I = 3000 × 8 × 9 / 1200 = S/ 180.'],
   ['¿Qué interés simple produce S/ 1200 al 5 % anual en 2 años?',['S/ 60','S/ 100','S/ 120','S/ 240'],2,'I = C × r × t / 100 = 1200 × 5 × 2 / 100 = S/ 120.']
  ],
  14:[
   ['Una letra de S/ 1000 se descuenta comercialmente al 2 % mensual durante 3 meses. ¿Cuál es el descuento?',['S/ 20','S/ 60','S/ 120','S/ 600'],1,'Como la tasa y el tiempo están en meses: D = 1000 × 2 × 3 / 100 = S/ 60.'],
   ['Una letra de S/ 2000 se descuenta al 12 % anual durante 60 días comerciales. ¿Cuál es el descuento comercial?',['S/ 20','S/ 30','S/ 40','S/ 120'],2,'D = 2000 × 12 × 60 / 36000 = S/ 40.']
  ]
 };
 const retos=retosPorSemana[w]||[];
 const retoContent=retos.length?
 '<div class="arit-check-progress" aria-live="polite">Pregunta 1 de '+retos.length+'</div>'+
 retos.map((r,i)=>'<div class="arit-quiz" data-answer="'+r[2]+'" '+(i?'hidden':'')+'><strong class="arit-question">'+bibAritEsc(r[0])+'</strong><div class="arit-quiz-options">'+r[1].map((opt,j)=>'<button type="button" data-arit-choice="'+j+'"><span class="arit-option-letter">'+String.fromCharCode(65+j)+'</span><span>'+bibAritEsc(opt)+'</span></button>').join('')+'</div><div class="arit-quiz-feedback" hidden aria-live="polite"><strong class="arit-verdict"></strong><p>'+bibAritEsc(r[3])+'</p></div><button type="button" class="arit-next" data-arit-next hidden>'+(i===retos.length-1?'Volver a practicar':'Siguiente pregunta →')+'</button></div>').join(''):
 '<div class="arit-quiz-empty"><p>El reto de esta semana se completará con ejercicios originales del tema de la separata. Mientras tanto, practica las tarjetas y utiliza las preguntas oficiales del punto 6.</p></div>';
 const reto=card(5,'<p class="arit-help">Resuelve el ejercicio, selecciona una alternativa y revisa la solución explicada. Los ejercicios son distintos de la separata.</p>'+retoContent);
 const practica=card(6,'<iframe title="Práctica CPU · '+(isRM?'Razonamiento Matemático':'Aritmética')+' semana '+w+'" src="pilotos/'+(isRM?'razonamiento-matematico':'aritmetica')+'-practica.html?week='+w+'&v=clean-cpu-20261119" style="display:block;width:100%;height:680px;min-height:550px;border:0;border-radius:13px;background:#f0f7ff" loading="lazy"></iframe>');
 return '<div class="arit-lesson"><style>'+
 '.arit-lesson #arit-p2 .arit-topic{padding:13px 0}.arit-lesson #arit-p2 .arit-topic .arit-formula,.arit-lesson #arit-p2 .arit-topic>div.arit-paragraph{background:#ecf5ff;border:1px solid #d0e4f5;border-radius:10px;padding:12px;overflow-x:auto}.arit-lesson #arit-p6{background:#f7fbff}.arit-lesson #arit-p6 iframe{background:#eaf4ff}.arit-lesson .arit-deck-controls,.arit-lesson .arit-example-controls{display:flex;flex-wrap:wrap;align-items:center;gap:10px;justify-content:space-between;background:#eff7ff;border:1px solid #cfe3f4;border-radius:12px;padding:12px;margin:12px 0}.arit-lesson .arit-deck-controls button,.arit-lesson .arit-example-controls button{padding:9px 12px;border:1px solid #a9cadf;border-radius:9px;background:#087f79;color:#fff;font-weight:800;cursor:pointer}.arit-lesson .arit-deck-controls button:disabled,.arit-lesson .arit-example-controls button:disabled{background:#e5edf5;color:#7c91a4;cursor:default}.arit-lesson .arit-flip-grid{grid-template-columns:minmax(0,1fr)!important;max-width:650px;margin:0 auto}.arit-lesson .arit-flip-item{min-height:180px;padding:19px!important}.arit-lesson .arit-flip-back .arit-formula{background:#e9f4ff;border:1px solid #cfe1f3;border-radius:9px}.arit-lesson .arit-quiz-options button{min-height:38px!important;padding:8px 11px!important;gap:10px!important}.arit-lesson [hidden]{display:none!important}'+
 '.arit-lesson .arit-nav button{padding:12px 14px;border-radius:11px;background:#fff;border:1px solid #c9dded;color:#205173;font-weight:800;cursor:pointer}.arit-lesson .arit-nav button[aria-pressed="true"]{background:#087f79;color:#fff;border-color:#087f79}.arit-lesson .arit-flip-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(235px,1fr));gap:14px}.arit-lesson .arit-flip-item{background:linear-gradient(145deg,#f2f9ff,#fff);border:1px solid #bfd9ef;border-radius:13px;padding:17px;min-height:175px;box-shadow:0 4px 13px rgba(17,75,116,.07)}.arit-lesson .arit-flip-item .arit-topic{border:0;padding:8px 0}.arit-lesson .arit-flip-count{font-size:11px;font-weight:900;color:#057b70}.arit-lesson .arit-flip-toggle,.arit-lesson .arit-next{background:#087f79;color:white;border:none;border-radius:10px;padding:12px 17px;font-weight:800;cursor:pointer;margin-top:10px}.arit-lesson .arit-quiz{border:1px solid #d2e5f2;border-radius:15px;padding:18px;background:#f5faff;margin:15px 0}.arit-lesson .arit-question{display:block;font-size:17px;line-height:1.55;margin-bottom:12px}.arit-lesson .arit-quiz-options{display:grid;gap:11px}.arit-lesson .arit-quiz-options button{display:flex;align-items:center;gap:14px;text-align:left;min-height:62px;width:100%;border:1px solid #c3d6e6;border-radius:11px;background:#fff;color:#163c57;font-size:15px;padding:12px;cursor:pointer}.arit-lesson .arit-quiz-options button:hover:not(:disabled){background:#eaf7fd;border-color:#4c9fb7}.arit-lesson .arit-option-letter{display:grid;place-items:center;flex:none;width:34px;height:34px;border-radius:9px;background:#e7f2fc;color:#144d74;font-weight:900}.arit-lesson .arit-quiz-options button.arit-correct{background:#dff7e9;border:2px solid #16845b;color:#09583a}.arit-lesson .arit-quiz-options button.arit-wrong{background:#fff0f0;border:2px solid #ca5353;color:#932f2f}.arit-lesson .arit-quiz-feedback{margin:15px 0;background:#eaf7ee;border-left:4px solid #17895e;border-radius:10px;padding:14px;line-height:1.6}.arit-lesson .arit-check-progress{color:#087f79;font-weight:800;margin:12px 0}.arit-lesson [hidden]{display:none!important}.arit-lesson .arit-help{line-height:1.6;color:#516e81}@media(max-width:650px){.arit-lesson .arit-flip-grid{grid-template-columns:1fr}.arit-lesson .arit-quiz{padding:12px}}'+
 '.arit-lesson{background:#eef5fb;padding:18px 12px;border-radius:16px;color:#153a57;font-family:system-ui,sans-serif}.arit-hero{max-width:790px;margin:0 auto 14px;padding:26px 22px;background:linear-gradient(115deg,#195376,#348cb3);border-radius:15px;color:#fff}.arit-hero h2{font-size:clamp(24px,3vw,34px);margin:18px 0 10px;color:#fff}.arit-hero p{color:#fff;margin:0;line-height:1.6}.arit-chip{display:inline-block;background:#def9ec;color:#006c58;border-radius:20px;padding:7px 12px;font-size:12px;font-weight:800}.arit-nav{max-width:790px;margin:0 auto 18px;display:flex;flex-wrap:wrap;gap:7px}.arit-nav a{border:1px solid #c6e2f4;background:white;color:#164a72;border-radius:8px;padding:10px 12px;text-decoration:none;font-size:12px;font-weight:700}.arit-card{max-width:790px;margin:16px auto;background:white;border:1px solid #d1e3f2;border-radius:16px;padding:22px;box-shadow:0 4px 13px rgba(29,72,105,.04);scroll-margin-top:15px}.arit-card h3{font-size:21px;color:#133b58;margin:13px 0 20px}.arit-eyebrow{display:inline-block;background:#dcf7e8;color:#006b56;border-radius:30px;padding:7px 12px;font-size:11px;font-weight:800}.arit-topic{border-top:1px solid #e5eef5;padding:15px 0}.arit-topic:first-of-type{border-top:0}.arit-topic h4{font-size:16px;margin:2px 0 12px;color:#0f4668}.arit-paragraph{line-height:1.85;margin:10px 0 16px;white-space:normal;overflow-wrap:anywhere}.arit-formula{background:#f0f6fc;border-radius:10px;margin:12px 0;padding:15px 10px;max-width:100%;overflow-x:auto;text-align:center}.arit-formula .katex-display{margin:0}.arit-memory{padding:14px;border:1px solid #d1e3f2;border-radius:10px}.arit-memory summary{cursor:pointer;font-weight:700;color:#087f79}@media(max-width:650px){.arit-lesson{padding:10px 6px}.arit-card{padding:15px}.arit-hero{padding:22px 16px}.arit-nav a{padding:8px 9px}}'+
 '</style><div class="arit-hero"><span class="arit-chip">'+(isRM?'RAZONAMIENTO MATEMÁTICO':'ARITMÉTICA')+' · SEMANA '+w+' · LECCIÓN INTERACTIVA</span><h2>'+bibAritEsc(ficha.tema||'Lección de Aritmética')+'</h2><p>Aprende los conceptos, interpreta las fórmulas y practica paso a paso.</p></div>'+
 '<nav class="arit-nav" aria-label="Secciones de la lección">'+sections.map((x,i)=>'<button type="button" data-arit-tab="'+(i+1)+'" aria-pressed="'+(i===0?'true':'false')+'">'+x[0]+' · '+(i===5?'CPU':i===3?'Memoria':i===4?'Reto':'Estudia')+'</button>').join('')+'</nav>'+
 intro+formulas+ejemplos+memoria+reto+practica+'</div>';
}
function bibBindAritInteract(){
 const lesson=document.querySelector('.arit-lesson');if(!lesson)return;
 // Una tarjeta de memoria por vez, con avance controlado.
 const memoryDeck=lesson.querySelector('#arit-p4 .arit-flip-grid');
 if(memoryDeck){
  const cards=Array.from(memoryDeck.querySelectorAll('[data-arit-flip-card]'));
  if(cards.length>1){
   let index=0;
   const controls=document.createElement('div');controls.className='arit-deck-controls';
   const progress=document.createElement('strong');
   const previous=document.createElement('button');previous.type='button';previous.textContent='← Anterior';
   const next=document.createElement('button');next.type='button';
   const draw=()=>{cards.forEach((card,i)=>{card.hidden=i!==index;});progress.textContent='Tarjeta '+(index+1)+' de '+cards.length;previous.disabled=index===0;next.textContent=index===cards.length-1?'Volver a empezar ↺':'Siguiente tarjeta →';};
   previous.onclick=()=>{if(index>0)index--;draw();};
   next.onclick=()=>{index=(index+1)%cards.length;draw();};
   controls.append(previous,progress,next);memoryDeck.after(controls);draw();
  }
 }
 // Un ejemplo resuelto visible por vez, sin borrar los procedimientos.
 const examples=lesson.querySelector('#arit-p3');
 if(examples){
  let items=Array.from(examples.querySelectorAll(':scope > article.arit-topic'));
  if(items.length<2)items=Array.from(examples.querySelectorAll(':scope > .arit-paragraph'));
  if(items.length>1){
   let index=0;
   const controls=document.createElement('div');controls.className='arit-example-controls';
   const progress=document.createElement('strong');
   const previous=document.createElement('button');previous.type='button';previous.textContent='← Ejemplo anterior';
   const next=document.createElement('button');next.type='button';
   const draw=()=>{items.forEach((item,i)=>{item.hidden=i!==index;});progress.textContent='Ejemplo '+(index+1)+' de '+items.length;previous.disabled=index===0;next.textContent=index===items.length-1?'Volver al primero ↺':'Siguiente ejemplo →';};
   previous.onclick=()=>{if(index>0)index--;draw();};
   next.onclick=()=>{index=(index+1)%items.length;draw();};
   controls.append(previous,progress,next);examples.append(controls);draw();
  }
 }

 lesson.querySelectorAll('[data-arit-tab]').forEach(button=>button.addEventListener('click',()=>{
  const tab=Number(button.dataset.aritTab);
  lesson.querySelectorAll('[data-arit-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  lesson.querySelectorAll('.arit-card').forEach(card=>card.hidden=card.id!=='arit-p'+tab);
  lesson.querySelector('.arit-hero')?.scrollIntoView({block:'start',behavior:'smooth'});
 }));
 const checkQuiz=lesson.querySelector('[data-rm-check]');
 if(checkQuiz){
  const items=Array.from(checkQuiz.querySelectorAll('[data-rm-check-item]'));
  let current=0;
  const show=(index)=>{
   current=index;
   items.forEach((item,i)=>item.hidden=i!==index);
   checkQuiz.querySelector('.rm-check-progress').textContent='Pregunta '+(index+1)+' de '+items.length;
  };
  items.forEach((item,i)=>{
   item.querySelectorAll('[data-rm-check-option]').forEach(btn=>btn.addEventListener('click',()=>{
    if(item.dataset.answered==='true')return;
    item.dataset.answered='true';
    const chosen=Number(btn.dataset.rmCheckOption),correct=Number(item.dataset.correct);
    item.querySelectorAll('[data-rm-check-option]').forEach(b=>{
     b.disabled=true;
     if(Number(b.dataset.rmCheckOption)===correct){b.style.background='#e2f6eb';b.style.borderColor='#16865a';}
    });
    if(chosen!==correct){btn.style.background='#fff0f0';btn.style.borderColor='#dc5555';}
    const feedback=item.querySelector('.rm-check-feedback');
    feedback.textContent=chosen===correct?'✓ ¡Respuesta correcta!':'✗ Respuesta incorrecta. La alternativa correcta es '+String.fromCharCode(65+correct)+'.';
    feedback.style.color=chosen===correct?'#137d54':'#b43c3c';
    item.querySelector('.rm-check-explanation').hidden=false;
    item.querySelector('[data-rm-check-next]').disabled=false;
   }));
   item.querySelector('[data-rm-check-next]').addEventListener('click',()=>{
    if(i===items.length-1){
     items.forEach(it=>{
      delete it.dataset.answered;
      it.querySelectorAll('[data-rm-check-option]').forEach(b=>{b.disabled=false;b.style.background='';b.style.borderColor='';});
      it.querySelector('.rm-check-feedback').textContent='';
      it.querySelector('.rm-check-explanation').hidden=true;
      it.querySelector('[data-rm-check-next]').disabled=true;
     });
     show(0);
    }else show(i+1);
    checkQuiz.scrollIntoView({block:'start',behavior:'smooth'});
   });
  });
 }

 const memoryQuiz=lesson.querySelector('[data-rm-memory-quiz]');
 if(memoryQuiz){
  const all=Array.from(lesson.querySelectorAll('#rm-sec-1 .rm-formula-item .arit-formula'));
  const names=Array.from(lesson.querySelectorAll('.rm-formula-item strong')).map(el=>el.textContent);
  const topicNames=lesson.dataset.rmNames?JSON.parse(lesson.dataset.rmNames):names;
  const rmWeek=Number(lesson.dataset.rmWeek||0);
  const curated=rmWeek===1?[
   {name:'propiedad conmutativa',tex:String.raw`a+b=b+a,\qquad ab=ba`},
   {name:'propiedad asociativa',tex:String.raw`(a+b)+c=a+(b+c)`},
   {name:'propiedad distributiva de la suma',tex:String.raw`a(b+c)=ab+ac`},
   {name:'propiedad distributiva de la resta',tex:String.raw`a(b-c)=ab-ac`},
   {name:'diferencia de cuadrados',tex:String.raw`a^2-b^2=(a-b)(a+b)`},
   {name:'suma de los primeros números naturales',tex:String.raw`1+2+\cdots+n=\frac{n(n+1)}{2}`}
  ]:null;
  const items=curated||all.map((el,i)=>({name:topicNames[i]||'fórmula '+(i+1),html:el.innerHTML,plain:el.textContent}));
  if(curated)items.forEach(x=>{x.html=window.katex?window.katex.renderToString(x.tex,{displayMode:true,throwOnError:false}):'\\('+x.tex+'\\)';x.plain=x.tex});
  let idx=0;
  const draw=()=>{
   const label=memoryQuiz.querySelector('#rm-memory-label'),question=memoryQuiz.querySelector('#rm-memory-question'),options=memoryQuiz.querySelector('#rm-memory-options'),feedback=memoryQuiz.querySelector('#rm-memory-feedback'),next=memoryQuiz.querySelector('[data-rm-memory-next]');
   if(!items.length){options.textContent='No hay fórmulas disponibles.';next.disabled=true;return;}
   label.textContent='Pregunta '+(idx+1)+' de '+items.length;
   question.textContent='¿Cuál es la fórmula correspondiente a '+items[idx].name+'?';
   feedback.textContent='';feedback.className='rm-memory-feedback';next.disabled=true;next.textContent=idx===items.length-1?'Volver a practicar':'Siguiente fórmula →';
   const picks=[idx];for(let j=1;j<items.length&&picks.length<4;j++){const candidate=(idx+j)%items.length;if(!picks.some(k=>items[k].plain.replace(/\s+/g,'')===items[candidate].plain.replace(/\s+/g,'')))picks.push(candidate);}
   if(items.length===1){question.textContent='Observa y recuerda la fórmula';}
   const ordered=picks.map((p,j)=>picks[(j+idx)%picks.length]);
   options.replaceChildren();
   ordered.forEach((p,j)=>{
    const btn=document.createElement('button');btn.type='button';btn.className='rm-memory-choice';
    btn.innerHTML='<strong>'+String.fromCharCode(65+j)+')</strong> '+items[p].html;
    btn.addEventListener('click',()=>{
     options.querySelectorAll('button').forEach(b=>b.disabled=true);
     btn.classList.add(p===idx?'rm-choice-correct':'rm-choice-wrong');
     if(p!==idx)Array.from(options.children).find(b=>b.dataset.index===String(idx))?.classList.add('rm-choice-correct');
     const correctButton=Array.from(options.children).find(b=>b.dataset.index===String(idx));const correctLetter=correctButton?.querySelector('strong')?.textContent||'';feedback.textContent=p===idx?'✓ ¡Respuesta correcta! Has identificado la propiedad.':'✗ Respuesta incorrecta. La alternativa correcta es '+correctLetter+' Revisa la fórmula resaltada en verde.';feedback.className='rm-memory-feedback '+(p===idx?'rm-feedback-correct':'rm-feedback-wrong');
     next.disabled=false;
    });btn.dataset.index=String(p);options.appendChild(btn);
   });
  };
  memoryQuiz.querySelector('[data-rm-memory-next]').addEventListener('click',()=>{idx=(idx+1)%items.length;draw()});
  draw();
 }
 lesson.querySelectorAll('[data-arit-flip]').forEach(button=>button.addEventListener('click',()=>{
  const card=button.closest('[data-arit-flip-card]');const back=card?.querySelector('.arit-flip-back');if(!back)return;
  back.hidden=!back.hidden;button.textContent=back.hidden?'Mostrar respuesta':'Ocultar respuesta';
 }));
 lesson.querySelectorAll('.arit-quiz').forEach((quiz,i,all)=>{
  const next=quiz.querySelector('[data-arit-next]');
  if(!next)return;
  next.addEventListener('click',()=>{
   if(i===all.length-1){all.forEach(item=>{
    delete item.dataset.done;
    item.querySelectorAll('[data-arit-choice]').forEach(button=>{button.disabled=false;button.classList.remove('arit-correct','arit-wrong')});
    item.querySelector('.arit-quiz-feedback').hidden=true;
    item.querySelector('[data-arit-next]').hidden=true;
   });all.forEach((item,j)=>item.hidden=j!==0);lesson.querySelector('.arit-check-progress').textContent='Pregunta 1 de '+all.length;}
   else{quiz.hidden=true;all[i+1].hidden=false;lesson.querySelector('.arit-check-progress').textContent='Pregunta '+(i+2)+' de '+all.length;}
   lesson.querySelector('.arit-check-progress')?.scrollIntoView({behavior:'smooth',block:'center'});
  });
 });
 const explanations={soloA:'Solo fútbol: 24 − 10 = 14 estudiantes.',ambos:'Ambos deportes: 10 estudiantes, que se colocan primero en la intersección.',soloB:'Solo vóley: 18 − 10 = 8 estudiantes.',ninguno:'Ninguno: 40 − (14 + 10 + 8) = 8 estudiantes.'};
 lesson.querySelectorAll('[data-arit-venn]').forEach(b=>b.addEventListener('click',()=>{const el=lesson.querySelector('.arit-venn-result');if(el)el.textContent=explanations[b.dataset.aritVenn]}));
 lesson.querySelectorAll('[data-arit-choice]').forEach(b=>b.addEventListener('click',()=>{
  const quiz=b.closest('.arit-quiz');if(quiz.dataset.done)return;quiz.dataset.done='true';
  const hit=Number(b.dataset.aritChoice)===Number(quiz.dataset.answer);
  b.classList.add(hit?'arit-correct':'arit-wrong');
  quiz.querySelectorAll('button').forEach(btn=>{btn.disabled=true;if(Number(btn.dataset.aritChoice)===Number(quiz.dataset.answer))btn.classList.add('arit-correct')});
  const feedback=quiz.querySelector('.arit-quiz-feedback');feedback.hidden=false;
  feedback.querySelector('.arit-verdict').textContent=hit?'✓ ¡Respuesta correcta!':'✗ Revisa tu respuesta. La alternativa correcta es '+String.fromCharCode(65+Number(quiz.dataset.answer))+'.';
  quiz.querySelector('[data-arit-next]').hidden=false;
 }));
}
function bibFormatoEcuaciones(valor){return bibAritMath(valor)}
function bibRMContenido(){
 const esAritmetica=bibCursoPreparacion==='Aritmética';
 const ficha=bibRows.find(f=>f.materia===(esAritmetica?'Aritmética':'Razonamiento Matemático')&&Number(f.semana)===Number(bibSemanaPreparacion)&&f.modalidad==='CPU-UNSM');
 if(!ficha)return '<div class="card"><p class="muted">'+(bibLoading?'Cargando la lección...':bibError?'No se pudo cargar la lección. '+esc(bibError):'Esta semana todavía no tiene una ficha teórica publicada.')+'</p></div>';
 if(esAritmetica)return bibAritLesson(ficha);
 const w=Number(bibSemanaPreparacion), rawFormulas=String(ficha.formulas||'');
 const formulaList=Array.from(rawFormulas.matchAll(/\$\$([\s\S]*?)\$\$/g),m=>m[1].trim()).filter(Boolean);
 const renderFormula=(tex)=>bibAritMath('$$'+tex+'$$');
 const card=(num,eyebrow,title,content)=>'<section class="arit-card" id="rm-sec-'+num+'"><span class="arit-eyebrow">'+num+' · '+eyebrow+'</span><h3>'+title+'</h3>'+content+'</section>';
 const formulary=formulaList.map((tex,i)=>'<div class="rm-formula-item"><strong>Propiedad '+(i+1)+'</strong><div class="arit-formula">'+renderFormula(tex)+'</div></div>').join('');
 const example=bibAritTextBlocks(ficha.ejemplo,'example');
 const nombresRM={1:['propiedad conmutativa','propiedad asociativa','propiedad distributiva de la suma','propiedad distributiva de la resta','diferencia de cuadrados','suma de los primeros números naturales'],2:['término general de una sucesión aritmética','término general de una sucesión geométrica'],3:['suma de una progresión aritmética','suma de una progresión geométrica']};
 const nombreFormula=(i)=>nombresRM[w]?.[i]||('expresión '+(i+1)+' del formulario');
 const formulaOptions=formulaList.map((tex,i)=>({tex,label:nombreFormula(i)}));
 const memoria='<p>Lee la propiedad indicada y elige la fórmula correcta entre las alternativas. Recibirás una explicación inmediata.</p><div class="rm-memory" data-rm-memory-quiz><p id="rm-memory-label"><strong>Pregunta 1 de '+formulaOptions.length+'</strong></p><p id="rm-memory-question">¿Cuál es la fórmula correspondiente a <strong>'+esc(nombreFormula(0))+'</strong>?</p><div id="rm-memory-options" class="rm-memory-options"></div><p id="rm-memory-feedback" role="status" aria-live="polite"></p><button type="button" class="secondary" data-rm-memory-next disabled>Siguiente fórmula →</button></div>';
 const quizRM=w===1?[
  {q:'Calcula mentalmente: 24 × 15.',opts:['340','360','390','300'],correct:1,why:'Aplicamos la propiedad distributiva: 24 × (10 + 5) = 240 + 120 = 360.'},
  {q:'Calcula: 18 × 25 utilizando una estrategia de cálculo mental.',opts:['400','425','450','475'],correct:2,why:'Como 25 = 100 ÷ 4, entonces 18 × 25 = 1800 ÷ 4 = 450.'},
  {q:'Resuelve: 37 + 48 + 63 + 52.',opts:['190','210','200','180'],correct:2,why:'Agrupamos convenientemente: (37 + 63) + (48 + 52) = 100 + 100 = 200.'},
  {q:'Si 1 + 3 = 4, 1 + 3 + 5 = 9 y 1 + 3 + 5 + 7 = 16, ¿cuánto suman los cinco primeros números impares?',opts:['20','25','30','36'],correct:1,why:'Por inducción observamos que la suma de los primeros n números impares es n². Para n = 5, resulta 5² = 25.'},
  {q:'¿Cuál es el resultado de 6 + 4 × (12 − 7)² ÷ 5?',opts:['26','46','106','30'],correct:0,why:'Primero paréntesis: 12 − 7 = 5; después potencia: 5² = 25; luego 4 × 25 ÷ 5 = 20; finalmente 6 + 20 = 26.'}
 ]:null;
 const rmExtraChoices={
  2:{opts:['17','18','19','21'],correct:2},
  3:{opts:['48','56','60','64'],correct:2},
  4:{opts:['20','23','25','27'],correct:1},
  5:{opts:['27','32','36','40'],correct:2},
  6:{opts:['4 horas','4 horas y 48 minutos','5 horas','6 horas'],correct:1},
  7:{opts:['S/ 136','S/ 140','S/ 144','S/ 160'],correct:2},
  9:{opts:['S/ 7','S/ 8','S/ 9','S/ 10'],correct:2},
  10:{opts:['60','75','80','100'],correct:2},
  11:{opts:['8 días','10 días','12 días','15 días'],correct:1},
  12:{opts:['45°','60°','90°','180°'],correct:2},
  13:{opts:['1 hora','2 horas','3 horas','4 horas'],correct:1},
  14:{opts:['36 cm²','48 cm²','64 cm²','100 cm²'],correct:2},
  15:{opts:['5 maneras','10 maneras','15 maneras','20 maneras'],correct:1},
  16:{opts:['10 grupos','15 grupos','20 grupos','30 grupos'],correct:2}
 };
 const extraQuiz=!quizRM&&bibRMExtra[w]&&rmExtraChoices[w]?[{q:bibRMExtra[w][0],opts:rmExtraChoices[w].opts,correct:rmExtraChoices[w].correct,why:bibRMExtra[w][1]}]:null;
 const activeQuiz=quizRM||extraQuiz;
 const quizHtml=activeQuiz?'<div class="rm-check-quiz" data-rm-check><p>Resuelve el ejercicio, marca una alternativa y continúa con la siguiente pregunta.</p><p class="rm-check-progress">Pregunta 1 de '+activeQuiz.length+'</p>'+activeQuiz.map((item,i)=>'<div class="rm-check-item" data-rm-check-item data-correct="'+item.correct+'" '+(i?'hidden':'')+'><p><strong>'+esc(item.q)+'</strong></p><div class="rm-check-options">'+item.opts.map((opt,j)=>'<button type="button" class="rm-memory-choice" data-rm-check-option="'+j+'"><strong>'+String.fromCharCode(65+j)+')</strong> '+esc(opt)+'</button>').join('')+'</div><p class="rm-check-feedback" role="status" aria-live="polite"></p><div class="rm-check-explanation" hidden><strong>Solución explicada</strong><p>'+esc(item.why)+'</p></div><button type="button" class="secondary" data-rm-check-next disabled>'+(i===activeQuiz.length-1?'Volver a empezar':'Siguiente pregunta →')+'</button></div>').join('')+'</div>':null;
 const extra=bibRMExtra[w];
 const challenge=quizHtml||(extra?'<div class="rm-quiz"><p><strong>'+esc(extra[0])+'</strong></p><details><summary>Mostrar solución explicada</summary><p>'+esc(extra[1])+'</p></details></div>':'');
 const practice='<iframe title="Práctica CPU · Razonamiento Matemático semana '+w+'" src="pilotos/razonamiento-matematico-practica.html?week='+w+'&v=clean-cpu-20261119" style="display:block;width:100%;height:680px;min-height:550px;border:0;border-radius:13px;background:#f0f7ff" loading="lazy"></iframe>';
 const nav=['Marco teórico','Fórmulas y propiedades','Ejemplos resueltos','Tarjetas de memoria','Reto de aprendizaje','Preguntas CPU'].map((name,i)=>'<a href="#rm-sec-'+(i+1)+'">'+String(i+1).padStart(2,'0')+' · '+name+'</a>').join('');
 return '<div class="arit-lesson rm-six" data-rm-week="'+w+'" data-rm-names="'+esc(JSON.stringify(formulaOptions.map(x=>x.label)))+'"><style>'+ '.arit-lesson{background:#eef5fb;padding:18px 12px;border-radius:16px;color:#153a57;font-family:system-ui,sans-serif}.arit-hero{max-width:790px;margin:0 auto 14px;padding:26px 22px;background:linear-gradient(115deg,#195376,#348cb3);border-radius:15px;color:#fff}.arit-hero h2{font-size:clamp(24px,3vw,34px);margin:18px 0 10px;color:#fff}.arit-hero p{color:#fff;margin:0;line-height:1.6}.arit-chip{display:inline-block;background:#def9ec;color:#006c58;border-radius:20px;padding:7px 12px;font-size:12px;font-weight:800}.arit-nav{max-width:790px;margin:0 auto 18px;display:flex;flex-wrap:wrap;gap:7px}.arit-nav a{border:1px solid #c6e2f4;background:white;color:#164a72;border-radius:8px;padding:10px 12px;text-decoration:none;font-size:12px;font-weight:700}.arit-card{max-width:790px;margin:16px auto;background:white;border:1px solid #d1e3f2;border-radius:16px;padding:22px;box-shadow:0 4px 13px rgba(29,72,105,.04);scroll-margin-top:15px}.arit-card h3{font-size:21px;color:#133b58;margin:13px 0 20px}.arit-eyebrow{display:inline-block;background:#dcf7e8;color:#006b56;border-radius:30px;padding:7px 12px;font-size:11px;font-weight:800}.arit-topic{border-top:1px solid #e5eef5;padding:15px 0}.arit-topic:first-of-type{border-top:0}.arit-topic h4{font-size:16px;margin:2px 0 12px;color:#0f4668}.arit-paragraph{line-height:1.85;margin:10px 0 16px;white-space:normal;overflow-wrap:anywhere}.arit-formula{background:#f0f6fc;border-radius:10px;margin:12px 0;padding:15px 10px;max-width:100%;overflow-x:auto;text-align:center}.arit-formula .katex-display{margin:0}.arit-memory{padding:14px;border:1px solid #d1e3f2;border-radius:10px}.arit-memory summary{cursor:pointer;font-weight:700;color:#087f79}@media(max-width:650px){.arit-lesson{padding:10px 6px}.arit-card{padding:15px}.arit-hero{padding:22px 16px}.arit-nav a{padding:8px 9px}}'+'.rm-six .rm-formula-item{padding:14px 0;border-bottom:1px solid #e3edf5}.rm-six .rm-formula-item strong{display:block;margin-bottom:10px}.rm-six .arit-formula{background:#eff6fd;border-radius:9px;padding:12px;overflow-x:auto;text-align:center}.rm-six .rm-memory-options{display:grid;gap:10px;margin:14px 0}.rm-six .rm-check-quiz{max-width:100%}.rm-six .rm-check-item{background:#f2f8fe;border-radius:12px;padding:18px;margin-top:14px}.rm-six .rm-check-options{display:grid;grid-template-columns:minmax(0,1fr);gap:10px;margin:16px 0}.rm-six .rm-check-options .rm-memory-choice{display:flex;width:100%;box-sizing:border-box;min-height:62px;padding:14px 16px;border:1px solid #bdd6ea;border-radius:10px;background:#fff;text-align:left;align-items:center;gap:14px;font-size:15px;line-height:1.5}.rm-six .rm-check-options .rm-memory-choice strong{min-width:25px}.rm-six .rm-check-options .rm-memory-choice:disabled{opacity:1;cursor:default}.rm-six .rm-check-feedback{font-weight:700;margin:14px 0}.rm-six .rm-check-explanation{background:#e8f4ff;border:1px solid #c6e2fa;border-radius:10px;padding:14px;margin:12px 0}.rm-six .rm-check-explanation p{margin-bottom:0}.rm-six [data-rm-check-next]{border:1px solid #b9d7e8;background:#e5f0f8;color:#16466a;border-radius:9px;padding:11px 15px;font-weight:700;cursor:pointer}.rm-six [data-rm-check-next]:disabled{opacity:.55;cursor:not-allowed}.rm-six .rm-memory-choice{display:flex;align-items:center;gap:12px;text-align:left;background:#fff;border:1px solid #bdd6ea;border-radius:10px;padding:12px;min-height:60px;cursor:pointer;color:#153a57}.rm-six .rm-memory-choice .katex-display{margin:0}.rm-six .rm-memory-choice.rm-choice-correct{background:#def8e8;border-color:#16845b}.rm-six .rm-memory-choice.rm-choice-wrong{background:#ffebeb;border-color:#ce5454}.rm-six .rm-memory-choice.rm-choice-correct{border-width:2px;box-shadow:0 0 0 2px rgba(22,132,91,.12);color:#075d3b}.rm-six .rm-memory-choice.rm-choice-wrong{border-width:2px;color:#a32e2e}.rm-six .rm-memory-feedback{margin:12px 0;font-weight:700}.rm-six .rm-memory-feedback.rm-feedback-correct{background:#e2f6eb;border-left:4px solid #16845b;color:#08603d;padding:12px;border-radius:8px}.rm-six .rm-memory-feedback.rm-feedback-wrong{background:#fff0f0;border-left:4px solid #ce5454;color:#a32e2e;padding:12px;border-radius:8px}.rm-six .rm-memory,.rm-six .rm-quiz{background:#f2f8fe;padding:16px;border-radius:10px}.rm-six .arit-card{max-width:790px}.rm-six details{margin-top:12px}.rm-six summary{cursor:pointer;color:#125b82;font-weight:700}</style><header class="arit-hero"><span class="arit-chip">RAZONAMIENTO MATEMÁTICO · SEMANA '+w+'</span><h2>'+esc(ficha.tema)+'</h2><p>'+esc(ficha.resumen||'Aprende los conceptos y practica paso a paso.')+'</p></header><nav class="arit-nav">'+nav+'</nav>'+
 card(1,'MARCO TEÓRICO','Comprendemos los conceptos',bibAritTextBlocks(ficha.teoria,'theory')||'<p>Analiza el tema antes de aplicar sus propiedades.</p>')+
 card(2,'FÓRMULAS Y PROPIEDADES','Fórmulas que debes dominar',formulary||bibAritTextBlocks(ficha.formulas,'formula'))+
 card(3,'EJEMPLOS RESUELTOS','Aplicación paso a paso',example)+
 card(4,'TARJETAS DE MEMORIA','¿Recuerdas la fórmula?',memoria)+
 card(5,'RETO DE APRENDIZAJE','Comprueba lo aprendido',challenge||'<p>Explica con tus palabras cómo se utiliza cada propiedad.</p>')+
 card(6,'PREGUNTAS CPU','Práctica CPU · Separata',practice)+'</div>';
}
function bibPage(){
 if(bibCursoPreparacion){
  const nombre=esc(bibCursoPreparacion);
  const semanas=Array.from({length:16},(_,i)=>{const n=i+1,repaso=(n===10||n===16)||(bibCursoPreparacion==='Educación Cívica'&&n===8),listo=(bibSeparataOnlyCursos.includes(bibCursoPreparacion)?Boolean(window.CACHIMBOLAB_QB?.hasTopic(bibCursoPreparacion,n)):bibCienciasSeisCursos.includes(bibCursoPreparacion)?Boolean(window.cachimbolabScienceSix?.hasTopic(bibCursoPreparacion,n)):(bibCursoPreparacion==='Cultura General'?[1,9,11,12,13]:(bibCursoPreparacion==='Razonamiento Verbal'||bibCursoPreparacion==='Educación Cívica'||bibNuevosCursos.includes(bibCursoPreparacion))?[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]:[]).includes(n));return '<button type="button" class="secondary" data-bib-semana="'+n+'" aria-pressed="'+(bibSemanaPreparacion===n)+'" style="min-height:74px;border-radius:12px;padding:12px;background:'+(bibSemanaPreparacion===n?'#dceef8':listo?'#e8f8f2':'#f4f8fc')+';color:#163b58"><strong>Semana '+n+'</strong><small style="display:block;margin-top:5px">'+(listo?(repaso?'Ver repaso':'Ver lección'):repaso?'Repaso · En preparación':'En preparación')+'</small></button>'}).join('');
  return '<div class="card"><button type="button" class="secondary" id="bibVolverCursos">← Volver a los cursos</button><h2 style="margin-top:20px">📚 '+nombre+' · Lecciones interactivas</h2><p class="muted">Ciclo CPU-UNSM · 16 semanas. Las semanas de repaso se organizarán según la programación oficial del curso.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin:22px 0">'+semanas+'</div>'+((bibSeparataOnlyCursos.includes(bibCursoPreparacion)&&bibSemanaPreparacion)?'<div class="bib-lesson-scroll" role="region" aria-label="Lección interactiva de '+nombre+' con desplazamiento interno" tabindex="0" style="width:100%;height:76vh;min-height:600px;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;border:1px solid #d7e5f1;border-radius:14px;background:#eef5fb;padding:12px;box-sizing:border-box">'+(window.CACHIMBOLAB_QB?.render(bibCursoPreparacion,bibSemanaPreparacion)||'<p>Lección temporalmente no disponible.</p>')+'</div>':bibCienciasSeisCursos.includes(bibCursoPreparacion)&&bibSemanaPreparacion?'<div class="bib-lesson-scroll" role="region" aria-label="Lección interactiva con desplazamiento interno" tabindex="0" style="width:100%;height:76vh;min-height:600px;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;border:1px solid #d7e5f1;border-radius:14px;background:#eef5fb;padding:12px;box-sizing:border-box">'+(window.cachimbolabScienceSix?.render(bibCursoPreparacion,bibSemanaPreparacion)||'<p>Lección temporalmente no disponible.</p>')+'</div>':(bibCursoPreparacion==='Razonamiento Matemático'||bibCursoPreparacion==='Aritmética')&&bibSemanaPreparacion?'<div class="bib-lesson-scroll" role="region" aria-label="Lección interactiva con desplazamiento interno" tabindex="0" style="width:100%;height:76vh;min-height:600px;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;border:1px solid #d7e5f1;border-radius:14px;background:#eef5fb;padding:12px;box-sizing:border-box">'+bibRMContenido()+'</div>':listoSemanaBib()?'<div class="card"><h3>Semana '+bibSemanaPreparacion+' · '+nombre+'</h3><p class="muted">Lección interactiva con teoría y práctica de aprendizaje. En Álgebra: fórmulas matemáticas y ejemplos.</p><iframe title="'+nombre+' semana '+bibSemanaPreparacion+'" src="pilotos/'+bibCursoSlug[bibCursoPreparacion]+'-semana-'+bibSemanaPreparacion+'.html?v=40" style="width:100%;height:76vh;min-height:600px;border:1px solid #d7e5f1;border-radius:14px;background:white" loading="lazy"></iframe>'+'</div>':bibSemanaPreparacion?'<div class="listitem"><h3>Semana '+bibSemanaPreparacion+' · En preparación</h3><p>Esta lección se desarrollará a partir de las separatas y preguntas registradas de Cultura General, sin asignar temas de otros cursos.</p></div>':'<p class="muted">Selecciona una semana para consultar su estado.</p>')+'</div>';
 }
 const area=bibVistaArea;
 const bibIconosCurso={'Razonamiento Matemático':'🧠','Álgebra':'√','Aritmética':'🔢','Trigonometría':'∠','Geometría':'△','Física':'⚡','Química':'⚗','Biología':'🧬','Historia':'📜','Geografía':'🌍','Razonamiento Verbal':'📖','Lenguaje y Literatura':'✒','Psicología':'🧠','Filosofía':'💭','Economía':'📊','Educación Cívica':'⚖','Cultura General':'🌐'};
 const boton=(nombre,activo)=>'<button type="button" class="secondary bib-course-tile" data-bib-curso="'+esc(nombre)+'" '+(activo?'id="bibAbrirPsicologia"':nombre==='Cultura General'?'id="bibAbrirCultura"':nombre==='Razonamiento Verbal'?'id="bibAbrirVerbal"':nombre==='Educación Cívica'?'id="bibAbrirCivica"':'')+' style="min-height:72px;text-align:left;padding:16px;border-radius:12px;width:100%"><span class="bib-course-icon" aria-hidden="true">'+(bibIconosCurso[nombre]||"📚") +'</span><strong>'+esc(nombre)+'</strong><small style="display:block;margin-top:6px">'+(activo?'Abrir lecciones interactivas':(nombre==='Cultura General'||nombre==='Razonamiento Verbal'||nombre==='Educación Cívica'||bibNuevosCursos.includes(nombre))?'Abrir lecciones interactivas':'Próximamente')+'</small></button>';
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
 window.CACHIMBOLAB_QB?.bind();
 document.querySelectorAll('[data-science-official]').forEach(button=>button.addEventListener('click',()=>{
  const section=button.closest('[data-science-course]');if(!section)return;
  window.cachimbolabPracticeLesson?.(section.dataset.scienceCourse,Number(section.dataset.scienceWeek));
 }));
 document.querySelectorAll('[data-science-choice]').forEach(button=>button.addEventListener('click',()=>{
  const quiz=button.closest('.science-challenge');if(!quiz||quiz.dataset.done)return;
  quiz.dataset.done='true';const right=Number(quiz.dataset.answer);
  quiz.querySelectorAll('[data-science-choice]').forEach(option=>{
   option.disabled=true;
   if(Number(option.dataset.scienceChoice)===right){option.style.background='#e2f7e9';option.style.borderColor='#16865a';}
  });
  if(Number(button.dataset.scienceChoice)!==right){button.style.background='#fff0f0';button.style.borderColor='#c45151';}
  const feedback=quiz.querySelector('.science-feedback');if(feedback){
   feedback.hidden=false;
   const isCorrect=Number(button.dataset.scienceChoice)===right;
   feedback.style.background=isCorrect?'#e4f8ed':'#fff0f0';
   feedback.style.borderLeft='4px solid '+(isCorrect?'#16865a':'#c45151');
   const verdict=document.createElement('strong');
   verdict.textContent=isCorrect?'✓ ¡Respuesta correcta!':'✗ Respuesta incorrecta. La alternativa correcta es '+String.fromCharCode(65+right)+'.';
   feedback.prepend(verdict,document.createElement('br'));
  }
 }));

 if(page!=='biblioteca'||bibliotecaLeccionesVista)return;
 document.querySelectorAll('[data-bib-area]').forEach(b=>b.addEventListener('click',()=>{bibVistaArea=b.dataset.bibArea;render()}));
 $('bibVolverAreas')?.addEventListener('click',()=>{bibVistaArea='';render()});
 $('bibAbrirVerbal')?.addEventListener('click',()=>{bibCursoPreparacion='Razonamiento Verbal';bibSemanaPreparacion=null;window.cachimbolabRecordLearningEvent?.('course',bibCursoPreparacion);render()});
 $('bibAbrirCivica')?.addEventListener('click',()=>{bibCursoPreparacion='Educación Cívica';bibSemanaPreparacion=null;window.cachimbolabRecordLearningEvent?.('course',bibCursoPreparacion);render()});
 $('bibAbrirCultura')?.addEventListener('click',()=>{bibCursoPreparacion='Cultura General';bibSemanaPreparacion=null;window.cachimbolabRecordLearningEvent?.('course',bibCursoPreparacion);render()});

 $('bibVolverCursos')?.addEventListener('click',()=>{bibCursoPreparacion='';bibSemanaPreparacion=null;render()});
 document.querySelectorAll('[data-bib-semana]').forEach(b=>b.addEventListener('click',()=>{bibSemanaPreparacion=Number(b.dataset.bibSemana);window.cachimbolabRecordLearningEvent?.('week',bibCursoPreparacion,bibSemanaPreparacion);window.cachimbolabRememberCPU?.(bibCursoPreparacion,bibSemanaPreparacion);render();if((bibCursoPreparacion==='Razonamiento Matemático'||bibCursoPreparacion==='Aritmética')&&!bibRows.length)bibLoad()}));
 document.querySelectorAll('[data-bib-curso]:not(#bibAbrirPsicologia):not(#bibAbrirCultura):not(#bibAbrirVerbal):not(#bibAbrirCivica)').forEach(b=>b.addEventListener('click',()=>{if(bibNuevosCursos.includes(b.dataset.bibCurso)){bibCursoPreparacion=b.dataset.bibCurso;bibSemanaPreparacion=null;window.cachimbolabRecordLearningEvent?.('course',bibCursoPreparacion);render();if(bibCursoPreparacion==='Razonamiento Matemático'||bibCursoPreparacion==='Aritmética')bibLoad();return;}alert('Las lecciones de '+b.dataset.bibCurso+' se incorporarán próximamente.')}));
}
