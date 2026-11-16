'use strict';
const BIB_AREAS={
 'Ciencias y números':['Razonamiento Matemático','Álgebra','Aritmética','Trigonometría','Geometría','Física','Química','Biología'],
 'Letras y humanidades':['Razonamiento Verbal','Cultura General','Educación Cívica','Historia','Geografía','Lenguaje','Literatura','Lenguaje y Literatura','Psicología','Filosofía','Economía']
};
let bibRows=[],bibLoading=false,bibError='',bibArea='Ciencias y números',bibMateria='',bibSemana='',bibFicha='',bibModalidad='CPU-UNSM',bibEditing='',bibCreating=false;
function bibSubjects(){return BIB_AREAS[bibArea]||[];}
let bibVistaArea='';
let bibCursoPreparacion='';
let bibSemanaPreparacion=null;
function listoSemanaBib(){return (bibCursoPreparacion==='Cultura General'&&[9,11,12,13].includes(bibSemanaPreparacion))||(bibCursoPreparacion==='Razonamiento Verbal'&&[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].includes(bibSemanaPreparacion))||(bibCursoPreparacion==='Educación Cívica'&&bibSemanaPreparacion>=1&&bibSemanaPreparacion<=16)}
function bibPage(){
 if(bibCursoPreparacion){
  const nombre=esc(bibCursoPreparacion);
  const semanas=Array.from({length:16},(_,i)=>{const n=i+1,repaso=(n===10||n===16)||(bibCursoPreparacion==='Educación Cívica'&&n===8),listo=(bibCursoPreparacion==='Cultura General'?[9,11,12,13]:(bibCursoPreparacion==='Razonamiento Verbal'||bibCursoPreparacion==='Educación Cívica')?[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]:[]).includes(n);return '<button type="button" class="secondary" data-bib-semana="'+n+'" aria-pressed="'+(bibSemanaPreparacion===n)+'" style="min-height:74px;border-radius:12px;padding:12px;background:'+(bibSemanaPreparacion===n?'#dceef8':listo?'#e8f8f2':'#f4f8fc')+';color:#163b58"><strong>Semana '+n+'</strong><small style="display:block;margin-top:5px">'+(listo?(repaso?'Ver repaso':'Ver lección'):repaso?'Repaso · En preparación':'En preparación')+'</small></button>'}).join('');
  return '<div class="card"><button type="button" class="secondary" id="bibVolverCursos">← Volver a los cursos de Letras</button><h2 style="margin-top:20px">📚 '+nombre+' · Lecciones interactivas</h2><p class="muted">Ciclo CPU-UNSM · 16 semanas. Las semanas de repaso se organizarán según la programación oficial del curso.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin:22px 0">'+semanas+'</div>'+(listoSemanaBib()?'<div class="card"><h3>Semana '+bibSemanaPreparacion+' · '+nombre+'</h3><p class="muted">Lección interactiva con teoría, narración de Atenea y práctica CPU.</p><iframe title="'+nombre+' semana '+bibSemanaPreparacion+'" src="pilotos/'+(bibCursoPreparacion==='Razonamiento Verbal'?'razonamiento-verbal':bibCursoPreparacion==='Educación Cívica'?'educacion-civica':'cultura-general')+'-semana-'+bibSemanaPreparacion+'.html?v=24" style="width:100%;height:76vh;min-height:600px;border:1px solid #d7e5f1;border-radius:14px;background:white" loading="lazy"></iframe></div>':bibSemanaPreparacion?'<div class="listitem"><h3>Semana '+bibSemanaPreparacion+' · En preparación</h3><p>Esta lección se desarrollará a partir de las separatas y preguntas registradas de Cultura General, sin asignar temas de otros cursos.</p></div>':'<p class="muted">Selecciona una semana para consultar su estado.</p>')+'</div>';
 }
 const area=bibVistaArea;
 const boton=(nombre,activo)=>'<button type="button" class="secondary" data-bib-curso="'+esc(nombre)+'" '+(activo?'id="bibAbrirPsicologia"':nombre==='Cultura General'&&admin()?'id="bibAbrirCultura"':nombre==='Razonamiento Verbal'&&admin()?'id="bibAbrirVerbal"':nombre==='Educación Cívica'&&admin()?'id="bibAbrirCivica"':'')+' style="min-height:72px;text-align:left;padding:16px;border-radius:12px;width:100%"><strong>'+esc(nombre)+'</strong><small style="display:block;margin-top:6px">'+(activo?'Abrir lecciones interactivas':(nombre==='Cultura General'||nombre==='Razonamiento Verbal'||nombre==='Educación Cívica')&&admin()?'Ver semanas':'Próximamente')+'</small></button>';
 if(!area)return '<div class="card"><h2>📚 Lecciones interactivas</h2><p class="muted">Selecciona un área para explorar los cursos y sus lecciones organizadas por semanas.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;margin-top:22px"><button type="button" data-bib-area="Ciencias y números" style="padding:28px 18px;min-height:170px;border-radius:16px;text-align:center"><span style="font-size:36px;display:block;margin-bottom:14px">🔬</span><strong style="font-size:22px">Ciencias</strong><span style="display:block;margin-top:9px;font-size:13px">Matemática, Física, Química y más</span></button><button type="button" data-bib-area="Letras y humanidades" style="padding:28px 18px;min-height:170px;border-radius:16px;text-align:center"><span style="font-size:36px;display:block;margin-bottom:14px">📖</span><strong style="font-size:22px">Letras</strong><span style="display:block;margin-top:9px;font-size:13px">Psicología, Filosofía, Historia y más</span></button></div></div>';
 const materias=BIB_AREAS[area]||[];
 return '<div class="card"><button type="button" class="secondary" id="bibVolverAreas">← Volver a Ciencias y Letras</button><h2 style="margin-top:18px">Lecciones interactivas · '+(area==='Ciencias y números'?'Ciencias':'Letras')+'</h2><p class="muted">Selecciona un curso para acceder a sus lecciones por semana.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin-top:18px">'+materias.map(m=>boton(m,m==='Psicología'&&admin())).join('')+'</div></div>';
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
 if(page!=='biblioteca'||bibliotecaLeccionesVista)return;
 document.querySelectorAll('[data-bib-area]').forEach(b=>b.addEventListener('click',()=>{bibVistaArea=b.dataset.bibArea;render()}));
 $('bibVolverAreas')?.addEventListener('click',()=>{bibVistaArea='';render()});
 $('bibAbrirVerbal')?.addEventListener('click',()=>{bibCursoPreparacion='Razonamiento Verbal';bibSemanaPreparacion=null;render()});
 $('bibAbrirCivica')?.addEventListener('click',()=>{bibCursoPreparacion='Educación Cívica';bibSemanaPreparacion=null;render()});
 $('bibAbrirCultura')?.addEventListener('click',()=>{bibCursoPreparacion='Cultura General';bibSemanaPreparacion=null;render()});
 $('bibVolverCursos')?.addEventListener('click',()=>{bibCursoPreparacion='';bibSemanaPreparacion=null;render()});
 document.querySelectorAll('[data-bib-semana]').forEach(b=>b.addEventListener('click',()=>{bibSemanaPreparacion=Number(b.dataset.bibSemana);render()}));
 document.querySelectorAll('[data-bib-curso]:not(#bibAbrirPsicologia):not(#bibAbrirCultura):not(#bibAbrirVerbal):not(#bibAbrirCivica)').forEach(b=>b.addEventListener('click',()=>{alert('Las lecciones de '+b.dataset.bibCurso+' se incorporarán próximamente.')}));
}
