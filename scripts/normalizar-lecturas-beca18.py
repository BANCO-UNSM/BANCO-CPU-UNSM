#!/usr/bin/env python3
"""Reconstruct Beca 18 reading passages from the three supplied official exam booklets.
Keeps question text, answers, image references, and the editorial metadata unchanged.
"""
import json,re,subprocess,sys
from pathlib import Path

BASE=Path('.')
CODE={'p':'é','t':'í','y':'ó','i':'á','x':'ñ','~':'ú','¢':'¿','³':'“','´':'”','Ï':'Ó','È':'Á','¿':'fi','À':'fl','£':'¡'}
PDF={y:Path('/tmp/beca18')/f'{y}.pdf' for y in (2023,2024,2025)}
def page(year,n):
    proc=subprocess.run(['pdftotext','-f',str(n),'-l',str(n),'-layout',str(PDF[year]),'-'],
                        check=True,stdout=subprocess.PIPE)
    txt=proc.stdout.decode('utf-8','replace').replace('\f','')
    if year==2025:
        txt=''.join(c if c in '\n\t\r ' else CODE[c] if c in CODE
            else (' ' if ord(c)==3 else chr(ord(c)+29)) if 3<=ord(c)<=93 else c for c in txt)
    return txt
def cut(year,pg,start=None,end=None):
    txt=page(year,pg)
    if start:
        m=re.search(start,txt,re.I|re.M)
        if not m:raise ValueError(f'Cannot find start for {year} page {pg}: {start}')
        txt=txt[m.start():]
    if end:
        m=re.search(end,txt,re.I|re.M)
        if not m:raise ValueError(f'Cannot find end for {year} page {pg}: {end}')
        txt=txt[:m.start()]
    return txt
BANNER=re.compile(r'(?im)^\s*(?:Examen Nacional de Preselecci[oó]n|BECA\s*18\s*[–-]\s*Convocatoria\s*20\d\d|COMPETENCIA LECTORA|3iJLQD.*?|P[aá]gina\s*\d+|\d{1,2})\s*$')
CONTROL=re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f\ufffd]')
def clean(txt):
    txt=CONTROL.sub('',txt)
    txt='\n'.join(line for line in txt.splitlines() if not BANNER.match(line))
    txt=re.sub(r'(?:\n\s*){3,}','\n\n',txt)
    paragraphs=re.split(r'\n\s*\n',txt)
    cleaned=[]
    for para in paragraphs:
        para=re.sub(r'\s*\n\s*',' ',para)
        para=re.sub(r'[ \t]{2,}',' ',para).strip()
        if para:cleaned.append(para)
    return '\n\n'.join(cleaned)
Q23=r'^\s*(?:3[1-9]|4\d|5\d|60)\.\s+'
Q24=r'^\s*(?:3[1-9]|4\d|5\d|60)\s+(?:Seg[uú]n|De|En|Cu[aá]l|Qu[eé]|C[oó]mo|Se|Del|La|A\s+partir|Un|Si|Indique|Marque|Con)\b'
Q25=r'^\s*PREGUNTA\s+\d+'
SEGMENTS={
 2023:{
 2:[(16,r'^\s*TEXTO\s*2\b',None),(17,None,Q23)],
 4:[(19,r'^\s*TEXTO\s*4\b',None),(20,None,Q23)],
 5:[(21,r'^\s*Texto\s*5\b',Q23)],
 6:[(23,r'^\s*TEXTO\s*6\b',Q23)],
 7:[(24,r'^\s*TEXTO\s*7\b',None),(25,None,Q23)],
 8:[(26,r'^\s*TEXTO\s*8\b',Q23)]
 },
 2024:{
 3:[(20,r'^\s*¿Se debería prohibir la tarea\?',None),(21,None,r'^\s*Responde las siguientes preguntas')],
 4:[(22,r'^\s*Rosita(?:\x03)?\s*$',None)],
 5:[(24,r'^\s*Dulces sueños\s*$',None)],
 6:[(26,r'^\s*Cómo prepararse para un examen',None)]
 },
 2025:{
 1:[(15,r'^\s*Texto\s*1\b',None),(16,None,Q25)],
 3:[(19,r'^\s*Texto\s*3\b',None),(20,None,Q25)],
 4:[(21,r'^\s*Texto\s*4\b',None),(22,None,Q25)],
 5:[(23,r'^\s*Texto\s*5\b',None),(24,None,Q25)]
 }
}
DEST=BASE/'beca18-examenes-verbal.json'
data=json.loads(DEST.read_text(encoding='utf-8'))
record=[]
for exam in data['exams']:
 year=exam['year']
 for group in exam['groups']:
    match=re.fullmatch(r'\d{4}-T(\d+)',group['id'])
    if not match:raise RuntimeError('Unexpected group '+group['id'])
    number=int(match.group(1))
    segments=SEGMENTS.get(year,{}).get(number)
    if not segments:
        # Preserve already verified texts and image-led infographic groups.
        continue
    txt=clean('\n\n'.join(cut(year,*segment) for segment in segments))
    if year==2023 and number==6:
        txt=txt.replace('(O0HUFXULR de Chile.','El Mercurio de Chile.')
    if year==2025:
        txt=txt.replace('£Empieza','¡Empieza')
    # Keep source paragraph formatting; blank lines are retained only at paragraph boundaries.
    if not 800<len(txt)<12000:raise RuntimeError(f'Unexpected size: {year} T{number} {len(txt)}')
    if re.search(r'Examen Nacional de Preselección|Convocatoria 2023|3iJLQD|PREGUNTA\s+\d+',txt,re.I):
        raise RuntimeError(f'PDF header or question leaked into {year} T{number}')
    if 'Cyrillic' in txt:raise RuntimeError('Unexpected text')
    group['passage']=txt
    group['transcription_verified_from_pdf']=True
    group['editor_status']='en_revision'
    group['transcription_note']='Transcripción extraída de las páginas del cuadernillo y limpiada de encabezados, numeración, saltos de línea y preguntas. Requiere cotejo editorial final.'
    record.append((year,number,len(txt)))
# Validate that only passages were replaced
assert len(record)==14,record
assert sum(len(exam['questions']) for exam in data['exams'])==90
assert all(len(exam['groups']) in (6,8) for exam in data['exams'])
DEST.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Transcripciones reemplazadas:',record)
