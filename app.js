'use strict';
const KEY='carnet-v1',pad=n=>String(n).padStart(2,'0');
const dstr=d=>{d=d||new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
const hhmm=d=>{d=d||new Date();return pad(d.getHours())+':'+pad(d.getMinutes())};
const dd=(a,b)=>Math.round((new Date(a+'T00:00')-new Date(b+'T00:00'))/864e5);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>document.querySelector(s);
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const rng=seed=>{let x=seed||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;x>>>=0;return x/4294967296}};
/* ---------- état ---------- */
const fresh=()=>({v:1,name:'Josepha',wake:'09:00',bday:'',first:dstr(),en:{},plan:{},done:{},pause:{},last:{},total:0,st:[],got:{},mir:{},sleep:[],bed:null,wk:{},food:{},my:{act:[],s:[],l:[]}});
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));if(x&&x.v===1)return Object.assign(fresh(),x)}catch(e){}return fresh()}
let S=load();const ui={tab:'act',modal:null,cat:'s',pick:null,sel:'',msg:'',wk:0,gest:0};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
/* ---------- actions & plan ---------- */
const allActs=()=>ACTIONS.concat(S.my.act.map(a=>({id:'u'+a.id,n:a.n,cat:a.cat,e:a.e,f:a.cat==='bienetre'?2:3})));
const actOf=id=>allActs().find(a=>a.id===id);
const counted=a=>a.cat!=='loisir';
const due=(a,day)=>S.last[a.id]?dd(day,S.last[a.id])/a.f:2.5;
function makePlan(day,en,keep){
 const r=rng(hash(day+en+S.total)),max=[2,3,4][en],bud=[3,5,8][en],maxE=[2,3,3][en],plan=[...keep];
 let cost=keep.reduce((t,id)=>t+(actOf(id)?actOf(id).e:0),0);
 const cand=allActs().filter(a=>counted(a)&&!keep.includes(a.id)&&a.e<=maxE).map(a=>({a,s:due(a,day)*(.6+.8*r())})).sort((x,y)=>y.s-x.s);
 const hasBe=()=>plan.some(id=>actOf(id)&&actOf(id).cat==='bienetre');
 if(!hasBe()&&plan.length<max){const be=cand.find(x=>x.a.cat==='bienetre');if(be){plan.push(be.a.id);cost+=be.a.e}}
 for(const x of cand){if(plan.length>=max)break;if(plan.includes(x.a.id)||(x.a.cat==='bienetre'&&hasBe()))continue;if(cost+x.a.e<=bud||plan.length<2){plan.push(x.a.id);cost+=x.a.e}}
 return plan}
function setEnergy(en){const day=dstr();S.en[day]=en;S.plan[day]=makePlan(day,en,(S.done[day]||[]).filter(id=>actOf(id)&&counted(actOf(id))))}
function swapAct(id){const day=dstr(),p=S.plan[day],en=S.en[day];const pool=allActs().filter(a=>counted(a)&&!p.includes(a.id)&&a.e<=[2,3,3][en]&&(a.cat==='bienetre')===(actOf(id).cat==='bienetre'));if(!pool.length)return;const w=pool.map(a=>({a,s:due(a,day)*(.6+.8*Math.random())})).sort((x,y)=>y.s-x.s)[0].a;p[p.indexOf(id)]=w.id}
const pausesFor=day=>{const r=rng(hash('p'+day));return allActs().filter(a=>a.cat==='loisir').map(a=>({a,s:r()})).sort((x,y)=>x.s-y.s).slice(0,2).map(x=>x.a)};
function tick(id){const day=dstr(),d=S.done[day]=S.done[day]||[],i=d.indexOf(id);
 if(i>=0){if(S.total-1<S.st.length*5)return;d.splice(i,1);S.total--;return}
 d.push(id);S.last[id]=day;S.total++;
 if(S.total>=(S.st.length+1)*5){S.st.push(drawSticker());ui.modal={t:'new',i:S.st.length-1}}}
/* ---------- licornes ---------- */
function easter(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;return new Date(y,mo-1,da)}
function evDate(rule,y){if(rule.md)return new Date(y,rule.md[0]-1,rule.md[1]);if('easter' in rule){const d=easter(y);d.setDate(d.getDate()+rule.easter);return d}if(rule.bday&&S.bday){const p=S.bday.split('-').map(Number);return new Date(y,p[1]-1,p[2])}return null}
function pendingSet(){const n=new Date(),t0=new Date(n.getFullYear(),n.getMonth(),n.getDate());
 for(const [name,rule] of Object.entries(SET_RULES))for(const y of [n.getFullYear()-1,n.getFullYear(),n.getFullYear()+1]){const d=evDate(rule,y);if(d&&Math.abs(Math.round((t0-d)/864e5))<=5&&!S.got[name+y])return{name,y}}
 return null}
function drawCombo(){
 for(let k=0;k<120;k++){
  let ti=null;
  if(Math.random()<.8){const w=TIERS.map(t=>POOL.h[t].length);let x=Math.random()*w.reduce((a,b)=>a+b),t=0;while(x>=w[t]){x-=w[t];t++}ti=t}
  const p=['h','m','o'].map(s=>{
   if(ti!==null){const a=POOL[s][TIERS[ti]];return pieceKey(s,TIERS[ti],a[Math.floor(Math.random()*a.length)])}
   const all=[].concat(...TIERS.map(t=>POOL[s][t].map(x=>[t,x])));const z=all[Math.floor(Math.random()*all.length)];return pieceKey(s,z[0],z[1])});
  const key=p.join('|');if(!S.st.some(x=>x.key===key))return{key,p}}
 const p=['h','m','o'].map(s=>pieceKey(s,'c',POOL[s].c[Math.floor(Math.random()*POOL[s].c.length)]));return{key:p.join('|')+Date.now(),p}}
function drawSticker(){
 const at=dstr(),ms=MILESTONES[S.st.length+1];
 if(ms&&!S.st.some(x=>x.set===ms))return{set:ms,key:'set:'+ms,at};
 const ps=pendingSet();
 if(ps){S.got[ps.name+ps.y]=1;if(!S.st.some(x=>x.set===ps.name))return{set:ps.name,key:'set:'+ps.name,at};const c=drawCombo();c.v=ps.name;c.at=at;return c}
 const c=drawCombo();c.at=at;return c}
function spec(st,fx){const s=specOfSticker(st,fx);if(st.v){const e=ALLSETS.find(x=>x[0]===st.v);if(e){s.a=e[2].a;s.x=e[2].x}}return s}
const stkSvg=(st,fx)=>uni(spec(st,fx));
const TN=['Commune','Rare','Épique'];
/* ---------- sommeil ---------- */
const mirState=(m,now)=>{const h=m.split(':').map(Number),s=new Date(now.getFullYear(),now.getMonth(),now.getDate(),h[0],h[1]),e=new Date(s.getTime()+36e5);if((S.mir[dstr(now)]||[]).includes(m))return'ok';return now<s?'nx':now<e?'open':'ms'};
function mirScore(){const now=new Date(),n=Math.max(1,Math.min(7,dd(dstr(now),S.first)+1));let t=0;for(let i=0;i<n;i++){const d=new Date(now);d.setDate(d.getDate()-i);t+=(S.mir[dstr(d)]||[]).length}return Math.round(t/(12*n)*100)}
const fmtDur=m=>Math.floor(m/60)+' h '+pad(Math.round(m%60));
function recordWake(){const now=new Date();let b=null;if(S.bed){const bd=new Date(S.bed);if(bd<now&&now-bd<20*36e5)b=S.bed}S.bed=null;S.sleep.unshift({w:now.toISOString(),b});S.sleep=S.sleep.slice(0,30);S.wk[dstr(now)]=hhmm(now)}
function ics(){const n=new Date(),base=n.getFullYear()+pad(n.getMonth()+1)+pad(n.getDate()),L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Carnet//FR','CALSCALE:GREGORIAN'];
 MIRRORS.forEach(m=>L.push('BEGIN:VEVENT','UID:miroir-'+m.replace(':','')+'@carnet','DTSTAMP:'+base+'T000000','DTSTART:'+base+'T'+m.replace(':','')+'00','DURATION:PT10M','RRULE:FREQ=DAILY','SUMMARY:Heure miroir : es-tu éveillée ?','BEGIN:VALARM','TRIGGER:PT0S','ACTION:DISPLAY','DESCRIPTION:Heure miroir','END:VALARM','END:VEVENT'));
 L.push('END:VCALENDAR');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([L.join('\r\n')],{type:'text/calendar'}));a.download='heures-miroir.ics';document.body.appendChild(a);a.click();a.remove()}
/* ---------- alimentation ---------- */
function streak(){let n=0;for(let o=S.food[dstr()]?0:1;;o++){const d=new Date();d.setDate(d.getDate()-o);if(S.food[dstr(d)])n++;else break}return n}
/* ---------- rendu ---------- */
const CHK='<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const ICO={act:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M7.5 12.5l3 3 6-6.5"/></svg>',slp:'<svg viewBox="0 0 24 24"><path d="M20 14.5A8.2 8.2 0 0 1 9.5 4 8.2 8.2 0 1 0 20 14.5z"/></svg>',food:'<svg viewBox="0 0 24 24"><path d="M3.5 11h17a8.5 8.5 0 0 1-17 0z"/><path d="M8 7c0-1.6 1.2-1.6 1.2-3.2M12.5 7c0-1.6 1.2-1.6 1.2-3.2"/></svg>',col:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 15l2.5-3 2 2 3-4"/></svg>',gear:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/></svg>'};
const NAMES={act:'Activité',slp:'Sommeil',food:'Alimentation'};
const effort=e=>['','tout petit','moyen','costaud'][e];
const lenDate=()=>new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
const li=a=>`<div class="it ${(S.done[dstr()]||[]).includes(a.id)?'dn':''}"><button class="ck" data-a="tk" data-v="${a.id}" aria-label="Marquer comme fait : ${esc(a.n)}">${CHK}</button><div class="nm"><span class="tt">${esc(a.n)}</span><small>${effort(a.e)}</small></div>${(S.done[dstr()]||[]).includes(a.id)?'':`<button class="sm" data-a="sw" data-v="${a.id}">autre idée</button>`}</div>`;
function head(t){return `<div class="top"><div><p class="hand">${esc(lenDate())}</p><h1>${t}</h1></div><div class="icons"><button class="ib" data-a="col" aria-label="Ma collection">${ICO.col}${S.st.length?`<b>${S.st.length}</b>`:''}</button><button class="ib" data-a="cfg" aria-label="Réglages">${ICO.gear}</button></div></div>`}
function actTab(){
 const day=dstr(),en=S.en[day],prog=S.total-S.st.length*5,left=5-prog;
 let h=head('Aujourd’hui, <em>doucement</em> mais sûrement')+`<p class="hand" style="margin-top:2px">Salut ${esc(S.name)} !</p>`;
 h+=`<div class="card"><div class="st">Mon énergie ce matin</div><div class="seg">${['À plat','Moyenne','En forme'].map((x,i)=>`<button data-a="en" data-v="${i}" class="${en===i?'on':''}">${x}</button>`).join('')}</div></div>`;
 if(en===undefined)h+=`<p class="mu2" style="margin:14px 4px">Choisis comment tu te sens : je te propose 2 à 4 petites choses adaptées.</p>`;
 else{const pl=(S.plan[day]||[]).map(actOf).filter(Boolean);h+=`<div class="card"><div class="st">Mes ${pl.length} petites choses</div>${pl.map(li).join('')}</div>`;
  const ps=pausesFor(day),pd=S.pause[day]||[];h+=`<div class="card"><div class="st">Pour souffler</div>${ps.map(a=>`<div class="it ${pd.includes(a.id)?'dn':''}"><button class="ck" data-a="pz" data-v="${a.id}" aria-label="${esc(a.n)}">${CHK}</button><div class="nm"><span class="tt">${esc(a.n)}</span><small>juste pour le plaisir</small></div></div>`).join('')}</div>`}
 h+=`<div class="card"><div class="st">Ma prochaine licorne</div><div class="pg" role="progressbar" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${prog}"><i style="width:${prog*20}%"></i></div><p class="mu2" style="margin-top:8px">${prog===0&&S.st.length?'Une nouvelle série commence.':'Plus que '+left+' action'+(left>1?'s':'')+' avant ta prochaine licorne.'}</p></div>`;
 h+=`<div class="card"><div class="st">Ma collection</div>${S.st.length?`<div class="stks">${S.st.slice(-4).reverse().map((st,i)=>`<button class="stk t${tierOfSticker(st)}" data-a="stk" data-v="${S.st.length-1-i}" aria-label="Voir cette licorne">${stkSvg(st)}</button>`).join('')}</div><button class="bt w" style="margin-top:12px" data-a="col">Voir toute ma collection (${S.st.length})</button>`:`<p class="mu2">Ta première licorne arrive après 5 actions.</p>`}</div>`;
 return h}
function slpTab(){
 const now=new Date(),day=dstr(now),states=MIRRORS.map(m=>[m,mirState(m,now)]),open=states.find(x=>x[1]==='open'),nx=states.find(x=>x[1]==='nx'),sel=ui.sel||(open?open[0]:nx?nx[0]:MIRRORS[0]);
 const [wh,wm]=S.wake.split(':').map(Number);
 let h=head('Sommeil, <em>en douceur</em>');
 h+=`<div class="card"><div class="st">Mon réveil</div><div class="row"><div><span class="big">${esc(S.wake.replace(':','h'))}</span><p class="mu2">${S.wk[day]?'Levée à '+S.wk[day].replace(':','h')+' aujourd’hui, bravo !':'Il sonne sur ton téléphone.'}</p></div><button class="bt pri" data-a="wk">Je me lève</button></div>
<a class="bt w" style="display:block;text-align:center;text-decoration:none;margin-top:12px" href="intent:#Intent;action=android.intent.action.SET_ALARM;i.android.intent.extra.alarm.HOUR=${wh};i.android.intent.extra.alarm.MINUTES=${wm};end">Régler l’alarme du téléphone</a><p class="mu2" style="margin-top:6px">Si rien ne s’ouvre, règle-la dans l’appli Horloge.</p></div>`;
 h+=`<div class="card"><div class="st">Mon coucher</div><div class="row"><p class="mu2">${S.bed?'Couchée à '+hhmm(new Date(S.bed)).replace(':','h')+'. Bonne nuit !':'Appuie quand tu te couches : ça mesure ta nuit.'}</p><button class="bt" data-a="bed">${S.bed?'Annuler':'Je me couche'}</button></div></div>`;
 h+=`<div class="card"><div class="st">Heures miroir</div><div class="row"><div><span class="big">${mirScore()} %</span><p class="mu2">score sur 7 jours</p></div><div style="text-align:right"><span class="big">${(S.mir[day]||[]).length}/12</span><p class="mu2">aujourd’hui</p></div></div>
<div class="chips">${states.map(([m,s])=>`<div class="chip ${s==='ok'?'ok':s==='open'?'nx':s==='ms'?'ms':''}">${m.replace(':','h')}</div>`).join('')}</div>
<div class="fld"><select id="mirsel" data-f="sel" aria-label="Heure miroir à valider">${MIRRORS.map(m=>`<option value="${m}" ${m===sel?'selected':''}>${m}</option>`).join('')}</select><button class="bt pri" data-a="mir">Je suis éveillée</button></div>
<p class="mu2" style="margin-top:8px">Choisis l’heure puis valide : tu as 1 h après chaque heure miroir.</p>${ui.msg?`<p class="msg" role="status">${esc(ui.msg)}</p>`:''}
<button class="bt w" style="margin-top:10px" data-a="ics">Ajouter les rappels au calendrier</button></div>`;
 const nights=S.sleep.slice(0,5);
 h+=`<div class="card"><div class="st">Mes dernières nuits</div>${nights.length?nights.map(n=>{const w=new Date(n.w),m=n.b?(w-new Date(n.b))/6e4:null;return `<div class="night"><span>${w.toLocaleDateString('fr-FR',{weekday:'short'})}</span><div class="pg"><i style="width:${m?Math.min(100,m/720*100):0}%"></i></div><b>${m?fmtDur(m):'levée '+hhmm(w).replace(':','h')}</b></div>`}).join(''):'<p class="mu2">Pas encore de nuit enregistrée.</p>'}
<details style="margin-top:10px"><summary class="mu2">Ajouter une nuit à la main</summary><div class="fld"><input id="nb" type="time" value="23:30" aria-label="Coucher"><input id="nw" type="time" value="09:00" aria-label="Lever"><button class="bt" data-a="night">Ajouter</button></div></details></div>`;
 return h}
function foodTab(){
 const day=dstr(),f=S.food[day],list=MEALS[ui.cat].concat(S.my[ui.cat]);
 const wk=[6,5,4,3,2,1,0].map(o=>{const d=new Date();d.setDate(d.getDate()-o);const v=S.food[dstr(d)];return `<div class="${v==='full'?'f':v?'l':''}">${d.toLocaleDateString('fr-FR',{weekday:'narrow'}).toUpperCase()}<b>${v==='full'?'✦':v?'•':'·'}</b></div>`}).join('');
 return head('Manger, <em>sans pression</em>')+`<p class="hand">${streak()} jour${streak()>1?'s':''} d’affilée</p>
<div class="card"><div class="st">Ma semaine</div><div class="wkd">${wk}</div><p class="mu2" style="margin-top:8px">✦ = un repas un peu plus complet</p></div>
<div class="card"><div class="st">Tu as mangé aujourd’hui ?</div><div class="seg">${[['full','Repas complet'],['light','Petit repas'],['','Pas encore']].map(x=>`<button data-a="fd" data-v="${x[0]}" class="${x[0]?(f===x[0]?'on':''):(!f&&S.fdDay===day?'on':'')}">${x[1]}</button>`).join('')}</div></div>
<div class="card"><div class="st">Idées pour maintenant</div><div class="seg" style="grid-template-columns:1fr 1fr;margin-bottom:10px"><button data-a="ct" data-v="s" class="${ui.cat==='s'?'on':''}">Sans cuisine</button><button data-a="ct" data-v="l" class="${ui.cat==='l'?'on':''}">Peu de cuisine</button></div>
<div class="mel">${list.map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div><button class="bt w" style="margin-top:10px" data-a="rd">Pioche-moi une idée</button>${ui.pick?`<div class="pick">${esc(ui.pick)}</div>`:''}
<div class="fld"><input id="nm" placeholder="Ma recette dans cette catégorie" aria-label="Ma recette"><button class="bt" data-a="addm">Ajouter</button></div></div>`}
const tierBadge=t=>`<span class="badge t${t}">${TN[t]}</span>`;
function overlay(){const m=ui.modal;if(!m)return'';
 const close='<button class="ib xx" data-a="x" aria-label="Fermer"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
 if(m.t==='new'){const st=S.st[m.i],t=tierOfSticker(st);return `<div class="ov c"><div class="sheet mid" role="dialog" aria-label="Nouvelle licorne"><p class="hand">Bravo !</p><h2>Une nouvelle licorne</h2><div class="bigu">${stkSvg(st,true)}</div><p style="text-align:center;font-weight:800">${esc(nameOfSticker(st))}</p><p style="text-align:center;margin-top:4px">${tierBadge(t)}</p><div class="fld"><button class="bt w" data-a="x">Continuer</button><button class="bt w pri" data-a="col">Ma collection</button></div></div></div>`}
 if(m.t==='stk'){const st=S.st[m.i],t=tierOfSticker(st);return `<div class="ov c"><div class="sheet mid" role="dialog" aria-label="Licorne">${close}<p class="hand">licorne n° ${m.i+1}</p><div class="bigu">${stkSvg(st,true)}</div><p style="text-align:center;font-weight:800">${esc(nameOfSticker(st))}</p><p style="text-align:center;margin-top:4px">${tierBadge(t)} <span class="mu2">obtenue le ${new Date(st.at+'T00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</span></p></div></div>`}
 if(m.t==='col')return `<div class="ov"><div class="sheet" role="dialog" aria-label="Ma collection">${close}<h2>Ma collection</h2><p class="mu2" style="margin:4px 0 12px">${S.st.length} licorne${S.st.length>1?'s':''}</p>${S.st.length?`<div class="stks big">${S.st.map((st,i)=>`<button class="stk t${tierOfSticker(st)}" data-a="stk" data-v="${i}" aria-label="Licorne ${i+1}">${stkSvg(st)}</button>`).reverse().join('')}</div>`:'<p class="mu2">Rien pour l’instant : 5 actions et la première arrive.</p>'}</div></div>`;
 if(m.t==='wake'){return `<div class="ov c"><div class="sheet mid" role="dialog" aria-label="Je me lève">${close}<h2>${ui.wk<5?'Debout !':'Bien joué'}</h2>${ui.wk<5?`<p class="mu2" style="margin:6px 0 14px">Appuie 5 fois pour te lever pour de vrai : ${ui.wk} / 5</p><button class="bt pri tap" data-a="wkt">Je me lève</button>`:`<p style="margin:8px 0 14px;font-weight:800">Premier geste : ${esc(GESTES[ui.gest])}</p><button class="bt pri tap" data-a="wkd">C’est fait</button>`}</div></div>`}
 if(m.t==='cfg'){return `<div class="ov"><div class="sheet" role="dialog" aria-label="Réglages">${close}<h2>Réglages</h2>
<label class="l" for="f1">Prénom</label><input class="inp" id="f1" data-f="name" value="${esc(S.name)}"><label class="l" for="f2">Heure de réveil</label><input class="inp" id="f2" type="time" data-f="wake" value="${S.wake}"><label class="l" for="f3">Date d’anniversaire</label><input class="inp" id="f3" type="date" data-f="bday" value="${S.bday}">
<h2 style="margin-top:18px">Mes actions</h2><div class="fld"><input id="an" placeholder="Nouvelle action" aria-label="Nouvelle action"><select id="ac" aria-label="Type"><option value="perso">Essentielle</option><option value="bienetre">Bien-être</option><option value="loisir">Loisir</option></select></div><div class="fld"><select id="ae" aria-label="Effort"><option value="1">Tout petit</option><option value="2">Moyen</option><option value="3">Costaud</option></select><button class="bt pri" data-a="adda">Ajouter</button></div>
${S.my.act.map(a=>`<div class="it"><div class="nm">${esc(a.n)}<small>${a.cat==='perso'?'essentielle':a.cat} · ${effort(a.e)}</small></div><button class="sm" data-a="dela" data-v="${a.id}">supprimer</button></div>`).join('')}
<button class="bt w" style="margin-top:20px" data-a="reset">Tout effacer</button></div></div>`}
 return''}
function render(keep){const y=window.scrollY;
 $('#app').innerHTML=(ui.tab==='act'?actTab():ui.tab==='slp'?slpTab():foodTab())+`<nav class="nav">${['act','slp','food'].map(k=>`<button data-a="tab" data-v="${k}" class="${ui.tab===k?'on':''}" aria-label="${NAMES[k]}">${ICO[k]}<span>${NAMES[k]}</span></button>`).join('')}</nav>`;
 $('#ov').innerHTML=overlay();save();if(keep)window.scrollTo(0,y)}
/* ---------- événements ---------- */
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,v=b.dataset.v;let keep=true;
 switch(a){
 case'tab':ui.tab=v;ui.msg='';keep=false;window.scrollTo(0,0);break;
 case'en':setEnergy(+v);break;
 case'tk':tick(v);break;
 case'sw':swapAct(v);break;
 case'pz':{const d=S.pause[dstr()]=S.pause[dstr()]||[],i=d.indexOf(v);i<0?d.push(v):d.splice(i,1);break}
 case'col':ui.modal={t:'col'};break;
 case'stk':ui.modal={t:'stk',i:+v};break;
 case'cfg':ui.modal={t:'cfg'};break;
 case'x':ui.modal=null;break;
 case'wk':ui.wk=0;ui.gest=Math.floor(Math.random()*GESTES.length);ui.modal={t:'wake'};break;
 case'wkt':ui.wk++;break;
 case'wkd':recordWake();ui.modal=null;break;
 case'bed':S.bed=S.bed?null:new Date().toISOString();break;
 case'mir':{const sel=($('#mirsel')||{}).value||ui.sel,st=mirState(sel,new Date());
  if(st==='open'){(S.mir[dstr()]=S.mir[dstr()]||[]).push(sel);ui.msg='Validé à '+sel.replace(':','h')+', merci d’être là !'}
  else if(st==='ok')ui.msg='Celle-là est déjà validée.';else ui.msg=st==='nx'?'Cette heure n’est pas encore arrivée.':'Trop tard pour celle-là : tu avais 1 h.';break}
 case'ics':ics();break;
 case'night':{const nb=$('#nb').value,nw=$('#nw').value;if(!nb||!nw)break;const n=new Date(),w=new Date(n.getFullYear(),n.getMonth(),n.getDate(),...nw.split(':').map(Number)),bd=new Date(w.getFullYear(),w.getMonth(),w.getDate(),...nb.split(':').map(Number));if(bd>=w)bd.setDate(bd.getDate()-1);S.sleep.unshift({w:w.toISOString(),b:bd.toISOString()});S.sleep.sort((x,y)=>new Date(y.w)-new Date(x.w));break}
 case'fd':if(v)S.food[dstr()]=v;else{delete S.food[dstr()];S.fdDay=dstr()}break;
 case'ct':ui.cat=v;ui.pick=null;break;
 case'rd':{const l=MEALS[ui.cat].concat(S.my[ui.cat]);ui.pick=l[Math.floor(Math.random()*l.length)];break}
 case'addm':{const t=($('#nm').value||'').trim();if(t)S.my[ui.cat].push(t);break}
 case'adda':{const n=($('#an').value||'').trim();if(!n)break;S.my.act.push({id:Date.now(),n,cat:$('#ac').value,e:+$('#ae').value});break}
 case'dela':S.my.act=S.my.act.filter(x=>String(x.id)!==v);break;
 case'reset':if(confirm('Tout effacer : actions, licornes, sommeil, repas ?')){S=fresh();ui.modal=null}break}
 render(keep)});
document.addEventListener('change',e=>{const f=e.target.dataset.f;if(!f)return;if(f==='sel'){ui.sel=e.target.value;return}if(f==='name')S.name=e.target.value.trim()||'Josepha';else if(f==='wake'&&e.target.value)S.wake=e.target.value;else if(f==='bday')S.bday=e.target.value;save()});
render();
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
