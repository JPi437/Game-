/* editor.js — Editor do ADM (só é baixado por contas ADM).
 * Abas: Mapa (objetos do Mundo 1) · Monstros · Modelo (tamanho dos personagens, roupas, cabelos, acessórios) · Câmera (voo livre e cinemáticas) · Salvar.
 * Tudo que é editado vai para window.EDITS (edits.js), que guarda o rascunho no aparelho e aplica no jogo.
 * Para os outros jogadores verem, use "Publicar" (grava editor.json no GitHub) ou "Baixar" e mande o arquivo. */
(function(){
'use strict';
if(window.EDITOR)return;
const E=window.EDITS,H3=window.H3;
if(!E||!H3){setTimeout(()=>{if(!window.EDITOR){const s=document.createElement('script');s.src='editor.js?r='+Date.now();document.body.appendChild(s)}},1500);return}
const D=document,$=id=>D.getElementById(id);
const PI=Math.PI,sin=Math.sin,cos=Math.cos,tan=Math.tan,hypot=Math.hypot,max=Math.max,min=Math.min,round=Math.round,abs=Math.abs;
const clp=(v,a,b)=>v<a?a:v>b?b:v;
const S=H3.S;
const ED=window.EDITOR={on:false,tab:'map',tool:'sel',sel:null,fly:null,hs:[],rs:[],step:4,play:null,rec:null};
E.useDraft();

// ============================================================ estilo ============================================================
const css=D.createElement('style');css.textContent=`
#edBtn{position:fixed;left:calc(280px + env(safe-area-inset-left,0px));bottom:calc(26px + env(safe-area-inset-bottom,0px));z-index:41;display:none;background:linear-gradient(#ffe84a,#f4c400);color:#111;font-weight:900;padding:8px 14px;border:3px solid #111;border-radius:12px;font-size:14px}
#edBtn.on{background:linear-gradient(#ff8a65,#d84315);color:#fff}
#edP{position:fixed;right:0;top:0;bottom:0;width:min(330px,56vw);z-index:42;display:none;flex-direction:column;background:#14141bf2;color:#fff;border-left:3px solid #ffe84a;font:12px/1.3 system-ui,sans-serif;box-shadow:-6px 0 24px #000a}
#edP.on{display:flex}
#edP .edH{display:flex;align-items:center;gap:4px;padding:5px 6px;background:linear-gradient(#ffe84a,#f4c400);color:#111;font-weight:900}
#edP .edH b{font-size:14px;flex:1;letter-spacing:.3px}
#edP .edH button{background:#111;color:#ffe84a;border:0;border-radius:8px;width:30px;height:28px;font-weight:900;font-size:15px}
#edP .edT{display:flex;flex-wrap:wrap;background:#0b0b10}
#edP .edT button{flex:1 1 auto;background:transparent;color:#b9b9c4;border:0;border-bottom:3px solid transparent;padding:7px 4px;font-weight:800;font-size:12px}
#edP .edT button.on{color:#ffe84a;border-bottom-color:#ffe84a;background:#1c1c26}
#edP .edB{flex:1;overflow-y:auto;padding:8px 9px 40px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
#edP h4{margin:12px 0 5px;color:#ffe84a;font-size:12px;letter-spacing:.4px;text-transform:uppercase;border-bottom:1px solid #ffffff22;padding-bottom:3px}
#edP h4:first-child{margin-top:2px}
#edP .hint{opacity:.7;font-size:11px;margin:4px 0}
#edP .rw{display:flex;gap:5px;align-items:center;flex-wrap:wrap;margin:4px 0}
#edP .rw>*{flex:0 0 auto}
#edP button.b{background:#2c2c3a;color:#fff;border:2px solid #4a4a5e;border-radius:8px;padding:6px 8px;font-weight:800;font-size:12px}
#edP button.b.on{background:#ffe84a;color:#111;border-color:#ffe84a}
#edP button.b.red{background:#8e1c1c;border-color:#c62828}
#edP button.b.grn{background:#1b6b2f;border-color:#2e9e4a}
#edP button.b.blu{background:#1d4f9c;border-color:#3b82e0}
#edP button.b.sm{padding:4px 7px;font-size:11px}
#edP button.b:disabled{opacity:.4}
#edP select,#edP input[type=text],#edP input[type=password],#edP input[type=number],#edP textarea{background:#0b0b10;color:#fff;border:2px solid #4a4a5e;border-radius:7px;padding:5px;font:12px system-ui,sans-serif;max-width:100%;box-sizing:border-box}
#edP textarea{width:100%;height:70px;font:10px monospace}
#edP .sl{display:grid;grid-template-columns:78px 24px 1fr 24px 44px 22px;gap:3px;align-items:center;margin:3px 0}
#edP .sl label{font-weight:700;font-size:11px;color:#d5d5e0}
#edP .sl input[type=range]{width:100%;min-width:0;height:22px;accent-color:#ffe84a}
#edP .sl button{background:#2c2c3a;color:#fff;border:0;border-radius:6px;height:22px;padding:0;font-weight:900}
#edP .sl output{text-align:right;font-size:10px;color:#ffe84a;font-variant-numeric:tabular-nums}
#edP .pad{display:grid;grid-template-columns:repeat(3,38px);gap:3px}
#edP .pad button{height:34px;font-size:16px}
#edP .lst{max-height:150px;overflow-y:auto;border:1px solid #ffffff22;border-radius:7px;margin:4px 0}
#edP .lst div{display:flex;gap:6px;align-items:center;padding:4px 6px;border-bottom:1px solid #ffffff11}
#edP .lst div.on{background:#3b3b10}
#edP .lst div span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#edRing{position:fixed;z-index:39;pointer-events:none;display:none;border:3px dashed #ffe84a;border-radius:50%;box-shadow:0 0 0 1px #000a,0 0 14px #ffe84acc;transform:translate(-50%,-50%)}
#edRing i{position:absolute;left:50%;top:-22px;transform:translateX(-50%);font:900 11px system-ui,sans-serif;background:#000c;color:#ffe84a;padding:2px 6px;border-radius:6px;white-space:nowrap;font-style:normal}
#edStop{position:fixed;right:14px;bottom:14px;z-index:60;display:none;background:#c62828;color:#fff;border:3px solid #fff;border-radius:12px;font-weight:900;padding:10px 16px;font-size:15px}
#edFly{position:fixed;right:16px;bottom:96px;z-index:41;display:none;flex-direction:column;gap:8px}
#edFly button{width:56px;height:56px;border-radius:50%;border:3px solid #fff;background:#1d4f9c;color:#fff;font-size:22px;font-weight:900;touch-action:none;user-select:none;-webkit-user-select:none}
/* o jogo desliga o toque em TUDO (touch-action:none): aqui o painel precisa rolar com o dedo */
#edP,#edP *{touch-action:pan-y}
#edP input,#edP textarea,#edP select{-webkit-user-select:text;user-select:text}
#edP .edB{min-height:0;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#ffe84a #14141b}
#edP .edB::-webkit-scrollbar{width:8px}#edP .edB::-webkit-scrollbar-thumb{background:#ffe84a;border-radius:6px}
#edP.left{left:0;right:auto;border-left:0;border-right:3px solid #ffe84a;box-shadow:6px 0 24px #000a}
#edP.min{bottom:auto;min-width:230px;border-bottom:3px solid #ffe84a;border-radius:0 0 0 12px}
#edP.left.min{border-radius:0 0 12px 0}
#edP.min .edT,#edP.min .edB{display:none}
#edP .sl input.ov{width:100%;min-width:0;text-align:right;padding:2px 3px;font-size:10px;color:#ffe84a;border:1px solid #4a4a5e;border-radius:5px;background:#0b0b10;font-variant-numeric:tabular-nums}
#edP .grp{margin:6px 0 2px;font-size:10px;font-weight:900;color:#9a9ab0;letter-spacing:.4px;text-transform:uppercase}
#edP button.b.dot::after{content:' •';color:#ffe84a}
#edP button.b.on.dot::after{color:#111}
#edP label.ck{display:flex;gap:6px;align-items:center;margin:6px 0}
#edP label.ck input{width:20px;height:20px;accent-color:#ffe84a}
@media (pointer:coarse){#edP .sl{grid-template-columns:76px 32px 1fr 32px 52px 30px;gap:4px;margin:5px 0}#edP .sl button{height:32px;font-size:16px}#edP .sl input[type=range]{height:32px}#edP button.b{padding:8px 10px;font-size:13px}#edP .edT button{padding:10px 4px}#edP .sl input.ov{padding:6px 3px;font-size:11px}}
body.edCine>*:not(#h3gl):not(#edStop):not(#h3ov):not(script):not(style){visibility:hidden!important}
body.edCine.edCineClean #h3ov{visibility:hidden!important}
body.edFlyOn #edFly{display:flex}
`;D.head.appendChild(css);

// ============================================================ utilidades ============================================================
const el=(t,c,h)=>{const e=D.createElement(t);if(c)e.className=c;if(h!==undefined)e.innerHTML=h;return e};
const toast=m=>{try{if(typeof window.toast==='function')window.toast(m);else console.log(m)}catch(e){}};
function btn(txt,fn,cls){const b=el('button','b '+(cls||''));b.textContent=txt;if(fn)b.onclick=fn;return b}
function row(...c){const r=el('div','rw');c.forEach(x=>x&&r.appendChild(x));return r}
function h4(t){const h=el('h4');h.textContent=t;return h}
function hint(t){const h=el('div','hint');h.textContent=t;return h}
function fmt(v,d){return (+v).toFixed(d==null?2:d).replace('.',',')}
// controle deslizante com − e + e botão de voltar ao padrão. o={label,min,max,step,get,set,def,dec,start}
function sld(o){const w=el('div','sl'),l=el('label');l.textContent=o.label;const m=el('button');m.textContent='−';const p=el('button');p.textContent='+';
 const r=el('input');r.type='range';r.min=o.min;r.max=o.max;r.step=o.step;const out=el('input','ov'),rs=el('button');out.type='text';out.setAttribute('inputmode','decimal');out.title='toque para digitar o valor';rs.textContent='↺';rs.title='voltar ao padrão';
 const show=()=>{const v=+o.get();r.value=v;if(D.activeElement!==out)out.value=(o.show?o.show(v):fmt(v,o.dec))};show();
 const put=v=>{v=clp(+v,+o.min,+o.max);o.set(v);show()};
 r.oninput=()=>put(r.value);r.onpointerdown=()=>{if(o.start)o.start()};
 out.onfocus=()=>out.select();
 out.onchange=()=>{const v=parseFloat(String(out.value).replace(',','.'));if(isFinite(v)){if(o.start)o.start();put(v)}else show()};
 out.onkeydown=e=>{if(e.key==='Enter')out.blur()};
 m.onclick=()=>{if(o.start)o.start();put(+o.get()-+o.step)};p.onclick=()=>{if(o.start)o.start();put(+o.get()+ +o.step)};
 rs.onclick=()=>{if(o.start)o.start();put(o.def)};
 w.append(l,m,r,p,out,rs);w._show=show;return w}
function sel(opts,cur,fn){const s=el('select');for(const [v,t] of opts){const o=el('option');o.value=v;o.textContent=t;if(v===cur)o.selected=true;s.appendChild(o)}s.onchange=()=>fn(s.value);return s}
function two(txt,fn,cls){const b=btn(txt,null,cls);let t=0;b.onclick=()=>{if(Date.now()-t<2500){t=0;b.textContent=txt;fn()}else{t=Date.now();b.textContent='Toque de novo p/ confirmar'}};return b}

// ============================================================ histórico (desfazer / refazer) ============================================================
function hist(){const j=E.json();if(ED.hs[ED.hs.length-1]!==j){ED.hs.push(j);if(ED.hs.length>80)ED.hs.shift()}ED.rs.length=0}
function undo(){if(!ED.hs.length)return;ED.rs.push(E.json());E.setData(JSON.parse(ED.hs.pop()));fixSel();render()}
function redo(){if(!ED.rs.length)return;ED.hs.push(E.json());E.setData(JSON.parse(ED.rs.pop()));fixSel();render()}

// ============================================================ cena / câmera ============================================================
const inField=()=>typeof world!=='undefined'&&world===0&&!!(S.mode&&H3.fld&&H3.fld.ready&&H3.fld.nat&&H3.fld.nat.trees);
const focalPx=()=>{const C=S.cam;return (S.cssH/2)/tan((C&&C.fov||1)/2)};
function basis(C){const cp=cos(C.pitch),fw=[sin(C.yaw)*cp,sin(C.pitch),-cos(C.yaw)*cp],rt=[cos(C.yaw),0,sin(C.yaw)],up=[rt[1]*fw[2]-rt[2]*fw[1],rt[2]*fw[0]-rt[0]*fw[2],rt[0]*fw[1]-rt[1]*fw[0]];return{fw,rt,up}}
function rayAt(cx,cy){const C=S.cam,b=basis(C),th=tan(C.fov/2),a=S.cssW/S.cssH,nx=(cx/S.cssW)*2-1,ny=1-(cy/S.cssH)*2;
 const d=[b.fw[0]+b.rt[0]*nx*th*a+b.up[0]*ny*th,b.fw[1]+b.rt[1]*nx*th*a+b.up[1]*ny*th,b.fw[2]+b.rt[2]*nx*th*a+b.up[2]*ny*th],l=hypot(d[0],d[1],d[2]);
 return{o:[C.x,C.y,C.z],d:[d[0]/l,d[1]/l,d[2]/l]}}
function groundAt(cx,cy){const r=rayAt(cx,cy),hA=H3.fld.hAt;let t=2,pt=0;
 for(let i=0;i<400&&t<6000;i++){const x=r.o[0]+r.d[0]*t,y=r.o[1]+r.d[1]*t,z=r.o[2]+r.d[2]*t;
  if(y<hA(x,z)){let a=pt,b=t;for(let k=0;k<14;k++){const m=(a+b)/2,xm=r.o[0]+r.d[0]*m,ym=r.o[1]+r.d[1]*m,zm=r.o[2]+r.d[2]*m;if(ym<hA(xm,zm))b=m;else a=m}
   const x2=r.o[0]+r.d[0]*b,z2=r.o[2]+r.d[2]*b;return[x2,hA(x2,z2),z2]}
  pt=t;t+=max(1.5,t*.03)}
 return null}

// ============================================================ seleção ============================================================
const NM={tree:'Árvore',bush:'Arbusto',rock:'Pedra',decor:'Decoração',scn:'Cenário'};
const PALN={g:'Carvalho',d:'Verde escuro',s:'Doente',r:'Morrendo',a:'Salmão',x:'Seca',p:'Abeto'};
function varLabel(kind,k){if(kind==='tree'){const n=PALN[k.charAt(0)]||'';return (n?n+' ':'')+k}
 if(kind==='bush')return ({bg:'Verde',bd:'Verde escuro',bs:'Doente',bx:'Seco'})[k]+' ('+k+')';
 if(kind==='rock')return (k.charAt(1)==='d'?'Escura ':'Pedra ')+k.slice(2)+' ('+k+')';return 'Decoração '+k.slice(2)+' ('+k+')'}
const okey=o=>o.key||(o.v&&o.v.key)||'';
function enList(){try{return WD[0].EN}catch(e){return[]}}
function fixSel(){const s=ED.sel;if(!s)return;
 if(s.type==='obj'){const o=[...E.objects()].find(q=>q._e.key===s.key&&q._e.kind===s.kind&&!q._add);if(!o){ED.sel=null}else s.o=o}
 else if(s.type==='add'){const o=E.adds.get(s.id);if(!o)ED.sel=null;else s.o=o}
 else if(s.type==='mon'){if(!enList()[s.idx])ED.sel=null}}
function selObj(o){if(o._add)ED.sel={type:'add',id:o._add,o,kind:o._a.k};else ED.sel={type:'obj',kind:o._e.kind,key:o._e.key,o}}
function pickAt(cx,cy){const f=focalPx();let best=null,bs=1e9;
 const test=(wx,wy,wz,rad,ref)=>{const p=H3.proj(wx,wy,wz);if(!p||p[2]<2)return;const d=hypot(p[0]-cx,p[1]-cy),r=max(12,rad*f/p[2]);if(d>r)return;const sc=d/r+p[2]*.0004;if(sc<bs){bs=sc;best=ref}};
 if(ED.tab!=='mon')for(const o of E.objects())test(o.wx,o.wy,o.wz,o.rad*.8,o);
 const EN0=enList();EN0.forEach((e,i)=>{if(e.off||e.dead&&!e._o3)return;const o=e._o3;if(!o)return;test(o.x,o.y+14,o.z,18,{mon:i})});
 return best}
function onPick(cx,cy){if(ED.tab==='cam'||ED.tab==='save'||ED.tab==='mod')return;const r=pickAt(cx,cy);
 if(!r){ED.sel=null;render();return}
 if(r.mon!==undefined){ED.sel={type:'mon',idx:r.mon};ED.tab='mon'}else{selObj(r);if(ED.tab==='mon')ED.tab='map'}
 render()}
function selCenter(){const s=ED.sel;if(!s)return null;
 if(s.type==='mon'){const e=enList()[s.idx];if(!e)return null;const o=e._o3,x=o?o.x:e.x+8,z=o?o.z:e.y+15;return{x,y:H3.fld.hAt(x,z)+14,z,r:20,t:'Monstro '+(e.mon||'')+' #'+s.idx}}
 const o=s.o;if(!o)return null;return{x:o.wx,y:o.wy,z:o.wz,r:o.rad*.8,t:NM[s.kind]+' '+okey(o)}}

// ============================================================ edição do selecionado ============================================================
function ovOfSel(){const s=ED.sel;if(!s)return{};if(s.type==='obj'){const a=E.data.o['0'];return(a&&a[s.kind]&&a[s.kind][s.key])||{}}
 if(s.type==='add'){return(E.data.a['0']||[]).find(q=>q.i===s.id)||{}}
 if(s.type==='mon'){const m=E.data.m['0'];return(m&&m[s.idx])||{}}return{}}
function patchSel(p){const s=ED.sel;if(!s)return;
 if(s.type==='obj')E.setObj(s.kind,s.key,p);else if(s.type==='add')E.setAdd(s.id,p);else if(s.type==='mon')E.setMon(s.idx,p)}
function moveBy(dx,dz){const s=ED.sel;if(!s)return;const ov=ovOfSel();
 if(s.type==='obj')patchSel({x:(ov.x||0)+dx,z:(ov.z||0)+dz});
 else if(s.type==='add')patchSel({x:(ov.x||0)+dx,z:(ov.z||0)+dz});
 else if(s.type==='mon')patchSel({x:(ov.x||0)+dx,y:(ov.y||0)+dz})}
function moveTo(x,z){const s=ED.sel;if(!s)return;
 if(s.type==='obj'){const e=s.o._e.o;patchSel({x:x-e.x,z:z-e.z})}
 else if(s.type==='add')patchSel({x,z});
 else if(s.type==='mon'){const e=enList()[s.idx];if(e&&e._eo)patchSel({x:x-8-e._eo.x,y:z-15-e._eo.y})}}
function camDir(){const y=(S.cam&&S.cam.yaw)||0;return{fx:sin(y),fz:-cos(y),rx:cos(y),rz:sin(y)}}
function dupSel(){const s=ED.sel;if(!s||s.type==='mon')return;if(s.o&&s.o._scn){toast('O cenário fixo não pode ser duplicado');return}hist();const o=s.o,ov=ovOfSel(),e=o._e.o,kind=s.kind;
 const v=okey(o);if(!v)return;
 const id=E.addObj({k:kind,v,x:o.x+14,z:o.z+8,y:(ov.y||0)+(s.type==='add'?0:(e.by||0)),r:(s.type==='add'?(ov.r||0):e.rot+(ov.r||0)),sx:(s.type==='add'?(ov.sx||1):e.sx*(ov.sx||1)),sy:(s.type==='add'?(ov.sy||1):e.sy*(ov.sy||1)),sz:(s.type==='add'?(ov.sz||1):e.sz*(ov.sz||1)),c:ov.c});
 ED.pend=id;ED.pendT=Date.now()}
function delSel(){const s=ED.sel;if(!s)return;hist();
 if(s.type==='obj'){E.setObj(s.kind,s.key,{d:1})}else if(s.type==='add'){E.delAdd(s.id)}else if(s.type==='mon'){E.setMon(s.idx,{d:1})}
 ED.sel=null;render()}
function resetSel(){const s=ED.sel;if(!s)return;hist();if(s.type==='obj')E.resetObj(s.kind,s.key);else if(s.type==='mon'){const M=E.data.m['0'];if(M&&M[s.idx]){delete M[s.idx];E.touch()}}render()}
function placeNew(kind,v,mode){if(!inField()){toast('Entre no 3D do Mundo 1');return}
 let x,z;if(mode==='aim'){const g=groundAt(S.cssW/2,S.cssH/2);if(!g){toast('Mire para o chão');return}x=g[0];z=g[2]}
 else{const y=S.yaw||0;x=P.x+8+sin(y)*42;z=P.y+14-cos(y)*42}
 hist();const id=E.addObj({k:kind,v,x,z,r:Math.random()*PI*2});if(!id){toast('Limite de objetos adicionados');return}
 ED.pend=id;ED.pendT=Date.now();ED.tab='map'}

// ============================================================ abas ============================================================
function tabMap(B){
 if(!inField()){B.appendChild(hint('Entre no modo 3D do Mundo 1 para editar o mapa (botão Perspectiva).'));return}
 B.appendChild(h4('Ferramenta'));
 B.appendChild(row(btn('👆 Selecionar',()=>{ED.tool='sel';render()},ED.tool==='sel'?'on':''),btn('✥ Mover arrastando',()=>{ED.tool='mov';render()},ED.tool==='mov'?'on':''),btn('↶',undo,'sm'),btn('↷',redo,'sm')));
 B.appendChild(hint(ED.tool==='sel'?'Toque num objeto, árvore ou monstro do mapa para selecionar. Arraste a tela para olhar.':'Com um objeto selecionado, arraste no chão para movê-lo (a câmera fica parada).'));
 const s=ED.sel;
 B.appendChild(h4('Selecionado'));
 if(!s||s.type==='mon'){B.appendChild(hint(s?'Monstro selecionado: veja a aba Monstros.':'Nada selecionado.'))}
 else{
  const o=s.o,ov=ovOfSel(),isAdd=s.type==='add';
  const t=el('div');t.style.cssText='font-weight:900;color:#ffe84a;margin:2px 0';t.textContent=NM[s.kind]+' · '+okey(o)+(isAdd?' (adicionado)':'');B.appendChild(t);
  const e=o._e.o;
  const g=k=>{const v=ovOfSel();return v[k]!==undefined?v[k]:(k==='c'?[1,1,1]:(k[0]==='s'?1:0))};
  B.appendChild(el('div','hint','Posição '+round(o.x)+' , '+round(o.z)+' · altura '+fmt(o.y,1)));
  const pad=el('div','pad');
  const mk=(txt,dx,dz)=>{const b=btn(txt,null,'');b.onclick=()=>{hist();const d=camDir();moveBy((d.rx*dx+d.fx*dz)*ED.step,(d.rz*dx+d.fz*dz)*ED.step);render()};return b};
  pad.append(el('span'),mk('▲',0,1),el('span'),mk('◀',-1,0),el('span'),mk('▶',1,0),el('span'),mk('▼',0,-1),el('span'));
  const pr=row(pad,el('div','',''));const stp=sel([['1','1 px'],['4','4 px'],['16','16 px'],['48','48 px']],String(ED.step),v=>{ED.step=+v});stp.style.height='34px';pr.lastChild.append(el('div','hint','Passo'),stp);B.appendChild(pr);
  B.appendChild(sld({label:'Altura (Y)',min:-60,max:200,step:1,def:0,dec:0,get:()=>g('y'),set:v=>patchSel({y:v}),start:hist}));
  B.appendChild(sld({label:'Girar (°)',min:-180,max:180,step:5,def:0,dec:0,get:()=>(g('r')*180/PI),set:v=>patchSel({r:v*PI/180}),start:hist}));
  const uni=sld({label:'Tamanho',min:.1,max:5,step:.05,def:1,get:()=>(g('sx')+g('sy')+g('sz'))/3,set:v=>{patchSel({sx:v,sy:v,sz:v});refreshSl(B)},start:hist});B.appendChild(uni);
  B.appendChild(sld({label:'Largura (X)',min:.1,max:5,step:.05,def:1,get:()=>g('sx'),set:v=>patchSel({sx:v}),start:hist}));
  B.appendChild(sld({label:'Altura (Y)',min:.1,max:5,step:.05,def:1,get:()=>g('sy'),set:v=>patchSel({sy:v}),start:hist}));
  B.appendChild(sld({label:'Profund. (Z)',min:.1,max:5,step:.05,def:1,get:()=>g('sz'),set:v=>patchSel({sz:v}),start:hist}));
  const isScn=!!o._scn;
  const cc=k=>sld({label:({0:'Cor R',1:'Cor G',2:'Cor B'})[k],min:0,max:2,step:.05,def:1,get:()=>g('c')[k],set:v=>{const c=(ovOfSel().c||[1,1,1]).slice();c[k]=v;patchSel({c})},start:hist});
  if(!isScn){B.appendChild(cc(0));B.appendChild(cc(1));B.appendChild(cc(2))}
  const solid=(e0=>{const def=isScn?(o._scn.solid?1:0):(s.kind==='tree'||s.kind==='rock'||s.kind==='bush')?1:0;return ov.col!==undefined?ov.col:def})();
  const ck=el('label');ck.style.cssText='display:flex;gap:6px;align-items:center;margin:6px 0';const cb=el('input');cb.type='checkbox';cb.checked=!!solid;
  cb.onchange=()=>{hist();patchSel({col:cb.checked?1:0})};ck.append(cb,el('span','','Bloqueia o andar (colisão) — vale para o objeto movido/adicionado'));B.appendChild(ck);
  B.appendChild(row(isScn?null:btn('⧉ Duplicar',dupSel,'blu'),btn(isScn?'🙈 Esconder':'🗑 Apagar',delSel,'red'),isAdd?null:btn('↺ Original',resetSel)));
  if(isScn&&(o._e.key==='star'||o._e.key==='mach'))B.appendChild(hint('O botão de '+(o._e.key==='star'?'roletar':'passivas')+' passa a aparecer perto do novo lugar.'))
 }
 B.appendChild(h4('Cenário fixo (estrela, máquina, fonte, pilares)'));
 {const L=el('div','lst');L.style.maxHeight='140px';const ls=[...E.scn].filter(p=>!p.hid);
  if(!ls.length)L.appendChild(hint(E.scn.length?'Tudo escondido (veja a lixeira).':'Carregando o cenário…'));
  ls.forEach(p=>{const d=el('div',ED.sel&&ED.sel.o===p?'on':''),sp=el('span');const ov=(E.data.o['0']&&E.data.o['0'].scn&&E.data.o['0'].scn[p._e.key])||null;sp.textContent=p.key+(ov?' •':'');d.append(sp);d.onclick=()=>{ED.sel={type:'obj',kind:'scn',key:p._e.key,o:p};render();moveCamTo(p.x,p.z)};L.appendChild(d)});
  B.appendChild(L)}
 B.appendChild(h4('Adicionar objeto'));
 const kinds=[['tree','Árvore'],['bush','Arbusto'],['rock','Pedra'],['decor','Decoração']];
 let kind=ED._addKind||'tree';const vs=()=>E.variants(kind);
 const ksel=sel(kinds,kind,v=>{ED._addKind=v;ED._addVar=null;render()});
 const arr=vs();let cv=ED._addVar&&arr.includes(ED._addVar)?ED._addVar:arr[0];
 const vsel=sel(arr.map(k=>[k,varLabel(kind,k)]),cv,v=>{ED._addVar=v});
 B.appendChild(row(ksel,vsel));
 B.appendChild(row(btn('+ Na mira (centro da tela)',()=>placeNew(kind,ED._addVar&&arr.includes(ED._addVar)?ED._addVar:arr[0],'aim'),'grn'),btn('+ Na frente do jogador',()=>placeNew(kind,ED._addVar&&arr.includes(ED._addVar)?ED._addVar:arr[0],'front'),'grn')));
 B.appendChild(h4('Lixeira'));
 const gone=[...E.gone.entries()];
 if(!gone.length)B.appendChild(hint('Nenhum objeto original apagado.'));
 else{const L=el('div','lst');gone.forEach(([key,g])=>{const d=el('div');const sp=el('span');sp.textContent=NM[g.kind]+' '+okey(g.obj)+(key.split(':')[1]?' @'+key.split(':')[1]:'');d.append(sp,btn('Voltar',()=>{hist();E.setObj(g.kind,key,{d:0})},'sm'));
   d.onclick=()=>{moveCamTo(g.o.x,g.o.z)};L.appendChild(d)});B.appendChild(L)}
 const c=E.count();B.appendChild(hint('Mudados: '+c.obj+' · apagados: '+c.del+' · adicionados: '+c.add))}
function refreshSl(B){B.querySelectorAll('.sl').forEach(w=>w._show&&w._show())}

function tabMon(B){
 if(!inField()&&!enList().length){B.appendChild(hint('Entre no Mundo 1 para editar os monstros.'));return}
 B.appendChild(hint('Apagar tira o monstro do mapa para sempre (não renasce). Toque num monstro no mapa para selecionar.'));
 B.appendChild(row(btn('↶',undo,'sm'),btn('↷',redo,'sm')));
 const EN0=enList(),M=E.data.m['0']||{};
 const L=el('div','lst');L.style.maxHeight='170px';
 EN0.forEach((e,i)=>{if(!e.mon)return;const d=el('div',ED.sel&&ED.sel.type==='mon'&&ED.sel.idx===i?'on':'');const sp=el('span');const ov=M[i]||{};
  sp.textContent='#'+i+' '+e.mon+(ov.d?' (apagado)':'')+(ov.s?' ×'+fmt(ov.s,1):'');d.append(sp);d.onclick=()=>{ED.sel={type:'mon',idx:i};render();moveCamTo(e.x+8,e.y+15)};L.appendChild(d)});
 B.appendChild(L);
 const s=ED.sel;if(s&&s.type==='mon'){const e=EN0[s.idx],ov=ovOfSel();B.appendChild(h4('Monstro #'+s.idx+' · '+(e&&e.mon||'?')));
  B.appendChild(sld({label:'Tamanho',min:.3,max:4,step:.05,def:1,get:()=>ovOfSel().s||1,set:v=>patchSel({s:v}),start:hist}));
  const pad=el('div','pad'),mk=(txt,dx,dz)=>{const b=btn(txt);b.onclick=()=>{hist();const d=camDir();moveBy((d.rx*dx+d.fx*dz)*ED.step,(d.rz*dx+d.fz*dz)*ED.step);render()};return b};
  pad.append(el('span'),mk('▲',0,1),el('span'),mk('◀',-1,0),el('span'),mk('▶',1,0),el('span'),mk('▼',0,-1),el('span'));
  const pr=row(pad,el('div'));const stp=sel([['1','1 px'],['4','4 px'],['16','16 px'],['48','48 px']],String(ED.step),v=>{ED.step=+v});stp.style.height='34px';pr.lastChild.append(el('div','hint','Passo'),stp);B.appendChild(pr);
  B.appendChild(row(ov.d?btn('↺ Trazer de volta',()=>{hist();patchSel({d:0});render()},'grn'):btn('🗑 Apagar do mapa',delSel,'red'),btn('↺ Original',resetSel)))}}

// ----- modelo: personagens, roupas, cabelo, acessórios -----
const CHARS=[['player','Jogador (todos os humanos)'],['Guts','Guts'],['Springtrap','Springtrap'],['Naruto','Naruto'],['Goku','Goku'],['Luffy','Luffy'],['Gon','Gon'],['Itadori','Itadori']];
// as peças que existem no modelo do jogador, em grupos
const GROUPS=[['Cabelo',[['h1','Cabelo 1'],['h2','Cabelo 2'],['h3','Cabelo 3'],['h4','Cabelo 4']]],['Cabeça',[['chm','Chapéu de mago']]],
 ['Tronco',[['cam','Camiseta'],['av0','Aventureiro: peito']]],['Pernas',[['av1','Aventureiro: calça'],['av3','Aventureiro: barra da calça']]],
 ['Pés',[['bot','Botas padrão'],['av2','Aventureiro: botas']]],['Capas',[['capm','Capa de mago'],['cape','Capa do Lich']]]];
const PNAME={};GROUPS.forEach(g=>g[1].forEach(([k,t])=>PNAME[k]=t));
const PY0={bot:0,av2:0,chm:0,av0:1,av1:1,av3:1,cam:1,capm:1,cape:1};
const SYMP={bot:1,av2:1};                       // peças com um lado esquerdo e um direito (pés)
// o "look de teste": o que o SEU personagem veste enquanto você ajusta (não salva; só você vê)
const look=()=>{if(!ED.look||window.EDFORCE!==ED.look)ED.look={o:0,k:0,a:0,w:0,hc:0,...(window.EDFORCE&&window.EDFORCE.o!==undefined?window.EDFORCE:{})};return ED.look};
function wear(key){const L=look();
 if(/^h\d$/.test(key))L.a=+key[1];else if(key==='chm')L.w=1;else if(key==='cam')L.o|=8;else if(key==='bot')L.o|=16;else if(key==='capm')L.k=2;else if(key==='cape')L.k=1;
 else if(key==='av0')L.o|=1;else if(key==='av1'||key==='av3')L.o|=2;else if(key==='av2')L.o|=4;window.EDFORCE=L}
function lookBtn(txt,on,fn){return btn(txt,fn,'sm '+(on?'on':''))}
function tabMod(B){
 B.appendChild(h4('Tamanho do personagem'));
 const cur=ED._ch||'player';
 B.appendChild(row(sel(CHARS,cur,v=>{ED._ch=v;render()})));
 const c=E.data.ch[cur]||{sx:1,sy:1,sz:1};
 const setc=p=>E.setChar(cur,p);
 B.appendChild(sld({label:'Tudo',min:.3,max:3,step:.01,def:1,get:()=>{const q=E.data.ch[cur]||c;return(q.sx+q.sy+q.sz)/3},set:v=>{setc({sx:v,sy:v,sz:v});refreshSl(B)},start:hist}));
 B.appendChild(sld({label:'Largura',min:.3,max:3,step:.01,def:1,get:()=>(E.data.ch[cur]||c).sx,set:v=>setc({sx:v}),start:hist}));
 B.appendChild(sld({label:'Altura',min:.3,max:3,step:.01,def:1,get:()=>(E.data.ch[cur]||c).sy,set:v=>setc({sy:v}),start:hist}));
 B.appendChild(sld({label:'Profundidade',min:.3,max:3,step:.01,def:1,get:()=>(E.data.ch[cur]||c).sz,set:v=>setc({sz:v}),start:hist}));
 B.appendChild(hint(cur==='player'?'Vale para o seu personagem e para os outros jogadores.':'Para ver, o personagem precisa estar equipado na sua equipe.'));

 B.appendChild(h4('Roupas, cabelo e acessórios'));
 B.appendChild(hint('Escolha a peça, ajuste e veja no seu personagem. Cada peça é ajustada sozinha, igual para todo mundo.'));
 const pk=ED._pk||'h1';
 for(const [gn,items] of GROUPS){B.appendChild(el('div','grp',gn));
  B.appendChild(row(...items.map(([k,t])=>btn(t,()=>{ED._pk=k;ED._own=false;wear(k);render()},'sm '+(k===pk?'on ':'')+(E.data.pt[k]?'dot':'')))))}
 // look de teste
 B.appendChild(el('div','grp','Veste no teste (só no seu personagem)'));
 const L=look(),hasF=!!window.EDFORCE;
 B.appendChild(row(
  lookBtn('Cabelo: '+(L.a?L.a:'nenhum'),L.a>0,()=>{L.a=(L.a+1)%5;window.EDFORCE=L;render()}),
  lookBtn('Chapéu',L.w===1,()=>{L.w=L.w?0:1;window.EDFORCE=L;render()}),
  lookBtn('Camiseta',!!(L.o&8),()=>{L.o^=8;window.EDFORCE=L;render()}),
  lookBtn('Botas',!!(L.o&16),()=>{L.o^=16;window.EDFORCE=L;render()})));
 B.appendChild(row(
  lookBtn('Peito av.',!!(L.o&1),()=>{L.o^=1;window.EDFORCE=L;render()}),
  lookBtn('Calça av.',!!(L.o&2),()=>{L.o^=2;window.EDFORCE=L;render()}),
  lookBtn('Pés av.',!!(L.o&4),()=>{L.o^=4;window.EDFORCE=L;render()}),
  lookBtn('Capa: '+(['nenhuma','Lich','mago'][L.k|0]),L.k>0,()=>{L.k=((L.k|0)+1)%3;window.EDFORCE=L;render()})));
 B.appendChild(row(btn('Vestir só a peça',()=>{window.EDFORCE=ED.look={o:0,k:0,a:0,w:0,hc:0};wear(pk);render()},'sm blu'),btn('Voltar à minha roupa',()=>{window.EDFORCE=null;ED.look=null;ED._own=true;render();toast('Roupa normal.')},'sm'),
  btn(ED.fly&&ED.fly.mode==='orbit'?'📷 Sair da câmera':'📷 Câmera de perto',()=>{if(ED.fly&&ED.fly.mode==='orbit')stopFly();else camClose(true);render()},'sm grn')));
 if(ED.fly&&ED.fly.mode==='orbit'){B.appendChild(row(btn('⟲ Girar',()=>{ED.fly.yaw-=.6;flyApply()},'sm'),btn('⟳ Girar',()=>{ED.fly.yaw+=.6;flyApply()},'sm'),btn('＋ Perto',()=>{ED.fly.od=clp(ED.fly.od*.8,12,400);flyApply()},'sm'),btn('－ Longe',()=>{ED.fly.od=clp(ED.fly.od*1.25,12,400);flyApply()},'sm'),btn('↕ Altura',()=>{ED.fly.pitch=ED.fly.pitch<-.05?.25:-.12;flyApply()},'sm')));
  B.appendChild(hint('Também dá para arrastar a tela para girar em volta do personagem.'))}

 B.appendChild(h4('Ajustar: '+PNAME[pk]));
 const dpy=PY0[pk]!=null?PY0[pk]:.5;   // ponto fixo padrão: botas/chapéu pela base, roupas pelo topo
 const P2=()=>E.data.pt[pk]||{sx:1,sy:1,sz:1,dx:0,dy:0,dz:0,rx:0,ry:0,rz:0,py:dpy,sm:0},sp=q=>E.setPart(pk,E.data.pt[pk]?q:Object.assign({py:dpy},q));
 const sym=!!SYMP[pk];
 if(sym){const ck=el('label','ck'),cb=el('input');cb.type='checkbox';cb.checked=!!P2().sm;cb.onchange=()=>{hist();sp({sm:cb.checked?1:0});render()};
  ck.append(cb,el('span','','Cada pé separado (o ajuste vale para o pé esquerdo e o direito, espelhado)'));B.appendChild(ck)}
 B.appendChild(el('div','grp','Tamanho'));
 B.appendChild(sld({label:'Tudo',min:.1,max:3,step:.01,def:1,get:()=>{const q=P2();return(q.sx+q.sy+q.sz)/3},set:v=>{sp({sx:v,sy:v,sz:v});refreshSl(B)},start:hist}));
 B.appendChild(sld({label:'Largura',min:.1,max:3,step:.01,def:1,get:()=>P2().sx,set:v=>sp({sx:v}),start:hist}));
 B.appendChild(sld({label:'Altura',min:.1,max:3,step:.01,def:1,get:()=>P2().sy,set:v=>sp({sy:v}),start:hist}));
 B.appendChild(sld({label:'Profundidade',min:.1,max:3,step:.01,def:1,get:()=>P2().sz,set:v=>sp({sz:v}),start:hist}));
 B.appendChild(el('div','grp','Posição'));
 B.appendChild(sld({label:'Subir / descer',min:-.5,max:.5,step:.002,def:0,dec:3,get:()=>P2().dy,set:v=>sp({dy:v}),start:hist}));
 B.appendChild(sld({label:sym&&P2().sm?'Afastar / juntar':'Esq. / dir.',min:-.5,max:.5,step:.002,def:0,dec:3,get:()=>P2().dx,set:v=>sp({dx:v}),start:hist}));
 B.appendChild(sld({label:'Frente / trás',min:-.5,max:.5,step:.002,def:0,dec:3,get:()=>P2().dz,set:v=>sp({dz:v}),start:hist}));
 B.appendChild(el('div','grp','Giro'));
 B.appendChild(sld({label:'Inclinar ⤵ (°)',min:-90,max:90,step:1,def:0,dec:0,get:()=>P2().rx*180/PI,set:v=>sp({rx:v*PI/180}),start:hist}));
 B.appendChild(sld({label:'Girar ⟳ (°)',min:-90,max:90,step:1,def:0,dec:0,get:()=>P2().ry*180/PI,set:v=>sp({ry:v*PI/180}),start:hist}));
 B.appendChild(sld({label:'Tombar ⤴ (°)',min:-90,max:90,step:1,def:0,dec:0,get:()=>P2().rz*180/PI,set:v=>sp({rz:v*PI/180}),start:hist}));
 B.appendChild(el('div','grp','Ponto fixo do tamanho'));
 B.appendChild(sld({label:'Base ↔ topo',min:0,max:1,step:.05,def:dpy,dec:2,get:()=>P2().py,set:v=>sp({py:v}),start:hist}));
 B.appendChild(hint('Base ↔ topo: onde fica o ponto parado quando você muda o tamanho. 0 = a base fica no lugar (bota: o chão não muda); 1 = o topo fica no lugar (roupa presa no ombro/cintura); 0,5 = o meio.'));
 B.appendChild(row(btn('Copiar ajuste',()=>{ED.clip=JSON.parse(JSON.stringify(P2()));toast('Ajuste copiado')},'sm'),btn('Colar ajuste',()=>{if(!ED.clip){toast('Nada copiado');return}hist();const q=Object.assign({},ED.clip);if(!sym)q.sm=0;sp(q);render()},'sm'),two('Zerar esta peça',()=>{hist();delete E.data.pt[pk];E.touch();render()},'red')))}

// ----- câmera: voo livre e cinemáticas -----
function startFly(mode){if(!S.mode){toast('Entre no modo 3D primeiro');return}
 const C=S.cam||{x:0,y:60,z:0,yaw:0,pitch:0,fov:.9};
 ED.fly={x:C.x,y:C.y,z:C.z,yaw:C.yaw,pitch:C.pitch,fov:C.fov||.9,speed:ED.fly&&ED.fly.speed||90,ground:true,mode:mode||'free',od:70};
 if(mode==='orbit'){ED.fly.yaw=C.yaw;ED.fly.pitch=-.2}
 D.body.classList.add('edFlyOn');flyApply()}
function stopFly(){if(!ED.fly)return;ED.fly=null;S.dbg=null;D.body.classList.remove('edFlyOn')}
function camClose(stay){startFly('orbit');if(!ED.fly)return;ED.fly.od=48;ED.fly.pitch=-.12;if(!stay)ED.tab='cam';render()}
function moveCamTo(x,z){if(!ED.fly)return;const y=H3.fld.hAt(x,z);const b=basis(ED.fly);ED.fly.x=x-b.fw[0]*90;ED.fly.z=z-b.fw[2]*90;ED.fly.y=max(y+40,ED.fly.y);flyApply()}
function flyApply(){const f=ED.fly;if(!f)return;
 if(f.mode==='orbit'){const px=P.x+8,pz=P.y+14,py=H3.fld.hAt(px,pz)+14,cp=cos(f.pitch);f.x=px-sin(f.yaw)*cp*f.od;f.y=py-sin(f.pitch)*f.od;f.z=pz+cos(f.yaw)*cp*f.od;
  const off=ED.on&&!ED.play&&!ED.min?(ED.left?-1:1)*Math.atan((P_.offsetWidth/2)/focalPx()):0; // deixa o jogador na parte visível (fora do painel)
  S.dbg={x:f.x,y:max(f.y,H3.fld.hAt(f.x,f.z)+3),z:f.z,yaw:f.yaw+off,pitch:f.pitch,fov:f.fov};return}
 if(f.ground)f.y=max(f.y,H3.fld.hAt(f.x,f.z)+2.5);
 S.dbg={x:f.x,y:f.y,z:f.z,yaw:f.yaw,pitch:f.pitch,fov:f.fov}}
let upHeld=0;
function flyStep(jx_,jy_){const f=ED.fly;if(!f||ED.play)return;const dt=1/60,sp=f.speed*(ED.turbo||ED.turboKey?3.5:1)*dt;
 const m=hypot(jx_,jy_);
 if(f.mode==='orbit'){if(m>.15){f.od=clp(f.od+jy_*sp*.6,12,400)}f.od=clp(f.od+upHeld*sp*.3,12,400);flyApply();return}
 const b=basis(f);
 if(m>.15){const fw=-jy_,sd=jx_;f.x+=(b.fw[0]*fw+b.rt[0]*sd)*sp;f.y+=(b.fw[1]*fw)*sp;f.z+=(b.fw[2]*fw+b.rt[2]*sd)*sp}
 if(upHeld)f.y+=upHeld*sp*.8;
 flyApply()}
function camSnap(){const C=S.cam;return{x:C.x,y:C.y,z:C.z,yaw:C.yaw,pitch:C.pitch,fov:C.fov}}
const CINE=()=>{const a=E.data.cam;return a[ED._ci||0]?a[ED._ci||0]:null};
function easeCR(p0,p1,p2,p3,t){const t2=t*t,t3=t2*t;return .5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3)}
function sampleCine(c,tm){const k=c.k;if(k.length===1)return k[0];
 const T=k[k.length-1].t;if(tm>=T)return k[k.length-1];if(tm<=k[0].t)return k[0];
 let i=0;while(i<k.length-2&&tm>k[i+1].t)i++;const a=k[i],b=k[i+1],p0=k[max(0,i-1)],p3=k[min(k.length-1,i+2)];let u=(tm-a.t)/max(.001,b.t-a.t);u=u*u*(3-2*u)*.0+u;
 // guinada contínua (sem dar a volta ao contrário)
 const un=(r,q)=>{let d=q-r;while(d>PI)d-=2*PI;while(d<-PI)d+=2*PI;return r+d};
 const y0=un(a.yaw,p0.yaw)-0,y1=a.yaw,y2=un(a.yaw,b.yaw),y3=un(y2,p3.yaw);
 const ys=[un(y1,p0.yaw),y1,y2,un(y2,p3.yaw)];
 const f=(k0,k1,k2,k3)=>easeCR(k0,k1,k2,k3,u);
 return{x:f(p0.x,a.x,b.x,p3.x),y:f(p0.y,a.y,b.y,p3.y),z:f(p0.z,a.z,b.z,p3.z),yaw:f(ys[0],ys[1],ys[2],ys[3]),pitch:f(p0.pitch,a.pitch,b.pitch,p3.pitch),fov:f(p0.fov,a.fov,b.fov,p3.fov)}}
function playCine(rec){const c=CINE();if(!c||c.k.length<1){toast('Crie pelo menos 1 ponto');return}
 if(!S.mode){toast('Entre no modo 3D primeiro');return}
 if(!ED.fly)startFly('free');ED.fly.mode='free';
 ED.play={c,t0:performance.now(),loop:!!c.loop,rec:!!rec};D.body.classList.add('edCine');if(ED.cleanUi!==false)D.body.classList.add('edCineClean');$('edStop').style.display='block';ED.on&&($('edP').classList.remove('on'));
 if(rec)startRec()}
function stopCine(){if(!ED.play)return;ED.play=null;D.body.classList.remove('edCine','edCineClean');$('edStop').style.display='none';stopRec();if(ED.on)$('edP').classList.add('on');render()}
function cineTick(){const p=ED.play;if(!p)return;const c=p.c,T=c.k[c.k.length-1].t;let tm=(performance.now()-p.t0)/1000;
 if(tm>T){if(p.loop){p.t0=performance.now();tm=0}else{const o=sampleCine(c,T);Object.assign(ED.fly,o);S.dbg={x:o.x,y:o.y,z:o.z,yaw:o.yaw,pitch:o.pitch,fov:o.fov};stopCine();return}}
 const o=sampleCine(c,tm);Object.assign(ED.fly,{x:o.x,y:o.y,z:o.z,yaw:o.yaw,pitch:o.pitch,fov:o.fov});ED.fly.ground=false;S.dbg={x:o.x,y:o.y,z:o.z,yaw:o.yaw,pitch:o.pitch,fov:o.fov}}
// gravar vídeo da cena 3D (webm) durante a cinemática
let mr=null,chunks=[];
function startRec(){try{const cv=$('h3gl');if(!cv||!cv.captureStream||!window.MediaRecorder){toast('Este aparelho não grava vídeo aqui');return}
 const st=cv.captureStream(30);const opt=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:12e6}:{videoBitsPerSecond:12e6};
 mr=new MediaRecorder(st,opt);chunks=[];mr.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};mr.onstop=()=>{try{const b=new Blob(chunks,{type:'video/webm'});const a=el('a');a.href=URL.createObjectURL(b);a.download='cinematica-'+Date.now()+'.webm';D.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000)}catch(e){toast('Não consegui salvar o vídeo')}chunks=[]};mr.start(500)}catch(e){toast('Gravação indisponível: '+(e.message||e))}}
function stopRec(){try{if(mr&&mr.state!=='inactive')mr.stop()}catch(e){}mr=null}
function tabCam(B){
 B.appendChild(h4('Voo livre'));
 const f=ED.fly;
 B.appendChild(row(btn(f&&f.mode==='free'?'⏹ Parar voo':'🕊 Voar (câmera livre)',()=>{if(f&&f.mode==='free'){stopFly()}else startFly('free');render()},f&&f.mode==='free'?'on':''),btn(f&&f.mode==='orbit'?'⏹ Parar órbita':'🎯 Orbitar jogador',()=>{if(f&&f.mode==='orbit'){stopFly()}else startFly('orbit');render()},f&&f.mode==='orbit'?'on':'')));
 if(f){
  B.appendChild(hint('Arraste a tela para olhar · joystick: anda na direção do olhar'+(f.mode==='free'?' · ▲▼ (direita) sobem e descem':' · joystick para frente/trás: aproxima e afasta')));
  B.appendChild(sld({label:'Velocidade',min:10,max:600,step:10,def:90,dec:0,get:()=>f.speed,set:v=>{f.speed=v}}));
  B.appendChild(sld({label:'Zoom (FOV°)',min:20,max:110,step:1,def:52,dec:0,get:()=>f.fov*180/PI,set:v=>{f.fov=v*PI/180;flyApply()}}));
  const tb=btn('Turbo ×3,5',()=>{ED.turbo=!ED.turbo;tb.classList.toggle('on',ED.turbo)},ED.turbo?'on':'');
  const gb=btn('Não atravessar o chão',()=>{f.ground=!f.ground;gb.classList.toggle('on',f.ground)},f.ground?'on':'');B.appendChild(row(tb,gb))}
 B.appendChild(h4('Cinemáticas'));
 const list=E.data.cam;
 if(!list.length)B.appendChild(hint('Nenhuma cinemática. Crie uma, voe até o ponto de vista e toque "+ Ponto aqui".'));
 B.appendChild(row(sel(list.map((c,i)=>[String(i),c.n]),String(ED._ci||0),v=>{ED._ci=+v;render()}),btn('+ Nova',()=>{hist();list.push({n:'Cena '+(list.length+1),loop:0,k:[]});ED._ci=list.length-1;E.touch();render()},'grn')));
 const c=CINE();
 if(c){
  const nm=el('input');nm.type='text';nm.value=c.n;nm.maxLength=30;nm.onchange=()=>{hist();c.n=nm.value||'Cena';E.touch();render()};
  B.appendChild(row(nm,two('Apagar cena',()=>{hist();list.splice(ED._ci||0,1);ED._ci=0;E.touch();render()},'red')));
  B.appendChild(row(btn('+ Ponto aqui',()=>{if(!S.mode){toast('Entre no 3D');return}hist();const sn=camSnap();const last=c.k[c.k.length-1];sn.t=last?last.t+3:0;c.k.push(sn);E.touch();render()},'blu')));
  const L=el('div','lst');L.style.maxHeight='200px';
  c.k.forEach((q,i)=>{const d=el('div');const sp=el('span');sp.textContent='#'+(i+1)+' · '+fmt(q.t,1)+'s';
   const ti=el('input');ti.type='number';ti.step='0.5';ti.min='0';ti.value=q.t;ti.style.width='54px';ti.onchange=()=>{hist();q.t=clp(+ti.value||0,0,3600);c.k.sort((a,b)=>a.t-b.t);E.touch();render()};
   d.append(sp,ti,btn('Ir',()=>{if(!ED.fly)startFly('free');Object.assign(ED.fly,{x:q.x,y:q.y,z:q.z,yaw:q.yaw,pitch:q.pitch,fov:q.fov});ED.fly.ground=false;flyApply()},'sm'),btn('↻',()=>{hist();Object.assign(q,camSnap());E.touch();render()},'sm'),btn('✕',()=>{hist();c.k.splice(i,1);E.touch();render()},'sm red'));L.appendChild(d)});
  B.appendChild(L);
  B.appendChild(hint('↻ troca o ponto pela câmera de agora · o número é o tempo (s) em que a câmera chega ao ponto'));
  const lp=el('label');lp.style.cssText='display:flex;gap:6px;align-items:center;margin:5px 0';const lc=el('input');lc.type='checkbox';lc.checked=!!c.loop;lc.onchange=()=>{c.loop=lc.checked?1:0;E.touch()};lp.append(lc,el('span','','Repetir sem parar'));B.appendChild(lp);
  const cl=el('label');cl.style.cssText='display:flex;gap:6px;align-items:center;margin:5px 0';const cc=el('input');cc.type='checkbox';cc.checked=ED.cleanUi!==false;cc.onchange=()=>{ED.cleanUi=cc.checked};cl.append(cc,el('span','','Esconder também barras de vida e números'));B.appendChild(cl);
  B.appendChild(row(btn('▶ Reproduzir',()=>playCine(false),'grn'),btn('⏺ Reproduzir e gravar vídeo',()=>playCine(true),'red')));
  B.appendChild(hint('Durante a cinemática toda a interface some. Toque em ■ Parar (canto) para sair. O vídeo (.webm) baixa sozinho no fim.'))}}

// ----- salvar / publicar -----
const GH={repo:'JPi437/Game-',path:'editor.json',branch:'main'};
const b64u=s=>btoa(unescape(encodeURIComponent(s)));
async function publish(tok,st){st.textContent='Enviando…';
 try{const base='https://api.github.com/repos/'+GH.repo+'/contents/'+GH.path,H={Authorization:'Bearer '+tok,Accept:'application/vnd.github+json'};
  let sha;const g=await fetch(base+'?ref='+GH.branch,{headers:H,cache:'no-store'});if(g.ok){sha=(await g.json()).sha}else if(g.status!==404){throw new Error('GitHub respondeu '+g.status+(g.status===401?' (token inválido)':g.status===403?' (sem permissão)':''))}
  const body=JSON.stringify({message:'Editor do ADM: ajustes do mapa, personagens e câmera',content:b64u(JSON.stringify(E.data)),branch:GH.branch,sha});
  const r=await fetch(base,{method:'PUT',headers:Object.assign({'Content-Type':'application/json'},H),body});
  if(!r.ok){const t=await r.text();throw new Error('Falhou ('+r.status+') '+t.slice(0,120))}
  E.pub=E.clean(E.data);try{localStorage.removeItem('mp_edit_draft')}catch(e){}E.dirty=false;
  st.textContent='Publicado! Os jogadores recebem ao abrir o jogo.'}catch(e){st.textContent='Erro: '+(e.message||e)}}
function tabSave(B){
 const c=E.count();
 B.appendChild(h4('Resumo'));
 const sum=el('div','hint');sum.innerHTML='Objetos mudados: <b>'+c.obj+'</b> · apagados: <b>'+c.del+'</b> · adicionados: <b>'+c.add+'</b><br>Monstros mudados: <b>'+c.mon+'</b> · personagens: <b>'+c.ch+'</b> · peças: <b>'+c.pt+'</b> · cinemáticas: <b>'+c.cam+'</b>';B.appendChild(sum);
 B.appendChild(hint(E.dirty?'Você tem mudanças NÃO publicadas (ficam salvas neste aparelho).':'Tudo igual ao publicado.'));
 B.appendChild(h4('Publicar para todos'));
 let tok='';try{tok=localStorage.getItem('mp_edit_gh')||''}catch(e){}
 const ti=el('input');ti.type='password';ti.placeholder='Token do GitHub (permissão Contents: leitura e escrita)';ti.value=tok;ti.style.width='100%';
 const st=el('div','hint');
 B.appendChild(ti);
 B.appendChild(row(btn('⬆ Publicar no GitHub',()=>{const t=ti.value.trim();if(!t){st.textContent='Cole o token primeiro.';return}try{localStorage.setItem('mp_edit_gh',t)}catch(e){}publish(t,st)},'grn')));
 B.appendChild(st);B.appendChild(hint('O token fica só neste aparelho. Crie em GitHub → Settings → Developer settings → Fine-grained tokens, só para o repositório do jogo, com "Contents: Read and write".'));
 B.appendChild(h4('Arquivo'));
 B.appendChild(row(btn('Copiar JSON',()=>{const j=JSON.stringify(E.data);try{navigator.clipboard.writeText(j).then(()=>toast('Copiado'),()=>{ta.value=j;ta.select();toast('Selecione e copie')})}catch(e){ta.value=j;ta.select()}}),btn('Baixar editor.json',()=>{const a=el('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(E.data)],{type:'application/json'}));a.download='editor.json';D.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},3000)})));
 const ta=el('textarea');ta.placeholder='Cole aqui um editor.json para carregar…';B.appendChild(ta);
 B.appendChild(row(btn('Carregar JSON colado',()=>{try{hist();E.setData(JSON.parse(ta.value));toast('Carregado');render()}catch(e){toast('JSON inválido')}},'blu')));
 B.appendChild(h4('Voltar atrás'));
 B.appendChild(row(two('Descartar rascunho (voltar ao publicado)',()=>{hist();E.discardDraft();E.admin=true;fixSel();render();toast('Voltou ao publicado')},'red'),two('Zerar TUDO',()=>{hist();E.setData(E.blank());fixSel();render()},'red')))}

// ============================================================ painel ============================================================
const P_=el('div');P_.id='edP';D.body.appendChild(P_);
const TABS=[['map','Mapa'],['mon','Monstros'],['mod','Modelo'],['cam','Câmera'],['save','Salvar']];
// na aba Modelo a peça escolhida sempre aparece vestida no seu personagem (senão não dá para ver o que está ajustando)
function autoWear(){if(ED.on&&ED.tab==='mod'&&!window.EDFORCE&&!ED._own)wear(ED._pk||'h1')}
function render(){if(!ED.on){P_.classList.remove('on');return}
 const old=P_.querySelector('.edB'),keep=old&&ED._rt===ED.tab?old.scrollTop:0;ED._rt=ED.tab;
 P_.classList.add('on');P_.classList.toggle('left',!!ED.left);P_.classList.toggle('min',!!ED.min);P_.innerHTML='';
 const H=el('div','edH');H.innerHTML='<b>🛠 Editor do ADM</b>';
 const hb=(t,tt,fn)=>{const x=el('button');x.textContent=t;x.title=tt;x.onclick=fn;H.appendChild(x);return x};
 hb('⇆','Painel para o outro lado da tela',()=>{ED.left=!ED.left;render();if(ED.fly&&ED.fly.mode==='orbit')flyApply()});
 hb(ED.min?'▢':'–',ED.min?'Abrir painel':'Minimizar painel',()=>{ED.min=!ED.min;render();if(ED.fly&&ED.fly.mode==='orbit')flyApply()});
 hb('✕','Fechar editor',()=>toggle(false));P_.appendChild(H);
 if(ED.min)return;
 const T=el('div','edT');TABS.forEach(([k,t])=>{const b=el('button',ED.tab===k?'on':'');b.textContent=t;b.onclick=()=>{ED.tab=k;ED._rt=null;autoWear();render()};T.appendChild(b)});P_.appendChild(T);
 const B=el('div','edB');P_.appendChild(B);
 try{({map:tabMap,mon:tabMon,mod:tabMod,cam:tabCam,save:tabSave})[ED.tab](B)}catch(e){console.error('EDITOR',e);B.appendChild(hint('Erro: '+e.message))}
 if(keep)B.scrollTop=keep}
// roda do mouse: rola o painel e nunca chega ao jogo (o jogo não tem zoom na roda, mas assim fica garantido)
P_.addEventListener('wheel',e=>{
 let n=e.target,inner=null;while(n&&n!==P_){if(n.nodeType===1&&n.scrollHeight>n.clientHeight+1&&/auto|scroll/.test(getComputedStyle(n).overflowY)){inner=n;break}n=n.parentNode}
 const B=P_.querySelector('.edB'),box=inner||B;if(!box){return}
 const dy=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?box.clientHeight:1);
 const top=box.scrollTop;box.scrollTop=top+dy;
 if(box.scrollTop===top&&inner&&B&&B!==inner)B.scrollTop+=dy;   // a lista chegou no fim: passa a rolagem para o painel
 e.preventDefault();e.stopPropagation()},{passive:false});
P_.addEventListener('pointerdown',e=>e.stopPropagation());
// toque: o navegador rola sozinho (touch-action:pan-y). Se por algum motivo ele não rolar, o dedo rola o painel à mão
let tsc=null;
P_.addEventListener('touchstart',e=>{const t=e.target,B=P_.querySelector('.edB');tsc=null;if(!B||e.touches.length!==1||(t.tagName==='INPUT'&&t.type==='range')||/^(SELECT|TEXTAREA)$/.test(t.tagName))return;
 let n=t,box=B;while(n&&n!==P_){if(n.nodeType===1&&n.scrollHeight>n.clientHeight+1&&/auto|scroll/.test(getComputedStyle(n).overflowY)){box=n;break}n=n.parentNode}
 tsc={y:e.touches[0].clientY,top:box.scrollTop,box,n:0,man:false}},{passive:true});
P_.addEventListener('touchmove',e=>{const c=tsc;if(!c||e.touches.length!==1)return;const dy=e.touches[0].clientY-c.y;
 if(!c.man){if(Math.abs(dy)>16){c.n++;if(c.n>=3&&c.box.scrollTop===c.top){c.man=true;c.y0=c.y+(dy>0?16:-16)}}if(!c.man)return}
 c.box.scrollTop=c.top-(e.touches[0].clientY-c.y0)},{passive:true});
P_.addEventListener('touchend',()=>{tsc=null},{passive:true});P_.addEventListener('touchcancel',()=>{tsc=null},{passive:true});     // clicar no painel nunca chega no jogo
function freeMouse(){try{S.mfree=true;if(document.pointerLockElement&&document.exitPointerLock)document.exitPointerLock()}catch(e){}}
function toggle(on){ED.on=on===undefined?!ED.on:on;if(!ED.on){ED.look=null;ED._own=false}else autoWear();L_.classList.toggle('on',ED.on);if(ED.on)freeMouse();else{try{S.mfree=false}catch(e){}}if(!ED.on){window.EDFORCE=null;if(ED.fly&&ED.fly.mode==='free'){/* mantém o voo? não: sai */}stopFly();ring.style.display='none'}render()}
const L_=el('button');L_.id='edBtn';L_.textContent='🛠 Editor';L_.onclick=()=>toggle();D.body.appendChild(L_);
const ring=el('div');ring.id='edRing';ring.innerHTML='<i></i>';D.body.appendChild(ring);
const stopB=el('button');stopB.id='edStop';stopB.textContent='■ Parar';stopB.onclick=stopCine;D.body.appendChild(stopB);
const flyB=el('div');flyB.id='edFly';const fu=el('button');fu.textContent='▲';const fd=el('button');fd.textContent='▼';flyB.append(fu,fd);D.body.appendChild(flyB);
for(const [b,v] of [[fu,1],[fd,-1]]){b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();upHeld=v;try{b.setPointerCapture(e.pointerId)}catch(x){}});for(const n of['pointerup','pointercancel','pointerleave'])b.addEventListener(n,()=>{if(upHeld===v)upHeld=0})}

// ============================================================ toques no mundo 3D ============================================================
let drag=null;
function glcEl(){return $('h3gl')}
addEventListener('pointerdown',e=>{if(!ED.on||!S.mode)return;const g=glcEl();if(!g||e.target!==g||ED.play)return;
 const ok=inField();
 if(ED.tab==='map'&&ED.tool==='mov'&&ED.sel&&ED.sel.type!=='mon'||ED.tab==='mon'&&ED.tool==='mov'&&ED.sel){
  const gr=groundAt(e.clientX,e.clientY),c=selCenter();if(!gr||!c)return;const sx=ED.sel.type==='mon'?(enList()[ED.sel.idx]||{}):ED.sel.o;
  const px=ED.sel.type==='mon'?enList()[ED.sel.idx].x+8:ED.sel.o.x,pz=ED.sel.type==='mon'?enList()[ED.sel.idx].y+15:ED.sel.o.z;
  drag={type:'move',id:e.pointerId,ox:px-gr[0],oz:pz-gr[2]};hist();E.hold(true);e.stopImmediatePropagation();e.preventDefault();try{g.setPointerCapture(e.pointerId)}catch(x){}return}
 if(ED.fly){drag={type:'look',id:e.pointerId,x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,t:Date.now()};e.stopImmediatePropagation();e.preventDefault();try{g.setPointerCapture(e.pointerId)}catch(x){}return}
 if(ok&&(ED.tab==='map'||ED.tab==='mon'))drag={type:'tap',id:e.pointerId,x0:e.clientX,y0:e.clientY,t:Date.now()}},true);
addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;
 if(drag.type==='move'){const gr=groundAt(e.clientX,e.clientY);if(gr){moveTo(gr[0]+drag.ox,gr[2]+drag.oz);ED._dirtyUi=1}e.stopImmediatePropagation();e.preventDefault()}
 else if(drag.type==='look'&&ED.fly){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;ED.fly.yaw+=dx*.0056;ED.fly.pitch=clp(ED.fly.pitch-dy*.0046,-1.5,1.5);if(!ED.play)flyApply();e.stopImmediatePropagation();e.preventDefault()}
 else if(drag.type==='tap'){if(hypot(e.clientX-drag.x0,e.clientY-drag.y0)>14)drag=null}},true);
addEventListener('pointerup',e=>{if(!drag||e.pointerId!==drag.id)return;const d=drag;drag=null;
 if(d.type==='move'){E.hold(false);render();e.stopImmediatePropagation();return}
 if(d.type==='look'){if(hypot(e.clientX-d.x0,e.clientY-d.y0)<10&&Date.now()-d.t<450&&inField())onPick(e.clientX,e.clientY);e.stopImmediatePropagation();return}
 if(d.type==='tap'&&Date.now()-d.t<500)onPick(e.clientX,e.clientY)},true);
addEventListener('pointercancel',e=>{if(drag&&e.pointerId===drag.id){if(drag.type==='move')E.hold(false);drag=null}},true);

addEventListener('keydown',e=>{if(!ED.fly||ED.play||!ED.on)return;const t=e.target;if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;
 if(e.code==='Space'||e.code==='KeyC'||e.code==='ShiftLeft'||e.code==='ShiftRight'){if(e.code==='Space')upHeld=1;else if(e.code==='KeyC')upHeld=-1;else ED.turboKey=true;e.preventDefault();e.stopImmediatePropagation()}},true);
addEventListener('keydown',e=>{if(!ED.on||ED.play)return;const t=e.target;if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;
 const c=e.ctrlKey||e.metaKey;
 if(c&&(e.code==='KeyZ')){e.preventDefault();e.stopImmediatePropagation();if(e.shiftKey)redo();else undo();return}
 if(c&&e.code==='KeyY'){e.preventDefault();e.stopImmediatePropagation();redo();return}
 if((e.code==='Delete')&&(ED.tab==='map'||ED.tab==='mon')){e.preventDefault();e.stopImmediatePropagation();try{delSel()}catch(x){}}},true);
addEventListener('keyup',e=>{if(!ED.fly)return;if(e.code==='Space'&&upHeld===1)upHeld=0;else if(e.code==='KeyC'&&upHeld===-1)upHeld=0;else if(e.code==='ShiftLeft'||e.code==='ShiftRight')ED.turboKey=false},true);
// ============================================================ laço por quadro ============================================================
const _tick=window.tick;
if(typeof tick==='function'){const t0=tick;tick=function(){
 if(ED.fly&&S.mode&&!S.dead){const sj=jx,sy=jy;jx=jy=0;try{if(ED.play)cineTick();else flyStep(sj,sy)}catch(e){console.error('EDITOR fly',e)}try{return t0.apply(this,arguments)}finally{jx=sj;jy=sy}}
 return t0.apply(this,arguments)}}
function frameUi(){requestAnimationFrame(frameUi);
 if(ED.on&&(S.mfree!==true||document.pointerLockElement))freeMouse();
 if(ED.on){ // o motor aplica as mudanças no próximo quadro: seleciona o objeto recém-criado e refaz o painel se a lista mudou
  if(ED.pend){const n=E.adds.get(ED.pend);if(n){selObj(n);ED.pend=null;render()}else if(Date.now()-ED.pendT>6000)ED.pend=null}
  const sg=E.gone.size+':'+E.adds.size;if(ED._sg!==sg){ED._sg=sg;fixSel();if(!drag)render()}}
 const can=!!(S&&S.mode&&!S.dead&&!S.ld&&typeof world!=='undefined'),vis=can&&E.admin!==undefined;
 if(L_._v!==can){L_._v=can;L_.style.display=can?'block':'none';if(!can&&ED.on)toggle(false)}
 if(ED.fly&&(!S.mode||S.dead)){stopFly();if(ED.on)render()}
 if(ED.play&&!ED.fly)stopCine();
 // anel da seleção
 const c=ED.on&&can?selCenter():null;
 if(c){const p=H3.proj(c.x,c.y,c.z);if(p&&p[2]>2&&p[0]>-200&&p[0]<S.cssW+200){const r=clp(c.r*focalPx()/p[2],16,360);ring.style.display='block';ring.style.left=p[0]+'px';ring.style.top=p[1]+'px';ring.style.width=ring.style.height=(r*2)+'px';const t=ring.firstChild;if(t.textContent!==c.t)t.textContent=c.t}else ring.style.display='none'}
 else ring.style.display='none'}
requestAnimationFrame(frameUi);
// quando a lista de objetos é refeita (entrou de novo no mapa), a seleção aponta de novo
E.onChange(()=>{if(ED.on&&ED.sel&&(ED.sel.type==='obj'||ED.sel.type==='add'))setTimeout(()=>{fixSel()},60)});
Object.defineProperty(ED,'drag',{get:()=>drag});
Object.assign(ED,{render,toggle,startFly,stopFly,camClose,playCine,stopCine,undo,redo,groundAt,pickAt,flyStep});
console.log('Editor do ADM pronto');
})();
