/*
 * The product homepage's interactive layer: the template chips and banners, the
 * feature tour, the Arc ticker, the device stack and the screenshot hooks
 * (?shot, ?plat, ?crest, ?mode, ?step, ?dev, ?open). It renders into the static
 * markup in routes/home.tsx and returns a cleanup that removes everything it
 * attached outside that markup.
 */
export function startHomepage() {
  var cleanups = [];
  function on(target, type, listener, options) {
    target.addEventListener(type, listener, options);
    cleanups.push(function () { target.removeEventListener(type, listener, options); });
  }

  var q=new URLSearchParams(location.search);
  var shot=q.has('shot');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(shot||reduce)document.documentElement.classList.add('noanim');
  var A='/assets/', root=document.documentElement;
  var hero=document.getElementById('top');
  (function(){function plat(){var ua=navigator.userAgent||'';var ios=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)||innerWidth<760;hero.dataset.plat=ios?'ios':'mac'}plat();on(window,'resize',plat);if(q.get('plat'))hero.dataset.plat=q.get('plat')})();

  /* ---------------------------------------------------------- Space templates
     BrowserSpaceHousePalette: field, primary, charge; plate, figure, trim. */
  var T={
    winter:{n:'Winter',c:['#1e2833','#3e4e5e','#86adc4']},
    lion:{n:'Lion',c:['#3c0e1a','#722030','#c9a254']},
    storm:{n:'Storm',c:['#151824','#313848','#b08f4a']},
    dragon:{n:'Dragon',c:['#1a100d','#7a1e12','#be4438']},
    meadow:{n:'Meadow',c:['#152318','#345738','#bca766']},
    iron:{n:'Iron',c:['#0e1a1c','#2c3a3c','#9c9781']},
    river:{n:'River',c:['#0f1e2e','#22486c','#a85c41']},
    sun:{n:'Sun',c:['#35160b','#8b3d1b','#d09e65']},
    vigil:{n:'Vigil',c:['#101112','#272a2e','#7b838c']}
  };
  var ORDER=['winter','lion','storm','dragon','meadow','iron','river','sun','vigil'];
  function crest(id){return A+'crests/'+id+'.svg'}
  /* Space backgrounds (BrowserSpaceBannerField / BrowserSpaceGradientField), drawn over a W×H field
     and topped with the house look's readability fade (0.45 × 0.55). vw crops the field to its left vw,
     the way a sidebar sees the window-wide field. */
  var MODE_NAME={diagonal:'Diagonal',chevron:'Chevron',bands:'Bands',split:'Split',quartered:'Quartered',stripes:'Stripes',checkered:'Checkered',lozenges:'Lozenges',gradient:'Gradient'};
  var fieldCache={};
  function poly(pts,fill,op){return '<path d="M'+pts.map(function(p){return p[0].toFixed(1)+' '+p[1].toFixed(1)}).join('L')+'Z" fill="'+fill+'"'+(op?' fill-opacity="'+op+'"':'')+'/>'}
  function field(id,mode,W,H,vw,fit){
    var key=[id,mode,W,H,vw,fit].join('/'); if(fieldCache[key])return fieldCache[key];
    var c=T[id].c, a=c[0], b=c[1], d=c[2], g='';
    function R(x,y,w,h,f,op){return '<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" fill="'+f+'"'+(op?' fill-opacity="'+op+'"':'')+'/>'}
    if(mode==='gradient'){
      g='<defs><linearGradient id="g" x1="0" y1=".5" x2="1" y2=".5"><stop offset="0" stop-color="'+a+'"/><stop offset=".5" stop-color="'+b+'"/><stop offset="1" stop-color="'+d+'"/></linearGradient>'
       +'<filter id="n" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 2.2 -1.1"/></filter></defs>'
       +'<rect width="'+W+'" height="'+H+'" fill="url(#g)"/><rect width="'+W+'" height="'+H+'" filter="url(#n)" opacity=".16"/>';
    }else{
      g=R(0,0,W,H,a);
      if(mode==='split')g+=R(W/2,0,W/2,H,b);
      else if(mode==='bands')g+=R(0,H/3,W,H/3,b)+R(0,2*H/3,W,H/3+.5,d);
      else if(mode==='diagonal')g+=poly([[0,H*.5],[W,H*.34],[W,H*.5],[0,H*.68]],b)+poly([[0,H*.68],[W,H*.5],[W,H],[0,H]],d);
      else if(mode==='chevron')g+=poly([[0,H*.42],[W/2,H*.58],[W,H*.42],[W,H*.62],[W/2,H*.78],[0,H*.62]],b)+poly([[0,H*.62],[W/2,H*.78],[W,H*.62],[W,H],[0,H]],d);
      else if(mode==='quartered')g+=R(W/2,0,W/2,H/2,b)+R(0,H/2,W/2,H/2,d);
      else{
        var cell=Math.max(16,W/5), rows=Math.min(200,Math.ceil(H/cell)+1), cols=Math.min(200,Math.ceil(W/cell)+1);
        for(var r=0;r<rows;r++)for(var k=0;k<cols;k++){
          var x=k*cell,y=r*cell;
          if(mode==='stripes'&&k%2===0)g+=R(x,y,cell,cell,b,.35);
          else if(mode==='checkered'&&(r+k)%2===0)g+=R(x,y,cell,cell,b,.35);
          else if(mode==='lozenges')g+=poly([[x+cell/2,y],[x+cell,y+cell/2],[x+cell/2,y+cell],[x,y+cell/2]],(r+k)%2===0?b:d,.35);
        }
      }
    }
    g+='<rect width="'+W+'" height="'+H+'" fill-opacity=".2475"/>';
    var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+(vw||W)+' '+H+'" preserveAspectRatio="'+(fit||'none')+'">'+g+'</svg>';
    return fieldCache[key]="url('data:image/svg+xml,"+encodeURIComponent(s)+"')";
  }
  var WIN=[1329,768], SIDEBAR=[1329,768,289];
  var state={work:q.get('crest')&&T[q.get('crest')]?q.get('crest'):'winter',mode:MODE_NAME[q.get('mode')]?q.get('mode'):'diagonal'};
  function look(space){return space==='work'?state.mode:'diagonal'}
  function tpl(space){return space==='work'?state.work:(state.work==='lion'?'winter':'lion')}

  /* ---------------------------------------------------------- window renders */
  var I={
    sidebar:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/></svg>',
    back:'<svg viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"/></svg>',
    fwd:'<svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>',
    reload:'<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/></svg>',
    lock:'<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    tune:'<svg viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
    search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    archive:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9M10 13h4"/></svg>',
    folder:'<svg viewBox="0 0 24 24" style="fill:rgba(255,255,255,.55);stroke:none"><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h3.6l2 2h7.4A2.5 2.5 0 0 1 21 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/></svg>',
    link:'<svg viewBox="0 0 24 24"><path d="M10 14 14 10M8 12l-2 2a3 3 0 0 0 4 4l2-2M16 12l2-2a3 3 0 0 0-4-4l-2 2"/></svg>',
    win:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18"/></svg>',
    cam:'<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.5"/></svg>',
    term:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/></svg>',
    globe:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
    target:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>'
  };
  var TOOLICONS=I.link+I.win+I.cam+I.term+I.globe+I.target;
  function img(src){return '<img src="'+src+'" alt="">'}

  /* Work mirrors the app's own capture (crest-work-mac.png); Personal is the second Space. */
  var SIDE={
    work:{name:'Work',url:'data:text/html;…%2Fhtml%3E',tiles:['🧭','📐','📅','✍️'],fold:'Launch Atlas',kids:[['🔬','Audience research'],['🚩','Launch plan'],['🎨','Design review']],act:0,grp:[['✨','Monday overview'],['🗒️','Launch notes']]},
    personal:{name:'Personal',url:'data:text/html;…%2Fhtml%3E',tiles:['🏠','🗺️','☕','📚'],fold:'Weekend Plans',kids:[['🏕️','Cabin ideas'],['🌱','Garden notes'],['📖','Sunday reading']],act:-1,grp:[['☀️','Personal Field Guide'],['📓','Saturday Trail Note']]}
  };

  function qwHTML(){return '<div class="qw float"><div class="qw-win" style="--field:'+field(tpl('personal'),'diagonal',720,460)+'"><div class="qw-bar"><span class="lights"><i></i><i></i><i></i></span><span class="sp">'+img(crest(tpl('personal')))+'Personal</span><span class="qaddr">'+I.lock+'localhost:4321/demos/trail/</span><span class="open">Open in Personal ⌄</span></div><div class="qw-page"><div class="pbody"><div class="kk">Field note · Quick look</div><h4>The trail is clear after noon.</h4><p>Opened from another app, in the Personal Space.</p></div></div></div></div>'}
  function descPage(o){
    var d=o.desc, h='<div class="pg desc'+(d.qw?' hasfloat':'')+'"><div class="dsc">';
    h+='<div class="kk">'+d.kk+'</div><h3>'+d.h+'</h3><div class="body">'+d.body.map(function(x){return '<p>'+x+'</p>'}).join('')+'</div>';
    if(d.routes)h+='<div class="routes"><div><span>URL pattern</span><span>Match</span><span>Space</span></div>'+d.routes.map(function(r){return '<div><code>'+r[0]+'</code><em>'+r[1]+'</em><span>'+img(crest(tpl(r[2])))+SIDE[r[2]].name+'</span></div>'}).join('')+'</div>';
    h+='</div>';
    if(d.qw)h+=qwHTML();
    return h+'</div>';
  }
  var NORTH_CARDS='<div class="cards"><div><small>01</small><b>Today</b><span>Three decisions, one clear priority</span></div><div class="on"><small>02</small><b>Atlas</b><span>Research is ready for review</span></div><div><small>03</small><b>Launch</b><span>Milestone check-in at 2:30</span></div><div><small>04</small><b>Notes</b><span>Seven ideas worth keeping</span></div></div>';
  var PAL_ROWS=[['🔬','Audience research'],['🚩','Launch plan'],['🎨','Design review'],['✨','Monday overview']];
  var PAGES={
    desc:descPage,
    northstar:function(){return '<div class="pg northstar"><div class="demo"><div class="kk">Northstar Studio · Audience research</div><h3>Make space for the work that matters.</h3><p class="sub">A calm command center for launches, decisions, and the people moving them forward.</p>'+NORTH_CARDS+'</div></div>'},
    fieldnotes:function(){return '<div class="pg fieldnotes"><div class="demo"><div class="kk">Field notes · A slower Saturday</div><h3>A slower Saturday starts here.</h3><p class="sub">Plans for good food, open roads, a little dirt under your nails, and time to read.</p><div class="cards"><div class="on"><small>01</small><b>Weekend</b><span>Market, trail, then nowhere to be</span></div><div><small>02</small><b>Trips</b><span>Cabin map and quiet roads</span></div><div><small>03</small><b>Garden</b><span>What to plant before the rain</span></div><div><small>04</small><b>Reading</b><span>Four essays for Sunday morning</span></div></div></div></div>'},
    split:function(){return '<div class="pg split"><div class="card"><div class="demo"><div class="kk">Weekend plans · Field guide</div><h3>Follow a thought without losing your place.</h3><p>Open the trail note in Peek, decide if it deserves a tab, then come back to where you were.</p><span class="pill">Peek at the trail note →</span></div></div><div class="card focus"><div class="demo"><div class="kk">Field note · Quick look</div><h3>The trail is clear after noon.</h3><p>Saturday · 64° · Pack lunch and the green thermos.</p></div></div></div>'},
    peek:function(o){return '<div class="pg fieldnotes"><div class="demo"><div class="kk">Weekend plans · Field guide</div><h3 style="max-width:9ch">Follow a thought without losing your place.</h3></div><div class="dim"></div><div class="peek-assembly"><div class="pk-actions"><span>✕ &nbsp;Close</span><span class="pri">'+img(crest(tpl(o.space)))+'Open In… ⌄</span></div><div class="peek"><div class="pbar"><span class="i">i</span><span>http://localhost:4321/demos/trail/</span><span class="ics">'+TOOLICONS+'</span></div><div class="pbody"><div class="kk">Field note · Quick look</div><h4>The trail is clear after noon.</h4><p>Saturday · 64° · Pack lunch and the green thermos.</p></div></div></div></div>'},
    palette:function(){return '<div class="pg northstar"><div class="demo"><div class="kk">Northstar Studio · Audience research</div><h3>Make space for the work that matters.</h3>'+NORTH_CARDS+'</div><div class="dim" style="background:rgba(150,146,136,.6)"></div><div class="glass"><div class="g-in">'+I.search+'<span>Search or Enter URL…</span></div><div class="g-sec">Open Tabs</div>'+PAL_ROWS.map(function(r,i){return '<div class="g-row'+(i===0?' sel':'')+'"><i>'+r[0]+'</i><div><b>'+r[1]+'</b><small>data:text/html;charset=utf-8,%3C%21doctype%20html%3E%3Chtml%3E…</small></div><span class="g-act">Switch to Tab →</span></div>'}).join('')+'<div class="g-sec">Actions</div><div class="g-row"><i>▢</i><div><b>New Window</b></div><span class="g-act"><kbd>⌘N</kbd> →</span></div></div></div>'},
    localhost:function(){return '<div class="pg fieldnotes"><div class="pbar top"><span class="i">i</span><span>http://localhost:4321/demos/source/</span><span class="ics">'+TOOLICONS+'</span></div><div class="pbody lh"><div class="kk">Weekend plans · Field guide</div><h4>Follow a thought without losing your place.</h4><p>Open the trail note in Peek, decide if it deserves a tab, then come back to where you were.</p><span class="pill">Peek at the trail note →</span></div></div>'}
  };

  function sidebar(space,o){
    var s=SIDE[space],t=tpl(space),h='<aside class="sb">';
    h+='<div class="sb-title"><span class="lights"><i></i><i></i><i></i></span><span class="navc mute">'+I.back+I.fwd+I.reload+'</span></div>';
    h+='<div class="addr">'+I.lock+'<span class="url">'+(o.url||s.url)+'</span>'+I.tune+'</div>';
    h+='<div class="tiles">'+s.tiles.map(function(x){return '<i class="tile-p">'+x+'</i>'}).join('')+'</div>';
    h+='<div class="row space">'+img(crest(t))+s.name+'<span class="more">···</span></div>';
    h+='<div class="row fold"><span class="ic">'+I.folder+'</span>'+s.fold+'<span class="count">3</span></div>';
    h+=s.kids.map(function(k,i){var on=!o.act&&i===s.act;return '<div class="row child'+(on?' act':'')+'"><span class="ic">'+k[0]+'</span>'+k[1]+(on?'<span class="x">–</span>':'')+'</div>'}).join('');
    h+='<div class="rule"></div><div class="row new"><span class="ic">+</span>New Tab</div>';
    if(o.act)h+='<div class="row act"><span class="ic">'+o.act[0]+'</span>'+o.act[1]+'<span class="x">✕</span></div>';
    h+='<div class="grp"><div class="row hd"><span class="ic">⧉</span>Split View<span class="more">···</span></div>'+s.grp.map(function(g,i){return '<div class="row'+(o.group&&i===1?' act':'')+'"><span class="ic">'+g[0]+'</span>'+g[1]+'</div>'}).join('')+'</div>';
    h+='<div class="grow"></div>';
    h+='<div class="sb-foot">'+I.sidebar+'<span class="picker" role="group" aria-label="Switch Space">'
      +['work','personal'].map(function(sp){return '<button type="button" data-pick="'+sp+'" aria-pressed="'+(space===sp)+'" aria-label="'+SIDE[sp].name+' Space">'+img(crest(tpl(sp)))+'</button>'}).join('')
      +'</span><span class="arch">'+I.archive+'<b>2</b></span></div></aside>';
    return h;
  }
  function renderMac(el,o){
    el.innerHTML='<div class="mac-win" style="--field:'+field(tpl(o.space),look(o.space),WIN[0],WIN[1])+'">'+sidebar(o.space,o)+PAGES[o.page](o)+'</div>';
    if(o.page==='peek'){el.classList.add('is-hidden');requestAnimationFrame(function(){requestAnimationFrame(function(){el.classList.remove('is-hidden')})})}
    el.querySelectorAll('[data-pick]').forEach(function(b){b.addEventListener('click',function(){
      var sp=b.dataset.pick; if(sp===o.space)return;
      renderMac(el,sp==='work'?{space:'work',page:'northstar'}:{space:'personal',page:'fieldnotes',act:['☀️','A slower Saturday']});
    })});
  }

  /* ---------------------------------------------------------- the template the page wears */
  var chips=document.getElementById('chips'), flags=document.getElementById('flags');
  /* each floating banner shows its template in a different background mode */
  var CHIP_MODE={winter:'diagonal',lion:'chevron',storm:'quartered',dragon:'bands',meadow:'lozenges',iron:'stripes',river:'split',sun:'gradient',vigil:'checkered'};
  var CHIP_POS={winter:[9,20,1,-7,7],lion:[18,56,.86,6,8],storm:[5,80,.9,-4,6.5],vigil:[25,90,.7,7,9],dragon:[91,18,.96,6,7.5],meadow:[82,48,.8,-5,8.5],iron:[95,76,.86,4,6],river:[76,88,.72,-7,9.5],sun:[72,9,.66,8,7]};
  chips.innerHTML=ORDER.map(function(id,i){var p=CHIP_POS[id];return '<button type="button" class="chip-t" data-t="'+id+'" data-mode="'+CHIP_MODE[id]+'" aria-pressed="false" aria-label="'+T[id].n+', '+MODE_NAME[CHIP_MODE[id]]+' background" style="--x:'+p[0]+'%;--y:'+p[1]+'%;--s:'+p[2]+';--r:'+p[3]+'deg;--d:'+p[4]+'s;--dl:-'+(i*1.3).toFixed(1)+'s"><span class="tile"><span class="edge"></span><span class="flagc" style="--field:'+field(id,CHIP_MODE[id],84,149)+'">'+img(crest(id))+'</span><span class="bar"></span></span></button>'}).join('');
  flags.innerHTML=ORDER.map(function(id){return '<button type="button" class="flag" data-t="'+id+'" aria-label="Use '+T[id].n+'"><span class="cloth" style="--field:'+field(id,'diagonal',SIDEBAR[0],SIDEBAR[1],SIDEBAR[2])+'">'+img(crest(id))+'<span class="pins" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="tabs" aria-hidden="true"><i></i><i class="on"></i><i></i><i></i></span></span></button>'}).join('');
  /* A banner never covers the hero's words or hangs past the hero onto the window
     below: one that would at this width stays off the page. */
  var chipEls=[].slice.call(chips.querySelectorAll('.chip-t')), heroHead=document.querySelector('.hero-head');
  var heroText=[].slice.call(document.querySelectorAll('.hero-copy h1,.hero-copy .lede,.hero-copy .fine')),
      heroButtons=[].slice.call(document.querySelectorAll('.hero-copy .cta a'));
  /* the lines the words fill, not the full-width blocks that centre them */
  function wordBoxes(){
    var boxes=[];
    heroText.forEach(function(e){var r=document.createRange();r.selectNodeContents(e);boxes.push.apply(boxes,[].slice.call(r.getClientRects()))});
    heroButtons.forEach(function(e){boxes.push(e.getBoundingClientRect())});
    return boxes.filter(function(b){return b.width&&b.height});
  }
  function clearWords(){
    chipEls.forEach(function(c){c.classList.remove('crowded')});
    if(matchMedia('(max-width:760px)').matches)return;
    var m=14, floor=heroHead.getBoundingClientRect().bottom;
    var words=wordBoxes();
    chipEls.forEach(function(c){
      var r=c.getBoundingClientRect(); if(!r.width)return;
      if(r.bottom>floor||words.some(function(w){return r.left<w.right+m&&r.right>w.left-m&&r.top<w.bottom+m&&r.bottom>w.top-m}))c.classList.add('crowded');
    });
  }
  clearWords();on(window,'resize',clearWords);on(window,'load',clearWords);
  if(document.fonts)document.fonts.ready.then(clearWords);
  var heroLayers=[].slice.call(document.querySelectorAll('.hb')), heroOn=0;
  function setTemplate(id,mode){
    state.work=id; state.mode=mode||'diagonal';
    var c=T[id].c; root.style.setProperty('--t0',c[0]); root.style.setProperty('--t1',c[1]); root.style.setProperty('--t2',c[2]);
    chips.querySelectorAll('[data-t]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.t===id&&b.dataset.mode===state.mode))});
    var bg=field(id,state.mode,1600,1000,0,'xMidYMid slice'), next=heroLayers[1-heroOn];
    if(heroLayers[heroOn].style.getPropertyValue('--field')!==bg){next.style.setProperty('--field',bg);next.classList.add('on');heroLayers[heroOn].classList.remove('on');heroOn=1-heroOn}
    document.querySelector('.get .band').style.setProperty('--field',field(id,state.mode,WIN[0],WIN[1]));
    if(tourStep!=null)drawTour(tourStep);
  }
  chips.querySelectorAll('[data-t]').forEach(function(b){b.addEventListener('click',function(){setTemplate(b.dataset.t,b.dataset.mode)})});
  flags.querySelectorAll('[data-t]').forEach(function(b){b.addEventListener('click',function(){setTemplate(b.dataset.t,'diagonal');b.classList.remove('swing');void b.offsetWidth;if(!reduce)b.classList.add('swing')})});

  /* ---------------------------------------------------------- nav + reveal */
  var rv=[].slice.call(document.querySelectorAll('.rv'));
  if(!shot&&!reduce&&'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -6% 0px',threshold:.05});
    rv.forEach(function(e){io.observe(e)});cleanups.push(function(){io.disconnect()});
  }else rv.forEach(function(e){e.classList.add('in')});

  /* ---------------------------------------------------------- feature ticker from the parity table */
  (function(){
    var tk=document.getElementById('ticker');
    var rows=[].slice.call(document.querySelectorAll('.parity tbody tr')).map(function(tr){return {arc:tr.children[0].textContent,crest:tr.children[1].textContent}});
    function card(r){return '<article class="fcard"><small>'+r.arc+'</small><h3>'+r.crest+'</h3></article>'}
    function track(rs,hidden){return '<div class="ttrack"'+(hidden?' aria-hidden="true"':'')+'>'+rs.map(card).join('')+'</div>'}
    var r1=rows.filter(function(_,i){return i%2===0}), r2=rows.filter(function(_,i){return i%2===1});
    tk.innerHTML='<div class="trow"><div class="tbelt">'+track(r1)+track(r1,true)+'</div></div><div class="trow rev"><div class="tbelt">'+track(r2)+track(r2,true)+'</div></div>';
  })();

  /* ---------------------------------------------------------- feature tour */
  var TOUR=[
    {tab:'Crest',space:'work',page:'northstar',cap:'A sidebar, Spaces, and the page.'},
    {tab:'Spaces',space:'personal',page:'desc',url:'crestbrowser.com<small>/docs/spaces-and-isolation/</small>',act:['◈','Spaces'],desc:{kk:'Spaces',h:'Each Space is its own browser.',body:['Separate cookies, history, passwords, and extensions.']}},
    {tab:'Sidebar',space:'work',page:'desc',url:'crestbrowser.com<small>/docs/organize-tabs-and-folders/</small>',act:['▤','Sidebar'],desc:{kk:'Sidebar',h:'Tabs down the side.',body:['Pinned sites, folders, and tabs, one Space at a time.']}},
    {tab:'Split View',space:'personal',page:'split',group:true,cap:'Up to four tabs side by side.'},
    {tab:'Peek',space:'personal',page:'peek',url:'localhost:4321<small>/demos/source/</small>',act:['☀️','Personal Field Guide'],cap:'Preview a link, then close it or keep it.'},
    {tab:'Quick Window',space:'personal',page:'desc',url:'crestbrowser.com<small>/docs/peek-and-quick-window/</small>',act:['▢','Quick Window'],desc:{kk:'Quick Window',h:'Links from other apps open small.',body:['Keep it as a tab, or close it.'],qw:true}},
    {tab:'Link Routing',space:'work',page:'desc',url:'crestbrowser.com<small>/docs/link-routing/</small>',act:['⇢','Link Routing'],desc:{kk:'Link Routing',h:'Links land in the right Space.',body:['Match a URL, pick a Space.'],routes:[['github.com','Contains','work'],['docs.northstar.studio/launch','Exact','work'],['allrecipes.com','Contains','personal']]}},
    {tab:'Command palette',space:'work',page:'palette',cap:'Tabs, history, and commands in one field.'},
    {tab:'Developer tools',space:'personal',page:'localhost',url:'localhost:4321<small>/demos/source/</small>',act:['✨','Personal Field Guide'],cap:'Viewports, Console, and Network.'}
  ];
  var tourEl=document.getElementById('tour'), tourMac=document.getElementById('tour-mac'), tourCap=document.getElementById('tour-cap'), tourStep=null;
  document.getElementById('tour-segs').innerHTML=TOUR.map(function(t,i){return '<button role="tab" aria-selected="'+(i===0)+'" data-go="'+i+'">'+t.tab+'</button>'}).join('');
  document.getElementById('tour-dots').innerHTML=TOUR.map(function(){return '<i></i>'}).join('');
  var phone=matchMedia('(max-width:760px)'), listEl=document.getElementById('tour-list'), listStep=0;
  function capFor(t){return t.desc?[t.desc.h,t.desc.body[0]]:[t.tab,t.cap]}
  function drawTour(i){
    if(phone.matches){drawList();return}
    var t=TOUR[i], c=capFor(t); renderMac(tourMac,t);
    tourCap.querySelector('h3').textContent=c[0]; tourCap.querySelector('p').textContent=c[1];
  }
  /* phones: every step as its own window, two in view */
  function drawList(){
    listEl.innerHTML='<div class="rail">'+TOUR.map(function(t){var c=capFor(t);return '<div class="tl-card"><div class="mac"></div><div class="tl-cap"><h3>'+c[0]+'</h3><p>'+c[1]+'</p></div></div>'}).join('')+'</div>';
    listEl.querySelectorAll('.tl-card').forEach(function(card,k){renderMac(card.querySelector('.mac'),TOUR[k])});
    layoutList();
  }
  function layoutList(){
    var first=listEl.querySelector('.tl-card'); if(!first)return;
    var h=first.offsetHeight; listStep=h+18; listEl.style.height=(2*h+18)+'px'; placeList(tourStep||0);
  }
  function placeList(i){
    var rail=listEl.querySelector('.rail'); if(!rail)return;
    var off=Math.min(i,TOUR.length-2); rail.style.transform='translateY('+(-off*listStep)+'px)';
    rail.querySelectorAll('.tl-card').forEach(function(c,k){c.classList.toggle('off',k<off||k>off+1)});
  }
  function setTour(i){
    if(tourStep===i)return; tourStep=i;
    if(phone.matches)placeList(i);
    else{drawTour(i);tourCap.classList.remove('swap'); void tourCap.offsetWidth; tourCap.classList.add('swap')}
    document.querySelectorAll('#tour-dots i').forEach(function(d,k){d.classList.toggle('on',k===i)});
    tourEl.querySelectorAll('[data-go]').forEach(function(b){b.setAttribute('aria-selected',String(Number(b.dataset.go)===i))});
  }
  if(phone.matches)drawList();
  on(phone,'change',function(){if(phone.matches)drawList();else{listEl.innerHTML='';if(tourStep!=null)drawTour(tourStep)}});
  on(window,'resize',function(){if(phone.matches)layoutList()});
  (function(){
    var n=TOUR.length; tourEl.style.setProperty('--n',n); var inner=tourEl.querySelector('.tour-in'), stage=tourEl.querySelector('.stage');
    function update(){
      var r=tourEl.getBoundingClientRect(), st=stage.offsetHeight, total=r.height-st;
      var p=Math.min(.9999,Math.max(0,-r.top/total)); var step=Math.floor(p*n);
      inner.style.setProperty('--grow',Math.min(1,Math.max(0,p*n)).toFixed(3));
      var avail=document.documentElement.clientHeight-64, sv=Math.round(64+Math.max(0,(avail-st)*.5))+'px';
      if(stage.style.getPropertyValue('--stick')!==sv)stage.style.setProperty('--stick',sv);
      setTour(step);
    }
    tourEl.querySelectorAll('[data-go]').forEach(function(b){b.addEventListener('click',function(){
      var i=Number(b.dataset.go), st=stage.offsetHeight, total=tourEl.offsetHeight-st, top=tourEl.getBoundingClientRect().top+scrollY;
      scrollTo({top:top+(i+.5)*(total/n),behavior:reduce?'auto':'smooth'});
    })});
    if(!shot&&!reduce){on(window,'scroll',update,{passive:true});on(window,'resize',update);update()}
    else{inner.style.setProperty('--grow',q.get('step')?1:0);setTour(Number(q.get('step')||0))}
  })();
  /* a different template, in its banner's background, on each load unless ?crest= pins one */
  if(!q.get('crest')){var pick=ORDER[Math.floor(Math.random()*ORDER.length)];state.work=pick;state.mode=CHIP_MODE[pick]}
  setTemplate(state.work,state.mode);

  /* ---------------------------------------------------------- device stack */
  var ds=document.getElementById('devstack');
  function setDev(k){
    ds.dataset.dev=k;
    ds.querySelectorAll('button[data-dev]').forEach(function(b){b.setAttribute('aria-selected',String(b.dataset.dev===k))});
    ds.querySelectorAll('[data-devcap]').forEach(function(c){c.classList.toggle('on',c.dataset.devcap===k)});
  }
  ds.querySelectorAll('button[data-dev]').forEach(function(b){b.addEventListener('click',function(){setDev(b.dataset.dev)})});
  ds.querySelectorAll('.ds-item').forEach(function(it){it.addEventListener('click',function(){setDev(it.dataset.devitem)})});
  if(q.get('dev'))setDev(q.get('dev'));
  if(q.get('open'))document.querySelector('.fulllist').open=true;

  /* screenshot hook: ?shot=1&y=N */
  if(shot){
    var y=Number(q.get('y')||0);
    var go=function(){root.style.scrollBehavior='auto';document.body.style.marginTop=(-y)+'px';scrollTo(0,0);document.querySelectorAll('.mac').forEach(function(m){m.classList.remove('is-hidden')})};
    go();on(window,'load',go);
  }

  return function () {
    cleanups.forEach(function (cleanup) { cleanup(); });
    root.classList.remove('noanim');
    root.style.removeProperty('--t0');
    root.style.removeProperty('--t1');
    root.style.removeProperty('--t2');
    root.style.scrollBehavior = '';
    document.body.style.marginTop = '';
  };
}
