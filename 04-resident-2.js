/* =====================================================================
   Приложение жителя, часть 2
   ===================================================================== */
const JOBST={sent:'Отправлена',accepted:'Мастер принял',done:'Работа выполнена',cancelled:'Отменена'};
const OSIST={new:'Принята ОСИ',assigned:'Назначен исполнитель',progress:'В работе',done:'Выполнена, подтвердите',closed:'Закрыта',reopened:'Вернули в работу'};
const REASONS=['Перекрыли выезд','Горят фары','Открыто окно','Сработала сигнализация','Стоит на газоне'];

/* ---------- Кто перекрыл авто ---------- */
S['car-search']=()=>SCRN({nav:NAVB(),body:`
  <h1 class="h1">Кто перекрыл авто?</h1><p class="sub">Введите номер машины, которая мешает. Мы напишем владельцу, ваш номер телефона он не увидит.</p>
  ${LB('Номер машины')}<div class="plate foc"><span><input data-f="plate" maxlength="9" value="${esc(F.plate||'')}" placeholder="777 KZA" aria-label="Номер"></span><em><input data-f="reg" maxlength="3" inputmode="numeric" value="${esc(F.reg??'02')}" aria-label="Регион"><small>KZ</small></em></div>
  ${LB('Как это работает','mt4')}${ST(1,'Ищем номер среди соседей ЖК',1)}${ST(2,'Владелец видит сообщение в приложении')}${ST(3,'Вы видите, что он прочитал и идёт')}
  ${D.alerts.filter(a=>a.from===C.uid).length?`${LB('Ваши обращения')}${sortAt(D.alerts.filter(a=>a.from===C.uid)).slice(0,5).map(a=>`<button class="sel-row" ${GO('car-alert',{id:a.id})}><span>${PS(esc(a.plate))} <span class="xs mut">${rel(a.at)}</span></span><span class="xs ${a.status==='free'?'g b':'mut'}">${CARST[a.status]}</span></button>`).join('')}`:''}`,
  foot:BTN('Найти владельца','p',ACT('findcar'))});
const CARST={sent:'Отправлено',read:'Прочитано',coming:'Идёт',free:'Выезд свободен'};
const findOwner=pl=>D.members.find(m=>(m.plates||[]).includes(pl)&&m.notifyCar!==false);
S['car-new']=p=>{const o=mem(p.id);return SCRN({nav:NAVB(`<span class="flex" style="gap:8px">${PS(esc(p.v))}<span class="xs g b flex" style="gap:3px">${I('check',14,2.4)}Владелец найден</span></span>`,{l:1}),body:`
  ${tempSpotInfo(p.v)}<h1 class="h1">Сосед: ${esc(addrOf(o))}</h1><p class="sub">${o?.id===C.uid?'Это ваша машина.':'Ему придёт сообщение в приложении'}</p>
  ${LB('Что случилось')}${PICK('reason',REASONS.map(r=>[r,r]),{def:REASONS[0]})}
  ${LB('Добавить пару слов')}${FIN('text','Например: стою у шлагбаума',{max:120})}`,
  foot:BTN('Отправить соседу','p',ACT('sendalert',{to:p.id,plate:p.v}))})};
S['car-alert']=p=>{const a=D.alerts.find(x=>x.id===p.id);if(!a)return SCRN({nav:NAVB(),body:''});const st=['sent','read','coming','free'];const k=st.indexOf(a.status);
  if(a.status==='free'){const rep=D.alerts.filter(x=>x.from===C.uid&&x.to===a.to&&now()-x.at<30*86400000).length;
    return SCRN({nav:'<div style="height:16px"></div>',body:`<span class="tile m" style="width:60px;height:60px;border-radius:50%">${I('check',28,2.4)}</span>
    <h1 class="h1 mt">Выезд свободен</h1><p class="sub">Сосед из ${mem(a.to)?.entrance} подъезда отодвинул машину ${esc(a.plate)}${a.freeAt?` через ${Math.max(1,Math.round((a.freeAt-a.at)/60000))} мин после сообщения`:''}.</p>
    ${a.thanks?`<p class="s g b mt">Вы ответили: «${esc(a.thanks)}»</p>`:`${LB('Ответить соседу')}<div class="chips">${['Спасибо!','Без проблем, бывает'].map(t=>`<button class="chip" ${ACT('thanks',{id:a.id,v:t})}>${t}</button>`).join('')}</div>`}
    ${rep>=3?`<div class="card wa mt4"><p class="s"><b>Эта машина перекрывает вас ${rep}-й раз за месяц.</b> Можно сообщить в ОСИ, чтобы разметили места.</p><div class="mt">${BTN('Сообщить в ОСИ','wm sm',GO('osi-new',{v:'Парковка'}))}</div></div>`:''}`,
    foot:BTN('Готово','p',ACT('tab',{v:'home'}))})}
  return SCRN({nav:NAVB(`<span class="flex" style="gap:8px">${PS(esc(a.plate))}</span>`,{l:1}),body:`
  <h1 class="h1">Сосед из ${mem(a.to)?.entrance} подъезда</h1><p class="sub">${esc(a.reason)}${a.text?': '+esc(a.text):''}</p>
  <div class="card f mt3">${st.slice(0,3).map((s,i)=>`<div class="flex between s ${i?'mt2':''}"><span class="flex">${i<=k?I('check',16,2.4).replace('class="i"','class="i g"'):I('clock',16)}${CARST[s]}</span><span class="xs mut3">${i===0?hm(a.at):i<=k&&a['t_'+s]?hm(a['t_'+s]):''}</span></div>`).join('')}
  ${a.reply?`<div class="flex top-a mt">${AVM(a.to,26)}<span class="bub" style="background:var(--surface)">${esc(a.reply)}</span></div>`:''}</div>
  <p class="xs mut mt2">Обычно отвечают за несколько минут. Экран обновится сам.</p>`,
  foot:BTN('Выезд свободен','p',ACT('carfree',{id:a.id}))+BTN('Написать соседу','o',ACT('dm',{id:a.to}))})};
S['car-in']=p=>{const a=D.alerts.find(x=>x.id===p.id);if(!a)return SCRN({nav:NAVB(),body:''});
  postDraw.push(()=>{if(a.status==='sent')W(()=>zdoc('alerts',a.id).update({status:'read',t_read:now(),updAt:now()}))});
  return SCRN({nav:NAVB(),body:`<div class="badges">${BD(a.status==='free'?'Закрыто':'Срочно','wa')}</div>
  <h1 class="h1 mt2">Ваша машина ${esc(a.plate)} мешает соседу</h1><p class="sub">Сосед из ${mem(a.from)?.entrance||'?'} подъезда: ${esc(a.reason)}${a.text?'. «'+esc(a.text)+'»':''}. ${rel(a.at)}.</p>
  ${a.status!=='free'?`${LB('Быстрый ответ')}<div class="chips">${['Извините! Выхожу, буду через 2 минуты','Уже иду','Это не моя машина'].map(t=>`<button class="chip${a.reply===t?' on':''}" ${ACT('carreply',{id:a.id,v:t})}>${t}</button>`).join('')}</div>`:`<p class="s g b mt">Выезд свободен, спасибо.</p>${a.thanks?`<p class="s mt2">Сосед ответил: «${esc(a.thanks)}»</p>`:''}`}`,
  foot:a.status!=='free'?BTN('Я отодвинул машину','p',ACT('carfree',{id:a.id})):BTN('Готово','p',ACT('tab',{v:'home'}))})};
S['car-unknown']=p=>SCRN({nav:NAVB(),body:`${PS(esc(p.v))}
  ${tempSpotInfo(p.v)}<h1 class="h1 mt">Этого номера пока нет у соседей</h1><p class="sub">Может, это гость или сосед ещё не в приложении. Вот что можно сделать сейчас.</p>
  <button class="opt" ${ACT('askcar',{v:p.v})}><span class="tile m" style="width:34px;height:34px">${I('chat',17)}</span><span class="grow"><span class="b s" style="display:block">Спросить в ленте ЖК</span><span class="xs mut">Опубликуем номер с просьбой отодвинуть</span></span></button>
  <button class="opt on" ${GO('car-note',{v:p.v})}><span class="tile wa" style="width:34px;height:34px">${I('share',17)}</span><span class="grow"><span class="b s" style="display:block">Записка с QR на лобовое стекло</span><span class="xs mut">Владелец отсканирует и сразу попадёт в приложение</span></span></button>`});
S['car-note']=p=>{if(!F.inv){F.inv='pending';postDraw.push(async()=>{const code=rid(8);const ok=await W(()=>zdoc('invites',code).set({from:C.uid,at:now(),usedBy:null,ctx:'car:'+p.v}));F.inv=ok?code:null;R()})}
  const url=F.inv&&F.inv!=='pending'?appUrl('invite-'+ZID+'-'+F.inv):'';
  return SCRN({nav:NAVB(),body:`<h1 class="h1">Записка готова</h1><p class="sub">Покажите её с экрана или распечатайте и положите под дворник.</p>
  <div class="card center mt" style="box-shadow:var(--shadow);border:0">${PS(esc(p.v))}<div class="h3 mt">Ваша машина мешает выезду соседу</div>
  <div class="mt">${url?`<div class="qrwrap" style="width:170px">${QRSVG(url)}</div>`:'<div class="spin"></div>'}</div><p class="xs mut mt2">Отсканируйте, чтобы ответить соседу и узнать, кто ещё живёт в ${esc(zk()?.name)}</p></div>`,
  foot:`<div class="two">${BTN('Скачать для печати','o',ACT('printnote',{v:p.v,url}))}${BTN('Отправить ссылку','p',ACT('shareurl',{url,t:'Ваша машина '+p.v+' мешает выезду соседу. Ответьте в приложении Соседи:'}))}</div>`})};

/* ---------- Мастера ---------- */
const recCount=id=>D.reviews.filter(r=>r.master===id&&r.rec).length;
S['masters']=()=>{const t=F.t||'Все';const q=(F.q||'').toLowerCase();const ms=D.masters.filter(m=>m.status==='approved');const trades=['Все',...new Set(ms.map(m=>m.trade))];
  const list=ms.filter(m=>(t==='Все'||m.trade===t)&&(!q||(m.name+' '+m.trade+' '+(m.desc||'')).toLowerCase().includes(q))).sort((a,b)=>(b.ad?1:0)-(a.ad?1:0)||recCount(b.id)-recCount(a.id));
  const mineAsMaster=D.masters.find(m=>m.ownerUid===C.uid);
  return SCRN({nav:NAVB('Мастера и услуги',{l:1}),body:`
  <div class="search">${I('search',18)}<input data-f="q" data-live="1" value="${esc(F.q||'')}" placeholder="Кого ищете?" style="border:0;background:none;outline:none;font:inherit;width:100%;color:var(--text)"></div>
  <div class="mt">${PICK('t',trades.map(x=>[x,x]),{def:'Все',scroll:1})}</div>
  ${mineAsMaster?`<button class="banner mt" ${GO('master-jobs')} style="background:var(--primary-soft)">${I('wrench',20)}<span class="grow b s">Заявки ко мне: ${D.jobs.filter(j=>j.master===mineAsMaster.id&&j.status==='sent').length} новых</span>${I('fwd',18)}</button>`:''}
  <div class="mt">${list.length?list.map(m=>`<button class="card flex top-a mt2" ${GO('master',{id:m.id})}>${AV(esc(initials(m.name)),avc(m.id),42)}<span class="grow"><span class="flex between"><span class="b s">${esc(m.name)}, ${esc(m.trade.toLowerCase())}</span>${m.ad?'<span class="xs mut3">Реклама</span>':''}</span><span class="xs mut" style="display:block">${esc(m.desc||'')}</span><span class="badges mt2">${m.entrance?BD('Сосед, '+m.entrance+' подъезд','m'):''}${recCount(m.id)?BD('Рекомендуют '+recCount(m.id)+' '+plural(recCount(m.id),'сосед','соседа','соседей')):''}${m.works?BD('Работал в '+m.works+' квартирах ЖК'):''}</span></span></button>`).join(''):EMPTY('wrench','Мастеров пока нет','Посоветуйте соседям проверенного мастера: модератор проверит и добавит.')}</div>`,
  foot:`<div class="flex between"><span class="xs mut">Вы мастер или знаете хорошего?</span><button class="btn o sm2" ${GO('master-new')}>Добавить</button></div>`})};
S['master']=p=>{const m=D.masters.find(x=>x.id===p.id);if(!m)return SCRN({nav:NAVB(),body:''});const rv=sortAt(D.reviews.filter(r=>r.master===m.id&&r.text));
  return SCRN({nav:NAVB(),body:`<div class="flex">${AV(esc(initials(m.name)),avc(m.id),60)}<div><div class="h2">${esc(m.name)}</div><div class="xs mut">${esc(m.trade)}${m.exp?', '+esc(m.exp):''}</div></div></div>
  <div class="badges mt">${m.entrance?BD('Сосед, '+m.entrance+' подъезд','m'):''}${recCount(m.id)?BD('Рекомендуют '+recCount(m.id)+' '+plural(recCount(m.id),'сосед','соседа','соседей')):''}</div>
  ${m.desc?`<p class="s mut mt">${esc(m.desc)}</p>`:''}
  ${(m.prices||[]).length?`${LB('Цены')}<div class="rows">${m.prices.map(x=>RW(esc(x.t),esc(x.p),'plain')).join('')}</div>`:''}
  <div class="flex between">${LB('Что говорят соседи')}</div>${rv.length?rv.map(r=>`<div class="card f mt2"><p class="s">«${esc(r.text)}»</p><p class="xs mut3 mt2">${esc(whoOf(r.by))}, ${dmy(r.at)}</p></div>`).join(''):`<p class="s mut">Отзывов пока нет. Будьте первым.</p>`}`,
  foot:`<div class="flex">${m.phone?`<a class="rfab g" href="tel:${esc(m.phone.replace(/[^+\d]/g,''))}" aria-label="Позвонить">${I('phone',20)}</a>`:''}<div class="grow">${BTN('Оставить заявку','p',GO('job-new',{id:m.id}))}</div></div>`})};
S['master-new']=()=>SCRN({nav:NAVB('Посоветовать мастера'),body:`<p class="sub">Модератор проверит и добавит мастера в каталог ЖК.</p>
  ${LB('Имя')}${FIN('name','Ерлан',{max:40})}${LB('Специальность')}${FIN('trade','Электрик',{max:30})}${LB('Что делает')}${FIN('desc','Розетки, проводка, люстры',{max:120})}
  ${LB('Телефон')}${FIN('phone','+7 7__ ___ __ __',{type:'tel',max:20})}${LB('Живёт в нашем ЖК?')}${PICK('ent',[['','Нет'],...Array.from({length:zk()?.entrances||1},(_,i)=>[i+1,i+1+' подъезд'])],{def:''})}
  <div class="card f flex mt3"><span class="grow s">Это я, хочу получать заявки</span>${CHK(F.self,ACT('togf',{f:'self'}))}</div>`,
  foot:BTN('Отправить на проверку','p',ACT('savemaster'))});
S['job-new']=p=>{const m=D.masters.find(x=>x.id===p.id);return SCRN({nav:NAVB('Заявка: '+esc(m?.name||'')),body:`
  ${LB('Что нужно сделать','first')}${FIN('what','Заменить розетку',{max:60})}
  ${LB('Опишите проблему')}${FTA('text','Искрит розетка над столешницей',{max:600})}
  <div class="thumbs mt2">${(F.photos||[]).map((id,i)=>`<div class="thumb" style="background-image:url('${blob(id)}')"><button ${ACT('rmphoto',{v:i})}>${I('close',12)}</button></div>`).join('')}${C.assets?`<button class="addph" ${ACT('addphotos')}>${I('camera',20)}</button>`:''}</div>
  ${LB('Когда удобно')}${PICK('when',[['Сегодня после 18:00','Сегодня после 18:00'],['Завтра весь день','Завтра весь день'],['На выходных','На выходных'],['Договоримся','Договоримся']],{def:'Договоримся'})}
  <div class="card f flex mt">${I('lock',16)}<span class="xs mut">Номер квартиры мастер увидит, только когда примет заявку.</span></div>`,
  foot:BTN('Отправить заявку','p',ACT('sendjob',{id:p.id}))})};
S['job']=p=>{const j=D.jobs.find(x=>x.id===p.id);if(!j)return SCRN({nav:NAVB(),body:''});const m=D.masters.find(x=>x.id===j.master);const mine=j.from===C.uid;const st=['sent','accepted','done'];const k=st.indexOf(j.status);
  return SCRN({nav:NAVB('Заявка: '+esc(j.what)),body:`
  ${j.status==='accepted'?`<div class="card m flex">${AV(esc(initials(m?.name)),avc(m?.id),40)}<div><div class="xs g b">Мастер принял заявку</div><div class="h2">${esc(j.eta||'Свяжется с вами')}</div></div></div>`:''}
  <div class="mt3">${TS(k>=0?'done':'','Заявка отправлена',dmy(j.at)+', '+hm(j.at))}${TS(k>=1?'done':j.status==='cancelled'?'':'cur',j.status==='cancelled'?'Заявка отменена':'Мастер принял заявку',j.accAt?hm(j.accAt):'',j.note?`<div class="bub mt2">${esc(j.note)}</div>`:'')}${TS(k>=2?'done':'','Работа выполнена',mine?'Подтвердите после визита':'')}${TS(j.reviewed?'done':'','Отзыв для соседей')}</div>
  ${!mine&&j.status!=='cancelled'?`<div class="note-box mt">Адрес: ${j.status==='sent'?'откроется после принятия':esc(fullAddr(mem(j.from)))}</div>`:''}`,
  foot:mine?(j.status==='accepted'?BTN('Работа выполнена','p',ACT('jobdone',{id:j.id})):j.status==='done'&&!j.reviewed?BTN('Оставить отзыв','p',GO('review',{id:j.id})):'')+(j.status==='sent'||j.status==='accepted'?BTN('Отменить заявку','d',ACT('jobcancel',{id:j.id})):'')
   :(j.status==='sent'?`${FIN('eta','Когда придёте: сегодня в 19:30',{max:60})}${FIN('note','Комментарий: возьму розетку с заземлением',{max:200})}${BTN('Принять заявку','p',ACT('jobaccept',{id:j.id}))}`:j.status==='accepted'?BTN('Написать жителю','o',ACT('dm',{id:j.from})):'')})};
S['review']=p=>{const j=D.jobs.find(x=>x.id===p.id);const m=D.masters.find(x=>x.id===j?.master);return SCRN({nav:NAVB('',{x:1}),body:`
  <div class="flex top-a">${AV(esc(initials(m?.name)),avc(m?.id),48)}<h1 class="h1" style="margin:0">Как ${esc(m?.name)} справился?</h1></div>
  <div class="two mt3">${['1','0'].map(v=>`<button class="opt${String(F.rec??'1')===v?' on':''}" style="margin:0;display:grid;justify-items:center;gap:4px;padding:12px" ${ACT('pick',{f:'rec',v})}>${I(v==='1'?'like':'dislike',22)}<span class="b s">${v==='1'?'Рекомендую':'Не рекомендую'}</span></button>`).join('')}</div>
  ${LB('Что понравилось')}${PICK('tags',[['Пришёл вовремя','Пришёл вовремя'],['Цена как договорились','Цена как договорились'],['Убрал за собой','Убрал за собой'],['Объяснил, что сделал','Объяснил, что сделал']],{multi:1})}
  ${LB('Пара слов для соседей')}${FTA('text','Необязательно',{max:500})}<p class="xs mut3 mt2">Соседи увидят отзыв как «${esc(nameOf(C.uid))}, ${me()?.entrance} подъезд». Номер квартиры не показываем.</p>`,
  foot:BTN('Опубликовать отзыв','p',ACT('savereview',{id:p.id}))})};
S['master-jobs']=()=>{const m=D.masters.find(x=>x.ownerUid===C.uid);const js=sortAt(D.jobs.filter(j=>j.master===m?.id));
  return SCRN({nav:NAVB('Заявки ко мне'),body:js.length?js.map(j=>`<button class="sel-row" ${GO('job',{id:j.id})}><span><b class="s" style="display:block;font-weight:500">${esc(j.what)}</b><span class="xs mut">${esc(whoOf(j.from))}, ${rel(j.at)}</span></span><span class="status ${j.status==='sent'?'new':j.status==='cancelled'?'bad':'ok'}">${JOBST[j.status]}</span></button>`).join(''):EMPTY('wrench','Заявок пока нет')})};

/* ---------- Чаты ---------- */
const dmId=(a,b)=>'dm_'+[a,b].sort().join('_');
function myChats(){const m=me();if(!m)return[];const rd=D.profile?.read||{};
  const ids=['all','e'+m.entrance,...new Set(D.msgs.filter(x=>x.chat.startsWith('dm_')&&x.chat.includes(C.uid)).map(x=>x.chat))];
  return ids.map(id=>{const ms=D.msgs.filter(x=>x.chat===id);const last=ms[0];const other=id.startsWith('dm_')?id.slice(3).split('_').find(u=>u!==C.uid):null;
    return{id,other,title:id==='all'?'Чат ЖК «'+(zk()?.name||'')+'»':id.startsWith('e')?'Чат '+m.entrance+' подъезда':nameOf(other),last,count:ms.length,unread:ms.filter(x=>x.at>(rd[id]||0)&&x.from!==C.uid).length}})}
S['chats']=()=>{const cs=myChats();return SCRN({nav:LTH(wdmy(now()),'Чаты'),bcls:'flush',body:cs.map(c=>`<button class="flex" ${GO('chat',{id:c.id})} style="width:100%;text-align:left;padding:14px var(--pad);border-bottom:1px solid var(--line)">${c.other?AVM(c.other,46):AV(c.id==='all'?'ЖК':c.id.slice(1),c.id==='all'?'mi':'am',46)}<span class="grow" style="min-width:0"><span class="flex between"><b class="s">${esc(c.title)}</b><span class="xs mut3">${c.last?rel(c.last.at):''}</span></span><span class="flex between"><span class="xs mut" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.last?esc((c.last.from===C.uid?'Вы: ':nameOf(c.last.from)+': ')+c.last.text):c.other?'':'Вы ещё не писали'}</span>${c.unread?`<span class="unread">${c.unread}</span>`:''}</span></span></button>`).join('')+`<p class="xs mut center" style="padding:16px 24px">Пилотная веб-версия: сообщения хранятся в общей базе ЖК. Полностью приватные чаты появятся после переноса в мобильное приложение.</p>`,tab:2})};
S['chat']=p=>{const id=p.id;const ms=D.msgs.filter(x=>x.chat===id).slice(0,150).reverse();const c=myChats().find(x=>x.id===id)||{title:'Чат'};
  const rd=(D.profile?.read||{})[id]||0;const unread=ms.filter(x=>x.at>rd&&x.from!==C.uid);
  if(!F.chatInit){F.chatInit=1;F.unreadSnap=unread.length;postDraw.push(()=>{const top=ms.length?ms[ms.length-1].at:0;if(top>rd)setPref({read:{...(D.profile?.read||{}),[id]:top}});const b=document.querySelector('#app .body');if(b)b.scrollTop=b.scrollHeight})}
  return SCRN({nav:NAVB(`<span class="flex" style="gap:8px">${c.other?AVM(c.other,32):AV(id==='all'?'ЖК':id.slice(1),'am',32)}<span style="text-align:left"><b class="s" style="display:block">${esc(c.title)}</b><span class="xs mut" style="font-weight:400">${c.other?esc(whoOf(c.other)):D.members.filter(m=>id==='all'||'e'+m.entrance===id).length+' соседей'}</span></span></span>`,{l:1}),body:`
  ${F.unreadSnap>=8&&!F.sum?`<button class="card m flex" ${ACT('summarize',{id})}>${I('spark',18)}<span class="grow b s">Пока вас не было: ${F.unreadSnap} ${plural(F.unreadSnap,'сообщение','сообщения','сообщений')}. Пересказать?</span></button>`:''}
  ${F.sum?`<div class="card m"><div class="flex b s" style="gap:6px">${I('spark',16)}Главное, пока вас не было</div><div class="xs mt2" style="white-space:pre-line;line-height:1.55">${esc(F.sum)}</div></div>`:''}
  <div class="msgs mt">${ms.length?ms.map(x=>`<div class="msg${x.from===C.uid?' me':''}">${x.from!==C.uid&&!c.other?`<div class="who">${esc(whoOf(x.from))}</div>`:''}<span class="bub${x.from===C.uid?' me':''}" style="text-align:left;white-space:pre-line">${esc(x.text)}</span><div class="xs mut3" style="margin-top:2px">${hm(x.at)}</div></div>`).join(''):`<p class="s mut center mt">Напишите первым: «Привет, соседи!»</p>`}</div>`,
  foot:`<div class="chips scroll" style="margin:0 calc(var(--pad)*-1)">${[['/перекрыли','car-search'],['/опрос','post-new','poll'],['/отдам','post-new','giveaway'],['/мастер','masters'],['/в ОСИ','osi-new']].map(([t,r,v])=>`<button class="chip" ${GO(r,{v})}>${t}</button>`).join('')}</div>
  <div class="compose">${FTA('m','Сообщение',{max:1000})}<button class="rfab g" style="width:44px;height:44px" ${ACT('sendmsg',{id})} aria-label="Отправить">${I('send',18)}</button></div>`})};

/* ---------- Объявления ОСИ (сторис) ---------- */
S['story']=p=>{const n=D.news.find(x=>x.id===p.id);if(!n)return SCRN({nav:NAVB(),body:''});const acked=myAcks()['n_'+n.id];const cnt=ackCount('n_'+n.id);
  return SCRN({cls:'dk',nav:`<div style="padding:10px 14px 0"><div class="flex between"><span class="flex">${AV('ОСИ','',34).replace('class="av "','class="av" style="--s:34px;background:var(--on-deep);color:var(--deep)"')}<span><b class="s" style="display:block">ОСИ ${esc(zk()?.name)}</b><span class="xs mut">${rel(n.at)}, официально</span></span></span><button class="nb" ${ACT('back')} aria-label="Закрыть">${I('close',22)}</button></div></div>`,body:`
  <div style="padding-top:60px">${n.entrance?BD(n.entrance+' подъезд','wa'):BD('Весь ЖК','wa')}
  <div style="font-size:32px;font-weight:700;line-height:1.1;letter-spacing:-.02em;margin-top:12px">${esc(n.title)}</div>
  ${n.when?`<div class="h3 mt" style="font-size:16px">${esc(n.when)}</div>`:''}<p class="s mut mt" style="white-space:pre-line">${esc(n.text||'')}</p></div>`,
  foot:`<div class="flex" style="gap:6px;flex-wrap:wrap"><button class="chip" style="${acked?'background:var(--on-deep);color:var(--deep);border:0':'background:none;color:var(--on-deep);border-color:rgba(255,255,255,.4)'};font-weight:600" ${ACT('ack',{id:n.id})}>${acked?'Понятно ✓':'Понятно'}, ${cnt}</button><button class="chip" style="background:none;color:var(--on-deep);border-color:rgba(255,255,255,.4)" ${ACT('sharenews',{id:n.id})}>Поделиться</button></div>
  ${BTN('Задать вопрос ОСИ','lt',GO('osi-new',{v:'Вопрос председателю',id:n.id}))}`})};

/* ---------- Заявки в ОСИ ---------- */
const OSICATS=['Протечка','Лифт','Свет в подъезде','Уборка','Двор','Парковка','Домофон','Вопрос председателю','Гарантия застройщику','Другое'];
S['osi-new']=p=>{if(!F.cat)F.cat=p.v||'Протечка';const m=me();const dup=D.osireq.filter(r=>r.cat===F.cat&&r.entrance===m.entrance&&!['closed','done'].includes(r.status)&&r.by!==C.uid&&!(r.joiners||[]).includes(C.uid)&&now()-r.at<14*86400000);
  return SCRN({nav:NAVB(),body:`<h1 class="h1">Что случилось?</h1><div class="mt">${PICK('cat',OSICATS.map(c=>[c,c]),{})}</div>
  ${dup.map(r=>`<div class="card wa mt"><div class="xs w b">Похоже, об этом уже сообщили</div><div class="b mt2">${esc(r.title)}</div><div class="xs mut">Заявка №${esc(r.num)}, ${OSIST[r.status]}, ещё ${(r.joiners||[]).length+1} ${plural((r.joiners||[]).length+1,'сосед','соседа','соседей')}</div><div class="mt">${BTN('Это то же самое, присоединиться','wm sm',ACT('joinreq',{id:r.id}))}</div></div>`).join('')}
  ${LB(dup.length?'Или опишите новую проблему':'Опишите проблему')}${FIN('title','Течёт с потолка у лифта, 5 этаж',{max:90})}
  ${LB('Где')}${PICK('where',[['Моя квартира','Моя квартира'],['Подъезд','Подъезд'],['Двор','Двор'],['Паркинг','Паркинг']],{def:'Подъезд'})}
  ${LB('Подробности')}${FTA('text','Например: капает с трубы стояка',{max:800})}
  <div class="thumbs mt2">${(F.photos||[]).map((id,i)=>`<div class="thumb" style="background-image:url('${blob(id)}')"><button ${ACT('rmphoto',{v:i})}>${I('close',12)}</button></div>`).join('')}${C.assets?`<button class="addph" ${ACT('addphotos')}>${I('camera',20)}</button>`:''}</div>`,
  foot:BTN('Отправить в ОСИ','p',ACT('sendreq',{news:p.id||''}))})};
S['osi-req']=p=>{const r=D.osireq.find(x=>x.id===p.id);if(!r)return SCRN({nav:NAVB(),body:''});const mine=r.by===C.uid||(r.joiners||[]).includes(C.uid);
  const tl=r.timeline||[];return SCRN({nav:NAVB(`<span class="xs mut b">Заявка №${esc(r.num)}</span>`,{l:1}),body:`
  ${r.status==='done'||r.status==='closed'?BD(r.status==='closed'?'Закрыта':'Выполнена'+(r.doneAt?' за '+durTxt(r.doneAt-r.at):''),'m'):BD(OSIST[r.status],'wa')}
  <h1 class="h1 mt2">${esc(r.title)}</h1><p class="xs mut">${esc(r.cat)}, ${esc(r.where||'')}, ${r.entrance} подъезд. С вами ещё ${(r.joiners||[]).length} ${plural((r.joiners||[]).length,'сосед','соседа','соседей')}.</p>
  ${r.text?`<p class="s mt">${esc(r.text)}</p>`:''}${(r.photos||[]).length?`<div class="thumbs mt2">${r.photos.map(id=>`<div class="thumb" style="background-image:url('${blob(id)}')"></div>`).join('')}</div>`:''}
  <div class="card mt">${TS('done','Заявка отправлена',dmy(r.at)+', '+hm(r.at))}${tl.map(t=>TS('done',esc(t.t),dmy(t.at)+', '+hm(t.at)+(t.note?'. '+esc(t.note):''))).join('')}${r.status==='done'?TS('cur','Проблема решена?','Ваш ответ увидит председатель ОСИ'):''}</div>
  ${r.confirm?`<p class="s g b mt">Жители подтвердили: ${r.confirm==='ok'?'всё исправлено':'ещё не исправлено'}</p>`:''}`,
  foot:r.status==='done'&&mine?`<div class="two">${BTN('Да, исправлено','p',ACT('reqok',{id:r.id}))}${BTN('Ещё нет','o',ACT('reqbad',{id:r.id}))}</div><p class="fine">Если «ещё нет», заявка вернётся в работу с пометкой «повторно»</p>`:''})};
const durTxt=ms=>{const h=Math.round(ms/3600000);return h<24?h+' '+plural(h,'час','часа','часов'):Math.floor(h/24)+' '+plural(Math.floor(h/24),'день','дня','дней')+(h%24?' '+h%24+' ч':'')};
S['osi-list']=()=>{const rs=sortAt(D.osireq.filter(r=>r.by===C.uid||(r.joiners||[]).includes(C.uid)));return SCRN({nav:NAVB('Мои заявки в ОСИ'),body:rs.length?rs.map(r=>`<button class="sel-row" ${GO('osi-req',{id:r.id})}><span><b class="s" style="display:block;font-weight:500">${esc(r.title)}</b><span class="xs mut">№${esc(r.num)}, ${rel(r.at)}</span></span><span class="status ${r.status==='done'||r.status==='closed'?'ok':'new'}">${OSIST[r.status]}</span></button>`).join(''):EMPTY('building','Заявок нет'),foot:BTN('Новая заявка','p',GO('osi-new'))})};

/* ---------- Взносы ОСИ ---------- */
const curFee=()=>sortAt(D.fees,'period')[0]||null;
const feeFor=(f,m)=>Math.round((f.items||[]).reduce((s,i)=>s+(i.perM2?(Number(i.perM2)*(Number(m?.area)||0)):Number(i.flat||0)),0));
S['fee']=()=>{const f=curFee();const m=me();if(!f)return SCRN({nav:NAVB('Взносы ОСИ'),body:EMPTY('card','ОСИ ещё не выставило взносы','Когда председатель добавит взнос за месяц, он появится здесь.')});
  const sum=feeFor(f,m);const ord=D.orders.find(o=>o.type==='fee'&&o.ref===f.id&&o.by===C.uid&&o.status!=='cancelled');const auto=D.profile?.autopay;
  if(ord&&ord.status==='paid')return S['fee-paid']({});
  const tot=(f.items||[]).reduce((s,i)=>s+(i.perM2?i.perM2*(m.area||0):Number(i.flat||0)),0)||1;const colors=['var(--deep)','var(--primary)','var(--accent)','var(--line-2)','var(--mint)'];
  return SCRN({nav:NAVB(),body:`<div class="xs mut b">Взнос ОСИ за ${esc(f.title||f.period)}, кв. ${esc(m.apt)}</div>
  <div class="h1 xl" style="font-size:34px">${m.area?money(sum):'—'}</div><div class="xs mut">Оплатить до ${f.due?dmy(f.due):'конца месяца'}</div>
  ${!m.area?`<div class="err-box mt">Укажите площадь квартиры в настройках, чтобы посчитать взнос.</div>`:''}
  <div class="card mt"><div class="b s">Из чего складывается</div><div class="bar mt">${(f.items||[]).map((i,k)=>`<i style="flex:${Math.max(1,(i.perM2?i.perM2*(m.area||1):i.flat)/tot*100)};background:${colors[k%5]}"></i>`).join('')}</div>
  <div class="rows mt2">${(f.items||[]).map((i,k)=>RW(`<span class="lg" style="background:${colors[k%5]}"></span>${esc(i.t)}`,i.perM2?money(Math.round(i.perM2*(m.area||0))):money(i.flat),'plain')).join('')}</div>
  ${f.report?`<p class="xs mt2"><b>Отчёт ОСИ:</b> ${esc(f.report)}</p>`:''}</div>
  <div class="card mt2"><div class="b s">Как оплатить</div><p class="xs mut mt2" style="white-space:pre-line">${esc(zk()?.payInfo||'Реквизиты ОСИ пока не указаны. Уточните у председателя.')}</p>
  <div class="flex between s" style="padding-top:12px"><span>Напоминать 5-го числа</span>${CHK(auto,ACT('autopay'))}</div></div>
  ${ord?`<div class="note-box mt2">Вы отметили оплату ${dmy(ord.at)}. Ждём подтверждения ОСИ.</div>`:''}`,
  foot:ord?'':BTN('Я оплатил '+(m.area?money(sum):''),'p',ACT('feepaid',{id:f.id,sum}))})};
S['fee-paid']=()=>{const f=curFee();const m=me();const paid=D.orders.filter(o=>o.type==='fee'&&o.ref===f.id&&o.status==='paid');
  const ent=e=>{const ms=D.members.filter(x=>x.entrance===e);return ms.length?Math.round(paid.filter(o=>mem(o.by)?.entrance===e).length/ms.length*100):0};
  const ents=Array.from({length:zk()?.entrances||1},(_,i)=>[i+1,ent(i+1)]).sort((a,b)=>b[1]-a[1]);
  return SCRN({cls:'dk',nav:NAVB(''),body:`<span class="av" style="--s:56px;background:var(--on-deep);color:var(--deep)">${I('check',26,2.6)}</span>
  <h1 class="h1 xl mt" style="color:var(--on-deep)">${esc(f.title||f.period)} оплачен</h1><div class="xs mut">Подтверждено ОСИ</div>
  <div class="card mt3"><div class="flex between"><b class="s">${m.entrance} подъезд уже оплатил</b><b style="font-size:22px">${ent(m.entrance)}%</b></div><div class="mt2">${PR(ent(m.entrance),0,'lt')}</div>
  <p class="xs mut mt2">Лидирует ${ents[0][0]} подъезд, ${ents[0][1]}%.</p></div>`,foot:BTN('Готово','lt',ACT('tab',{v:'home'}))})};

/* ---------- Голосования ОСИ ---------- */
const myOV=()=>D.ovotes.find(v=>v.id===C.uid)||{};
function ballotRes(b){const r={za:0,pr:0,vz:0};let area=0,n=0;D.ovotes.forEach(v=>{const x=v[b.id];if(x&&r[x.c]!=null){const a=Number(x.area)||1;r[x.c]+=a;area+=a;n++}});
  const totalArea=Number(zk()?.totalArea)||D.members.reduce((s,m)=>s+(Number(m.area)||0),0)||1;return{r,area,n,quorum:Math.round(area/totalArea*100),pct:k=>area?Math.round(r[k]/area*100):0}}
S['ballots']=()=>{const bs=sortAt(D.ballots);return SCRN({nav:NAVB('Голосования ОСИ'),body:bs.length?bs.map(b=>`<button class="sel-row" ${GO('ballot',{id:b.id})}><span><b class="s" style="display:block;font-weight:500">${esc(b.title)}</b><span class="xs mut">${b.status==='open'?'До '+dmy(b.deadline):'Завершено'}</span></span><span class="status ${b.status==='open'?(myOV()[b.id]?'ok':'new'):''}">${b.status==='open'?(myOV()[b.id]?'Вы проголосовали':'Ждёт голоса'):'Итоги'}</span></button>`).join(''):EMPTY('flag','Голосований нет','Официальные голосования создаёт председатель ОСИ.')})};
S['ballot']=p=>{const b=D.ballots.find(x=>x.id===p.id);if(!b)return SCRN({nav:NAVB(),body:''});const res=ballotRes(b);const my=myOV()[b.id];const open=b.status==='open'&&b.deadline>now();const m=me();
  if(!open||my){return SCRN({nav:NAVB(),body:`${BD(open?'Голосование идёт':'Решение '+(res.pct('za')>50?'принято':'не принято'),open?'wa':'m')}
  <h1 class="h1 mt2">${esc(b.title)}</h1>
  <div class="card mt"><div class="bar" style="height:28px;border-radius:8px"><i style="flex:${res.pct('za')||0.01};background:var(--deep);color:var(--on-deep);font-size:12px;font-weight:600;display:flex;align-items:center;padding-left:8px">За ${res.pct('za')}%</i><i style="flex:${res.pct('pr')||0.01};background:var(--accent)"></i><i style="flex:${res.pct('vz')||0.01};background:var(--line-2)"></i></div>
  <p class="xs mut mt2">Против ${res.pct('pr')}%, воздержались ${res.pct('vz')}%, явка ${res.quorum}% площади (${res.n} ${plural(res.n,'квартира','квартиры','квартир')})</p>
  ${my?`<p class="xs g b mt2">Вы голосовали «${{za:'За',pr:'Против',vz:'Воздержусь'}[my.c]}», ${dmy(my.at)}, ${hm(my.at)}</p>`:''}</div>
  ${b.next?`<div class="card mt2"><div class="b s">Что дальше</div><p class="s mt2" style="white-space:pre-line">${esc(b.next)}</p></div>`:''}`,
  foot:!open?BTN('Скачать протокол','p',ACT('protocol',{id:b.id}),'doc'):''})}
  return SCRN({nav:NAVB(),body:`<div class="badges">${BD('Официально, ОСИ','dp')}${BD('До '+dmy(b.deadline),'wa')}</div>
  <h1 class="h1 mt2">${esc(b.title)}</h1>${b.text?`<p class="s mut" style="white-space:pre-line">${esc(b.text)}</p>`:''}
  <div class="card mt"><div class="flex between s"><b>Кворум</b><b>${res.quorum}% из нужных ${b.quorum||50}%</b></div><div class="mt2">${PR(Math.min(100,res.quorum),b.quorum||50)}</div><p class="xs mut mt2">Голос считается по площади квартиры: у вас ${m.area||'?'} м²</p></div>
  ${(b.docs||[]).length?`<div class="card mt2 rows" style="padding-top:2px;padding-bottom:2px">${b.docs.map(d=>RW(esc(d.t),d.url?`<a class="link" href="${esc(d.url)}" target="_blank" rel="noopener">Открыть</a>`:'','plain')).join('')}</div>`:''}
  ${LB('Ваш голос')}${SEGF('c',[['za','За'],['pr','Против'],['vz','Воздержусь']],{def:'za'})}
  ${LB('Подтвердите номер квартиры')}${FIN('apt2','Номер вашей квартиры',{max:6,mode:'numeric'})}
  ${!m.area?`<div class="err-box mt2">Укажите площадь квартиры в настройках: без неё голос не посчитать.</div>`:''}`,
  foot:`<p class="fine">Голос закрепляется за вашей квартирой и попадёт в протокол. Изменить его после отправки нельзя.</p>${BTN('Проголосовать','p',ACT('castvote',{id:b.id}))}`})};

