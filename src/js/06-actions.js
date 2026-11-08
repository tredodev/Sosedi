/* =====================================================================
   Действия (запись в базу). Вызываются через data-act.
   ===================================================================== */
const A={};
const fv=k=>String(F[k]??'').trim();
const num=k=>{const v=Number(String(F[k]??'').replace(/\s/g,'').replace(',','.'));return isFinite(v)&&v>0?v:null};

/* навигация и формы */
A.back=()=>back();
A.tab=el=>{F={};go(el.dataset.v,{},{root:1})};
A.mode=el=>setMode(el.dataset.v);
A.pick=el=>{F[el.dataset.f]=el.dataset.v;R()};
A.tog=el=>{const f=el.dataset.f;const a=new Set(F[f]||[]);a.has(el.dataset.v)?a.delete(el.dataset.v):a.add(el.dataset.v);F[f]=[...a];R()};
A.togf=el=>{const f=el.dataset.f;F[f]=!(F[f]??(el.dataset.def?true:false));R()};
A.sheetclose=()=>{NAVS.sheet=null;R()};
A.sheetbg=(el,e)=>{if(e.target===el){NAVS.sheet=null;R()}};
A.addphotos=async()=>{const ids=await pickPhotos(6-(F.photos||[]).length);if(ids.length){F.photos=[...(F.photos||[]),...ids];R()}};
A.rmphoto=el=>{F.photos=(F.photos||[]).filter((_,i)=>i!==Number(el.dataset.v));R()};

/* ---------- вход ---------- */
A.pickzk=async el=>{const id=el.dataset.id;await setPref({zk:id});subZk(id);go('ob-addr',{},{root:1})};
A.leavezk=async()=>{await setPref({zk:null});subZk(null);go('ob-zk',{},{root:1})};
A.waitlist=async()=>{const name=fv('zkname').replace(/^\s*жк\s*/i,'').replace(/[«»"']/g,'').trim(),city=fv('city')||'Алматы';if(!name){toast('Укажите название ЖК');return}
  const key=normKey(city+'-'+name);const h=(await sha(key)).slice(0,16);
  const ok=await W(()=>C.db.doc('waitlist/'+C.uid+'_'+h).set({uid:C.uid,city,name,key,house:fv('house'),ent:fv('ent'),apt:fv('apt'),at:now()}));
  if(ok)go('ob-waitdone',{key,name},{replace:1})};
const normKey=s=>s.toLowerCase().replace(/[«»"' ]+/g,'-').replace(/[^a-zа-я0-9-]/gi,'').slice(0,60);
A.sharewait=el=>share(`Соседи, для нашего ЖК «${el.dataset.name}» запускают приложение Соседи. Встаньте в список, чтобы его открыли:`,appUrl('app'));
A.sharezk=()=>share(`Соседи, ЖК «${zk()?.name}» подключается к приложению Соседи: отключения, барахолка, мастера. Присоединяйтесь:`,appUrl('app'));
A.saveaddr=async()=>{const name=fv('name');const apt=fv('apt');const ent=Number(F.ent||1);const hs=zk()?.houses||[];const house=fv('house')||(hs.length===1?hs[0]:'');
  if(!name||!apt||!house){toast(!house?'Укажите номер дома':'Заполните имя и квартиру');return}
  const area=num('area');const ok=await W(()=>zdoc('members',C.uid).set({name,house,entrance:ent,apt,area:area||null,verified:false,role:'resident',plates:[],platesShow:[],notifyCar:true,joinedAt:now()}));
  if(ok){await until(()=>me());go('ob-verify',{},{root:1})}};
A.verify=async()=>{const code=fv('code').replace(/\D/g,'');const m=me();const z=zk();if(code.length<4){F.err='Введите код из подъезда';R();return}
  if(F.lockUntil&&F.lockUntil>now()){F.err='Подождите минуту и попробуйте снова';R();return}
  const k=entKey(m.house,m.entrance);const want=z?.codes?.[k];if(!want){F.err='ОСИ ещё не выпустило код для вашего подъезда. Попросите приглашение у соседа.';R();return}
  const h=await sha(ZID+':'+k+':'+code);
  if(h!==want.hash){F.tries=(F.tries||0)+1;const left=3-F.tries;F.err=left>0?`Этот код не подходит к ${multiHouse()&&m.house?'дому '+m.house+', ':''}подъезду ${m.entrance}. Осталось ${left} ${plural(left,'попытка','попытки','попыток')}.`:'Попытки закончились. Попробуйте через 10 минут или попросите приглашение.';if(left<=0)F.lockUntil=now()+600000;R();return}
  const ok=await W(()=>zdoc('members',C.uid).update({verified:true,via:'code',verifiedAt:now()}),'Адрес подтверждён');if(ok)go('ob-car',{},{root:1})};
A.useinvite=async()=>{const inv=D.invites.find(i=>i.id===PENDING_INVITE?.code);if(!inv||inv.usedBy){toast('Приглашение уже использовано','err');return}
  const ok=await W(async()=>{await zdoc('invites',inv.id).update({usedBy:C.uid,usedAt:now()});await zdoc('members',C.uid).update({verified:true,via:'invite',inviter:inv.from,verifiedAt:now()})},'Адрес подтверждён');
  if(ok){PENDING_INVITE=null;go('ob-car',{},{root:1})}};
A.askinvite=()=>share(`Привет! Я живу в ${zk()?.name}, ${me()?.entrance} подъезд. Пришли мне, пожалуйста, приглашение в приложении Соседи (Аккаунт → Позвать соседей).`,appUrl('app'));
A.readonly=()=>go('home',{},{root:1});
A.saveplate=async el=>{const raw=fv('plate')+(F.reg!=null&&el.dataset.next?' '+fv('reg'):'');const pl=normPlate(raw);
  const next=el.dataset.next;if(pl.length<4){if(next){go(next,{},{root:1});return}toast('Введите номер');return}
  const m=me();const plates=[...new Set([...(m.plates||[]),pl])];const show=[...new Set([...(m.platesShow||[]),raw.toUpperCase().replace(/\s+/g,' ').trim()])];
  const ok=await W(()=>zdoc('members',C.uid).update({plates,platesShow:show,notifyCar:F.notify!==false}),'Номер сохранён');if(ok){F.plate='';if(next)go(next,{},{root:1});else R()}};
A.rmplate=async el=>{const i=Number(el.dataset.v);const m=me();await W(()=>zdoc('members',C.uid).update({plates:(m.plates||[]).filter((_,k)=>k!==i),platesShow:(m.platesShow||[]).filter((_,k)=>k!==i)}),'Номер удалён')};

/* ---------- лента и публикации ---------- */
A.save=async(el,e)=>{e.stopPropagation();const s=new Set(D.profile?.saved||[]);s.has(el.dataset.id)?s.delete(el.dataset.id):s.add(el.dataset.id);await setPref({saved:[...s].slice(-200)});R()};
A.vote=async(el,e)=>{e.stopPropagation();if(!needVerified())return;await setVote('votes',el.dataset.id,Number(el.dataset.v))};
A.addopt=()=>{F.opts=[...(F.opts||[]),''];R()};
A.rmopt=el=>{const i=Number(el.dataset.v);const vals=(F.opts||[]).map((o,k)=>F['opt'+k]??o).filter((_,k)=>k!==i);F.opts=vals;vals.forEach((v,k)=>F['opt'+k]=v);delete F['opt'+vals.length];R()};
A.publish=async el=>{if(!needVerified())return;const k=el.dataset.v;const title=fv('title');if(title.length<3){toast('Напишите заголовок');return}const m=me();
  const body={kind:k==='lost'&&F.lf==='found'?'lost':k,title:(k==='lost'?(F.lf==='found'?'Нашёл: ':'Потерял: '):'')+title,text:fv('text'),photos:F.photos||[],author:C.uid,at:now(),status:'active',scope:F.scope||(k==='poll'?'entrance':'all'),entrance:m.entrance,reports:[]};
  if(['sell','rent','wanted'].includes(k)){body.price=num('price');if(k==='sell')body.oldPrice=num('oldPrice')}
  if(['giveaway','sell','rent'].includes(k))body.pickup=F.pickup||[];
  if(k==='poll'){const opts=(F.opts||[]).map((o,i)=>String(F['opt'+i]??o).trim()).filter(Boolean);if(opts.length<2){toast('Нужно минимум два варианта');return}body.poll={options:opts,endsAt:now()+(Number(F.days)||3)*86400000};body.title=title}
  const ref=await W(()=>col('posts').add(body));if(!ref)return;
  if(FLEA.includes(k)){go('post',{id:ref.id},{replace:1});NAVS.sheet={k:'bump',id:ref.id};F={};R()}else go('post',{id:ref.id},{replace:1})};
A.comment=async el=>{if(!needVerified())return;const t=fv('c');if(!t)return;const ok=await W(()=>col('comments').add({post:el.dataset.id,by:C.uid,text:t.slice(0,1000),at:now()}));if(ok){F.c='';R()}};
A.report=async el=>{const p=D.posts.find(x=>x.id===el.dataset.id);if(!p||(p.reports||[]).includes(C.uid))return;await W(()=>zdoc('posts',p.id).update({reports:[...(p.reports||[]),C.uid]}),'Жалоба отправлена модератору')};
A.close=async el=>{await W(()=>zdoc('posts',el.dataset.id).update({status:'given',closedAt:now()}),'Снято с публикации')};
A.endpoll=async el=>{const p=D.posts.find(x=>x.id===el.dataset.id);await W(()=>zdoc('posts',p.id).update({poll:{...p.poll,endsAt:now()}}),'Опрос завершён')};
A.delpost=async el=>{if(!confirm('Удалить публикацию?'))return;const ok=await W(()=>zdoc('posts',el.dataset.id).update({status:'deleted'}),'Удалено');if(ok)back()};
A.forward=async el=>{await W(()=>zdoc('posts',el.dataset.id).update({forwarded:true,forwardedAt:now()}),'Итоги переданы в ОСИ')};
A.sharepost=el=>{const p=D.posts.find(x=>x.id===el.dataset.id);share(`${p.title}${p.price?', '+money(p.price):''}. В приложении Соседи, ${zk()?.name}:`,appUrl('app'))};
A.bumpsheet=el=>{NAVS.sheet={k:'bump',id:el.dataset.id};F.bo=null;R()};
A.dobump=async el=>{const id=el.dataset.id;const o=F.bo;const p=D.posts.find(x=>x.id===id);const pr=prices();
  if(o==='invite'){NAVS.sheet=null;go('invite');return}
  if(o==='free'){if(credits()<=0){toast('Бесплатных поднятий нет');return}await W(()=>zdoc('posts',id).update({bumpUntil:now()+86400000,bumpFree:true}),'Объявление поднято на сутки');NAVS.sheet=null;R();return}
  const days=o==='d3'?3:1;await W(()=>col('orders').add({type:'bump',ref:id,days,by:C.uid,amount:o==='d3'?pr.bump3:pr.bump1,title:'Поднятие «'+p.title+'»',status:'awaiting',at:now()}),'Заявка на поднятие отправлена. Поднимем после проверки оплаты');NAVS.sheet=null;R()};
A.bumpfree=async el=>{if(credits()<=0){toast('Бесплатных поднятий нет');return}const ok=await W(()=>zdoc('posts',el.dataset.id).update({bumpUntil:now()+86400000,bumpFree:true}),'Поднято на сутки');if(ok)go('post',{id:el.dataset.id},{replace:1})};
A.newinvite=async el=>{if(!needVerified())return;if(el.dataset.qr&&F.qr){F.qr=false;R();return}
  let inv=sortAt(D.invites.filter(i=>i.from===C.uid&&!i.usedBy&&!i.ctx))[0];
  if(!inv){const code=rid(8);const ok=await W(()=>zdoc('invites',code).set({from:C.uid,at:now(),usedBy:null}));if(!ok)return;inv={id:code}}
  const url=appUrl('invite-'+ZID+'-'+inv.id);if(el.dataset.qr){F.qr=true;R();return}
  share(`Соседи, я в приложении Соседи нашего ЖК «${zk()?.name}»: отключения, барахолка, мастера, связь по номеру машины. По этой ссылке адрес подтвердится сразу:`,url)};

/* ---------- отключения ---------- */
A.remind=async el=>{const r={...(D.profile?.remind||{})};r[el.dataset.id]=!r[el.dataset.id];await setPref({remind:r});toast(r[el.dataset.id]?'Напомним на главной в день отключения':'Напоминание выключено')};
A.outrep=async el=>{if(!needVerified())return;const k='out_'+el.dataset.id;await setAck(k,myAcks()[k]?null:now());toast(myAcks()[k]?'Отметка снята':'ОСИ увидит вашу отметку')};
A.shareoutage=el=>{const o=D.outages.find(x=>x.id===el.dataset.id);share(`${o.title}: ${outageWhen(o)}. ${o.reason||''}`,appUrl('app'))};

/* ---------- машины ---------- */
A.findcar=()=>{const pl=normPlate(fv('plate')+(F.reg??'02'));if(pl.length<5){toast('Введите номер полностью');return}if(!needVerified())return;
  const show=(fv('plate')+' '+(F.reg??'02')).toUpperCase().replace(/\s+/g,' ');const o=findOwner(pl);
  if(o&&o.id===C.uid){toast('Это ваш номер');return}if(o)go('car-new',{id:o.id,v:show});else go('car-unknown',{v:show})};
A.sendalert=async el=>{const ref=await W(()=>col('alerts').add({plate:el.dataset.plate,from:C.uid,to:el.dataset.to,reason:F.reason||REASONS[0],text:fv('text'),status:'sent',at:now()}));if(ref)go('car-alert',{id:ref.id},{replace:1})};
A.carreply=async el=>{await W(()=>zdoc('alerts',el.dataset.id).update({reply:el.dataset.v,status:'coming',t_coming:now(),updAt:now()}),'Сосед увидит ответ')};
A.carfree=async el=>{await W(()=>zdoc('alerts',el.dataset.id).update({status:'free',freeAt:now(),updAt:now()}))};
A.thanks=async el=>{await W(()=>zdoc('alerts',el.dataset.id).update({thanks:el.dataset.v}),'Отправлено')};
A.askcar=async el=>{if(!needVerified())return;const ref=await W(()=>col('posts').add({kind:'car',title:'Чья машина '+el.dataset.v+'?',text:'Перекрыла выезд. Отзовитесь, пожалуйста.',author:C.uid,at:now(),status:'active',scope:'all',entrance:me().entrance,photos:[],reports:[]}),'Опубликовали в ленте ЖК');if(ref)go('post',{id:ref.id},{replace:1})};
A.printnote=el=>{const html=`<!doctype html><html lang="ru"><meta charset="utf-8"><title>Записка</title><body style="font-family:sans-serif;text-align:center;padding:40px"><div style="border:2px solid #222;display:inline-block;padding:4px 14px;font-weight:700;font-size:22px;border-radius:6px">${esc(el.dataset.v)}</div><h1>Ваша машина мешает выезду соседу</h1><div style="width:260px;margin:20px auto">${QRSVG(el.dataset.url,6)}</div><p>Отсканируйте камерой телефона, чтобы ответить соседу.<br>Приложение Соседи, ${esc(zk()?.name)}</p></body></html>`;saveFile('zapiska-'+normPlate(el.dataset.v)+'.html',html)};
A.shareurl=el=>share(el.dataset.t,el.dataset.url);

/* ---------- мастера ---------- */
A.savemaster=async()=>{const name=fv('name'),trade=fv('trade');if(!name||!trade){toast('Укажите имя и специальность');return}if(!needVerified())return;
  await W(()=>col('masters').add({name,trade,desc:fv('desc'),phone:fv('phone'),entrance:F.ent?Number(F.ent):null,status:'pending',suggestedBy:C.uid,ownerUid:F.self?C.uid:null,prices:[],at:now()}),'Отправлено модератору');back()};
A.sendjob=async el=>{if(!needVerified())return;const what=fv('what');if(!what){toast('Напишите, что сделать');return}
  const ref=await W(()=>col('jobs').add({master:el.dataset.id,from:C.uid,what,text:fv('text'),photos:F.photos||[],when:F.when||'Договоримся',status:'sent',at:now()}),'Заявка отправлена');if(ref)go('job',{id:ref.id},{replace:1})};
A.jobaccept=async el=>{await W(()=>zdoc('jobs',el.dataset.id).update({status:'accepted',eta:fv('eta'),note:fv('note'),accAt:now(),updAt:now()}),'Заявка принята')};
A.jobdone=async el=>{const ok=await W(()=>zdoc('jobs',el.dataset.id).update({status:'done',doneAt:now(),updAt:now()}));if(ok)go('review',{id:el.dataset.id},{replace:1})};
A.jobcancel=async el=>{await W(()=>zdoc('jobs',el.dataset.id).update({status:'cancelled',updAt:now()}),'Заявка отменена')};
A.savereview=async el=>{const j=D.jobs.find(x=>x.id===el.dataset.id);const ok=await W(async()=>{await col('reviews').add({master:j.master,job:j.id,by:C.uid,rec:String(F.rec??'1')==='1',tags:F.tags||[],text:fv('text'),at:now()});await zdoc('jobs',j.id).update({reviewed:true})},'Спасибо за отзыв');if(ok)go('master',{id:j.master},{replace:1})};

/* ---------- чаты ---------- */
A.dm=el=>{if(!needVerified())return;go('chat',{id:dmId(C.uid,el.dataset.id)})};
A.sendmsg=async el=>{if(!needVerified())return;const t=fv('m');if(!t)return;F.m='';R();const ok=await W(()=>col('msgs').add({chat:el.dataset.id,from:C.uid,text:t.slice(0,1000),at:now()}));
  if(ok){setPref({read:{...(D.profile?.read||{}),[el.dataset.id]:now()}});postDraw.push(()=>{const b=document.querySelector('#app .body');if(b)b.scrollTop=b.scrollHeight})}};
A.summarize=async el=>{if(!C.sample){toast('Пересказ недоступен в этом просмотре','err');return}const id=el.dataset.id;const rd=(D.profile?.read||{})[id]||0;
  const ms=D.msgs.filter(x=>x.chat===id&&x.at>rd).slice(0,120).reverse();F.sum='Пересказываем…';R();
  try{const r=await C.sample(`Ты помогаешь жителю многоквартирного дома. Ниже сообщения из чата соседей, которые он пропустил. Сделай краткий пересказ на русском: 3–5 пунктов, каждый с новой строки, начиная с «• », только факты, важное для жителя (ремонт, отключения, находки, договорённости). Без вступления.\n\n`+ms.map(m=>`${nameOf(m.from)}: ${m.text}`).join('\n'),{modelTier:'quick',onText:({text})=>{F.sum=text;R()}});F.sum=r.text;R()}
  catch(e){F.sum=null;toast(e.code==='not_granted'?'Пересказ не разрешён':'Не получилось пересказать','err');R()}};

/* ---------- новости ОСИ ---------- */
A.ack=async el=>{const k='n_'+el.dataset.id;await setAck(k,myAcks()[k]?null:now())};
A.sharenews=el=>{const n=D.news.find(x=>x.id===el.dataset.id);share(`ОСИ ${zk()?.name}: ${n.title}. ${n.when||''}`,appUrl('app'))};

/* ---------- ОСИ: заявки, взносы, голосования ---------- */
A.sendreq=async el=>{if(!needVerified())return;const title=fv('title');if(!title){toast('Опишите проблему');return}const m=me();
  const nums=D.osireq.map(r=>Number(r.num)||0);const n=String((nums.length?Math.max(...nums):400)+1).padStart(4,'0');
  const ref=await W(()=>col('osireq').add({num:n,cat:F.cat||'Другое',title,where:F.where||'Подъезд',text:fv('text'),photos:F.photos||[],by:C.uid,house:m.house||'',entrance:m.entrance,apt:m.apt,joiners:[],status:'new',timeline:[],at:now(),news:el.dataset.news||null}),'Заявка отправлена в ОСИ');
  if(ref)go('osi-req',{id:ref.id},{replace:1})};
A.joinreq=async el=>{const r=D.osireq.find(x=>x.id===el.dataset.id);const ok=await W(()=>zdoc('osireq',r.id).update({joiners:[...new Set([...(r.joiners||[]),C.uid])]}),'Вы присоединились к заявке');if(ok)go('osi-req',{id:r.id},{replace:1})};
A.reqok=async el=>{await W(()=>zdoc('osireq',el.dataset.id).update({confirm:'ok',status:'closed',updAt:now()}),'Спасибо, ОСИ увидит подтверждение')};
A.reqbad=async el=>{const r=D.osireq.find(x=>x.id===el.dataset.id);await W(()=>zdoc('osireq',r.id).update({confirm:'bad',status:'reopened',repeat:true,updAt:now(),timeline:[...(r.timeline||[]),{t:'Житель: проблема не решена',at:now()}]}),'Заявка вернулась в работу')};
A.autopay=async()=>{await setPref({autopay:!D.profile?.autopay});toast(D.profile?.autopay?'Напомним 5-го числа':'Напоминание выключено')};
A.feepaid=async el=>{await W(()=>col('orders').add({type:'fee',ref:el.dataset.id,by:C.uid,amount:Number(el.dataset.sum)||0,title:'Взнос ОСИ',status:'awaiting',at:now(),apt:me().apt,entrance:me().entrance}),'Отметили. ОСИ подтвердит поступление')};
A.castvote=async el=>{const b=D.ballots.find(x=>x.id===el.dataset.id);const m=me();if(!needVerified())return;if(myOV()[b.id]){toast('Вы уже голосовали');return}
  if(fv('apt2')!==String(m.apt)){toast('Номер квартиры не совпадает с вашим адресом','err');return}if(!m.area){toast('Укажите площадь квартиры в настройках','err');return}
  await setVote('ovotes',b.id,{c:F.c||'za',at:now(),area:Number(m.area),apt:m.apt,zk:ZID});toast('Голос учтён')};
A.protocol=el=>{const b=D.ballots.find(x=>x.id===el.dataset.id);const r=ballotRes(b);const list=D.ovotes.filter(v=>v[b.id]).map(v=>`кв. ${v[b.id].apt}, ${v[b.id].area} м², ${{za:'за',pr:'против',vz:'воздержался'}[v[b.id].c]}, ${dmy(v[b.id].at)} ${hm(v[b.id].at)}`);
  saveFile(`protokol-${(b.num||b.id)}.txt`,`ПРОТОКОЛ ГОЛОСОВАНИЯ\nОСИ ${zk()?.name}\n\nВопрос: ${b.title}\n${b.text||''}\n\nСрок: до ${dmy(b.deadline)}\nПроголосовали: ${r.n} квартир, ${Math.round(r.area)} м² (${r.quorum}% площади), кворум ${r.quorum>=(b.quorum||50)?'есть':'нет'}\n\nЗа: ${r.pct('za')}%\nПротив: ${r.pct('pr')}%\nВоздержались: ${r.pct('vz')}%\n\nРешение: ${r.pct('za')>50&&r.quorum>=(b.quorum||50)?'ПРИНЯТО':'НЕ ПРИНЯТО'}\n\nБюллетени:\n${list.join('\n')}\n\nСформировано в приложении Соседи ${dmy(now())} ${hm(now())}. Пилотная версия: юридическую силу протоколу придаёт подпись председателя.\n`)};

/* ---------- сервисы ---------- */
A.book=async el=>{if(!needVerified())return;const zn=(zk()?.zones||[]).find(z=>z.id===el.dataset.z);const slots=zn.slots||['10:00–13:00','13:00–16:00','16:00–19:00','19:00–22:00'];const idx=slots.indexOf(el.dataset.s);
  const id=`${zn.id}_${el.dataset.d}_${idx}`;const ref=zdoc('bookings',id);
  const ok=await W(async()=>{const l=await ref.acquire({holder:C.uid,ttlMs:5000});if(!l.acquired)throw{code:'busy'};const s=await ref.get();if(s.exists&&s.data().status!=='cancelled')throw{code:'busy'};
    await ref.set({zone:zn.id,zoneName:zn.name,date:el.dataset.d,slot:el.dataset.s,by:C.uid,status:'active',at:now()})});
  if(ok){toast('Забронировано');F.s=null;R()}};
A.unbook=async el=>{await W(()=>zdoc('bookings',el.dataset.id).update({status:'cancelled'}),'Бронь отменена')};
A.savemeters=async()=>{const pp={...(D.profile?.passport||{})};['cold','hot','el'].forEach(k=>{if(F['m_'+k]!=null)pp[k]=fv('m_'+k)});pp.metersAt=now();await setPref({passport:pp});toast('Показания сохранены')};
A.addwar=async()=>{const t=fv('wt');if(!t)return;const pp={...(D.profile?.passport||{})};pp.warranty=[...(pp.warranty||[]),{t,until:fv('wu')}];await setPref({passport:pp});F.wt='';F.wu='';R()};
A.rmwar=async el=>{const pp={...(D.profile?.passport||{})};pp.warranty=(pp.warranty||[]).filter((_,i)=>i!==Number(el.dataset.v));await setPref({passport:pp})};
A.evjoin=async el=>{const k='ev_'+el.dataset.id;await setAck(k,myAcks()[k]?null:now())};
A.gbjoin=async el=>{if(!needVerified())return;const k='gb_'+el.dataset.id;const on=!myAcks()[k];await setAck(k,on?now():null);toast(on?'Вы в списке. ОСИ напишет перед оплатой':'Вы вышли из покупки')};
A.pledge=async el=>{if(!needVerified())return;const c=D.crowd.find(x=>x.id===el.dataset.id);const amt=Number(F.amt||(c.amounts||[2000,5000,10000])[1]);
  await setAck('cr_'+c.id,amt);await W(()=>col('orders').add({type:'crowd',ref:c.id,by:C.uid,amount:amt,title:'Сбор: '+c.title,status:'awaiting',at:now()}),'Спасибо! ОСИ подтвердит поступление')};
A.newtask=async()=>{if(!needVerified())return;const when=fv('when');if(!when){toast('Укажите, когда');return}
  await W(()=>col('tasks').add({kind:F.k||'trash',when,where:fv('where'),reward:num('reward')||0,by:C.uid,status:'open',at:now()}),'Задача опубликована');F={};R()};
A.tasktake=async el=>{await W(()=>zdoc('tasks',el.dataset.id).update({taker:C.uid,status:'taken',takenAt:now()}),'Задача ваша')};
A.taskdone=async el=>{const ids=await pickPhotos(1);await W(()=>zdoc('tasks',el.dataset.id).update({status:'done',doneAt:now(),photo:ids[0]||null}),'Отметили выполненной')};
A.taskpaid=async el=>{const t=D.tasks.find(x=>x.id===el.dataset.id);const tip=Number(F.tip??10);
  await W(async()=>{await zdoc('tasks',t.id).update({status:'paid',tip,paidAt:now()});if(t.repeat)await col('tasks').add({kind:t.kind,when:t.when,where:t.where,reward:t.reward,by:t.by,taker:t.taker,status:'taken',repeat:true,at:now()})},'Готово, спасибо');back()};
A.taskrepeat=async el=>{const t=D.tasks.find(x=>x.id===el.dataset.id);await W(()=>zdoc('tasks',t.id).update({repeat:!t.repeat}))};
A.taskst=async el=>{await W(()=>zdoc('tasks',el.dataset.id).update({status:el.dataset.v}));back()};
A.cart=el=>{const c={...(F.cart||{})};const i=el.dataset.v;c[i]=Math.max(0,(c[i]||0)+Number(el.dataset.d));F.cart=c;R()};
A.bizorder=async el=>{const b=D.biz.find(x=>x.id===el.dataset.id);const cart=F.cart||{};const items=(b.products||[]).map((x,i)=>cart[i]?{t:x.t,n:cart[i],p:x.p}:null).filter(Boolean);if(!items.length)return;
  const ok=await W(async()=>{await col('orders').add({type:'biz',ref:b.id,to:b.owner,by:C.uid,items,amount:Number(el.dataset.total),title:b.name,status:'awaiting',at:now()});await col('msgs').add({chat:dmId(C.uid,b.owner),from:C.uid,text:'Заказ: '+items.map(i=>i.t+' × '+i.n).join(', ')+'. Итого '+money(el.dataset.total),at:now()})},'Заказ отправлен, договоритесь в чате');
  if(ok)go('chat',{id:dmId(C.uid,b.owner)},{replace:1})};
A.addprod=()=>{F.prods=[...F.prods,{t:'',p:''}];R()};
A.savebiz=async()=>{if(!needVerified())return;const name=fv('name');if(!name){toast('Укажите название');return}const b=D.biz.find(x=>x.owner===C.uid);
  const products=F.prods.map((x,i)=>({t:String(F['pt'+i]??x.t).trim(),p:Number(String(F['pp'+i]??x.p).replace(/\D/g,''))||0})).filter(x=>x.t);
  const body={name,desc:fv('desc'),pickup:fv('pickup'),products,owner:C.uid,entrance:me().entrance,status:b?.status==='approved'?'approved':'pending',at:b?.at||now()};
  await W(()=>b?zdoc('biz',b.id).set(body):col('biz').add(body),b?'Сохранено':'Отправлено модератору');back()};
A.newlead=async()=>{if(!needVerified())return;const ref=await W(()=>col('leads').add({kind:F.kind||'Остекление балкона',size:fv('size'),desc:fv('desc'),by:C.uid,entrance:me().entrance,status:'open',at:now()}),'Подрядчики получат задачу');if(ref)go('lead',{id:ref.id},{replace:1})};
A.chooseoffer=async el=>{await W(()=>zdoc('leads',el.dataset.id).update({chosen:el.dataset.v,status:'measure'}),'Подрядчик свяжется для замера')};
A.newspot=async()=>{if(!needVerified())return;const spot=fv('spot');if(!spot){toast('Укажите номер места');return}await W(()=>col('parking').add({spot,level:fv('level'),from:fv('from'),to:fv('to'),price:num('price')||0,by:C.uid,status:'active',at:now()}),'Место опубликовано');F={pt:'give'};R()};
A.unspot=async el=>{await W(()=>zdoc('parking',el.dataset.id).update({status:'closed'}),'Снято')};
A.rentspot=async el=>{if(!needVerified())return;const x=D.parking.find(p=>p.id===el.dataset.id);
  await W(async()=>{await zdoc('parking',x.id).update({renter:C.uid,rentedAt:now()});await col('orders').add({type:'parking',ref:x.id,to:x.by,by:C.uid,amount:x.price,title:'Место '+x.spot,status:'awaiting',at:now()})},'Место ваше. Оплата по договорённости с соседом')};
A.nh=async el=>{const nh={...(D.profile?.newhome||{})};nh[el.dataset.v]=!nh[el.dataset.v];await setPref({newhome:nh})};
A.newpass=async()=>{const name=fv('name');if(!name){toast('Кто придёт?');return}const base=new Date();base.setDate(base.getDate()+Number(F.day||0));
  const t=s=>{const [h,m]=(s||'').split(':').map(Number);const d=new Date(base);d.setHours(h||0,m||0,0,0);return d.getTime()};
  const from=t(fv('from')||'09:00'),to=t(fv('to')||'21:00');if(to<=from){toast('Время «до» должно быть позже «с»');return}
  const ref=await W(()=>col('passes').add({name,from,to,place:F.place||'Калитка',plate:fv('plate'),by:C.uid,house:me().house||'',apt:me().apt,code:String(Math.floor(100000+Math.random()*900000)),status:'active',at:now()}),'Пропуск создан');if(ref)go('guest',{id:ref.id},{replace:1})};
A.revokepass=async el=>{await W(()=>zdoc('passes',el.dataset.id).update({status:'revoked'}),'Пропуск отозван')};
A.sharepass=el=>{const g=D.passes.find(x=>x.id===el.dataset.id);share(`Пропуск в ${zk()?.name}: ${g.place}, ${dmy(g.from)} ${hm(g.from)}–${hm(g.to)}. Назовите охране код ${g.code}.`,'')};
A.scart=el=>{const c={...(F.cart||{})};c[el.dataset.id]=(c[el.dataset.id]||0)+1;F.cart=c;R()};
A.shoporder=async el=>{const items=D.shop.filter(x=>F.cart?.[x.id]).map(x=>({t:x.name,n:F.cart[x.id],p:x.price}));
  await W(()=>col('orders').add({type:'shop',by:C.uid,items,amount:Number(el.dataset.total),parcel:!!F.parcel,apt:me().apt,entrance:me().entrance,title:'Лавка: '+items.length+' поз.',status:'awaiting',at:now()}),'Заказ принят');F={};R()};
A.move=async()=>{const to=F.to;const m=me();if(!to)return;if(!confirm('Переехать? Ваш профиль в текущем ЖК будет удалён.'))return;
  const ok=await W(async()=>{await C.db.doc(`zk/${to}/members/${C.uid}`).set({name:m.name,house:'',entrance:1,apt:'',verified:false,role:'resident',plates:m.plates||[],platesShow:m.platesShow||[],notifyCar:m.notifyCar!==false,joinedAt:now(),movedFrom:ZID});await zdoc('members',C.uid).delete()});
  if(ok){await setPref({zk:to});subZk(to);await until(()=>D.loaded.members);go('ob-addr',{},{root:1});toast('Укажите адрес в новом ЖК')}};
A.savesettings=async()=>{const m=me();const ent=Number(F.ent||m.entrance);const apt=fv('apt');const house=fv('house')||m.house||'';const moved=ent!==m.entrance||apt!==String(m.apt)||house!==String(m.house||'');
  const body={name:fv('name')||m.name,house,entrance:ent,apt,area:num('area'),notifyCar:!!F.notify,helper:{on:!!F.helper,age:Number(F.age)||null,consent:!!F.consent}};if(moved){body.verified=false}
  const ok=await W(()=>zdoc('members',C.uid).update(body),'Сохранено');if(ok&&moved)go('ob-verify',{},{root:1})};
A.leavezk2=async()=>{if(!confirm('Выйти из ЖК? Профиль соседа будет удалён, публикации останутся.'))return;await W(()=>zdoc('members',C.uid).delete());await setPref({zk:null});subZk(null);go('ob-zk',{},{root:1})};

