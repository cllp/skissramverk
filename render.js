#!/usr/bin/env node
// Användning: node render.js <spec.json|spec.yaml> [utkatalog] [--png-only|--pdf-only] [--seed N]
const fs=require('fs'),path=require('path');const build=require('./lib/build-html');
const args=process.argv.slice(2),flag=f=>args.includes(f),opt=n=>{const i=args.indexOf(n);return i>=0?args[i+1]:null};
const pos=args.filter((a,i)=>!a.startsWith('--')&&args[i-1]!=='--seed');
if(!pos[0]){console.error('node render.js <spec.json|yaml> [utkatalog]');process.exit(2);}
const src=pos[0],out=pos[1]||path.join(process.cwd(),'out'),base=path.basename(src).replace(/\.(json|ya?ml)$/,'');
function load(f){const t=fs.readFileSync(f,'utf8');if(/\.ya?ml$/.test(f)){let y;try{y=require('yaml')}catch{try{y=require('js-yaml')}catch{throw new Error('YAML kräver npm i yaml')}}return (y.parse||y.load)(t);}return JSON.parse(t);}
const CHROME=process.env.CHROME_PATH||['/usr/bin/google-chrome','/opt/pw-browsers/chromium','/usr/bin/chromium','/usr/bin/chromium-browser','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(fs.existsSync);
(async()=>{const doc=load(src);fs.mkdirSync(out,{recursive:true});const html=build(doc,path.dirname(path.resolve(src)));const hf=path.join(out,base+'.html');fs.writeFileSync(hf,html);
 const {chromium}=require('playwright-core');const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox','--font-render-hinting=none']});
 const p=await b.newPage({viewport:{width:1600,height:1131},deviceScaleFactor:Number(opt('--scale')||1)});
 await p.goto('file://'+path.resolve(hf));await p.evaluate(()=>document.fonts.ready);
 const rep=await p.evaluate(s=>window.skissRender(s),Number(opt('--seed')||7));let bad=0;
 rep.forEach(r=>{if(r.errors.length){bad+=r.errors.length;console.error('Sida '+r.page+':\n  '+[...new Set(r.errors)].join('\n  '))}});
 const pages=await p.$$('.page');const files=[];
 if(!flag('--pdf-only'))for(let i=0;i<pages.length;i++){const f=path.join(out,`${base}-s${i+1}.png`);await pages[i].screenshot({path:f});files.push(f);}
 if(!flag('--png-only')){await p.emulateMedia({media:'screen'});const f=path.join(out,base+'.pdf');await p.pdf({path:f,width:'1600px',height:'1131px',printBackground:true,preferCSSPageSize:true});files.push(f);}
 await b.close();console.log(files.join('\n'));console.log(bad?`QA: ${bad} fel, se ovan`:'QA: inga fel');process.exit(bad?1:0);})().catch(e=>{console.error(e.message);process.exit(2)});
