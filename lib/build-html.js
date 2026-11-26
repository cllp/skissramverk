// Spec (JSON/YAML-objekt) till en HTML-sträng. Inga beroenden utöver lucide-static.
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
// Ikonerna hittas via require.resolve, så att det fungerar även med npx där beroendena ligger utanför paketet.
const ICONS=path.join(path.dirname(require.resolve('lucide-static/package.json')),'icons');
const TONES={salvia:'sal',sal:'sal',ockra:'ock',ock:'ock',terrakotta:'ter',ter:'ter',lera:'ler',ler:'ler',ink:'ink'};
const tc=t=>'t-'+(TONES[t||'ink']||(()=>{throw new Error('Okänd ton: '+t)})());
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function icon(n){if(!n)return '';const f=path.join(ICONS,n+'.svg');
 if(!fs.existsSync(f))throw new Error('Ikon saknas i lucide-static: '+n);
 return fs.readFileSync(f,'utf8').replace(/width="24"/,'width="100%"').replace(/height="24"/,'height="100%"').replace(/stroke-width="2"/,'stroke-width="1.6"');}
const status=s=>s?`<span class="status tx ${tc(s.tone)}" data-acc="ring">${esc(s.text)}</span>`:'';
const lbl=(t,tone)=>t?`<div class="label tx ${tone?'tone '+tc(tone):''}">${esc(t)}</div>`:'';
const MIME={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif',svg:'image/svg+xml'};
let BASE=process.cwd();
// Bilder bäddas in i HTML som data-URI, så att sidan är fristående. Sökvägen räknas från specens mapp.
function imgsrc(s){if(!s)throw new Error('photos: src saknas');if(/^(data:|https?:)/.test(s))return s;const f=path.resolve(BASE,s);
 if(!fs.existsSync(f))throw new Error('Bild saknas: '+f);const m=MIME[path.extname(f).slice(1).toLowerCase()];if(!m)throw new Error('Okänt bildformat: '+f);
 return 'data:'+m+';base64,'+fs.readFileSync(f).toString('base64');}
const grid=n=>`grid-template-columns:repeat(${n},minmax(0,1fr))`;
// Dagplan för timeline och calendar. Rena dagar i UTC, så att sommartid aldrig flyttar en dag.
const DAG=86400000,MAN=['januari','februari','mars','april','maj','juni','juli','augusti','september','oktober','november','december'],VD=['M','T','O','T','F','L','S'];
const stor=s=>s[0].toUpperCase()+s.slice(1);
const dag=(s,vad)=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s??'')),t=m?Date.UTC(+m[1],+m[2]-1,+m[3]):NaN;
 if(!m||new Date(t).getUTCDate()!==+m[3])throw new Error(vad+': ogiltigt datum '+s+' (ska vara ÅÅÅÅ-MM-DD)');return t;};
const iso=t=>new Date(t).toISOString().slice(0,10);
// ISO-vecka: veckan hör till det år dess torsdag ligger i.
const vecka=t=>{const d=new Date(t);d.setUTCDate(d.getUTCDate()+3-(d.getUTCDay()+6)%7);const j=new Date(Date.UTC(d.getUTCFullYear(),0,4));return 1+Math.round(((d-j)/DAG-3+(j.getUTCDay()+6)%7)/7);};
// En period går från from till to, där to är bytesdagen och hör till nästa period. Två perioder får aldrig täcka samma dag: det är ett fel och inte ett tyst val.
function dagplan(b,typ){const fran=dag(b.from,typ+'.from'),till=dag(b.to,typ+'.to');if(till<fran)throw new Error(typ+': to ligger före from');
 const serier=(b.series||[]).map(s=>({text:s.text,cls:tc(s.tone)}));if(!serier.length)throw new Error(typ+': series saknas');
 const vem=new Map(),byten=new Set(),mark=new Set();
 (b.spans||[]).forEach(s=>{const a=dag(s.from,typ+'.spans.from'),z=dag(s.to,typ+'.spans.to');if(z<=a)throw new Error(typ+': perioden '+s.from+' slutar före sin början');
  if(!serier[s.series])throw new Error(typ+': okänd series '+s.series+' i perioden '+s.from);
  for(let t=a;t<z;t+=DAG){if(vem.has(t))throw new Error(typ+': två perioder täcker '+iso(t));vem.set(t,s.series);}if(a>fran)byten.add(a);byten.add(z);});
 (b.marks||[]).forEach(m=>{const a=dag(m.from,typ+'.marks.from'),z=dag(m.to??m.from,typ+'.marks.to');if(z<a)throw new Error(typ+': markeringen '+m.from+' slutar före sin början');for(let t=a;t<=z;t+=DAG)mark.add(t);});
 // Planens första dag är inget byte om ingen säger det: changes lägger till dagar, changes:false tar bort strecken.
 if(b.changes===false)byten.clear();else (b.changes||[]).forEach(c=>byten.add(dag(c,typ+'.changes')));
 return {fran,till,serier,vem,byten,mark};}
const manader=p=>{const ut=[];for(let d=new Date(p.fran),y=d.getUTCFullYear(),m=d.getUTCMonth();Date.UTC(y,m,1)<=p.till;m===11?(y++,m=0):m++)ut.push([y,m]);return ut;};
const forklaring=(p,b,medVecka)=>`<div class="dl-leg">${p.serier.map(s=>`<span class="tx ${s.cls}"><i class="s"></i>${esc(s.text)}</span>`).join('')}${p.mark.size?`<span class="tx"><i class="m"></i>${esc(b.markText||'Markerad dag')}</span>`:''}${p.byten.size?`<span class="tx"><i class="c"></i>${esc(b.changeText||'Byte')}</span>`:''}${medVecka?`<span class="tx"><i class="w">v.12</i>${esc(b.weekText||'Veckonummer')}</span>`:''}</div>`;
const B={
 columns:b=>`<div class="columns" style="grid-template-columns:${(b.widths||b.cols.map(()=>1)).map(w=>`minmax(0,${w}fr)`).join(' ')}">${b.cols.map(c=>`<div class="col">${c.map(block).join('')}</div>`).join('')}</div>`,
 rows:b=>`<div class="rows${b.compact?' compact':''}" style="${grid(b.cols||2)}">${b.items.map(i=>`<div class="row ${tc(i.tone)}">${i.nr?`<div class="nr tx">${esc(i.nr)}</div>`:''}<h3 class="tx">${esc(i.title)}</h3>${i.sub?`<div class="sub tx">${esc(i.sub)}</div>`:''}${i.text?`<p class="tx">${esc(i.text)}</p>`:''}${status(i.status)}</div>`).join('')}</div>`,
 cards:b=>`<div class="cards${b.compact?' compact':''}${b.tight?' tight':''}" style="${grid(b.cols||4)}">${b.items.map(i=>`<div class="card ${tc(i.tone)}" data-acc="frame">${i.icon?`<div class="ic">${icon(i.icon)}</div>`:''}${i.label?`<div class="lbl tx">${esc(i.label)}</div>`:''}<h3 class="tx">${esc(i.title)}</h3>${i.sub?`<div class="sub tx">${esc(i.sub)}</div>`:''}${i.text?`<p class="tx">${esc(i.text)}</p>`:''}<div class="grow"></div>${status(i.status)}</div>`).join('')}</div>`,
 flow:b=>{const node=(n,cls)=>`<div class="${cls} ${tc(n.tone)}">${n.icon?`<div class="ic">${icon(n.icon)}</div>`:''}<div><h3 class="tx">${esc(n.title)}</h3>${n.sub?`<div class="sub tx">${esc(n.sub)}</div>`:''}</div></div>`;
  return `<div class="flow" data-acc="flow"><div class="srcs">${b.sources.map(s=>node(s,'node'+(s.dashed?' dashed':''))).join('')}</div><div class="labels">${b.sources.map(s=>`<div class="lab tx">${esc(s.label||'')}</div>`).join('')}</div>${node(b.hub,'hub')}${b.target?node(b.target,'tgt'):''}</div>`},
 chain:b=>`<div class="chain ${tc(b.tone)}" data-acc="chain">${b.steps.map(s=>`<div class="step"><h4 class="tx">${esc(s.title)}</h4>${s.text?`<p class="tx">${esc(s.text)}</p>`:''}</div>`).join('')}</div>`,
 process:b=>{const L=b.lanes&&b.lanes.length?170:0,nl=(b.lanes&&b.lanes.length)||b.rows||1,H=b.height||(nl*150),cols=b.cols||b.nodes.length,nw=b.nodeW||190,nh=b.nodeH||74;
  const edges=b.edges||b.nodes.slice(1).map((n,i)=>({from:b.nodes[i].id,to:n.id}));
  const lanes=(b.lanes||[]).map((t,i)=>`<div class="lane" style="top:${i*H/nl}px;height:${H/nl}px"><div class="lane-t tx">${esc(t)}</div></div>`).join('');
  const nodes=b.nodes.map(n=>`<div class="pnode tx${n.strong?' strong':''}" data-id="${esc(n.id)}" style="width:${n.w||nw}px;height:${nh}px;left:calc(${L}px + (100% - ${L}px) * ${(n.col+0.5)/cols} - ${(n.w||nw)/2}px);top:${(n.lane+0.5)*H/nl-nh/2}px">${esc(n.t)}</div>`).join('');
  const labs=edges.map((e,i)=>e.label?`<div class="elab" data-e="${i}" style="width:${e.lw||200}px"><div class="el tx">${esc(e.label)}</div>${e.sub?`<div class="es tx">${esc(e.sub)}</div>`:''}</div>`:'').join('');
  return `<div class="proc" data-acc="process" data-edges='${esc(JSON.stringify(edges))}' style="height:${H}px">${lanes}${nodes}${labs}</div>`},
 tags:b=>`<div class="tags">${b.heading?`<span class="tags-h tx">${esc(b.heading)}</span>`:''}${b.items.map(t=>`<span class="tag tx">${esc(t)}</span>`).join('')}</div>`,
 steps:b=>`<div class="steps ${tc(b.tone)}">${lbl(b.heading)}<ol>${b.items.map(t=>`<li class="tx"><span></span>${esc(t)}</li>`.replace('<span></span>','')).join('')}</ol></div>`,
 list:b=>`<div class="list ${tc(b.tone)}">${lbl(b.heading)}<ul>${b.items.map(t=>`<li class="tx">${esc(t)}</li>`).join('')}</ul></div>`,
 text:b=>`<div class="text ${tc(b.tone)}">${lbl(b.heading,b.tone)}${[].concat(b.body).map(p=>`<p class="tx">${esc(p)}</p>`).join('')}</div>`,
 callout:b=>`<div class="callout ${tc(b.tone)}">${lbl(b.heading)}<div class="big tx">${esc(b.text)}</div>${(b.notes||[]).map(n=>`<p class="tx">${esc(n)}</p>`).join('')}</div>`,
 persona:b=>`<div class="persona ${tc(b.tone)}">${b.icon?`<div class="ic">${icon(b.icon)}</div>`:''}<h3 class="tx">${esc(b.title)}</h3>${b.sub?`<div class="sub tx">${esc(b.sub)}</div>`:''}${status(b.status)}</div>`,
 table:b=>`<div class="table">${lbl(b.heading)}<table><thead><tr>${b.head.map(h=>`<th class="tx">${esc(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map(r=>`<tr>${r.map(c=>typeof c==='object'&&c?`<td>${status(c)}</td>`:`<td class="tx">${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`,
 legend:b=>`<div class="legend">${b.items.map(i=>`<span class="tx ${tc(i.tone)}"><i></i>${esc(i.text)}</span>`).join('')}</div>`,
 status:b=>`<div>${status(b)}</div>`,
 timeline:b=>{const p=dagplan(b,'timeline');
  return `<div class="timeline">${forklaring(p,b,true)}${manader(p).map(([y,m],i)=>{const n=new Date(Date.UTC(y,m+1,0)).getUTCDate();let c='';
   for(let d=1;d<=31;d++){const t=Date.UTC(y,m,d);if(d>n||t<p.fran||t>p.till){c+='<div class="tl-d"></div>';continue;}
    const s=p.vem.get(t),wd=(new Date(t).getUTCDay()+6)%7;
    c+=`<div class="tl-d${p.mark.has(t)?' mk':''}${wd>4?' we':''}${p.byten.has(t)?' ch':''}${s==null?'':' '+p.serier[s].cls}"><span class="tl-w tx">${wd===0?'v.'+vecka(t):''}</span><i class="tl-b${s==null?' tom':''}"></i><span class="tl-n tx">${d}</span></div>`;}
   return `<div class="tl-r"><div class="tl-m tx">${stor(MAN[m].slice(0,3))}${i===0||m===0?' '+y:''}</div><div class="tl-ds">${c}</div></div>`;}).join('')}</div>`},
 calendar:b=>{const p=dagplan(b,'calendar');
  return `<div class="calendar">${forklaring(p,b,false)}<div class="cal-ms" style="${grid(b.cols||4)}">${manader(p).map(([y,m])=>{const forsta=Date.UTC(y,m,1),off=(new Date(forsta).getUTCDay()+6)%7;let c='';
   for(let r=0;r<6;r++){const t0=forsta+(r*7-off)*DAG;let rad='',finns=false;
    for(let k=0;k<7;k++){const t=t0+k*DAG,d=new Date(t);if(d.getUTCMonth()!==m||t<p.fran||t>p.till){rad+='<div class="cal-d"></div>';continue;}
     finns=true;const s=p.vem.get(t),ch=p.byten.has(t),tom=s==null||ch;
     rad+=`<div class="cal-d${p.mark.has(t)?' mk':''}${ch?' ch':''}${tom?'':' '+p.serier[s].cls}"><span class="cal-n tx">${d.getUTCDate()}</span><i class="cal-b${tom?' tom':''}"></i></div>`;}
    c+=`<div class="cal-v tx">${finns?vecka(t0):''}</div>${rad}`;}
   return `<div class="cal-m"><div class="cal-t tx">${stor(MAN[m])} ${y}</div><div class="cal-g"><div class="cal-h"></div>${VD.map(v=>`<div class="cal-h tx">${v}</div>`).join('')}${c}</div></div>`;}).join('')}</div></div>`},
 photos:b=>`<div class="photos${b.compact?' compact':''}" style="${grid(b.cols||3)}">${b.items.map(i=>`<figure class="photo ${tc(i.tone)}"><img src="${imgsrc(i.src)}" alt="${esc(i.title||'')}" style="height:${b.height||260}px">${i.title?`<h3 class="tx">${esc(i.title)}</h3>`:''}${i.sub?`<div class="sub tx">${esc(i.sub)}</div>`:''}${i.credit?`<div class="credit tx">${esc(i.credit)}</div>`:''}${status(i.status)}</figure>`).join('')}</div>`,
};
function block(b){const f=B[b.type];if(!f)throw new Error('Okänd komponent: '+b.type);return f(b);}
function title(p){let t=esc(p.title);if(p.mark){const m=esc(p.mark);if(!t.includes(m))throw new Error('mark finns inte i title: '+p.mark);t=t.replace(m,`<span class="mark" data-acc="underline">${m}</span>`);}return t;}
// Profilerna: redaktionell är förvalet och ser ut som förut (CP 2026-11-13 valde namnen Redaktionell och LifeHub; före det hette förvalet skiss). lifehub läggs ovanpå (profiler/lifehub.css) med typsnitten inbäddade, så att
// sidan inte behöver nätet. En okänd profil, eller yta i redaktionell, är ett fel och inte ett tyst förval.
const PROFILER={redaktionell:{css:[],ytor:null},lifehub:{css:['profiler/lifehub.css'],ytor:['mork','ljus']}};
// Jost har över- och underhäng på 1,45 em, mer än radhöjderna rubrikerna har, och då klipps de (QA "Klipps"). Metriken sätts till 1,2 em
// med *-override, så att rubrikerna behåller sina täta radhöjder i stället för att glesas ut.
const FONTER=[['Jost','@fontsource-variable/jost','jost-latin-wght-normal.woff2','300 600','ascent-override:94%;descent-override:26%;line-gap-override:0%;'],['Inter','@fontsource/inter','inter-latin-400-normal.woff2','400',''],['Inter','@fontsource/inter','inter-latin-600-normal.woff2','600','']];
const fontfaces=()=>FONTER.map(([fam,pkg,fil,vikt,metrik])=>{const f=path.join(path.dirname(require.resolve(pkg+'/package.json')),'files',fil);
 return `@font-face{font-family:'${fam}';font-weight:${vikt};font-style:normal;${metrik}src:url(data:font/woff2;base64,${fs.readFileSync(f).toString('base64')}) format('woff2')}`;}).join('\n');
function profilen(doc){const namn=doc.profil??'redaktionell',pr=PROFILER[namn];if(!pr)throw new Error('Okänd profil: '+namn+' (finns: '+Object.keys(PROFILER).join(', ')+')');return {namn,...pr};}
function ytan(p,doc,pr){const y=p.yta??doc.yta;if(y==null)return pr.ytor?pr.ytor[0]:null;if(!pr.ytor)throw new Error('yta finns bara i profilen lifehub, inte i '+pr.namn);if(!pr.ytor.includes(y))throw new Error('Okänd yta: '+y+' (finns: '+pr.ytor.join(', ')+')');return y;}
function page(p,doc,pr){const foot=p.footer??doc.footer,y=ytan(p,doc,pr);return `<section class="page${y?' yta-'+y:''}"><div class="topline"><div class="eyebrow tx">${esc(p.eyebrow||'')}</div><div class="meta tx">${esc(p.meta??doc.meta??'')}</div></div>
<h1 class="title tx">${title(p)}</h1>${p.lede?`<div class="lede tx">${esc(p.lede)}</div>`:''}${p.status?`<div class="head-status">${status(p.status)}</div>`:''}
<div class="body" style="margin-top:${p.bodyTop??56}px;${p.gap!=null?`gap:${p.gap}px`:''}">${(p.blocks||[]).map(block).join('')}</div>
${foot||p.source?`<div class="foot"><span class="tx">${esc(foot||'')}</span><span class="src tx">${p.source?'Källa: '+esc(p.source):''}</span></div>`:''}</section>`;}
module.exports=function build(doc,base){BASE=base||process.cwd();const pr=profilen(doc);
 const css=(pr.css.length?[fontfaces()]:[]).concat(['tokens.css','skiss.css',...pr.css].map(f=>fs.readFileSync(path.join(ROOT,f),'utf8'))).join('\n');
 return `<!doctype html><html lang="sv"><head><meta charset="utf-8"><title>${esc(doc.title||'')}</title><style>${css}</style></head><body data-profil="${pr.namn}">${doc.pages.map(p=>page(p,doc,pr)).join('\n')}
<script>${fs.readFileSync(path.join(ROOT,'lib/rough.js'),'utf8')}</script><script>${fs.readFileSync(path.join(ROOT,'lib/accents.js'),'utf8')}</script></body></html>`;};
