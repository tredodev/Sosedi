/* =====================================================================
   Тредо Соседи — рабочая веб-версия. Ядро.
   Один артефакт, одна база: житель (#app), кабинет ОСИ (#osi), модерация Тредо (#admin).
   ===================================================================== */
P.phone=P.phone||'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>';
P.flag='<path d="M5 21V4h11l-2 4 2 4H5"/>';
P.chats='<path d="M20 11.5a7.5 7.5 0 0 1-10.9 6.7L4 19.5l1.3-4.6A7.5 7.5 0 1 1 20 11.5z"/><path d="M8.5 11.5h.01M12.5 11.5h.01M16.5 11.5h.01" stroke-width="2.6"/>';
P.grid='<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>';
P.edit='<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>';
P.download='<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>';
P.copy='<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>';
P.logout='<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>';

/* ---------- утилиты ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rid=(n=10)=>{const a=new Uint8Array(n);crypto.getRandomValues(a);return [...a].map(x=>'abcdefghijkmnpqrstuvwxyz23456789'[x%32]).join('')};
const now=()=>Date.now();
const plural=(n,a,b,c)=>{n=Math.abs(n)%100;const m=n%10;return n>10&&n<20?c:m>1&&m<5?b:m===1?a:c};
const MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const MONN=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const MONS=['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
const WD=['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
const hm=t=>{const d=new Date(t);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
const dmy=t=>{const d=new Date(t);return d.getDate()+' '+MON[d.getMonth()]};
const wdmy=t=>{const d=new Date(t);return WD[d.getDay()]+', '+d.getDate()+' '+MON[d.getMonth()]};
function rel(t){if(!t)return'';const s=(now()-t)/1000;if(s<60)return'только что';if(s<3600){const m=Math.floor(s/60);return m+' '+plural(m,'минуту','минуты','минут')+' назад'}
  if(s<86400){const h=Math.floor(s/3600);return h+' '+plural(h,'час','часа','часов')+' назад'}if(s<172800)return'вчера, '+hm(t);return dmy(t)}
const money=n=>n==null||n===''?'':Number(n).toLocaleString('ru-RU').replace(/,/g,' ')+' ₸';
const dayKey=t=>{const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const periodKey=t=>{const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')};
const LAT={'А':'A','В':'B','Е':'E','К':'K','М':'M','Н':'H','О':'O','Р':'P','С':'C','Т':'T','Х':'X','У':'Y'};
const normPlate=s=>String(s||'').toUpperCase().split('').map(c=>LAT[c]||c).join('').replace(/[^0-9A-Z]/g,'');
async function sha(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const initials=n=>String(n||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase()||'?';
const AVC=['pe','mi','am','gr'];
const avc=id=>AVC[[...String(id||'x')].reduce((a,c)=>a+c.charCodeAt(0),0)%3];
const blob=id=>id?'/_blob/'+id:'';

/* ---------- платформа ---------- */
const C={db:null,user:null,assets:null,dl:null,sample:null,uid:null,admin:false,owner:false,write:null,ready:false,nodb:false};
/* данные */
const D={zks:[],waitlist:[],settings:{},me:null,profile:null,loaded:{},err:null,toasts:[],
  members:[],posts:[],comments:[],outages:[],masters:[],reviews:[],jobs:[],alerts:[],osireq:[],news:[],ballots:[],bookings:[],
  groupbuys:[],tasks:[],biz:[],parking:[],crowd:[],leads:[],offers:[],orders:[],fees:[],invites:[],shop:[],passes:[],events:[],msgs:[],
  votes:[],ovotes:[],acks:[]};
const ZK_COLS=['members','posts','comments','outages','masters','reviews','jobs','alerts','osireq','news','ballots','bookings','groupbuys','tasks','biz','parking','crowd','leads','offers','orders','fees','invites','shop','passes','events'];
const SUBS={};
let ZID=null;
const Z=()=>ZID;
const zk=()=>D.zks.find(z=>z.id===ZID)||null;
const col=n=>C.db.collection(`zk/${ZID}/${n}`);
const zdoc=(n,id)=>C.db.doc(`zk/${ZID}/${n}/${id}`);
const sortAt=(a,k='at')=>[...a].sort((x,y)=>(y[k]||0)-(x[k]||0));

function sub(key,ref,map){if(SUBS[key])SUBS[key]();
  const t=setTimeout(()=>{if(!D.loaded[key]){D.slow=true;R()}},10000);
  SUBS[key]=ref.onSnapshot(s=>{clearTimeout(t);D[key]=map?map(s):s.docs.map(d=>({id:d.id,...d.data()}));D.loaded[key]=true;R()},
    e=>{clearTimeout(t);D.loaded[key]=true;D.err=e.code;console.warn(key,e);R()})}
function subZk(z){if(ZID===z)return;ZID=z;ZK_COLS.concat(['msgs']).forEach(n=>{if(SUBS[n]){SUBS[n]();delete SUBS[n]}D[n]=[];D.loaded[n]=false});if(!z)return;
  ZK_COLS.forEach(n=>{let ref=C.db.collection(`zk/${z}/${n}`);
    if(['posts','comments','msgs','orders','alerts','jobs','osireq'].includes(n))ref=ref.orderBy('at','desc').limit(n==='comments'?1000:400);
    sub(n,ref)});
  sub('msgs',C.db.collection(`zk/${z}/msgs`).orderBy('at','desc').limit(600))}

/* запись с понятной ошибкой */
function errText(e){const c=e&&e.code;if(c==='invalid_argument')return'Нет прав на это действие';if(c==='quota_exceeded')return'База заполнена: удалите старые записи';
  if(c==='busy')return'Это время уже заняли';if(c==='resource_exhausted')return'Слишком часто, попробуйте через минуту';if(c==='unavailable')return'Нет связи с базой, попробуйте ещё раз';return'Не получилось сохранить'}
async function W(fn,ok){try{const r=await fn();if(ok)toast(ok);return r??true}catch(e){console.error(e);toast(errText(e),'err');return false}}
const until=(fn,ms=3000)=>new Promise(res=>{const t0=now();const tick=()=>{if(fn()||now()-t0>ms)res();else setTimeout(tick,60)};tick()});
function toast(text,kind){const id=rid(4);D.toasts=[...D.toasts.slice(-1),{id,text,kind}];R();setTimeout(()=>{D.toasts=D.toasts.filter(t=>t.id!==id);R()},2400)}

/* ---------- кто я ---------- */
const me=()=>D.members.find(m=>m.id===C.uid)||null;
const mem=id=>D.members.find(m=>m.id===id)||null;
const nameOf=id=>{const m=mem(id);return m?(m.name||'Сосед'):'Сосед'};
const multiHouse=()=>(zk()?.houses||[]).length>1;
const addrOf=m=>m?`${multiHouse()&&m.house?'дом '+m.house+', ':''}${m.entrance} подъезд`:'';
const whoOf=id=>{const m=mem(id);return m?`${m.name||'Сосед'}, ${addrOf(m)}`:'Сосед'};
const entKey=(house,ent)=>(zk()?.houses||[]).length?`${house}-${ent}`:String(ent);
const fullAddr=m=>m?`${zk()?.name||''}${m.house?', дом '+m.house:''}, ${m.entrance} подъезд, кв. ${m.apt||''}`:'';
const isOsi=()=>C.admin||(me()?.role==='osi');
const myVotes=()=>D.votes.find(v=>v.id===C.uid)||{};
const myAcks=()=>D.acks.find(v=>v.id===C.uid)||{};
const ackCount=key=>D.acks.filter(a=>a[key]!=null&&a[key]!==false).length;
const ackSum=key=>D.acks.reduce((s,a)=>s+(typeof a[key]==='number'?a[key]:0),0);
async function setAck(key,val){const ref=C.db.doc('acks/'+C.uid);const cur=myAcks();const body={...cur};delete body.id;
  if(val===null||val===false)delete body[key];else body[key]=val;return W(()=>ref.set(body))}
async function setVote(coll,key,val){const ref=C.db.doc(coll+'/'+C.uid);const cur=(coll==='votes'?myVotes():(D.ovotes.find(v=>v.id===C.uid)||{}));
  const body={...cur};delete body.id;body[key]=val;return W(()=>ref.set(body))}
async function setPref(patch){const ref=C.db.doc('data/users/'+C.uid+'/me');const cur={...(D.profile||{})};delete cur.id;
  const body={...cur,...patch};D.profile=body;return W(()=>ref.set(body))}

/* ---------- роутер ---------- */
const NAVS={stack:[{r:'home',p:{}}],sheet:null};
let F={};          // состояние формы текущего экрана
let MODE='app';    // app | osi | admin
let PENDING_INVITE=null;
const cur=()=>NAVS.stack[NAVS.stack.length-1];
function go(r,p={},opt={}){if(opt.replace)NAVS.stack.pop();if(opt.root)NAVS.stack=[];NAVS.stack.push({r,p});F=opt.keepForm?F:(opt.form||{});NAVS.sheet=null;SCROLL[r]=0;R()}
function back(){if(NAVS.sheet){NAVS.sheet=null;R();return}if(NAVS.stack.length>1){NAVS.stack.pop();F={}}else go('home',{},{root:1});R()}
const SCROLL={};

/* ---------- рендер ---------- */
let rq=false;
function R(){if(rq)return;rq=true;requestAnimationFrame(()=>{rq=false;draw()})}
function draw(){
  const ae=document.activeElement;const fk=ae&&ae.dataset?ae.dataset.f:null;let ss=null,se=null;try{ss=ae.selectionStart;se=ae.selectionEnd}catch(e){}
  const body0=document.querySelector('#app .body');const c0=cur().r;if(body0)SCROLL[c0]=body0.scrollTop;
  if(MODE==='app'){$('#root').className='app-mode';$('#app').innerHTML=appHTML()}
  else{$('#root').className='adm-mode';$('#admroot').innerHTML=MODE==='osi'?osiHTML():adminHTML()}
  $('#modes').innerHTML=modesHTML();
  const body1=document.querySelector('#app .body');if(body1&&SCROLL[cur().r])body1.scrollTop=SCROLL[cur().r];
  if(fk){const el=document.querySelector(`[data-f="${CSS.escape(fk)}"]`);if(el&&el.tagName!=='BUTTON'){el.focus();try{if(ss!=null)el.setSelectionRange(ss,se)}catch(e){}}}
  postDraw.forEach(f=>f());postDraw.length=0;
}
const postDraw=[];
function modesHTML(){const m=[['app','Житель']];if(isOsi()&&ZID)m.push(['osi','Кабинет ОСИ']);if(C.admin)m.push(['admin','Тредо']);
  return m.length<2?'':m.map(([k,l])=>`<button class="${MODE===k?'on':''}" data-act="mode" data-v="${k}">${l}</button>`).join('')}
function setMode(m){MODE=m;if(m==='app'&&D.profile?.zk&&D.profile.zk!==ZID)subZk(D.profile.zk);try{history.replaceState(null,'',m==='app'?'#app':'#'+m)}catch(e){}R()}

/* ---------- общие куски интерфейса ---------- */
const BTN=(t,k='p',a='',ic='')=>`<button class="btn ${k}" ${a}>${ic?I(ic,18):''}<span>${t}</span></button>`;
const GO=(r,p={})=>`data-go="${r}"${p.id!=null?` data-id="${esc(p.id)}"`:''}${p.v!=null?` data-v="${esc(p.v)}"`:''}`;
const ACT=(a,p={})=>`data-act="${a}"`+Object.entries(p).map(([k,v])=>` data-${k}="${esc(v)}"`).join('');
const NAVB=(t='',o={})=>`<div class="nav ${o.l?'l':''}">${o.noback?'<span></span>':`<button class="nb" data-act="back" aria-label="${o.x?'Закрыть':'Назад'}">${I(o.x?'close':'back',22)}</button>`}<div class="nt">${t}</div><div class="nr">${o.r||''}</div></div>`;
const TABB=a=>{const T=[['home','Главная','home'],['plusc','Создать','create'],['chats','Сообщения','chats'],['user','Аккаунт','me']];
  const un=unreadTotal();return `<nav class="tabbar">${T.map(([ic,l,g],i)=>`<button class="${i===a?'on':''}" data-act="tab" data-v="${g}" aria-label="${l}" style="position:relative">${I(ic,26,1.7)}${g==='chats'&&un?`<i class="dotr" style="top:-2px;right:calc(50% - 16px)"></i>`:''}<span>${l}</span></button>`).join('')}</nav>`};
const SCRN=o=>`<div class="scr ${o.cls||''}">${o.nav||''}<div class="body ${o.bcls||''}">${o.body}</div>${o.foot?`<div class="foot">${o.foot}</div>`:''}${o.tab!==undefined?TABB(o.tab):''}</div>`;
const FIN=(f,ph='',o={})=>`<input class="inp ${o.cls||''}" data-f="${f}" value="${esc(F[f]??o.v??'')}" placeholder="${esc(ph)}" ${o.type?`type="${o.type}"`:''} ${o.mode?`inputmode="${o.mode}"`:''} ${o.max?`maxlength="${o.max}"`:''} ${o.live?'data-live="1"':''} autocomplete="off">`;
const FTA=(f,ph='',o={})=>`<textarea class="inp" data-f="${f}" placeholder="${esc(ph)}" ${o.max?`maxlength="${o.max}"`:''} ${o.live?'data-live="1"':''}>${esc(F[f]??o.v??'')}</textarea>`;
const FSEL=(f,opts,o={})=>`<select class="inp" data-f="${f}" data-live="1">${opts.map(([v,l])=>`<option value="${esc(v)}" ${String(F[f]??o.v??'')===String(v)?'selected':''}>${esc(l)}</option>`).join('')}</select>`;
const PICK=(f,opts,o={})=>`<div class="chips${o.scroll?' scroll':''}">${opts.map(([v,l])=>{const on=o.multi?(F[f]||[]).includes(v):String(F[f]??o.def)===String(v);
  return `<button class="chip${on?' on':''}" ${ACT(o.multi?'tog':'pick',{f,v})} aria-pressed="${on}">${esc(l)}</button>`}).join('')}</div>`;
const SEGF=(f,opts,o={})=>`<div class="seg ${o.c||''}">${opts.map(([v,l])=>{const on=String(F[f]??o.def)===String(v);return `<button class="${on?'on':''}" ${ACT('pick',{f,v})}>${esc(l)}</button>`}).join('')}</div>`;
const CHK=(on,a)=>`<button class="chk${on?' on':''}" role="checkbox" aria-checked="${!!on}" ${a}>${I('check',14,2.6)}</button>`;
const POLLO=(t,p,on,a='')=>`<button class="pollo${on?' on':''}" ${a}><i style="width:${p}%"></i><span>${esc(t)}</span><b>${p}%</b></button>`;
const IMG=(id,h,cls='',st='')=>id?`<div class="img ${cls}" style="height:${h}px;background-image:url('${blob(id)}');${st}"></div>`:'';
const EMPTY=(ic,t,s='',a='')=>`<div class="empty"><span class="tile f" style="width:56px;height:56px;border-radius:50%">${I(ic,24)}</span><div class="h3" style="color:var(--text)">${t}</div>${s?`<p class="s mt2">${s}</p>`:''}${a?`<div class="mt">${a}</div>`:''}</div>`;
const AVM=(id,s=36)=>AV(esc(initials(nameOf(id))),avc(id),s);

/* QR из библиотеки qrcode-generator */
function QRSVG(text,cell=4){if(typeof qrcode!=='function')return `<div class="note-box">QR недоступен: ${esc(text)}</div>`;
  const q=qrcode(0,'M');q.addData(text);q.make();return q.createSvgTag({cellSize:cell,margin:2,scalable:true})}
const appUrl=h=>{const base=location.href.split('#')[0];return base+'#'+h};

/* загрузка фото */
async function pickPhotos(max=6){if(!C.assets){toast('Загрузка фото доступна редакторам и участникам с правом записи','err');return[]}
  return new Promise(res=>{const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.multiple=true;
    inp.onchange=async()=>{const files=[...inp.files].slice(0,max);const ids=[];toast('Загружаем фото…');
      for(const f of files){try{const b=await shrink(f);const r=await C.assets.upload(b,{type:'image/jpeg'});ids.push(r.id)}catch(e){console.error(e);toast('Фото не загрузилось','err')}}
      res(ids)};inp.click()})}
async function shrink(file,max=1400){const bmp=await createImageBitmap(file);const k=Math.min(1,max/Math.max(bmp.width,bmp.height));
  const c=document.createElement('canvas');c.width=Math.round(bmp.width*k);c.height=Math.round(bmp.height*k);c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);
  return new Promise(r=>c.toBlob(r,'image/jpeg',.85))}

async function share(text,url){try{if(navigator.share){await navigator.share({text,url});return}}catch(e){if(e.name==='AbortError')return}
  try{await navigator.clipboard.writeText(text+'\n'+url);toast('Ссылка скопирована')}catch(e){toast('Скопируйте ссылку вручную: '+url)}}
async function saveFile(name,text){if(!C.dl){toast('Скачивание недоступно в этом просмотре','err');return}
  try{await C.dl.save({filename:name,data:text})}catch(e){if(e.code!=='declined')toast('Файл не сохранён','err')}}

