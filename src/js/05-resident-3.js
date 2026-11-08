/* =====================================================================
   Приложение жителя, часть 3: сервисы и аккаунт
   ===================================================================== */
/* ---------- Общие зоны ---------- */
const nextDays=n=>Array.from({length:n},(_,i)=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+i);return d.getTime()});
S['zones']=()=>{const zs=zk()?.zones||[];if(!zs.length)return SCRN({nav:NAVB('Общие зоны'),body:EMPTY('calendar','Зон для брони пока нет','Председатель ОСИ добавляет зал, барбекю или коворкинг в кабинете.')});
  const zid=F.z||zs[0].id;const zn=zs.find(x=>x.id===zid)||zs[0];const day=F.d||dayKey(now());const slots=zn.slots||['10:00–13:00','13:00–16:00','16:00–19:00','19:00–22:00'];
  const taken=s=>D.bookings.find(b=>b.id===`${zn.id}_${day}_${slots.indexOf(s)}`&&b.status!=='cancelled');
  const mine=sortAt(D.bookings.filter(b=>b.by===C.uid&&b.status!=='cancelled'&&b.date>=dayKey(now())),'date');
  return SCRN({nav:NAVB(),body:`<h1 class="h1">Общие зоны</h1>
  <div style="display:grid;grid-template-columns:repeat(${Math.min(3,zs.length)},1fr);gap:6px" class="mt">${zs.map(x=>`<button class="opt${x.id===zn.id?' on':''}" style="margin:0;display:block;padding:9px" ${ACT('pick',{f:'z',v:x.id})}><b class="s" style="display:block">${esc(x.name)}</b><span class="xs mut">${esc(x.place||'')}</span></button>`).join('')}</div>
  <div class="days mt">${nextDays(5).map(t=>`<button class="${dayKey(t)===day?'on':''}" ${ACT('pick',{f:'d',v:dayKey(t)})}>${WD[new Date(t).getDay()]}<b>${new Date(t).getDate()}</b></button>`).join('')}</div>
  <div class="two mt">${slots.map(s=>{const t=taken(s);const sel=F.s===s;return t?`<span class="slot x">${esc(s)}${t.by===C.uid?' (вы)':''}</span>`:`<button class="slot${sel?' on':''}" ${ACT('pick',{f:'s',v:s})}>${esc(s)}</button>`}).join('')}</div>
  ${zn.rules?`<div class="card f mt"><div class="b s">Условия</div><p class="xs mut mt2">${esc(zn.rules)}</p></div>`:''}
  ${mine.length?`${LB('Ваши брони')}${mine.map(b=>`<div class="row plain"><span>${esc(b.zoneName)}, ${esc(b.date.split('-').reverse().slice(0,2).join('.'))}, ${esc(b.slot)}</span><button class="link s" ${ACT('unbook',{id:b.id})}>Отменить</button></div>`).join('')}`:''}`,
  foot:F.s?`<div class="card dp flex between" style="padding:10px 12px"><span><b class="s" style="display:block">${esc(zn.name)}</b><span class="xs mut">${esc(day.split('-').reverse().slice(0,2).join('.'))}, ${esc(F.s)}</span></span><button class="btn lt sm2" ${ACT('book',{z:zn.id,d:day,s:F.s})}>Забронировать</button></div>`:''})};

/* ---------- Паспорт квартиры (приватно) ---------- */
S['passport']=()=>{const pp=D.profile?.passport||{};const m=me();const masters=[...new Set(D.jobs.filter(j=>j.from===C.uid&&j.status==='done').map(j=>j.master))].map(id=>D.masters.find(x=>x.id===id)).filter(Boolean);
  return SCRN({nav:NAVB(),body:`<h1 class="h1">Квартира ${esc(m.apt)}</h1><div class="xs mut">${m.house?'Дом '+esc(m.house)+', ':''}${m.entrance} подъезд${m.area?', '+esc(m.area)+' м²':''}. Видите только вы.</div>
  <div class="card dp mt"><div class="flex between"><b class="s">Показания счётчиков</b><span class="xs mut">${pp.metersAt?'обновлено '+dmy(pp.metersAt):'не внесены'}</span></div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px" class="mt">${[['cold','Холодная'],['hot','Горячая'],['el','Свет']].map(([k,l])=>`<label style="background:var(--deep-2);border-radius:10px;padding:8px;display:block"><span class="xs mut" style="display:block">${l}</span><input data-f="m_${k}" value="${esc(F['m_'+k]??pp[k]??'')}" inputmode="decimal" maxlength="9" style="background:none;border:0;outline:none;color:var(--on-deep);font:inherit;font-weight:700;width:100%"></label>`).join('')}</div>
  <div class="mt">${BTN('Сохранить показания','lt sm',ACT('savemeters'))}</div></div>
  <div class="card mt2"><div class="b s">Техника и гарантии</div><div class="rows">${(pp.warranty||[]).map((w,i)=>`<div class="row plain"><span>${esc(w.t)}</span><span class="flex" style="gap:8px"><span class="${w.until&&new Date(w.until)<new Date(now()+90*86400000)?'w':''}">до ${esc(w.until)}</span><button class="nb" style="width:24px;height:24px" ${ACT('rmwar',{v:i})} aria-label="Удалить">${I('close',14)}</button></span></div>`).join('')||'<p class="s mut mt2">Добавьте бойлер, кондиционер, окна.</p>'}</div>
  <div class="two mt2">${FIN('wt','Бойлер, 80 л',{max:40})}${FIN('wu','2027-05',{max:10})}</div><div class="mt2">${BTN('Добавить','o sm',ACT('addwar'))}</div></div>
  <div class="card mt2"><div class="b s">Мои мастера</div><div class="chips mt2">${masters.map(x=>`<button class="chip" ${GO('master',{id:x.id})}>${esc(x.name)}, ${esc(x.trade.toLowerCase())}</button>`).join('')||'<span class="s mut">Появятся после выполненных заявок.</span>'}</div></div>`})};

/* ---------- Сезон и лига ---------- */
S['season']=()=>{const evs=[...D.events].filter(e=>e.date>=now()-86400000).sort((a,b)=>a.date-b.date);const z=zk();
  const league=Array.from({length:z?.entrances||1},(_,i)=>[i+1,coverage(i+1).pc]).sort((a,b)=>b[1]-a[1]);const myE=me().entrance;
  return SCRN({nav:NAVB(),body:`<h1 class="h1">Сезон в доме</h1>
  ${evs.length?evs.map(e=>{const d=new Date(e.date);const joined=myAcks()['ev_'+e.id];return `<div class="card ${e.gb?'wa':''} flex mt2"><span class="dateb"><small>${MONS[d.getMonth()]}</small><b>${d.getDate()}</b></span><span class="grow"><b class="s" style="display:block">${esc(e.title)}</b><span class="xs mut">${esc(e.desc||'')}${e.signup?`, записались ${ackCount('ev_'+e.id)}`:''}</span></span>${e.gb?`<button class="btn o sm2" ${GO('groupbuy',{id:e.gb})}>Вместе</button>`:e.signup?`<button class="btn ${joined?'s2':'p'} sm2" ${ACT('evjoin',{id:e.id})}>${joined?'Вы идёте':'Записаться'}</button>`:''}</div>`}).join(''):`<p class="s mut mt">ОСИ ещё не добавило события сезона.</p>`}
  <div class="card dp mt"><div class="flex between"><b>Лига подъездов</b><span class="xs mut">${esc(z?.leaguePrize?'приз: '+z.leaguePrize:'кто больше квартир приведёт')}</span></div>
  ${league.map(([e,p],i)=>`<div class="flex mt s"><b style="width:12px">${i+1}</b><span style="width:96px;white-space:nowrap">${e} подъезд${e===myE?' (ваш)':''}</span><span class="grow">${PR(p,0,'lt')}</span><b style="width:36px;text-align:right">${p}%</b></div>`).join('')}
  <div class="mt">${BTN('Позвать соседа из своего подъезда','lt sm',GO('invite'))}</div></div>`})};

/* ---------- Вместе дешевле ---------- */
const gbCount=g=>ackCount('gb_'+g.id);
const gbTier=g=>{const n=gbCount(g);const t=[...(g.tiers||[])].sort((a,b)=>a.min-b.min);let curT=t[0];t.forEach(x=>{if(n>=x.min)curT=x});return{n,t,cur:curT,next:t.find(x=>x.min>n)}};
S['groupbuys']=()=>{const gs=sortAt(D.groupbuys.filter(g=>g.status!=='closed'));return SCRN({nav:NAVB('Вместе дешевле'),body:gs.length?gs.map(g=>{const t=gbTier(g);return `<button class="card mt2" ${GO('groupbuy',{id:g.id})} style="text-align:left"><b class="s" style="display:block">${esc(g.title)}</b><span class="xs mut">${t.n} ${plural(t.n,'квартира','квартиры','квартир')}, сейчас ${money(t.cur?.price)}, до ${dmy(g.deadline)}</span><div class="mt2">${PR(Math.min(100,t.n/((t.t[t.t.length-1]||{}).min||1)*100))}</div></button>`}).join(''):EMPTY('refresh','Совместных покупок пока нет','ОСИ запускает их перед сезоном: мойка окон, промывка батарей.')})};
S['groupbuy']=p=>{const g=D.groupbuys.find(x=>x.id===p.id);if(!g)return SCRN({nav:NAVB(),body:''});const t=gbTier(g);const joined=myAcks()['gb_'+g.id];const ids=D.acks.filter(a=>a['gb_'+g.id]).map(a=>a.id);const max=(t.t[t.t.length-1]||{}).min||1;
  return SCRN({bcls:'flush',nav:'',body:`<div style="background:var(--deep);color:var(--on-deep);padding:10px var(--pad) 20px"><button class="flex xs b" ${ACT('back')} style="gap:4px;opacity:.85">${I('back',16)}Вместе дешевле, до ${dmy(g.deadline)}</button>
  <div class="h1 mt" style="color:var(--on-deep)">${esc(g.title)}</div><p class="xs" style="opacity:.8">${esc(g.desc||'')}</p>
  <div class="flex mt" style="align-items:baseline;gap:6px"><b style="font-size:34px">${t.n}</b><span class="s" style="opacity:.8">из ${max} квартир уже с нами</span></div></div>
  <div style="padding:16px var(--pad)"><div class="b s">Чем больше квартир, тем дешевле всем</div><div class="mt">${PR(Math.min(100,t.n/max*100),t.next?t.next.min/max*100:0)}</div>
  <div style="display:grid;grid-template-columns:repeat(${t.t.length},1fr);gap:6px" class="mt">${t.t.map(x=>`<div class="opt${x===t.cur?' on':''}" style="margin:0;display:block;padding:8px"><span class="xs ${x===t.cur?'g b':'mut'}" style="display:block">от ${x.min} ${plural(x.min,'квартиры','квартир','квартир')}</span><b class="s">${money(x.price)}</b><span class="xs mut" style="display:block">${x===t.cur?'сейчас':x.min>t.n?'ещё '+(x.min-t.n):''}</span></div>`).join('')}</div>
  <div class="flex mt"><div class="avs">${ids.slice(0,4).map(id=>AVM(id,26)).join('')}</div><span class="xs mut">${ids.slice(0,3).map(nameOf).map(esc).join(', ')}${ids.length>3?' и ещё '+(ids.length-3):''}</span></div>
  <div class="card f flex top-a mt">${I('lock',16)}<span class="xs mut">Оплата только после сбора: ОСИ напишет, когда наберётся минимум, и каждый заплатит по итоговой цене.</span></div></div>`,
  foot:BTN(joined?'Вы участвуете, выйти':'Присоединиться',joined?'s2':'p',ACT('gbjoin',{id:g.id}))+BTN('Позвать соседа, чтобы снизить цену','g',GO('invite'))})};

/* ---------- Сбор на двор ---------- */
S['crowd-list']=()=>{const cs=sortAt(D.crowd.filter(c=>c.status!=='draft'));return SCRN({nav:NAVB('Сбор на двор'),body:cs.length?cs.map(c=>{const s=ackSum('cr_'+c.id);return `<button class="card mt2" ${GO('crowd',{id:c.id})} style="text-align:left"><b class="s" style="display:block">${esc(c.title)}</b><span class="xs mut">${money(s)} из ${money(c.goal)}</span><div class="mt2">${PR(Math.min(100,s/c.goal*100))}</div></button>`}).join(''):EMPTY('tree','Сборов пока нет','Сборы запускает ОСИ только для проектов, одобренных голосованием.')})};
S['crowd']=p=>{const c=D.crowd.find(x=>x.id===p.id);if(!c)return SCRN({nav:NAVB(),body:''});const s=ackSum('cr_'+c.id);const pc=Math.round(s/c.goal*100);const mine=myAcks()['cr_'+c.id];const n=ackCount('cr_'+c.id);const left=Math.max(0,Math.ceil((c.deadline-now())/86400000));
  return SCRN({bcls:'flush',nav:'',body:`<div style="background:var(--mint-soft);height:140px;position:relative;display:grid;place-items:center;color:var(--primary)"><button class="nb" ${ACT('back')} style="position:absolute;left:12px;top:8px;background:var(--surface);color:var(--text);border-radius:50%" aria-label="Назад">${I('back',20)}</button>${c.photo?IMG(c.photo,140,'','position:absolute;inset:0;border-radius:0'):I('tree',48,1.5)}<span style="position:absolute;left:18px;bottom:12px">${BD(c.ballot?'Проект ОСИ, одобрен голосованием':'Проект ОСИ')}</span></div>
  <div style="padding:14px var(--pad)"><h1 class="h1">${esc(c.title)}</h1><p class="s mut">${esc(c.desc||'')}</p>
  <div class="flex mt" style="align-items:baseline;gap:8px"><b style="font-size:26px">${pc}%</b><span class="xs mut">${money(s)} из ${money(c.goal)}</span></div><div class="mt2">${PR(Math.min(100,pc))}</div>
  <div class="xs mut mt2"><b style="color:var(--text)">${n}</b> ${plural(n,'квартира','квартиры','квартир')}, <b style="color:var(--text)">${left}</b> ${plural(left,'день','дня','дней')} осталось</div>
  <div class="card mt rows" style="padding-top:2px;padding-bottom:2px">${RW('Если не соберём','вернём всем','plain')}${RW('Сервисный сбор',(D.settings.crowdFee??5)+'%','plain')}</div>
  ${mine?`<p class="s g b mt">Ваш вклад: ${money(mine)}</p>`:`${LB('Ваш вклад')}${PICK('amt',(c.amounts||[2000,5000,10000]).map(a=>[a,money(a)]),{def:(c.amounts||[2000,5000,10000])[1]})}`}</div>`,
  foot:mine?'':`<p class="fine">${esc(zk()?.payInfo?'Переведите по реквизитам ОСИ, ОСИ подтвердит поступление.':'Реквизиты пришлёт ОСИ.')}</p>${BTN('Поддержать','p',ACT('pledge',{id:c.id}))}`})};

/* ---------- Помощь соседей ---------- */
const TASKK={trash:['Вынести мусор','trash'],dog:['Выгулять собаку','paw'],shop:['Принести покупки','bag'],other:['Другое','userplus']};
S['help']=()=>{const open=sortAt(D.tasks.filter(t=>t.status==='open'&&t.by!==C.uid));const mine=sortAt(D.tasks.filter(t=>(t.by===C.uid||t.taker===C.uid)&&t.status!=='paid'&&t.status!=='cancelled'));
  const helpers=D.members.filter(m=>m.helper?.on&&m.id!==C.uid);
  return SCRN({nav:NAVB(),body:`<h1 class="h1">Помощь от соседей</h1><p class="sub">Мелкие дела за небольшие деньги. Делают соседи, подростки только с согласия родителей.</p>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px" class="mt">${Object.entries(TASKK).map(([k,[l,ic]])=>`<button class="opt${(F.k||'trash')===k?' on':''}" style="margin:0;display:grid;justify-items:center;gap:4px;padding:10px 2px;text-align:center" ${ACT('pick',{f:'k',v:k})}>${I(ic,20)}<b class="xs">${l}</b></button>`).join('')}</div>
  ${LB('Когда')}${FIN('when','Сегодня, 20:00–21:00',{max:40})}${LB('Откуда / подробности')}${FIN('where','Кв. 34, пакет у двери',{max:80})}${LB('Вознаграждение, ₸')}${FIN('reward','500',{mode:'numeric',max:6})}
  <div class="mt">${BTN('Опубликовать задачу','p',ACT('newtask'))}</div>
  ${mine.length?`${LB('Мои задачи')}${mine.map(t=>`<button class="sel-row" ${GO('task',{id:t.id})}><span>${esc(TASKK[t.kind]?.[0]||t.kind)}, ${esc(t.when)}</span><span class="status ${t.status==='open'?'new':'ok'}">${{open:'Ищем',taken:'Взято',done:'Сделано'}[t.status]||t.status}</span></button>`).join('')}`:''}
  ${LB('Ждут помощи')}${open.length?open.map(t=>`<button class="sel-row" ${GO('task',{id:t.id})}><span><b class="s" style="display:block;font-weight:500">${esc(TASKK[t.kind]?.[0])}, ${money(t.reward)}</b><span class="xs mut">${esc(t.when)}, ${esc(whoOf(t.by))}</span></span>${I('fwd',16)}</button>`).join(''):`<p class="s mut">Сейчас никто не просит помощи.</p>`}
  ${LB('Готовы помогать')}${helpers.length?helpers.map(h=>`<div class="card flex mt2">${AVM(h.id,36)}<span><b class="s" style="display:block">${esc(h.name)}${h.helper.age?', '+esc(h.helper.age)+' лет':''}</b><span class="xs mut">${h.entrance} подъезд${h.helper.age&&h.helper.age<18?(h.helper.consent?', согласие родителей есть':', нужно согласие родителей'):''}</span></span></div>`).join(''):`<p class="s mut">Станьте первым помощником в настройках аккаунта.</p>`}`})};
S['task']=p=>{const t=D.tasks.find(x=>x.id===p.id);if(!t)return SCRN({nav:NAVB(),body:''});const mine=t.by===C.uid,taker=t.taker===C.uid;const hm2=me()?.helper;
  return SCRN({nav:NAVB(),body:`${t.status==='done'||t.status==='paid'?BD('Выполнено'+(t.doneAt?' в '+hm(t.doneAt):''),'m'):BD({open:'Ищем помощника',taken:'Взято'}[t.status]||t.status,'wa')}
  <h1 class="h1 mt2">${t.status==='done'||t.status==='paid'?esc(nameOf(t.taker))+': '+esc(TASKK[t.kind]?.[0].toLowerCase()):esc(TASKK[t.kind]?.[0])}</h1>
  <div class="card rows mt" style="padding-top:2px;padding-bottom:2px">${RW('Когда',esc(t.when))}${RW('Откуда',esc(t.where))}${RW('Вознаграждение',money(t.reward))}${RW('Просит',esc(whoOf(t.by)))}${t.taker?RW('Помогает',esc(whoOf(t.taker))):''}</div>
  ${t.photo?`<div class="mt">${IMG(t.photo,180)}<p class="xs mut mt2">Фото-подтверждение</p></div>`:''}
  ${mine&&t.status==='done'?`<div class="card mt"><div class="lbl" style="margin-top:0">Чаевые</div>${SEGF('tip',[['0','Без'],['10','10%'],['15','15%']],{def:'10'})}<p class="xs mut mt2">Итого ${money(Math.round(t.reward*(1+Number(F.tip??10)/100)))}. Передайте наличными или переводом.</p></div><div class="card mt2 flex"><span class="grow"><b class="s" style="display:block">Каждый вечер с ${esc(nameOf(t.taker))}</b><span class="xs mut">Повторять задачу ежедневно</span></span>${CHK(t.repeat,ACT('taskrepeat',{id:t.id}))}</div>`:''}`,
  foot:mine?(t.status==='open'?BTN('Отменить задачу','d',ACT('taskst',{id:t.id,v:'cancelled'})):t.status==='done'?BTN('Я рассчитался','p',ACT('taskpaid',{id:t.id})):t.status==='taken'?BTN('Написать помощнику','o',ACT('dm',{id:t.taker})):'')
   :taker?(t.status==='taken'?BTN('Сделано, добавить фото','p',ACT('taskdone',{id:t.id}),'camera'):'')
   :t.status==='open'?(hm2?.on&&(!(hm2.age<18)||hm2.consent)?BTN('Возьму задачу','p',ACT('tasktake',{id:t.id})):`<p class="fine">Чтобы брать задачи, включите «Готов помогать соседям» в настройках${hm2?.age<18?' и подтвердите согласие родителей':''}.</p>${BTN('Открыть настройки','o',GO('settings'))}`):''})};

/* ---------- Бизнес соседей ---------- */
S['biz-list']=()=>{const bs=D.biz.filter(b=>b.status==='approved');const my=D.biz.find(b=>b.owner===C.uid);
  return SCRN({nav:NAVB('Бизнес соседей'),body:`${bs.length?bs.map(b=>`<button class="card flex mt2" ${GO('biz',{id:b.id})}>${b.photo?`<div class="img" style="width:52px;height:52px;flex:none;background-image:url('${blob(b.photo)}')"></div>`:TL('cake','pe',52)}<span class="grow"><b class="s" style="display:block">${esc(b.name)}</b><span class="xs mut">${esc(b.desc||'')}</span></span></button>`).join(''):EMPTY('cake','Пока никого','Выпечка, репетиторы, ремонт техники: соседям удобно заказывать у соседей.')}`,
  foot:BTN(my?'Мой бизнес-профиль':'Рассказать о своём деле',my?'o':'p',GO('biz-edit'))})};
S['biz']=p=>{const b=D.biz.find(x=>x.id===p.id);if(!b)return SCRN({nav:NAVB(),body:''});const orders=D.orders.filter(o=>o.type==='biz'&&o.ref===b.id).length;const cart=F.cart||{};const total=(b.products||[]).reduce((s,x,i)=>s+(cart[i]||0)*Number(x.p||0),0);
  return SCRN({bcls:'flush',nav:'',body:`<div style="background:var(--peach);height:140px;position:relative;display:grid;place-items:center;color:var(--av-ink)"><button class="nb" ${ACT('back')} style="position:absolute;left:12px;top:8px;background:var(--surface);color:var(--text);border-radius:50%;z-index:1" aria-label="Назад">${I('back',20)}</button>${b.photo?IMG(b.photo,140,'','position:absolute;inset:0;border-radius:0'):I('cake',48,1.5)}</div>
  <div style="padding:0 var(--pad) 16px"><div class="card" style="margin-top:-24px;position:relative;border:0;box-shadow:var(--shadow)"><div class="flex between top-a"><div class="h2">${esc(b.name)}</div>${BD('Бизнес соседа')}</div>
  <div class="badges mt2">${BD(b.entrance+' подъезд, кв. скрыта','m')}${orders?BD('Заказывали '+orders+' '+plural(orders,'раз','раза','раз')):''}${b.pickup?BD(esc(b.pickup)):''}</div><p class="s mut mt2">${esc(b.desc||'')}</p></div>
  ${LB('Можно заказать')}<div class="two">${(b.products||[]).map((x,i)=>`<div>${x.photo?IMG(x.photo,90):PH('cake',90,i%2?'sa':'pe')}<b class="s" style="display:block;margin-top:6px">${esc(x.t)}</b><span class="flex between"><span class="xs mut">${money(x.p)}</span><span class="flex" style="gap:6px"><button class="bm" ${ACT('cart',{v:i,d:-1})} aria-label="Меньше">−</button><b class="s">${cart[i]||0}</b><button class="bm on" ${ACT('cart',{v:i,d:1})} aria-label="Больше">+</button></span></span></div>`).join('')}</div></div>`,
  foot:`<div class="flex between"><span class="flex">${AVM(b.owner,40)}<span><b class="s" style="display:block">${esc(nameOf(b.owner))}</b><span class="xs mut">${total?money(total):'Выберите позиции'}</span></span></span><span class="flex" style="gap:10px"><button class="rfab g" ${ACT('dm',{id:b.owner})} aria-label="Написать">${I('chat',20)}</button><button class="rfab o" ${ACT('bizorder',{id:b.id,total})} aria-label="Заказать" ${total?'':'disabled style="opacity:.4"'}>${I('bag',20)}</button></span></div>`})};
S['biz-edit']=()=>{const b=D.biz.find(x=>x.owner===C.uid)||{};if(F.init!==1){F.init=1;F.name=b.name||'';F.desc=b.desc||'';F.pickup=b.pickup||'';F.prods=(b.products||[]).map(x=>({...x}));if(!F.prods.length)F.prods=[{t:'',p:''}]}
  return SCRN({nav:NAVB('Бизнес-профиль'),body:`${b.status?`<div class="note-box">Статус: ${{pending:'на проверке у модератора',approved:'опубликован',hidden:'скрыт модератором'}[b.status]}. Размещение платное по тарифу Тредо, модератор свяжется.</div>`:`<p class="sub">Профиль увидят все соседи ЖК. После проверки модератор свяжется насчёт тарифа размещения.</p>`}
  ${LB('Название')}${FIN('name','Домашняя выпечка',{max:40})}${LB('Описание')}${FIN('desc','Торты и баурсаки на заказ',{max:120})}${LB('Как забрать')}${FIN('pickup','Самовывоз у подъезда',{max:40})}
  ${LB('Позиции')}${F.prods.map((x,i)=>`<div class="two mt2"><input class="inp" data-f="pt${i}" value="${esc(F['pt'+i]??x.t)}" placeholder="Медовик, 1 кг" maxlength="40"><input class="inp" data-f="pp${i}" value="${esc(F['pp'+i]??x.p)}" placeholder="Цена, ₸" inputmode="numeric" maxlength="7"></div>`).join('')}
  <button class="inp mt2 wfull g s center" style="border-style:dashed" ${ACT('addprod')}>+ Позиция</button>`,foot:BTN('Сохранить и отправить на проверку','p',ACT('savebiz'))})};

/* ---------- Неделя в ЖК ---------- */
S['digest']=()=>{const wk=now()-7*86400000;const nm=D.members.filter(m=>(m.joinedAt||0)>wk).length;const given=D.posts.filter(p=>p.kind==='giveaway'&&p.status==='given'&&(p.closedAt||0)>wk).length;
  const next=[...D.outages.filter(o=>o.start>now()&&o.start<now()+7*86400000),...D.events.filter(e=>e.date>now()&&e.date<now()+7*86400000).map(e=>({start:e.date,title:e.title}))].sort((a,b)=>a.start-b.start);
  const hot=sortAt(D.posts.filter(p=>p.at>wk)).sort((a,b)=>ccount(b.id)+tally(b).total-(ccount(a.id)+tally(a).total))[0];const sp=D.settings.sponsor;
  return SCRN({nav:NAVB(`<span class="xs mut b">${wdmy(now())}</span>`,{l:1}),body:`<h1 class="h1 xl">Неделя в ${esc(zk()?.name)}</h1>
  <div class="stats two mt">${STAT('+'+nm,plural(nm,'новый сосед','новых соседа','новых соседей'),'dp')}${STAT(given,plural(given,'вещь отдали','вещи отдали','вещей отдали')+' даром','wa')}</div>
  <div class="card mt2"><div class="b s">На этой неделе</div>${next.length?next.map(x=>`<div class="flex top-a mt s"><b class="g" style="width:24px">${WD[new Date(x.start).getDay()]}</b><span>${esc(x.title)}${x.end?', '+hm(x.start)+'–'+hm(x.end):''}</span></div>`).join(''):'<p class="s mut mt2">Отключений и событий не запланировано.</p>'}</div>
  ${hot?`<button class="card mt2" ${GO('post',{id:hot.id})} style="text-align:left"><span class="xs mut">Самое обсуждаемое</span><b style="display:block" class="mt2">${esc(hot.title)}</b><span class="xs mut">${ccount(hot.id)} ${plural(ccount(hot.id),'ответ','ответа','ответов')}${hot.kind==='poll'?', '+tally(hot).total+' голосов':''}</span></button>`:''}
  ${sp?.on?`<div class="card dash mt2 flex top-a"><span class="tile f" style="width:40px;height:40px;font-size:9px;font-weight:700">${sp.logo?`<img src="${blob(sp.logo)}" alt="" style="width:40px;height:40px;border-radius:12px;object-fit:cover">`:'ЛОГО'}</span><span><span class="xs mut" style="display:block">Партнёр недели</span><b class="s">${esc(sp.text)}</b></span></div>`:''}`,
  foot:BTN('Открыть ленту дома','p',ACT('tab',{v:'home'}))})};

/* ---------- Ремонт: лиды ---------- */
S['leads']=()=>{const ls=sortAt(D.leads.filter(l=>l.by===C.uid));return SCRN({nav:NAVB('Ремонт под ключ'),body:`<p class="sub">Опишите задачу, и подрядчики, которые уже работали в ${esc(zk()?.name)}, пришлют предложения.</p>
  ${ls.map(l=>`<button class="sel-row" ${GO('lead',{id:l.id})}><span><b class="s" style="display:block;font-weight:500">${esc(l.kind)}${l.size?', '+esc(l.size):''}</b><span class="xs mut">${D.offers.filter(o=>o.lead===l.id).length} предложений</span></span>${I('fwd',16)}</button>`).join('')}
  ${LB('Новая задача')}${PICK('kind',['Остекление балкона','Ремонт квартиры','Кухня','Сантехника','Полы'].map(x=>[x,x]),{def:'Остекление балкона'})}
  ${LB('Размер')}${FIN('size','6,2 м',{max:30})}${LB('Подробности')}${FTA('desc','Тёплое остекление, хочу до зимы',{max:500})}`,
  foot:BTN('Получить предложения','p',ACT('newlead'))})};
S['lead']=p=>{const l=D.leads.find(x=>x.id===p.id);if(!l)return SCRN({nav:NAVB(),body:''});const os=D.offers.filter(o=>o.lead===l.id);
  return SCRN({nav:NAVB(),body:`<div class="xs mut b">${esc(l.kind)}${l.size?', '+esc(l.size):''}</div><h1 class="h1">${os.length?os.length+' '+plural(os.length,'предложение','предложения','предложений'):'Ждём предложений'}</h1>
  ${os.length?os.map(o=>`<div class="opt${l.chosen===o.id?' on':''}" style="display:block"><span class="flex between"><b class="s">${esc(o.company)}</b>${o.popular?BD('Чаще выбирают соседи','m'):''}</span><span class="xs mut" style="display:block;margin-top:4px"><b style="color:var(--text)">${money(o.price)}</b>, ${esc(o.days)} ${plural(Number(o.days)||0,'день','дня','дней')}, ${esc(o.works||0)} квартир в ЖК</span>${o.note?`<p class="xs mt2">${esc(o.note)}</p>`:''}${l.chosen===o.id?`<p class="xs g b mt2">Вы позвали на замер</p>`:`<button class="btn p sm2 mt2" ${ACT('chooseoffer',{id:l.id,v:o.id})}>Позвать на замер</button>`}</div>`).join(''):`<p class="s mut mt">Обычно первые предложения приходят в течение дня.</p>`}`})};

/* ---------- Парковка ---------- */
S['parking']=()=>{const tab=F.pt||'rent';const ls=sortAt(D.parking.filter(x=>x.status==='active'));const mine=D.parking.filter(x=>x.by===C.uid);
  return SCRN({nav:NAVB(),body:`<h1 class="h1">Парковка</h1>${SEGF('pt',[['rent','Снять место'],['give','Сдать своё']],{def:'rent'})}
  ${tab==='rent'?(ls.filter(x=>x.by!==C.uid).length?ls.filter(x=>x.by!==C.uid).map(x=>`<div class="card mt2"><div class="flex between"><b>Место ${esc(x.spot)}${x.level?', '+esc(x.level):''}</b><b>${money(x.price)}/день</b></div><p class="xs mut mt2">Свободно ${esc(x.from)} – ${esc(x.to)}. Сдаёт ${esc(whoOf(x.by))}.</p>${x.renter===C.uid?`<p class="xs g b mt2">Вы арендуете это место</p>`:x.renter?`<p class="xs mut mt2">Уже занято</p>`:`<div class="mt2">${BTN('Снять','p sm',ACT('rentspot',{id:x.id}))}</div>`}</div>`).join(''):`<div class="mt">${EMPTY('park','Свободных мест нет','Соседи сдают места, когда уезжают.')}</div>`)
  :`${mine.map(x=>`<div class="card mt2"><div class="flex between"><b>Место ${esc(x.spot)}</b><span class="status ${x.renter?'ok':''}">${x.renter?'Сдано':'Ищем'}</span></div><p class="xs mut mt2">${esc(x.from)} – ${esc(x.to)}, ${money(x.price)}/день${x.renter?', арендатор: '+esc(whoOf(x.renter)):''}</p><button class="link s mt2" ${ACT('unspot',{id:x.id})}>Снять с публикации</button></div>`).join('')}
   ${LB('Номер места')}${FIN('spot','87',{max:10})}${LB('Уровень')}${FIN('level','Паркинг, −1',{max:30})}<div class="two">${`<div>${LB('С')}${FIN('from','1 ноября',{max:20})}</div><div>${LB('По')}${FIN('to','14 ноября',{max:20})}</div>`}</div>${LB('Цена за день, ₸')}${FIN('price','1 500',{mode:'numeric',max:6})}
   <div class="mt">${BTN('Сдать место','p',ACT('newspot'))}</div>`}
  <p class="xs mut mt">Сервисный сбор Тредо ${D.settings.parkFee??10}%. Оплата переводом, модератор подтверждает.</p>`})};

/* ---------- Новоселье ---------- */
const NEWHOME=[['dom','Домофон и шлагбаум в телефоне'],['meters','Начальные показания счётчиков'],['chat','Написать в чат подъезда'],['net','Подключить интернет'],['warranty','Гарантийные замечания застройщику']];
S['newhome']=()=>{const nh=D.profile?.newhome||{};const done=NEWHOME.filter(([k])=>nh[k]).length;const z=zk();
  return SCRN({nav:NAVB(),body:`<div class="flex xs mut b">${LOGO(18)}${z?.developer?'От застройщика '+esc(z.developer):'Соседи'}</div>
  <h1 class="h1 mt">С новосельем, кв. ${esc(me().apt)}</h1><div class="xs mut">${done} из ${NEWHOME.length} шагов</div><div class="mt2">${PR(done/NEWHOME.length*100)}</div>
  <div class="card mt">${NEWHOME.map(([k,l],i)=>`<div class="flex s ${i?'mt':''}">${CHK(nh[k],ACT('nh',{v:k}))}<span class="grow">${l}</span>${k==='meters'?`<button class="link xs" ${GO('passport')}>Внести</button>`:k==='chat'?`<button class="link xs" ${GO('chat',{id:'e'+me().entrance})}>Открыть</button>`:k==='dom'?`<button class="link xs" ${GO('access')}>Открыть</button>`:''}</div>`).join('')}</div>
  <div class="card wa mt2"><div class="xs w b">Гарантия застройщика${z?.warranty?' '+esc(z.warranty):''}</div><p class="s mt2">Нашли трещину или продувает окно? Сфотографируйте и отправьте: заявка уйдёт в ОСИ и застройщику.</p></div>`,
  foot:BTN('Сообщить о замечании','p',GO('osi-new',{v:'Гарантия застройщику'}),'camera')})};

/* ---------- Доступ и гостевые пропуска ---------- */
S['access']=()=>{const z=zk();const passes=sortAt(D.passes.filter(p=>p.by===C.uid&&p.status==='active'&&p.to>now()));
  return SCRN({cls:'night',nav:NAVB(''),body:`<h1 class="h1 xl" style="color:var(--on-deep)">Доступ</h1><div class="xs mut">${esc(z?.name)}, ${me().entrance} подъезд</div>
  <div class="nc mt"><div class="flex between"><span><b style="font-size:17px;display:block">Домофон, шлагбаум, камеры</b><span class="xs mut">${z?.access?.vendor?'Подключено: '+esc(z.access.vendor):'Интеграция с оборудованием ЖК ещё не подключена'}</span></span><span class="unlock">${I('lock',24)}</span></div>
  <p class="xs mut mt">Открывать двери из приложения можно будет после подключения домофонной компании ЖК. Пропуска для гостей уже работают: охрана видит их в кабинете ОСИ.</p></div>
  ${LB('Активные пропуска').replace('class="lbl','style="color:var(--on-deep-2)" class="lbl')}${passes.length?passes.map(p=>`<button class="nc flex between mt2 wfull" ${GO('guest',{id:p.id})} style="text-align:left"><span><b class="s" style="display:block">${esc(p.name)}</b><span class="xs mut">${dmy(p.from)}, ${hm(p.from)}–${hm(p.to)}, ${esc(p.place)}</span></span>${I('fwd',16)}</button>`).join(''):'<p class="s mut">Пропусков нет.</p>'}`,
  foot:BTN('Пропуск для гостя или курьера','lt',GO('guest-new'),'userplus')})};
S['guest-new']=()=>SCRN({nav:NAVB('Гостевой пропуск'),body:`${LB('Кто придёт','first')}${FIN('name','Мама, в гости',{max:40})}
  ${LB('Когда')}${PICK('day',[['0','Сегодня'],['1','Завтра'],['2','Послезавтра']],{def:'0'})}<div class="two">${`<div>${LB('С')}${FIN('from','14:00',{max:5})}</div><div>${LB('До')}${FIN('to','20:00',{max:5})}</div>`}</div>
  ${LB('Куда')}${PICK('place',[['Калитка','Калитка'],['Шлагбаум (на машине)','Шлагбаум'],[me().entrance+' подъезд',me().entrance+' подъезд']],{def:'Калитка'})}
  ${F.place==='Шлагбаум (на машине)'?`${LB('Номер машины гостя')}${FIN('plate','123 ABC 02',{max:12})}`:''}`,foot:BTN('Создать пропуск','p',ACT('newpass'))});
S['guest']=p=>{const g=D.passes.find(x=>x.id===p.id);if(!g)return SCRN({nav:NAVB(),body:''});const active=g.status==='active'&&g.to>now();
  return SCRN({nav:NAVB(),body:`<div class="card dp" style="padding:16px"><div class="flex between"><span class="xs mut b">Пропуск, ${esc(zk()?.name)}</span>${BD(active?'Активен':g.status==='revoked'?'Отозван':'Истёк',active?'m':'')}</div>
  <div class="h1" style="color:var(--on-deep)">${esc(g.name)}</div><div class="two mt2"><div><span class="xs mut" style="display:block">Когда</span><b class="s">${dmy(g.from)}, ${hm(g.from)}–${hm(g.to)}</b></div><div><span class="xs mut" style="display:block">Куда</span><b class="s">${esc(g.place)}${g.plate?', '+esc(g.plate):''}</b></div></div>
  <div class="center mt"><div class="qrwrap" style="width:160px">${QRSVG('SOSEDI-PASS:'+ZID+':'+g.id+':'+g.code)}</div><p class="xs mt2">Код для охраны: <b>${esc(g.code)}</b></p></div></div>
  <p class="xs mut mt">Охрана проверяет код в кабинете ОСИ. Автоматическое открытие появится после подключения домофона.</p>`,
  foot:active?`<div class="two">${BTN('Отозвать','d',ACT('revokepass',{id:g.id}))}${BTN('Отправить гостю','p',ACT('sharepass',{id:g.id}),'send')}</div>`:''})};

/* ---------- Лавка в доме ---------- */
S['shop']=()=>{const items=D.shop.filter(x=>x.on!==false);const cats=[...new Set(items.map(x=>x.cat))];const c=F.cat||cats[0];const cart=F.cart||{};const total=items.reduce((s,x)=>s+(cart[x.id]||0)*Number(x.price||0),0);const n=Object.values(cart).reduce((a,b)=>a+b,0);
  if(!items.length)return SCRN({nav:NAVB('Лавка в доме'),body:EMPTY('box','Лавка пока не открыта','Ассортимент и доставку внутри ЖК настраивает модератор Тредо вместе с партнёром.')});
  return SCRN({nav:NAVB(),body:`<div class="flex between top-a"><h1 class="h1" style="margin:0">Лавка в доме</h1>${BD(esc(D.settings.shopEta||'≈ 15 мин до двери'),'m')}</div><p class="sub mt2">${esc(D.settings.shopInfo||'Курьер поднимется к двери')}</p>
  <div class="mt">${PICK('cat',cats.map(x=>[x,x]),{def:c,scroll:1})}</div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px" class="mt">${items.filter(x=>x.cat===(F.cat||c)).map(x=>`<div class="card" style="padding:8px">${x.photo?IMG(x.photo,62):PH('bag',62,'sa')}<b class="xs" style="display:block;margin-top:6px;line-height:1.25;min-height:30px">${esc(x.name)}</b><span class="flex between mt2"><b class="xs">${money(x.price)}</b><button class="av" style="--s:26px;background:var(--primary);color:var(--on-primary)" ${ACT('scart',{id:x.id})} aria-label="Добавить">${cart[x.id]?`<b class="xs">${cart[x.id]}</b>`:I('plus',14,2.4)}</button></span></div>`).join('')}</div>
  <div class="card f flex top-a mt">${CHK(F.parcel,ACT('togf',{f:'parcel'}))}<span class="xs">Захватить вашу посылку из пункта выдачи у шлагбаума. <b>Бесплатно в этом заказе</b></span></div>`,
  foot:n?`<div class="card dp flex between" style="padding:10px 12px"><span><b class="s" style="display:block">${n} ${plural(n,'товар','товара','товаров')}, ${money(total)}</b><span class="xs mut">доставка внутри ЖК бесплатно</span></span><button class="btn lt sm2" ${ACT('shoporder',{total})}>Заказать</button></div>`:''})};

/* ---------- Витрина ЖК ---------- */
S['showcase']=()=>{const pub=D.publicZk;const url=appUrl('showcase-'+ZID);
  return SCRN({nav:NAVB('Витрина ЖК'),body:`<p class="sub">Публичная страница ЖК для тех, кто выбирает жильё: оценки жителей из опросов и скорость работы ОСИ. Без имён и квартир.</p>
  ${pub?showcaseCard(pub):`<div class="note-box mt">Витрину публикует председатель ОСИ в кабинете.</div>`}`,
  foot:pub?BTN('Поделиться ссылкой','p',ACT('shareurl',{url,t:'ЖК «'+(zk()?.name||'')+'» глазами жителей'}),'share'):''})};
function showcaseCard(p){return `<div class="card mt"><div class="xs mut">${esc(p.city||'')}${p.district?', '+esc(p.district):''}, ${esc(p.entrances||'')} подъездов${p.year?', '+esc(p.year):''}</div><div class="h2 mt2">${esc(p.name)} глазами жителей</div>
  ${(p.ratings||[]).length?`<div class="mt">${p.ratings.map(r=>`<div class="flex s mt2"><span style="width:110px">${esc(r.t)}</span><span class="grow">${PR(r.v*20,0,r.v<3?'wa':'')}</span><b style="width:30px;text-align:right">${String(r.v).replace('.',',')}</b></div>`).join('')}</div>`:''}
  <div class="stats two mt">${STAT(esc(p.solved??0),'заявок решено за год','dp')}${STAT(esc(p.avgDays??'—')+' дня','среднее время решения')}</div>
  ${p.quote?`<div class="card f mt2"><p class="s">«${esc(p.quote)}»</p><p class="xs mut3 mt2">Житель, подтверждённый адрес</p></div>`:''}<p class="xs mut3 mt2">Обновлено ${p.at?dmy(p.at):''}</p></div>`}

/* ---------- Переезд ---------- */
S['moving']=()=>{const others=D.zks.filter(z=>z.id!==ZID&&z.status==='active');const t=D.zks.find(z=>z.id===F.to);
  return SCRN({nav:NAVB(),body:`<h1 class="h1">Переезжаете?</h1>
  ${LB('Новый ЖК')}${others.length?FSEL('to',[['','Выберите ЖК'],...others.map(z=>[z.id,'ЖК «'+z.name+'», '+cityName(z)])]):`<p class="s mut">Других подключённых ЖК пока нет. <button class="link s" ${GO('ob-wait')}>Предложить свой</button></p>`}
  ${t?`<div class="card m mt"><p class="xs"><b>${esc(t.name)} уже в приложении.</b> Вы попадёте в чат своего нового подъезда и увидите мастеров с отзывами.</p></div>`:''}
  ${LB('Что переедет с вами')}<div class="card rows" style="padding-top:2px;padding-bottom:2px">${RW('Номера авто',esc((me().platesShow||[]).join(', ')||'нет'),'plain')}${RW('Паспорт квартиры и мастера','остаётся в вашем аккаунте','plain')}${RW('Уровень доверия','пересчитается в новом ЖК','plain')}</div>
  ${LB('Новым жильцам кв. '+esc(me().apt))}<div class="card f s">Создайте приглашение для новых жильцов: адрес подтвердится сам.<div class="mt2">${BTN('Создать приглашение','o sm',ACT('newinvite',{share:1}))}</div></div>`,
  foot:t?BTN('Переехать в '+esc(t.name),'p',ACT('move')):''})};

/* ---------- Аккаунт ---------- */
function trust(){const m=me();const inv=D.invites.filter(i=>i.from===C.uid&&i.usedBy).length;const ans=D.comments.filter(c=>c.by===C.uid&&D.posts.find(p=>p.id===c.post&&p.kind==='question'&&p.author!==C.uid)).length;
  const gave=D.posts.filter(p=>p.author===C.uid&&p.kind==='giveaway'&&p.status==='given').length;const helped=D.tasks.filter(t=>t.taker===C.uid&&(t.status==='done'||t.status==='paid')).length;
  const steps=[['Адрес подтверждён',!!m.verified],['Номер авто добавлен',(m.plates||[]).length>0],['Позвали соседа',inv>0],['Ответили на 3 вопроса соседей',ans>=3,ans+'/3'],['Помогли соседу или отдали вещь',helped+gave>0]];
  const lvl=steps.filter(s=>s[1]).length;return{steps,lvl,inv,ans,gave,helped}}
const LVLN=['Новичок','Сосед','Надёжный сосед','Активный сосед','Опора подъезда','Душа дома'];
S['me']=()=>{const m=me();const t=trust();const nextI=t.steps.findIndex(s=>!s[1]);const mm=D.masters.find(x=>x.ownerUid===C.uid);
  const L=(ic,tx,r,p={},extra='')=>`<button class="sel-row" ${GO(r,p)}><span class="flex">${TL(ic,'f',32)}${tx}</span><span class="flex" style="gap:6px">${extra}${I('fwd',16)}</span></button>`;
  return SCRN({nav:`<div class="nav"><span></span><span></span><button class="nb mut" ${GO('settings')} aria-label="Настройки">${I('gear',24)}</button></div>`,body:`
  <div class="center"><span style="display:inline-block;padding:3px;border-radius:50%;background:conic-gradient(var(--primary) ${t.lvl*20}%,var(--line) 0)"><span style="display:block;padding:2px;border-radius:50%;background:var(--surface)">${AVM(C.uid,70)}</span></span>
  <div class="flex mt2" style="justify-content:center;gap:8px"><span class="h2">${esc(m.name)}</span><button ${GO('settings')} aria-label="Изменить">${I('pen',18)}</button></div><div class="s mut">${m.entrance} подъезд, с ${MON[new Date(m.joinedAt||now()).getMonth()]}</div><div class="mt2">${BD(LVLN[t.lvl]+', '+t.lvl+' из 5','dp')}</div></div>
  <div class="stats mt">${STAT(t.ans+t.helped,'раз помогли')}${STAT(t.gave,plural(t.gave,'вещь отдали','вещи отдали','вещей отдали'))}${STAT(t.inv,plural(t.inv,'соседа позвали','соседей позвали','соседей позвали'))}</div>
  ${nextI>=0?`<div class="card mt"><div class="b s">До уровня ${t.lvl+1} «${LVLN[t.lvl+1]}»</div>${t.steps.map(([l,ok,x])=>`<div class="flex mt2 s">${CHK(ok,'tabindex="-1"')}<span class="grow">${l}</span>${x&&!ok?`<b class="xs">${x}</b>`:''}</div>`).join('')}</div>`:''}
  ${LB('Моё')}${isOsi()?`<button class="sel-row" ${ACT('mode',{v:'osi'})}><span class="flex">${TL('building','m',32)}<b style="font-weight:600">Кабинет председателя ОСИ</b></span>${I('fwd',16)}</button>`:''}${C.admin?`<button class="sel-row" ${ACT('mode',{v:'admin'})}><span class="flex">${TL('flag','m',32)}<b style="font-weight:600">Модерация Тредо</b></span>${I('fwd',16)}</button>`:''}${L('bag','Мои публикации','my-posts')}${L('building','Заявки в ОСИ','osi-list')}${L('wrench','Заявки мастерам','my-jobs')}${mm?L('wrench','Заявки ко мне как к мастеру','master-jobs'):''}${L('home','Квартира: счётчики и гарантии','passport')}${L('gift','Новоселье','newhome')}${L('userplus','Позвать соседей','invite','',`<span class="xs g b">${Math.max(0,credits())} подн.</span>`)}${L('cake','Мой бизнес','biz-edit')}${L('refresh','Переезд','moving')}`,tab:3})};
S['my-jobs']=()=>{const js=sortAt(D.jobs.filter(j=>j.from===C.uid));return SCRN({nav:NAVB('Заявки мастерам'),body:js.length?js.map(j=>`<button class="sel-row" ${GO('job',{id:j.id})}><span><b class="s" style="display:block;font-weight:500">${esc(j.what)}</b><span class="xs mut">${esc(D.masters.find(x=>x.id===j.master)?.name||'')}, ${rel(j.at)}</span></span><span class="status ${j.status==='sent'?'new':j.status==='cancelled'?'bad':'ok'}">${JOBST[j.status]}</span></button>`).join(''):EMPTY('wrench','Заявок нет','',BTN('Найти мастера','p sm',GO('masters')))})};
S['settings']=()=>{const m=me();if(F.init!==1){F.init=1;F.name=m.name;F.house=m.house||'';F.apt=m.apt;F.area=m.area||'';F.ent=m.entrance;F.notify=m.notifyCar!==false;F.helper=!!m.helper?.on;F.age=m.helper?.age||'';F.consent=!!m.helper?.consent}
  const ents=Array.from({length:zk()?.entrances||1},(_,i)=>[i+1,i+1+' подъезд']);
  return SCRN({nav:NAVB('Настройки'),body:`
  ${LB('Имя','first')}${FIN('name','Имя',{max:40})}
  ${LB('Номер дома')}${(zk()?.houses||[]).length?PICK('house',zk().houses.map(h=>[h,'Дом '+h]),{def:m.house}):FIN('house','130',{max:10})}
  <div class="two"><div>${LB('Подъезд')}${FSEL('ent',ents)}</div><div>${LB('Квартира')}${FIN('apt','',{max:6})}</div></div>
  ${LB('Площадь квартиры, м²')}${FIN('area','68',{mode:'decimal',max:6})}
  ${String(F.ent)!==String(m.entrance)||String(F.apt)!==String(m.apt)||String(F.house??'')!==String(m.house||'')?`<div class="err-box mt2">После смены адреса его нужно подтвердить заново кодом нового подъезда.</div>`:''}
  ${LB('Машины')}${(m.platesShow||[]).map((p,i)=>`<div class="row plain"><span>${PS(esc(p))}</span><button class="link s" ${ACT('rmplate',{v:i})}>Удалить</button></div>`).join('')}
  <div class="flex mt2"><input class="inp" data-f="plate" value="${esc(F.plate||'')}" placeholder="Добавить номер: 123 ABC 02" maxlength="12"><button class="btn o sm2" ${ACT('saveplate',{next:''})}>Добавить</button></div>
  <div class="flex between s mt">Сообщать, если моя машина мешает${CHK(F.notify,ACT('togf',{f:'notify'}))}</div>
  ${LB('Помощь соседям')}<div class="flex between s">Готов помогать за вознаграждение${CHK(F.helper,ACT('togf',{f:'helper'}))}</div>
  ${F.helper?`<div class="two mt2"><div>${LB('Возраст')}${FIN('age','16',{mode:'numeric',max:2})}</div><div></div></div>${Number(F.age)>0&&Number(F.age)<18?`<div class="flex between s mt2"><span class="grow">Родитель разрешил и знает о задачах</span>${CHK(F.consent,ACT('togf',{f:'consent'}))}</div>`:''}`:''}
  ${LB('Что видят соседи')}<div class="note-box">Имя и подъезд. Номер квартиры видят только ОСИ и мастер после принятия заявки. Номер машины не показывается, по нему только приходят сообщения.</div>
  ${LB('Аккаунт')}<button class="sel-row" ${ACT('leavezk2')}><span class="r">Выйти из ЖК</span>${I('logout',18)}</button>`,
  foot:BTN('Сохранить','p',ACT('savesettings'))})};

