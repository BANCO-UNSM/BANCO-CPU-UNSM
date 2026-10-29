import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';

// Los bancos de exámenes y clases se alojan en Supabase privado.
// Estas comprobaciones evalúan solo los archivos públicos del sitio.
const html=readFileSync('beca18-examenes.html','utf8');
const js=readFileSync('beca18-examenes.js','utf8');
const privateJs=readFileSync('beca-private.js','utf8');
const editor=readFileSync('beca18-editor.html','utf8');
const app=readFileSync('app.js','utf8');
assert.ok(html.includes('id="readingSelect"'),'Falta selector de textos');
assert.ok(html.includes('id="previousReading"')&&html.includes('id="nextReading"'),'Faltan botones de navegación');
assert.ok(html.includes('id="readingText"')&&html.includes('id="originalPages"'),'Faltan lectura e imagen');
assert.ok(js.includes('function navigateToGroup('),'Falta navegación a bloque');
assert.ok(js.includes('current.groups.map((g,i)'),'El selector debe incluir todos los textos del examen');
assert.ok(js.includes('const first=current.questions.find(q=>q.group===index)'),'Al cambiar de texto se debe ir a su primera pregunta');
assert.ok(js.includes('if(lastReadingId===g.id)return'),'El texto debe permanecer fijo mientras se responden sus preguntas');
assert.ok(js.includes('IntersectionObserver'),'La lectura debe sincronizarse al desplazarse entre preguntas');
assert.ok(js.includes("window.becaPrivate.document('beca18-examenes-verbal.json')"),'El banco debe descargarse desde Supabase privado');
assert.ok(privateJs.includes("api().rpc('beca_private_read'"),'El banco necesita lectura autenticada');
assert.ok(!html.includes('Mostrar transcripción de apoyo (opcional)'),'El texto debe mostrarse directamente');
assert.ok(editor.includes('id="readingUpload"')&&editor.includes('id="questionUpload"'),'Faltan herramientas para imágenes');
assert.ok(app.includes('Abrir editor de textos, preguntas e imágenes'),'Falta acceso desde revisión y publicación');
console.log('VALIDACIÓN DE INTERFAZ BECA 18 CORRECTA: selector de textos y lectura privada.');
