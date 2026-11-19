(function(){
'use strict';
const L={
9:{title:'Unidades químicas de concentración',intro:'Concentración de soluciones: cómo relacionar la cantidad de soluto con la cantidad de solución o disolvente.',theory:[
['Solución y componentes','Una solución es una mezcla homogénea. El soluto es la sustancia disuelta y el disolvente es el medio que la disuelve.'],
['Unidades físicas','El porcentaje masa/masa compara masa del soluto con masa de solución; masa/volumen se expresa en g por cada 100 mL; volumen/volumen usa volúmenes de la misma unidad.'],
['Unidades químicas','La molaridad mide moles de soluto por litro de solución; la molalidad mide moles por kilogramo de disolvente. No son intercambiables.'],
['Diluciones','Al añadir disolvente disminuye la molaridad, pero la cantidad de soluto permanece constante si no hay reacción.']
],formulas:[
['Molaridad',String.raw`M=\\frac{n_{soluto}}{V_{solución}(L)}`],
['Moles',String.raw`n=\\frac{m}{M_m}`],
['Porcentaje masa/masa',String.raw`\\%m/m=\\frac{m_{soluto}}{m_{solución}}\\cdot100`],
['Dilución',String.raw`M_1V_1=M_2V_2`]],
examples:[
{title:'Preparación de una solución molar',steps:['Enunciado: se disuelven 0,50 mol de NaCl hasta completar 2,0 L de solución. Hallar M.','Datos: n = 0,50 mol; V = 2,0 L.',String.raw`M=\\frac{n}{V}=\\frac{0.50}{2.0}=0.25\\;mol/L`,'Respuesta: 0,25 M.']},
{title:'Cálculo de una dilución',steps:['Enunciado: ¿qué volumen de solución 2 M se requiere para preparar 200 mL de solución 0,50 M?','Datos: M₁ = 2 M; M₂ = 0,50 M; V₂ = 200 mL.',String.raw`V_1=\\frac{M_2V_2}{M_1}=\\frac{0.50(200)}{2}=50\\;mL`,'Respuesta: 50 mL de solución concentrada, y completar con disolvente hasta 200 mL.']}
],cards:[['¿Qué volumen aparece en el denominador de la molaridad?','Litros de solución, no litros de disolvente.'],['¿En qué se diferencian molaridad y molalidad?','Molaridad: mol/L de solución. Molalidad: mol/kg de disolvente.'],['¿Qué magnitud permanece constante al diluir sin reacción?','Los moles de soluto.'],['¿Cómo se obtiene el porcentaje masa/masa?','Masa de soluto dividida por masa total de solución, multiplicada por 100.']]},
11:{title:'Cinética química y equilibrio químico',intro:'Velocidad de reacción, ley de velocidad, equilibrio dinámico y constantes de equilibrio.',theory:[
['Cinética química','La velocidad de reacción indica cuánto cambia la concentración por unidad de tiempo. Los reactivos se consumen y los productos se forman.'],
['Coeficientes estequiométricos','Para comparar velocidades de sustancias se divide la variación de concentración entre el coeficiente balanceado de cada especie.'],
['Ley de velocidad','La forma v = k[A]ᵐ[B]ⁿ se determina experimentalmente, salvo que se trate de una etapa elemental. Los exponentes indican órdenes parciales.'],
['Equilibrio químico','En equilibrio dinámico, las velocidades directa e inversa son iguales, aunque ambas reacciones continúan ocurriendo.'],
['Ley de acción de masas','Para aA+bB ⇌ cC+dD, Kc utiliza concentraciones molares elevadas a sus coeficientes; no se incluyen sólidos puros ni líquidos puros.'],
['Principio de Le Châtelier','Un sistema en equilibrio responde a perturbaciones de concentración, presión o temperatura. Solo un cambio de temperatura modifica K a una temperatura dada.']
],formulas:[
['Velocidad de reacción',String.raw`v=-\\frac1a\\frac{\\Delta[A]}{\\Delta t}=\\frac1c\\frac{\\Delta[C]}{\\Delta t}`],
['Ley de velocidad',String.raw`v=k[A]^m[B]^n`],
['Constante de equilibrio',String.raw`K_c=\\frac{[C]^c[D]^d}{[A]^a[B]^b}`],
['Relación Kp y Kc',String.raw`K_p=K_c(RT)^{\\Delta n_{gas}}`]],
examples:[
{title:'Velocidades estequiométricas',steps:['Enunciado: en 2A + 4B → 5C + D, el producto C aparece a 10 M/s. Hallar la rapidez de consumo de B.',String.raw`v=\\frac1{5}\\frac{\\Delta[C]}{\\Delta t}=\\frac{10}{5}=2\\;M/s`,String.raw`-\\frac{\\Delta[B]}{\\Delta t}=4v=4(2)=8\\;M/s`,'Respuesta: B se consume a 8 M/s.']},
{title:'Constante de equilibrio',steps:['Enunciado: en 2A ⇌ B, al equilibrio [A] = 0,40 M y [B] = 1,20 M. Hallar Kc.',String.raw`K_c=\\frac{[B]}{[A]^2}=\\frac{1.20}{(0.40)^2}`,String.raw`K_c=7.5`,'Respuesta: Kc = 7,5.']}
],cards:[['¿Qué ocurre con las velocidades directa e inversa al llegar al equilibrio?','Se igualan, pero las reacciones continúan.'],['¿Se incluyen los sólidos puros en la expresión de Kc?','No; su actividad se considera constante.'],['¿Qué significa un orden dos respecto a B?','Si solo [B] se duplica, la velocidad se multiplica por cuatro.'],['¿Qué modifica el valor numérico de K para una reacción determinada?','La temperatura.']]},
12:{title:'Ácidos, bases, pH y electrólisis',intro:'Teorías ácido-base, cálculo de pH y pOH, neutralización y leyes de Faraday.',theory:[
['Ácidos y bases de Arrhenius','En agua, un ácido incrementa la concentración de H₃O⁺ y una base incrementa la de OH⁻.'],
['Brønsted-Lowry','Un ácido dona protones H⁺; una base los acepta. El agua puede actuar como ácido o base según la reacción.'],
['Escala de pH','A 25 °C, pH + pOH = 14. Una solución neutra tiene pH 7; una ácida, pH inferior a 7; y una básica, superior a 7.'],
['Ácidos y bases débiles','Se ionizan parcialmente. Ka y Kb caracterizan sus equilibrios. No se debe aplicar concentración = [H⁺] automáticamente a un ácido débil.'],
['Neutralización','Los equivalentes de ácido y base reaccionan según la estequiometría. Se debe considerar concentración y volumen de cada disolución.'],
['Electrólisis','Una corriente eléctrica impulsa una reacción no espontánea. La masa depositada se relaciona con la carga eléctrica y el número de electrones intercambiados.']
],formulas:[
['Potencial de hidrógeno',String.raw`pH=-\\log[H_3O^+]`],
['Relación pH y pOH a 25 °C',String.raw`pH+pOH=14`],
['Producto iónico del agua a 25 °C',String.raw`K_w=[H_3O^+][OH^-]=10^{-14}`],
['Carga eléctrica',String.raw`Q=I\\,t`],
['Ley de Faraday',String.raw`m=\\frac{M_mIt}{zF}`]],
examples:[
{title:'pH de una disolución',steps:['Enunciado: una disolución tiene [H₃O⁺] = 10⁻⁴ mol/L. Hallar el pH.',String.raw`pH=-\\log(10^{-4})=4`,'Respuesta: pH = 4; es ácida.']},
{title:'pOH a partir del pH',steps:['Enunciado: una solución acuosa a 25 °C tiene pH = 5. Hallar pOH.',String.raw`pOH=14-5=9`,'Respuesta: pOH = 9.']}
],cards:[['¿Qué es un ácido según Brønsted-Lowry?','Una especie que dona protones.'],['¿Qué es una base según Brønsted-Lowry?','Una especie que acepta protones.'],['¿En qué condiciones pH + pOH = 14?','En soluciones acuosas a 25 °C, aproximadamente.'],['¿Qué representa F en la ley de Faraday?','La constante de Faraday, aproximadamente 96 485 C/mol de electrones.']]},
13:{title:'Química orgánica: hidrocarburos',intro:'Estructura del carbono, clasificación de hidrocarburos, nomenclatura e isomería.',theory:[
['El carbono y sus enlaces','El carbono es tetravalente y puede formar cadenas abiertas, ramificadas o cíclicas. Los enlaces simples, dobles y triples determinan la familia del compuesto.'],
['Alcanos','Son hidrocarburos saturados de cadena abierta, con enlaces C–C simples y fórmula CₙH₂ₙ₊₂. Los de cadena abierta se nombran con sufijo -ano.'],
['Alquenos y alquinos','En cadenas abiertas con un doble enlace, la fórmula general es CₙH₂ₙ; con un triple enlace, CₙH₂ₙ₋₂. Los sufijos son -eno e -ino.'],
['Nomenclatura básica','Selecciona la cadena principal pertinente, numera para dar localizadores bajos a las insaturaciones y después a sustituyentes, y ordena sustituyentes alfabéticamente según corresponda.'],
['Isomería estructural','Dos sustancias pueden tener la misma fórmula molecular y distinta conexión de átomos. El pentano, 2-metilbutano y 2,2-dimetilpropano son isómeros de cadena.'],
['Tipos de carbono','Un carbono primario se une a un carbono; secundario, a dos; terciario, a tres; cuaternario, a cuatro.']
],formulas:[
['Alcano acíclico saturado',String.raw`C_nH_{2n+2}`],
['Alqueno acíclico con un doble enlace',String.raw`C_nH_{2n}`],
['Alquino acíclico con un triple enlace',String.raw`C_nH_{2n-2}`],
['Ejemplo de alqueno',String.raw`CH_2=CH_2\\quad(C_2H_4)`]],
examples:[
{title:'Identificar un hidrocarburo',steps:['Enunciado: un hidrocarburo acíclico saturado tiene cinco carbonos. ¿Cuál es su fórmula molecular?',String.raw`H=2n+2=2(5)+2=12`,String.raw`C_5H_{12}`,'Respuesta: C₅H₁₂ (pentano y sus isómeros de cadena).']},
{title:'Clasificar enlaces y nombrar',steps:['Enunciado: identifica la familia y nombra CH₃–CH=CH₂.','La cadena tiene 3 carbonos y un doble enlace. La numeración otorga al doble enlace el localizador 1.',String.raw`CH_3-CH=CH_2\\quad C_3H_6`,'Respuesta: propeno (prop-1-eno).']}
],cards:[['¿Qué distingue un alcano de un alqueno?','El alcano solo presenta enlaces C–C simples; el alqueno contiene al menos un doble enlace.'],['¿Qué sufijo corresponde a un alquino?','-ino.'],['¿Qué es un carbono terciario?','Un átomo de carbono unido directamente a otros tres carbonos.'],['¿Qué comparten los isómeros estructurales?','La misma fórmula molecular, pero diferente conectividad.']]}
};
window.CACHIMBOLAB_CHEMISTRY_LESSONS=L;
})();