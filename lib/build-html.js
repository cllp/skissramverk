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
const grid=n=>`grid-template-columns:repeat(${n},minmax(0,1fr))`;
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
};
function block(b){const f=B[b.type];if(!f)throw new Error('Okänd komponent: '+b.type);return f(b);}
function title(p){let t=esc(p.title);if(p.mark){const m=esc(p.mark);if(!t.includes(m))throw new Error('mark finns inte i title: '+p.mark);t=t.replace(m,`<span class="mark" data-acc="underline">${m}</span>`);}return t;}
function page(p,doc){const foot=p.footer??doc.footer;return `<section class="page"><div class="topline"><div class="eyebrow tx">${esc(p.eyebrow||'')}</div><div class="meta tx">${esc(p.meta??doc.meta??'')}</div></div>
<h1 class="title tx">${title(p)}</h1>${p.lede?`<div class="lede tx">${esc(p.lede)}</div>`:''}${p.status?`<div class="head-status">${status(p.status)}</div>`:''}
<div class="body" style="margin-top:${p.bodyTop??56}px;${p.gap!=null?`gap:${p.gap}px`:''}">${(p.blocks||[]).map(block).join('')}</div>
${foot||p.source?`<div class="foot"><span class="tx">${esc(foot||'')}</span><span class="src tx">${p.source?'Källa: '+esc(p.source):''}</span></div>`:''}</section>`;}
module.exports=function build(doc){const css=['tokens.css','skiss.css'].map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n');
 return `<!doctype html><html lang="sv"><head><meta charset="utf-8"><title>${esc(doc.title||'')}</title><style>${css}</style></head><body>${doc.pages.map(p=>page(p,doc)).join('\n')}
<script>${fs.readFileSync(path.join(ROOT,'lib/rough.js'),'utf8')}</script><script>${fs.readFileSync(path.join(ROOT,'lib/accents.js'),'utf8')}</script></body></html>`;};
