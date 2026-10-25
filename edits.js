/* edits.js — aplica no jogo os ajustes feitos no Editor do ADM (arquivo editor.json).
 * Todo jogador carrega este arquivo: ele só LÊ os ajustes publicados (dados validados) e os aplica.
 * A parte que EDITA (editor.js, painel, câmera livre) só é baixada por quem é ADM.
 * Cobre: objetos do Mundo 1 em 3D (árvores, arbustos, pedras, decoração: mover, girar, mudar tamanho/cor, apagar, adicionar),
 * monstros do Mundo 1 (apagar, mover, tamanho), tamanho dos personagens 3D e ajuste de cada peça de roupa/cabelo/acessório. */
(function(){
'use strict';
if(window.EDITS)return;
const PI=Math.PI,sin=Math.sin,cos=Math.cos,hypot=Math.hypot,max=Math.max,min=Math.min,round=Math.round;
const nm=(v,a,b,d)=>{v=+v;return isFinite(v)?(v<a?a:v>b?b:v):d};
const mp=()=>Object.create(null);
const KINDS=['tree','bush','rock','decor'],KN={tree:'Árvore',bush:'Arbusto',rock:'Pedra',decor:'Decoração'};
const E=window.EDITS={ver:1,KINDS,KN,data:null,pub:null,rev:1,admin:false,dirty:false,gone:new Map(),adds:new Map(),unb:[],blk:[],cb:[],sz:Object.create(null),
 onChange(f){E.cb.push(f)}};
const DRAFT='mp_edit_draft';

// ---------- dados: formato e validação (nada de fora entra sem passar por aqui) ----------
function blank(){return{v:1,t:0,o:mp(),a:mp(),m:mp(),ch:mp(),pt:mp(),cam:[]}}
function cOv(s,abs){const o={};if(!s||typeof s!=='object')return o;
 if(s.d)o.d=1;
 for(const k of['x','z'])if(s[k]!==undefined)o[k]=abs?nm(s[k],0,8000,0):nm(s[k],-4000,4000,0);
 if(s.y!==undefined)o.y=nm(s.y,-1000,1000,0);
 if(s.r!==undefined)o.r=nm(s.r,-60,60,0);
 for(const k of['sx','sy','sz'])if(s[k]!==undefined)o[k]=nm(s[k],.05,40,1);
 if(Array.isArray(s.c))o.c=[nm(s.c[0],0,4,1),nm(s.c[1],0,4,1),nm(s.c[2],0,4,1)];
 if(s.col!==undefined)o.col=s.col?1:0;
 return o}
const okKey=k=>typeof k==='string'&&k.length>0&&k.length<=40&&k!=='__proto__'&&k!=='constructor'&&k!=='prototype';
function clean(raw){const d=blank();if(!raw||typeof raw!=='object')return d;d.t=nm(raw.t,0,9e15,0);
 try{
 if(raw.o&&typeof raw.o==='object')for(const w of Object.keys(raw.o)){if(!/^[0-3]$/.test(w))continue;const wo=raw.o[w];if(!wo||typeof wo!=='object')continue;
  for(const k of KINDS.concat('scn')){const L=wo[k];if(!L||typeof L!=='object')continue;
   for(const key of Object.keys(L).slice(0,8000)){if(!okKey(key))continue;const ov=cOv(L[key]);if(!Object.keys(ov).length)continue;
    const A=d.o[w]||(d.o[w]=mp()),B=A[k]||(A[k]=mp());B[key]=ov}}}
 if(raw.a&&typeof raw.a==='object')for(const w of Object.keys(raw.a)){if(!/^[0-3]$/.test(w)||!Array.isArray(raw.a[w]))continue;const arr=[],seen=new Set();
  for(const s of raw.a[w].slice(0,3000)){if(!s||typeof s!=='object'||!KINDS.includes(s.k)||typeof s.v!=='string'||!/^[A-Za-z0-9.]{1,12}$/.test(s.v))continue;
   const i=String(s.i||'').replace(/[^A-Za-z0-9]/g,'').slice(0,12);if(!i||seen.has(i))continue;seen.add(i);const o=cOv(s,true);o.i=i;o.k=s.k;o.v=s.v;arr.push(o)}
  d.a[w]=arr}
 if(raw.m&&typeof raw.m==='object')for(const w of Object.keys(raw.m)){if(!/^[0-3]$/.test(w))continue;const M=raw.m[w];if(!M||typeof M!=='object')continue;
  for(const i of Object.keys(M).slice(0,500)){if(!/^\d{1,3}$/.test(i))continue;const s=M[i];if(!s||typeof s!=='object')continue;const o={};
   if(s.d)o.d=1;if(s.x!==undefined)o.x=nm(s.x,-3000,3000,0);if(s.y!==undefined)o.y=nm(s.y,-3000,3000,0);if(s.s!==undefined)o.s=nm(s.s,.1,20,1);
   if(Object.keys(o).length)(d.m[w]||(d.m[w]=mp()))[i]=o}}
 if(raw.ch&&typeof raw.ch==='object')for(const n of Object.keys(raw.ch).slice(0,60)){if(!/^[A-Za-z0-9 ._-]{1,24}$/.test(n)||n==='__proto__')continue;const s=raw.ch[n];if(!s||typeof s!=='object')continue;
  const o={sx:nm(s.sx,.2,6,1),sy:nm(s.sy,.2,6,1),sz:nm(s.sz,.2,6,1)};if(o.sx!==1||o.sy!==1||o.sz!==1)d.ch[n]=o}
 if(raw.pt&&typeof raw.pt==='object')for(const n of Object.keys(raw.pt).slice(0,60)){if(!/^[a-z0-9_]{1,12}$/.test(n))continue;const s=raw.pt[n];if(!s||typeof s!=='object')continue;
  const o={sx:nm(s.sx,.1,6,1),sy:nm(s.sy,.1,6,1),sz:nm(s.sz,.1,6,1),dx:nm(s.dx,-2,2,0),dy:nm(s.dy,-2,2,0),dz:nm(s.dz,-2,2,0),rx:nm(s.rx,-3.2,3.2,0),ry:nm(s.ry,-3.2,3.2,0),rz:nm(s.rz,-3.2,3.2,0),py:nm(s.py,0,1,.5),sm:s.sm?1:0};
  d.pt[n]=o}
 if(Array.isArray(raw.cam))for(const c of raw.cam.slice(0,30)){if(!c||typeof c!=='object'||!Array.isArray(c.k))continue;
  const k=[];for(const f of c.k.slice(0,80)){if(!f||typeof f!=='object')continue;k.push({x:nm(f.x,-1e5,1e5,0),y:nm(f.y,-1e5,1e5,0),z:nm(f.z,-1e5,1e5,0),yaw:nm(f.yaw,-100,100,0),pitch:nm(f.pitch,-1.6,1.6,0),fov:nm(f.fov,.2,2.2,.9),t:nm(f.t,0,3600,0)})}
  if(k.length)d.cam.push({n:String(c.n||'Cena').slice(0,30),loop:c.loop?1:0,k})}
 }catch(e){console.error('EDITS clean',e)}
 return d}
E.clean=clean;E.blank=blank;
E.data=blank();

// ---------- rascunho do ADM (só o ADM guarda e usa rascunho; os outros jogadores só enxergam o publicado) ----------
function stamp(){E.data.t=Date.now()}
E.save=function(){try{localStorage.setItem(DRAFT,JSON.stringify(E.data));E.dirty=true}catch(e){}};
E.touch=function(){stamp();E.rev++;if(E._hold){E._pend=1;return}if(E.admin)E.save();for(const f of E.cb)try{f()}catch(e){console.error(e)}};
// segura o salvamento enquanto algo é arrastado (um toque só grava no fim)
E.hold=function(on){if(on){E._hold=1;return}E._hold=0;if(E._pend){E._pend=0;stamp();if(E.admin)E.save();for(const f of E.cb)try{f()}catch(e){console.error(e)}}};
E.setData=function(raw){E.data=clean(raw);E.touch();rebuildSz()};
E.count=function(){const d=E.data,c={obj:0,del:0,add:0,mon:0,ch:Object.keys(d.ch).length,pt:Object.keys(d.pt).length,cam:d.cam.length};
 for(const w in d.o)for(const k in d.o[w])for(const key in d.o[w][k]){if(d.o[w][k][key].d)c.del++;else c.obj++}
 for(const w in d.a)c.add+=d.a[w].length;for(const w in d.m)c.mon+=Object.keys(d.m[w]).length;return c};
E.useDraft=function(){E.admin=true;try{const r=localStorage.getItem(DRAFT);if(!r)return false;const d=clean(JSON.parse(r));if(d.t>=(E.pub?E.pub.t:0)){E.data=d;E.rev++;E.dirty=true;return true}}catch(e){}return false};
E.discardDraft=function(){try{localStorage.removeItem(DRAFT)}catch(e){}E.dirty=false;E.data=E.pub?clean(E.pub):blank();E.rev++;for(const f of E.cb)try{f()}catch(x){}};
E.load=function(raw,asPub){const d=clean(raw);if(asPub)E.pub=d;E.data=d;E.rev++;if(E.admin)E.useDraft();for(const f of E.cb)try{f()}catch(e){}};
E.json=()=>JSON.stringify(E.data);
// o publicado é lido do editor.json (sem cache); se não existir ou der erro, o jogo segue normal
try{fetch('editor.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{if(j)E.load(j,true);E.pub=E.pub||clean(j||null)}).catch(()=>{})}catch(e){}

// ---------- tamanho dos personagens 3D: EDSZ('Guts') → [largura, altura, profundidade] ----------
const ONE=[1,1,1];
function rebuildSz(){const o=Object.create(null);for(const n of Object.keys(E.data.ch)){const c=E.data.ch[n];o[n]=[c.sx,c.sy,c.sz]}E.sz=o}
window.EDSZ=n=>E.sz[n]||ONE;
E.setChar=function(name,patch){if(!/^[A-Za-z0-9 ._-]{1,24}$/.test(name))return;const c=E.data.ch[name]||(E.data.ch[name]={sx:1,sy:1,sz:1});Object.assign(c,patch);
 for(const k of['sx','sy','sz'])c[k]=nm(c[k],.2,6,1);if(c.sx===1&&c.sy===1&&c.sz===1)delete E.data.ch[name];rebuildSz();E.touch()};

// ---------- ajuste de cada peça (cabelo, chapéu, camiseta, botas, capa, conjunto): usado pelo shader do personagem ----------
const ADJ_ID=new Float32Array([1,0,0,0,1,0,0,0,1]);
// caixa real do pedaço (a região da roupa do aventureiro ou a malha toda): o ponto de crescimento fica no centro DELE, não do corpo inteiro
const BBC=new WeakMap();
function u8(s){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
function boxOf(key,c){let M=BBC.get(c);if(!M){M={};BBC.set(c,M)}if(M[key])return M[key];
 const fallback={mn:[c.min[0],c.min[1],c.min[2]],mx:[c.min[0]+c.size[0],c.min[1]+c.size[1],c.min[2]+c.size[2]],lx:c.min[0]+c.size[0]*.25,rx:c.min[0]+c.size[0]*.75};
 try{
  const vb=new Uint16Array(u8(c.vb).buffer),n=c.n||(vb.length/11|0);let ids=null;
  if(/^av\d$/.test(key)&&c.cnt&&c.ib){const r=+key[2];let off=0;for(let i=0;i<r;i++)off+=c.cnt[i]||0;const ib=new Uint16Array(u8(c.ib).buffer);ids=ib.subarray(off,off+(c.cnt[r]||0))}
  const mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9],P=new Float32Array(3),xs=[];
  const eat=i=>{for(let k=0;k<3;k++){const v=c.min[k]+vb[i*11+k]/65535*c.size[k];if(v<mn[k])mn[k]=v;if(v>mx[k])mx[k]=v;P[k]=v}xs.push(P[0])};
  if(ids){if(!ids.length)return M[key]=fallback;for(let i=0;i<ids.length;i++)eat(ids[i])}else for(let i=0;i<n;i++)eat(i);
  const xm=(mn[0]+mx[0])/2;let l0=1e9,l1=-1e9,r0=1e9,r1=-1e9;for(const x of xs){if(x<xm){if(x<l0)l0=x;if(x>l1)l1=x}else{if(x<r0)r0=x;if(x>r1)r1=x}}
  const box={mn,mx,lx:l1>-1e8?(l0+l1)/2:mn[0],rx:r1>-1e8?(r0+r1)/2:mx[0]};
  if(!(mx[0]>mn[0]))return M[key]=fallback;return M[key]=box
 }catch(e){return M[key]=fallback}}
E.boxOf=boxOf;
E.partAdj=function(key,c){const p=E.data.pt[key];if(!p)return null;let a=p._c;
 if(!a||a.rev!==E.rev||a.cs!==c){const cx=cos(p.rx),sx=sin(p.rx),cy=cos(p.ry),sy=sin(p.ry),cz=cos(p.rz),sz=sin(p.rz);
  // R = Rz·Ry·Rx ; M = R·diag(s)  (guardado por colunas, como o WebGL quer)
  const r=[cy*cz,cy*sz,-sy, sx*sy*cz-cx*sz,sx*sy*sz+cx*cz,sx*cy, cx*sy*cz+sx*sz,cx*sy*sz-sx*cz,cx*cy];
  const m=new Float32Array([r[0]*p.sx,r[1]*p.sx,r[2]*p.sx, r[3]*p.sy,r[4]*p.sy,r[5]*p.sy, r[6]*p.sz,r[7]*p.sz,r[8]*p.sz]);
  const bx=boxOf(key,c),sm=p.sm?1:0,xc=sm?(bx.lx+bx.rx)/2:(bx.mn[0]+bx.mx[0])/2;
  Object.defineProperty(p,'_c',{value:a={rev:E.rev,cs:c,m,p:[xc,bx.mn[1]+(bx.mx[1]-bx.mn[1])*p.py,(bx.mn[2]+bx.mx[2])/2],o:[p.dx,p.dy,p.dz],sm,hs:sm?max(1e-4,(bx.rx-bx.lx)/2):0},writable:true,enumerable:false,configurable:true})}
 return a};
E.ADJ_ID=ADJ_ID;
E.setPart=function(key,patch){if(!/^[a-z0-9_]{1,12}$/.test(key))return;const p=E.data.pt[key]||(E.data.pt[key]={sx:1,sy:1,sz:1,dx:0,dy:0,dz:0,rx:0,ry:0,rz:0,py:.5,sm:0});Object.assign(p,patch);p.sm=p.sm?1:0;
 const L={sx:[.1,6,1],sy:[.1,6,1],sz:[.1,6,1],dx:[-2,2,0],dy:[-2,2,0],dz:[-2,2,0],rx:[-3.2,3.2,0],ry:[-3.2,3.2,0],rz:[-3.2,3.2,0],py:[0,1,.5]};
 for(const k in L)p[k]=nm(p[k],L[k][0],L[k][1],L[k][2]);
 if(p.sx===1&&p.sy===1&&p.sz===1&&!p.dx&&!p.dy&&!p.dz&&!p.rx&&!p.ry&&!p.rz&&!p.sm)delete E.data.pt[key];E.touch()};

// ---------- objetos do Mundo 1 (a lista NAT do motor 3D) ----------
let H3,FLD,NAT,M4;
const TREEK=v=>!(/^b[gdsx]$/.test(v)||/^r[kd]\d$/.test(v)||/^dc\d$/.test(v));
E.variants=function(kind){const out=[];if(!NAT||!NAT.VAR)return out;for(const k of Object.keys(NAT.VAR)){const b=/^b[gdsx]$/.test(k),r=/^r[kd]\d$/.test(k),d=/^dc\d$/.test(k);
  if(kind==='bush'?b:kind==='rock'?r:kind==='decor'?d:(!b&&!r&&!d))out.push(k)}return out};
const ovOf=(w,kind,key)=>{const a=E.data.o[w];return a&&a[kind]&&a[kind][key]||null};
function dKey(kind,o,cnt){const b=kind+':'+round(o.x*2)/2+','+round(o.z*2)/2,n=(cnt[b]=(cnt[b]||0)+1);return n>1?b+'#'+n:b}
const SOLID={tree:8,rock:7};     // raio (px) do tronco/pedra que bloqueia o andar, antes da escala
function origOf(kind,o){const m=o.m,sx=hypot(m[0],m[2]),sz=hypot(m[8],m[10]),sy=m[5],rot=Math.atan2(-m[2],m[0]);
 return{x:o.x,z:o.z,y:o.y,by:o.y-FLD.hAt(o.x,o.z),rot,sx,sy,sz,wx:o.wx-o.x,wy:o.wy-o.y,wz:o.wz-o.z,rad:o.rad,cr:o.cr,cy:(o.cy||0)-o.y,R:o.R,top:o.top,tint:o.tint?o.tint.slice():[1,1,1]}}
function place(o,e,x,z,yo,rot,sx,sy,sz,c){const gy=FLD.hAt(x,z),y=gy+e.by+yo;o.x=x;o.z=z;o.y=y;
 M4.trs(o.m,x,y,z,0,rot,0,sx,sy,sz);
 const kx=sx/e.sx,ky=sy/e.sy,kz=sz/e.sz,dr=rot-e.rot,cc=cos(dr),ss=sin(dr),lx=e.wx*kx,lz=e.wz*kz;
 o.wx=x+lx*cc+lz*ss;o.wz=z-lx*ss+lz*cc;o.wy=y+e.wy*ky;o.rad=e.rad*max(kx,ky,kz);
 if(e.cr!==undefined&&o.cr!==undefined){o.cr=e.cr*max(kx,kz);o.cy=y+e.cy*ky}
 if(e.R!==undefined)o.R=e.R*kx;if(e.top!==undefined)o.top=e.top*ky;
 o.tint=c?[e.tint[0]*c[0],e.tint[1]*c[1],e.tint[2]*c[2]]:e.tint.slice()}
function applyOne(o){if(o._scn)return;const e=o._e,ov=ovOf('0',e.kind,e.key);
 if(!ov){if(o._moved){place(o,e.o,e.o.x,e.o.z,0,e.o.rot,e.o.sx,e.o.sy,e.o.sz,null);o._moved=0}return}
 o._moved=1;place(o,e.o,e.o.x+(ov.x||0),e.o.z+(ov.z||0),ov.y||0,e.o.rot+(ov.r||0),e.o.sx*(ov.sx||1),e.o.sy*(ov.sy||1),e.o.sz*(ov.sz||1),ov.c||null)}
function mkAdd(a){const v=NAT.VAR[a.v];if(!v)return null;const kind=a.k;
 const o={x:a.x,y:0,z:a.z,key:a.v,v,m:new Float32Array(16),di:1,tint:[1,1,1],wx:a.x,wy:0,wz:a.z,rad:v.rad||10,_add:a.i};
 if(kind==='tree'){o.pal=a.v.charAt(0);o.R=(v.rad||20)*.5;o.top=v.rad||20;o.cr=(v.rad||20)*.8;o.cy=0;o.dead=a.v.charAt(0)==='x'}
 const e={kind,key:'a:'+a.i,o:{x:a.x,z:a.z,y:0,by:0,rot:0,sx:1,sy:1,sz:1,wx:v.cx||0,wy:v.cy||0,wz:v.cz||0,rad:v.rad||10,cr:kind==='tree'?o.cr:undefined,cy:kind==='tree'?(v.cy||0)*1.1:0,R:kind==='tree'?o.R:undefined,top:kind==='tree'?o.top:undefined,tint:[1,1,1]}};
 o._e=e;return o}
function applyAdd(o,a){const e=o._e;e.o.x=a.x;e.o.z=a.z;place(o,e.o,a.x,a.z,a.y||0,a.r||0,a.sx||1,a.sy||1,a.sz||1,a.c||null)}
E.listOf=kind=>{const L=NAT&&({tree:NAT.trees,bush:NAT.bushes,rock:NAT.rocks,decor:NAT.decor})[kind];return L||null};
E.objects=function*(){for(const k of KINDS){const L=E.listOf(k);if(L)for(const o of L)if(o._e)yield o}for(const p of E.scn)if(!p.hid)yield p};
E.keyOf=o=>o._e?o._e.key:null;

// ---------- cenário fixo do Mundo 1: estátua da estrela, máquina de passivas, chafariz (fonte) e pilares da praça ----------
// Cada um vira um "objeto" editável como os outros (mover, girar, tamanho, apagar, colisão). A estrela e o cristal giram sozinhos no motor:
// o tamanho deles é aplicado por um pequeno gancho no desenho (H3.mesh). Os pontos de interação (roleta e passivas) acompanham a peça.
E.scn=[];let scSt=null;const SCN_MESH=new Map();
const SCN_INFO={star:{n:'Estátua da estrela',k:'ped',solid:0,cz:0},mach:{n:'Máquina de passivas',k:'mach',solid:0,cz:0},fnt:{n:'Chafariz (fonte)',k:'fnt',solid:26,cz:0}};
function scnBuild(){const S=FLD.sce;scSt=S.st;E.scn=[];SCN_MESH.clear();for(const [k,g] of [...E.gone])if(g.kind==='scn')E.gone.delete(k);
 const mk=(key,name,it,inf)=>{const M=it.mt,e={x:M[12],y:M[13],z:M[14],rot:Math.atan2(-M[2],M[0]),sx:1,sy:1,sz:1,by:0},
  p={_scn:inf,key:name,items:[it],x:e.x,y:e.y,z:e.z,wx:it.wx,wy:it.wy,wz:it.wz,rad:it.rad,m:M,di:1,tint:[1,1,1],hid:0,e0:e};p._e={kind:'scn',key,o:e};return p};
 for(const key of['star','mach','fnt']){const inf=SCN_INFO[key],it=S.st.find(i=>i.k===inf.k);if(!it)continue;const p=mk(key,inf.n,it,inf);
  if(key==='star'&&S.star){p.ex=S.star;p.off=25.5;SCN_MESH.set(S.star.m,p)}else if(key==='mach'&&S.mach){p.ex=S.mach;p.off=24.5;SCN_MESH.set(S.mach.m,p)}else if(key==='fnt'&&S.fnt)p.ex=S.fnt;
  E.scn.push(p)}
 S.st.filter(i=>i.k==='pil').forEach((it,i)=>E.scn.push(mk('pil:'+i,'Pilar '+(i+1),it,{solid:8,cz:4})))}
function scnApply(p){const S=FLD.sce,e=p.e0,key=p._e.key,ov=ovOf('0','scn',key)||{};
 const x=e.x+(ov.x||0),z=e.z+(ov.z||0),rot=e.rot+(ov.r||0),sx=ov.sx||1,sy=ov.sy||1,sz=ov.sz||1,y=e.y+(FLD.hAt(x,z)-FLD.hAt(e.x,e.z))+(ov.y||0);
 const it=p.items[0],M=it.mt,m=it.m;M4.trs(M,x,y,z,0,rot,0,sx,sy,sz);
 it.wx=M[0]*m.cx+M[4]*m.cy+M[8]*m.cz+M[12];it.wy=M[1]*m.cx+M[5]*m.cy+M[9]*m.cz+M[13];it.wz=M[2]*m.cx+M[6]*m.cy+M[10]*m.cz+M[14];it.rad=m.rad*max(sx,sy,sz)*1.02;
 p.x=x;p.y=y;p.z=z;p.wx=it.wx;p.wy=it.wy;p.wz=it.wz;p.rad=it.rad;
 const hid=!!ov.d,L=S.L,at=S.st.indexOf(it);
 if(hid&&at>=0)S.st.splice(at,1);else if(!hid&&at<0)S.st.push(it);
 p.hid=hid?1:0;if(hid)E.gone.set(key,{kind:'scn',o:e,obj:p});else E.gone.delete(key);
 const ex=p.ex;
 if(key==='star'){S.star=hid?null:ex;if(ex){ex.x=x;ex.y=y;ex.z=z;ex.top=y+26*sy;ex._k=[sx,sy,sz]}if(L&&L.star){L.star.x=x;L.star.z=z;L.star.y=y+26*sy-6;L.star.r=hid?0:52}}
 else if(key==='mach'){S.mach=hid?null:ex;if(ex){ex.x=x;ex.y=y;ex.z=z;ex._k=[sx,sy,sz]}if(L&&L.mach){L.mach.x=x;L.mach.z=z;L.mach.y=y+22*sy;L.mach.r=hid?0:38}}
 else if(key==='fnt'){S.fnt=hid?null:ex;if(ex){ex.x=x;ex.z=z;ex.y=y+19.2*(sy-1)}}}
function scnTiles(){try{if(typeof world==='undefined'||world!==0||typeof map==='undefined'||!map||typeof SX0==='undefined')return;
 for(const [key,X0,Y0,tile] of [['star',SX0,SY0,4],['mach',TOX0,TOY0,5]]){const p=E.scn.find(q=>q._e.key===key);if(!p)continue;
  const wx=p.hid?X0:X0+round((p.x-p.e0.x)/16),wy=p.hid?Y0:Y0+round((p.z-p.e0.z)/16),st=key==='star',cx=st?SX:TOX,cy=st?SY:TOY;
  if(cx===wx&&cy===wy)continue;
  if(map[cy]&&map[cy][cx]===tile)map[cy][cx]=0;if(map[wy])map[wy][wx]=tile;
  if(st){SX=wx;SY=wy}else{TOX=wx;TOY=wy}}}catch(e){if(!E._te){E._te=1;console.error('EDITS tiles',e)}}}
let seen={},CM0=null;
E._cm0=()=>CM0;
function cmApply(){if(typeof CM==='undefined'||typeof CW==='undefined'||!CM0)return;CM.set(CM0);
 const circ=(x,z,r,v)=>{const x0=Math.max(0,(x-r)>>2),x1=Math.min(CW-1,(x+r)>>2),y0=Math.max(0,(z-r)>>2),y1=(z+r)>>2;
  for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++){const px=cx*4+2,py=cy*4+2;if(hypot(px-x,py-z)>r)continue;const i=cy*CW+cx;if(i<0||(i>>3)>=CM.length)continue;if(v)CM[i>>3]|=1<<(7-(i&7));else CM[i>>3]&=~(1<<(7-(i&7)))}};
 for(const u of E.unb)circ(u.x,u.z,u.r,1);
 for(const b of E.blk)circ(b.x,b.z,b.r,0)}
function sweep(){E.unb=[];E.blk=[];
 const rr=(o,k)=>(SOLID[k]||5)*max(hypot(o.m[0],o.m[2]),hypot(o.m[8],o.m[10]));
 for(const o of E.objects()){const e=o._e;if(o._add||o._scn)continue;const ov=ovOf('0',e.kind,e.key);if(!ov)continue;
  const s0=SOLID[e.kind],moved=!!(ov.x||ov.z),on=ov.col!==undefined?!!ov.col:!!s0;
  if(s0&&(moved||!on))E.unb.push({x:e.o.x,z:e.o.z+2,r:s0*max(e.o.sx,e.o.sz)});   // no lugar de origem deixa de bloquear
  if(on&&(moved||!s0))E.blk.push({x:o.x,z:o.z+2,r:rr(o,e.kind)})}                // bloqueia onde está agora
 for(const [key,g] of E.gone){const s0=SOLID[g.kind];if(s0)E.unb.push({x:g.o.x,z:g.o.z+2,r:s0*max(g.o.sx,g.o.sz)})}
 for(const o of E.adds.values()){const a=o._a;const s0=SOLID[a.k];const on=a.col!==undefined?a.col:(s0?1:0);if(on)E.blk.push({x:o.x,z:o.z+2,r:(s0||5)*max(a.sx||1,a.sz||1)})}
 for(const p of E.scn){const ov=ovOf('0','scn',p._e.key);if(!ov)continue;const s0=p._scn.solid||0,e=p.e0,cz=p._scn.cz||0,hid=!!ov.d,
  moved=!!(ov.x||ov.z||ov.sx||ov.sz),on=hid?false:(ov.col!==undefined?!!ov.col:!!s0);
  if(s0&&(moved||!on))E.unb.push({x:e.x,z:e.z+cz,r:s0+1});
  if(on&&(moved||!s0))E.blk.push({x:p.x,z:p.z+cz*max(ov.sz||1,1),r:(s0||12)*max(ov.sx||1,ov.sz||1)})}
 cmApply()}
function monsters(){let EN0;try{EN0=WD[0].EN}catch(e){return}if(!EN0)return;const M=E.data.m['0']||{};
 EN0.forEach((e,i)=>{if(!e._eo)e._eo={x:e.x,y:e.y};const ov=M[i];
  if(ov){e.x=e._eo.x+(ov.x||0);e.y=e._eo.y+(ov.y||0);e.edsc=ov.s||1;
   if(ov.d){e.off=1;if(typeof fight!=='undefined'&&fight===e){try{fight=null}catch(x){}}e.dead=true;e.back=Infinity;e.hp=0}
   else if(e.off){e.off=0;e.dead=false;e.hp=e.max;e.back=0}}
  else if(e._ed){e.x=e._eo.x;e.y=e._eo.y;e.edsc=1;if(e.off){e.off=0;e.dead=false;e.hp=e.max;e.back=0}}
  e._ed=ov?1:0;
  if(e.off&&(!e.dead||e.back!==Infinity)){e.dead=true;e.back=Infinity;e.hp=0}})}
function reapply(){
 // apagados / voltou
 for(const kind of KINDS){const L=E.listOf(kind);if(!L)continue;
  for(let i=L.length-1;i>=0;i--){const o=L[i];if(!o._e||o._add)continue;const ov=ovOf('0',kind,o._e.key);if(ov&&ov.d){L.splice(i,1);E.gone.set(o._e.key,{kind,o:o._e.o,obj:o})}}}
 for(const [key,g] of [...E.gone]){const ov=ovOf('0',g.kind,key);if(!ov||!ov.d){E.gone.delete(key);const L=E.listOf(g.kind);if(L&&!L.includes(g.obj))L.push(g.obj)}}
 for(const o of E.objects())if(!o._add)applyOne(o);
 for(const p of E.scn)scnApply(p);
 // adicionados
 const want=new Map();for(const a of E.data.a['0']||[])want.set(a.i,a);
 for(const [id,o] of [...E.adds]){if(!want.has(id)){const L=E.listOf(o._a.k);if(L){const i=L.indexOf(o);if(i>=0)L.splice(i,1)}E.adds.delete(id)}}
 for(const [id,a] of want){let o=E.adds.get(id);if(!o){o=mkAdd(a);if(!o)continue;const L=E.listOf(a.k);if(!L)continue;L.push(o);E.adds.set(id,o)}o._a=a;applyAdd(o,a)}
 sweep();monsters()}
function fresh(){const N=NAT;let f=false;for(const k of KINDS){const L=E.listOf(k);if(L!==seen[k]){seen[k]=L;f=true}}return f}
function frame(){if(!FLD||!FLD.ready||!NAT||!NAT.trees)return;
 if(fresh()){E.gone.clear();E.adds.clear();
  if(typeof CM!=='undefined'&&!CM0&&!window.__gen)CM0=CM.slice();   // mapa já gerado: guarda a colisão original
  const cnt={};for(const kind of KINDS){const L=E.listOf(kind);if(!L)continue;for(const o of L){if(o._e)continue;const key=dKey(kind,o,cnt);o._e={kind,key,o:origOf(kind,o)}}}
  E._rv=-1}
 {const S=FLD.sce;if(S&&S.ready&&S.st&&S.st!==scSt&&S.st.length){scnBuild();E._rv=-1}else if(S&&!S.ready&&E.scn.length){E.scn=[];scSt=null}}
 if(E._rv!==E.rev){E._rv=E.rev;reapply()}
 if(E.scn.length)scnTiles();
 else if(E.data.m['0']||E._anyM){E._anyM=!!E.data.m['0'];monsters()}
 for(const e of(function(){try{return WD[0].EN}catch(x){return[]}})())if(e.off){if(!e.dead||e.back!==Infinity){e.dead=true;e.back=Infinity;e.hp=0}}}
E.hookCM=function(){
 // o mapa guardado no aparelho (cache) tem de levar sempre a colisão original, nunca a editada
 try{if(typeof mcSave==='function'&&!mcSave._ed){const _s=mcSave;mcSave=function(){if(!CM0)return _s.apply(this,arguments);const cur=CM.slice();CM.set(CM0);try{return _s.apply(this,arguments)}finally{CM.set(cur)}};mcSave._ed=1}}catch(e){}};
E.setObj=function(kind,key,patch){const w='0',O=E.data.o[w]||(E.data.o[w]=mp()),K=O[kind]||(O[kind]=mp());let ov=K[key]||(K[key]={});
 const c=cOv(Object.assign({},ov,patch));
 const same=(a,b)=>Math.abs(a-b)<1e-6;
 if(c.x!==undefined&&same(c.x,0))delete c.x;if(c.z!==undefined&&same(c.z,0))delete c.z;if(c.y!==undefined&&same(c.y,0))delete c.y;if(c.r!==undefined&&same(c.r,0))delete c.r;
 for(const k of['sx','sy','sz'])if(c[k]!==undefined&&same(c[k],1))delete c[k];
 if(c.c&&same(c.c[0],1)&&same(c.c[1],1)&&same(c.c[2],1))delete c.c;
 if(!Object.keys(c).length){delete K[key]}else K[key]=c;E.touch()};
E.resetObj=(kind,key)=>{const O=E.data.o['0'];if(O&&O[kind]&&O[kind][key]){delete O[kind][key];E.touch()}};
E.addObj=function(a){const L=E.data.a['0']||(E.data.a['0']=[]);if(L.length>=3000)return null;const i=Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-4);
 const o=cOv(a,true);o.i=i;o.k=a.k;o.v=a.v;L.push(o);E.touch();return i};
E.setAdd=function(id,patch){const L=E.data.a['0']||[];const a=L.find(q=>q.i===id);if(!a)return;const c=cOv(Object.assign({},a,patch),true);c.i=a.i;c.k=a.k;c.v=a.v;L[L.indexOf(a)]=c;E.touch()};
E.delAdd=id=>{const L=E.data.a['0']||[];const i=L.findIndex(q=>q.i===id);if(i>=0){L.splice(i,1);E.touch()}};
E.setMon=function(idx,patch){const M=E.data.m['0']||(E.data.m['0']=mp());const c=Object.assign({},M[idx]||{},patch);
 if(!c.d)delete c.d;if(!c.x)delete c.x;if(!c.y)delete c.y;if(!c.s||Math.abs(c.s-1)<1e-6)delete c.s;if(Object.keys(c).length)M[idx]=c;else delete M[idx];E.touch()};

// ---------- ligação com o motor ----------
function init(){H3=window.H3;FLD=H3&&H3.fld;NAT=FLD&&FLD.nat;M4=H3&&H3.M4;if(!FLD||!NAT||!M4)return false;
 try{FLD.reg({frame:()=>{try{frame()}catch(e){if(!E._er){E._er=1;console.error('EDITS',e)}}}})}catch(e){return false}
 E.hookCM();rebuildSz();
 try{const hm=H3.mesh;if(hm&&!hm._ed){H3.mesh=function(m,mt){const q=SCN_MESH.get(m);if(q&&q.ex&&q.ex._k&&mt){const k=q.ex._k;
   if(k[0]!==1||k[1]!==1||k[2]!==1){mt[0]*=k[0];mt[1]*=k[0];mt[2]*=k[0];mt[4]*=k[1];mt[5]*=k[1];mt[6]*=k[1];mt[8]*=k[2];mt[9]*=k[2];mt[10]*=k[2];mt[13]+=(k[1]-1)*q.off}}
   return hm.apply(this,arguments)};H3.mesh._ed=1}}catch(e){console.error('EDITS mesh',e)}
 return true}
E.cb.push(rebuildSz);
(function boot(n){if(init())return;if(n<60)setTimeout(()=>boot(n+1),500)})(0);
})();
