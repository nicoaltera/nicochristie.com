import {apiUrl,challenge,canvasPixels} from './backend-client.js';
import {createInlinePaint} from './assets/index-XbenchA1.js';
// Use the existing Paint tools; posts persist in the local preview database.
let galleries, message;
function arrangeArt(){
 const left=document.querySelector('#wall-left'),right=document.querySelector('#wall-right'),mobile=document.querySelector('#wall-mobile');
 if(!left||!right||!mobile)return;
 const drawings=[...document.querySelectorAll('.wall-drawing')].sort((a,b)=>Number(a.dataset.wallOrder)-Number(b.dataset.wallOrder));
 const isMobile=document.documentElement.classList.contains('mobile-overview');
 drawings.forEach((item,i)=>(isMobile?mobile:i%2?right:left).append(item));
}
window.addEventListener('overview-layout-change',arrangeArt);
async function loadWall(){
 galleries=[document.querySelector('#wall-left'),document.querySelector('#wall-right')];message=document.querySelector('.wall-message');
 if(galleries.some(g=>!g))return;
 try{
  const r=await fetch(apiUrl('/api/wall'));if(!r.ok)throw new Error();const {posts}=await r.json();
  galleries.forEach(g=>g.replaceChildren());document.querySelector('#wall-mobile')?.replaceChildren();
  let index=0;
  for(const post of posts){
   const item=document.createElement('figure');item.className='wall-drawing';item.id='wall-post-'+post.id;item.dataset.wallOrder=String(index);
   // Stable variation: each drawing keeps its placement when the wall refreshes.
   let seed=0;for(const char of post.id)seed=(Math.imul(seed,31)+char.charCodeAt(0))>>>0;
   item.style.setProperty('--art-tilt',`${(seed%91-45)/10}deg`);
   item.style.setProperty('--art-offset',`${(seed>>>8)%25}px`);
   item.style.setProperty('--art-width',`${96+(seed>>>16)%5}%`);
   const link=document.createElement('a');link.href=post.image;link.target='_blank';link.rel='noopener';
   const img=document.createElement('img');img.src=post.image;img.alt=post.title;img.loading='lazy';link.append(img);
   const caption=document.createElement('figcaption');const title=document.createElement('strong');title.textContent=post.title;
   const byline=document.createElement('span');byline.textContent=`${post.name} · ${new Date(post.created_at.endsWith('Z')?post.created_at:post.created_at+'Z').toLocaleDateString()}`;
   caption.append(title,byline);item.append(link,caption);galleries[index++%2].append(item);
  }
  arrangeArt();
  message.textContent=posts.length?'':'Your drawing could be the first. Open Paint, make something, and post it here.';
 }catch{message.textContent='Could not load the wall. ';const retry=document.createElement('button');retry.textContent='Try again';retry.addEventListener('click',loadWall);message.append(retry);}
}
function addPosting(paint){
 if(paint.dataset.wallReady)return;paint.dataset.wallReady='true';
 const canvas=paint.querySelector('.paint-canvas');if(!canvas)return;
 const inlineHost=paint.closest('#inline-paint');
 let setCollapsed=()=>{};
 const form=document.createElement('form');form.className='paint-post';
 form.innerHTML='<label>Title (optional) <input name="title" maxlength="80" placeholder="Untitled masterpiece"></label><label>Your name (optional) <input name="name" maxlength="40" placeholder="Anonymous"></label><button type="submit">Post to my wall →</button><span class="paint-post-status" role="status"></span>';
 if(paint.closest('#inline-paint')){
  form.id='wall-post-form';
  const heading=document.querySelector('.wall-heading');
  const submit=form.querySelector('button');submit.textContent='Post to the site!';submit.className='pink-button';
  heading.replaceChildren(form);
  const toggle=document.createElement('button');toggle.type='button';toggle.className='pink-button paint-expand';toggle.hidden=true;
  toggle.setAttribute('aria-controls','inline-paint');toggle.setAttribute('aria-expanded','true');heading.append(toggle);
  setCollapsed=collapsed=>{
   inlineHost.hidden=collapsed;heading.classList.toggle('paint-collapsed',collapsed);
   toggle.hidden=false;toggle.textContent=collapsed?'🎨 Paint something else ↓':'Collapse Paint ↑';
   toggle.setAttribute('aria-expanded',String(!collapsed));
  };
  toggle.addEventListener('click',()=>setCollapsed(!inlineHost.hidden));
  inlineHost.addEventListener('expand-paint',()=>setCollapsed(false));
  const palette=paint.querySelector('.paint-palette');
  if(palette)paint.querySelector('.paint-tools').append(palette);
  paint.querySelectorAll('.status-bar').forEach(row=>row.remove());
 }else paint.insertBefore(form,paint.querySelector('.paint-main'));
 let posting=false,requestId=null,lastSnapshot=null;
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(posting)return;
  const status=form.querySelector('.paint-post-status'),button=form.querySelector('button');
  const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
  let marked=false;for(let i=0;i<pixels.length;i+=4){if(pixels[i]<250||pixels[i+1]<250||pixels[i+2]<250){marked=true;break;}}
  if(!marked){status.textContent='Paint something first!';return;}
  const data={pixels:canvasPixels(canvas),title:form.elements.title.value.trim()||'Untitled masterpiece',name:form.elements.name.value.trim()||'Anonymous'};
  const snapshot=JSON.stringify(data);if(snapshot!==lastSnapshot){requestId=crypto.randomUUID();lastSnapshot=snapshot;}
  posting=true;button.disabled=true;status.textContent='Posting…';
  try{
   const token=await challenge('post',form);
   const r=await fetch(apiUrl('/api/wall'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,request_id:requestId,token})});
   if(!r.ok)throw new Error((await r.json()).error||'Could not post drawing.');
   const saved=await r.json();
   status.textContent='Posted to the wall!';await loadWall();
   if(inlineHost)setCollapsed(true);
   const view=document.createElement('button');view.type='button';view.textContent='See it on the wall';view.addEventListener('click',()=>{
    paint.closest('.window')?.querySelector('button[aria-label="Minimize"]')?.click();(document.getElementById('wall-post-'+saved.id)||document.querySelector('#paint-wall')).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
   });status.append(' ',view);
  }catch(err){status.textContent=err.message==='Failed to fetch'?'Could not reach the local server. Try posting again.':err.message;}
  finally{posting=false;button.disabled=false;}
 });
}
function scan(){document.querySelectorAll('.app.paint').forEach(addPosting);}
new MutationObserver(scan).observe(document.querySelector('#screen'),{subtree:true,childList:true});
// Module imports evaluate before the portal creates its markup.
queueMicrotask(()=>{const host=document.querySelector('#inline-paint');if(host){const paint=createInlinePaint(host);host.append(paint);addPosting(paint);}loadWall();scan();});
