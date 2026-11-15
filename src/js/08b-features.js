
/* =====================================================================
   Улучшения по дорожной карте: чек-лист первого дня, «Меня затапливает»,
   настройки уведомлений и тихие часы, очередь «Хочу забрать» с бронью,
   справочник дома, объявление по фото
   ===================================================================== */

/* ---------- Настройки уведомлений и тихие часы ---------- */
const NTF_DEF={outages:true,car:true,flood:true,answers:true,osi:true,jobs:true,flea:'free',chat:'all',quiet:false,qFrom:'22:00',qTo:'08:00'};
const ntf=()=>({...NTF_DEF,...(D.profile?.ntf||{})});
const hmToMin=s=>{const [h,m]=String(s||'0:0').split(':').map(Number);return (h||0)*60+(m||0)};
function inQuiet(t=now()){const n=ntf();if(!n.quiet)return false;const d=new Date(t);const x=d.getHours()*60+d.getMinutes();const a=hmToMin(n.qFrom),b=hmToMin(n.qTo);return a<=b?(x>=a&&x<b):(x>=a||x<b)}
const TOPIC={dropoff:'outages',car:'car',drop:'flood',chat:'answers',flag:'osi',building:'osi',wrench:'jobs',check:'osi',userplus:'answers',bag:'flea',gift:'flea'};
const URGENT=new Set(['car','flood']);
const _notifsBase=notifs;
notifs=function(){const m=me();if(!m)return[];const n=ntf();const seen=D.profile?.nseen||0;const out=_notifsBase().map(x=>({...x}));
  (D.floods||[]).filter(f=>(f.to||[]).includes(C.uid)&&now()-f.at<86400000).forEach(f=>out.push({at:f.at,ic:'drop',c:'wa',t:`<b>Соседа снизу затапливает.</b> Кв. ${esc(f.apt)}, ${esc(f.floor)} этаж: проверьте у себя`,s:FLST[f.replies?.[C.uid]?.s]||'Ответьте соседу',go:['flood-in',f.id],topic:'flood'}));
  (D.floods||[]).filter(f=>f.from===C.uid&&Object.keys(f.replies||{}).length).forEach(f=>{const last=Object.values(f.replies).sort((a,b)=>b.at-a.at)[0];out.push({at:last.at,ic:'drop',c:'f',t:`<b>Сосед сверху:</b> ${esc(FLST[last.s]||'')}`,s:'Протечка',go:['flood-view',f.id],topic:'flood'})});
  D.posts.filter(p=>p.author===C.uid).forEach(p=>{(D.claims||[]).filter(c=>c.post===p.id&&c.status==='active').forEach(c=>out.push({at:c.at,ic:'gift',c:'m',t:`<b>${esc(whoOf(c.by))}</b> хочет забрать «${esc(p.title)}»`,s:'Очередь',go:['post',p.id],topic:'flea'}))});
  (D.claims||[]).filter(c=>c.by===C.uid&&c.status==='active').forEach(c=>{const p=D.posts.find(x=>x.id===c.post);if(!p)return;const st=claimState(p);if(st.holder?.id===c.id)out.push({at:st.start,ic:'gift',c:'m',t:`<b>«${esc(p.title)}» забронировано за вами</b> до ${hm(st.end)}`,s:'Барахолка',go:['post',p.id],topic:'flea_mine'})});
  return out.filter(x=>{const tp=x.topic||TOPIC[x.ic]||'answers';if(tp==='flea_mine')return true;if(tp==='flea'){if(n.flea==='off')return false;if(n.flea==='free'&&x.ic==='bag'&&!/даром/i.test(x.s||''))return false;return true}return n[tp]!==false})
    .sort((a,b)=>b.at-a.at).map(x=>({...x,un:x.at>seen&&(!inQuiet()||URGENT.has(x.topic||TOPIC[x.ic]))}))};
S['notif-settings']=()=>{const n=ntf();const T=(k,l,sub,lock)=>`<div class="sel-row"><span><span style="display:block">${l}</span>${sub?`<span class="xs mut">${sub}</span>`:''}</span>${lock?'<span class="xs mut">всегда</span>':CHK(n[k],ACT('ntf',{k}))}</div>`;
  return SCRN({nav:NAVB('Уведомления'),body:`<p class="sub">Выберите, о чём сообщать. Срочное приходит всегда, остальное можно приглушить.</p>
  ${LB('Срочное')}${T('car','«Кто перекрыл авто»','Ваша машина мешает или сосед ответил',1)}${T('flood','Протечки','Соседа снизу затапливает или сосед сверху ответил',1)}${T('outages','Отключения воды и света','За день и в день отключения')}
  ${LB('Дом и соседи')}${T('answers','Ответы на мои вопросы и объявления','')}${T('osi','Объявления и заявки ОСИ','')}${T('jobs','Заявки мастерам','')}
  ${LB('Барахолка')}${SEGF('flea',[['all','Всё новое'],['free','Только даром'],['off','Не сообщать']],{def:n.flea})}<p class="xs mut mt2">Ответы на ваши объявления и бронь вещи за вами приходят всегда.</p>
  ${LB('Чат подъезда')}${SEGF('chat',[['all','Каждое сообщение'],['off','Без значка']],{def:n.chat})}
  ${LB('Тихие часы')}<div class="sel-row"><span><span style="display:block">Не беспокоить</span><span class="xs mut">Срочное про машину и протечки придёт и ночью</span></span>${CHK(n.quiet,ACT('ntf',{k:'quiet'}))}</div>
  ${n.quiet?`<div class="two mt2"><div>${LB('С')}<input class="inp" type="time" data-f="qFrom" value="${esc(F.qFrom??n.qFrom)}"></div><div>${LB('До')}<input class="inp" type="time" data-f="qTo" value="${esc(F.qTo??n.qTo)}"></div></div>`:''}
  <div class="note-box mt3">Сейчас уведомления видны в колокольчике и значках приложения. Эти же настройки будут управлять пушами и сообщениями в Telegram, когда мы их подключим.</div>`,
  foot:BTN('Сохранить','p',ACT('ntfsave'))})};
A.ntf=async el=>{const k=el.dataset.k;const n=ntf();await setPref({ntf:{...(D.profile?.ntf||{}),[k]:!n[k]}})};
A.ntfsave=async()=>{const n=ntf();const body={...(D.profile?.ntf||{}),flea:F.flea??n.flea,chat:F.chat??n.chat};if(F.qFrom)body.qFrom=F.qFrom;if(F.qTo)body.qTo=F.qTo;await setPref({ntf:body});toast('Сохранено');back()};

/* ---------- Чек-лист первого дня ---------- */
function checklist(){const m=me();if(!m||!m.verified)return null;
  const steps=[['car','Добавьте номер машины','Сосед найдёт вас, если вы перекрыли выезд',(m.plates||[]).length>0,'settings'],
    ['hello','Скажите «привет» в чате подъезда','Там узнают об отключениях и находках первыми',D.msgs.some(x=>x.chat==='e'+m.entrance&&x.from===C.uid),'chat','e'+m.entrance],
    ['post','Задайте вопрос или отдайте вещь','Соседи отвечают быстрее, чем в общем чате',D.posts.some(p=>p.author===C.uid),'create'],
    ['ntf','Настройте уведомления','Срочное всегда, остальное как удобно',!!D.profile?.ntf,'notif-settings']];
  return{steps,done:steps.filter(s=>s[3]).length}}
function homeExtras(){const m=me();let h='';
  (D.floods||[]).filter(f=>(f.to||[]).includes(C.uid)&&!['fixed','closed'].includes(f.status)&&!f.replies?.[C.uid]&&now()-f.at<21600000).forEach(f=>{
    h+=`<button class="banner" ${GO('flood-in',{id:f.id})} style="background:var(--danger-soft);margin-bottom:8px;color:var(--danger)">${I('drop',20)}<span class="grow"><b class="s" style="display:block">Соседа снизу затапливает</b><span class="xs">Кв. ${esc(f.apt)}, ${esc(f.floor)} этаж, ${rel(f.at)}. Проверьте у себя</span></span>${I('fwd',18)}</button>`});
  const cl=checklist();if(cl&&cl.done<cl.steps.length&&!D.profile?.checklistHidden){
    h+=`<div class="card m" style="margin-bottom:10px"><div class="flex between"><b class="s">${cl.done?'Ещё '+(cl.steps.length-cl.done)+' '+plural(cl.steps.length-cl.done,'шаг','шага','шагов'):'4 шага'} к своему дому</b><button class="xs mut" ${ACT('hidechecklist')}>Скрыть</button></div><div class="mt2">${PR(cl.done/cl.steps.length*100)}</div>
    ${cl.steps.map(([k,t,sub,ok,r,id])=>`<button class="flex top-a wfull mt" style="text-align:left" ${ok?'disabled':GO(r,{id})}><span class="chk${ok?' on':''}" aria-hidden="true">${I('check',14,2.6)}</span><span class="grow"><span class="s ${ok?'mut':'b'}" style="display:block;${ok?'text-decoration:line-through':''}">${t}</span>${ok?'':`<span class="xs mut">${sub}</span>`}</span>${ok?'':I('fwd',16)}</button>`).join('')}</div>`}
  return h}
A.hidechecklist=async(el,e)=>{e.stopPropagation();await setPref({checklistHidden:true})};

/* ---------- Меня затапливает ---------- */
const FLST={checking:'Проверяю',dry:'У меня сухо',found:'Нашёл причину, перекрыл воду',away:'Меня нет дома'};
const floodTargets=m=>D.members.filter(x=>x.id!==m.id&&x.verified&&Number(x.floor)===Number(m.floor)+1&&x.entrance===m.entrance&&String(x.house||'')===String(m.house||''));
S['flood']=()=>{const m=me();const hasFloor=Number(m.floor)>0;const tg=hasFloor?floodTargets(m):[];const mine=sortAt((D.floods||[]).filter(f=>f.from===C.uid)).slice(0,3);
  return SCRN({nav:NAVB(),body:`<h1 class="h1">Меня затапливает</h1><p class="sub">Напишем соседям этажом выше в вашем подъезде. Ваш телефон они не увидят.</p>
  ${!hasFloor?`${LB('Ваш этаж')}${FIN('floor','5',{mode:'numeric',max:3})}<p class="xs mut mt2">Сохраним в профиле, чтобы в следующий раз не спрашивать.</p>`
   :`<div class="card f mt flex">${TL('drop','wa',36)}<span class="grow"><b class="s" style="display:block">Кв. ${esc(m.apt)}, ${m.floor} этаж, ${m.entrance} подъезд</b><span class="xs mut">${tg.length?`На ${Number(m.floor)+1} этаже в приложении: ${tg.length} ${plural(tg.length,'сосед','соседа','соседей')}`:`На ${Number(m.floor)+1} этаже пока никого нет в приложении`}</span></span></div>`}
  ${LB('Где течёт')}${PICK('where',[['С потолка','С потолка'],['По стене','По стене'],['Из вентиляции','Из вентиляции'],['У стояка','У стояка']],{def:'С потолка'})}
  ${LB('В какой комнате')}${PICK('room',[['Ванная','Ванная'],['Кухня','Кухня'],['Туалет','Туалет'],['Комната','Комната'],['Коридор','Коридор']],{def:'Ванная'})}
  ${hasFloor&&!tg.length?`<div class="card wa mt3"><p class="s"><b>Соседа сверху нет в приложении.</b> Отправим заявку в ОСИ и подготовим записку с QR на его дверь.</p></div>`:''}
  ${mine.length?`${LB('Ваши обращения')}${mine.map(f=>`<button class="sel-row" ${GO('flood-view',{id:f.id})}><span>${esc(f.where)}, ${esc(f.room)} <span class="xs mut">${rel(f.at)}</span></span><span class="xs mut">${Object.keys(f.replies||{}).length} ${plural(Object.keys(f.replies||{}).length,'ответ','ответа','ответов')}</span></button>`).join('')}`:''}`,
  foot:BTN(hasFloor&&!tg.length?'Сообщить в ОСИ и сделать записку':'Написать соседям сверху','p',ACT('sendflood'))})};
S['flood-view']=p=>{const f=(D.floods||[]).find(x=>x.id===p.id);if(!f)return SCRN({nav:NAVB(),body:''});const reps=Object.entries(f.replies||{});
  return SCRN({nav:NAVB('Протечка'),body:`${BD(f.status==='fixed'?'Решено':'Ждём ответа','wa')}
  <h1 class="h1 mt2">${esc(f.where)}, ${esc(f.room.toLowerCase())}</h1><p class="sub">Отправлено ${(f.to||[]).length} ${plural((f.to||[]).length,'соседу','соседям','соседям')} на ${Number(f.floor)+1} этаже, ${rel(f.at)}.</p>
  <div class="card f mt">${(f.to||[]).map(uid=>{const r=f.replies?.[uid];return `<div class="flex between s mt2"><span class="flex">${AVM(uid,26)}${esc(nameOf(uid))}, кв. скрыта</span><span class="xs ${r?(r.s==='found'?'g b':'b'):'mut'}">${r?FLST[r.s]:'не ответил'}</span></div>`}).join('')||'<p class="s mut">Соседей сверху нет в приложении.</p>'}</div>
  ${reps.some(([,r])=>r.s==='dry')&&!reps.some(([,r])=>r.s==='found')?`<div class="card wa mt"><p class="s">Сверху сухо. Возможно, течёт стояк или крыша: это зона ОСИ.</p><div class="mt">${BTN('Сообщить в ОСИ','wm sm',GO('osi-new',{v:'Протечка'}))}</div></div>`:''}`,
  foot:(f.status!=='fixed'?BTN('Протечка прекратилась','p',ACT('floodfixed',{id:f.id})):'')+BTN('Записка с QR на дверь соседа','o',GO('flood-note'))})};
S['flood-in']=p=>{const f=(D.floods||[]).find(x=>x.id===p.id);if(!f)return SCRN({nav:NAVB(),body:''});const my=f.replies?.[C.uid];
  return SCRN({nav:NAVB(),body:`${BD(f.status==='fixed'?'Решено':'Срочно','wa')}
  <h1 class="h1 mt2">Соседа снизу затапливает</h1><p class="sub">Кв. ${esc(f.apt)}, ${esc(f.floor)} этаж: ${esc(f.where.toLowerCase())}, ${esc(f.room.toLowerCase())}. ${rel(f.at)}.</p>
  <div class="note-box mt">Проверьте ${esc(f.room.toLowerCase())}: стиральную и посудомоечную машину, сифоны, шланги под раковиной, тёплый пол. Если не можете найти причину, перекройте воду на вводе в квартиру.</div>
  ${LB('Ответить соседу')}<div class="chips">${Object.entries(FLST).map(([k,t])=>`<button class="chip${my?.s===k?' on':''}" ${ACT('floodreply',{id:f.id,v:k})}>${t}</button>`).join('')}</div>
  ${my?`<p class="xs g b mt">Сосед видит ваш ответ: «${esc(FLST[my.s])}»</p>`:''}`,
  foot:BTN('Написать соседу','o',ACT('dm',{id:f.from}))})};
S['flood-note']=()=>{if(!F.inv){F.inv='pending';postDraw.push(async()=>{const code=rid(8);const ok=await W(()=>zdoc('invites',code).set({from:C.uid,at:now(),usedBy:null,ctx:'flood'}));F.inv=ok?code:null;R()})}
  const url=F.inv&&F.inv!=='pending'?appUrl('invite-'+ZID+'-'+F.inv):'';const m=me();
  return SCRN({nav:NAVB(),body:`<h1 class="h1">Записка на дверь</h1><p class="sub">Распечатайте или покажите с экрана соседу сверху.</p>
  <div class="card center mt" style="box-shadow:var(--shadow);border:0"><div class="h3">Соседи, у нас течёт с потолка</div><p class="s mt2">Кв. ${esc(m.apt)}, этажом ниже. Проверьте, пожалуйста, ванную и кухню.</p>
  <div class="mt">${url?`<div class="qrwrap" style="width:170px">${QRSVG(url)}</div>`:'<div class="spin"></div>'}</div><p class="xs mut mt2">Отсканируйте, чтобы ответить соседу в приложении Соседи</p></div>`,
  foot:`<div class="two">${BTN('Скачать для печати','o',ACT('printflood',{url}))}${BTN('Отправить ссылку','p',ACT('shareurl',{url,t:'Соседи, у нас течёт с потолка (кв. '+m.apt+'). Проверьте, пожалуйста, у себя и ответьте в приложении:'}))}</div>`})};
A.sendflood=async()=>{if(!needVerified())return;let m=me();if(!(Number(m.floor)>0)){const fl=num('floor');if(!fl){toast('Укажите этаж');return}await W(()=>zdoc('members',C.uid).update({floor:fl}));await until(()=>Number(me()?.floor)>0);m=me()}
  const tg=floodTargets(m);const where=F.where||'С потолка',room=F.room||'Ванная';
  const ref=await W(()=>col('floods').add({from:C.uid,apt:m.apt,floor:m.floor,entrance:m.entrance,house:m.house||'',where,room,to:tg.map(x=>x.id),replies:{},status:'sent',at:now()}),tg.length?'Соседи сверху получили сообщение':null);if(!ref)return;
  if(!tg.length){const nums=D.osireq.map(r=>Number(r.num)||0);const n=String((nums.length?Math.max(...nums):400)+1).padStart(4,'0');
    await W(()=>col('osireq').add({num:n,cat:'Протечка',title:`${where}, ${room.toLowerCase()}, кв. ${m.apt}, ${m.floor} этаж`,where:'Моя квартира',text:'Соседа сверху нет в приложении.',photos:[],by:C.uid,house:m.house||'',entrance:m.entrance,apt:m.apt,joiners:[],status:'new',timeline:[],at:now()}),'Заявка отправлена в ОСИ');
    go('flood-note',{},{replace:1});return}
  go('flood-view',{id:ref.id},{replace:1})};
A.floodreply=async el=>{const f=(D.floods||[]).find(x=>x.id===el.dataset.id);const k=el.dataset.v;
  await W(()=>zdoc('floods',f.id).update({replies:{...(f.replies||{}),[C.uid]:{s:k,at:now()}},status:k==='found'?'found':f.status}),'Сосед увидит ответ')};
A.floodfixed=async el=>{await W(()=>zdoc('floods',el.dataset.id).update({status:'fixed',fixedAt:now()}),'Отметили, что протечка прекратилась')};
A.printflood=el=>{const m=me();saveFile('zapiska-protechka.html',`<!doctype html><html lang="ru"><meta charset="utf-8"><title>Записка</title><body style="font-family:sans-serif;text-align:center;padding:40px"><h1>Соседи, у нас течёт с потолка</h1><p style="font-size:20px">Кв. ${esc(m.apt)}, этажом ниже. Проверьте, пожалуйста, ванную и кухню: стиральную машину, сифоны, шланги.</p><div style="width:260px;margin:20px auto">${QRSVG(el.dataset.url,6)}</div><p>Отсканируйте камерой телефона, чтобы ответить соседу.<br>Приложение Соседи, ${esc(zk()?.name)}</p></body></html>`)};

/* ---------- Очередь «Хочу забрать» с бронью на 2 часа ---------- */
const HOLD=2*3600000;
const CLAIMABLE=['giveaway','sell','rent'];
function claimState(p){const cs=(D.claims||[]).filter(c=>c.post===p.id).sort((a,b)=>a.at-b.at);let t=0,holder=null,start=0,end=0;const waiting=[];
  for(const c of cs){if(c.status==='noshow'||c.status==='cancelled'){if(c.status==='noshow')t=Math.max(t,c.updAt||0);continue}
    if(c.status==='taken'){return{holder:c,start:c.at,end:c.updAt,taken:true,waiting:[],all:cs}}
    if(holder){waiting.push(c);continue}const s=Math.max(c.at,t);if(now()>s+HOLD){t=s+HOLD;continue}holder=c;start=s;end=s+HOLD}
  return{holder,start,end,taken:false,waiting,all:cs}}
function claimBlock(x){if(!CLAIMABLE.includes(x.kind)||x.status==='deleted')return'';const st=claimState(x);const mine=x.author===C.uid;
  const myClaim=(D.claims||[]).find(c=>c.post===x.id&&c.by===C.uid&&c.status==='active');const pos=myClaim?(st.holder?.id===myClaim.id?0:st.waiting.findIndex(c=>c.id===myClaim.id)+1):-1;
  const verb=x.kind==='giveaway'?'забрать':x.kind==='rent'?'взять':'купить';
  if(mine){if(st.taken)return `<div class="card m mt"><b class="s">Отдано: ${esc(nameOf(st.holder.by))}</b></div>`;
    return `<div class="card mt"><div class="b s">Очередь «Хочу ${verb}»</div>${st.holder?`<div class="flex between mt2"><span class="flex">${AVM(st.holder.by,30)}<span><b class="s" style="display:block">${esc(whoOf(st.holder.by))}</b><span class="xs mut">Бронь до ${hm(st.end)}</span></span></span></div>
    <div class="actions mt2"><button class="btn p sm2" ${ACT('claimtaken',{id:st.holder.id,post:x.id})}>Забрали</button><button class="btn s2 sm2" ${ACT('claimnoshow',{id:st.holder.id})}>Не пришёл, следующий</button><button class="btn s2 sm2" ${ACT('dm',{id:st.holder.by})}>Написать</button></div>`:`<p class="s mut mt2">Пока никто не встал в очередь.</p>`}
    ${st.waiting.length?`<p class="xs mut mt2">Дальше в очереди: ${st.waiting.map(c=>esc(nameOf(c.by))).join(', ')}</p>`:''}</div>`}
  if(st.taken)return `<div class="card f mt"><b class="s">Уже ${x.kind==='giveaway'?'забрали':'договорились'}</b></div>`;
  if(myClaim)return `<div class="card ${pos===0?'m':'f'} mt"><b class="s">${pos===0?`Забронировано за вами до ${hm(st.end)}`:`Вы ${pos+1}-й в очереди`}</b><p class="xs mut mt2">${pos===0?'Напишите автору и договоритесь, когда зайти. Если не успеете, бронь перейдёт следующему.':'Если те, кто впереди, не заберут, бронь перейдёт к вам, и мы сообщим.'}</p><div class="actions mt2">${pos===0?`<button class="btn p sm2" ${ACT('dm',{id:x.author})}>Написать автору</button>`:''}<button class="btn s2 sm2" ${ACT('unclaim',{id:myClaim.id})}>Выйти из очереди</button></div></div>`;
  return `<div class="mt">${BTN(st.holder?`Встать в очередь (${st.waiting.length+1} ${plural(st.waiting.length+1,'человек','человека','человек')} впереди)`:`Хочу ${verb}`,'ac',ACT('claim',{id:x.id}),'gift')}${st.holder?'':`<p class="xs mut mt2 center">Вещь забронируется за вами на 2 часа</p>`}</div>`}
A.claim=async el=>{if(!needVerified())return;const p=D.posts.find(x=>x.id===el.dataset.id);if((D.claims||[]).some(c=>c.post===p.id&&c.by===C.uid&&c.status==='active'))return;
  await W(()=>col('claims').add({post:p.id,by:C.uid,status:'active',at:now()}),claimState(p).holder?'Вы в очереди':'Забронировано за вами на 2 часа')};
A.unclaim=async el=>{await W(()=>zdoc('claims',el.dataset.id).update({status:'cancelled',updAt:now()}),'Вы вышли из очереди')};
A.claimnoshow=async el=>{await W(()=>zdoc('claims',el.dataset.id).update({status:'noshow',updAt:now()}),'Бронь перешла следующему')};
A.claimtaken=async el=>{await W(async()=>{await zdoc('claims',el.dataset.id).update({status:'taken',updAt:now()});await zdoc('posts',el.dataset.post).update({status:'given',closedAt:now()})},'Готово, объявление закрыто')};

/* ---------- Справочник дома ---------- */
S['directory']=()=>{const d=zk()?.directory||[];return SCRN({nav:NAVB('Справочник дома'),body:d.length?`<p class="sub">Телефоны, которые нужны в важный момент. Заполняет ОСИ.</p>${d.map(x=>`<div class="sel-row"><span><b style="font-weight:500;display:block">${esc(x.t)}</b>${x.note?`<span class="xs mut">${esc(x.note)}</span>`:''}</span>${x.phone?`<a class="btn p sm2" href="tel:${esc(String(x.phone).replace(/[^+\d]/g,''))}">${I('phone',14)}${esc(x.phone)}</a>`:''}</div>`).join('')}`
  :EMPTY('phone','Справочник пока пуст','Председатель ОСИ добавит аварийную службу, лифтёров, УК и график вывоза мусора.')})};
OS.directory=()=>{const d=zk().directory||[];if(F.init!==7){F.init=7;F.dir=d.map(x=>[x.t,x.phone,x.note].filter((v,i)=>i<2||v).join(' | ')).join('\n')}
  return `<h1>Справочник дома</h1><p class="sub">Жители видят его в разделе «Справочник дома». По строке на контакт: название | телефон | примечание.</p>
  <div class="panel"><div class="frm">${FTA('dir','Аварийная служба ОСИ | +7 700 000 00 00 | круглосуточно\nЛифтовая служба | +7 727 000 00 00\nВывоз мусора | | пн, ср, пт до 9:00',{max:4000})}<div class="actions"><button class="btn p" ${ACT('savedir')}>Сохранить</button></div></div></div>`};
A.savedir=async()=>{const directory=String(F.dir||'').split('\n').map(l=>l.split('|').map(s=>s.trim())).filter(x=>x[0]).map(([t,phone,note])=>({t,phone:phone||'',note:note||''}));await W(()=>C.db.doc('zk/'+ZID).update({directory}),'Справочник сохранён')};

/* ---------- Объявление по фото ---------- */
async function photoAI(){if(C._imgAI!==undefined)return C._imgAI;try{const l=await C.sample?.limits?.();C._imgAI=!!l?.images}catch(e){C._imgAI=false}return C._imgAI}
function aiFillBtn(k){if(!FLEA.includes(k))return'';const ids=(F.photos||[]).filter(id=>BLOBS[id]);if(!ids.length)return'';
  if(C._imgAI===undefined){postDraw.push(()=>photoAI().then(()=>R()));return''}if(!C._imgAI)return'';
  return `<button class="card m flex mt2 wfull" ${ACT('aifill',{k})} style="text-align:left" ${F.aiBusy?'disabled':''}>${I('spark',18)}<span class="grow"><b class="s" style="display:block">${F.aiBusy?'Смотрим на фото…':'Заполнить по фото'}</b><span class="xs mut">Claude предложит заголовок, описание${k==='sell'||k==='rent'?' и цену':''}. Всё можно поправить</span></span></button>`}
A.aifill=async el=>{const k=el.dataset.k;const blobs=(F.photos||[]).map(id=>BLOBS[id]).filter(Boolean).slice(0,3);if(!blobs.length)return;F.aiBusy=true;R();
  const ask=k==='sell'?'цену в тенге (число), какую реально получить на вторичном рынке в Казахстане':k==='rent'?'цену аренды в тенге за день (число)':'price: null';
  try{const r=await C.sample(`Это фото вещи, которую житель многоквартирного дома хочет ${KINDS[k][0].toLowerCase()} соседям. Ответь только JSON без пояснений: {"title":"короткое название вещи по-русски, до 60 символов","text":"1–2 предложения: что это и в каком состоянии по фото, без выдумок","price":${k==='sell'||k==='rent'?'число':'null'}}. Для price укажи ${ask}. Если на фото не видно вещи, верни {"title":"","text":"","price":null}.`,{images:blobs,modelTier:'quick'});
    const j=JSON.parse(String(r.text).replace(/```json|```/g,'').trim());if(!j.title){toast('По фото не удалось понять, что это')}else{F.title=String(j.title).slice(0,90);F.text=String(j.text||'').slice(0,900);if((k==='sell'||k==='rent')&&j.price)F.price=String(Math.round(Number(j.price)))}}
  catch(e){toast(e.code==='not_granted'?'Доступ к Claude не разрешён':'Не получилось распознать фото','err')}F.aiBusy=false;R()};
