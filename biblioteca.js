'use strict';
const BIB_AREAS={
 'Ciencias y números':['Razonamiento Matemático','Álgebra','Aritmética','Trigonometría','Geometría','Física','Química','Biología'],
 'Letras y humanidades':['Razonamiento Verbal','Cultura General','Educación Cívica','Historia','Geografía','Lenguaje','Literatura','Lenguaje y Literatura','Psicología','Filosofía','Economía']
};
let bibRows=[],bibLoading=false,bibError='',bibArea='Ciencias y números',bibMateria='',bibSemana='',bibFicha='',bibModalidad='CPU-UNSM',bibEditing='',bibCreating=false;
function bibSubjects(){return BIB_AREAS[bibArea]||[];}
let bibVistaArea='';
function bibPage(){
 const area=bibVistaArea;
 const boton=(nombre,activo)=>'<button type="button" class="secondary" data-bib-curso="'+esc(nombre)+'" '+(activo?'id="bibAbrirPsicologia"':'')+' style="min-height:72px;text-align:left;padding:16px;border-radius:12px;width:100%"><strong>'+esc(nombre)+'</strong><small style="display:block;margin-top:6px">'+(activo?'Abrir lecciones interactivas':'Próximamente')+'</small></button>';
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
 document.querySelectorAll('[data-bib-curso]:not(#bibAbrirPsicologia)').forEach(b=>b.addEventListener('click',()=>{alert('Las lecciones de '+b.dataset.bibCurso+' se incorporarán próximamente.')}));
}
