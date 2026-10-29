(()=>{'use strict';
const selector='#questionForm [name="statement"],#questionForm [name="explanation"],#questionForm [name^="option"],#reviewForm [name="statement"],#reviewForm [name="explanation"],#reviewForm [name^="option"]';
const initialized=new WeakSet();
const css=document.createElement('style');
css.textContent='.math-help{margin:7px 0 13px;padding:10px;border:1px solid #d3e0ec;border-radius:10px;background:#f8fbff;box-sizing:border-box}.math-help button{margin:3px;padding:6px 9px;border:1px solid #bbd3e2;border-radius:7px;background:white;color:#18516b;font-size:12px;cursor:pointer}.math-help .math-preview{background:white;border:1px solid #e2e8f0;border-radius:7px;min-height:35px;padding:8px 10px;margin-top:6px;white-space:pre-wrap;overflow-x:auto;line-height:1.55}.math-help .math-panel{display:none;margin-top:8px;border-top:1px solid #d3e0ec;padding-top:9px}.math-help .math-panel.visible{display:block}.math-help math-field{display:block;width:100%;box-sizing:border-box;min-height:52px;border:1px solid #93b5cb;border-radius:8px;background:white;padding:9px;font-size:21px}.math-help .math-hint{font-size:11px;color:#526779;margin:5px 0}.math-help .math-title{font-size:12px;font-weight:700;color:#24546f}';
document.head.appendChild(css);
const commands=[['Fracción','\\frac{\\placeholder{a}}{\\placeholder{b}}'],['√ Raíz','\\sqrt{\\placeholder{x}}'],['x² Potencia','x^{\\placeholder{n}}'],['sen','\\operatorname{sen}x'],['cos','\\cos x'],['tg','\\operatorname{tg}x'],['π','\\pi'],['∑','\\sum_{i=1}^{n}']];
function preview(target,source){
 target.textContent=source||'';
 if(typeof window.renderMathInElement==='function')try{window.renderMathInElement(target,{delimiters:[{left:'$$',right:'$$',display:true},{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false},{left:'$',right:'$',display:false}],throwOnError:false});}catch(e){console.warn('Vista matemática:',e);}
}
function insertAtCursor(input,latex){
 const begin=Number.isInteger(input.selectionStart)?input.selectionStart:input.value.length,end=Number.isInteger(input.selectionEnd)?input.selectionEnd:begin;
 const before=input.value.slice(0,begin),after=input.value.slice(end);
 input.setRangeText((before&&!/\s$/.test(before)?' ':'')+'\\('+latex+'\\)'+(after&&!/^\s/.test(after)?' ':''),begin,end,'end');
 input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();
}
function attach(input){
 if(initialized.has(input)||input.disabled||input.readOnly)return;initialized.add(input);
 const help=document.createElement('div');help.className='math-help';
 const heading=document.createElement('div');heading.className='math-title';heading.textContent='✏️ Editor matemático: texto normal + fórmulas';
 const toolbar=document.createElement('div');
 const open=document.createElement('button');open.type='button';open.textContent='🧮 Abrir editor visual';toolbar.append(open);
 const panel=document.createElement('div');panel.className='math-panel';
 const hint=document.createElement('p');hint.className='math-hint';hint.textContent='Dentro del editor, escribe 1/2 o x^2, o utiliza los botones. Pulsa Insertar ecuación para guardarla en el texto.';
 const field=document.createElement('math-field');field.setAttribute('aria-label','Editor visual de ecuaciones');
 const insert=document.createElement('button');insert.type='button';insert.textContent='Insertar ecuación';
 const close=document.createElement('button');close.type='button';close.textContent='Cerrar';
 panel.append(hint,field,insert,close);
 commands.forEach(([label,latex])=>{
  const b=document.createElement('button');b.type='button';b.textContent=label;
  b.onclick=()=>{panel.classList.add('visible');field.focus();if(typeof field.insert==='function')field.insert(latex,{selectionMode:'placeholder'});else field.value=(field.value||'')+latex;};
  toolbar.append(b);
 });
 const label=document.createElement('div');label.className='math-title';label.textContent='Vista previa:';
 const output=document.createElement('div');output.className='math-preview';
 input.addEventListener('input',()=>preview(output,input.value));
 open.onclick=()=>{panel.classList.toggle('visible');if(panel.classList.contains('visible'))field.focus();};
 close.onclick=()=>panel.classList.remove('visible');
 insert.onclick=()=>{const latex=String(field.value||'').trim();if(!latex)return;insertAtCursor(input,latex);field.value='';panel.classList.remove('visible');};
 help.append(heading,toolbar,panel,label,output);input.insertAdjacentElement('afterend',help);preview(output,input.value);
}
function scan(){document.querySelectorAll(selector).forEach(attach);}
function start(){scan();new MutationObserver(scan).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();