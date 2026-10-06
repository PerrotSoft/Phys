
// ====== ДАННЫЕ. Элемент: [символ, название, группа, плотность, T плав., T кип., цвет, радиус атома (пм), опции] ======
// опции: metal, pow(порошок), h/o/w/acid/wr/react — правила реакций; dec:['дочерний',вероятность] — радиоактивный распад
const DATA=[
['H','Водород','Газы',.09,14,20,[190,215,255],53,{h:1}],
['He','Гелий','Газы',.18,1,4,[255,230,255],31],
['N','Азот','Газы',1.25,63,77,[170,170,230],65],
['O','Кислород','Газы',1.4,54,90,[140,200,255],60,{o:1}],
['Cl','Хлор','Газы',3.2,172,239,[190,230,120],100],
['C','Углерод','Твёрдые',2.2,3800,4300,[45,45,45],70,{pow:1}],
['Na','Натрий','Металлы',.97,371,1156,[220,220,200],180,{metal:1,wr:1,react:.5}],
['Al','Алюминий','Металлы',2.7,933,2792,[190,195,205],125,{metal:1,react:.2}],
['Fe','Железо','Металлы',7.87,1811,3134,[130,130,138],140,{metal:1,react:.1}],
['Cu','Медь','Металлы',8.96,1358,2835,[205,120,70],135,{metal:1}],
['Ag','Серебро','Металлы',10.5,1235,2435,[225,225,230],160,{metal:1}],
['Hg','Ртуть','Металлы',13.5,234,630,[200,200,210],150,{metal:1,cond:.6}],
['Pb','Свинец','Металлы',11.3,600,2022,[90,95,120],180,{metal:1}],
['Au','Золото','Металлы',19.3,1337,3129,[255,200,40],135,{metal:1}],
['W','Вольфрам','Металлы',19.3,3695,5828,[100,100,105],135,{metal:1}],
['Ra','Радий','Радио',5,973,2010,[200,255,200],215,{metal:1,dec:['Rn',.0006]}],
['Rn','Радон','Радио',.0097,202,211,[150,255,230],120,{dec:['Pb',.0008]}],
['U','Уран','Радио',19.1,1405,4404,[110,160,110],175,{metal:1,dec:['Pb',.0004]}],
['Og','Оганесон','Радио',7,325,450,[255,120,255],230,{dec:['Rn',.01]}]
];
// Готовые соединения (ключ — состав по алфавиту). Остальные игрок собирает сам.
const COMP=[
['H₂O','Вода',1,273,373,[50,120,255],70,{w:1,lat:250,cond:.3},'H2O'],
['HCl','Кислота',1.2,247,321,[150,255,60],80,{acid:1},'ClH'],
['NaCl','Соль',2.16,1074,1686,[240,240,240],140,{pow:1},'ClNa'],
['SiO₂','Песок',2.6,1986,2503,[230,200,120],110,{pow:1}]
];
const M=[null],ID={},FORM={};
function add(s,n,g,rho,mp,bp,col,r,o){M.push(Object.assign({s,n,g,rho,mp,bp,col,r,sz:Math.max(1,Math.round(r/55)),cond:o&&o.metal?1:.2,lat:60},o));return M.length-1}
DATA.forEach(d=>{ID[d[0]]=add(...d)});
M.forEach(m=>{if(m&&m.dec){m.dp=m.dec[1];m.dec=ID[m.dec[0]]}});
COMP.forEach(c=>{const id=add(c[0],c[1],'Соединения',c[2],c[3],c[4],c[5],c[6],c[7]);if(c[8])FORM[c[8]]=id});
const H1=ID.H,HE=ID.He,WATER=FORM.H2O,RAD=add('γ','Излучение','Особые',.001,0,1e9,[200,255,80],20,{});

let W,H,N,ty,T,ph,mv,u32,img,PX=3,z=1,ox=0,oy=0;
let vac=true,gm=0,paused=false,fr=0,cur=WATER,tool='draw',brush=3,tdraw=293,down=false,px=0,py=0,lx=0,ly=0;
const $=id=>document.getElementById(id),cv=$('c'),ctx=cv.getContext('2d');
function layout(){cv.style.width=W*PX*z+'px';cv.style.height=H*PX*z+'px';cv.style.transform='translate('+ox+'px,'+oy+'px)'}
function init(){const s=$('stage');W=Math.max(40,Math.floor(s.clientWidth/PX));H=Math.max(40,Math.floor(s.clientHeight/PX));N=W*H;
 ty=new Uint8Array(N);T=new Float32Array(N);ph=new Uint8Array(N);mv=new Uint8Array(N);cv.width=W;cv.height=H;img=ctx.createImageData(W,H);u32=new Uint32Array(img.data.buffer);z=1;ox=oy=0;layout()}

function bpE(m){return vac?Math.max(m.mp+1,m.bp*.7):m.bp}
function phase(i){const m=M[ty[i]],t=T[i];return t<m.mp?0:t<bpE(m)?1:2}
function eff(i){return ph[i]==2?M[ty[i]].rho*.001:M[ty[i]].rho}
function mov(i,j){let a=ty[i];ty[i]=ty[j];ty[j]=a;let b=T[i];T[i]=T[j];T[j]=b;a=ph[i];ph[i]=ph[j];ph[j]=a;mv[i]=mv[j]=fr}
function tryM(i,x,y,dx,dy){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H||(!dx&&!dy))return false;const j=ny*W+nx;
 if(!ty[j]){mov(i,j);return true}
 if(ph[j]>0&&ty[j]!==RAD&&ph[i]<2&&mv[j]!==fr&&eff(i)>eff(j)){mov(i,j);return true}return false}
function emit(i){const o=((Math.random()*8)|0);for(let k=0;k<8;k++){const d=(o+k)&7,x=i%W+[-1,0,1,-1,1,-1,0,1][d],y=((i/W)|0)+[-1,-1,-1,0,0,1,1,1][d];
 if(x<0||y<0||x>=W||y>=H)continue;const j=y*W+x;if(!ty[j]){ty[j]=RAD;T[j]=8+Math.random()*12;ph[j]=2;return}}}
function decay(i){const m=M[ty[i]];ty[i]=m.dec;T[i]+=300;ph[i]=phase(i);emit(i)}
const alloys={};
function alloy(a,b,i,j){const k=a<b?a+'_'+b:b+'_'+a;let id=alloys[k];
 if(!id){if(M.length>250)return;const p=M[a],q=M[b];
  id=add(p.s+'-'+q.s,p.s+'-'+q.s+' (сплав)','Сплавы',(p.rho+q.rho)/2,(p.mp+q.mp)/2-80,(p.bp+q.bp)/2,p.col.map((c,n)=>(c+q.col[n])>>1),(p.r+q.r)/2,{metal:1,react:((p.react||0)+(q.react||0))/2});
  alloys[k]=id;customComp.push(id);buildMats()}
 ty[i]=ty[j]=id;T[i]=T[j]=(T[i]+T[j])/2}

function step(){
 fr=(fr+1)&255;let cx=0,cy=0;
 if(gm==1){let sx=0,sy=0,sm=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(ty[i]){const w=M[ty[i]].rho;sx+=x*w;sy+=y*w;sm+=w}}if(sm){cx=sx/sm;cy=sy/sm}}
 for(let y=H-1;y>=0;y--){const rl=Math.random()<.5;
  for(let k=0;k<W;k++){const x=rl?k:W-1-k;let i=y*W+x;const t=ty[i];if(!t||mv[i]===fr)continue;const m=M[t];
   if(t===RAD){T[i]-=1;if(T[i]<=0){ty[i]=0;continue}
    for(let s=0;s<2;s++){const X=x+((Math.random()*3)|0)-1,Y=y+((Math.random()*3)|0)-1;if(X<0||Y<0||X>=W||Y>=H)break;const j=Y*W+X;
     if(!ty[j]){mov(i,j);i=j}else if(ty[j]!==RAD){T[j]+=40;const n=M[ty[j]];if(n.dec&&Math.random()<.25)decay(j);if(Math.random()<.3)ty[i]=0;break}}
    continue}
   if(m.dec&&Math.random()<m.dp){decay(i);continue}
   const d=(Math.random()*8)|0,dx=[-1,0,1,-1,1,-1,0,1][d],dy=[-1,-1,-1,0,0,1,1,1][d],nx=x+dx,ny=y+dy;
   if(nx>=0&&ny>=0&&nx<W&&ny<H){const j=ny*W+nx,tj=ty[j];
    if(tj&&tj!==RAD){const n=M[tj],q=(T[j]-T[i])*.25*Math.min(m.cond,n.cond);T[i]+=q;T[j]-=q;
     if(m.acid&&n.react&&Math.random()<n.react){ty[j]=H1;T[j]+=200;ph[j]=2;if(Math.random()<.4)ty[i]=0}
     else if(m.w&&n.wr&&Math.random()<.3){ty[j]=H1;T[j]+=500;ph[j]=2}
     else if(m.h&&n.o&&Math.max(T[i],T[j])>700){ty[i]=ty[j]=WATER;T[i]=T[j]=Math.max(T[i],T[j])+1200;ph[i]=ph[j]=2}
     else if(m.h&&n.h&&Math.min(T[i],T[j])>5000&&Math.random()<.3){ty[i]=ty[j]=HE;T[i]=T[j]=Math.min(T[i],T[j])+3000;ph[i]=ph[j]=2;emit(i)}
     else if(m.metal&&n.metal&&t!==tj&&ph[i]==1&&ph[j]==1)alloy(t,tj,i,j)}}
   if(!ty[i])continue;
   T[i]+=(293-T[i])*.0003;
   const p=phase(i);
   if(p!==ph[i]){if(ph[i]==1&&p==2)T[i]-=m.lat;else if(ph[i]==2&&p==1)T[i]+=m.lat;ph[i]=p}
   if(p==0&&!m.pow)continue;
   let gx=0,gy=1,pr=1;
   if(gm==1){const ex=cx-x,ey=cy-y;gx=ex>.7?1:ex<-.7?-1:0;gy=ey>.7?1:ey<-.7?-1:0;pr=.6;if(!gx&&!gy)continue}
   else if(gm==2){gx=((Math.random()*3)|0)-1;gy=((Math.random()*3)|0)-1;pr=.3}
   pr/=1+(m.sz-1)*.35; // крупные атомы подвижнее хуже
   if(Math.random()>pr)continue;
   if(ph[i]==2){const rx=((Math.random()*3)|0)-1,ry=((Math.random()*3)|0)-1;
    tryM(i,x,y,gm==1?(Math.random()<.3?gx:rx):rx,gm==0&&!vac&&Math.random()<.5?-1:(gm==1&&Math.random()<.3?gy:ry));continue}
   if(tryM(i,x,y,gx,gy))continue;
   if(m.rho<2&&Math.random()<.004/m.sz){const X=x+gx,Y=y+gy;if(X>=0&&Y>=0&&X<W&&Y<H){const j=Y*W+X;if(ty[j]&&ph[j]==0&&!M[ty[j]].pow&&mv[j]!==fr){mov(i,j);continue}}} // туннелирование
   const s=Math.random()<.5?1:-1,qx=-gy,qy=gx,cl=v=>Math.max(-1,Math.min(1,v));
   if(tryM(i,x,y,cl(gx+s*qx),cl(gy+s*qy)))continue;
   if(tryM(i,x,y,cl(gx-s*qx),cl(gy-s*qy)))continue;
   if(ph[i]==1)tryM(i,x,y,s*qx,s*qy)||tryM(i,x,y,-s*qx,-s*qy);
  }}
}
function render(){
 for(let i=0;i<N;i++){const t=ty[i];if(!t){u32[i]=0xff000000;continue}
  const m=M[t];let[r,g,b]=m.col;const k=ph[i]==2&&t!==RAD?.55:1;r*=k;g*=k;b*=k;
  const tt=T[i];if(t!==RAD){if(tt>700){const f=Math.min(1,(tt-700)/1500);r+=(255-r)*f;g+=(140-g)*f*.8;b+=(30-b)*f}
  else if(tt<250&&ph[i]!=2){const f=Math.min(.6,(250-tt)/300);r+=(200-r)*f;g+=(235-g)*f;b+=(255-b)*f}}
  u32[i]=0xff000000|(b&255)<<16|(g&255)<<8|(r&255)}
 ctx.putImageData(img,0,0)}

function cell(e){const r=cv.getBoundingClientRect();return[Math.floor((e.clientX-r.left)/r.width*W),Math.floor((e.clientY-r.top)/r.height*H)]}
function apply(x,y){
 for(let a=-brush;a<=brush;a++)for(let b=-brush;b<=brush;b++){if(a*a+b*b>brush*brush)continue;const X=x+a,Y=y+b;if(X<0||Y<0||X>=W||Y>=H)continue;const i=Y*W+X;
  if(tool=='draw'){if(!ty[i]&&Math.random()<(brush<2?1:.7/M[cur].sz)){ty[i]=cur;T[i]=cur===RAD?15:tdraw;ph[i]=cur===RAD?2:phase(i)}}
  else if(tool=='erase')ty[i]=0;
  else if(ty[i]&&tool=='heat')T[i]+=400;
  else if(ty[i]&&tool=='cool')T[i]=Math.max(1,T[i]-100)}}
function pipette(x,y){if(x<0||y<0||x>=W||y>=H)return;const i=y*W+x;if(!ty[i]){$('info').textContent='Пусто (вакуум)';return}
 cur=ty[i];addPal(cur);const m=M[cur];$('info').textContent=m.n+' · '+Math.round(T[i])+' K · '+['твёрдое','жидкость','газ'][ph[i]]+' · ρ='+m.rho.toFixed(2)+' · атом '+Math.round(m.r)+' пм (кл.'+m.sz+')';mark()}
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);down=true;lx=e.clientX;ly=e.clientY;[px,py]=cell(e);if(tool=='pip')pipette(px,py)});
cv.addEventListener('pointermove',e=>{if(!down)return;if(tool=='hand'){ox+=e.clientX-lx;oy+=e.clientY-ly;layout()}else{[px,py]=cell(e);if(tool=='pip')pipette(px,py)}lx=e.clientX;ly=e.clientY});
['pointerup','pointercancel'].forEach(n=>cv.addEventListener(n,()=>down=false));
$('zi').onclick=()=>{z=Math.min(6,z*1.4);layout()};$('zo').onclick=()=>{z=Math.max(1,z/1.4);if(z==1)ox=oy=0;layout()};
$('grav').onchange=e=>gm=+e.target.value;$('vac').onchange=e=>vac=e.target.checked;
$('pause').onclick=e=>{paused=!paused;e.target.classList.toggle('on',paused)};
$('clr').onclick=()=>{ty.fill(0);T.fill(0);ph.fill(0)};
$('br').oninput=e=>brush=+e.target.value;
$('tp').oninput=e=>{tdraw=+e.target.value;$('tv').textContent=tdraw+'K'};
$('ps').oninput=e=>{const k=+e.target.value;PX=[6,4,3,2,1.5][k-3];$('pv2').textContent='10⁻'+'₀₁₂₃₄₅₆₇₈₉'[k]+' м'.replace('₀','');$('pv2').textContent='10^-'+k+' м';init()};

// ====== UI ======
const TOOLS=[['draw','✏️'],['erase','🧽'],['pip','💉 Пипетка'],['heat','🔥'],['cool','❄️'],['hand','✋']];
function buildTools(){const el=$('tools');el.innerHTML='';TOOLS.forEach(([k,l])=>{const b=document.createElement('button');b.textContent=l;b.className=tool==k?'on':'';b.onclick=()=>{tool=k;buildTools()};el.appendChild(b)});
 const c=document.createElement('button');c.textContent='🧪 Собрать';c.onclick=()=>{$('cons').style.display='block';showTab('M')};el.appendChild(c);
 const o=document.createElement('button');o.textContent='⚙️';o.onclick=()=>{const s=$('opts').style;s.display=s.display=='flex'?'none':'flex'};el.appendChild(o)}
const pal=[],customComp=[],customAtoms=[];
function sw(id){const m=M[id];return '<span class="sw" style="background:rgb('+m.col+')"></span>'+m.s}
function pick(id){cur=id;if(tool!='draw'&&tool!='pip'){tool='draw';buildTools()}const m=M[id];$('info').textContent='Материал: '+m.n+' · атом '+Math.round(m.r)+' пм';mark()}
function mark(){document.querySelectorAll('[data-id]').forEach(b=>b.classList.toggle('on',+b.dataset.id==cur))}
function addPal(id){if(pal.includes(id))return;pal.push(id);const b=document.createElement('button');b.dataset.id=id;b.innerHTML=sw(id);b.onclick=()=>pick(id);$('pal').appendChild(b)}
const MTABS=[['ready','Готовые вещества'],['atoms','Атомы'],['myc','Свои вещества'],['mya','Свои атомы']];
let mtab='ready';
function buildMTabs(){const el=$('mtabs');el.innerHTML='';MTABS.forEach(([k,l])=>{const b=document.createElement('button');b.textContent=l;b.className=mtab==k?'on':'';b.onclick=()=>{mtab=k;buildMats()};el.appendChild(b)})}
function buildMats(){const el=$('mats');el.innerHTML='';
 if(mtab=='ready'){let g='';for(let i=1;i<M.length;i++){const m=M[i];if(['Изотопы','Сплавы'].includes(m.g)||customComp.includes(i)||customAtoms.includes(i))continue;if(m.g!=g){g=m.g;const s=document.createElement('span');s.className='g';s.textContent=g;el.appendChild(s)}
  const b=document.createElement('button');b.dataset.id=i;b.innerHTML=sw(i)+(m.n.length<9&&m.g=='Соединения'?' '+m.n:'');b.onclick=()=>pick(i);el.appendChild(b)}}
 else if(mtab=='atoms'){for(let i=1;i<M.length;i++){const m=M[i];if(m.g=='Соединения'||m.g=='Особые'||m.g=='Сплавы'||m.g=='Изотопы')continue;
  const b=document.createElement('button');b.dataset.id=i;b.innerHTML=sw(i);b.onclick=()=>pick(i);el.appendChild(b)}}
 else if(mtab=='myc'){if(!customComp.length){const s=document.createElement('span');s.className='g';s.textContent='Пока пусто — собери в 🧪';el.appendChild(s)}
  customComp.forEach(i=>{const m=M[i];const b=document.createElement('button');b.dataset.id=i;b.innerHTML=sw(i)+' '+m.n;b.onclick=()=>pick(i);el.appendChild(b)})}
 else if(mtab=='mya'){if(!customAtoms.length){const s=document.createElement('span');s.className='g';s.textContent='Пока пусто — собери в ⚛️';el.appendChild(s)}
  customAtoms.forEach(i=>{const m=M[i];const b=document.createElement('button');b.dataset.id=i;b.innerHTML=sw(i)+' '+m.n;b.onclick=()=>pick(i);el.appendChild(b)})}
 mark()}

// ====== Конструктор молекул ======
const ATOM_CAP=64;
let atoms=[],apos=null,dragI=-1;
const sub=s=>s.replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d]);
function formula(){const c={};atoms.forEach(a=>c[M[a].s]=(c[M[a].s]||0)+1);return Object.keys(c).sort().map(s=>s+(c[s]>1?c[s]:'')).join('')}
function layoutPos(){const c=atoms.reduce((a,b)=>M[b].r>M[a].r?b:a,atoms[0]),rest=atoms.slice();rest.splice(rest.indexOf(c),1);
 const pos=[[130,75,c]];rest.forEach((a,k)=>{const an=-.6+6.2832*k/Math.max(1,rest.length),rad=46+Math.floor(k/10)*34;pos.push([130+Math.cos(an)*rad,75+Math.sin(an)*rad*.8,a])});return pos}
function drawPv(){const p=$('pv').getContext('2d');p.clearRect(0,0,260,150);$('fm').textContent=atoms.length?sub(formula())+(atoms.length>12?' ('+atoms.length+' ат.)':''):'—';if(!atoms.length){apos=null;return}
 if(!apos||apos.length!==atoms.length)apos=layoutPos();
 p.strokeStyle='#888';p.lineWidth=2;apos.slice(1).forEach(q=>{p.beginPath();p.moveTo(apos[0][0],apos[0][1]);p.lineTo(q[0],q[1]);p.stroke()});
 apos.forEach(([x,y,a])=>{const m=M[a];p.fillStyle='rgb('+m.col+')';p.beginPath();p.arc(x,y,Math.max(5,6+m.r*.08),0,6.2832);p.fill();p.fillStyle='#000';p.font='10px sans-serif';p.textAlign='center';p.fillText(m.s,x,y+3)})}
function pvCell(e,cv){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*260,(e.clientY-r.top)/r.height*150]}
$('pv').addEventListener('pointerdown',e=>{if(!apos)return;const[x,y]=pvCell(e,$('pv'));dragI=apos.findIndex(p=>(p[0]-x)**2+(p[1]-y)**2<400)});
$('pv').addEventListener('pointermove',e=>{if(dragI<0||!apos)return;const[x,y]=pvCell(e,$('pv'));apos[dragI][0]=x;apos[dragI][1]=y;drawPv()});
['pointerup','pointercancel'].forEach(n=>$('pv').addEventListener(n,()=>dragI=-1));
(function(){const el=$('chips');for(let i=1;i<M.length;i++){const m=M[i];if(m.g=='Соединения'||m.g=='Особые'||m.g=='Сплавы')continue;
 const b=document.createElement('button');b.innerHTML=sw(i);b.onclick=()=>{if(atoms.length<ATOM_CAP){atoms.push(i);apos=null;drawPv()}};el.appendChild(b)}})();
$('cUndo').onclick=()=>{atoms.pop();apos=null;drawPv()};$('cX').onclick=()=>$('cons').style.display='none';
function parseFormula(str){const re=/([A-Z][a-zёа-я]?)(\d*)/g;let out=[],mm,any=false;
 while((mm=re.exec(str))){if(!mm[1])continue;any=true;const sym=mm[1],id=ID[sym]||FORM2[sym];if(!id)continue;const n=mm[2]?+mm[2]:1;for(let k=0;k<n&&out.length<ATOM_CAP;k++)out.push(id)}
 return out}
const FORM2={};Object.keys(ID).forEach(k=>FORM2[k]=ID[k]);
$('fGo').onclick=()=>{const v=$('ftxt').value.trim();if(!v)return;const r=parseFormula(v);if(!r.length){$('fm').textContent='Не узнал символы';return}atoms=r;apos=null;drawPv()};
$('cOk').onclick=()=>{if(!atoms.length)return;const k=formula(),u=[...new Set(atoms)];let id=FORM[k],isNew=false;
 if(!id){if(u.length==1)id=u[0];else{if(M.length>250)return;const n=atoms.length,A=f=>atoms.reduce((s,a)=>s+f(M[a]),0)/n;
  id=add(sub(k),sub(k)+' (своё)','Соединения',A(m=>m.rho),A(m=>m.mp),A(m=>m.bp),[0,1,2].map(c=>A(m=>m.col[c])|0),A(m=>m.r),{});FORM[k]=id;isNew=true}}
 if(isNew)customComp.push(id);
 atoms=[];apos=null;drawPv();$('cons').style.display='none';addPal(id);pick(id);buildMats()};

// ====== Редактор атома (протоны/нейтроны) ======
const PSYM=['','H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr','Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe','Cs','Ba','La','Ce','Pr','Nd','Pm','Sm','Eu','Gd','Tb','Dy','Ho','Er','Tm','Yb','Lu','Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn','Fr','Ra','Ac','Th','Pa','U','Np','Pu','Am','Cm','Bk','Cf','Es','Fm','Md','No','Lr','Rf','Db','Sg','Bh','Hs','Mt','Ds','Rg','Cn','Nh','Fl','Mc','Lv','Ts','Og'];
function hueCol(z){const h=(z*47)%360,c=(h2,s,l)=>{const k=n=>(n+h2/30)%12,f=n=>l-s*Math.min(l,1-l)*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return[255*f(0),255*f(8),255*f(4)]};return c(h,.55,.55).map(v=>v|0)}
function isoPreview(){const Z=Math.max(1,Math.min(118,+$('apz').value||1)),Nn=Math.max(0,+$('apn').value||0),A=Z+Nn,sym=PSYM[Z]||('E'+Z);
 const p=$('pvA').getContext('2d');p.clearRect(0,0,260,150);p.fillStyle='#9ad';p.font='bold 13px sans-serif';p.textAlign='center';
 const R=Math.min(55,10+A*1.1),cx=130,cy=75;p.strokeStyle='#555';p.beginPath();p.arc(cx,cy,R+10,0,6.2832);p.stroke();
 for(let i=0;i<Math.min(60,A);i++){const an=i*2.4,rr=R*Math.sqrt(i/A||0);p.fillStyle=i<Z?'#ff6b6b':'#6bb0ff';p.beginPath();p.arc(cx+Math.cos(an)*rr,cy+Math.sin(an)*rr,3.2,0,6.2832);p.fill()}
 p.fillStyle='#fff';p.fillText(sym+'-'+A,cx,cy-R-16);
 const stab=Math.abs(Nn-Z)/(Z||1),unstable=Z>82||stab>.55||A>208;
 $('afm').textContent=sym+'-'+A+' · Z='+Z+' N='+Nn+' · '+(unstable?'нестабилен, будет распадаться':'стабилен')+' · красные=протоны, синие=нейтроны';
 fillDecSel()}
function fillDecSel(){const sel=$('adec');sel.innerHTML='';for(let i=1;i<M.length;i++){if(['Соединения','Особые','Сплавы'].includes(M[i].g))continue;const o=document.createElement('option');o.value=i;o.textContent=M[i].s+' — '+M[i].n;sel.appendChild(o)}}
['apz','apn'].forEach(id=>$(id).oninput=isoPreview);
$('amanual').onchange=e=>{$('adec').disabled=!e.target.checked};
function showTab(t){$('tabM').classList.toggle('on',t=='M');$('tabA').classList.toggle('on',t=='A');$('paneM').classList.toggle('on2',t=='M');$('paneA').classList.toggle('on2',t=='A');if(t=='A')isoPreview();else drawPv()}
$('tabM').onclick=()=>showTab('M');$('tabA').onclick=()=>showTab('A');
$('aX').onclick=()=>$('cons').style.display='none';
$('aOk').onclick=()=>{const Z=Math.max(1,Math.min(118,+$('apz').value||1)),Nn=Math.max(0,+$('apn').value||0),A=Z+Nn,sym=(PSYM[Z]||('E'+Z))+'-'+A;
 if(ID[sym]){addPal(ID[sym]);pick(ID[sym]);$('cons').style.display='none';return}
 if(M.length>250)return;
 const rho=1+Z*.16,mp=200+Z*22,bp=mp+400+Z*9,r=40+Z*1.1,col=hueCol(Z),stab=Math.abs(Nn-Z)/(Z||1),unstable=Z>82||stab>.55||A>208;
 let opt={metal:Z>=11&&Z<=112&&!(Z>=5&&Z<=17),react:Z<=20?.15:0};
 if($('amanual').checked&&$('adec').value){opt.dec=+$('adec').value;opt.dp=.0015+stab*.003+.001}
 else if(unstable){const dz=Math.max(1,Z-2),dn=Math.max(0,Nn-2),dsym=(PSYM[dz]||('E'+dz))+'-'+(dz+dn);
  let did=ID[dsym];if(!did){did=add(dsym,dsym+' (изотоп)','Изотопы',1+dz*.16,200+dz*22,600+dz*22,hueCol(dz),40+dz*1.1,{metal:dz>=11&&dz<=112});ID[dsym]=did;customAtoms.push(did)}
  opt.dec=did;opt.dp=.0015+stab*.003}
 const id=add(sym,sym+' (изотоп)','Изотопы',rho,mp,bp,col,r,opt);ID[sym]=id;if(opt.dec){M[id].dec=opt.dec;M[id].dp=opt.dp}
 customAtoms.push(id);
 buildMats();addPal(id);pick(id);$('cons').style.display='none'};

buildTools();buildMTabs();buildMats();addPal(WATER);
addEventListener('resize',layout);init();mark();

// ====== Публичный API для модов (см. mods.js) ======
// Моды подключаются отдельным <script> ПОСЛЕ engine.js и mods.js и вызывают
// window.ModSystem.registerMod({...}). Движок сам сообщает им, когда готов.
const modApi = {
  // добавить новый материал; возвращает его числовой id
  addMaterial(opt) {
    const id = add(
      opt.symbol, opt.name, opt.group || 'Моды',
      opt.density, opt.meltK, opt.boilK, opt.color, opt.atomRadiusPm || 60,
      opt.rules || {}
    );
    if (opt.symbol) ID[opt.symbol] = id;
    buildMats();
    return id;
  },
  // добавить материал сразу в палитру пользователя
  addToPalette(id) { addPal(id); },
  // выбрать материал как текущий для рисования
  selectMaterial(id) { pick(id); },
  // поиск id материала по символу (например 'Fe')
  findBySymbol(sym) { return ID[sym]; },
  // прочитать данные ячейки поля по координатам сетки
  getCell(x, y) {
    if (x < 0 || y < 0 || x >= W || y >= H) return null;
    const i = y * W + x;
    return { materialId: ty[i], tempK: T[i], phase: ph[i] };
  },
  // размеры поля в клетках
  getSize() { return { width: W, height: H }; },
  // прямой доступ к массиву материалов (только для чтения — не мутируйте напрямую)
  materials: M
};
if (window.ModSystem) window.ModSystem._setApi(modApi);

function loop(){if(down&&['draw','erase','heat','cool'].includes(tool))apply(px,py);
 if(!paused){step();if(N<60000)step();if(window.ModSystem)window.ModSystem._runStep()}
 render();
 if(window.ModSystem)window.ModSystem._runRender(ctx);
 requestAnimationFrame(loop)}
loop();
