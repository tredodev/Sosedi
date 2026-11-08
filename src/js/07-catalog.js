/* =====================================================================
   Справочник: города Казахстана (классификатор) и ЖК (в базе)
   ===================================================================== */
/* Города: республиканского значения, областные центры (с учётом областей 2022 года) и крупные города */
const CITIES=[
['astana','Астана','город республиканского значения',1],['almaty','Алматы','город республиканского значения',1],['shymkent','Шымкент','город республиканского значения',1],
['aktobe','Актобе','Актюбинская область',1],['karaganda','Караганда','Карагандинская область',1],['taraz','Тараз','Жамбылская область',1],['pavlodar','Павлодар','Павлодарская область',1],
['oskemen','Усть-Каменогорск','Восточно-Казахстанская область',1],['semey','Семей','область Абай',1],['atyrau','Атырау','Атырауская область',1],['kostanay','Костанай','Костанайская область',1],
['kyzylorda','Кызылорда','Кызылординская область',1],['oral','Уральск','Западно-Казахстанская область',1],['petropavl','Петропавловск','Северо-Казахстанская область',1],['aktau','Актау','Мангистауская область',1],
['turkistan','Туркестан','Туркестанская область',1],['taldykorgan','Талдыкорган','область Жетысу',1],['kokshetau','Кокшетау','Акмолинская область',1],['konaev','Конаев','Алматинская область',1],['zhezkazgan','Жезказган','область Улытау',1],
['temirtau','Темиртау','Карагандинская область'],['ekibastuz','Экибастуз','Павлодарская область'],['rudny','Рудный','Костанайская область'],['zhanaozen','Жанаозен','Мангистауская область'],['balkhash','Балхаш','Карагандинская область'],
['satpaev','Сатпаев','область Улытау'],['kentau','Кентау','Туркестанская область'],['ridder','Риддер','Восточно-Казахстанская область'],['kaskelen','Каскелен','Алматинская область'],['talgar','Талгар','Алматинская область'],
['esik','Есик','Алматинская область'],['kosshy','Косшы','Акмолинская область'],['stepnogorsk','Степногорск','Акмолинская область'],['shchuchinsk','Щучинск','Акмолинская область'],['aksu','Аксу','Павлодарская область'],
['lisakovsk','Лисаковск','Костанайская область'],['arkalyk','Аркалык','Костанайская область'],['shakhtinsk','Шахтинск','Карагандинская область'],['saran','Сарань','Карагандинская область'],['kulsary','Кульсары','Атырауская область'],
['khromtau','Хромтау','Актюбинская область'],['kandyagash','Кандыагаш','Актюбинская область'],['aksay','Аксай','Западно-Казахстанская область'],['zharkent','Жаркент','область Жетысу'],['tekeli','Текели','область Жетысу'],
['saryagash','Сарыагаш','Туркестанская область'],['arys','Арыс','Туркестанская область'],['zhetysay','Жетысай','Туркестанская область'],['shu','Шу','Жамбылская область'],['karatau','Каратау','Жамбылская область'],
['altay','Алтай','Восточно-Казахстанская область'],['zaysan','Зайсан','Восточно-Казахстанская область'],['ayagoz','Аягоз','область Абай'],['kurchatov','Курчатов','область Абай'],['baikonur','Байконыр','Кызылординская область']
].map(([id,name,region,main])=>({id,name,region,main:!!main}));
const cityById=id=>CITIES.find(c=>c.id===id);
const cityIdByName=n=>{const s=String(n||'').trim().toLowerCase().replace(/^г\.?\s*/,'').replace('ё','е');return CITIES.find(c=>c.name.toLowerCase().replace('ё','е')===s)?.id||null};
const cityOf=z=>z?.cityId||cityIdByName(z?.city);
const cityName=z=>cityById(cityOf(z))?.name||z?.city||'';
const TR={а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya',ә:'a',ғ:'g',қ:'k',ң:'n',ө:'o',ұ:'u',ү:'u',һ:'h',і:'i'};
const slug=s=>String(s||'').toLowerCase().split('').map(c=>TR[c]??c).join('').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40);
const cleanZkName=s=>String(s||'').replace(/^\s*жк\s*/i,'').replace(/[«»"']/g,'').trim();
const ZST={active:['Открыт','ok'],waitlist:['Собираем соседей','new'],catalog:['Ещё не подключён','']};
const waitN=id=>D.waitlist.filter(w=>w.zkId===id).length;

/* ---------- Шаг 1: город ---------- */
S['ob-city']=()=>{const q=(F.q||'').toLowerCase().replace('ё','е');const n=id=>D.zks.filter(z=>cityOf(z)===id&&z.status==='active').length;
  const list=CITIES.filter(c=>!q||(c.name+' '+c.region).toLowerCase().replace('ё','е').includes(q));const main=list.filter(c=>c.main),rest=list.filter(c=>!c.main);
  const row=c=>`<button class="sel-row" ${GO('ob-zk',{v:c.id})}><span><b style="font-weight:500">${esc(c.name)}</b><span class="xs mut" style="display:block">${esc(c.region)}</span></span><span class="xs ${n(c.id)?'g b':'mut'}" style="white-space:nowrap">${n(c.id)?n(c.id)+' '+plural(n(c.id),'ЖК','ЖК','ЖК')+' в приложении':''}</span></button>`;
  return SCRN({nav:`<div class="hdr">${LOGO(34)}<span></span></div>`,body:`
  <div class="xs mut b">Шаг 1 из 2</div><h1 class="h1">В каком вы городе?</h1><p class="sub">Потом выберете свой ЖК. Соседи, отключения и барахолка открываются только жителям одного дома.</p>
  <div class="mt"><div class="search">${I('search',18)}<input data-f="q" data-live="1" value="${esc(F.q||'')}" placeholder="Город или область" style="border:0;background:none;outline:none;font:inherit;width:100%;color:var(--text)"></div></div>
  ${main.length?LB(q?'Найдено':'Крупные города')+main.map(row).join(''):''}${rest.length?LB('Другие города')+rest.map(row).join(''):''}
  ${!list.length?`<div class="note-box mt">Такого города нет в справочнике. <button class="link xs" ${GO('ob-wait',{v:''})}>Указать свой город</button></div>`:''}`})};

/* ---------- Шаг 2: ЖК в городе ---------- */
S['ob-zk']=p=>{const c=cityById(p.v);if(!c)return S['ob-city']();const q=(F.q2||'').toLowerCase();
  const order={active:0,waitlist:1,catalog:2};
  const list=D.zks.filter(z=>cityOf(z)===c.id&&(!q||(z.name+' '+(z.address||'')+' '+(z.developer||'')).toLowerCase().includes(q))).sort((a,b)=>(order[a.status]??3)-(order[b.status]??3)||a.name.localeCompare(b.name,'ru'));
  const row=z=>{const st=ZST[z.status]||ZST.catalog;const extra=z.status==='active'?'':z.status==='waitlist'?`ждут ${waitN(z.id)} из ${z.threshold||30}`:'';
    return `<button class="card mt2" ${ACT('pickzk',{id:z.id})} style="text-align:left"><span class="flex between top-a"><span><b class="s" style="display:block">ЖК «${esc(z.name)}»</b><span class="xs mut">${esc(z.address||'Адрес не указан')}${z.developer?', '+esc(z.developer):''}</span></span><span class="status ${st[1]}" style="white-space:nowrap">${st[0]}</span></span>${extra?`<span class="xs mut" style="display:block;margin-top:6px">${esc(extra)}</span>`:''}</button>`};
  return SCRN({nav:NAVB('',{r:`<span class="xs mut">${esc(c.name)}</span>`}),body:`
  <div class="xs mut b">Шаг 2 из 2</div><h1 class="h1">Ваш ЖК в городе ${esc(c.name)}</h1>
  <div class="mt"><div class="search">${I('search',18)}<input data-f="q2" data-live="1" value="${esc(F.q2||'')}" placeholder="Название ЖК или улица" style="border:0;background:none;outline:none;font:inherit;width:100%;color:var(--text)"></div></div>
  ${list.length?list.map(row).join(''):`<div class="note-box mt">${q?'Ничего не нашлось.':'В справочнике пока нет ЖК этого города.'} Добавьте свой: мы подключим его, когда наберётся достаточно соседей.</div>`}`,
  foot:BTN('Моего ЖК нет в списке','o',GO('ob-wait',{v:c.id}))})};

/* ---------- Нет в списке: заявка с отдельными полями ---------- */
S['ob-wait']=p=>{if(F.city===undefined)F.city=p.v||'';
  return SCRN({nav:NAVB(),body:`<h1 class="h1">Добавим ваш ЖК</h1><p class="sub">Модератор проверит и добавит ЖК в справочник. Когда наберётся достаточно соседей, откроем его и напишем вам.</p>
  ${LB('Город')}${FSEL('city',[['','Выберите город'],...CITIES.map(c=>[c.id,c.name])],{})}${F.city===''?`${LB('Или впишите город')}${FIN('cityText','Если города нет в списке',{max:40})}`:''}
  ${LB('Название ЖК')}${FIN('zkname','Например, Хан-Тенгри (без «ЖК»)',{max:60})}
  ${LB('Улица и номер дома')}${FIN('street','Например, ул. Сатпаева, 30',{max:80})}
  <div class="two">${`<div>${LB('Подъезд')}${FIN('ent','3',{mode:'numeric',max:3})}</div><div>${LB('Квартира')}${FIN('apt','58',{max:6})}</div>`}</div>`,
  foot:BTN('Отправить и встать в список','p',ACT('waitlist'))})};
S['ob-waitdone']=p=>{const n=p.zkId?waitN(p.zkId):D.waitlist.filter(w=>w.key===p.key).length;
  return SCRN({nav:'<div style="height:12px"></div>',body:`<span class="tile m" style="width:52px;height:52px;border-radius:50%">${I('check',24,2.4)}</span>
  <h1 class="h1 mt">Вы в списке ожидания</h1><p class="sub">ЖК «${esc(p.name)}»${p.city?', '+esc(p.city):''}. Уже ждут открытия: ${n} ${plural(n,'сосед','соседа','соседей')}.</p>
  ${ST(1,'Каждый приглашённый сосед приближает запуск.',1)}${ST(2,'Когда наберётся достаточно соседей, откроем ленту, чаты подъездов и барахолку.')}${ST(3,'Первые соседи получат значок основателя и бесплатные поднятия объявлений.')}
  <div class="card mt3"><div class="b s">Готовый текст для чата дома</div><div class="card f mt2 xs mut" style="line-height:1.5">Соседи, для нашего ЖК «${esc(p.name)}» запускают приложение Соседи: отключения, барахолка, мастера, связь по номеру машины. Встаньте в список, чтобы его открыли: ${esc(appUrl('app'))}</div>
  <div class="mt2">${BTN('Отправить в чат дома','p sm',ACT('sharewait',{name:p.name}),'send')}</div></div>`,
  foot:BTN('Выбрать другой ЖК','g',ACT('leavezk'))})};

/* ---------- ЖК ещё не открыт ---------- */
S['zk-closed']=()=>{const z=zk();const t=z?.threshold||30;const n=waitN(ZID);const mine=D.waitlist.find(w=>w.zkId===ZID&&w.uid===C.uid);
  return SCRN({nav:NAVB('',{r:`<button class="link s" ${ACT('leavezk')}>Другой ЖК</button>`}),body:`
  <div class="center mt"><span class="tile wa" style="width:76px;height:76px;border-radius:50%;margin:0 auto">${I('building',34)}</span>
  <h1 class="h2 mt3">ЖК «${esc(z?.name)}» пока не подключён</h1><p class="xs mut mt2">${esc(cityName(z))}${z?.address?', '+esc(z.address):''}</p>
  <p class="sub mt2">Откроем ЖК, когда в списке будет ${t} ${plural(t,'сосед','соседа','соседей')}.</p></div>
  <div class="card f mt3"><div class="flex between"><span class="b s">Уже ждут открытия</span><span class="b s g">${n} из ${t}</span></div><div class="mt2">${PR(Math.min(100,n/t*100))}</div></div>
  ${mine?`<p class="s g b mt center">Вы в списке</p>`:`${LB('Ваш адрес, чтобы позвать соседей по подъезду')}<div class="two"><div>${FIN('ent','Подъезд',{mode:'numeric',max:3})}</div><div>${FIN('apt','Квартира',{max:6})}</div></div>`}`,
  foot:(mine?'':BTN('Встать в список ожидания','p',ACT('joinwait')))+BTN('Позвать соседей в чат дома',mine?'p':'o',ACT('sharezk'),'share')})};

/* ---------- действия ---------- */
A.pickzk=async el=>{const z=D.zks.find(x=>x.id===el.dataset.id);await setPref({zk:z.id});subZk(z.id);
  if(z.status==='active'){await until(()=>D.loaded.members);go('ob-addr',{},{root:1})}else go('zk-closed',{},{root:1})};
A.leavezk=async()=>{await setPref({zk:null});subZk(null);go('ob-city',{},{root:1})};
A.joinwait=async()=>{const z=zk();const ok=await W(()=>C.db.doc('waitlist/'+C.uid+'_'+z.id).set({uid:C.uid,zkId:z.id,cityId:cityOf(z),city:cityName(z),name:z.name,key:z.id,ent:fv('ent'),apt:fv('apt'),at:now()}),'Вы в списке ожидания');if(ok)R()};
A.waitlist=async()=>{const name=cleanZkName(fv('zkname'));const cityId=F.city||'';const city=cityId?cityById(cityId)?.name:fv('cityText');
  if(!city){toast('Укажите город');return}if(!name){toast('Укажите название ЖК');return}
  const key=(cityId||slug(city))+'-'+slug(name);const h=(await sha(key)).slice(0,16);
  const ok=await W(()=>C.db.doc('waitlist/'+C.uid+'_'+h).set({uid:C.uid,cityId:cityId||null,city,name,key,street:fv('street'),ent:fv('ent'),apt:fv('apt'),at:now()}));
  if(ok)go('ob-waitdone',{key,name,city},{replace:1})};
A.leavezk2=async()=>{if(!confirm('Выйти из ЖК? Профиль соседа будет удалён, публикации останутся.'))return;await W(()=>zdoc('members',C.uid).delete());await setPref({zk:null});subZk(null);go('ob-city',{},{root:1})};

/* ---------- импорт справочника ЖК (модерация) ---------- */
function parseCatalog(text){const rows=[],bad=[];String(text||'').split(/\r?\n/).forEach((line,i)=>{if(!line.trim())return;const c=line.split(/[;\t]/).map(s=>s.trim());
  if(i===0&&/город/i.test(c[0]))return;const cityId=cityIdByName(c[0]);const name=cleanZkName(c[1]);
  if(!cityId||!name){bad.push(i+1);return}rows.push({cityId,name,address:c[2]||'',developer:c[3]||'',entrances:Number(c[4])||null})});return{rows,bad}}
async function importCatalog(text){const {rows,bad}=parseCatalog(text);let added=0,skipped=0;const seen=new Set(D.zks.map(z=>cityOf(z)+'|'+z.name.toLowerCase()));
  for(const r of rows){const base=r.cityId+'-'+slug(r.name);const k=r.cityId+'|'+r.name.toLowerCase();
    if(seen.has(k)){skipped++;continue}seen.add(k);const id=(base+'-'+(await sha(base+r.address)).slice(0,4)).slice(0,60);
    try{await C.db.doc('zk/'+id).set({cityId:r.cityId,city:cityById(r.cityId).name,name:r.name,address:r.address,developer:r.developer,entrances:r.entrances||1,aptsPerEntrance:60,threshold:30,status:'catalog',codes:{},zones:[],houses:[],at:now()});added++}catch(e){skipped++}}
  return{added,skipped,bad}}

