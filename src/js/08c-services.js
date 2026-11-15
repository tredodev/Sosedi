
/* =====================================================================
   Сервисы из ТЗ: пропуск курьеру и пост охраны, «Помогите с машиной»
   и места во дворе, совместный заказ на подъезд и кабинет поставщика
   ===================================================================== */
const COURIER_SVC=['Wolt','Glovo','Яндекс Еда','Arbuz','Магнум','Kaspi','Другое'];
const CARHELP={jump:'Прикурить аккумулятор',push:'Подтолкнуть или откопать',rope:'Нужен трос',pump:'Накачать колесо',other:'Другое'};
const CARHELP_GEAR={cables:'Провода для прикуривания',rope:'Трос',compressor:'Компрессор',shovel:'Лопата'};
const DOW=['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
const DOWS=['вс','пн','вт','ср','чт','пт','сб'];
const myPlate=()=>(me()?.platesShow||[])[0]||'';
const placeChips=()=>{const z=zk();return [...Array.from({length:z?.entrances||1},(_,i)=>[`У ${i+1} подъезда`,`У ${i+1} подъезда`]),['Гостевая парковка','Гостевая'],['Паркинг','Паркинг'],['У шлагбаума','У шлагбаума']]};

/* ---------- Служебный вход: охрана и поставщик ---------- */
S['ob-staff']=()=>SCRN({nav:NAVB(),body:`<h1 class="h1">Служебный вход</h1><p class="sub">Для охраны и поставщиков ЖК «${esc(zk()?.name)}». Код выдаёт председатель ОСИ или модератор Тредо.</p>
  ${LB('Как вас зовут')}${FIN('sname','Имя или название компании',{max:40})}${LB('Служебный код')}<div class="codein ${F.serr?'err':''}"><input data-f="scode" inputmode="numeric" maxlength="8" value="${esc(F.scode||'')}" placeholder="••••••••"></div>
  ${F.serr?`<div class="errt">${I('alert',15)}<span>${esc(F.serr)}</span></div>`:''}`,foot:BTN('Войти','p',ACT('staffjoin'))});
A.staffjoin=async()=>{const code=fv('scode').replace(/\D/g,'');const name=fv('sname');if(!name){toast('Укажите имя');return}
  const h=await sha(ZID+':staff:'+code);const st=(zk()?.staff||{})[h];if(!st){F.serr='Код не подходит. Уточните его у председателя ОСИ.';R();return}
  const ok=await W(()=>zdoc('members',C.uid).set({name,role:st.role,supplier:st.sup||null,verified:true,via:'staff',entrance:0,apt:'',plates:[],joinedAt:now()}),'Вход выполнен');
  if(ok){await until(()=>me());go('home',{},{root:1})}};
async function makeStaffCode(role,sup){const code=String(Math.floor(10000000+Math.random()*90000000));const h=await sha(ZID+':staff:'+code);
  const staff={...(zk()?.staff||{})};Object.keys(staff).forEach(k=>{if(staff[k].role===role&&(staff[k].sup||null)===(sup||null))delete staff[k]});staff[h]={role,sup:sup||null,at:now()};
  const ok=await W(()=>C.db.doc('zk/'+ZID).update({staff}));if(ok){const key=role+(sup?'_'+sup:'');await setPref({staffCodes:{...(D.profile?.staffCodes||{}),[ZID+'_'+key]:code}})}return ok}
const staffCodeOf=(role,sup)=>(D.profile?.staffCodes||{})[ZID+'_'+role+(sup?'_'+sup:'')];
const _app0=appHTML;
appHTML=function(){const m=C.ready&&ZID&&D.loaded.members?me():null;const ts=D.toasts.length?`<div class="toastw" role="status">${D.toasts.map(t=>`<div class="toast" ${t.kind==='err'?'style="background:var(--danger)"':''}>${esc(t.text)}</div>`).join('')}</div>`:'';
  if(m&&m.role==='guard')return guardHTML()+ts;if(m&&m.role==='supplier')return supplierHTML()+ts;return _app0()};

/* ---------- 1. Пропуск курьеру ---------- */
S['courier']=()=>{const z=zk();if(!z?.guardOn)return SCRN({nav:NAVB('Жду курьера'),body:EMPTY('userplus','Охрана не подключена','Пропуск курьеру заработает, когда председатель ОСИ подключит пост охраны.')});
  return SCRN({nav:NAVB('Жду курьера'),body:`<p class="sub">Охрана пропустит курьера по коду, без звонка вам.</p>
  ${LB('Откуда доставка')}${PICK('svc',COURIER_SVC.map(s=>[s,s]),{def:'Wolt'})}
  ${LB('Когда')}${PICK('win',[['60','В ближайший час'],['120','В ближайшие 2 часа'],['240','В ближайшие 4 часа']],{def:'60'})}
  ${LB('Куда')}${PICK('place',[['Калитка','Калитка'],['Шлагбаум','Шлагбаум, на машине']],{def:'Калитка'})}
  ${String(F.place)==='Шлагбаум'?`${LB('Номер машины курьера, если знаете')}${FIN('plate','',{max:12})}`:''}`,
  foot:BTN('Создать пропуск','p',ACT('newcourier'))})};
A.newcourier=async()=>{if(!needVerified())return;const m=me();const win=Number(F.win||60)*60000;const code=String(Math.floor(100000+Math.random()*900000));
  const ref=await W(()=>col('passes').add({type:'courier',svc:F.svc||'Wolt',name:'Курьер '+(F.svc||'Wolt'),from:now(),to:now()+win,place:F.place||'Калитка',plate:fv('plate'),by:C.uid,house:m.house||'',entrance:m.entrance,apt:m.apt,code,status:'active',at:now()}),'Пропуск создан');
  if(ref)go('courier-pass',{id:ref.id},{replace:1})};
S['courier-pass']=p=>{const g=D.passes.find(x=>x.id===p.id);if(!g)return SCRN({nav:NAVB(),body:''});const active=g.status==='active'&&g.to>now()&&!g.passedAt;const txt=`Код для охраны: ${g.code}, кв. ${g.apt}`;
  return SCRN({nav:NAVB('Пропуск курьеру'),body:`<div class="card ${g.passedAt?'m':'dp'} center" style="padding:20px">${g.passedAt?`<div class="h2">Курьер прошёл</div><p class="s mt2">${esc(g.place)}, ${hm(g.passedAt)}</p>`
   :`<span class="xs mut b">${esc(g.svc)}, до ${hm(g.to)}</span><div style="font-size:40px;font-weight:700;letter-spacing:.15em;margin:8px 0">${esc(g.code)}</div><span class="xs mut">${esc(g.place)}</span>`}</div>
  ${active?`<div class="card f mt"><b class="s">Добавьте код в комментарий к заказу</b><p class="xs mut mt2">Курьер назовёт его охране, и его пропустят без звонка вам.</p><div class="card mt2" style="font-family:monospace;font-size:14px">${esc(txt)}</div><div class="mt2">${BTN('Скопировать','o sm',ACT('copytxt',{t:txt}),'copy')}</div></div>`:''}`,
  foot:active?BTN('Отменить пропуск','d',ACT('revokepass',{id:g.id})):''})};
A.copytxt=async el=>{try{await navigator.clipboard.writeText(el.dataset.t);toast('Скопировано')}catch(e){toast('Скопируйте вручную: '+el.dataset.t)}};

/* запрос жителю от охраны, если пропуска нет */
const gateReqs=()=>(D.gatereq||[]).filter(g=>(g.to||[]).includes(C.uid)&&g.status==='pending'&&now()-g.at<900000);
S['gate-in']=p=>{const g=(D.gatereq||[]).find(x=>x.id===p.id);if(!g)return SCRN({nav:NAVB(),body:''});
  return SCRN({nav:NAVB(),body:`${BD('Охрана спрашивает','wa')}<h1 class="h1 mt2">${esc(g.svc||'Курьер')} у ${esc(g.place||'калитки').toLowerCase()}</h1><p class="sub">Для кв. ${esc(g.apt)}, ${rel(g.at)}. Пропустить?</p>
  ${g.status!=='pending'?`<p class="s b mt">Вы ответили: ${g.status==='yes'?'пропустить':'не пропускать'}</p>`:''}`,
  foot:g.status==='pending'?`<div class="two">${BTN('Не жду','o',ACT('gateans',{id:g.id,v:'no'}))}${BTN('Пропустить','p',ACT('gateans',{id:g.id,v:'yes'}))}</div>`:BTN('Готово','p',ACT('tab',{v:'home'}))})};
A.gateans=async el=>{await W(()=>zdoc('gatereq',el.dataset.id).update({status:el.dataset.v,by:C.uid,ansAt:now()}),'Охрана увидит ответ');back()};

/* пост охраны */
function guardHTML(){const z=zk();const q=fv('gq');const t=now();
  const list=sortAt(D.passes.filter(p=>p.status==='active'&&!p.passedAt&&p.to>t&&p.from<t+3600000),'from').reverse();
  const found=q?D.passes.filter(p=>p.status==='active'&&p.to>t&&(p.code===q||String(p.apt)===q)):[];
  const today=(D.suppliers||[]).filter(s=>s.status==='active'&&Number(s.deliveryDow)===new Date().getDay());
  const reqs=sortAt((D.gatereq||[]).filter(g=>t-g.at<1800000));
  const row=p=>`<div class="card mt2"><div class="flex between top-a"><span><b class="s" style="display:block">${esc(p.type==='courier'?p.svc:p.name)}</b><span class="xs mut">${p.house?'дом '+esc(p.house)+', ':''}кв. ${esc(p.apt)}, ${esc(p.place)}${p.plate?', '+esc(p.plate):''}. ${hm(p.from)}–${hm(p.to)}</span></span><span class="b" style="letter-spacing:.1em">${esc(p.code)}</span></div>
    ${p.passedAt?`<p class="xs g b mt2">Пропущен в ${hm(p.passedAt)}</p>`:`<div class="mt2">${BTN('Пропустил','p sm',ACT('gatepass',{id:p.id}))}</div>`}</div>`;
  return SCRN({nav:`<div class="hdr"><span class="flex" style="gap:10px">${LOGO(28)}<span><b style="display:block">Пост охраны</b><span class="xs mut">ЖК «${esc(z?.name)}»</span></span></span><button class="link s" ${ACT('leavezk2')}>Выйти</button></div>`,body:`
  <div class="search">${I('search',18)}<input data-f="gq" data-live="1" inputmode="numeric" value="${esc(F.gq||'')}" placeholder="Код или номер квартиры" style="border:0;background:none;outline:none;font:inherit;font-size:20px;width:100%;color:var(--text)"></div>
  ${q?(found.length?found.map(row).join(''):`<div class="card wa mt"><b class="s">Пропуска нет</b><p class="xs mut mt2">Спросите жителя кв. ${esc(q)} через приложение.</p><div class="mt2">${PICK('gsvc',COURIER_SVC.map(s=>[s,s]),{def:'Wolt',scroll:1})}</div><div class="mt2">${BTN('Спросить жителя','wm sm',ACT('gateask',{apt:q}))}</div></div>`):''}
  ${reqs.length?`${LB('Запросы жителям')}${reqs.map(g=>`<div class="sel-row"><span>${esc(g.svc)}, кв. ${esc(g.apt)} <span class="xs mut">${hm(g.at)}</span></span><span class="status ${g.status==='yes'?'ok':g.status==='no'?'bad':'new'}">${{pending:'ждём ответ',yes:'пропустить',no:'не пропускать',nobody:'нет в приложении'}[g.status]}</span></div>`).join('')}`:''}
  ${today.length?`${LB('Поставки сегодня')}${today.map(s=>`<div class="sel-row"><span>${esc(s.name)}</span><span class="xs b">${esc(s.window||'')}</span></div>`).join('')}`:''}
  ${LB('Ждут сейчас и в ближайший час')}${list.length?list.map(row).join(''):'<p class="s mut">Пропусков нет.</p>'}`})}
A.gatepass=async el=>{await W(()=>zdoc('passes',el.dataset.id).update({passedAt:now(),passedBy:C.uid}),'Отмечено, житель увидит')};
A.gateask=async el=>{const apt=el.dataset.apt;const to=D.members.filter(m=>String(m.apt)===String(apt)&&m.role!=='guard'&&m.role!=='supplier').map(m=>m.id);
  await W(()=>col('gatereq').add({apt,svc:F.gsvc||'Wolt',place:'калитки',to,status:to.length?'pending':'nobody',guard:C.uid,at:now()}),to.length?'Жителю отправлен вопрос':'Жителя этой квартиры нет в приложении');F.gq='';R()};
const _osPasses=OS.passes;
OS.passes=()=>{const z=zk();const code=staffCodeOf('guard');return `<div class="panel" style="margin-top:0"><h3>Пост охраны</h3><div class="flex between s"><span>На въезде есть охрана, жители могут создавать пропуск курьеру</span>${CHK(z.guardOn,ACT('guardon'))}</div>
  <p class="s mt">Охранник открывает приложение, выбирает ЖК и на экране адреса нажимает «Служебный вход». Код охраны: <b style="letter-spacing:.15em">${esc(code||'не выпущен')}</b></p>
  <div class="actions mt2"><button class="btn s2 sm2" ${ACT('guardcode')}>${code?'Выпустить новый код':'Выпустить код охраны'}</button></div>
  <p class="xs mut mt2">Охранников в приложении: ${D.members.filter(m=>m.role==='guard').map(m=>esc(m.name)).join(', ')||'нет'}</p></div>`+_osPasses()};
A.guardon=async()=>{await W(()=>C.db.doc('zk/'+ZID).update({guardOn:!zk().guardOn}),'Сохранено')};
A.guardcode=async()=>{if(await makeStaffCode('guard'))toast('Код охраны выпущен, старый больше не работает')};

/* ---------- 2. «Помогите с машиной» и места во дворе ---------- */
const openHelp=()=>(D.carhelp||[]).filter(h=>h.status==='open'&&now()-h.at<7200000);
S['carhelp']=()=>{const m=me();const mine=openHelp().find(h=>h.by===C.uid);const ch=m.carHelper||{};const others=openHelp().filter(h=>h.by!==C.uid);
  if(mine)return S['carhelp-view']({id:mine.id});
  return SCRN({nav:NAVB('Помогите с машиной'),body:`<p class="sub">Соседи-водители рядом увидят просьбу и ответят «Иду». Телефон не раскрывается.</p>
  ${LB('Что случилось')}${PICK('ht',Object.entries(CARHELP),{def:'jump'})}
  ${LB('Где машина')}${PICK('hp',placeChips(),{def:`У ${m.entrance||1} подъезда`})}
  ${LB('Пара слов')}${FIN('hc',myPlate()?'Белая Camry '+myPlate():'Белая Camry, номер 123 ABC',{max:80})}
  ${others.length?`${LB('Соседи просят помощи')}${others.map(h=>`<button class="sel-row" ${GO('carhelp-in',{id:h.id})}><span><b class="s" style="display:block;font-weight:500">${esc(CARHELP[h.type])}</b><span class="xs mut">${esc(h.place)}, ${rel(h.at)}</span></span><span class="xs ${h.goer?'g b':'w b'}">${h.goer?'помощь идёт':'нужна помощь'}</span></button>`).join('')}`:''}
  <div class="card f mt3"><div class="flex between"><b class="s">Я помогаю соседям с машиной</b>${CHK(ch.on,ACT('chon'))}</div>
  ${ch.on?`<p class="xs mut mt2">Что у вас есть:</p><div class="chips mt2">${Object.entries(CARHELP_GEAR).map(([k,l])=>`<button class="chip${ch[k]?' on':''}" ${ACT('chgear',{k})}>${l}</button>`).join('')}</div>`:`<p class="xs mut mt2">Будете получать просьбы соседей, пока включено.</p>`}</div>`,
  foot:BTN('Попросить соседей','p',ACT('newhelp'))})};
A.chon=async()=>{const ch=me().carHelper||{};await W(()=>zdoc('members',C.uid).update({carHelper:{...ch,on:!ch.on}}))};
A.chgear=async el=>{const ch=me().carHelper||{};const k=el.dataset.k;await W(()=>zdoc('members',C.uid).update({carHelper:{...ch,[k]:!ch[k]}}))};
A.newhelp=async()=>{if(!needVerified())return;const m=me();if(openHelp().some(h=>h.by===C.uid)){toast('У вас уже есть открытая просьба');return}
  const type=F.ht||'jump',place=F.hp||`У ${m.entrance} подъезда`;
  const ref=await W(()=>col('carhelp').add({by:C.uid,type,place,text:fv('hc'),plate:myPlate(),entrance:m.entrance,status:'open',goer:null,at:now()}),'Соседи увидят просьбу');if(!ref)return;
  W(()=>col('msgs').add({chat:'e'+m.entrance,from:C.uid,text:`Нужна помощь с машиной: ${CARHELP[type].toLowerCase()}, ${place.toLowerCase()}. Откликнуться можно в сервисе «Помогите с машиной».`,at:now()}));
  go('carhelp-view',{id:ref.id},{replace:1})};
S['carhelp-view']=p=>{const h=(D.carhelp||[]).find(x=>x.id===p.id);if(!h)return SCRN({nav:NAVB(),body:''});const done=h.status!=='open';
  return SCRN({nav:NAVB('Ваша просьба'),body:`${BD(done?'Закрыта':h.goer?'Помощь идёт':'Ждём отклика',done||h.goer?'m':'wa')}
  <h1 class="h1 mt2">${esc(CARHELP[h.type])}</h1><p class="sub">${esc(h.place)}${h.text?'. '+esc(h.text):''}. ${rel(h.at)}</p>
  ${h.goer?`<div class="card m flex mt">${AVM(h.goer,40)}<span class="grow"><b class="s" style="display:block">${esc(whoOf(h.goer))}</b><span class="xs mut">${done?'помог':'идёт к вам, '+rel(h.goAt)}</span></span><button class="rfab g" style="width:40px;height:40px" ${ACT('dm',{id:h.goer})} aria-label="Написать">${I('chat',18)}</button></div>`
   :`<p class="s mut mt">Просьбу видят ${D.members.filter(x=>x.carHelper?.on&&x.id!==C.uid).length} ${plural(D.members.filter(x=>x.carHelper?.on&&x.id!==C.uid).length,'сосед','соседа','соседей')}, которые помогают с машиной, и чат вашего подъезда.</p>`}`,
  foot:done?BTN('Готово','p',ACT('tab',{v:'home'})):(h.goer?BTN('Помогли, спасибо','p',ACT('helpdone',{id:h.id})):'')+BTN('Отменить просьбу','g',ACT('helpcancel',{id:h.id}))})};
S['carhelp-in']=p=>{const h=(D.carhelp||[]).find(x=>x.id===p.id);if(!h)return SCRN({nav:NAVB(),body:''});const mine=h.goer===C.uid;
  return SCRN({nav:NAVB(),body:`${BD(h.status!=='open'?'Закрыта':h.goer?(mine?'Вы идёте':'Помощь уже идёт'):'Нужна помощь','wa')}
  <h1 class="h1 mt2">${esc(CARHELP[h.type])}</h1><p class="sub">${esc(h.place)}${h.text?'. '+esc(h.text):''}${h.plate?'. '+esc(h.plate):''}. Просит ${esc(whoOf(h.by))}, ${rel(h.at)}.</p>`,
  foot:h.status==='open'?(!h.goer?BTN('Иду','p',ACT('helpgo',{id:h.id})):mine?BTN('Написать соседу','o',ACT('dm',{id:h.by})):''):''})};
A.helpgo=async el=>{const h=(D.carhelp||[]).find(x=>x.id===el.dataset.id);if(h.goer){toast('Помощь уже идёт');return}await W(()=>zdoc('carhelp',h.id).update({goer:C.uid,goAt:now()}),'Сосед увидит, что вы идёте')};
A.helpdone=async el=>{await W(()=>zdoc('carhelp',el.dataset.id).update({status:'done',doneAt:now()}),'Спасибо отправлено')};
A.helpcancel=async el=>{await W(()=>zdoc('carhelp',el.dataset.id).update({status:'cancelled'}));go('home',{},{root:1})};

const activeSpots=()=>(D.spots||[]).filter(s=>s.status!=='cancelled'&&(s.kind==='leaving'?now()-s.at<900000:s.until>now()));
function tempSpotInfo(plateShow){const pl=normPlate(plateShow);const s=activeSpots().find(x=>x.kind==='temp'&&normPlate(x.plate)===pl);
  return s?`<div class="card m mt flex">${I('clock',18)}<span class="s"><b>Стоит временно до ${hm(s.until)}</b>, ${esc(s.place.toLowerCase())}. Владелец предупредил заранее.</span></div>`:''}
S['spots']=()=>{const sp=activeSpots();const lv=sp.filter(s=>s.kind==='leaving'),tp=sp.filter(s=>s.kind==='temp');const tab=F.st||'leaving';const m=me();
  return SCRN({nav:NAVB('Места во дворе'),body:`
  ${LB('Освобождаются сейчас','first')}${lv.length?lv.map(s=>`<div class="sel-row"><span><b class="s" style="display:block;font-weight:500">${esc(s.place)}</b><span class="xs mut">${esc(nameOf(s.by))}, ${rel(s.at)}</span></span><span class="xs g b">ещё ${Math.max(1,Math.ceil((s.at+900000-now())/60000))} мин</span></div>`).join(''):'<p class="s mut">Сейчас никто не уезжает.</p>'}
  ${LB('Стоят временно')}${tp.length?tp.map(s=>`<div class="sel-row"><span>${PS(esc(s.plate||'без номера'))} <span class="xs mut">${esc(s.place)}</span></span><span class="xs b">до ${hm(s.until)}</span></div>`).join(''):'<p class="s mut">Никто не предупреждал.</p>'}
  <div class="mt3">${SEGF('st',[['leaving','Уезжаю'],['temp','Стою временно']],{def:'leaving'})}</div>
  ${LB('Где')}${PICK('sp',placeChips(),{def:`У ${m.entrance||1} подъезда`})}
  ${tab==='temp'?`${LB('Номер машины')}${FIN('spl',myPlate(),{max:12})}${LB('До скольки')}${PICK('su',[['15','15 минут'],['30','30 минут'],['60','Час'],['120','2 часа']],{def:'30'})}`:`<p class="xs mut mt2">Объявление будет видно водителям ЖК 15 минут.</p>`}`,
  foot:BTN(tab==='temp'?'Предупредить соседей':'Освобождаю место','p',ACT('newspot2'))})};
A.newspot2=async()=>{if(!needVerified())return;const m=me();const kind=F.st||'leaving';const place=F.sp||`У ${m.entrance} подъезда`;
  const body=kind==='temp'?{kind,place,plate:fv('spl')||myPlate(),until:now()+Number(F.su||30)*60000}:{kind,place};
  if(kind==='temp'&&!body.plate){toast('Укажите номер машины');return}
  await W(()=>col('spots').add({...body,by:C.uid,status:'active',at:now()}),kind==='temp'?'Соседи увидят, до скольки вы стоите':'Водители увидят свободное место');R()};

/* ---------- 3. Совместный заказ на подъезд ---------- */
function nextCycle(s){const base=new Date();for(let i=0;i<15;i++){const day=new Date(base.getFullYear(),base.getMonth(),base.getDate()+i,12);if(day.getDay()!==Number(s.deliveryDow))continue;
  const dl=new Date(day);dl.setDate(dl.getDate()-(((Number(s.deliveryDow)-Number(s.deadlineDow)+7)%7)||7));const [h,mi]=String(s.deadlineTime||'20:00').split(':').map(Number);dl.setHours(h||0,mi||0,0,0);
  if(dl.getTime()>now())return{day:day.getTime(),deadline:dl.getTime(),key:dayKey(day)}}return null}
const coopOrders=()=>D.coop||[];
S['coop']=()=>{const ss=(D.suppliers||[]).filter(s=>s.status==='active');const mineUp=coopOrders().filter(o=>o.by===C.uid&&o.status!=='cancelled'&&o.cycle>=dayKey(now()));
  return SCRN({nav:NAVB('Заказ на подъезд'),body:`<p class="sub">Партнёр привозит заказы всего ЖК в один день. Платите поставщику при получении.</p>
  ${mineUp.length?`${LB('Мои заказы')}${mineUp.map(o=>{const s=(D.suppliers||[]).find(x=>x.id===o.supplier);return `<button class="sel-row" ${GO('coop-sup',{id:o.supplier})}><span><b class="s" style="display:block;font-weight:500">${esc(s?.name||'')}</b><span class="xs mut">${esc(o.items.map(i=>i.t+' × '+i.n).join(', '))}</span></span><span class="xs ${o.status==='delivered'?'g b':'b'}">${o.status==='delivered'?'доставлено':o.status==='missed'?'не застали':DOWS[new Date(o.cycle).getDay()]+', '+o.cycle.split('-').reverse().slice(0,2).join('.')}</span></button>`}).join('')}`:''}
  ${LB('Поставщики')}${ss.length?ss.map(s=>{const c=nextCycle(s);return `<button class="card mt2" ${GO('coop-sup',{id:s.id})} style="text-align:left"><b class="s" style="display:block">${esc(s.name)}</b><span class="xs mut">${esc(s.desc||'')}</span>${c?`<span class="xs g b" style="display:block;margin-top:6px">Доставка: ${DOW[new Date(c.day).getDay()]}, ${esc(s.window||'')}. Заказ до ${wdmy(c.deadline)}, ${hm(c.deadline)}</span>`:''}</button>`}).join(''):EMPTY('box','Поставщиков пока нет','Тредо подключит партнёра: воду, фермерские продукты или хлеб с доставкой в один день.')}`})};
S['coop-sup']=p=>{const s=(D.suppliers||[]).find(x=>x.id===p.id);if(!s)return SCRN({nav:NAVB(),body:''});const c=nextCycle(s);const oid=c?`${s.id}_${c.key}_${C.uid}`:null;
  const cur=coopOrders().find(o=>o.id===oid&&o.status!=='cancelled');const past=sortAt(coopOrders().filter(o=>o.supplier===s.id&&o.by===C.uid&&o.id!==oid),'cycle').slice(0,3);
  if(F.cartInit!==oid){F.cartInit=oid;F.cart={};(cur?.items||[]).forEach(i=>F.cart[i.id]=i.n);F.cc=cur?.comment||''}
  const cart=F.cart||{};const sum=(s.items||[]).reduce((a,i)=>a+(cart[i.id]||0)*Number(i.price||0),0);const n=Object.values(cart).reduce((a,b)=>a+b,0);
  return SCRN({nav:NAVB(esc(s.name)),body:`${c?`<div class="card m"><b class="s">Доставка ${wdmy(c.day)}, ${esc(s.window||'')}</b><p class="xs mut mt2">Заказ можно изменить или отменить до ${wdmy(c.deadline)}, ${hm(c.deadline)}.</p></div>`:''}
  ${LB('Каталог')}${(s.items||[]).map(i=>`<div class="sel-row"><span><b style="font-weight:500;display:block">${esc(i.t)}</b><span class="xs mut">${money(i.price)}${i.unit?' за '+esc(i.unit):''}</span></span><span class="flex" style="gap:8px"><button class="bm" ${ACT('ccart',{k:i.id,d:-1})} aria-label="Меньше">−</button><b>${cart[i.id]||0}</b><button class="bm on" ${ACT('ccart',{k:i.id,d:1})} aria-label="Больше">+</button></span></div>`).join('')}
  ${LB('Комментарий')}${FIN('cc','Например: позвонить в домофон, оставить у двери',{max:120})}
  ${s.minQty&&n&&n<s.minQty?`<p class="xs w b mt2">Минимальный заказ: ${s.minQty} шт.</p>`:''}
  ${past.length?`${LB('Прошлые заказы')}${past.map(o=>`<p class="xs mut">${o.cycle.split('-').reverse().join('.')}: ${esc(o.items.map(i=>i.t+' × '+i.n).join(', '))}, ${o.status==='delivered'?'доставлено':o.status==='missed'?'не застали':'отменён'}</p>`).join('')}`:''}`,
  foot:c?`<div class="flex between"><span><b class="s" style="display:block">${n?money(sum):'Ничего не выбрано'}</b><span class="xs mut">оплата при получении</span></span>${cur?`<span class="flex" style="gap:6px"><button class="btn s2 sm2" ${ACT('coopcancel',{id:oid})}>Отменить</button><button class="btn p sm2" ${ACT('cooporder',{id:s.id})} ${n?'':'disabled'}>Изменить</button></span>`:`<button class="btn p sm2" ${ACT('cooporder',{id:s.id})} ${n?'':'disabled'}>Заказать</button>`}</div>`:''})};
A.ccart=el=>{const c={...(F.cart||{})};c[el.dataset.k]=Math.max(0,(c[el.dataset.k]||0)+Number(el.dataset.d));F.cart=c;R()};
A.cooporder=async el=>{if(!needVerified())return;const s=(D.suppliers||[]).find(x=>x.id===el.dataset.id);const c=nextCycle(s);if(!c){toast('Приём заказов закрыт');return}const m=me();
  const items=(s.items||[]).filter(i=>F.cart?.[i.id]).map(i=>({id:i.id,t:i.t,n:F.cart[i.id],price:Number(i.price)||0}));const n=items.reduce((a,i)=>a+i.n,0);
  if(!n)return;if(s.minQty&&n<s.minQty){toast('Минимальный заказ: '+s.minQty+' шт.');return}
  await W(()=>zdoc('coop',`${s.id}_${c.key}_${C.uid}`).set({supplier:s.id,cycle:c.key,deadline:c.deadline,by:C.uid,house:m.house||'',entrance:m.entrance,floor:m.floor||null,apt:m.apt,items,sum:items.reduce((a,i)=>a+i.n*i.price,0),comment:fv('cc'),status:'placed',at:now()}),'Заказ принят. Доставка '+wdmy(c.day))};
A.coopcancel=async el=>{const o=coopOrders().find(x=>x.id===el.dataset.id);if(o&&o.deadline<now()){toast('Срок изменения заказа прошёл');return}await W(()=>zdoc('coop',el.dataset.id).update({status:'cancelled'}),'Заказ отменён');F.cartInit=null;R()};

/* кабинет поставщика */
function supplierHTML(){const m=me();const s=(D.suppliers||[]).find(x=>x.id===m.supplier);const z=zk();
  if(!s)return SCRN({nav:`<div class="hdr">${LOGO(28)}<button class="link s" ${ACT('leavezk2')}>Выйти</button></div>`,body:EMPTY('box','Поставщик не найден','Код поставщика устарел. Попросите новый у модератора Тредо.')});
  const cycles=[...new Set(coopOrders().filter(o=>o.supplier===s.id&&o.status!=='cancelled'&&o.cycle>=dayKey(now()-86400000)).map(o=>o.cycle))].sort();const cy=F.cy||cycles[0];
  const os=coopOrders().filter(o=>o.supplier===s.id&&o.cycle===cy&&o.status!=='cancelled').sort((a,b)=>String(a.house).localeCompare(String(b.house),'ru',{numeric:true})||a.entrance-b.entrance||(a.floor||0)-(b.floor||0)||String(a.apt).localeCompare(String(b.apt),'ru',{numeric:true}));
  const tot={};os.forEach(o=>o.items.forEach(i=>tot[i.t]=(tot[i.t]||0)+i.n));const nc=nextCycle(s);const open=nc&&nc.key===cy&&nc.deadline>now();
  return SCRN({nav:`<div class="hdr"><span class="flex" style="gap:10px">${LOGO(28)}<span><b style="display:block">${esc(s.name)}</b><span class="xs mut">ЖК «${esc(z?.name)}»</span></span></span><button class="link s" ${ACT('leavezk2')}>Выйти</button></div>`,body:`
  ${cycles.length?`<div class="chips">${cycles.map(c=>`<button class="chip${c===cy?' on':''}" ${ACT('pick',{f:'cy',v:c})}>${DOWS[new Date(c).getDay()]}, ${c.split('-').reverse().slice(0,2).join('.')}</button>`).join('')}</div>`:''}
  ${cy?`<div class="card ${open?'wa':'m'} mt"><b class="s">${open?'Приём заказов идёт до '+wdmy(nc.deadline)+', '+hm(nc.deadline):'Список закрыт, доставка '+esc(s.window||'')}</b><p class="xs mut mt2">${os.length} ${plural(os.length,'заказ','заказа','заказов')}: ${Object.entries(tot).map(([t,n])=>esc(t)+' × '+n).join(', ')}</p><div class="mt2">${BTN('Скачать список для водителя','o sm',ACT('coopcsv',{cy}),'download')}</div></div>
  ${os.map(o=>`<div class="card mt2"><div class="flex between top-a"><span><b class="s" style="display:block">${o.house?'Дом '+esc(o.house)+', ':''}${o.entrance} подъезд${o.floor?', '+o.floor+' этаж':''}, кв. ${esc(o.apt)}</b><span class="xs mut">${esc(o.items.map(i=>i.t+' × '+i.n).join(', '))}, ${money(o.sum)}${o.comment?'. '+esc(o.comment):''}</span></span>
   <span class="status ${o.status==='delivered'?'ok':o.status==='missed'?'bad':''}">${{placed:'ждёт',delivered:'доставлено',missed:'не застали'}[o.status]}</span></div>
   ${o.status==='placed'&&!open?`<div class="actions mt2"><button class="btn p sm2" ${ACT('coopst',{id:o.id,v:'delivered'})}>Доставлено</button><button class="btn s2 sm2" ${ACT('coopst',{id:o.id,v:'missed'})}>Не застали</button></div>`:''}</div>`).join('')}`
   :EMPTY('box','Заказов пока нет',nc?`Жители заказывают до ${wdmy(nc.deadline)}, ${hm(nc.deadline)}. Доставка ${DOW[new Date(nc.day).getDay()]}, ${esc(s.window||'')}.`:'')}`})}
A.coopst=async el=>{await W(()=>zdoc('coop',el.dataset.id).update({status:el.dataset.v,doneAt:now()}),'Отмечено, житель увидит')};
A.coopcsv=el=>{const cy=el.dataset.cy;const s=(D.suppliers||[]).find(x=>x.id===me().supplier);const os=coopOrders().filter(o=>o.supplier===s.id&&o.cycle===cy&&o.status!=='cancelled');
  const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';saveFile(`zakazy-${cy}.csv`,'\ufeff'+['Дом;Подъезд;Этаж;Квартира;Заказ;Сумма;Комментарий',...os.map(o=>[o.house,o.entrance,o.floor||'',o.apt,o.items.map(i=>i.t+' x '+i.n).join(', '),o.sum,o.comment].map(q).join(';'))].join('\n'))};

/* раздел модерации «Поставщики» */
function supAdminSection(){const ss=sortAt(D.suppliers||[]);const ed=F.sid?ss.find(s=>s.id===F.sid):null;
  if(ed&&F.supInit!==ed.id){F.supInit=ed.id;F.sn=ed.name;F.sd=ed.desc||'';F.si=(ed.items||[]).map(i=>[i.t,i.price,i.unit].filter((v,k)=>k<2||v).join(' | ')).join('\n');F.sdd=String(ed.deliveryDow);F.sdl=String(ed.deadlineDow);F.sdt=ed.deadlineTime;F.sw=ed.window;F.smq=String(ed.minQty||'')}
  const dowOpts=DOW.map((d,i)=>[String(i),d]);
  return `<h1>Поставщики</h1><p class="sub">Совместный заказ на подъезд. На время пилота поставщики работают бесплатно, ниже отчёт по доставленным заказам.</p>
  <div class="grid2"><div class="panel"><h3>${ed?'Изменить «'+esc(ed.name)+'»':'Новый поставщик для ЖК «'+esc(zk()?.name||'')+'»'}</h3><div class="frm">
  ${L('Название',FIN('sn','Вода «…»',{max:60}))}${L('Описание',FIN('sd','Питьевая вода 19 л с доставкой до двери',{max:120}))}
  ${L('Каталог: товар | цена | единица, по строке',FTA('si','Вода 19 л | 1500 | бутыль\nПомпа | 2500 | шт.',{max:3000}))}
  <div class="row2">${L('День доставки',FSEL('sdd',dowOpts,{v:'4'}))}${L('Окно доставки',FIN('sw','10:00–14:00',{max:20}))}</div>
  <div class="row2">${L('Приём заказов до (день)',FSEL('sdl',dowOpts,{v:'2'}))}${L('До (время)',`<input class="inp" type="time" data-f="sdt" value="${esc(F.sdt||'20:00')}">`)}</div>
  ${L('Минимальный заказ, шт.',FIN('smq','1',{mode:'numeric',max:3}))}
  <div class="actions"><button class="btn p" ${ACT('savesup')}>${ed?'Сохранить':'Добавить поставщика'}</button>${ed?`<button class="btn s2" ${ACT('pick',{f:'sid',v:''})}>Отмена</button>`:''}</div></div></div>
  <div class="panel"><h3>Поставщики ЖК</h3>${ss.length?ss.map(s=>{const code=staffCodeOf('supplier',s.id);const del=coopOrders().filter(o=>o.supplier===s.id&&o.status==='delivered');const month=del.filter(o=>o.cycle>=dayKey(now()-30*86400000));
    return `<div style="padding:10px 0;border-bottom:1px solid var(--line)"><div class="flex between"><b class="s">${esc(s.name)}</b><span class="status ${s.status==='active'?'ok':''}">${s.status==='active'?'принимает заказы':'выключен'}</span></div>
    <p class="xs mut">Доставка: ${DOW[s.deliveryDow]}, ${esc(s.window||'')}. Заказ до: ${DOW[s.deadlineDow]}, ${esc(s.deadlineTime||'')}. За 30 дней доставлено ${month.length} ${plural(month.length,'заказ','заказа','заказов')}, ${new Set(month.map(o=>o.by)).size} квартир.</p>
    <p class="xs mt2">Код поставщика: <b style="letter-spacing:.15em">${esc(code||'не выпущен')}</b></p>
    <div class="actions mt2"><button class="btn s2 sm2" ${ACT('pick',{f:'sid',v:s.id})}>Изменить</button><button class="btn s2 sm2" ${ACT('supcode',{id:s.id})}>${code?'Новый код':'Выпустить код'}</button><button class="btn s2 sm2" ${ACT('supon',{id:s.id})}>${s.status==='active'?'Выключить':'Включить'}</button></div></div>`}).join(''):'<p class="s mut">Пока нет.</p>'}
  <p class="xs mut mt2">Поставщик открывает приложение, выбирает ЖК и на экране адреса нажимает «Служебный вход».</p></div></div>`}
A.savesup=async()=>{const name=fv('sn');if(!name){toast('Название?','err');return}
  const items=fv('si').split('\n').map(l=>l.split('|').map(x=>x.trim())).filter(x=>x[0]).map(([t,p,u],k)=>({id:'i'+k+'_'+slug(t).slice(0,12),t,price:Number(String(p||'').replace(/\D/g,''))||0,unit:u||''}));
  if(!items.length){toast('Добавьте товары в каталог','err');return}
  const body={name,desc:fv('sd'),items,deliveryDow:Number(F.sdd??4),deadlineDow:Number(F.sdl??2),deadlineTime:F.sdt||'20:00',window:fv('sw')||'10:00–14:00',minQty:num('smq')||1};
  const ok=await W(()=>F.sid?zdoc('suppliers',F.sid).update(body):col('suppliers').add({...body,status:'active',at:now()}),'Сохранено');if(ok){F={};R()}};
A.supcode=async el=>{if(await makeStaffCode('supplier',el.dataset.id))toast('Код выпущен, старый больше не работает')};
A.supon=async el=>{const s=(D.suppliers||[]).find(x=>x.id===el.dataset.id);await W(()=>zdoc('suppliers',s.id).update({status:s.status==='active'?'off':'active'}))};

/* ---------- главная, сервисы, уведомления, доверие ---------- */
SERVICES.splice(4,0,['car','Помогите с машиной','carhelp'],['park','Места во дворе','spots'],['box','Заказ на подъезд','coop']);
const _he0=homeExtras;
homeExtras=function(){let h='';
  gateReqs().forEach(g=>{h+=`<button class="banner" ${GO('gate-in',{id:g.id})} style="background:var(--danger-soft);margin-bottom:8px;color:var(--danger)">${I('userplus',20)}<span class="grow"><b class="s" style="display:block">${esc(g.svc)} у калитки: пропустить?</b><span class="xs">Охрана спрашивает, ${rel(g.at)}</span></span>${I('fwd',18)}</button>`});
  if(me()?.carHelper?.on)openHelp().filter(x=>x.by!==C.uid&&!x.goer).slice(0,2).forEach(x=>{h+=`<button class="banner" ${GO('carhelp-in',{id:x.id})} style="background:var(--warm-soft);margin-bottom:8px">${I('car',20)}<span class="grow"><b class="s" style="display:block">Соседу нужна помощь: ${esc(CARHELP[x.type].toLowerCase())}</b><span class="xs w">${esc(x.place)}, ${rel(x.at)}</span></span>${I('fwd',18)}</button>`});
  const myH=openHelp().find(x=>x.by===C.uid);if(myH)h+=`<button class="banner" ${GO('carhelp-view',{id:myH.id})} style="background:var(--primary-soft);margin-bottom:8px">${I('car',20)}<span class="grow"><b class="s" style="display:block">${myH.goer?esc(nameOf(myH.goer))+' идёт помочь':'Ждём отклика соседей'}</b><span class="xs mut">${esc(CARHELP[myH.type])}</span></span>${I('fwd',18)}</button>`;
  if(zk()?.guardOn&&me()?.verified)h+=`<button class="card flex" ${GO('courier')} style="margin-bottom:10px;text-align:left">${TL('userplus','m',38)}<span class="grow"><b class="s" style="display:block">Жду курьера</b><span class="xs mut">Охрана пропустит по коду, без звонка вам</span></span>${I('fwd',16)}</button>`;
  return h+_he0()};
const _nf0=notifs;
notifs=function(){const base=_nf0();const n=ntf();const seen=D.profile?.nseen||0;const add=[];
  D.passes.filter(p=>p.by===C.uid&&p.passedAt).forEach(p=>add.push({at:p.passedAt,ic:'userplus',c:'m',t:`<b>${esc(p.type==='courier'?'Курьер '+p.svc:p.name)} прошёл</b>, ${esc(p.place.toLowerCase())}`,s:'Охрана',go:[p.type==='courier'?'courier-pass':'guest',p.id],topic:'gate'}));
  gateReqs().forEach(g=>add.push({at:g.at,ic:'userplus',c:'wa',t:`<b>${esc(g.svc)} у калитки.</b> Охрана спрашивает, пропустить ли`,s:'Срочно',go:['gate-in',g.id],topic:'gate'}));
  if(me()?.carHelper?.on)openHelp().filter(x=>x.by!==C.uid).forEach(x=>add.push({at:x.at,ic:'car',c:'wa',t:`<b>Соседу нужна помощь с машиной:</b> ${esc(CARHELP[x.type].toLowerCase())}, ${esc(x.place.toLowerCase())}`,s:x.goer?'Помощь уже идёт':'Откликнитесь',go:['carhelp-in',x.id],topic:'carhelp'}));
  (D.carhelp||[]).filter(x=>x.by===C.uid&&x.goer).forEach(x=>add.push({at:x.goAt,ic:'car',c:'m',t:`<b>${esc(nameOf(x.goer))} идёт помочь</b> с машиной`,s:CARHELP[x.type],go:['carhelp-view',x.id],topic:'carhelp'}));
  coopOrders().filter(o=>o.by===C.uid&&['delivered','missed'].includes(o.status)).forEach(o=>add.push({at:o.doneAt||o.at,ic:'box',c:'m',t:o.status==='delivered'?'<b>Заказ доставлен</b>':'<b>Курьер вас не застал.</b> Договоритесь с поставщиком',s:esc((D.suppliers||[]).find(s=>s.id===o.supplier)?.name||''),go:['coop',''],topic:'orders'}));
  const extra=add.filter(x=>n[x.topic]!==false).map(x=>({...x,un:x.at>seen&&(!inQuiet()||URGENT.has(x.topic))}));
  return [...base,...extra].sort((a,b)=>b.at-a.at)};
