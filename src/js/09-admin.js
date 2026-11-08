/* =====================================================================
   Модерация Тредо (#admin) — только редакторы артефакта
   ===================================================================== */
let ASEC='overview';
A.asec=el=>{ASEC=el.dataset.v;F={};R();scrollTo(0,0)};
const AD={};
function adminHTML(){if(!C.admin)return `<div class="gate"><h2 class="h2">Раздел для модераторов Тредо</h2><p class="sub mt2">Доступ есть у владельца и редакторов этого приложения.</p></div>`;
  const rep=D.posts.filter(p=>(p.reports||[]).length&&p.status!=='hidden');const pm=D.masters.filter(m=>m.status==='pending');const pb=D.biz.filter(b=>b.status==='pending');
  const aw=D.orders.filter(o=>['bump','shop'].includes(o.type)&&o.status==='awaiting');const ol=D.leads.filter(l=>l.status==='open');
  const nav=[['overview','Обзор'],['zks','ЖК и роли'],['waitlist','Лист ожидания',groupWait().length],['moder','Жалобы',rep.length],['members','Жители'],['masters','Мастера',pm.length],['jobs','Заявки мастерам'],['biz','Бизнес соседей',pb.length],
    ['orders','Оплаты Тредо',aw.length],['leads','Ремонт: лиды',ol.length],['shop','Лавка'],['settings','Тарифы и партнёр'],['data','Данные']];
  const fn=AD[ASEC]||AD.overview;let body='';try{body=fn()}catch(e){console.error(e);body='<div class="err-box">Раздел не открылся</div>'}
  return ADMSHELL('Тредо','Модерация платформы',nav,ASEC,`<div class="flex between" style="margin-bottom:6px"><span class="xs mut">Текущий ЖК: <b>${esc(zk()?.name||'не выбран')}</b></span>${D.zks.length>1?`<select class="inp" style="width:auto;min-height:36px;padding:6px 36px 6px 12px;font-size:13px" data-f="_zk" data-act-change="adminzk">${D.zks.map(z=>`<option value="${esc(z.id)}" ${z.id===ZID?'selected':''}>${esc(z.name)}</option>`).join('')}</select>`:''}</div>`+body,'asec')+toastsHTML()}
const groupWait=()=>{const g={};D.waitlist.forEach(w=>{const k=w.zkId||w.key;(g[k]=g[k]||{key:k,zkId:w.zkId||null,name:w.name,city:w.city,cityId:w.cityId||null,street:w.street||'',n:0,last:0}).n++;g[k].last=Math.max(g[k].last,w.at||0)});return Object.values(g).sort((a,b)=>b.n-a.n)};

AD.overview=()=>{const aw=D.orders.filter(o=>o.status==='awaiting');return `<h1>Обзор платформы</h1><div class="kpis2">
  <div class="kpi2"><span>Подключено ЖК</span><b>${D.zks.filter(z=>z.status==='active').length}</b><span>ещё ${D.zks.filter(z=>z.status!=='active').length} собирают соседей</span></div>
  <div class="kpi2"><span>Жителей в текущем ЖК</span><b>${D.members.length}</b><span>${verifiedN()} подтвердили адрес</span></div>
  <div class="kpi2"><span>Лист ожидания</span><b>${D.waitlist.length}</b><span>${groupWait().length} ЖК</span></div>
  <div class="kpi2"><span>Ждут оплаты</span><b>${aw.length}</b><span>${money(aw.reduce((s,o)=>s+(o.amount||0),0))}</span></div></div>
  <div class="grid2"><div class="panel"><h3>Активность за 7 дней</h3>${[['Публикаций',D.posts.filter(p=>now()-p.at<604800000).length],['Комментариев',D.comments.filter(p=>now()-p.at<604800000).length],['«Кто перекрыл»',D.alerts.filter(p=>now()-p.at<604800000).length],['Заявок мастерам',D.jobs.filter(p=>now()-p.at<604800000).length],['Заявок в ОСИ',D.osireq.filter(p=>now()-p.at<604800000).length],['Сообщений в чатах',D.msgs.filter(p=>now()-p.at<604800000).length]].map(([l,n])=>RW(l,n,'plain')).join('')}</div>
  <div class="panel"><h3>Что важно сейчас</h3>${[[D.posts.filter(p=>(p.reports||[]).length&&p.status!=='hidden').length,'жалоб на публикации','moder'],[D.masters.filter(m=>m.status==='pending').length,'мастеров на проверке','masters'],[D.biz.filter(b=>b.status==='pending').length,'бизнес-профилей на проверке','biz'],[D.leads.filter(l=>l.status==='open').length,'лидов на ремонт без предложений','leads']].map(([n,l,s])=>`<button class="sel-row" ${ACT('asec',{v:s})}><span>${n} ${l}</span>${I('fwd',16)}</button>`).join('')}</div></div>`};

AD.zks=()=>{const cf=F.zcf||'';const q=(F.zq||'').toLowerCase();const ed=F.zid?D.zks.find(z=>z.id===F.zid):null;
  const list=D.zks.filter(z=>(!cf||cityOf(z)===cf)&&(!q||(z.name+' '+(z.address||'')).toLowerCase().includes(q))).sort((a,b)=>cityName(a).localeCompare(cityName(b),'ru')||a.name.localeCompare(b.name,'ru'));
  const cities=[...new Set(D.zks.map(cityOf).filter(Boolean))];
  return `<h1>ЖК и роли</h1><div class="grid2"><div class="panel"><h3>${ed?'Изменить ЖК «'+esc(ed.name)+'»':'Добавить ЖК'}</h3><div class="frm">
  ${L('Город',FSEL('zcityId',[['','Выберите город'],...CITIES.map(c=>[c.id,c.name+' ('+c.region+')'])]))}${L('Название ЖК (без «ЖК»)',FIN('zname','Хан-Тенгри',{max:60}))}
  ${L('Адрес',FIN('zaddr','ул. Сатпаева, 30',{max:80}))}${L('Застройщик',FIN('zdev','',{max:60}))}${L('Дома в ЖК через запятую (если домов несколько)',FIN('zhouses','1, 2, 3А',{max:120}))}
  <div class="row2">${L('Подъездов в доме',FIN('zent','5',{mode:'numeric',max:2}))}${L('Квартир в подъезде',FIN('zape','60',{mode:'numeric',max:4}))}</div>
  ${L('Порог запуска, соседей',FIN('zth','30',{mode:'numeric',max:4}))}${L('Статус',SEGF('zst',[['active','Открыт'],['waitlist','Собираем соседей'],['catalog','Только в справочнике']],{def:'catalog'}))}
  <div class="actions"><button class="btn p" ${ACT('newzk')}>${ed?'Сохранить':'Добавить в справочник'}</button>${ed?`<button class="btn s2" ${ACT('pick',{f:'zid',v:''})}>Отмена</button>`:''}</div></div></div>
  <div class="panel"><h3>Загрузить справочник списком</h3><p class="xs mut">По строке на ЖК, поля через точку с запятой или табуляцию: <b>Город; Название ЖК; Адрес; Застройщик; Подъездов</b>. Можно вставить прямо из Excel или Google Таблиц. Город должен совпадать с классификатором, дубликаты пропускаются.</p>
  <div class="frm mt2">${FTA('zimp','Алматы; Хан-Тенгри; ул. Сатпаева, 30; ; 5',{max:200000})}<div class="actions"><button class="btn p" ${ACT('importzk')}>Загрузить</button><button class="btn s2" ${ACT('zktemplate')}>Скачать шаблон</button></div></div>
  ${F.impres?`<p class="s mt2">${esc(F.impres)}</p>`:''}</div></div>
  <div class="panel"><div class="flex between" style="flex-wrap:wrap;gap:8px"><h3 style="margin:0">Справочник: ${D.zks.length} ЖК</h3><span class="flex" style="gap:8px">${FSEL('zcf',[['','Все города'],...cities.map(id=>[id,cityById(id)?.name||id])])}<input class="inp" data-f="zq" data-live="1" value="${esc(F.zq||'')}" placeholder="Поиск" style="width:180px"></span></div>
  <div class="tblw mt2"><table class="tbl2"><thead><tr><th>Город</th><th>ЖК</th><th>Адрес</th><th>Статус</th><th>Жители / ждут</th><th></th></tr></thead><tbody>${list.map(z=>{const st=ZST[z.status]||ZST.catalog;return `<tr><td>${esc(cityName(z))}</td><td><b class="s">${esc(z.name)}</b>${(z.houses||[]).length?`<div class="xs mut">дома ${z.houses.map(esc).join(', ')}</div>`:''}</td><td class="xs">${esc(z.address||'')}${z.developer?'<div class="mut">'+esc(z.developer)+'</div>':''}</td><td><span class="status ${st[1]}">${st[0]}</span></td><td class="xs">${z.id===ZID?D.members.length:'—'} / ${waitN(z.id)}</td>
  <td class="actions"><button class="btn s2 sm2" ${ACT('editzk',{id:z.id})}>Изменить</button>${z.status!=='active'?`<button class="btn p sm2" ${ACT('zkstatus',{id:z.id,v:'active'})}>Открыть</button>`:`<button class="btn s2 sm2" ${ACT('zkstatus',{id:z.id,v:'waitlist'})}>Закрыть</button>`}<button class="btn d sm2" ${ACT('delzk',{id:z.id})}>Удалить</button></td></tr>`}).join('')||'<tr><td class="s mut" colspan="6">Пусто. Добавьте ЖК или загрузите список.</td></tr>'}</tbody></table></div></div>
  ${zk()?`<div class="panel"><h3>Председатель ОСИ в ЖК «${esc(zk().name)}»</h3><div class="frm">${FSEL('osiu',[['','Выберите жителя'],...D.members.map(m=>[m.id,m.name+', '+(m.house?'дом '+m.house+', ':'')+m.entrance+' под., кв. '+m.apt])])}<button class="btn p sm2" ${ACT('setosi')}>Назначить председателем</button></div>
  <p class="xs mut mt2">Сейчас: ${D.members.filter(m=>m.role==='osi').map(m=>esc(m.name)+` <button class="link xs" ${ACT('unosi',{id:m.id})}>снять</button>`).join(', ')||'не назначен'}</p></div>`:''}`};
A.newzk=async()=>{const cityId=F.zcityId;const name=cleanZkName(fv('zname'));if(!cityId||!name){toast('Выберите город и укажите название','err');return}
  const ex=F.zid?D.zks.find(z=>z.id===F.zid):null;const id=ex?ex.id:(cityId+'-'+slug(name)+'-'+(await sha(cityId+name+now())).slice(0,4)).slice(0,60);
  const houses=fv('zhouses').split(',').map(s=>s.trim()).filter(Boolean);
  const body={cityId,city:cityById(cityId).name,name,address:fv('zaddr'),developer:fv('zdev'),houses,entrances:num('zent')||1,aptsPerEntrance:num('zape')||60,threshold:num('zth')||30,status:F.zst||'catalog'};
  const ok=await W(()=>ex?C.db.doc('zk/'+id).update(body):C.db.doc('zk/'+id).set({...body,codes:{},zones:[],at:now()}),ex?'ЖК сохранён':'ЖК добавлен в справочник');if(ok){F={};R()}};
A.editzk=el=>{const z=D.zks.find(x=>x.id===el.dataset.id);F={zid:z.id,zcityId:cityOf(z)||'',zname:z.name,zaddr:z.address||'',zdev:z.developer||'',zent:String(z.entrances||''),zape:String(z.aptsPerEntrance||60),zth:String(z.threshold||30),zst:z.status,zhouses:(z.houses||[]).join(', ')};R();scrollTo(0,0)};
A.delzk=async el=>{const z=D.zks.find(x=>x.id===el.dataset.id);if(!confirm(`Удалить ЖК «${z.name}» из справочника? Публикации и жители этого ЖК останутся в базе, но станут недоступны.`))return;await W(()=>C.db.doc('zk/'+z.id).delete(),'ЖК удалён')};
A.importzk=async()=>{const t=F.zimp||'';if(!t.trim()){toast('Вставьте список','err');return}F.impres='Загружаем…';R();const r=await importCatalog(t);
  F.impres=`Добавлено: ${r.added}. Пропущено как дубликаты: ${r.skipped}.${r.bad.length?' Не распознан город или название в строках: '+r.bad.slice(0,20).join(', ')+(r.bad.length>20?'…':''):''}`;if(r.added)F.zimp='';R()};
A.zktemplate=()=>saveFile('spravochnik-zhk.csv','Город;Название ЖК;Адрес;Застройщик;Подъездов\nАлматы;Пример;ул. Примерная, 1;Застройщик;5\n');
A.zkstatus=async el=>{await W(()=>C.db.doc('zk/'+el.dataset.id).update({status:el.dataset.v}),'Статус изменён')};
A.setosi=async()=>{if(!F.osiu)return;await W(()=>zdoc('members',F.osiu).update({role:'osi',verified:true}),'Председатель назначен')};
A.unosi=async el=>{await W(()=>zdoc('members',el.dataset.id).update({role:'resident'}),'Роль снята')};
A.adminzk=el=>{subZk(el.value);R()};

AD.waitlist=()=>`<h1>Лист ожидания</h1><p class="sub">Жители ЖК, которые ещё не открыты. Когда наберётся порог, открывайте.</p><div class="panel tblw"><table class="tbl2"><thead><tr><th>Город</th><th>ЖК</th><th>Ждут</th><th>Последняя заявка</th><th></th></tr></thead><tbody>${groupWait().map(g=>{const z=g.zkId?D.zks.find(x=>x.id===g.zkId):null;return `<tr><td>${esc(g.city||'')}</td><td><b class="s">${esc(g.name)}</b>${g.street?`<div class="xs mut">${esc(g.street)}</div>`:''}${!g.zkId?'<div class="xs w">нет в справочнике</div>':''}</td><td><b>${g.n}</b>${z?' из '+(z.threshold||30):''}</td><td>${g.last?dmy(g.last):''}</td><td>${z?(z.status==='active'?'<span class="status ok">открыт</span>':`<button class="btn p sm2" ${ACT('zkstatus',{id:z.id,v:'active'})}>Открыть ЖК</button>`):`<button class="btn p sm2" ${ACT('wait2zk',{k:g.key})}>Добавить в справочник</button>`}</td></tr>`}).join('')||'<tr><td class="s mut" colspan="5">Пусто</td></tr>'}</tbody></table></div>`;
A.wait2zk=el=>{const g=groupWait().find(x=>x.key===el.dataset.k);ASEC='zks';F={zcityId:g.cityId||cityIdByName(g.city)||'',zname:g.name,zaddr:g.street||'',zst:'waitlist'};R();scrollTo(0,0)};

AD.moder=()=>{const rep=sortAt(D.posts.filter(p=>(p.reports||[]).length||p.status==='hidden'));return `<h1>Жалобы и скрытое</h1><div class="panel">${rep.length?`<table class="tbl2"><tbody>${rep.map(p=>`<tr><td><b class="s">${esc(p.title)}</b><div class="xs mut">${esc(KINDS[p.kind]?.[0]||p.kind)}, ${esc(whoOf(p.author))}, ${rel(p.at)}</div><div class="xs mt2">${esc((p.text||'').slice(0,200))}</div></td><td>${(p.reports||[]).length} жалоб</td><td class="actions">${p.status==='hidden'?`<button class="btn s2 sm2" ${ACT('modpost',{id:p.id,v:'active'})}>Вернуть</button>`:`<button class="btn p sm2" ${ACT('modpost',{id:p.id,v:'hidden'})}>Скрыть</button><button class="btn s2 sm2" ${ACT('modclear',{id:p.id})}>Жалобы не по делу</button>`}</td></tr>`).join('')}</tbody></table>`:'<p class="s mut">Жалоб нет.</p>'}</div>
  <div class="panel"><h3>Последние публикации</h3><table class="tbl2"><tbody>${sortAt(D.posts.filter(p=>p.status==='active')).slice(0,25).map(p=>`<tr><td>${esc(p.title)}<div class="xs mut">${esc(whoOf(p.author))}, ${rel(p.at)}</div></td><td><button class="btn s2 sm2" ${ACT('modpost',{id:p.id,v:'hidden'})}>Скрыть</button></td></tr>`).join('')}</tbody></table></div>`};
A.modpost=async el=>{await W(()=>zdoc('posts',el.dataset.id).update({status:el.dataset.v}),el.dataset.v==='hidden'?'Скрыто':'Возвращено')};
A.modclear=async el=>{await W(()=>zdoc('posts',el.dataset.id).update({reports:[]}),'Жалобы сняты')};

AD.members=()=>`<h1>Жители ${esc(zk()?.name||'')}</h1><div class="panel tblw"><table class="tbl2"><thead><tr><th>Имя</th><th>Дом, подъезд, кв.</th><th>Адрес</th><th>Публикаций</th><th></th></tr></thead><tbody>${[...D.members].sort((a,b)=>a.entrance-b.entrance).map(m=>`<tr><td>${esc(m.name)}${m.role==='osi'?' <span class="status ok">ОСИ</span>':''}${m.banned?' <span class="status bad">ограничен</span>':''}</td><td>${m.house?'д. '+esc(m.house)+', ':''}${m.entrance}, ${esc(m.apt)}</td><td>${m.verified?'подтверждён':'нет'}</td><td>${D.posts.filter(p=>p.author===m.id).length}</td><td class="actions">${m.verified?'':`<button class="btn p sm2" ${ACT('admverify',{id:m.id})}>Подтвердить</button>`}<button class="btn s2 sm2" ${ACT('ban',{id:m.id,v:m.banned?'':'1'})}>${m.banned?'Снять ограничение':'Ограничить'}</button></td></tr>`).join('')}</tbody></table></div>`;
A.admverify=async el=>{await W(()=>zdoc('members',el.dataset.id).update({verified:true,via:'admin',verifiedAt:now()}),'Подтверждён')};
A.ban=async el=>{if(el.dataset.v&&!confirm('Ограничить доступ жителю?'))return;await W(()=>zdoc('members',el.dataset.id).update({banned:!!el.dataset.v}),'Готово')};

AD.masters=()=>{const ms=sortAt(D.masters);const ed=D.masters.find(m=>m.id===F.me);
  if(ed&&F.init!==ed.id){F.init=ed.id;F.mpr=(ed.prices||[]).map(p=>p.t+' | '+p.p).join('\n');F.mw=ed.works||'';F.mex=ed.exp||'';F.mown=ed.ownerUid||''}
  return `<h1>Мастера</h1><div class="grid2"><div class="panel"><table class="tbl2"><tbody>${ms.map(m=>`<tr><td><b class="s">${esc(m.name)}</b>, ${esc(m.trade)}<div class="xs mut">${esc(m.phone||'')}${m.suggestedBy?', предложил '+esc(nameOf(m.suggestedBy)):''}</div></td><td><span class="status ${m.status==='approved'?'ok':m.status==='pending'?'new':'bad'}">${{approved:'в каталоге',pending:'на проверке',hidden:'скрыт'}[m.status]}</span>${m.ad?' <span class="status">реклама</span>':''}</td><td class="actions">${m.status!=='approved'?`<button class="btn p sm2" ${ACT('mst',{id:m.id,v:'approved'})}>Одобрить</button>`:`<button class="btn s2 sm2" ${ACT('mst',{id:m.id,v:'hidden'})}>Скрыть</button>`}<button class="btn s2 sm2" ${ACT('pick',{f:'me',v:m.id})}>Изменить</button></td></tr>`).join('')||'<tr><td class="s mut">Пока нет</td></tr>'}</tbody></table></div>
  ${ed?`<div class="panel"><h3>${esc(ed.name)}</h3><div class="frm">${L('Цены (услуга | цена, по строке)',FTA('mpr','Замена розетки | от 3 000 ₸',{max:1000}))}<div class="row2">${L('Работал в квартирах ЖК',FIN('mw','14',{mode:'numeric',max:4}))}${L('Опыт',FIN('mex','9 лет опыта',{max:30}))}</div>
  ${L('Аккаунт мастера (получает заявки)',FSEL('mown',[['','Не привязан, заявки ведёт Тредо'],...D.members.map(m=>[m.id,m.name+', кв. '+m.apt])]))}<div class="flex between s">Платное место в каталоге (метка «Реклама»)${CHK(F.mad??ed.ad,ACT('togf',{f:'mad'}))}</div>
  <div class="actions"><button class="btn p" ${ACT('savemst',{id:ed.id})}>Сохранить</button></div></div></div>`:''}</div>`};
A.mst=async el=>{await W(()=>zdoc('masters',el.dataset.id).update({status:el.dataset.v}),'Готово')};
A.savemst=async el=>{const ed=D.masters.find(m=>m.id===el.dataset.id);const prices=fv('mpr').split('\n').map(l=>l.split('|').map(s=>s.trim())).filter(x=>x[0]).map(([t,p])=>({t,p:p||''}));
  await W(()=>zdoc('masters',ed.id).update({prices,works:num('mw'),exp:fv('mex'),ownerUid:F.mown||null,ad:!!(F.mad??ed.ad)}),'Сохранено');F={};R()};

AD.jobs=()=>{const js=sortAt(D.jobs.filter(j=>{const m=D.masters.find(x=>x.id===j.master);return !m?.ownerUid&&['sent','accepted'].includes(j.status)}));
  return `<h1>Заявки мастерам без аккаунта</h1><p class="sub">Если мастер не в приложении, Тредо передаёт заявку по телефону и отмечает статус.</p><div class="panel">${js.length?`<table class="tbl2"><tbody>${js.map(j=>{const m=D.masters.find(x=>x.id===j.master);return `<tr><td><b class="s">${esc(j.what)}</b><div class="xs mut">${esc(m?.name)} ${esc(m?.phone||'')}. От ${esc(whoOf(j.from))}, кв. ${esc(mem(j.from)?.apt||'')}. ${esc(j.when)}</div><div class="xs">${esc(j.text||'')}</div></td><td class="actions">${j.status==='sent'?`<input class="inp" data-f="eta_${j.id}" placeholder="Когда придёт" style="min-height:32px;padding:6px 10px;font-size:13px;width:150px"><button class="btn p sm2" ${ACT('admjob',{id:j.id})}>Мастер принял</button>`:'<span class="status ok">принята</span>'}</td></tr>`}).join('')}</tbody></table>`:'<p class="s mut">Нет заявок.</p>'}</div>`};
A.admjob=async el=>{await W(()=>zdoc('jobs',el.dataset.id).update({status:'accepted',eta:fv('eta_'+el.dataset.id),accAt:now(),updAt:now()}),'Житель увидит статус')};

AD.biz=()=>`<h1>Бизнес соседей</h1><div class="panel"><table class="tbl2"><tbody>${sortAt(D.biz).map(b=>`<tr><td><b class="s">${esc(b.name)}</b><div class="xs mut">${esc(whoOf(b.owner))}. ${esc(b.desc||'')}</div><div class="xs">${(b.products||[]).map(p=>esc(p.t)+' '+money(p.p)).join(', ')}</div></td><td><span class="status ${b.status==='approved'?'ok':b.status==='pending'?'new':'bad'}">${{approved:'опубликован',pending:'на проверке',hidden:'скрыт'}[b.status]}</span></td><td class="actions">${b.status!=='approved'?`<button class="btn p sm2" ${ACT('bst',{id:b.id,v:'approved'})}>Опубликовать</button>`:''}${b.status!=='hidden'?`<button class="btn s2 sm2" ${ACT('bst',{id:b.id,v:'hidden'})}>Скрыть</button>`:''}</td></tr>`).join('')||'<tr><td class="s mut">Пока нет</td></tr>'}</tbody></table></div>`;
A.bst=async el=>{await W(()=>zdoc('biz',el.dataset.id).update({status:el.dataset.v}),'Готово')};

AD.orders=()=>{const os=sortAt(D.orders.filter(o=>['bump','shop','biz','parking','task'].includes(o.type)));
  return `<h1>Оплаты и заказы</h1><p class="sub">Поднятия и лавку подтверждает Тредо. Взносы и сборы подтверждает ОСИ в своём кабинете.</p><div class="panel tblw"><table class="tbl2"><thead><tr><th>Что</th><th>Кто</th><th>Сумма</th><th>Статус</th><th></th></tr></thead><tbody>${os.map(o=>`<tr><td>${esc(o.title||o.type)}${o.items?`<div class="xs mut">${o.items.map(i=>esc(i.t)+' × '+i.n).join(', ')}${o.parcel?', захватить посылку':''}</div>`:''}</td><td>${esc(whoOf(o.by))}${o.apt?', кв. '+esc(o.apt):''}</td><td>${money(o.amount)}</td><td><span class="status ${o.status==='awaiting'?'new':o.status==='paid'||o.status==='done'?'ok':'bad'}">${{awaiting:'ждёт',paid:'оплачено',done:'выполнен',cancelled:'отменён'}[o.status]}</span></td><td class="actions">${o.status==='awaiting'&&['bump','shop'].includes(o.type)?`<button class="btn p sm2" ${ACT('orderst',{id:o.id,v:'paid'})}>Оплачено</button><button class="btn s2 sm2" ${ACT('orderst',{id:o.id,v:'cancelled'})}>Отменить</button>`:o.status==='paid'&&o.type==='shop'?`<button class="btn s2 sm2" ${ACT('orderst',{id:o.id,v:'done'})}>Доставлен</button>`:''}</td></tr>`).join('')||'<tr><td class="s mut">Пока нет</td></tr>'}</tbody></table></div>`};

AD.leads=()=>{const ls=sortAt(D.leads);const l=D.leads.find(x=>x.id===F.lid);return `<h1>Лиды на ремонт</h1><div class="grid2"><div class="panel"><table class="tbl2"><tbody>${ls.map(x=>`<tr style="cursor:pointer" ${ACT('pick',{f:'lid',v:x.id})}><td><b class="s">${esc(x.kind)}${x.size?', '+esc(x.size):''}</b><div class="xs mut">${esc(whoOf(x.by))}, ${rel(x.at)}</div></td><td>${D.offers.filter(o=>o.lead===x.id).length} предл.</td><td><span class="status ${x.chosen?'ok':'new'}">${x.chosen?'замер':'открыт'}</span></td></tr>`).join('')||'<tr><td class="s mut">Пока нет</td></tr>'}</tbody></table></div>
  ${l?`<div class="panel"><h3>${esc(l.kind)}</h3><p class="s">${esc(l.desc||'')}</p>${l.chosen?`<p class="s g b mt2">Житель выбрал: ${esc(D.offers.find(o=>o.id===l.chosen)?.company||'')}. Передайте контакт подрядчику: ${esc(nameOf(l.by))}, кв. ${esc(mem(l.by)?.apt||'')}</p>`:''}
  <div class="frm mt">${L('Подрядчик',FIN('oc','Тёплый балкон',{max:60}))}<div class="row2">${L('Цена, ₸',FIN('op','',{mode:'numeric',max:9}))}${L('Срок, дней',FIN('od','10',{mode:'numeric',max:3}))}</div><div class="row2">${L('Квартир в ЖК',FIN('ow','14',{mode:'numeric',max:4}))}${L('Комментарий',FIN('on','',{max:120}))}</div><div class="flex between s">Чаще выбирают соседи${CHK(F.opop,ACT('togf',{f:'opop'}))}</div><button class="btn p" ${ACT('addoffer',{id:l.id})}>Добавить предложение</button></div></div>`:''}</div>`};
A.addoffer=async el=>{const c=fv('oc');if(!c)return;await W(()=>col('offers').add({lead:el.dataset.id,company:c,price:num('op'),days:fv('od'),works:num('ow')||0,note:fv('on'),popular:!!F.opop,at:now()}),'Предложение отправлено жителю');F={lid:el.dataset.id};R()};

AD.shop=()=>`<h1>Лавка в доме</h1><div class="grid2"><div class="panel"><h3>Товары</h3><table class="tbl2"><tbody>${D.shop.map(x=>`<tr><td>${esc(x.name)}<div class="xs mut">${esc(x.cat)}</div></td><td>${money(x.price)}</td><td class="actions"><button class="btn s2 sm2" ${ACT('shopon',{id:x.id,v:x.on===false?'1':''})}>${x.on===false?'Вернуть':'Скрыть'}</button></td></tr>`).join('')||'<tr><td class="s mut">Пусто</td></tr>'}</tbody></table></div>
  <div class="panel"><h3>Добавить товар</h3><div class="frm">${L('Название',FIN('sn','Молоко 2,5%, 1 л',{max:60}))}<div class="row2">${L('Категория',FIN('sc','Завтрак',{max:30}))}${L('Цена, ₸',FIN('sp','',{mode:'numeric',max:7}))}</div><button class="btn p" ${ACT('addshop')}>Добавить</button></div></div></div>`;
A.addshop=async()=>{const n=fv('sn');if(!n)return;await W(()=>col('shop').add({name:n,cat:fv('sc')||'Разное',price:num('sp')||0,on:true,at:now()}),'Добавлено');F={};R()};
A.shopon=async el=>{await W(()=>zdoc('shop',el.dataset.id).update({on:!!el.dataset.v}))};

AD.settings=()=>{const s=D.settings;if(F.init!==3){F.init=3;F.b1=s.bump1||'';F.b3=s.bump3||'';F.pi=s.payInfo||'';F.cf=s.crowdFee??'';F.pf=s.parkFee??'';F.spt=s.sponsor?.text||'';F.spon=!!s.sponsor?.on;F.se=s.shopEta||'';F.si=s.shopInfo||''}
  return `<h1>Тарифы и партнёр недели</h1><div class="grid2"><div class="panel"><div class="frm"><div class="row2">${L('Поднятие на 1 день, ₸',FIN('b1','500',{mode:'numeric',max:6}))}${L('На 3 дня, ₸',FIN('b3','1200',{mode:'numeric',max:6}))}</div>
  ${L('Реквизиты Тредо для оплаты',FTA('pi','Kaspi: … , получатель ТОО «Тредо»',{max:400}))}<div class="row2">${L('Сбор со сборов, %',FIN('cf','5',{mode:'numeric',max:2}))}${L('Сбор с парковки, %',FIN('pf','10',{mode:'numeric',max:2}))}</div>
  <div class="row2">${L('Лавка: время доставки',FIN('se','≈ 15 мин до двери',{max:30}))}${L('Лавка: подпись',FIN('si','Склад на первом этаже 3 подъезда',{max:60}))}</div></div></div>
  <div class="panel"><h3>Партнёр недели в дайджесте</h3><div class="frm"><div class="flex between s">Показывать${CHK(F.spon,ACT('togf',{f:'spon'}))}</div>${L('Текст',FIN('spt','Кофейня открылась у шлагбаума: −15% жителям',{max:120}))}
  <div class="flex">${s.sponsor?.logo?`<img src="${blob(s.sponsor.logo)}" alt="" style="width:48px;height:48px;border-radius:12px;object-fit:cover">`:''}<button class="btn s2 sm2" ${ACT('sponlogo')}>${s.sponsor?.logo?'Заменить логотип':'Загрузить логотип'}</button></div></div>
  <div class="actions mt"><button class="btn p" ${ACT('savesettings2')}>Сохранить всё</button></div></div></div>`};
A.sponlogo=async()=>{const ids=await pickPhotos(1);if(ids[0])await W(()=>C.db.doc('platform/settings').set({...stripId(D.settings),sponsor:{...(D.settings.sponsor||{}),logo:ids[0]}}),'Логотип загружен')};
const stripId=o=>{const c={...o};delete c.id;return c};
A.savesettings2=async()=>{const s=stripId(D.settings);await W(()=>C.db.doc('platform/settings').set({...s,bump1:num('b1')||500,bump3:num('b3')||1200,payInfo:fv('pi'),crowdFee:Number(F.cf)||0,parkFee:Number(F.pf)||0,shopEta:fv('se'),shopInfo:fv('si'),sponsor:{...(s.sponsor||{}),on:!!F.spon,text:fv('spt')}}),'Сохранено')};

AD.data=()=>{const demo=ZK_COLS.reduce((s,c)=>s+D[c].filter(x=>x.demo).length,0);return `<h1>Данные</h1><div class="grid2"><div class="panel"><h3>Демо-данные</h3><p class="s">В текущем ЖК ${demo} демо-записей (пометка demo). Удалите их перед запуском с настоящими жителями.</p><div class="actions mt"><button class="btn s2" ${ACT('cleardemo')} ${demo?'':'disabled'}>Удалить демо-данные</button></div></div>
  <div class="panel"><h3>Выгрузка</h3><p class="s">Все данные текущего ЖК одним JSON-файлом: для переноса в Supabase.</p><div class="actions mt"><button class="btn p" ${ACT('exportzk')}>Скачать JSON</button></div></div></div>`};
A.cleardemo=async()=>{if(!confirm('Удалить все демо-записи текущего ЖК?'))return;let n=0;for(const c of ZK_COLS){for(const x of D[c].filter(x=>x.demo)){try{await zdoc(c,x.id).delete();n++}catch(e){}}}toast('Удалено записей: '+n)};
A.exportzk=()=>{const out={zk:zk(),exportedAt:new Date().toISOString()};ZK_COLS.concat(['msgs']).forEach(c=>out[c]=D[c]);out.votes=D.votes;out.ovotes=D.ovotes;out.acks=D.acks;saveFile('sosedi-'+ZID+'-'+dayKey(now())+'.json',JSON.stringify(out,null,1))};

/* =====================================================================
   Обработчики и запуск
   ===================================================================== */
document.addEventListener('click',e=>{const t=e.target;const stop=t.closest('[data-stop]');const bg=t.closest('[data-act="sheetbg"]');
  const a=t.closest('[data-act]');if(a&&!(a.dataset.act==='sheetbg'&&stop)){if(a.disabled)return;const fn=A[a.dataset.act];if(fn){e.preventDefault();Promise.resolve(fn(a,e)).catch(err=>{console.error(err);toast('Что-то пошло не так','err')})}return}
  const g=t.closest('[data-go]');if(g){e.preventDefault();go(g.dataset.go,{id:g.dataset.id,v:g.dataset.v})}});
document.addEventListener('input',e=>{const el=e.target;if(el.dataset&&el.dataset.f){F[el.dataset.f]=el.type==='checkbox'?el.checked:el.value;if(el.dataset.live)R()}});
document.addEventListener('change',e=>{const el=e.target;if(el.dataset&&el.dataset.actChange&&A[el.dataset.actChange])A[el.dataset.actChange](el)});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&e.target.matches('.compose textarea')){e.preventDefault();const b=e.target.closest('.compose').querySelector('[data-act]');if(b)b.click()}
  if(e.key==='Escape'&&NAVS.sheet){NAVS.sheet=null;R()}
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('[role="button"][data-go]')){e.preventDefault();e.target.click()}});

function readHash(){const h=location.hash.slice(1);
  if(h.startsWith('invite-')){const [,z,code]=h.split('-');PENDING_INVITE={zk:z,code};MODE='app';return}
  if(h.startsWith('showcase-')){MODE='app';SHOWCASE=h.slice(9);return}
  MODE=h==='osi'?'osi':h==='admin'?'admin':'app'}
let SHOWCASE=null;
addEventListener('hashchange',()=>{readHash();if(PENDING_INVITE)applyInvite();R()});
async function applyInvite(){if(!PENDING_INVITE||!C.ready)return;const p=D.profile||{};
  if(!p.zk||p.zk!==PENDING_INVITE.zk){await setPref({zk:PENDING_INVITE.zk});subZk(PENDING_INVITE.zk)}
  NAVS.stack=[{r:me()?'ob-verify':'ob-addr',p:{}}];if(me()?.verified){PENDING_INVITE=null;NAVS.stack=[{r:'home',p:{}}];toast('Ваш адрес уже подтверждён')}R()}

async function boot(){readHash();R();
  const cl=window.claude;if(!cl||!cl.use){C.nodb=true;R();return}
  const [db,user,assets,dl,sample]=await Promise.all(['db','user','assets','downloads','sample'].map(n=>cl.use(n).catch(()=>null)));
  C.db=db;C.user=user;C.assets=assets;C.dl=dl;C.sample=sample;
  if(!db||!user){C.nodb=true;R();return}
  C.uid=await user.id();C.admin=await user.canEdit();C.owner=await user.isOwner();C.write=await user.can('data.write');
  if(!C.uid){C.nodb=true;R();return}
  if(SHOWCASE){const s=await db.doc('public/zk-'+SHOWCASE).get().catch(()=>null);D.showcaseDoc=s&&s.exists?s.data():null;C.ready=true;R();return}
  sub('zks',db.collection('zk'));sub('waitlist',db.collection('waitlist').limit(1000));
  sub('votes',db.collection('votes'));sub('ovotes',db.collection('ovotes'));sub('acks',db.collection('acks'));
  SUBS.settings=db.doc('platform/settings').onSnapshot(s=>{D.settings=s.exists?s.data():{};R()},()=>{});
  let first=true;
  SUBS.profile=db.doc('data/users/'+C.uid+'/me').onSnapshot(s=>{D.profile=s.exists?s.data():{};D.loaded.profile=true;
    if(first){first=false;if(D.profile.zk)subZk(D.profile.zk);if(PENDING_INVITE)setTimeout(applyInvite,600)}
    if(D.profile.zk&&D.profile.zk!==ZID&&MODE==='app')subZk(D.profile.zk);R()},e=>{D.loaded.profile=true;D.profile={};R()});
  C.ready=true;R()}
/* витрина для гостей без входа в ЖК */
const _appHTML=appHTML;
appHTML=function(){if(SHOWCASE){if(!C.ready)return loadingScr('Загружаем…',1);const p=D.showcaseDoc;return SCRN({nav:`<div class="hdr">${LOGO(30)}<span class="xs mut">tredo · витрина ЖК</span></div>`,body:p?showcaseCard(p):EMPTY('building','Витрина не опубликована')})}
  if(ZID&&D.publicSub!==ZID){D.publicSub=ZID;if(SUBS.pub)SUBS.pub();SUBS.pub=C.db.doc('public/zk-'+ZID).onSnapshot(s=>{D.publicZk=s.exists?s.data():null;R()},()=>{})}
  return _appHTML()};
boot();

