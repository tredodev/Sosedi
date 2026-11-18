/* ===== Иконки ===== */
const LIKE='<path d="M7 11v9H4v-9zM7 11l4-8a2 2 0 0 1 2 2v4h6l-2 11H7"/>';
const P={
back:'<path d="M20 12H4M10 6l-6 6 6 6"/>',fwd:'<path d="m9 18 6-6-6-6"/>',down:'<path d="m6 9 6 6 6-6"/>',close:'<path d="M18 6 6 18M6 6l12 12"/>',
bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
car:'<path d="M5 17h14v-5l-2-5H7l-2 5z"/><circle cx="8" cy="17" r="1.6"/><circle cx="16" cy="17" r="1.6"/><path d="M5 12h14"/>',
wrench:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z"/>',
bag:'<path d="M6 7h12l1 14H5z"/><path d="M9 7a3 3 0 0 1 6 0"/>',chart:'<path d="M4 20h16"/><path d="M7 16v-4M12 16V7M17 16v-6"/>',
home:'<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>',plus:'<path d="M12 5v14M5 12h14"/>',
plusc:'<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',chat:'<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',check:'<path d="m5 12 5 5 9-10"/>',
drop:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
dropoff:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="M4 4l16 16"/>',
share:'<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v7h14v-7"/>',camera:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
qr:'<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 19h2M19 14h1"/>',
userplus:'<circle cx="10" cy="8" r="4"/><path d="M2 21a8 8 0 0 1 14-5.3"/><path d="M19 14v6M16 17h6"/>',
alert:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/>',lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
unlock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
search:'<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
gift:'<rect x="4" y="9" width="16" height="11"/><path d="M3 9h18M12 9v11M12 9S10 4 7.5 5.5 9 9 12 9zM12 9s2-5 4.5-3.5S15 9 12 9z"/>',
tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8" r="1.3"/>',ask:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17v.3"/>',
up:'<path d="M12 19V5M6 11l6-6 6 6"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
box:'<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',doc:'<path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7"/>',
mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',send:'<path d="M4 12 20 4l-6 16-3-7z"/>',
spark:'<path d="M12 3c.5 4 2 5.5 6 6-4 .5-5.5 2-6 6-.5-4-2-5.5-6-6 4-.5 5.5-2 6-6zM19 15c.2 1.6.8 2.2 2.4 2.4-1.6.2-2.2.8-2.4 2.4-.2-1.6-.8-2.2-2.4-2.4 1.6-.2 2.2-.8 2.4-2.4z"/>',
trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
paw:'<circle cx="6.5" cy="11" r="1.8"/><circle cx="17.5" cy="11" r="1.8"/><circle cx="9.5" cy="6.5" r="1.8"/><circle cx="14.5" cy="6.5" r="1.8"/><path d="M8 17.5c0-3 2-5.5 4-5.5s4 2.5 4 5.5c0 2-2 2.5-4 2.5s-4-.5-4-2.5z"/>',
calendar:'<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
building:'<path d="M5 21V5l7-2v18M12 8h7v13M3 21h18"/><path d="M8 8v.5M8 12v.5M8 16v.5M15 12v.5M15 16v.5"/>',
barrier:'<path d="M5 21V7M3 21h4M5 10h16"/><circle cx="5" cy="6" r="1.5"/><path d="M9 10l2 0M14 10h2"/>',
gate:'<path d="M5 21V4M19 21V4M5 8h14M5 14h14M9 8v6M14 8v6"/>',
video:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
wifioff:'<path d="M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5-2.7M14 10.3a10 10 0 0 1 5 2.7M2 9.5a15 15 0 0 1 4.5-2.8M12 20h.01"/>',
like:LIKE,dislike:'<g transform="rotate(180 12 12)">'+LIKE+'</g>',
park:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M10 16V8h3a2.5 2.5 0 0 1 0 5h-3"/>',
cart:'<circle cx="8" cy="19" r="1.6"/><circle cx="17" cy="19" r="1.6"/><path d="M3 5h3l2 9h10l2-7H7"/>',
stroller:'<circle cx="8" cy="19" r="1.8"/><circle cx="17" cy="19" r="1.8"/><path d="M4 5h2l1.5 9h11c0-5-3.5-9-8-9v9"/>',
book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 7h6"/>',
cake:'<path d="M4 21h16v-8H4zM4 16c2.7 1.3 5.3 1.3 8 0s5.3-1.3 8 0"/><path d="M8 13V9M16 13V9M12 13V9M8 6v.5M12 5v.5M16 6v.5"/>',
pin:'<path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
star:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
bike:'<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-7h5l3 7M10 9l3 7M14 6h2"/>',
sofa:'<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M3 11h18v6H3zM5 17v2M19 17v2"/>',
card:'<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/>',
refresh:'<path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4"/>',
tree:'<path d="M12 21v-5M7 16h10l-3-4h2l-4-5-4 5h2z"/>',party:'<path d="M4 20l5-14 9 9z"/><path d="M14 4v2M18 6l-1.5 1.5M20 10h-2"/>',
heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
filter:'<path d="M4 6h16M7 12h10M10 18h4"/>',
dotf:'<circle cx="12" cy="12" r="9.5" fill="currentColor" stroke="none"/>',
mailf:'<rect x="2.5" y="5" width="19" height="14" rx="2" fill="currentColor" stroke="none"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5" stroke="var(--surface)" stroke-width="1.6"/>',
userf:'<circle cx="12" cy="7.5" r="4.5" fill="currentColor" stroke="none"/><path d="M3.5 21c0-4.5 3.8-7.5 8.5-7.5s8.5 3 8.5 7.5z" fill="currentColor" stroke="none"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
pen:'<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
listic:'<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/>',chev:'<path d="m9 18 6-6-6-6"/>',
mail:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
bookmark:'<path d="M6 3h12v18l-6-4.5L6 21z"/>',
phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
};
const I=(n,s=20,w=1.8)=>`<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]||''}</svg>`;

/* ===== Компоненты (в коде приложения это отдельные компоненты: Button, Chip, Card…) ===== */
const AV=(t,c='pe',s=36)=>`<span class="av ${c}" style="--s:${s}px">${t}</span>`;
const BD=(t,c='')=>`<span class="badge ${c}">${t}</span>`;
const TL=(ic,c='m',s=38)=>`<span class="tile ${c}" style="width:${s}px;height:${s}px">${I(ic,Math.round(s*.5))}</span>`;
const PR=(p,mk,cls='')=>`<div class="prog ${cls}"><i style="width:${p}%"></i>${mk?`<b style="left:${mk}%"></b>`:''}</div>`;
const RW=(a,b,cls='')=>`<div class="row ${cls}"><span>${a}</span><span>${b}</span></div>`;
const PS=n=>`<span class="plsm">${n}</span>`;
const LB=(t,c='')=>`<div class="lbl ${c}">${t}</div>`;
const ST=(n,t,on)=>`<div class="stp${on?' on':''}"><b>${n}</b><span>${t}</span></div>`;
const STAT=(b,s,c='')=>`<div class="stat ${c}"><b>${b}</b><span>${s}</span></div>`;
const PHW=(w,...a)=>PH(...a).replace('style="height:',`style="width:${w}px;flex:none;height:`);
const PH=(ic,h,c='',cap='',tag='')=>`<div class="ph ${c}" style="height:${h}px">${I(ic,30,1.5)}${cap?`<span class="cap">${cap}</span>`:''}${tag?`<span class="tag">${tag}</span>`:''}</div>`;
const TS=(st,t,sub='',x='')=>`<div class="st ${st}"><span class="dot">${st==='done'?I('check',12,3):''}</span><div><div class="b s">${t}</div>${sub?`<div class="xs mut">${sub}</div>`:''}${x}</div></div>`;
/* Логотип Соседей: оранжевая «с», зелёная «о», две точки */
const LOGO=(s=28)=>`<svg class="logo" width="${s}" height="${s}" viewBox="0 0 32 32" aria-label="Соседи"><circle cx="9" cy="6" r="3.6" fill="var(--accent)"/><circle cx="21" cy="6" r="3.6" fill="var(--primary)"/><path d="M15.5 15.6a6.6 6.6 0 1 0 0 9.8" fill="none" stroke="var(--accent)" stroke-width="4.4" stroke-linecap="round"/><circle cx="22.6" cy="20.5" r="5.3" fill="none" stroke="var(--primary)" stroke-width="4.4"/></svg>`;
/* Большой заголовок корневых экранов, как «Новое объявление» и «Чаты» в старом дизайне */
const LTH=(eb,t,r='',m)=>`<div class="lth"><div class="flex between top-a"><div class="hd"><div class="lt${m?' m':''}">${t}</div><div class="eb">${eb}</div></div>${r}</div></div>`;


