/* =====================================================================
   Кабинет председателя ОСИ (#osi)
   ===================================================================== */
let OSEC='overview';
const ADMSHELL=(title,sub,nav,active,body,actName)=>`<div class="adm"><aside><div class="flex" style="gap:8px;padding:0 8px">${LOGO(24)}<div><div class="t" style="padding:0">${title}</div><div class="s" style="padding:0">${sub}</div></div></div>
  <nav>${nav.map(([k,l,c])=>`<button class="${active===k?'on':''}" ${ACT(actName,{v:k})}><span>${l}</span>${c?`<span class="cnt">${c}</span>`:''}</button>`).join('')}</nav></aside><main>${body}</main></div>`;
const dtl=t=>{if(!t)return'';const d=new Date(t);const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`};
const dtv=k=>{const v=fv(k);return v?new Date(v).getTime():null};
const L=(l,html)=>`<label>${l}${html}</label>`;

function osiHTML(){if(!ZID||!zk())return `<div class="gate"><h2 class="h2">Нет выбранного ЖК</h2><p class="sub mt2">Сначала войдите в приложение жителя и выберите ЖК.</p></div>`;
  if(!isOsi())return `<div class="gate"><h2 class="h2">Кабинет только для председателя ОСИ</h2><p class="sub mt2">Роль председателя назначает модератор Тредо.</p></div>`;
  const z=zk();const openReq=D.osireq.filter(r=>!['closed'].includes(r.status));const awaitingFees=D.orders.filter(o=>['fee','crowd'].includes(o.type)&&o.status==='awaiting');
  const nav=[['overview','Обзор'],['requests','Заявки',openReq.filter(r=>r.status==='new'||r.status==='reopened').length],['outages','Отключения'],['news','Объявления'],['ballots','Голосования'],['fees','Взносы',awaitingFees.length],
    ['codes','Коды подъездов'],['zones','Общие зоны'],['season','Сезон и покупки'],['crowd','Сборы'],['passes','Пропуска'],['members','Жители'],['showcase','Витрина ЖК'],['settings','Настройки ОСИ']];
  const fn=OS[OSEC]||OS.overview;let body='';try{body=fn()}catch(e){console.error(e);body='<div class="err-box">Раздел не открылся</div>'}
  return ADMSHELL('ОСИ '+esc(z.name),'Кабинет председателя',nav,OSEC,body,'osec')+toastsHTML()}
const toastsHTML=()=>D.toasts.length?`<div style="position:fixed;left:50%;transform:translateX(-50%);bottom:20px;z-index:60;display:grid;gap:8px;width:min(420px,90vw)">${D.toasts.map(t=>`<div class="toast" ${t.kind==='err'?'style="background:var(--danger)"':''}>${esc(t.text)}</div>`).join('')}</div>`:'';
A.osec=el=>{OSEC=el.dataset.v;F={};R();scrollTo(0,0)};
const OS={};
const verifiedN=()=>D.members.filter(m=>m.verified).length;
const aptsTotal=()=>{const z=zk();return (z?.entrances||1)*(z?.aptsPerEntrance||60)};

OS.overview=()=>{const f=curFee();const paid=f?D.orders.filter(o=>o.type==='fee'&&o.ref===f.id&&o.status==='paid').length:0;const open=D.osireq.filter(r=>!['closed','done'].includes(r.status));
  const late=open.filter(r=>now()-r.at>3*86400000);const done=D.osireq.filter(r=>r.doneAt);const avg=done.length?(done.reduce((s,r)=>s+(r.doneAt-r.at),0)/done.length/86400000):null;
  const fw=sortAt(D.posts.filter(p=>p.kind==='poll'&&p.forwarded&&!p.osiDone));const outRep=D.outages.filter(o=>outageActive(o)||o.end>now()-86400000).map(o=>[o,ackCount('out_'+o.id)]).filter(x=>x[1]);
  return `<div class="flex between"><h1>${new Date().toLocaleString('ru-RU',{month:'long'}).replace(/^./,c=>c.toUpperCase())}</h1><button class="btn p" ${ACT('osec',{v:'news'})}>Новое объявление</button></div>
  <div class="kpis2"><div class="kpi2"><span>Взносы оплачены</span><b>${f&&verifiedN()?Math.round(paid/verifiedN()*100):0}%</b><span>${f?esc(f.title||f.period):'взнос не выставлен'}</span></div>
  <div class="kpi2"><span>Открытые заявки</span><b>${open.length}</b><span class="${late.length?'w':''}">${late.length} дольше 3 дней</span></div>
  <div class="kpi2"><span>Среднее время решения</span><b>${avg?avg.toFixed(1).replace('.',',')+' дня':'—'}</b><span>по ${done.length} заявкам</span></div>
  <div class="kpi2"><span>Квартир в приложении</span><b>${Math.round(verifiedN()/aptsTotal()*100)}%</b><span>${verifiedN()} из ${aptsTotal()}</span></div></div>
  <div class="grid2"><div class="panel"><h3>Заявки, требующие решения</h3>${reqTable(sortAt(open).slice(0,8))}</div>
  <div class="panel"><h3>Голос жителей</h3>${fw.length?fw.map(p=>{const t=tally(p);return `<div style="padding:8px 0;border-bottom:1px solid var(--line)"><b class="s">${esc(p.title)}</b><p class="xs mut">${p.poll.options.map((o,i)=>esc(o)+': '+t.res[i]).join(', ')}. Подъезд: ${p.scope==='entrance'?p.entrance:'весь ЖК'}</p><div class="actions mt2"><button class="btn p sm2" ${ACT('poll2ballot',{id:p.id})}>Создать голосование</button><button class="btn s2 sm2" ${ACT('pollseen',{id:p.id})}>Принято к сведению</button></div></div>`}).join(''):'<p class="s mut">Жители пока не передавали опросы.</p>'}
  ${outRep.length?`<h3 class="mt3">Жители сообщают «воды нет»</h3>${outRep.map(([o,n])=>`<p class="s">${esc(o.title)}: <b>${n}</b> ${plural(n,'квартира','квартиры','квартир')}</p>`).join('')}`:''}</div></div>`};
const reqTable=rs=>rs.length?`<div class="tblw"><table class="tbl2"><thead><tr><th>№</th><th>Проблема</th><th>Подъезд</th><th>Жалоб</th><th>Статус</th></tr></thead><tbody>${rs.map(r=>`<tr style="cursor:pointer" ${ACT('openreq',{id:r.id})}><td>${esc(r.num)}</td><td>${esc(r.title)}${r.repeat?' <span class="status bad">повторно</span>':''}<div class="xs mut">${esc(r.cat)}, ${rel(r.at)}</div></td><td>${r.entrance}</td><td>${(r.joiners||[]).length+1}</td><td><span class="status ${r.status==='new'||r.status==='reopened'?'new':r.status==='done'||r.status==='closed'?'ok':''}">${OSIST[r.status]}</span></td></tr>`).join('')}</tbody></table></div>`:'<p class="s mut">Заявок нет.</p>';
A.openreq=el=>{OSEC='requests';F={req:el.dataset.id};R()};

OS.requests=()=>{const st=F.st||'open';const rs=sortAt(D.osireq.filter(r=>st==='all'||(st==='open'?!['closed','done'].includes(r.status):r.status===st)));const r=D.osireq.find(x=>x.id===F.req);
  return `<h1>Заявки жителей</h1><div class="mt">${PICK('st',[['open','Открытые'],['done','Ждут подтверждения'],['closed','Закрытые'],['all','Все']],{def:'open'})}</div>
  <div class="grid2"><div class="panel">${reqTable(rs)}</div>${r?`<div class="panel"><div class="flex between"><h3>№${esc(r.num)}: ${esc(r.title)}</h3><button class="nb" ${ACT('pick',{f:'req',v:''})}>${I('close',18)}</button></div>
  <p class="s mut">${esc(r.cat)}, ${esc(r.where)}, ${r.house?'дом '+esc(r.house)+', ':''}${r.entrance} подъезд, кв. ${esc(r.apt||'')}. От ${esc(nameOf(r.by))}${(r.joiners||[]).length?`, ещё ${(r.joiners||[]).length}: ${r.joiners.map(nameOf).map(esc).join(', ')}`:''}.</p>
  ${r.text?`<p class="s mt2">${esc(r.text)}</p>`:''}${(r.photos||[]).length?`<div class="thumbs mt2">${r.photos.map(id=>`<a class="thumb" href="${blob(id)}" target="_blank" rel="noopener" style="background-image:url('${blob(id)}')"></a>`).join('')}</div>`:''}
  <div class="mt">${(r.timeline||[]).map(t=>`<p class="xs"><b>${dmy(t.at)} ${hm(t.at)}</b> ${esc(t.t)}${t.note?': '+esc(t.note):''}</p>`).join('')}</div>
  <div class="frm mt">${L('Новый статус',FSEL('nst',[['assigned','Назначен исполнитель'],['progress','В работе'],['done','Выполнена, ждём подтверждения жителя'],['closed','Закрыть без подтверждения']],{v:'assigned'}))}
  ${L('Комментарий для жителя',FIN('nnote','Болат, придёт в пт 10–12',{max:200}))}<div class="actions"><button class="btn p" ${ACT('reqstatus',{id:r.id})}>Обновить заявку</button></div></div>
  ${r.confirm?`<p class="s mt2 ${r.confirm==='ok'?'g':'r'} b">Житель: ${r.confirm==='ok'?'исправлено':'не исправлено'}</p>`:''}</div>`:''}</div>`};
A.reqstatus=async el=>{const r=D.osireq.find(x=>x.id===el.dataset.id);const s=F.nst||'assigned';
  await W(()=>zdoc('osireq',r.id).update({status:s,updAt:now(),doneAt:s==='done'?now():r.doneAt||null,timeline:[...(r.timeline||[]),{t:OSIST[s],note:fv('nnote'),at:now()}]}),'Заявка обновлена, житель увидит');F={req:r.id};R()};

OS.outages=()=>{const os=sortAt(D.outages,'start');const z=zk();
  return `<h1>Отключения</h1><div class="grid2"><div class="panel"><h3>Новое отключение</h3><div class="frm">
  ${L('Что отключат',FSEL('ot',[['Нет горячей воды','Горячая вода'],['Нет холодной воды','Холодная вода'],['Нет света','Свет'],['Не работает лифт','Лифт'],['Нет отопления','Отопление'],['Нет газа','Газ']],{v:'Нет горячей воды'}))}
  <div class="row2">${L('Начало',`<input class="inp" type="datetime-local" data-f="os" value="${esc(F.os||'')}">`)}${L('Конец',`<input class="inp" type="datetime-local" data-f="oe" value="${esc(F.oe||'')}">`)}</div>
  ${L('Подъезды (пусто — весь ЖК)',PICK('oents',Array.from({length:z.entrances},(_,i)=>[String(i+1),i+1+' подъезд']),{multi:1}))}
  ${L('Стояки',FIN('ori','стояки 1–4',{max:40}))}${L('Причина',FIN('orea','Замена задвижки в подвале',{max:120}))}${L('Совет жителям',FIN('otip','Включите бойлер с вечера',{max:200}))}
  ${L('Тип',SEGF('opl',[['1','Плановое'],['0','Аварийное']],{def:'1'}))}<div class="actions"><button class="btn p" ${ACT('newoutage')}>Опубликовать</button></div></div></div>
  <div class="panel"><h3>Все отключения</h3>${os.length?`<table class="tbl2"><tbody>${os.map(o=>`<tr><td><b class="s">${esc(o.title)}</b><div class="xs mut">${outageWhen(o)}, ${o.entrances?.length?o.entrances.join(', ')+' подъезд':'весь ЖК'}</div></td><td class="xs">«воды нет»: ${ackCount('out_'+o.id)}</td><td>${o.status==='cancelled'?'<span class="status bad">отменено</span>':o.end<now()?'<span class="status">прошло</span>':`<button class="btn s2 sm2" ${ACT('cancelout',{id:o.id})}>Отменить</button>`}</td></tr>`).join('')}</tbody></table>`:'<p class="s mut">Пока нет.</p>'}</div></div>`};
A.newoutage=async()=>{const s=dtv('os'),e=dtv('oe');if(!s||!e||e<=s){toast('Укажите начало и конец','err');return}
  await W(()=>col('outages').add({title:F.ot||'Нет горячей воды',start:s,end:e,entrances:(F.oents||[]).map(Number),risers:fv('ori'),reason:fv('orea'),tip:fv('otip'),planned:String(F.opl??'1')==='1',status:'active',by:C.uid,at:now()}),'Опубликовано, жители увидят на главной');F={};R()};
A.cancelout=async el=>{await W(()=>zdoc('outages',el.dataset.id).update({status:'cancelled'}),'Отменено')};

OS.news=()=>{const ns=sortAt(D.news);return `<h1>Объявления ОСИ</h1><p class="sub">Показываются жителям как сторис на главной. Жители отмечают «Понятно», вы видите охват.</p>
  <div class="grid2"><div class="panel"><h3>Новое объявление</h3><div class="frm">${L('Заголовок',FIN('nt','Лифт остановят на ремонт',{max:80}))}${L('Когда',FIN('nw','Пятница, 25 октября, с 9:00 до 15:00',{max:80}))}${L('Текст',FTA('ntx','Меняем трос и тормозную систему',{max:1500}))}
  ${L('Для кого',FSEL('ne',[['','Весь ЖК'],...Array.from({length:zk().entrances},(_,i)=>[i+1,i+1+' подъезд'])]))}<div class="actions"><button class="btn p" ${ACT('newnews')}>Опубликовать</button></div></div></div>
  <div class="panel"><h3>Опубликованные</h3>${ns.length?ns.map(n=>`<div style="padding:10px 0;border-bottom:1px solid var(--line)"><div class="flex between"><b class="s">${esc(n.title)}</b><button class="btn s2 sm2" ${ACT('delnews',{id:n.id})}>Удалить</button></div><p class="xs mut">${rel(n.at)}, прочитали «Понятно»: ${ackCount('n_'+n.id)} из ${verifiedN()}</p></div>`).join(''):'<p class="s mut">Пока нет.</p>'}</div></div>`};
A.newnews=async()=>{const t=fv('nt');if(!t){toast('Заголовок?','err');return}await W(()=>col('news').add({title:t,when:fv('nw'),text:fv('ntx'),entrance:F.ne?Number(F.ne):null,by:C.uid,at:now()}),'Опубликовано');F={};R()};
A.delnews=async el=>{if(confirm('Удалить объявление?'))await W(()=>zdoc('news',el.dataset.id).delete(),'Удалено')};

OS.ballots=()=>{const bs=sortAt(D.ballots);const pre=F.from?D.posts.find(p=>p.id===F.from):null;
  return `<h1>Официальные голосования</h1><p class="sub">Голос считается по площади квартиры. Житель подтверждает номер квартиры, протокол выгружается файлом.</p>
  <div class="grid2"><div class="panel"><h3>Новое голосование</h3>${pre?`<p class="xs g b">По опросу жителей: «${esc(pre.title)}»</p>`:''}<div class="frm">${L('Вопрос',FIN('bt','Заменить лифты во 2 подъезде за счёт фонда капремонта',{max:140,v:pre?.title}))}${L('Пояснение',FTA('btx','Смета, сроки, подрядчики',{max:2000}))}
  <div class="row2">${L('Завершить',`<input class="inp" type="date" data-f="bd" value="${esc(F.bd||'')}">`)}${L('Кворум, %',FIN('bq','50',{mode:'numeric',max:3}))}</div>
  ${L('Документы (название | ссылка, по строке)',FTA('bdocs','Смета, PDF | https://…',{max:1000}))}<div class="actions"><button class="btn p" ${ACT('newballot')}>Запустить голосование</button></div></div></div>
  <div class="panel"><h3>Голосования</h3>${bs.length?bs.map(b=>{const r=ballotRes(b);return `<div style="padding:10px 0;border-bottom:1px solid var(--line)"><b class="s">${esc(b.title)}</b><p class="xs mut">${b.status==='open'?'до '+dmy(b.deadline):'завершено'}. За ${r.pct('za')}%, против ${r.pct('pr')}%, воздержались ${r.pct('vz')}%. Явка ${r.quorum}% площади, ${r.n} кв.</p>
  <div class="actions mt2">${b.status==='open'?`<button class="btn p sm2" ${ACT('closeballot',{id:b.id})}>Завершить и подвести итог</button>`:''}<button class="btn s2 sm2" ${ACT('protocol',{id:b.id})}>Протокол</button></div>
  ${b.status!=='open'?`<div class="frm mt2">${`<input class="inp" data-f="bn_${b.id}" value="${esc(F['bn_'+b.id]??b.next??'')}" placeholder="Что дальше: до 1 дек — договор с подрядчиком">`}<button class="btn s2 sm2" ${ACT('ballotnext',{id:b.id})}>Сохранить план</button></div>`:''}</div>`}).join(''):'<p class="s mut">Пока нет.</p>'}</div></div>`};
A.poll2ballot=el=>{OSEC='ballots';F={from:el.dataset.id};R()};
A.pollseen=async el=>{await W(()=>zdoc('posts',el.dataset.id).update({osiDone:true}))};
A.newballot=async()=>{const t=fv('bt')||D.posts.find(p=>p.id===F.from)?.title;const d=fv('bd');if(!t||!d){toast('Вопрос и дата завершения обязательны','err');return}
  const docs=fv('bdocs').split('\n').map(l=>l.split('|').map(s=>s.trim())).filter(x=>x[0]).map(([t,url])=>({t,url:/^https?:\/\//.test(url||'')?url:''}));
  await W(async()=>{await col('ballots').add({title:t,text:fv('btx'),deadline:new Date(d+'T23:59').getTime(),quorum:num('bq')||50,docs,status:'open',fromPoll:F.from||null,by:C.uid,at:now()});if(F.from)await zdoc('posts',F.from).update({osiDone:true})},'Голосование запущено');F={};R()};
A.closeballot=async el=>{if(confirm('Завершить голосование?'))await W(()=>zdoc('ballots',el.dataset.id).update({status:'closed',closedAt:now()}),'Голосование завершено')};
A.ballotnext=async el=>{await W(()=>zdoc('ballots',el.dataset.id).update({next:fv('bn_'+el.dataset.id)}),'Сохранено')};

OS.fees=()=>{const fs=sortAt(D.fees,'period');const aw=sortAt(D.orders.filter(o=>['fee','crowd'].includes(o.type)&&o.status==='awaiting'));const f=fs[0];
  if(!F.items)F.items=[{t:'Содержание дома',perM2:''},{t:'Фонд капремонта',perM2:''},{t:'Уборка и вывоз',flat:''}];
  return `<h1>Взносы</h1><div class="grid2"><div class="panel"><h3>Ждут подтверждения оплаты</h3>${aw.length?`<table class="tbl2"><tbody>${aw.map(o=>`<tr><td><b class="s">${esc(nameOf(o.by))}</b><div class="xs mut">${mem(o.by)?.entrance} подъезд, кв. ${esc(mem(o.by)?.apt||o.apt||'')}, ${esc(o.title)}</div></td><td>${money(o.amount)}</td><td class="actions"><button class="btn p sm2" ${ACT('orderst',{id:o.id,v:'paid'})}>Поступило</button><button class="btn s2 sm2" ${ACT('orderst',{id:o.id,v:'cancelled'})}>Нет</button></td></tr>`).join('')}</tbody></table>`:'<p class="s mut">Нет новых отметок об оплате.</p>'}
  ${f?`<h3 class="mt3">${esc(f.title||f.period)}: оплатили ${D.orders.filter(o=>o.type==='fee'&&o.ref===f.id&&o.status==='paid').length} из ${verifiedN()}</h3>`:''}</div>
  <div class="panel"><h3>Выставить взнос за месяц</h3><div class="frm"><div class="row2">${L('Месяц',`<input class="inp" type="month" data-f="fp" value="${esc(F.fp||periodKey(now()))}">`)}${L('Оплатить до',`<input class="inp" type="date" data-f="fd" value="${esc(F.fd||'')}">`)}</div>
  ${F.items.map((it,i)=>`<div class="row2"><input class="inp" data-f="it${i}" value="${esc(F['it'+i]??it.t)}" placeholder="Статья"><input class="inp" data-f="iv${i}" value="${esc(F['iv'+i]??(it.perM2||it.flat||''))}" placeholder="${it.flat!=null?'₸ с квартиры':'₸ за м²'}" inputmode="decimal"></div>`).join('')}
  <div class="actions"><button class="btn s2 sm2" ${ACT('feeitem',{v:'perM2'})}>+ статья за м²</button><button class="btn s2 sm2" ${ACT('feeitem',{v:'flat'})}>+ с квартиры</button></div>
  ${L('Отчёт: на что ушли деньги прошлого месяца',FTA('frep','Ремонт кровли 3 подъезда, замена ламп',{max:600}))}<div class="actions"><button class="btn p" ${ACT('newfee')}>Выставить взнос</button></div></div></div></div>`};
A.feeitem=el=>{F.items=[...F.items,el.dataset.v==='flat'?{t:'',flat:''}:{t:'',perM2:''}];R()};
A.newfee=async()=>{const p=fv('fp')||periodKey(now());const [y,m]=p.split('-').map(Number);
  const items=F.items.map((it,i)=>{const t=String(F['it'+i]??it.t).trim();const v=Number(String(F['iv'+i]??'').replace(',','.'))||0;return t&&v?(it.flat!=null?{t,flat:v}:{t,perM2:v}):null}).filter(Boolean);
  if(!items.length){toast('Добавьте хотя бы одну статью с суммой','err');return}
  await W(()=>zdoc('fees',p).set({period:p,title:MONN[m-1]+' '+y,due:F.fd?new Date(F.fd+'T23:59').getTime():null,items,report:fv('frep'),at:now()}),'Взнос выставлен, жители увидят');F={};R()};
A.orderst=async el=>{const o=D.orders.find(x=>x.id===el.dataset.id);const v=el.dataset.v;
  await W(async()=>{await zdoc('orders',o.id).update({status:v,updAt:now(),by2:C.uid});if(v==='paid'&&o.type==='bump'){await zdoc('posts',o.ref).update({bumpUntil:now()+(o.days||1)*86400000})}},v==='paid'?'Оплата подтверждена':'Отклонено')};

const codeKeys=()=>{const z=zk();const hs=z.houses||[];const ents=Array.from({length:z.entrances},(_,i)=>i+1);return hs.length?hs.flatMap(h=>ents.map(e=>({k:h+'-'+e,h,e}))):ents.map(e=>({k:String(e),h:'',e}))};
OS.codes=()=>{const z=zk();const plain=D.profile?.codes?.[ZID]||{};
  return `<h1>Коды подъездов</h1><p class="sub">Код печатается на листовке у лифта. По нему жители подтверждают адрес. Меняйте коды 1-го числа каждого месяца.</p>
  <div class="panel"><table class="tbl2"><thead><tr>${(z.houses||[]).length?'<th>Дом</th>':''}<th>Подъезд</th><th>Код</th><th>Выпущен</th><th>Подтвердили</th></tr></thead><tbody>${codeKeys().map(({k,h,e})=>`<tr>${h?`<td>${esc(h)}</td>`:''}<td>${e}</td><td><b style="letter-spacing:.2em">${esc(plain[k]||'••••••')}</b></td><td class="xs">${z.codes?.[k]?.at?dmy(z.codes[k].at):'не выпущен'}</td><td>${D.members.filter(m=>m.entrance===e&&(!h||m.house===h)&&m.verified).length}</td></tr>`).join('')}</tbody></table>
  <div class="actions mt"><button class="btn p" ${ACT('gencodes')}>Выпустить новые коды</button>${Object.keys(plain).length?`<button class="btn s2" ${ACT('printcodes')}>Скачать листовки</button>`:''}</div>
  <p class="xs mut mt2">Сами коды видите только вы: в базе хранится их отпечаток. Если потеряете, просто выпустите новые.</p></div>`};
A.gencodes=async()=>{if(!confirm('Выпустить новые коды? Старые перестанут работать.'))return;const z=zk();const plain={};const codes={};
  for(const {k} of codeKeys()){const c=String(Math.floor(100000+Math.random()*900000));plain[k]=c;codes[k]={hash:await sha(ZID+':'+k+':'+c),at:now()}}
  const ok=await W(()=>C.db.doc('zk/'+ZID).update({codes}),'Коды выпущены');if(ok)await setPref({codes:{...(D.profile?.codes||{}),[ZID]:plain}})};
A.printcodes=()=>{const z=zk();const plain=D.profile?.codes?.[ZID]||{};const url=appUrl('app');
  saveFile('kody-podezdov-'+ZID+'.html',`<!doctype html><html lang="ru"><meta charset="utf-8"><title>Коды подъездов</title><style>body{font-family:sans-serif}.l{page-break-after:always;text-align:center;padding:60px 20px}.c{font-size:64px;letter-spacing:.2em;font-weight:700}</style><body>${Object.entries(plain).map(([k,c])=>`<div class="l"><h1>${esc(z.name)}, ${k.includes('-')?'дом '+esc(k.split('-')[0])+', '+esc(k.split('-')[1]):esc(k)} подъезд</h1><p style="font-size:22px">Отключения воды, соседи, барахолка и мастера теперь в приложении Соседи</p><div style="width:240px;margin:24px auto">${QRSVG(url,6)}</div><p>Код вашего подъезда для подтверждения адреса:</p><div class="c">${esc(c)}</div><p>Действует до 1-го числа следующего месяца</p></div>`).join('')}</body></html>`)};

OS.zones=()=>{const zs=zk().zones||[];const bk=sortAt(D.bookings.filter(b=>b.status==='active'&&b.date>=dayKey(now())),'date').reverse();
  return `<h1>Общие зоны</h1><div class="grid2"><div class="panel"><h3>Зоны</h3>${zs.map(z=>`<div style="padding:8px 0;border-bottom:1px solid var(--line)"><div class="flex between"><b class="s">${esc(z.name)}</b><button class="btn s2 sm2" ${ACT('rmzone',{id:z.id})}>Удалить</button></div><p class="xs mut">${esc(z.place||'')}. Слоты: ${(z.slots||[]).map(esc).join(', ')}</p></div>`).join('')||'<p class="s mut">Пока нет.</p>'}
  <div class="frm mt">${L('Название',FIN('zn','Барбекю',{max:30}))}${L('Где',FIN('zp','у 4 подъезда',{max:40}))}${L('Слоты через запятую',FIN('zs','12:00–15:00, 15:00–18:00, 18:00–21:00',{max:200}))}${L('Условия',FIN('zr','Залог за уборку, тишина после 23:00',{max:200}))}<div class="actions"><button class="btn p" ${ACT('addzone')}>Добавить зону</button></div></div></div>
  <div class="panel"><h3>Ближайшие брони</h3>${bk.length?`<table class="tbl2"><tbody>${bk.map(b=>`<tr><td>${esc(b.zoneName)}</td><td>${esc(b.date)}, ${esc(b.slot)}</td><td>${esc(nameOf(b.by))}, кв. ${esc(mem(b.by)?.apt||'')}</td></tr>`).join('')}</tbody></table>`:'<p class="s mut">Броней нет.</p>'}</div></div>`};
A.addzone=async()=>{const n=fv('zn');if(!n)return;const zs=[...(zk().zones||[]),{id:rid(6),name:n,place:fv('zp'),slots:fv('zs').split(',').map(s=>s.trim()).filter(Boolean),rules:fv('zr')}];await W(()=>C.db.doc('zk/'+ZID).update({zones:zs}),'Зона добавлена');F={};R()};
A.rmzone=async el=>{if(!confirm('Удалить зону?'))return;await W(()=>C.db.doc('zk/'+ZID).update({zones:(zk().zones||[]).filter(z=>z.id!==el.dataset.id)}))};

OS.season=()=>{const gs=sortAt(D.groupbuys);const evs=sortAt(D.events,'date');
  return `<h1>Сезон и совместные покупки</h1><div class="grid2"><div class="panel"><h3>Совместная покупка</h3><div class="frm">${L('Что',FIN('gt','Мойка окон всем подъездом',{max:80}))}${L('Описание',FIN('gd','Снаружи и изнутри, подрядчик проверен ОСИ',{max:200}))}
  ${L('Ступени цены: квартир:цена, через запятую',FIN('gti','1:9000, 10:6000, 25:4500',{max:100}))}${L('До',`<input class="inp" type="date" data-f="gdl" value="${esc(F.gdl||'')}">`)}<div class="actions"><button class="btn p" ${ACT('newgb')}>Запустить</button></div></div>
  ${gs.map(g=>{const ids=D.acks.filter(a=>a['gb_'+g.id]).map(a=>a.id);return `<div style="padding:8px 0;border-top:1px solid var(--line);margin-top:8px"><b class="s">${esc(g.title)}</b> <span class="status ${g.status==='closed'?'':'ok'}">${g.status==='closed'?'закрыта':ids.length+' кв.'}</span><p class="xs mut">${ids.map(id=>esc(nameOf(id)+' кв. '+(mem(id)?.apt||''))).join(', ')||'пока никто'}</p>${g.status!=='closed'?`<button class="btn s2 sm2 mt2" ${ACT('closegb',{id:g.id})}>Закрыть набор</button>`:''}</div>`}).join('')}</div>
  <div class="panel"><h3>Событие сезона</h3><div class="frm">${L('Название',FIN('et','Промывка батарей перед отоплением',{max:80}))}${L('Дата',`<input class="inp" type="date" data-f="ed" value="${esc(F.ed||'')}">`)}${L('Описание',FIN('edsc','Выездная бригада, запись по слотам',{max:120}))}
  ${L('Связать с покупкой',FSEL('egb',[['','Нет'],...gs.filter(g=>g.status!=='closed').map(g=>[g.id,g.title])]))}<div class="flex between s">Запись жителей${CHK(F.esu,ACT('togf',{f:'esu'}))}</div><div class="actions"><button class="btn p" ${ACT('newevent')}>Добавить</button></div></div>
  ${evs.map(e=>`<p class="s mt2">${dmy(e.date)}: ${esc(e.title)}${e.signup?', записались '+ackCount('ev_'+e.id):''} <button class="link xs" ${ACT('delevent',{id:e.id})}>удалить</button></p>`).join('')}
  <h3 class="mt3">Лига подъездов</h3><div class="frm">${L('Приз победителю',FIN('lp',zk().leaguePrize||'ОСИ моет окна в подъезде',{max:80}))}<button class="btn s2 sm2" ${ACT('saveprize')}>Сохранить</button></div></div></div>`};
A.newgb=async()=>{const t=fv('gt');const tiers=fv('gti').split(',').map(s=>s.split(':').map(x=>Number(x.replace(/\D/g,'')))).filter(x=>x[0]&&x[1]).map(([min,price])=>({min,price}));
  if(!t||!tiers.length||!F.gdl){toast('Заполните название, ступени и срок','err');return}await W(()=>col('groupbuys').add({title:t,desc:fv('gd'),tiers,deadline:new Date(F.gdl+'T23:59').getTime(),status:'open',by:C.uid,at:now()}),'Покупка запущена');F={};R()};
A.closegb=async el=>{await W(()=>zdoc('groupbuys',el.dataset.id).update({status:'closed'}),'Набор закрыт')};
A.newevent=async()=>{const t=fv('et');if(!t||!F.ed){toast('Название и дата','err');return}await W(()=>col('events').add({title:t,date:new Date(F.ed+'T12:00').getTime(),desc:fv('edsc'),gb:F.egb||null,signup:!!F.esu,at:now()}),'Событие добавлено');F={};R()};
A.delevent=async el=>{await W(()=>zdoc('events',el.dataset.id).delete())};
A.saveprize=async()=>{await W(()=>C.db.doc('zk/'+ZID).update({leaguePrize:fv('lp')}),'Сохранено')};

OS.crowd=()=>{const cs=sortAt(D.crowd);return `<h1>Сборы на улучшения</h1><p class="sub">Только проекты, одобренные голосованием. Если не соберёте, деньги возвращаются.</p>
  <div class="grid2"><div class="panel"><h3>Новый сбор</h3><div class="frm">${L('Проект',FIN('ct','Новая детская площадка с покрытием',{max:80}))}${L('Описание',FTA('cd','Смета и подрядчик',{max:800}))}
  <div class="row2">${L('Цель, ₸',FIN('cg','2 500 000',{mode:'numeric',max:10}))}${L('До',`<input class="inp" type="date" data-f="cdl" value="${esc(F.cdl||'')}">`)}</div>
  ${L('Голосование-основание',FSEL('cb',[['','Без голосования'],...D.ballots.map(b=>[b.id,b.title])]))}<div class="actions"><button class="btn p" ${ACT('newcrowd')}>Запустить сбор</button></div></div></div>
  <div class="panel"><h3>Сборы</h3>${cs.map(c=>`<div style="padding:8px 0;border-bottom:1px solid var(--line)"><b class="s">${esc(c.title)}</b><p class="xs mut">Обещано ${money(ackSum('cr_'+c.id))} из ${money(c.goal)}, поступило ${money(D.orders.filter(o=>o.type==='crowd'&&o.ref===c.id&&o.status==='paid').reduce((s,o)=>s+o.amount,0))}</p></div>`).join('')||'<p class="s mut">Пока нет.</p>'}<p class="xs mut mt2">Поступления подтверждайте в разделе «Взносы».</p></div></div>`};
A.newcrowd=async()=>{const t=fv('ct');const g=num('cg');if(!t||!g||!F.cdl){toast('Проект, цель и срок','err');return}await W(()=>col('crowd').add({title:t,desc:fv('cd'),goal:g,deadline:new Date(F.cdl+'T23:59').getTime(),ballot:F.cb||null,amounts:[2000,5000,10000],status:'open',at:now()}),'Сбор запущен');F={};R()};

OS.passes=()=>{const q=fv('pc');const found=q?D.passes.find(p=>p.code===q):null;const today=sortAt(D.passes.filter(p=>p.status==='active'&&p.to>now()&&p.from<now()+86400000),'from');
  return `<h1>Гостевые пропуска</h1><div class="grid2"><div class="panel"><h3>Проверить код гостя</h3><div class="frm">${FIN('pc','Код из 6 цифр',{mode:'numeric',max:6,live:1})}</div>
  ${q.length===6?(found?`<div class="mt ${found.status==='active'&&found.from<=now()+900000&&found.to>now()?'card m':'err-box'}"><b>${esc(found.name)}</b><p class="s">${esc(found.place)}${found.plate?', '+esc(found.plate):''}. ${dmy(found.from)}, ${hm(found.from)}–${hm(found.to)}. К жителю: ${found.house?'дом '+esc(found.house)+', ':''}кв. ${esc(found.apt)}.</p><p class="s b">${found.status!=='active'?'Пропуск отозван':found.to<now()?'Срок истёк':found.from>now()+900000?'Ещё не начал действовать':'Пропустить'}</p></div>`:'<div class="err-box mt">Пропуск не найден</div>'):''}</div>
  <div class="panel"><h3>Сегодня и завтра</h3>${today.length?`<table class="tbl2"><tbody>${today.map(p=>`<tr><td>${esc(p.name)}</td><td>${hm(p.from)}–${hm(p.to)}</td><td>${esc(p.place)}</td><td>кв. ${esc(p.apt)}</td></tr>`).join('')}</tbody></table>`:'<p class="s mut">Пропусков нет.</p>'}</div></div>`};

OS.members=()=>{const ms=[...D.members].sort((a,b)=>String(a.house||'').localeCompare(String(b.house||''),'ru',{numeric:true})||a.entrance-b.entrance||String(a.apt).localeCompare(String(b.apt),'ru',{numeric:true}));
  return `<h1>Жители в приложении</h1><p class="sub">${verifiedN()} подтверждённых из ${aptsTotal()} квартир.</p><div class="panel tblw"><table class="tbl2"><thead><tr><th>Имя</th><th>Дом</th><th>Подъезд</th><th>Кв.</th><th>м²</th><th>Адрес</th><th></th></tr></thead><tbody>${ms.map(m=>`<tr><td>${esc(m.name)}${m.role==='osi'?' <span class="status ok">ОСИ</span>':''}</td><td>${esc(m.house||'—')}</td><td>${m.entrance}</td><td>${esc(m.apt)}</td><td>${esc(m.area||'')}</td><td><span class="status ${m.verified?'ok':'new'}">${m.verified?{code:'код',invite:'приглашение',admin:'вручную',osi:'ОСИ'}[m.via]||'да':'не подтверждён'}</span></td><td>${m.verified?'':`<button class="btn p sm2" ${ACT('verifym',{id:m.id})}>Подтвердить</button>`}</td></tr>`).join('')}</tbody></table></div>`};
A.verifym=async el=>{if(confirm('Подтвердить адрес этого жителя?'))await W(()=>zdoc('members',el.dataset.id).update({verified:true,via:'osi',verifiedAt:now()}),'Адрес подтверждён')};

OS.showcase=()=>{const pub=D.publicZk;const done=D.osireq.filter(r=>r.doneAt&&now()-r.at<365*86400000);const avg=done.length?(done.reduce((s,r)=>s+(r.doneAt-r.at),0)/done.length/86400000):null;const z=zk();
  if(F.init!==1){F.init=1;(pub?.ratings||[{t:'Тишина',v:''},{t:'Двор и дети',v:''},{t:'Работа ОСИ',v:''},{t:'Парковка',v:''}]).forEach((r,i)=>{F['rt'+i]=r.t;F['rv'+i]=r.v});F.q=pub?.quote||'';F.dist=pub?.district||'';F.yr=pub?.year||''}
  return `<h1>Витрина ЖК</h1><p class="sub">Публичная страница для покупателей и арендаторов. Без имён и квартир. Ссылка: ${esc(appUrl('showcase-'+ZID))}</p>
  <div class="grid2"><div class="panel"><div class="frm"><div class="row2">${L('Район',FIN('dist','Бостандыкский р-н',{max:40}))}${L('Год сдачи',FIN('yr','2021',{max:4}))}</div>
  ${[0,1,2,3].map(i=>`<div class="row2"><input class="inp" data-f="rt${i}" value="${esc(F['rt'+i]||'')}" placeholder="Критерий"><input class="inp" data-f="rv${i}" value="${esc(F['rv'+i]||'')}" placeholder="Оценка 1–5 из опроса" inputmode="decimal"></div>`).join('')}
  ${L('Цитата жителя (с согласия)',FTA('q','Двор закрытый, дети гуляют сами',{max:240}))}<p class="xs mut">Решено заявок за год: ${done.length}, среднее время: ${avg?avg.toFixed(1):'—'} дня. Посчитается автоматически.</p>
  <div class="actions"><button class="btn p" ${ACT('pubshow',{solved:done.length,avg:avg?avg.toFixed(1).replace('.',','):''})}>Опубликовать витрину</button></div></div></div>
  <div class="panel">${pub?showcaseCard(pub):'<p class="s mut">Ещё не опубликована.</p>'}</div></div>`};
A.pubshow=async el=>{const z=zk();const ratings=[0,1,2,3].map(i=>({t:fv('rt'+i),v:Math.min(5,Math.max(0,Number(String(F['rv'+i]||'').replace(',','.'))||0))})).filter(r=>r.t&&r.v);
  await W(()=>C.db.doc('public/zk-'+ZID).set({name:z.name,city:z.city,entrances:z.entrances,district:fv('dist'),year:fv('yr'),ratings,quote:fv('q'),solved:Number(el.dataset.solved),avgDays:el.dataset.avg||'—',at:now()}),'Витрина опубликована')};

OS.settings=()=>{const z=zk();if(F.init!==2){F.init=2;F.pay=z.payInfo||'';F.ta=z.totalArea||'';F.ape=z.aptsPerEntrance||'';F.dev=z.developer||'';F.war=z.warranty||''}
  return `<h1>Настройки ОСИ</h1><div class="panel"><div class="frm">${L('Реквизиты для оплаты взносов',FTA('pay','Kaspi: +7 7__ ___ __ __, получатель ОСИ «…», назначение: кв. и месяц',{max:600}))}
  <div class="row2">${L('Общая площадь квартир, м² (для кворума)',FIN('ta','12 400',{mode:'decimal',max:8}))}${L('Квартир в подъезде',FIN('ape','60',{mode:'numeric',max:4}))}</div>
  <div class="row2">${L('Застройщик',FIN('dev','',{max:60}))}${L('Гарантия застройщика',FIN('war','2 года, до марта 2028',{max:60}))}</div><div class="actions"><button class="btn p" ${ACT('saveosi')}>Сохранить</button></div></div></div>`};
A.saveosi=async()=>{await W(()=>C.db.doc('zk/'+ZID).update({payInfo:fv('pay'),totalArea:num('ta'),aptsPerEntrance:num('ape')||60,developer:fv('dev'),warranty:fv('war')}),'Сохранено')};

