// Körs i webbläsaren. Mäter layouten och ritar rough.js-accenter, sedan kvalitetskontroll.
window.skissRender=function(seed){
 const css=getComputedStyle(document.documentElement),V=n=>css.getPropertyValue('--'+n).trim();
 const report=[];
 document.querySelectorAll('.page').forEach((pg,pi)=>{
  pg.querySelectorAll('svg.acc').forEach(s=>s.remove());
  const sv=document.createElementNS('http://www.w3.org/2000/svg','svg');sv.classList.add('acc');
  sv.setAttribute('width',pg.offsetWidth);sv.setAttribute('height',pg.offsetHeight);pg.prepend(sv);
  const rc=rough.svg(sv),P=pg.getBoundingClientRect();let k=1;
  // Variablerna läses på sidan: profilen lifehub sätter dem per yta (mörk eller ljus). I skiss ärvs de från :root, så utfallet är detsamma.
  const pcs=getComputedStyle(pg),V=n=>pcs.getPropertyValue('--'+n).trim(),LH=document.body.dataset.profil==='lifehub';
  const R=e=>{const b=e.getBoundingClientRect();return{x:b.left-P.left,y:b.top-P.top,w:b.width,h:b.height}};
  const o=x=>Object.assign({seed:(seed||7)+pi*100+(k++),roughness:1.2,bowing:1},x,LH?{roughness:0,bowing:0}:{});
  const tone=e=>getComputedStyle(e).getPropertyValue('--tone').trim()||V('black');
  const add=n=>sv.appendChild(n);
  if(!LH)pg.querySelectorAll('[data-acc=underline]').forEach(e=>{const r=e.getClientRects(),b=R(e);
   [...r].forEach(q=>{const x=q.left-P.left,y=q.bottom-P.top;add(rc.line(x,y+2,x+q.width,y-2,o({stroke:V('ockra'),strokeWidth:6,roughness:1.4})))});});
  if(!LH)pg.querySelectorAll('[data-acc=ring]').forEach(e=>{const b=R(e);add(rc.ellipse(b.x+b.w/2,b.y+b.h/2,b.w+64,b.h+30,o({stroke:tone(e),strokeWidth:1.5,roughness:1.3})))});
  if(!LH)pg.querySelectorAll('[data-acc=frame]').forEach(e=>{const b=R(e);add(rc.rectangle(b.x,b.y,b.w,b.h,o({stroke:V('black'),strokeWidth:1.2,roughness:0.9})));
   add(rc.line(b.x+26,b.y+b.h+0,b.x+26+Math.min(140,b.w-52),b.y+b.h,o({stroke:tone(e),strokeWidth:4,roughness:1.1})));});
  const arrowHead=(x,y,c,dx=1)=>add(rc.linearPath([[x-15*dx,y-9],[x,y],[x-15*dx,y+9]],o({stroke:c,strokeWidth:2.5,roughness:0.8})));
  pg.querySelectorAll('[data-acc=flow]').forEach(f=>{const hub=f.querySelector('.hub'),h=R(hub),labs=[...f.querySelectorAll('.lab')];
   f.querySelectorAll('.srcs .node').forEach((n,i)=>{const u=R(n),v=R(labs[i]),c=tone(n),d=n.classList.contains('dashed')?[9,9]:undefined;const y=u.y+u.h/2;
    const tw=Math.min(v.w,(()=>{const r=document.createRange();r.selectNodeContents(labs[i]);const rr=r.getBoundingClientRect();return rr.width})());const lx=v.x+(v.w-tw)/2;
    add(rc.line(u.x+u.w+8,y,lx-12,y,o({stroke:c,strokeWidth:2.5,strokeLineDash:d})));
    const x1=lx+tw+12,x2=h.x-10,ty=h.y+h.h/2+(y-(h.y+h.h/2))*0.35;
    add(rc.curve([[x1,y],[x1+(x2-x1)*0.55,y+(ty-y)*0.3],[x2,ty]],o({stroke:c,strokeWidth:2.5,strokeLineDash:d})));arrowHead(x2,ty,c);});
   const t=f.querySelector('.tgt');if(t){const a=R(t),y=h.y+h.h/2;add(rc.line(h.x+h.w+10,y,a.x-10,y,o({stroke:V('black'),strokeWidth:2.5})));arrowHead(a.x-10,y,V('black'));}});
  pg.querySelectorAll('[data-acc=chain]').forEach(ch=>{const st=[...ch.querySelectorAll('.step')],c=tone(ch);for(let i=0;i<st.length-1;i++){const a=R(st[i]),b=R(st[i+1]);const y=a.y+18,x1=a.x+a.w+14,x2=b.x-14;
    add(rc.line(x1,y,x2,y,o({stroke:c,strokeWidth:2.5})));arrowHead(x2,y,c);}});
  const head=(x,y,ang,c)=>{const a=0.5,l=15;add(rc.linearPath([[x-l*Math.cos(ang-a),y-l*Math.sin(ang-a)],[x,y],[x-l*Math.cos(ang+a),y-l*Math.sin(ang+a)]],o({stroke:c,strokeWidth:2.5,roughness:0.6})));};
  pg.querySelectorAll('[data-acc=process]').forEach(pr=>{const c=V('salvia'),E=JSON.parse(pr.dataset.edges),Q=R(pr);
   pr.querySelectorAll('.lane').forEach((l,i)=>{if(i){const r=R(l);add(rc.line(r.x,r.y,r.x+r.w,r.y,o({stroke:V('linje'),strokeWidth:1,roughness:0.5})))}});
   if(!LH)pr.querySelectorAll('.pnode').forEach(n=>{const r=R(n);add(rc.rectangle(r.x,r.y,r.w,r.h,o({stroke:n.classList.contains('strong')?c:V('black'),strokeWidth:n.classList.contains('strong')?2:1.2,roughness:0.8})))});
   const N=id=>R(pr.querySelector(`.pnode[data-id="${id}"]`));
   const place=(i,x,y,side)=>{const l=pr.querySelector(`.elab[data-e="${i}"]`);if(!l)return;const w=l.offsetWidth,h=l.offsetHeight;let lx=x-w/2,ly=y-h/2;
    if(side==='above')ly=y-h-8;if(side==='below')ly=y+8;if(side==='left'){lx=x-w-14;}if(side==='right'){lx=x+14;}
    l.style.left=(lx-Q.x)+'px';l.style.top=(ly-Q.y)+'px';};
   E.forEach((e,i)=>{const A=N(e.from),B=N(e.to),ac={x:A.x+A.w/2,y:A.y+A.h/2},bc={x:B.x+B.w/2,y:B.y+B.h/2},g=8;let pts;
    if(e.loop){const x1=ac.x-A.w*0.25,x2=ac.x+A.w*0.25,y=A.y-g;add(rc.curve([[x1,y],[x1-10,y-46],[ac.x,y-62],[x2+10,y-46],[x2,y]],o({stroke:c,strokeWidth:2.5})));head(x2,y,Math.PI/2+0.3,c);place(i,ac.x,y-62,'above');return;}
    if(Math.abs(ac.y-bc.y)<4){const d=Math.sign(bc.x-ac.x);pts=[[ac.x+d*(A.w/2+g),ac.y],[bc.x-d*(B.w/2+g),bc.y]];}
    else if(Math.abs(ac.x-bc.x)<4){const x=ac.x+(e.off||0),d=Math.sign(bc.y-ac.y);pts=[[x,ac.y+d*(A.h/2+g)],[x,bc.y-d*(B.h/2+g)]];}
    else if(e.straight){const dx=bc.x-ac.x,dy=bc.y-ac.y,t=(r,s)=>Math.min(Math.abs((r.w/2+g)/dx)||1e9,Math.abs((r.h/2+g)/dy)||1e9);const ta=t(A),tb=t(B);pts=[[ac.x+dx*ta+(e.off||0),ac.y+dy*ta],[bc.x-dx*tb+(e.off||0),bc.y-dy*tb]];}
    else{const d=Math.sign(bc.x-ac.x),x1=ac.x+d*(A.w/2+g),x2=bc.x-d*(B.w/2+g),mx=e.mx!=null?Q.x+e.mx:(x1+x2)/2;pts=[[x1,ac.y],[mx,ac.y],[mx,bc.y],[x2,bc.y]];}
    add(rc.linearPath(pts,o({stroke:c,strokeWidth:2.5,roughness:0.9})));
    const [p1,p0]=[pts[pts.length-1],pts[pts.length-2]];head(p1[0],p1[1],Math.atan2(p1[1]-p0[1],p1[0]-p0[0]),c);
    if(e.both){const [q1,q0]=[pts[0],pts[1]];head(q1[0],q1[1],Math.atan2(q1[1]-q0[1],q1[0]-q0[0]),c);}
    const s0=pts[Math.floor((pts.length-1)/2)],s1=pts[Math.floor((pts.length-1)/2)+1];
    place(i,(s0[0]+s1[0])/2+(e.dx||0),(s0[1]+s1[1])/2+(e.dy||0),e.side||(Math.abs(s0[1]-s1[1])<4?'above':'right'));});});
  // QA
  const errs=[],W=pg.offsetWidth,H=pg.offsetHeight;
  const tx=[...pg.querySelectorAll('.tx')];
  tx.forEach(e=>{if(e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+1)errs.push('Klipps: '+e.textContent.slice(0,50));
   const b=R(e);if(b.x<0||b.y<0||b.x+b.w>W||b.y+b.h>H-40)errs.push('Utanför sidan: '+e.textContent.slice(0,50));
   if(/[\u2013\u2014]/.test(e.textContent))errs.push('Tankstreck: '+e.textContent.slice(0,50));});
  const body=pg.querySelector('.body'),bb=R(body);[...body.children].forEach(c=>{const r=R(c);if(r.y+r.h>bb.y+bb.h+1)errs.push('Innehåll går ner i fotnoten/utanför: '+c.textContent.slice(0,40));});
  const PX=parseFloat(getComputedStyle(pg).paddingLeft);pg.querySelectorAll('.body *').forEach(e=>{const r=R(e);if(r.w&&(r.x<PX-2||r.x+r.w>W-PX+2))errs.push('Utanför marginalen: '+(e.className||e.tagName)+' '+e.textContent.slice(0,30));});
  const rects=tx.map(e=>[e,R(e)]);for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){const[a,A]=rects[i],[b,Bq]=rects[j];if(a.contains(b)||b.contains(a))continue;
   if(A.x<Bq.x+Bq.w-1&&Bq.x<A.x+A.w-1&&A.y<Bq.y+Bq.h-1&&Bq.y<A.y+A.h-1)errs.push('Överlapp: "'+a.textContent.slice(0,30)+'" och "'+b.textContent.slice(0,30)+'"');}
  if(!LH)pg.querySelectorAll('[data-acc=ring]').forEach(e=>{const b=R(e);rects.forEach(([t,T])=>{if(t===e)return;if(T.x<b.x+b.w+32&&b.x-32<T.x+T.w&&T.y<b.y+b.h+15&&b.y-15<T.y+T.h)errs.push('Ring rör text: '+e.textContent+' / '+t.textContent.slice(0,30));});});
  report.push({page:pi+1,errors:errs});});
 return report;};
