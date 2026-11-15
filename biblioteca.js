'use strict';
const BIB_AREAS={
 'Ciencias y números':['Razonamiento Matemático','Álgebra','Aritmética','Trigonometría','Geometría','Física','Química','Biología'],
 'Letras y humanidades':['Razonamiento Verbal','Cultura General','Educación Cívica','Historia','Geografía','Lenguaje','Literatura','Lenguaje y Literatura','Psicología','Filosofía','Economía']
};
let bibRows=[],bibLoading=false,bibError='',bibArea='Ciencias y números',bibMateria='',bibSemana='',bibFicha='',bibModalidad='CPU-UNSM',bibEditing='',bibCreating=false;
function bibSubjects(){return BIB_AREAS[bibArea]||[];}
function bibPage(){
 const materias=bibSubjects();
 const filtered=bibRows.filter(x=>x.modalidad===bibModalidad&&x.area===bibArea&&(!bibMateria||x.materia===bibMateria)&&(!bibSemana||String(x.semana)===bibSemana));
 const selected=filtered.find(x=>x.id===bibFicha);
 const option=(v,label,selected)=>'<option value="'+esc(v)+'"'+(selected?' selected':'')+'>'+esc(label)+'</option>';
 return '<div class="card"><h2>📖 Biblioteca de fórmulas y teoría esencial</h2><p class="muted">Estudia por área, materia, semana y tema. Las fichas se publican después de su revisión académica.</p>'+
 '<div class="grid"><label>Modalidad<select id="bibModalidad">'+['CPU-UNSM','BECA18'].map(v=>option(v,v,v===bibModalidad)).join('')+'</select></label>'+
 '<label>Área<select id="bibArea">'+Object.keys(BIB_AREAS).map(v=>option(v,v,v===bibArea)).join('')+'</select></label>'+
 '<label>Materia<select id="bibMateria">'+option('','Todas las materias',!bibMateria)+materias.map(v=>option(v,v,v===bibMateria)).join('')+'</select></label>'+
 '<label>Semana<select id="bibSemana">'+option('','Todas las semanas',!bibSemana)+[...new Set(bibRows.filter(x=>x.modalidad===bibModalidad&&x.area===bibArea&&(!bibMateria||x.materia===bibMateria)).map(x=>x.semana))].sort((a,b)=>a-b).map(v=>option(v,'Semana '+v,String(v)===bibSemana)).join('')+'</select></label></div>'+
 (bibLoading?'<p role="status">Cargando biblioteca...</p>':'')+
 (bibError?'<p role="alert">'+esc(bibError)+'</p>':'')+
 (selected?'<button class="secondary" id="bibBack">← Volver a los temas</button><h3>'+esc(selected.tema)+'</h3><p class="muted">'+esc(selected.materia)+' · Semana '+esc(selected.semana)+'</p>'+(admin()?'<p><button id="bibEditCurrent" type="button" class="secondary">✏️ Editar este tema</button></p>':'')+
 [['Resumen',selected.resumen],['Teoría esencial',selected.teoria],['Fórmulas',selected.formulas],['Ejemplo resuelto',selected.ejemplo],['Errores frecuentes',selected.errores],['Claves para recordar',selected.claves]].filter(x=>x[1]).map(x=>'<section class="listitem"><h3>'+esc(x[0])+'</h3><div style="white-space:pre-wrap;overflow-wrap:anywhere">'+esc(x[1])+'</div></section>').join(''):'<h3>Temas disponibles</h3>'+(filtered.length?filtered.map(x=>'<div class="listitem"><strong>'+esc(x.tema)+'</strong><p class="muted">'+esc(x.materia)+' · Semana '+esc(x.semana)+'</p>'<button class="secondary" data-bib-id="'+esc(x.id)+'">Estudiar tema</button></div>').join(''):'<p class="muted">Todavía no hay fichas publicadas para estos filtros. Se incorporarán progresivamente después de su revisión.</p>'))+
 (admin()?'<hr><h3>Administración de la biblioteca</h3>'+(bibEditing||bibCreating?'<form id="bibForm"><div class="grid"><label>Materia<select name="materia" required>'+materias.map(v=>option(v,v,false)).join('')+'</select></label><label>Semana<input name="semana" type="number" min="0" max="60" required></label><label>Tema<input name="tema" required maxlength="180"></label></div>'+[['resumen','Resumen'],['teoria','Teoría esencial'],['formulas','Fórmulas (LaTeX permitido)'],['ejemplo','Ejemplo resuelto'],['errores','Errores frecuentes'],['claves','Claves para recordar']].map(([k,l])=>'<label style="display:block;margin:12px 0">'+l+'<textarea name="'+k+'" rows="3" style="width:100%"></textarea></label>').join('')+'<label>Estado<select name="estado"><option value="borrador">Borrador</option><option value="revision">En revisión</option><option value="publicada">Publicada</option></select></label><p><button type="submit">Guardar ficha</button></p><p id="bibSaveStatus" role="status"></p></form>':'<p class="muted">Abre un tema y pulsa «Editar este tema» para corregirlo o ampliarlo.</p><button id="bibCreateNew" type="button" class="secondary">+ Crear tema nuevo</button>'):'')+'</div>';
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
 if(page!=='biblioteca')return;
 if(typeof renderMathInElement==='function')renderMathInElement($('app'),{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false});
 const change=(id,fn)=>$(id)?.addEventListener('change',e=>{fn(e.target.value);bibFicha='';bibEditing='';render();});
 change('bibModalidad',v=>{bibModalidad=v;bibMateria='';bibSemana='';});
 change('bibArea',v=>{bibArea=v;bibMateria='';bibSemana='';});
 change('bibMateria',v=>{bibMateria=v;bibSemana='';});
 change('bibSemana',v=>bibSemana=v);
 $('bibBack')?.addEventListener('click',()=>{bibFicha='';render();});
 document.querySelectorAll('[data-bib-id]').forEach(b=>b.addEventListener('click',()=>{bibFicha=b.dataset.bibId;render();}));
 $('bibEditCurrent')?.addEventListener('click',()=>{bibEditing=bibFicha;bibCreating=false;render();});
 $('bibCreateNew')?.addEventListener('click',()=>{bibEditing='';bibCreating=true;render();});
 const editRow=bibRows.find(x=>x.id===bibEditing);
 if(editRow){const form=$('bibForm');if(form){for(const name of ['materia','semana','tema','resumen','teoria','formulas','ejemplo','errores','claves','estado']){const el=form.elements.namedItem(name);if(el)el.value=editRow[name]??'';}}}
 $('bibForm')?.addEventListener('submit',async e=>{
  e.preventDefault();const form=e.currentTarget;const button=form.querySelector('button[type=submit]');button.disabled=true;
  const f=new FormData(form),obj=Object.fromEntries(f.entries());
  obj.semana=Number(obj.semana);obj.modalidad=bibModalidad;obj.area=bibArea;obj.ciclo='GENERAL';if(!bibEditing)obj.autor_id=user.id;
  try{
   if(!BIB_AREAS[bibArea].includes(obj.materia))throw Error('Materia no pertenece al área.');
   const {error}=bibEditing?await db.from('biblioteca_fichas').update(obj).eq('id',bibEditing):await db.from('biblioteca_fichas').insert(obj);
   if(error)throw error;
   await bibLoad();
  }catch(err){const status=$('bibSaveStatus');if(status)status.textContent='No se guardó: '+err.message;}
  finally{if(button.isConnected)button.disabled=false;}
 });
}
