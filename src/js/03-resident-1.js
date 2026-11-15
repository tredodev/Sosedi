/* =====================================================================
   Приложение жителя, часть 1
   ===================================================================== */
const S={};       // экраны жителя
const SHEETS={};  // нижние шторки
const KINDS={giveaway:['Отдам даром','gift'],sell:['Продам','tag'],wanted:['Ищу','search'],rent:['Сдам в аренду','refresh'],question:['Вопрос соседям','ask'],lost:['Потерял, нашёл','search'],poll:['Опрос','chart'],car:['Чья машина?','car']};
const FLEA=['giveaway','sell','wanted','rent'];
const loadingScr=(t,spin)=>`<div class="loading"><div>${spin?'<div class="spin"></div>':''}${esc(t)}</div></div>`;

function appHTML(){
  if(C.nodb)return loadingScr('Откройте приложение в claude.ai и войдите: без входа база данных недоступна.');
  if(!C.ready||!D.loaded.zks||!D.loaded.profile)return loadingScr(D.slow?'База отвечает медленно. Проверьте соединение.':'Загружаем Соседей…',!D.slow);
  let r=cur().r;const p=cur().p;
  const prof=D.profile||{};const z=zk();
  if(!prof.zk||!z){if(!['ob-city','ob-zk','ob-wait','ob-waitdone'].includes(r)){NAVS.stack=[{r:'ob-city',p:{}}];r='ob-city'}}
  else if(z.status!=='active'){if(!['zk-closed','ob-city','ob-zk','ob-wait','ob-waitdone'].includes(r)){NAVS.stack=[{r:'zk-closed',p:{}}];r='zk-closed'}}
  else if(!D.loaded.members)return loadingScr('Загружаем ваш ЖК…',1);
  else if(!me()){if(!['ob-addr','ob-city','ob-zk','ob-wait','ob-waitdone'].includes(r)){NAVS.stack=[{r:'ob-addr',p:{}}];r='ob-addr'}}
  else if(me().banned){return SCRN({body:EMPTY('alert','Доступ ограничен','Модератор Тредо ограничил ваш аккаунт в этом ЖК. Напишите в поддержку, если это ошибка.')})}
  const fn=S[r]||S.home;let html='';
  try{html=fn(p)}catch(e){console.error(e);html=SCRN({nav:NAVB('Ошибка'),body:EMPTY('alert','Экран не открылся','Вернитесь назад и попробуйте ещё раз.')})}
  const sh=NAVS.sheet&&SHEETS[NAVS.sheet.k]?`<div class="sheetbg" data-act="sheetbg"><div class="sheet2" data-stop="1"><div class="handle"></div>${SHEETS[NAVS.sheet.k](NAVS.sheet)}</div></div>`:'';
  const ts=D.toasts.length?`<div class="toastw" role="status">${D.toasts.map(t=>`<div class="toast" ${t.kind==='err'?'style="background:var(--danger)"':''}>${esc(t.text)}</div>`).join('')}</div>`:'';
  return html+sh+ts;
}
const needVerified=()=>{if(me()?.verified)return true;toast('Сначала подтвердите адрес');go('ob-verify');return false};

/* ---------- Вход: выбор ЖК ---------- */
S['ob-zk']=()=>{const q=(F.q||'').toLowerCase();const list=D.zks.filter(z=>!q||(z.name+' '+z.city).toLowerCase().includes(q));
  const cities=[...new Set(list.map(z=>z.city))];
  return SCRN({nav:`<div class="hdr">${LOGO(34)}<span></span></div>`,body:`
  <h1 class="h1">Где вы живёте?</h1><p class="sub">Выберите свой ЖК. Соседи, отключения и барахолка откроются только жителям этого дома.</p>
  <div class="mt"><div class="search">${I('search',18)}<input data-f="q" data-live="1" value="${esc(F.q||'')}" placeholder="Город или ЖК" style="border:0;background:none;outline:none;font:inherit;width:100%;color:var(--text)"></div></div>
  ${cities.length?cities.map(c=>`${LB(esc(c))}${list.filter(z=>z.city===c).map(z=>`<button class="sel-row" ${ACT('pickzk',{id:z.id})}><span><b style="font-weight:500">${esc(z.name)}</b>${z.status!=='active'?`<span class="xs mut" style="display:block">Собираем соседей для запуска</span>`:''}</span>${I('fwd',18)}</button>`).join('')}`).join('')
   :`<div class="note-box mt">${D.zks.length?'Ничего не нашлось.':'Пока не подключено ни одного ЖК. Модератор Тредо добавляет их во вкладке «Тредо».'}</div>`}
  <div class="mt3">${BTN('Моего ЖК нет в списке','o',GO('ob-wait'))}</div>`})};

S['ob-wait']=()=>SCRN({nav:NAVB(),body:`
  <h1 class="h1">Подключим ваш ЖК</h1><p class="sub">Оставьте адрес. Когда наберётся достаточно соседей, мы откроем ЖК и напишем вам.</p>
  ${LB('Город')}${FIN('city','Алматы')}${LB('Название ЖК')}${FIN('zkname','Например, Хан-Тенгри')}${LB('Номер дома')}${FIN('house','Например, 21/1',{max:10})}
  <div class="two">${`<div>${LB('Подъезд')}${FIN('ent','3',{mode:'numeric',max:3})}</div><div>${LB('Квартира')}${FIN('apt','58',{max:6})}</div>`}</div>`,
  foot:BTN('Встать в список ожидания','p',ACT('waitlist'))});
S['ob-waitdone']=p=>{const n=D.waitlist.filter(w=>w.key===p.key).length;
  return SCRN({nav:'<div style="height:12px"></div>',body:`
  <span class="tile m" style="width:52px;height:52px;border-radius:50%">${I('check',24,2.4)}</span>
  <h1 class="h1 mt">Вы в списке ожидания</h1><p class="sub">ЖК «${esc(p.name)}». Уже ждут открытия: ${n} ${plural(n,'сосед','соседа','соседей')}.</p>
  ${ST(1,'Каждый приглашённый сосед приближает запуск.',1)}${ST(2,'Когда наберётся 30 человек, откроем ленту, чаты подъездов и барахолку.')}${ST(3,'Первые соседи получат значок основателя и бесплатные поднятия объявлений.')}
  <div class="card mt3"><div class="b s">Готовый текст для чата дома</div><div class="card f mt2 xs mut" style="line-height:1.5">Соседи, для нашего ЖК «${esc(p.name)}» запускают приложение Соседи: отключения, барахолка, мастера, связь по номеру машины. Встаньте в список, чтобы его открыли: ${esc(appUrl('app'))}</div>
  <div class="mt2">${BTN('Отправить в чат дома','p sm',ACT('sharewait',{name:p.name}),'send')}</div></div>`,
  foot:BTN('Выбрать другой ЖК','g',ACT('back'))})};

S['zk-closed']=()=>{const z=zk();const n=D.members.length;const t=z?.threshold||30;
  return SCRN({nav:`<div class="hdr">${LOGO(30)}<button class="nb" ${ACT('leavezk')} aria-label="Другой ЖК">${I('close',20)}</button></div>`,body:`
  <div class="center mt"><span class="tile wa" style="width:76px;height:76px;border-radius:50%;margin:0 auto">${I('building',34)}</span>
  <h1 class="h2 mt3">ЖК «${esc(z?.name)}» пока не подключён</h1><p class="sub mt2">Вы среди первых. Мы откроем ЖК, когда в приложении будет ${t} соседей.</p></div>
  <div class="card f mt3"><div class="flex between"><span class="b s">Уже ждут открытия</span><span class="b s g">${n} из ${t}</span></div><div class="mt2">${PR(Math.min(100,n/t*100))}</div></div>`,
  foot:BTN('Позвать соседей в чат дома','p',ACT('sharezk'),'share')})};

/* ---------- Вход: адрес ---------- */
S['ob-addr']=()=>{const z=zk();const ents=Array.from({length:z?.entrances||1},(_,i)=>[i+1,i+1+' подъезд']);const hs=z?.houses||[];
  return SCRN({nav:NAVB('',{r:`<button class="link s" ${ACT('leavezk')}>Другой ЖК</button>`}),body:`
  <h1 class="h1">Адрес в ЖК «${esc(z?.name)}»</h1><p class="xs mut">${esc(cityName(z))}${z?.address?', '+esc(z.address):''}</p><p class="sub">Соседи увидят только имя и подъезд. Номер квартиры нужен для заявок в ОСИ и голосований.</p>
  ${LB('Как вас называть')}${FIN('name','Имя',{max:40})}
  ${LB('Номер дома')}${hs.length?PICK('house',hs.map(h=>[h,'Дом '+h]),{def:hs.length===1?hs[0]:''}):FIN('house','Например, 130 или 2А',{max:10})}
  <div class="two"><div>${LB('Подъезд')}${FSEL('ent',ents,{v:1})}</div><div>${LB('Квартира')}${FIN('apt','34',{max:6,mode:'numeric'})}</div></div>
  ${LB('Этаж')}${FIN('floor','5',{mode:'numeric',max:3})}${LB('Площадь, м² (для голосований ОСИ)')}${FIN('area','Необязательно',{mode:'decimal',max:6})}`,
  foot:BTN('Продолжить','p',ACT('saveaddr'))})};

/* ---------- Вход: подтверждение ---------- */
S['ob-verify']=()=>{const m=me();const z=zk();const tries=F.tries||0;const err=F.err;
  const inv=PENDING_INVITE&&PENDING_INVITE.zk===ZID?D.invites.find(i=>i.id===PENDING_INVITE.code):null;
  return SCRN({nav:NAVB(),body:`
  <h1 class="h1">Подтвердите, что вы живёте здесь</h1><p class="sub">${esc(fullAddr(m))}. Так соседи знают, что пишут настоящему соседу.</p>
  ${inv&&!inv.usedBy?`<div class="card sel mt3 flex top-a">${TL('userplus','wa')}<div class="grow"><div class="b">Приглашение от соседа</div><div class="xs mut">Вас пригласил ${esc(whoOf(inv.from))}. Адрес подтвердится сразу.</div><div class="mt2">${BTN('Принять приглашение','p sm',ACT('useinvite'))}</div></div></div>`:''}
  <div class="card ${err?'':'sel'} mt3"><div class="flex top-a">${TL('qr')}<div class="grow"><div class="b">Код из подъезда</div><div class="xs mut">Он на листовке у лифта. Код меняется 1-го числа каждого месяца.</div></div></div>
  <div class="codein ${err?'err':''} mt"><input data-f="code" inputmode="numeric" maxlength="6" value="${esc(F.code||'')}" placeholder="••••••" aria-label="Код из подъезда"></div>
  ${err?`<div class="errt">${I('alert',15)}<span>${esc(err)}</span></div>`:''}</div>
  ${err?`<div class="card f mt2"><div class="b s">Почему так бывает</div><p class="xs mut mt2">Код обновляется 1-го числа. Проверьте дату под кодом на листовке. Если выбрали не тот подъезд, <button class="link xs" ${GO('ob-addr')}>поменяйте адрес</button>.</p></div>`:''}
  <div class="card mt2 flex top-a">${TL('userplus','wa')}<div class="grow"><div class="b">Нет листовки?</div><div class="xs mut">Сосед из приложения может прислать вам ссылку-приглашение.</div><div class="mt2"><button class="link s" ${ACT('askinvite')}>Попросить приглашение у соседа</button></div></div></div>`,
  foot:BTN(tries>=3?'Слишком много попыток, подождите':'Подтвердить','p',ACT('verify')+(tries>=3&&F.lockUntil>now()?' disabled':''))+BTN('Пока только посмотреть ленту','g',ACT('readonly'))})};

S['ob-car']=()=>SCRN({nav:NAVB('',{r:`<button class="link b s" ${GO('ob-done')}>Пропустить</button>`}),body:`
  <h1 class="h1">Есть машина?</h1><p class="sub">Если вас перекроют во дворе, сосед найдёт вас по номеру и напишет в приложении. Номер видят только как «сосед из ${me()?.entrance} подъезда».</p>
  ${LB('Госномер')}<div class="plate foc"><span>${`<input data-f="plate" maxlength="9" value="${esc(F.plate||'')}" placeholder="123 ABC" aria-label="Госномер">`}</span><em><input data-f="reg" maxlength="3" inputmode="numeric" value="${esc(F.reg??'02')}" aria-label="Регион"><small>KZ</small></em></div>
  <div class="card f flex mt"><span class="grow s">Сообщать, если моя машина кому-то мешает</span>${CHK(F.notify!==false,ACT('togf',{f:'notify',def:1}))}</div>`,
  foot:BTN('Сохранить','p',ACT('saveplate',{next:'ob-done'}))+BTN('У меня нет машины','g',GO('ob-done'))});

S['ob-done']=()=>{const m=me();const same=D.members.filter(x=>x.entrance===m.entrance&&x.verified&&x.id!==C.uid).length;const all=D.members.filter(x=>x.verified).length;
  const o=nextOutage();
  return SCRN({nav:'<div style="height:14px"></div>',body:`
  <div class="xs g b">${m.verified?'Адрес подтверждён':'Адрес пока не подтверждён'}</div><h1 class="h1 xl">Вы в ${esc(zk()?.name)}</h1>
  <div class="card m mt"><div class="avs">${D.members.filter(x=>x.entrance===m.entrance&&x.id!==C.uid).slice(0,3).map(x=>AVM(x.id,32)).join('')}</div>
  <div class="h2 mt" style="color:var(--primary-strong)">${same?`В вашем подъезде уже ${same} ${plural(same,'сосед','соседа','соседей')}`:'Вы первый в своём подъезде'}</div>
  <p class="xs mut mt2">Всего в ЖК: ${all} ${plural(all,'сосед','соседа','соседей')}. Скажите «привет» в чате подъезда.</p></div>
  ${o?`<button class="card mt2 flex top-a" ${GO('outage',{id:o.id})}>${TL('dropoff','wa')}<span class="grow"><span class="xs w b" style="display:block">Ближайшее отключение</span><span class="b" style="display:block">${esc(o.title)}</span><span class="xs mut">${outageWhen(o)}</span></span></button>`:''}`,
  foot:`<p class="fine">Важное будет в колокольчике на главной.</p>${BTN('Перейти в ленту','p',ACT('tab',{v:'home'}))}`})};

/* ---------- Отключения ---------- */
const outageWhen=o=>`${wdmy(o.start)}, ${hm(o.start)}–${hm(o.end)}`;
const outageActive=o=>o.end>now()&&o.status!=='cancelled';
const affects=(o,m)=>!o.entrances||!o.entrances.length||o.entrances.includes(m?.entrance);
function nextOutage(){const m=me();return [...D.outages].filter(o=>outageActive(o)&&affects(o,m)).sort((a,b)=>a.start-b.start)[0]||null}
S['outage']=p=>{const o=D.outages.find(x=>x.id===p.id);if(!o)return SCRN({nav:NAVB(),body:EMPTY('dropoff','Отключение не найдено')});
  const started=o.start<now(),ended=o.end<now();const rem=(D.profile?.remind||{})[o.id];const rep=ackCount('out_'+o.id);const mine=myAcks()['out_'+o.id];
  return SCRN({nav:NAVB('',{r:`<button class="nb" ${ACT('shareoutage',{id:o.id})} aria-label="Поделиться">${I('share',20)}</button>`}),body:`
  <div class="badges">${BD(ended?'Прошло':started?'Сейчас':o.start-now()<86400000?'Скоро':'Запланировано','wa')}${BD(o.planned===false?'Аварийное':'Плановое')}</div>
  <h1 class="h1 mt2">${esc(o.title)}</h1><div class="h3">${outageWhen(o)}</div>
  <div class="rows mt">${RW('Где',esc(o.entrances?.length?o.entrances.join(', ')+' подъезд':'Весь ЖК')+(o.risers?', '+esc(o.risers):''))}${RW('Причина',esc(o.reason||'Не указана'))}${RW('Источник','ОСИ '+esc(zk()?.name)+', '+dmy(o.at||o.start))}</div>
  ${o.tip?`<div class="card f mt"><div class="b s">Подготовьтесь заранее</div><p class="xs mut mt2">${esc(o.tip)}</p></div>`:''}
  ${!ended?`<div class="flex between mt3"><span class="s">Напомнить утром в день отключения</span>${CHK(rem,ACT('remind',{id:o.id}))}</div>`:''}
  ${started?`<div class="card mt3"><div class="b s">После ${hm(o.end)} всё ещё нет?</div><p class="xs mut">Отметьте, и ОСИ увидит, сколько квартир без воды. Уже отметили: ${rep}.</p><div class="mt">${BTN(mine?'Вы отметили, отменить':'Не дали, сообщить в ОСИ','o sm',ACT('outrep',{id:o.id}))}</div></div>`:''}`})};

/* ---------- Главная ---------- */
function unreadTotal(){if(typeof ntf==='function'&&ntf().chat==='off')return 0;const rd=D.profile?.read||{};return myChats().reduce((s,c)=>s+c.unread,0)}
function notifs(){const m=me();if(!m)return[];const out=[];const seen=D.profile?.nseen||0;
  D.outages.filter(o=>outageActive(o)&&affects(o,m)&&o.start-now()<172800000).forEach(o=>out.push({at:o.at||o.start,ic:'dropoff',c:'wa',t:`<b>${esc(o.title)}</b> ${outageWhen(o)}`,s:'ОСИ',go:['outage',o.id]}));
  D.alerts.filter(a=>a.to===C.uid&&now()-a.at<7200000).forEach(a=>out.push({at:a.at,ic:'car',c:'wa',t:`<b>Ваша машина ${esc(a.plate)} мешает:</b> ${esc(a.reason)}`,s:a.status==='free'?'Закрыто':'Ответьте соседу',go:['car-in',a.id]}));
  D.alerts.filter(a=>a.from===C.uid&&a.status!=='sent'&&now()-a.at<86400000).forEach(a=>out.push({at:a.updAt||a.at,ic:'car',c:'f',t:a.status==='free'?'<b>Выезд свободен.</b> Сосед отодвинул машину':`<b>Сосед ответил:</b> ${esc(a.reply||'прочитал')}`,s:a.plate,go:['car-alert',a.id]}));
  const myPosts=new Set(D.posts.filter(p=>p.author===C.uid).map(p=>p.id));
  D.comments.filter(c=>myPosts.has(c.post)&&c.by!==C.uid).slice(0,20).forEach(c=>{const p=D.posts.find(x=>x.id===c.post);out.push({at:c.at,ic:'chat',c:'m',t:`<b>${esc(whoOf(c.by))}:</b> «${esc(c.text.slice(0,90))}»`,s:esc(p?.title||''),go:['post',c.post]})});
  D.news.filter(n=>!myAcks()['n_'+n.id]&&now()-n.at<604800000).forEach(n=>out.push({at:n.at,ic:'flag',c:'m',t:`<b>ОСИ:</b> ${esc(n.title)}`,s:'Объявление',go:['story',n.id]}));
  D.jobs.filter(j=>j.from===C.uid&&j.updAt).forEach(j=>out.push({at:j.updAt,ic:'wrench',c:'f',t:`<b>Заявка мастеру:</b> ${esc(JOBST[j.status]||j.status)}`,s:esc(D.masters.find(x=>x.id===j.master)?.name||''),go:['job',j.id]}));
  D.osireq.filter(r=>(r.by===C.uid||(r.joiners||[]).includes(C.uid))&&r.updAt).forEach(r=>out.push({at:r.updAt,ic:'building',c:'f',t:`<b>Заявка в ОСИ №${esc(r.num||'')}:</b> ${esc(OSIST[r.status]||r.status)}`,s:esc(r.title),go:['osi-req',r.id]}));
  D.orders.filter(o=>o.by===C.uid&&o.status==='paid'&&o.updAt).forEach(o=>out.push({at:o.updAt,ic:'check',c:'m',t:`<b>Оплата подтверждена:</b> ${esc(o.title||'')}`,s:money(o.amount),go:null}));
  D.invites.filter(i=>i.from===C.uid&&i.usedBy).forEach(i=>out.push({at:i.usedAt,ic:'userplus',c:'m',t:`<b>${esc(nameOf(i.usedBy))} теперь здесь.</b> Вам +1 бесплатное поднятие`,s:'Приглашение',go:['joined',i.id]}));
  D.posts.filter(p=>FLEA.includes(p.kind)&&p.author!==C.uid&&now()-p.at<86400000&&p.status==='active').slice(0,3).forEach(p=>out.push({at:p.at,ic:'bag',c:'f',t:`<b>Новое в барахолке:</b> ${esc(p.title)}`,s:KINDS[p.kind][0],go:['post',p.id]}));
  return out.sort((a,b)=>b.at-a.at).map(x=>({...x,un:x.at>seen}))}
const HOMEHDR2=()=>{const un=notifs().some(n=>n.un);return `<div class="hdr"><span class="flex" style="gap:10px">${LOGO(30)}<span style="font-size:15px;font-weight:500">ЖК «${esc(zk()?.name)}»</span></span><span class="flex" style="gap:2px"><button class="nb" ${GO('saved')} aria-label="Избранное">${I('bookmark',22,1.7)}</button><button class="nb" ${GO('notifs')} aria-label="Уведомления">${I('bell',22,1.7)}${un?'<i class="dotr"></i>':''}</button></span></div>`};

const SERVICES=[['car','Кто перекрыл','car-search'],['wrench','Мастера','masters'],['bag','Барахолка','flea'],['chart','Опросы','polls'],
  ['drop','Меня затапливает','flood'],['phone','Справочник дома','directory'],['building','Заявка в ОСИ','osi-new'],['card','Взносы ОСИ','fee'],['flag','Голосования','ballots'],['calendar','Общие зоны','zones'],
  ['userplus','Помощь соседей','help'],['cake','Бизнес соседей','biz-list'],['refresh','Вместе дешевле','groupbuys'],['tree','Сбор на двор','crowd-list'],
  ['star','Сезон и лига','season'],['park','Парковка','parking'],['box','Лавка в доме','shop'],['lock','Доступ и гости','access'],
  ['home','Квартира','passport'],['doc','Ремонт под ключ','leads'],['gift','Неделя в ЖК','digest'],['share','Витрина ЖК','showcase']];

S['home']=()=>{const m=me();const o=nextOutage();const inc=D.alerts.find(a=>a.to===C.uid&&a.status!=='free'&&now()-a.at<7200000);
  const feed=F.feed||'feed';const kinds=feed==='flea'?FLEA:['question','poll','lost','car'];
  const posts=sortPosts(D.posts.filter(p=>kinds.includes(p.kind)&&p.status!=='hidden'&&p.status!=='deleted'&&visibleTo(p,m)));
  const unacked=D.news.filter(n=>!myAcks()['n_'+n.id]).slice(0,4);
  const myJoin=D.invites.find(i=>i.from===C.uid&&i.usedBy&&!(D.profile?.seenJoins||[]).includes(i.id));
  return SCRN({nav:HOMEHDR2(),bcls:'flush',body:`
  <div style="padding:2px var(--pad) 14px">
  ${!m.verified?`<button class="banner" ${GO('ob-verify')} style="background:var(--primary-soft);margin-bottom:8px">${I('qr',20)}<span class="grow"><b class="s" style="display:block">Подтвердите адрес</b><span class="xs mut">Без этого можно только читать ленту</span></span>${I('fwd',18)}</button>`:''}
  ${inc?`<button class="banner" ${GO('car-in',{id:inc.id})} style="background:var(--danger-soft);margin-bottom:8px;color:var(--danger)">${I('car',20)}<span class="grow"><b class="s" style="display:block">Ваша машина ${esc(inc.plate)} мешает соседу</b><span class="xs">${esc(inc.reason)}, ${rel(inc.at)}</span></span>${I('fwd',18)}</button>`:''}
  ${myJoin?`<button class="banner" ${GO('joined',{id:myJoin.id})} style="background:var(--primary-soft);margin-bottom:8px">${I('userplus',20)}<span class="grow"><b class="s" style="display:block">${esc(nameOf(myJoin.usedBy))} теперь в приложении по вашей ссылке</b><span class="xs mut">+1 бесплатное поднятие</span></span>${I('fwd',18)}</button>`:''}
  ${homeExtras()}${o?`<button class="banner" ${GO('outage',{id:o.id})}>${I('dropoff',20)}<span class="grow"><span class="b s" style="display:block">${esc(o.title)}</span><span class="xs w">${outageWhen(o)}</span></span>${I('fwd',18)}</button>`:''}
  ${unacked.length?`<div class="stories">${unacked.map(n=>`<button class="story" ${GO('story',{id:n.id})}><span class="ring"><span style="background:var(--deep);color:var(--on-deep)"><b class="xs">ОСИ</b></span></span><span style="max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(n.title)}</span></button>`).join('')}</div>`:''}
  <div class="quick">${SERVICES.slice(0,4).map(([ic,l,r])=>`<button ${GO(r)}>${TL(ic,'m',46)}<span>${l}</span></button>`).join('')}</div>
  <div class="mt">${SEGF('feed',[['feed','Лента ЖК'],['flea','Барахолка']],{def:'feed',c:'ac'})}</div></div>
  ${posts.length?posts.map(p=>feedCard(p)).join(''):`<div class="sect">${EMPTY(feed==='flea'?'bag':'chat',feed==='flea'?'В барахолке пока тихо':'В ленте пока пусто',feed==='flea'?`Первое объявление увидят все ${D.members.length} соседей.`:'Задайте вопрос соседям или запустите опрос.',BTN(feed==='flea'?'Отдать или продать':'Написать соседям','p sm',GO('create')))}</div>`}
  <div class="sect"><div class="lbl" style="margin-top:0">Все сервисы</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px 4px;text-align:center;font-size:11.5px">${SERVICES.slice(4).map(([ic,l,r])=>`<button ${GO(r)} style="display:grid;justify-items:center;gap:5px;line-height:1.2">${TL(ic,'m',42)}<span>${l}</span></button>`).join('')}</div></div>`,tab:0})};
const visibleTo=(p,m)=>p.scope!=='entrance'||p.entrance===m?.entrance||p.author===C.uid;
const sortPosts=a=>[...a].sort((x,y)=>{const bx=(x.bumpUntil||0)>now(),by=(y.bumpUntil||0)>now();if(bx!==by)return bx?-1:1;return (y.at||0)-(x.at||0)});
const ccount=id=>D.comments.filter(c=>c.post===id).length;
const priceOf=p=>p.kind==='giveaway'?'<span class="g b">Бесплатно</span>':p.price?`${p.oldPrice?`<s class="mut3 s">${money(p.oldPrice)}</s> `:''}${money(p.price)}${p.kind==='rent'?' / день':''}`:'';
const saved=id=>(D.profile?.saved||[]).includes(id);
function feedCard(p){const n=ccount(p.id);const bump=(p.bumpUntil||0)>now();
  const meta=`<div class="meta"><span class="flex" style="gap:4px">${I('chat',14)}${n} ${plural(n,'комментарий','комментария','комментариев')}</span><i class="dot"></i><span>${rel(p.at)}</span>${bump?'<i class="dot"></i><span class="w b">Поднято</span>':''}<span class="grow"></span><span class="bm${saved(p.id)?' on':''}" ${ACT('save',{id:p.id})} role="button" aria-label="В избранное">${I('bookmark',14)}</span></div>`;
  if(FLEA.includes(p.kind))return `<div class="pcard" ${GO('post',{id:p.id})} role="button" tabindex="0">${p.photos?.[0]?IMG(p.photos[0],96):PH(KINDS[p.kind][1],96,'sa')}<div style="min-width:0"><div class="t">${esc(p.title)}</div><div class="d">${esc(p.text||'')}</div><div class="p">${priceOf(p)}</div></div><div style="grid-column:1/-1;border-top:1px solid var(--line);margin-top:2px">${meta}</div></div>`;
  if(p.kind==='poll')return `<div class="sect">${pollBlock(p,true)}${meta}</div>`;
  return `<div class="sect" ${GO('post',{id:p.id})} role="button" tabindex="0"><div class="flex">${BD(KINDS[p.kind][0],p.kind==='lost'||p.kind==='car'?'wa':'')}<span class="xs mut">${esc(whoOf(p.author))}</span></div>
    <div class="h3 mt2">${esc(p.title)}</div>${p.text?`<p class="s mut mt2" style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${esc(p.text)}</p>`:''}${p.photos?.[0]?`<div class="mt2">${IMG(p.photos[0],160)}</div>`:''}${meta}</div>`}

/* ---------- Опросы ---------- */
function tally(p){const res=(p.poll?.options||[]).map(()=>0);let total=0;D.votes.forEach(v=>{const c=v[p.id];if(typeof c==='number'&&res[c]!=null){res[c]++;total++}});return{res,total}}
function pollBlock(p,compact){const {res,total}=tally(p);const mine=myVotes()[p.id];const closed=p.poll?.endsAt&&p.poll.endsAt<now();const showRes=mine!=null||closed||p.author===C.uid;
  return `<div class="flex">${BD(closed?'Опрос завершён':'Опрос соседей','m')}<span class="xs mut">${p.scope==='entrance'?p.entrance+' подъезд':'Весь ЖК'}${p.poll?.endsAt&&!closed?', до '+dmy(p.poll.endsAt):''}</span></div>
  <${compact?`button style="display:block;width:100%;text-align:left" ${GO('post',{id:p.id})}`:'div'} class="h3 mt2">${esc(p.title)}</${compact?'button':'div'}>
  ${(p.poll?.options||[]).map((o,i)=>{const pc=total?Math.round(res[i]/total*100):0;return showRes?POLLO(o,pc,mine===i,closed?'':ACT('vote',{id:p.id,v:i})):`<button class="pollo" ${ACT('vote',{id:p.id,v:i})}><span>${esc(o)}</span></button>`}).join('')}
  <p class="xs mut mt2">${total} ${plural(total,'сосед проголосовал','соседа проголосовали','соседей проголосовали')}${mine==null&&!closed?', нажмите вариант':''}</p>`}
S['polls']=()=>{const ps=sortAt(D.posts.filter(p=>p.kind==='poll'&&p.status!=='hidden'&&visibleTo(p,me())));
  return SCRN({nav:NAVB('Опросы соседей'),bcls:'flush',body:`${ps.length?ps.map(p=>`<div class="sect">${pollBlock(p,true)}</div>`).join(''):EMPTY('chart','Опросов пока нет','Спросите мнение подъезда: лавочки, камера в лифт, субботник.')}`,
  foot:BTN('Создать опрос','p',GO('post-new',{v:'poll'}))})};

/* ---------- Публикация ---------- */
S['post']=p=>{const x=D.posts.find(q=>q.id===p.id);if(!x||x.status==='deleted')return SCRN({nav:NAVB(),body:EMPTY('bag','Публикация удалена')});
  const mine=x.author===C.uid;const cs=D.comments.filter(c=>c.post===x.id).sort((a,b)=>a.at-b.at);const flea=FLEA.includes(x.kind);
  const ph=x.photos||[];const pi=Math.min(F.pi||0,Math.max(0,ph.length-1));
  return SCRN({nav:NAVB('',{r:`<span class="flex" style="gap:2px"><button class="nb" ${ACT('save',{id:x.id})} aria-label="В избранное">${I('bookmark',20,saved(x.id)?2.6:1.7)}</button><button class="nb" ${ACT('sharepost',{id:x.id})} aria-label="Поделиться">${I('share',20)}</button></span>`}),body:`
  ${ph.length?`<div style="margin:0 calc(var(--pad)*-1) 14px;position:relative">${IMG(ph[pi],260,'','border-radius:0')}${ph.length>1?`<div class="flex" style="position:absolute;bottom:10px;left:0;right:0;justify-content:center;gap:6px">${ph.map((_,i)=>`<button ${ACT('pick',{f:'pi',v:i})} aria-label="Фото ${i+1}" style="width:${i===pi?18:7}px;height:7px;border-radius:4px;background:${i===pi?'var(--text)':'rgba(255,255,255,.8)'}"></button>`).join('')}</div>`:''}</div>`:''}
  <div class="flex between"><span class="xs mut" style="text-transform:uppercase;letter-spacing:.04em">${rel(x.at)}</span>${x.status==='given'?BD(x.kind==='giveaway'?'Отдано':'Закрыто'):''}</div>
  ${x.kind==='poll'?`<div class="mt2">${pollBlock(x)}</div>`:`<h1 class="h2 mt2">${esc(x.title)}</h1>${flea?`<div class="mt2" style="font-size:18px">${priceOf(x)}</div>`:''}${x.text?`<p class="mut mt" style="line-height:1.6;white-space:pre-line">${esc(x.text)}</p>`:''}`}
  ${x.pickup?.length?`<div class="badges mt">${x.pickup.map(t=>BD(esc(t),'m')).join('')}</div>`:''}
  ${x.kind==='poll'&&(mine||isOsi())&&!x.forwarded?`<div class="mt">${BTN('Передать итоги в ОСИ','o sm',ACT('forward',{id:x.id}))}</div>`:x.forwarded?`<p class="xs g b mt">Итоги переданы в ОСИ</p>`:''}
  ${claimBlock(x)}${mine?authorPanel(x):''}
  ${LB(x.kind==='giveaway'?'Кто хочет забрать':x.kind==='question'?'Ответы соседей':'Комментарии')}
  ${cs.length?cs.map(c=>`<div class="flex top-a" style="margin-bottom:12px">${AVM(c.by,32)}<div class="grow"><div class="flex between"><b class="s">${esc(whoOf(c.by))}</b><span class="xs mut3">${rel(c.at)}</span></div><p class="s mt2" style="margin-top:2px;white-space:pre-line">${esc(c.text)}</p></div></div>`).join(''):`<p class="s mut">Пока никто не ответил.</p>`}
  ${!mine?`<div class="flex mt3" style="gap:14px"><button class="link xs" ${ACT('report',{id:x.id})} style="color:var(--text-2)">${(x.reports||[]).includes(C.uid)?'Жалоба отправлена':'Пожаловаться'}</button></div>`:''}`,
  foot:x.status==='active'||x.kind==='poll'?`<div class="compose">${FTA('c',x.kind==='giveaway'?'Хочу забрать, когда удобно?':'Ваш ответ',{max:1000})}<button class="rfab g" style="width:44px;height:44px" ${ACT('comment',{id:x.id})} aria-label="Отправить">${I('send',18)}</button></div>${!mine?`<div class="flex between"><span class="flex">${AVM(x.author,36)}<span><b class="s" style="display:block">${esc(nameOf(x.author))}</b><button class="xs mut flex" style="gap:2px" ${GO('user-posts',{id:x.author})}>Другие объявления ${I('fwd',12)}</button></span></span><button class="rfab o" ${ACT('dm',{id:x.author})} aria-label="Написать лично">${I('edit',20)}</button></div>`:''}`:''})};
function authorPanel(x){const n=ccount(x.id);const bump=(x.bumpUntil||0)>now();
  return `<div class="card m mt">${bump?`<div class="flex top-a">${I('up',18)}<span class="xs"><b>Поднято</b> до ${wdmy(x.bumpUntil)}, ${hm(x.bumpUntil)}</span></div>`:`<div class="xs">Это ваша публикация. ${n} ${plural(n,'ответ','ответа','ответов')}.</div>`}
  <div class="actions mt2">${x.status==='active'&&FLEA.includes(x.kind)&&!bump?`<button class="btn p sm2" ${ACT('bumpsheet',{id:x.id})}>Поднять</button>`:''}${x.status==='active'&&x.kind!=='poll'?`<button class="btn o sm2" ${ACT('close',{id:x.id})}>${x.kind==='giveaway'?'Отдано, снять':'Закрыть'}</button>`:''}${x.kind==='poll'&&!(x.poll?.endsAt<now())?`<button class="btn o sm2" ${ACT('endpoll',{id:x.id})}>Завершить опрос</button>`:''}<button class="btn s2 sm2" ${ACT('delpost',{id:x.id})}>Удалить</button></div></div>`}
S['user-posts']=p=>{const ps=sortAt(D.posts.filter(x=>x.author===p.id&&x.status==='active'));return SCRN({nav:NAVB(esc(nameOf(p.id))),bcls:'flush',body:ps.length?ps.map(feedCard).join(''):EMPTY('bag','Активных объявлений нет')})};
S['saved']=()=>{const ids=D.profile?.saved||[];const ps=D.posts.filter(p=>ids.includes(p.id)&&p.status!=='deleted');return SCRN({nav:NAVB('Избранное'),bcls:'flush',body:ps.length?ps.map(feedCard).join(''):EMPTY('bookmark','В избранном пусто','Нажмите закладку на объявлении, чтобы вернуться к нему позже.')})};
S['flea']=()=>{const q=(F.q||'').toLowerCase();const k=F.k||'all';
  const ps=sortPosts(D.posts.filter(p=>FLEA.includes(p.kind)&&p.status==='active'&&visibleTo(p,me())&&(k==='all'||p.kind===k)&&(!q||(p.title+' '+(p.text||'')).toLowerCase().includes(q))));
  return SCRN({nav:LTH(`${esc(zk()?.name)}, ${D.members.length} ${plural(D.members.length,'сосед','соседа','соседей')}`,'Барахолка','',0),body:`
  <div class="mt"><div class="search">${I('search',18)}<input data-f="q" data-live="1" value="${esc(F.q||'')}" placeholder="Коляска, стол, велосипед" style="border:0;background:none;outline:none;font:inherit;width:100%;color:var(--text)"></div></div>
  <div class="mt">${PICK('k',[['all','Все'],['giveaway','Даром'],['sell','Продам'],['rent','Аренда'],['wanted','Ищу']],{def:'all',scroll:1})}</div>
  ${ps.length?`<div class="mason mt">${ps.map(p=>`<button ${GO('post',{id:p.id})}>${p.photos?.[0]?IMG(p.photos[0],p.kind==='giveaway'?150:120):PH(KINDS[p.kind][1],120,'sa')}<b class="s" style="display:block;margin-top:6px;line-height:1.25">${esc(p.title)}</b><span class="xs mut">${priceOf(p)||KINDS[p.kind][0]}, ${mem(p.author)?.entrance||'?'} подъезд</span></button>`).join('')}</div>`
   :`<div class="mt">${EMPTY('bag','Ничего не нашлось','Отдайте или продайте вещь: соседу забрать проще всего.')}</div>`}
  ${LB('Соседи, которые что-то делают')}${D.biz.filter(b=>b.status==='approved').slice(0,3).map(b=>`<button class="card f flex mt2" ${GO('biz',{id:b.id})}>${TL('cake','pe',36)}<span><b class="s" style="display:block">${esc(b.name)}</b><span class="xs mut">${esc(nameOf(b.owner))}, ${b.entrance} подъезд</span></span></button>`).join('')||`<p class="s mut">Пока никого. <button class="link s" ${GO('biz-edit')}>Рассказать о своём деле</button></p>`}`,
  foot:BTN('Отдать или продать','ac',GO('create'),'plus')})};

/* ---------- Создать ---------- */
S['create']=()=>SCRN({nav:LTH('Добавьте объявление','Что хотите сделать?','',1),body:`
  <p class="sub mt">Выберите, и мы подскажем, что написать</p>
  <div class="tg mt">${[['giveaway','Вещи, мебель, детское','m'],['sell','Покупатель в соседнем подъезде','m'],['question','Кто знает, где, когда','m'],['poll','Узнать мнение подъезда','m'],['lost','Ключи, питомцы, посылки','wa'],['rent','Вещи на день: дрель, палатка','m'],['wanted','Найдётся у соседей','m']].map(([k,d,c])=>`<button class="tc" ${GO('post-new',{v:k})}>${TL(KINDS[k][1],c,34)}<span class="b s">${KINDS[k][0]}</span><span class="xs mut">${d}</span></button>`).join('')}
  <button class="tc" ${GO('masters')}>${TL('wrench','m',34)}<span class="b s">Ищу мастера</span><span class="xs mut">Соседи посоветуют проверенного</span></button></div>
  <div class="tg mt2"><button class="tc" ${GO('osi-new')}>${TL('building','f',34)}<span class="b s">Заявка в ОСИ</span><span class="xs mut">Протечка, лифт, свет</span></button><button class="tc" ${GO('help')}>${TL('userplus','f',34)}<span class="b s">Нужна помощь</span><span class="xs mut">Мусор, собака, покупки</span></button></div>
  <div class="card f mt xs mut">Пост увидят ${D.members.length} ${plural(D.members.length,'сосед','соседа','соседей')} ${esc(zk()?.name)}. Телефон скрыт, пока вы сами его не покажете.</div>`,tab:1});

S['post-new']=p=>{const k=p.v||'giveaway';const flea=FLEA.includes(k);if(F.opts===undefined&&k==='poll')F.opts=['',''];
  return SCRN({nav:NAVB(KINDS[k][0],{x:k==='poll'}),body:`
  ${k!=='poll'&&k!=='question'?`<div class="thumbs">${(F.photos||[]).map((id,i)=>`<div class="thumb" style="background-image:url('${blob(id)}')"><button ${ACT('rmphoto',{v:i})} aria-label="Убрать фото">${I('close',12)}</button></div>`).join('')}${(F.photos||[]).length<6?`<button class="addph" ${ACT('addphotos')} aria-label="Добавить фото">${I(C.assets?'plus':'camera',22)}</button>`:''}</div>${!C.assets?`<p class="xs mut mt2">Фото могут добавлять участники с правом записи в артефакт.</p>`:''}`:''}
  ${aiFillBtn(k)}
  ${k==='lost'?`<div class="mt">${SEGF('lf',[['lost','Потерял'],['found','Нашёл']],{def:'lost'})}</div>`:''}
  ${LB(k==='poll'?'Вопрос':k==='question'?'Ваш вопрос':k==='giveaway'?'Что отдаёте':k==='sell'?'Что продаёте':k==='rent'?'Что сдаёте':k==='wanted'?'Что ищете':'Что случилось')}${FIN('title',k==='poll'?'Ставим лавочки у второго подъезда?':k==='question'?'Кто знает хорошего электрика?':'Детская коляска 2 в 1',{max:90})}
  ${k==='poll'?`${LB('Варианты')}${F.opts.map((o,i)=>`<div class="flex mt2"><input class="inp" data-f="opt${i}" value="${esc(F['opt'+i]??o)}" placeholder="Вариант ${i+1}" maxlength="60">${F.opts.length>2?`<button class="nb" ${ACT('rmopt',{v:i})} aria-label="Убрать">${I('close',18)}</button>`:''}</div>`).join('')}
    ${F.opts.length<6?`<button class="inp mt2 wfull g s center" style="border-style:dashed" ${ACT('addopt')}>+ Добавить вариант</button>`:''}
    ${LB('Завершить через')}${PICK('days',[[1,'1 день'],[3,'3 дня'],[7,'Неделю']],{def:3})}
    <div class="card f flex top-a mt">${I('info',16)}<span class="xs mut">Это опрос мнений. Решения по дому принимает ОСИ на официальном голосовании.</span></div>`
   :`${LB(k==='question'?'Подробности':'Пара слов')}${FTA('text',k==='giveaway'?'Катали одного ребёнка, колёса целые':'Подробности',{max:900})}`}
  ${k==='sell'?`${LB('Цена, ₸')}${FIN('price','40 000',{mode:'numeric',max:9})}${LB('Старая цена, ₸ (необязательно)')}${FIN('oldPrice','',{mode:'numeric',max:9})}`:''}
  ${k==='rent'?`${LB('Цена за день, ₸')}${FIN('price','2 000',{mode:'numeric',max:7})}`:''}
  ${k==='wanted'?`${LB('Бюджет, ₸ (необязательно)')}${FIN('price','',{mode:'numeric',max:9})}`:''}
  ${k==='giveaway'||k==='sell'||k==='rent'?`${LB('Когда забрать')}${PICK('pickup',[['Вечером','Вечером'],['Выходные','Выходные'],['Договоримся','Договоримся']],{multi:1})}`:''}
  ${LB(k==='poll'?'Кто голосует':'Кому показать')}${SEGF('scope',[['entrance','Мой подъезд'],['all','Весь ЖК']],{def:k==='poll'?'entrance':'all'})}`,
  foot:BTN(k==='poll'?'Опубликовать опрос':'Опубликовать','p',ACT('publish',{v:k}))})};

/* поднятие */
const credits=()=>D.invites.filter(i=>i.from===C.uid&&i.usedBy).length-D.posts.filter(p=>p.author===C.uid&&p.bumpFree).length+(me()?.bonus||0);
const prices=()=>({bump1:D.settings.bump1||500,bump3:D.settings.bump3||1200,...D.settings});
SHEETS['bump']=s=>{const cr=credits();const pr=prices();if(!F.bo)F.bo=cr>0?'free':'invite';
  return `<div class="h2">Поднять объявление</div><p class="xs mut">Оно будет первым в ленте и барахолке, его заметят быстрее.</p>
  <div>${cr>0?OPTR('bo','free','Бесплатно','У вас '+cr+' '+plural(cr,'бесплатное поднятие','бесплатных поднятия','бесплатных поднятий'),'1 день')
  :OPTR('bo','invite','Бесплатно','Позовите одного соседа в приложение','1 день')}${OPTR('bo','d1','На 1 день','Первое место в ленте',money(pr.bump1))}${OPTR('bo','d3','На 3 дня','Первое место и пуш соседям подъезда',money(pr.bump3))}</div>
  ${F.bo==='d1'||F.bo==='d3'?`<div class="note-box mt2">${esc(D.settings.payInfo||'Оплата переводом по реквизитам Тредо. После подтверждения оплаты модератором объявление поднимется.')}</div>`:''}
  <div class="mt">${BTN(F.bo==='invite'?'Позвать соседа':F.bo==='free'?'Поднять бесплатно':'Я оплатил, поднять после проверки','p',ACT('dobump',{id:s.id}))}</div>${BTN('Не сейчас','g',ACT('sheetclose'))}`};
const OPTR=(f,v,t,sub,r)=>`<button class="opt${F[f]===v?' on':''}" ${ACT('pick',{f,v})}><span class="rd"></span><span class="grow"><span class="b s" style="display:block">${t}</span><span class="xs mut">${sub}</span></span><span class="b s">${r}</span></button>`;

/* приглашения */
const coverage=e=>{const z=zk();const per=z?.aptsPerEntrance||60;const n=D.members.filter(m=>m.entrance===e&&m.verified).length;return{n,per,pc:Math.min(100,Math.round(n/per*100))}};
S['invite']=()=>{const m=me();const cv=coverage(m.entrance);const mine=sortAt(D.invites.filter(i=>i.from===C.uid));const last=mine.find(i=>!i.usedBy);
  return SCRN({nav:NAVB(),body:`
  <h1 class="h1">Позовите соседей</h1>
  <div class="card m mt"><div class="flex between"><span class="b s" style="color:var(--primary-strong)">${m.entrance} подъезд в приложении</span><span class="h1" style="margin:0;color:var(--primary-strong)">${cv.pc}%</span></div>
  <div class="mt2">${PR(cv.pc,50)}</div><p class="xs mut mt">При 50% квартир откроем групповые скидки: мойка окон, чистка кондиционеров. ${cv.pc<50?`Осталось ${Math.max(0,Math.ceil(cv.per/2)-cv.n)} ${plural(Math.ceil(cv.per/2)-cv.n,'квартира','квартиры','квартир')}.`:'Порог пройден.'}</p></div>
  <div class="card mt2 flex">${TL('up','wa',34)}<span class="s">За каждого соседа, который подтвердит адрес по вашей ссылке, одно поднятие объявления бесплатно. Сейчас у вас: ${Math.max(0,credits())}.</span></div>
  ${last&&F.qr?`<div class="center mt"><div class="qrwrap" style="width:200px">${QRSVG(appUrl('invite-'+ZID+'-'+last.id))}</div><p class="xs mut mt2">Покажите соседу, пусть отсканирует камерой</p></div>`:''}
  ${LB('Ваши приглашения')}${mine.length?mine.slice(0,10).map(i=>`<div class="row plain"><span class="flex">${i.usedBy?AVM(i.usedBy,30):AV('…','gr',30)}${i.usedBy?esc(nameOf(i.usedBy)+', кв. скрыта'):'Ссылка от '+dmy(i.at)}</span><span class="xs ${i.usedBy?'g b':'mut'}">${i.usedBy?'Присоединился':'Ждём'}</span></div>`).join(''):`<p class="s mut">Вы ещё никого не звали.</p>`}`,
  foot:BTN('Отправить ссылку','p',ACT('newinvite',{share:1}),'share')+BTN(F.qr?'Скрыть QR-код':'Показать QR-код соседу','o',ACT('newinvite',{qr:1}),'qr')})};
S['joined']=p=>{const i=D.invites.find(x=>x.id===p.id);if(!i)return SCRN({nav:NAVB(),body:''});const cv=coverage(me().entrance);
  postDraw.push(()=>{const sj=D.profile?.seenJoins||[];if(!sj.includes(i.id))setPref({seenJoins:[...sj,i.id].slice(-50)})});
  const myActive=sortAt(D.posts.filter(x=>x.author===C.uid&&x.status==='active'&&FLEA.includes(x.kind)&&!((x.bumpUntil||0)>now())))[0];
  return SCRN({nav:NAVB(),body:`
  <div class="flex" style="gap:0">${AVM(i.usedBy,54)}<span class="av" style="--s:54px;background:var(--primary);color:var(--on-primary);margin-left:-10px;box-shadow:0 0 0 3px var(--surface)">${I('check',24,2.6)}</span></div>
  <h1 class="h1 mt">${esc(nameOf(i.usedBy))} теперь здесь</h1><p class="sub">Адрес подтверждён по вашей ссылке. Спасибо, что зовёте соседей.</p>
  <div class="card sel mt3 flex">${TL('up','m',36)}<div><div class="b">+1 бесплатное поднятие</div><div class="xs mut">Всего доступно: ${Math.max(0,credits())}</div></div></div>
  <div class="card f mt2"><div class="flex between s"><b>${me().entrance} подъезд в приложении</b><b>${cv.pc}%</b></div><div class="mt2">${PR(cv.pc,50)}</div></div>`,
  foot:(myActive?BTN('Поднять «'+esc(myActive.title.slice(0,24))+'»','p',ACT('bumpfree',{id:myActive.id})):'')+BTN('Позвать ещё соседей','g',GO('invite'))})};
S['my-posts']=()=>{const ps=sortAt(D.posts.filter(p=>p.author===C.uid&&p.status!=='deleted'));return SCRN({nav:NAVB('Мои публикации'),bcls:'flush',body:ps.length?ps.map(feedCard).join(''):EMPTY('bag','Вы ещё ничего не публиковали','',BTN('Создать','p sm',GO('create')))})};

/* ---------- Уведомления ---------- */
S['notifs']=()=>{const ns=notifs();postDraw.push(()=>{const top=ns[0]?.at||0;if(top>(D.profile?.nseen||0))setPref({nseen:top})});
  return SCRN({nav:NAVB('Уведомления',{r:`<button class="nb" ${GO('notif-settings')} aria-label="Настройки уведомлений">${I('gear',20)}</button>`}),bcls:'flush',body:ns.length?ns.slice(0,60).map(n=>`<button class="ni${n.un?' un':''}" ${n.go?GO(n.go[0],{id:n.go[1]}):''}>${TL(n.ic,n.c,34)}<span><span class="s" style="display:block">${n.t}</span><span class="xs mut3">${n.s?n.s+', ':''}${rel(n.at)}</span></span>${n.un?'<span class="dt"></span>':'<span></span>'}</button>`).join(''):EMPTY('bell','Пока тихо','Здесь появятся отключения, ответы соседей и статусы заявок.')})};

