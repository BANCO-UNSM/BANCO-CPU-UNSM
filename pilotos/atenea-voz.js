/* Atenea: síntesis de voz compatible con Android y navegadores móviles. */
(function(){
'use strict';
const female=/(female|femenina|sabina|paulina|helena|lucia|lucía|sofia|sofía|maria|maría|monica|mónica|paloma|laura|carmen|dalia|elvira|camila|valentina|alexa|conchita|ines|inés|rosa|silvia|gabriela)/i;
function chooseVoice(){
 const synth=window.speechSynthesis;
 if(!synth)return null;
 const spanish=synth.getVoices().filter(v=>/^es(?:-|$)/i.test(v.lang||''));
 return spanish.sort((a,b)=>{
  const score=v=>(female.test(v.name||'')?100:0)+(/^es-PE$/i.test(v.lang)?30:0)+(/natural|neural|premium/i.test(v.name)?10:0);
  return score(b)-score(a);
 })[0]||null;
}
window.ateneaVozFemenina=chooseVoice;
window.ateneaSpeak=function(utterance){
 if(!window.speechSynthesis||!window.SpeechSynthesisUtterance)return false;
 const voice=chooseVoice();
 if(voice){utterance.voice=voice;utterance.lang=voice.lang;}
 else{utterance.lang='es-ES';}
 utterance.pitch=1;
 try{window.speechSynthesis.speak(utterance);return true;}
 catch(err){console.warn('Atenea no pudo iniciar audio',err);return false;}
};
window.speechSynthesis?.addEventListener?.('voiceschanged',chooseVoice);
})();
