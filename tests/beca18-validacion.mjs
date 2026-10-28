// Ejecutar desde la raíz: node tests/beca18-validacion.mjs
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';

const d=JSON.parse(readFileSync('beca18-clases.json','utf8'));
assert.equal(d.lessons.length,24,'El curso debe tener 24 clases');
assert.equal(d.lessons.filter(l=>l.area==='Números').length,12);
assert.equal(d.lessons.filter(l=>l.area==='Letras').length,12);
assert.ok(d.questions.length>=120,'Debe existir una práctica por tema');
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
assert.ok(html.includes('id="diagnostic"'),'Falta contenedor de diagnóstico');
assert.ok(html.includes('id="clearProgress"'),'Falta botón para borrar progreso');
console.log('VALIDACIÓN BECA 18 CORRECTA:',d.lessons.length,'clases y',d.questions.length,'preguntas originales.');
