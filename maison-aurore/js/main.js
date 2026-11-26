/* Maison Aurore: page behaviour. Plain script, no modules, works from file:// */
(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var fine=window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches;
var isMobile=function(){return window.innerWidth<981};
var inr=new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0});
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};

/* ---------- optional real photos: put files in /images and list them here ----------
   Example: MAISON_PHOTOS = {aurora:'images/aurora.jpg'}  (keys are product ids below) */
var MAISON_PHOTOS={aurora:'images/aurora.jpg',celeste:'images/celeste.jpg',riviere:'images/riviere.jpg',lune:'images/lune.jpg',perle:'images/perle.jpg',etoile:'images/etoile.jpg',ligne:'images/ligne.jpg',ruban:'images/ruban.jpg'};

/* ---------- products ---------- */
var PRODUCTS=[
 {id:'aurora',n:'Aurore Solitaire',c:'Rings',p:485000,t:'Bestseller',d:'A one-carat round diamond in a six-claw 18K setting.',a:'ring',g:'#cfe6ff',m:'#e2bb5e'},
 {id:'celeste',n:'Céleste Halo',c:'Rings',p:612000,t:'New',d:'A sapphire ringed by a halo of pavé diamonds.',a:'ring',g:'#4a74ff',m:'#cfd4dc'},
 {id:'riviere',n:'Rivière Necklace',c:'Necklaces',p:1250000,t:'Signature',d:'Forty graduated diamonds on a flexible gold chain.',a:'riviere',g:'#dff0ff',m:'#e2bb5e'},
 {id:'lune',n:'Lune Pendant',c:'Necklaces',p:238000,t:'',d:'A single ruby drop on a fine rose gold chain.',a:'pendant',g:'#e0244e',m:'#e8a48e'},
 {id:'perle',n:'Perle Drops',c:'Earrings',p:176000,t:'',d:'Freshwater pearls hanging from gold-set diamonds.',a:'pearl',g:'#f6efe2',m:'#e2bb5e'},
 {id:'etoile',n:'Étoile Studs',c:'Earrings',p:324000,t:'Limited',d:'Emerald-cut emeralds in a hand-finished gold frame.',a:'drop',g:'#18b073',m:'#e2bb5e'},
 {id:'ligne',n:'Ligne Tennis Bracelet',c:'Bracelets',p:890000,t:'',d:'A continuous line of round brilliants, 4 carats in all.',a:'tennis',g:'#dff0ff',m:'#cfd4dc'},
 {id:'ruban',n:'Ruban Bangle',c:'Bracelets',p:268000,t:'New',d:'A sculpted 18K bangle with a single set diamond.',a:'bangle',g:'#cfe6ff',m:'#e8a48e'}
];

function gemSvg(cx,cy,r,col,uid){
  var gid='gg'+uid+Math.round(cx*7+cy);
  return '<defs><linearGradient id="'+gid+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="'+col+'"/><stop offset="1" stop-color="'+col+'" stop-opacity=".55"/></linearGradient></defs>'+
  '<polygon points="'+[cx-r*.62,cy-r*.5,cx+r*.62,cy-r*.5,cx+r,cy-r*.1,cx,cy+r,cx-r,cy-r*.1].join(' ')+'" fill="url(#'+gid+')" stroke="rgba(255,255,255,.7)" stroke-width="1"/>'+
  '<path d="M'+(cx-r)+','+(cy-r*.1)+'L'+(cx+r)+','+(cy-r*.1)+'M'+(cx-r*.62)+','+(cy-r*.5)+'L'+(cx-r*.3)+','+(cy-r*.1)+'L'+cx+','+(cy+r)+'M'+(cx+r*.62)+','+(cy-r*.5)+'L'+(cx+r*.3)+','+(cy-r*.1)+'L'+cx+','+(cy+r)+'M'+cx+','+(cy-r*.5)+'L'+(cx-r*.3)+','+(cy-r*.1)+'M'+cx+','+(cy-r*.5)+'L'+(cx+r*.3)+','+(cy-r*.1)+'" stroke="rgba(255,255,255,.55)" stroke-width=".8" fill="none"/>';
}
function metalGrad(id,m){return '<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".35" stop-color="'+m+'"/><stop offset="1" stop-color="'+m+'" stop-opacity=".5"/></linearGradient></defs>';}
function art(p){
  var u=p.id,m=p.m,g=p.g,s='<svg viewBox="0 0 200 200" aria-hidden="true">'+metalGrad('mg'+u,m),mg='url(#mg'+u+')',i;
  switch(p.a){
    case 'ring':
      s+='<ellipse cx="100" cy="134" rx="46" ry="46" fill="none" stroke="'+mg+'" stroke-width="9"/>'+
         '<path d="M84 98l16 -10 16 10-6 10h-20z" fill="'+mg+'"/>'+gemSvg(100,76,22,g,u);break;
    case 'riviere':
      s+='<path d="M26 50C34 150 166 150 174 50" fill="none" stroke="'+mg+'" stroke-width="1.6"/>';
      for(i=0;i<9;i++){var t=i/8,x=26+148*t,y=50+ (1-Math.pow(2*t-1,2))*76;s+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(4+ (1-Math.abs(2*t-1))*4).toFixed(1)+'" fill="'+g+'" stroke="'+m+'" stroke-width="1.4"/>';}
      break;
    case 'pendant':
      s+='<path d="M30 40C50 110 150 110 170 40" fill="none" stroke="'+mg+'" stroke-width="1.4"/><path d="M100 98v14" stroke="'+m+'" stroke-width="1.4"/>'+gemSvg(100,134,22,g,u);break;
    case 'pearl':
      for(i=0;i<2;i++){var x=66+i*68;s+='<circle cx="'+x+'" cy="44" r="6" fill="'+mg+'"/><path d="M'+x+' 50v34" stroke="'+m+'" stroke-width="1.4"/><circle cx="'+x+'" cy="112" r="26" fill="'+g+'"/><circle cx="'+(x-8)+'" cy="103" r="8" fill="#fff" opacity=".7"/>';}
      break;
    case 'drop':
      for(i=0;i<2;i++){var x2=64+i*72;s+='<rect x="'+(x2-26)+'" y="70" width="52" height="64" rx="6" fill="none" stroke="'+mg+'" stroke-width="5"/><rect x="'+(x2-18)+'" y="78" width="36" height="48" rx="3" fill="'+g+'" opacity=".92"/><path d="M'+(x2-18)+' 78l36 48M'+(x2+18)+' 78l-36 48" stroke="rgba(255,255,255,.4)"/>';}
      break;
    case 'tennis':
      s+='<ellipse cx="100" cy="100" rx="70" ry="44" fill="none" stroke="'+mg+'" stroke-width="12"/>';
      for(i=0;i<16;i++){var a=i/16*Math.PI*2;s+='<circle cx="'+(100+70*Math.cos(a)).toFixed(1)+'" cy="'+(100+44*Math.sin(a)).toFixed(1)+'" r="4.6" fill="'+g+'" stroke="#fff" stroke-opacity=".6" stroke-width=".6"/>';}
      break;
    default:
      s+='<ellipse cx="100" cy="104" rx="66" ry="52" fill="none" stroke="'+mg+'" stroke-width="14"/><ellipse cx="100" cy="104" rx="66" ry="52" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" transform="translate(0 -4)"/>'+gemSvg(100,52,12,g,u);
  }
  return s+'</svg>';
}

/* ---------- toast ---------- */
var toastEl=$('#toast'),toastT;
function toast(msg){toastEl.textContent=msg;toastEl.classList.add('show');clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('show')},2600)}

/* ---------- wishlist / bag ---------- */
var wish={},bag=0;
function setBadge(el,n){el.textContent=n;el.classList.toggle('show',n>0);el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump')}
function wishCount(){return Object.keys(wish).length}

/* ---------- grid ---------- */
var grid=$('#grid');
function cardHtml(p){
  var media=MAISON_PHOTOS[p.id]?'<img src="'+MAISON_PHOTOS[p.id]+'" alt="'+p.n+'" loading="lazy">':art(p);
  return '<article class="card reveal" data-c="'+p.c+'" data-id="'+p.id+'">'+
    '<div class="tilt" data-cursor><div class="tilt-face"></div>'+(p.t?'<span class="tag">'+p.t+'</span>':'')+
    '<button class="heart" type="button" aria-pressed="false" aria-label="Save '+p.n+' to wishlist"><svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.8a4.3 4.3 0 0 1 7.5 2.7c0 5.4-7.5 10-7.5 10z"/></svg></button>'+
    '<div class="media'+(MAISON_PHOTOS[p.id]?' photo':'')+'">'+media+'</div></div>'+
    '<div class="info"><h3>'+p.n+'</h3><span class="price">'+inr.format(p.p)+'</span><p class="desc">'+p.d+'</p>'+
    '<button class="add" type="button" data-cursor>Add to bag</button></div></article>';
}
grid.innerHTML=PRODUCTS.map(cardHtml).join('');

grid.addEventListener('click',function(e){
  var h=e.target.closest('.heart'),a=e.target.closest('.add');
  if(h){
    var id=h.closest('.card').dataset.id,on=h.getAttribute('aria-pressed')!=='true';
    h.setAttribute('aria-pressed',on);
    if(on)wish[id]=1;else delete wish[id];
    h.classList.remove('pop');void h.offsetWidth;h.classList.add('pop');
    setBadge($('#wishCount'),wishCount());
    toast(on?'Saved to your wishlist':'Removed from your wishlist');
  }else if(a){
    bag++;setBadge($('#bagCount'),bag);
    toast(a.closest('.card').querySelector('h3').textContent+' added to your bag');
  }
});
$('#wishBtn').addEventListener('click',function(){toast(wishCount()?wishCount()+' saved piece'+(wishCount()>1?'s':''):'Your wishlist is empty')});
$('#bagBtn').addEventListener('click',function(){toast(bag?bag+' item'+(bag>1?'s':'')+' in your bag (demo)':'Your bag is empty')});

/* filters */
$('#filters').addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  $$('#filters button').forEach(function(x){var on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-selected',on)});
  var f=b.dataset.f,cards=$$('.card',grid);
  cards.forEach(function(c){c.classList.add('out')});
  setTimeout(function(){
    cards.forEach(function(c){var show=f==='all'||c.dataset.c===f;c.style.display=show?'':'none';if(show){c.classList.add('in');requestAnimationFrame(function(){c.classList.remove('out')})}});
  },300);
});

/* tilt */
if(fine&&!reduce){
  grid.addEventListener('mousemove',function(e){
    var t=e.target.closest('.tilt');if(!t)return;
    var r=t.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    t.classList.add('moving');
    t.style.setProperty('--ry',((x-.5)*18).toFixed(2)+'deg');
    t.style.setProperty('--rx',((.5-y)*14).toFixed(2)+'deg');
    t.style.setProperty('--gx',(x*100)+'%');t.style.setProperty('--gy',(y*100)+'%');
  });
  grid.addEventListener('mouseout',function(e){
    var t=e.target.closest('.tilt');if(!t||t.contains(e.relatedTarget))return;
    t.classList.remove('moving');t.style.setProperty('--ry','0deg');t.style.setProperty('--rx','0deg');
  });
}

/* ---------- nav + drawer ---------- */
var nav=$('#nav');
function onScrollNav(){nav.classList.toggle('scrolled',window.scrollY>40)}
function menu(open){document.body.classList.toggle('menu-open',open);$('#menuBtn').setAttribute('aria-expanded',open)}
$('#menuBtn').addEventListener('click',function(){menu(!document.body.classList.contains('menu-open'))});
$$('#drawer a').forEach(function(a){a.addEventListener('click',function(){menu(false)})});
document.addEventListener('keydown',function(e){if(e.key==='Escape')menu(false)});

/* ---------- reveals ---------- */
var io=('IntersectionObserver' in window)?new IntersectionObserver(function(es){
  es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
},{threshold:.12,rootMargin:'0px 0px -6% 0px'}):null;
function watchReveals(){$$('.reveal').forEach(function(el){if(io)io.observe(el);else el.classList.add('in')})}

/* ---------- count up ---------- */
var cio=('IntersectionObserver' in window)?new IntersectionObserver(function(es){
  es.forEach(function(e){
    if(!e.isIntersecting)return;cio.unobserve(e.target);
    var el=e.target,to=+el.dataset.count,t0=performance.now(),dur=1800;
    (function tick(now){var k=clamp((now-t0)/dur,0,1),v=Math.round(to*(1-Math.pow(1-k,4)));el.textContent=v.toLocaleString('en-IN');if(k<1)requestAnimationFrame(tick)})(t0);
  });
},{threshold:.6}):null;
$$('[data-count]').forEach(function(el){if(cio&&!reduce)cio.observe(el)});

/* ---------- atelier thread ---------- */
var thread=$('#threadFg'),process=$('#process'),steps=$$('.step'),tlen=0;
if(thread&&thread.getTotalLength){tlen=thread.getTotalLength();thread.style.strokeDasharray=tlen;thread.style.strokeDashoffset=tlen}
function onScrollThread(){
  var vh=window.innerHeight,r=process.getBoundingClientRect();
  var prog=clamp((vh*.8-r.top)/(r.height+vh*.2),0,1);
  if(tlen)thread.style.strokeDashoffset=tlen*(1-prog);
  steps.forEach(function(s){s.classList.toggle('on',s.getBoundingClientRect().top<vh*.78)});
}

/* ---------- magnetic buttons ---------- */
if(fine&&!reduce){
  $$('[data-magnet]').forEach(function(b){
    b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.2)+'px,'+((e.clientY-r.top-r.height/2)*.3)+'px)'});
    b.addEventListener('mouseleave',function(){b.style.transform=''});
  });
}

/* ---------- cursor ---------- */
var cur=$('#cursor'),mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my,mnx=0,mny=0;
if(fine){
  document.body.classList.add('has-cursor');
  document.addEventListener('mouseover',function(e){cur.classList.toggle('big',!!e.target.closest('[data-cursor],a,button'))});
}
window.addEventListener('mousemove',function(e){
  mx=e.clientX;my=e.clientY;mnx=mx/innerWidth*2-1;mny=my/innerHeight*2-1;
  if(fine&&!reduce)spark(mx,my,1);
},{passive:true});

/* ---------- fx canvas: gold dust + cursor sparkles ---------- */
var PAL={hi:'241,220,164',spark:'255,236,180',light:false};
var fx=$('#fx'),fc=fx.getContext('2d'),parts=[],dpr=1;
function sizeFx(){dpr=Math.min(devicePixelRatio||1,2);fx.width=innerWidth*dpr;fx.height=innerHeight*dpr}
sizeFx();
function spark(x,y,n){for(var i=0;i<n;i++){if(parts.length>160)parts.shift();parts.push({x:x,y:y,vx:(Math.random()-.5)*1.2,vy:Math.random()*-.8-.1,l:1,s:Math.random()*2+.8,k:1})}}
var dust=[];
if(!reduce)for(var di=0;di<(isMobile()?18:40);di++)dust.push({x:Math.random(),y:Math.random(),z:Math.random()*.9+.1,p:Math.random()*6.28});
function drawFx(now){
  fc.setTransform(dpr,0,0,dpr,0,0);fc.clearRect(0,0,innerWidth,innerHeight);
  fc.globalCompositeOperation=PAL.light?'source-over':'lighter';
  var i,p;
  for(i=0;i<dust.length;i++){p=dust[i];p.y-=.00012*p.z;p.x+=Math.sin(now*.0003+p.p)*.00008;if(p.y<-.02){p.y=1.02;p.x=Math.random()}
    fc.fillStyle='rgba('+PAL.hi+','+((PAL.light?.35:.18)+.22*Math.sin(now*.002+p.p)*p.z).toFixed(3)+')';
    fc.beginPath();fc.arc(p.x*innerWidth,p.y*innerHeight,p.z*1.7,0,6.283);fc.fill()}
  for(i=parts.length-1;i>=0;i--){p=parts[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.012;p.l-=.022;
    if(p.l<=0){parts.splice(i,1);continue}
    fc.fillStyle='rgba('+PAL.spark+','+(p.l*.85).toFixed(3)+')';
    var s=p.s*p.l;fc.beginPath();fc.moveTo(p.x,p.y-s*2.2);fc.lineTo(p.x+s*.6,p.y);fc.lineTo(p.x,p.y+s*2.2);fc.lineTo(p.x-s*.6,p.y);fc.closePath();fc.fill()}
  fc.globalCompositeOperation='source-over';
}

/* ---------- hero gem ---------- */
var hero=null,heroYaw=.4,heroAnchor=$('.hero-photo');
function alignHero(){try{if(!hero||!heroAnchor)return;var a=heroAnchor.getBoundingClientRect(),c=heroCanvas.getBoundingClientRect();if(!c.height)return;
  hero.off=[((a.left+a.width/2)-(c.left+c.width/2))/c.height,((c.top+c.height/2)-(a.top+a.height/2))/c.height];
  hero.tgt.gem=1.25*clamp(a.height/c.height/(document.documentElement.getAttribute('data-palette')==='ivory'?.55:.64),.4,1.1)}catch(e){}}
addEventListener('resize',function(){alignHero()});
var heroCanvas=$('#heroGl');
function setupHero(){
  if(!window.GemRenderer){document.body.classList.add('no-gl');return}
  try{
    hero=new GemRenderer(heroCanvas,{mode:0,gem:isMobile()?.6:1.25,cam:[0,.55,5.2],fov:.8,off:isMobile()?[0,.36]:[.24,0]});
    hero.onFail=function(){document.body.classList.add('no-gl')};
    hero.onFrame=function(now,dt){alignHero();
      var sy=clamp(window.scrollY/innerHeight,0,1.5);
      hero.yaw=heroYaw+mnx*.6+sy*1.2;
      hero.pitch=.42+mny*.18-sy*.1;
    };
    hero.start();
    if(!hero.ok)document.body.classList.add('no-gl');
  }catch(err){document.body.classList.add('no-gl')}
}
// slow idle spin that does not depend on the dt unit
var lastT=performance.now();
(function spin(now){heroYaw+=(now-lastT)*.00022*(reduce?0:1);lastT=now;requestAnimationFrame(spin)})(lastT);

/* ---------- ring designer ---------- */
var METALS={gold:{c:[1,.78,.36],n:'18K Yellow Gold'},rose:{c:[.95,.62,.52],n:'18K Rose Gold'},platinum:{c:[.88,.89,.93],n:'Platinum'}};
var STONES={
  diamond:{abs:[0,0,0],ior:2.42,fold:8,n:'Diamond',base:380000,label:'Diamond Solitaire'},
  ruby:{abs:[.2,1.6,1.4],ior:1.9,fold:6,n:'Ruby',base:300000,label:'Ruby Solitaire'},
  emerald:{abs:[1.6,.12,1.2],ior:1.9,fold:4,n:'Emerald',base:260000,label:'Emerald Solitaire'},
  sapphire:{abs:[1.5,1.1,.1],ior:1.85,fold:8,n:'Sapphire',base:240000,label:'Sapphire Solitaire'}
};
var METAL_PRICE={gold:120000,rose:125000,platinum:210000};
var D={metal:'gold',stone:'diamond',ct:1,size:12};
var view='photo',ring=null,ryaw=.5,rpitch=.28,rvel=0,dragging=false,lastInteract=0;
var ringCanvas=$('#ringGl');

function gemScale(ct){return .35*Math.cbrt(ct)+.12}
function applyDesign(instant){
  var m=METALS[D.metal],s=STONES[D.stone];
  if(ring)ring.set({metal:m.c,abs:s.abs,ior:s.ior,disp:D.stone==='diamond'?.045:.02,gem:gemScale(D.ct),fold:s.fold},instant);
  $('#stageTag').textContent=D.ct.toFixed(1)+' ct '+s.n+' · '+m.n;
  setPhoto();
  $('#sumName').textContent=s.label;
  $('#sumPrice').textContent=inr.format(Math.round((METAL_PRICE[D.metal]+s.base*Math.pow(D.ct,1.6))/1000)*1000);
}
var photoEl=null,photoKey='';
function setPhoto(){
  if(!photoEl)return;
  var key=D.metal+'-'+D.stone,src='images/ring-'+key+'.jpg';
  photoEl.style.transform='scale('+(.9+(D.ct-.5)/2.5*.16).toFixed(3)+')';
  if(key===photoKey)return;
  photoKey=key;
  var im=new Image();im.onload=function(){if(photoKey===key){photoEl.src=src}};im.src=src;
}
function setView(v){
  view=v;
  var st=ringCanvas.parentNode;
  st.classList.toggle('photo-mode',v==='photo');
  $$('#viewToggle button').forEach(function(b){var on=b.dataset.view===v;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
  if(ring){if(v==='3d'){ring.resize&&ring.resize();ring.start()}else ring.stop()}
}
function setupRing(){
  photoEl=$('#ringPhoto');
  $('#viewToggle').addEventListener('click',function(e){var b=e.target.closest('button');if(b)setView(b.dataset.view)});
  var sel=$('#size'),i;
  for(i=8;i<=24;i++){var o=document.createElement('option');o.value=i;o.textContent=String(i);if(i===12)o.selected=true;sel.appendChild(o)}
  sel.addEventListener('change',function(){D.size=+sel.value});
  function group(id,key){
    $('#'+id).addEventListener('click',function(e){
      var b=e.target.closest('.sw');if(!b)return;
      $$('.sw',this).forEach(function(x){var on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-checked',on)});
      D[key]=b.dataset.v;applyDesign(false);
    });
  }
  group('metals','metal');group('stones','stone');
  var rg=$('#ct');
  function rangeFill(){rg.style.setProperty('--pct',((rg.value-rg.min)/(rg.max-rg.min)*100)+'%')}
  rg.addEventListener('input',function(){D.ct=+rg.value;$('#ctOut').textContent=D.ct.toFixed(1)+' ct';rangeFill();applyDesign(true)});
  rangeFill();
  $('#reserve').addEventListener('click',function(){toast('Design reserved (demo): '+STONES[D.stone].label+', size '+D.size)});

  setView(view);
  if(!window.GemRenderer){ringCanvas.parentNode.classList.add('no-gl');applyDesign(true);return}
  try{
    ring=new GemRenderer(ringCanvas,{mode:1,gem:gemScale(1),cam:[0,.4,5.6],fov:.85,off:[0,-.07]});
    ring.onFail=function(){ringCanvas.parentNode.classList.add('no-gl')};
    ring.onFrame=function(now,dt){
      if(!dragging){
        rvel*=.94;ryaw+=rvel*dt;
        if(now-lastInteract>2500&&!reduce)ryaw+=dt*.00022;
      }
      ring.yaw=ryaw;ring.pitch=rpitch;
    };
    applyDesign(true);if(view==='3d')ring.start();
  }catch(err){ringCanvas.parentNode.classList.add('no-gl');applyDesign(true)}

  setView(view);
  var px=0,py=0,pt=0;
  ringCanvas.addEventListener('pointerdown',function(e){dragging=true;px=e.clientX;py=e.clientY;pt=performance.now();rvel=0;lastInteract=pt;try{ringCanvas.setPointerCapture(e.pointerId)}catch(_){}});
  ringCanvas.addEventListener('pointermove',function(e){
    if(!dragging)return;
    var now=performance.now(),dx=e.clientX-px,dy=e.clientY-py,dtm=Math.max(now-pt,1);
    ryaw+=dx*.009;rpitch=clamp(rpitch+dy*.005,-.2,.9);
    rvel=dx*.009/dtm;px=e.clientX;py=e.clientY;pt=now;lastInteract=now;
  });
  function up(){dragging=false;lastInteract=performance.now()}
  ringCanvas.addEventListener('pointerup',up);ringCanvas.addEventListener('pointercancel',up);
}

/* ---------- newsletter (demo only, nothing is sent) ---------- */
$('#form').addEventListener('submit',function(e){
  e.preventDefault();
  var n=$('#fName').value.trim(),m=$('#fMail').value.trim(),msg=$('#formMsg');
  if(!n||!/^\S+@\S+\.\S+$/.test(m)){msg.textContent='Please enter your name and a valid email address.';return}
  msg.textContent='Thank you, '+n.split(' ')[0]+'. This is a demo, so nothing was sent.';
  this.reset();
});

/* ---------- theme toggle (dark / light) ---------- */
function readPal(){
  var cs=getComputedStyle(document.documentElement);
  PAL.hi=(cs.getPropertyValue('--hi-rgb')||'241,220,164').trim();
  PAL.light=document.documentElement.getAttribute('data-palette')==='ivory';
  PAL.spark=PAL.light?'176,134,52':'255,236,180';
}
function setPalette(p){
  if(p==='obsidian')document.documentElement.removeAttribute('data-palette');else document.documentElement.setAttribute('data-palette',p);
  $$('#palette button').forEach(function(b){var on=b.dataset.p===p;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
  var meta=document.querySelector('meta[name=theme-color]');if(meta)meta.content=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()||'#08080a';
  readPal();
  try{localStorage.setItem('maison-theme',p)}catch(e){}
}
var palEl=$('#palette');
if(palEl){
  palEl.addEventListener('click',function(e){var b=e.target.closest('button');if(b)setPalette(b.dataset.p)});
  var saved=null;try{saved=localStorage.getItem('maison-theme')}catch(e){}
  if(saved&&$('#palette [data-p="'+saved+'"]'))setPalette(saved);
}

/* ---------- start ---------- */
window.addEventListener('scroll',function(){onScrollNav();onScrollThread()},{passive:true});
window.addEventListener('resize',function(){sizeFx()});
var heroCopy=$('.hero-copy');
function reveal(){
  document.documentElement.classList.add('loaded');document.body.classList.add('loaded');
  heroCopy.classList.add('ready');
  watchReveals();
}
onScrollNav();onScrollThread();
setupHero();setupRing();
(function frame(now){drawFx(now);requestAnimationFrame(frame)})(0);
if(document.readyState==='complete')setTimeout(reveal,900);
else window.addEventListener('load',function(){setTimeout(reveal,900)});
setTimeout(function(){if(!document.body.classList.contains('loaded'))reveal()},3500);
})();

;(function(){var p=document.createElement('i');p.className='progress';document.body.appendChild(p);addEventListener('scroll',function(){p.style.transform='scaleX('+Math.min(1,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight))+')'},{passive:true})})();
