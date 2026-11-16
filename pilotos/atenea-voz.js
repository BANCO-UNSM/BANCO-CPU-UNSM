/* CachimboLab: voz coherente para la narradora Atenea. */
(function(){
'use strict';
const femaleNames=/(?:female|femenina|woman|mujer|sabina|paulina|helena|lucia|lucía|sofia|sofía|elena|maría|maria|mónica|monica|paloma|laura|carmen|dalia|elvira|isabela|isabella|camila|valentina|ximena|alexa|conchita|penelope|penélope|ines|inés|elsa|rosa|silvia|silvana|lupe|esmeralda|alondra|gabriela|teresa|nuria)/i;
const maleNames=/(?:\bmale\b|masculin|hombre|jorge|diego|pablo|ra[uú]l|carlos|enrique|antonio|[aá]lvaro|manuel|francisco|jorge|juan|pedro|andres|andr[eé]s|alberto|jor[díi]|mario|rodrigo|david|jos[eé]|miguel|luis|hern[aá]n|pablo)/i;
let warned=false;
function pick(){
 const synth=window.speechSynthesis;
 if(!synth)return null;
 const voices=synth.getVoices().filter(v=>/^es(?:-|$)/i.test(v.lang||'')&&femaleNames.test(v.name||'')&&!maleNames.test(v.name||''));
 return voices.sort((a,b)=>Number(/^es-PE$/i.test(b.lang))-Number(/^es-PE$/i.test(a.lang))||Number(/natural|neural|premium/i.test(b.name))-Number(/natural|neural|premium/i.test(a.name)))[0]||null;
}
window.ateneaVozFemenina=pick;
window.ateneaSpeak=function(utterance){
 const voice=pick();
 if(!voice){
  if(!warned){
   warned=true;
   alert('Atenea necesita una voz femenina en español. Este navegador no tiene una voz femenina identificable disponible. Instala o activa una voz femenina en español en las opciones de voz del dispositivo y vuelve a abrir la lección.');
  }
  return false;
 }
 utterance.voice=voice;
 utterance.lang=voice.lang;
 utterance.pitch=1;
 window.speechSynthesis.speak(utterance);
 return true;
};
})();