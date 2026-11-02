import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const diagramCode=source.slice(source.indexOf('// Diagramas esquemáticos'),source.indexOf('function espacioImagenPrivada'));
const question={id:'geometry-2',subject:'Geometría',week:11,cycle:'2026-II',modality:'CPU-UNSM',original_number:2};
function fixture(saved=new Set()){
  const state={role:'admin',confirm:true,error:null,loadError:null,writes:0,figures:[]};
  const db={from(table){
    assert.equal(table,'question_support_diagram_removals');
    return {
      async select(){return {data:[...saved].map(question_id=>({question_id})),error:state.loadError};},
      insert(row){
        state.writes++;
        return {select(){return {async single(){
          if(state.error)return {error:state.error};
          saved.add(row.question_id);
          return {data:row,error:null};
        }};}};
      }
    };
  }};
  const context=vm.createContext({
    db,admin:()=>state.role==='admin',esc:s=>String(s),
    confirm:()=>state.confirm,console:{error(){}},
    document:{querySelectorAll:()=>state.figures.filter(f=>!f.removed)}
  });
  vm.runInContext(diagramCode,context);
  const figure=()=>{
    const button={dataset:{removeSupportDiagram:question.id},disabled:false};
    const status={textContent:''};
    const fig={dataset:{supportDiagram:question.id},removed:false,remove(){this.removed=true;},
      querySelector:s=>s==='[data-support-diagram-status]'?status:button};
    state.figures.push(fig);
    return {fig,button,status,event:{target:{closest:()=>button}}};
  };
  return {state,context,figure,saved};
}

test('button is admin-only; only eligible automatic diagrams render',async()=>{
  const {context,state}=fixture();
  assert.equal(context.figuraGeometriaSemana11(question),'');
  await context.cargarEsquemasEliminados();
  assert.match(context.figuraGeometriaSemana11(question),/Eliminar esquema de apoyo/);
  for(const role of ['teacher','student']){
    state.role=role;
    const html=context.figuraGeometriaSemana11(question);
    assert.match(html,/<img/);
    assert.doesNotMatch(html,/data-remove-support-diagram/);
  }
  for(const extra of [{original_number:1},{week:12},{subject:'Química'},{exam_id:'exam'},{modality:'BECA18'}]){
    assert.equal(context.figuraGeometriaSemana11({...question,...extra}),'');
  }
});

test('successful deletion removes all copies and survives a new page session',async()=>{
  const f=fixture();
  await f.context.cargarEsquemasEliminados();
  const original=JSON.stringify(question),first=f.figure(),second=f.figure();
  await f.context.eliminarEsquemaApoyo(first.event);
  assert.equal(f.state.writes,1);
  assert.ok(first.fig.removed&&second.fig.removed);
  assert.equal(f.context.figuraGeometriaSemana11(question),'');
  assert.equal(JSON.stringify(question),original);
  const reloaded=fixture(f.saved);
  await reloaded.context.cargarEsquemasEliminados();
  assert.equal(reloaded.context.figuraGeometriaSemana11(question),'');
  assert.match(reloaded.context.figuraGeometriaSemana11({...question,id:'other'}),/<img/);
});

test('students, teachers and cancelled confirmation cannot request deletion',async()=>{
  const f=fixture(),view=f.figure();
  for(const role of ['teacher','student']){
    f.state.role=role;
    await f.context.eliminarEsquemaApoyo(view.event);
  }
  f.state.role='admin';f.state.confirm=false;
  await f.context.eliminarEsquemaApoyo(view.event);
  assert.equal(f.state.writes,0);
  assert.equal(view.fig.removed,false);
});

test('failed writes preserve diagram, show an error and allow retry',async()=>{
  const f=fixture(),view=f.figure();
  f.state.error={code:'42501',message:'permission denied'};
  await f.context.eliminarEsquemaApoyo(view.event);
  assert.equal(view.fig.removed,false);
  assert.match(view.status.textContent,/No se eliminó/);
  assert.equal(view.button.disabled,false);
  f.state.error=null;
  await f.context.eliminarEsquemaApoyo(view.event);
  assert.equal(view.fig.removed,true);
});

test('load failure never resurrects a permanently removed diagram',async()=>{
  const f=fixture(new Set([question.id]));
  await f.context.cargarEsquemasEliminados();
  f.state.loadError={message:'offline'};
  await f.context.cargarEsquemasEliminados();
  assert.equal(f.context.figuraGeometriaSemana11(question),'');
});
