import {recordVisit} from './backend-client.js';
import {pages,research,book,icon,launchImage,launchUrl,launchTitle,launchSubtitle,excelFeature,xbSub,xbUrl,email,pressUrl,openApp,openItem,openTrash} from './assets/index-XbenchA1.js';
const glyph = (name, cls='') => `<span class="p-icon ${cls}" aria-hidden="true">${icon(name)}</span>`;
const app = (name,text,cls='') => `<button class="${cls}" data-app="${name}">${text}</button>`;
const badge = text => `<span class="burst" aria-hidden="true"><b>${text}</b></span>`;
const root = document.querySelector('#portal');
root.innerHTML = `
<header class="masthead">
 <div class="usa-sticker"><img src="/assets/usa-miami-sf.png" alt="USA map with stars at Miami and San Francisco and an arrow from Miami to SF"></div>
 <div class="identity"><div class="name-row"><canvas class="fried-fire" width="48" height="64" aria-label="Animated flame" role="img"></canvas><h1 data-text="Nico Christie"><span>Nico Christie</span></h1></div></div>
 <div class="cuba-postcard"><img src="/assets/cuba-postcard-clean.png" alt="Deep-fried Cuba postcard with Havana buildings, a vintage turquoise car, and the Cuban flag"><strong class="free-cuba">FREE CUBA!</strong></div>
</header>
<div class="portal-grid">
 <aside class="left-rail">
  <button class="pink-button paint-launch" data-app="paint">🎨 Paint &amp; post to my wall</button>
  <nav class="bevel nav-stack" aria-label="Social links"><a href="https://x.com/nicochristie" target="_blank" rel="noopener noreferrer">${glyph('globe')}<u>Twitter</u></a><a href="https://github.com/nicodunks" target="_blank" rel="noopener noreferrer">${glyph('computer')}<u>GitHub</u></a><a href="mailto:${email}">${glyph('mail')}<u>Email me</u></a></nav>
  <div class="guadalupe-sticker"><img src="/assets/guadalupe-rainbow.png" alt="Virgin of Guadalupe with a rainbow foil halo" loading="lazy"></div>
  <div class="counter bevel">Visits<div class="digits" id="visitor-count" aria-live="polite">·······</div><span>Best viewed at 800×600</span></div>

  <article class="panel book"><h2>${book.name.replace('.pdf','')}</h2><button class="book-pdf" data-book aria-label="Open How I Learned to Jump Higher Than LeBron James PDF">${glyph('filePdf')}</button></article>
  <div class="wall-gallery side-art" id="wall-left" aria-label="Visitor art, left wall"></div>
 </aside>
 <section class="main-column">
  <div class="sunset"><strong>yooooooooooooo</strong></div>
  <div class="feature-grid content-columns">
   <div class="content-stack">
    <article class="panel shortcut">${badge('10M+ Views!')}<h2 class="shortcut-title"><span>I created Shortcut!</span></h2><p class="intro">The AI Agent that changed Excel</p><button class="photo-link" data-app="video"><img src="${launchImage}" alt="${launchTitle}"><span class="play">▶</span></button></article>
    <article class="panel research"><h2>${research.doc.heading}</h2><button class="photo-link project-photo" data-research><img src="/assets/project-sid.png" alt="Project Sid visual abstract"></button><p>${research.doc.blocks[1].text}</p><button class="text-link" data-research>Project Sid.doc →</button></article>

   </div>
   <div class="content-stack">
    <article class="panel dunks"><h2 class="dunk-title">Nicodunks</h2><button class="photo-link" data-app="media"><img src="/assets/nicodunks-youtube.jpg" alt="Nicodunks YouTube video thumbnail"><span class="play">▶</span></button><div class="dunks-callout"><span>thats me!</span></div></article>
    <article class="panel champion">${badge('HOT!')}<h2><button class="text-link" data-app="excel">${excelFeature.title}</button></h2><button class="photo-link" data-app="excel"><img src="${excelFeature.image}" alt="${excelFeature.title}"><span class="play">▶</span></button></article>
   </div>
   <div class="content-stack">
    <article class="panel xbench"><h2 class="xbench-title">Xbench</h2><p class="intro">${xbSub}</p><button class="photo-link project-photo" data-app="xbench"><img src="/assets/xbench-preview.png" alt="Xbench preview"></button></article>
    <article class="panel press"><a href="${pressUrl}" target="_blank" rel="noopener noreferrer"><img src="/assets/wsj-article.png" alt="WSJ Feature"></a><a href="${pressUrl}" target="_blank" rel="noopener noreferrer">Read in WSJ →</a></article>
   </div>
  </div>
    <article class="panel fruitless"><svg class="fruitless-fly" aria-hidden="true" viewBox="0 0 100 110"><g fill="none" stroke="#302421" stroke-width="4" stroke-linecap="round"><path d="M43 47 25 34 15 39M42 60 20 59 12 68M44 73 29 85 27 97M57 47 75 34 85 39M58 60 80 59 88 68M56 73 71 85 73 97"/></g><ellipse cx="50" cy="70" rx="15" ry="25" fill="#374638" stroke="#171b16" stroke-width="3"/><path d="M38 67h24M38 76h24M42 85h16" stroke="#8d995a" stroke-width="3"/><g class="fly-wing fly-wing-left"><ellipse cx="28" cy="42" rx="18" ry="32" transform="rotate(-32 28 42)" fill="#e1faff" fill-opacity=".85" stroke="#676cad" stroke-width="2"/><path d="M42 62 14 21M40 59 15 42" stroke="#98a7ca" stroke-width="1.5"/></g><g class="fly-wing fly-wing-right"><ellipse cx="72" cy="42" rx="18" ry="32" transform="rotate(32 72 42)" fill="#e1faff" fill-opacity=".85" stroke="#676cad" stroke-width="2"/><path d="M58 62 86 21M60 59 85 42" stroke="#98a7ca" stroke-width="1.5"/></g><ellipse cx="50" cy="43" rx="13" ry="17" fill="#26372a"/><ellipse cx="50" cy="25" rx="15" ry="12" fill="#3b3925"/><ellipse cx="39" cy="24" rx="8" ry="10" fill="#fa341d" stroke="#67160c" stroke-width="2"/><ellipse cx="61" cy="24" rx="8" ry="10" fill="#fa341d" stroke="#67160c" stroke-width="2"/><path d="M46 16 42 8M54 16 58 8" stroke="#201f19" stroke-width="3"/></svg><h2>Fruitless</h2><div class="fruitless-layout"><div class="fruitless-copy">
    <p>We used the measured MaleCNS wiring graph: 166,606 classified neurons and approximately 25.6 million connections.</p>
    <p>The experiment compares the same network receiving identical sensory inputs with <strong>one intervention: blocking mAL output</strong>.</p>
    <p><strong>In the setting shown in the chart, male-cue responses rose from zero to 1–5 spikes across three trials after mAL output was blocked.</strong></p>
    <a href="https://github.com/nicodunks/fruitless/blob/main/experiment/followup/RESULTS.md" target="_blank" rel="noopener noreferrer">full report</a></div><a class="fruitless-chart" href="/assets/fruitless-cue-response.png" target="_blank" rel="noopener noreferrer" aria-label="Open Fruitless response chart full size"><img src="/assets/fruitless-cue-response.png" alt="Across three trials, male-cue spikes rise from zero to 1, 4, and 5 after mAL output is blocked; female-cue spikes rise from 8–11 to 18–20." loading="lazy"></a></div></article>
  <div class="wall-gallery mobile-art" id="wall-mobile" aria-label="Visitor art"></div>
  <section class="paint-wall panel" id="paint-wall"><div class="wall-heading"></div><div id="inline-paint"></div><p class="wall-message" role="status">Loading drawings…</p></section>
 </section>
 <aside class="right-rail">
  <section class="mini-popup bevel"><div class="popup-title">Welcome <button aria-label="Close welcome" data-dismiss>×</button></div><div class="wordart">Welcome!</div><p>Make yourself at home</p></section>
  <div class="panel mail-panel"><h2>Email me</h2>${app('mail',glyph('mail','mail-art'))}<a href="mailto:${email}">${email}</a></div>
  <div class="cuban-cigar" role="img" aria-label="Deep-fried Cuban cigar, lit on the left, with smoke drifting upward"><div class="cigar-photo"><img src="/assets/cuban-cigar-real.png" alt="" loading="lazy"></div><svg class="cigar-smoke-overlay" viewBox="0 0 240 340" aria-hidden="true"><g fill="none" stroke="#f5eee1" stroke-linecap="round"><path class="real-smoke smoke-a" d="M100 330C70 290 134 265 96 218S130 156 91 109S82 43 110 8"/><path class="real-smoke smoke-b" d="M100 330C126 287 80 267 113 229S80 163 119 112S128 45 101 5"/><path class="real-smoke smoke-c" d="M100 330C95 302 60 270 98 235S145 190 113 151S70 80 91 12"/></g></svg></div>
  <section class="bevel inline-mines" aria-label="Playable Minesweeper"><div class="popup-title"><span>Minesweeper</span><span aria-hidden="true">💣</span></div><div class="minesweeper" data-inline="true"></div></section><div class="wall-gallery side-art" id="wall-right" aria-label="Visitor art, right wall"></div><div class="sand-trail-note sand-crop-circle" role="img" aria-label="An alien crop-circle symbol scratched into the sand"><svg viewBox="0 0 240 280" aria-hidden="true"><defs><g id="sand-alien-mark" fill="none" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="120" cy="145" rx="85" ry="78"/><ellipse cx="120" cy="145" rx="77" ry="70"/><path d="M120 67V32M120 223v29M35 145H16M205 145h19M60 89 45 72M180 89l15-17M61 201l-15 17M179 201l15 17"/><circle cx="120" cy="24" r="10"/><circle cx="120" cy="260" r="8"/><path d="M120 96C74 95 74 130 92 157L120 190 148 157C166 130 166 96 120 96Z"/><path d="M93 126Q111 127 112 149Q94 148 93 126ZM147 126Q129 127 128 149Q146 148 147 126ZM112 168q8 4 16 0"/></g></defs><use href="#sand-alien-mark" class="sand-etch-light" transform="translate(1.5 2.5)"/><use href="#sand-alien-mark" class="sand-etch-dark"/><use href="#sand-alien-mark" class="sand-etch-core"/></svg></div>
 </aside>
</div>
<dialog id="content-dialog"><div class="popup-title"><span>Nico Christie</span><button aria-label="Close" data-close-dialog>×</button></div><div class="dialog-content"></div></dialog>`;
// Real anchors make the entire linked card open its destination directly.
const cardLinks=[
 ['.shortcut',launchUrl],['.champion',excelFeature.url],
 ['.fruitless','https://github.com/nicodunks/fruitless'],['.xbench',xbUrl],['.research',research.doc.blocks.find(b=>b.type==='link').href],
 ['.dunks','https://www.youtube.com/watch?v=res17FLLcPM'],['.press',pressUrl],['.book',book.src]
];
for(const [selector,url] of cardLinks){
 const card=root.querySelector(selector);if(!card)continue;
 card.classList.add('linked-card');
 for(const button of card.querySelectorAll('button')){
  const link=document.createElement('a');link.className=button.className;link.innerHTML=button.innerHTML;
  if(button.hasAttribute('aria-label'))link.setAttribute('aria-label',button.getAttribute('aria-label'));
  link.href=url;link.target='_blank';link.rel='noopener noreferrer';button.replaceWith(link);
 }
 const cover=document.createElement('a');cover.className='card-hit-link';cover.href=url;cover.target='_blank';cover.rel='noopener noreferrer';
 cover.setAttribute('aria-label',`${card.querySelector('h2')?.textContent.trim()||'WSJ article'} — opens in a new tab`);card.prepend(cover);
}
const dialog = document.querySelector('#content-dialog');
function page(id){const p=pages.find(p=>p.id===id);if(!p)return;dialog.querySelector('.dialog-content').innerHTML=p.html;dialog.showModal();}
document.addEventListener('click',e=>{const b=e.target.closest('button,a');if(!b)return;if(b.dataset.app){if(dialog.open)dialog.close();if(b.dataset.app==='paint'){document.querySelector('#inline-paint').dispatchEvent(new Event('expand-paint'));document.querySelector('#inline-paint').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});}else openApp(b.dataset.app);}if(b.dataset.page)page(b.dataset.page);if(b.hasAttribute('data-nav')){e.preventDefault();page(b.dataset.nav)}if(b.hasAttribute('data-mail')){if(dialog.open)dialog.close();openApp('mail');}if(b.hasAttribute('data-book'))openItem(book);if(b.hasAttribute('data-research'))openItem(research);if(b.hasAttribute('data-trash'))openTrash();if(b.hasAttribute('data-dismiss'))b.closest('.mini-popup').remove();if(b.hasAttribute('data-close-dialog'))dialog.close();});
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});

// Live backend: verified browser sessions, with local previews counted separately.
recordVisit(document.querySelector('#visitor-count')).then(count=>{
 for(const p of pages)p.html=p.html.replace(/You are visitor <b>001,337<\/b>/g,`Visits <b>${count}</b>`);
}).catch(()=>{const counter=document.querySelector('#visitor-count');if(counter.textContent==='·······')counter.textContent='—';counter.title='Visit verification unavailable; showing the last total';});

// Low-resolution palette fire, rendered like an overcompressed 1990s GIF.
{
 const fire=document.querySelector('.fried-fire'),cx=fire.getContext('2d');
 const w=48,h=64,heat=new Float32Array(w*h),pixels=cx.createImageData(w,h);
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let lastFire=0,fireFrame;
 function burn(){
  for(let x=0;x<w;x++)heat[(h-1)*w+x]=Math.abs(x-w/2)<14?190+Math.random()*65:0;
  for(let y=0;y<h-1;y++)for(let x=0;x<w;x++){
   const drift=Math.floor(Math.random()*3)-1;
   const below=Math.min(w-1,Math.max(0,x+drift));
   heat[y*w+x]=Math.max(0,(heat[(y+1)*w+below]*2+heat[Math.min(h-1,y+2)*w+below])/3-3-Math.random()*5);
  }
  for(let i=0;i<heat.length;i++){
   const v=Math.floor(heat[i]/18)*18,j=i*4;
   pixels.data[j]=v<80?v*3.18:255;
   pixels.data[j+1]=v<90?0:Math.min(255,(v-90)*2.1);
   pixels.data[j+2]=v>205?Math.min(255,(v-205)*5):v<65?35:0;
   pixels.data[j+3]=v<24?0:Math.min(255,(v-24)*8);
  }
  cx.putImageData(pixels,0,0);
 }
 function flicker(t){if(t-lastFire>75){burn();lastFire=t;}if(!motion.matches&&!document.hidden)fireFrame=requestAnimationFrame(flicker);}
 function start(){cancelAnimationFrame(fireFrame);for(let i=0;i<80;i++)burn();if(!motion.matches&&!document.hidden)fireFrame=requestAnimationFrame(flicker);}
 motion.addEventListener('change',start);document.addEventListener('visibilitychange',start);start();
}

import "./paint-wall.js";

// On phones, reorganize the sidebar content into three columns in the main flow.
const mobileUtilities=document.createElement('div');mobileUtilities.className='mobile-utilities';
const utilityColumns=Array.from({length:3},()=>{const col=document.createElement('div');col.className='mobile-utility-column';mobileUtilities.append(col);return col;});
root.querySelector('.fruitless').before(mobileUtilities);
const mobileNav=document.createElement('div');mobileNav.className='mobile-social';root.querySelector('.sunset').before(mobileNav);
const mobileMoves=[];
for(const [selector,destination] of [
 ['.nav-stack',mobileNav],['.cuban-cigar',utilityColumns[0]],['.inline-mines',utilityColumns[0]],['.guadalupe-sticker',utilityColumns[0]],['.counter',utilityColumns[0]],['.paint-launch',utilityColumns[0]],
 ['.book',utilityColumns[1]],['.mail-panel',utilityColumns[1]]
]){const node=root.querySelector(selector),anchor=document.createComment('desktop placement');node.before(anchor);mobileMoves.push({node,anchor,destination});}
// Two continuous phone columns: each card follows the previous one, without row gaps.
const collage=root.querySelector('.feature-grid');
const phoneColumns=[0,1].map(()=>{const el=document.createElement('div');el.className='phone-stack';collage.append(el);return el;});
const phoneMoves=[];
for(const [column,selectors] of [
 [0,['.shortcut','.research','.champion','.cuban-cigar','.inline-mines','.guadalupe-sticker']],
 [1,['.dunks','.xbench','.press','.book','.mail-panel','.counter','.paint-launch']]
])for(const selector of selectors){const node=root.querySelector(selector),anchor=document.createComment('normal placement');node.before(anchor);phoneMoves.push({node,anchor,column});}
function arrangeMobileUtilities(){
 for(const {node,anchor} of phoneMoves)anchor.after(node);
 const mobile=document.documentElement.classList.contains('mobile-overview');
 for(const {node,anchor,destination} of mobileMoves){if(mobile)destination.append(node);else anchor.after(node);}
 const compact=window.innerWidth<=600;
 root.classList.toggle('phone-flow',compact);
 if(compact)for(const {node,column} of phoneMoves)phoneColumns[column].append(node);
}
window.addEventListener('overview-layout-change',arrangeMobileUtilities);arrangeMobileUtilities();
