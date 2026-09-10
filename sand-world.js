// One tiny inhabitant explores the sand and hops across the content.
const canvas = document.createElement('canvas');
canvas.id = 'sand-world';
canvas.setAttribute('aria-hidden', 'true');
document.body.append(canvas);
const ctx = canvas.getContext('2d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let width=0,height=0,worldHeight=0,blocks=[],walkers=[],tracks=[],last=0,frame;
let gesture=null,particles=[],craters=[],surfaces=[],ripples=[];
const hit=document.createElement('button');hit.id='walker-hit';hit.setAttribute('aria-label','Sand walker: grab and drag, then release to drop. Arrow keys to move.');hit.title='Grab me and drop me';document.body.append(hit);
const speech=document.createElement('div');speech.id='walker-speech';speech.setAttribute('role','status');speech.hidden=true;document.body.append(speech);
const colors=['#e84b45','#367dc9','#e6b629','#7856ac','#239b83','#e87aaf'];
function resize(){
 width=innerWidth;height=innerHeight;worldHeight=Math.max(height,document.documentElement.scrollHeight);
 const dpr=Math.min(devicePixelRatio||1,2);
 canvas.width=width*dpr;canvas.height=height*dpr;
 canvas.style.width=width+'px';canvas.style.height=height+'px';
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=false;
 obstacles();
 // Existing inhabitants keep their document coordinates through scrolling and layout changes.
 const spots=[];
 for(let y=24;y<height-50;y+=28)for(let x=9;x<width-9;x+=18)if(free(x+scrollX,y+scrollY))spots.push({x:x+scrollX,y:y+scrollY});
 while(walkers.length<1&&spots.length){
  const p=spots.splice(Math.floor(Math.random()*spots.length),1)[0];
  walkers.push({...p,angle:Math.random()*Math.PI*2,speed:9+Math.random()*7,phase:Math.random()*6,color:colors[walkers.length%colors.length],step:0,turn:Math.random()*4});
 }
}
function obstacles(){
 surfaces=[...document.querySelectorAll('.panel,.sunset')].filter(e=>e.getClientRects().length).map(el=>({el,rect:worldRect(el)}));
 blocks=[...document.querySelectorAll('.masthead,.bevel:not(.panel),.sticker,.ticker,.badge-strip,.portal-footer,.tiny-welcome,.rainbow-rule,.taskbar,.window')].filter(e=>e.getClientRects().length).map(worldRect);
}
function worldRect(el){const r=el.getBoundingClientRect();return {left:r.left+scrollX,right:r.right+scrollX,top:r.top+scrollY,bottom:r.bottom+scrollY};}
function surfaceAt(x,y){return [...surfaces].reverse().find(s=>x>s.rect.left&&x<s.rect.right&&y>s.rect.top&&y<s.rect.bottom)||null;}
function ripple(w,strong=false){
 const s=surfaceAt(w.x,w.y);if(!s||reduced.matches)return;
 ripples.push({x:w.x,y:w.y,age:0,strong,rect:s.rect});
 if(strong||!s.lastStep||performance.now()-s.lastStep>400){
  s.lastStep=performance.now();
  s.el.animate?.([{scale:'1 1'},{scale:strong?'1.015 .975':'1.003 .995',offset:.3},{scale:strong?'.995 1.01':'.999 1.002',offset:.65},{scale:'1 1'}],{duration:strong?550:260,easing:'ease-out'});
 }
}

function free(x,y){return x>8&&x<width-8&&y>22&&y<worldHeight-42&&!blocks.some(r=>x>r.left-7&&x<r.right+7&&y>r.top-5&&y<r.bottom+23);}
function person(w,time){
 const s=1.65, moving=!reduced.matches;
 const gait=moving?Math.sin(w.phase)*2:0;
 const reaction=w.reaction||0,lift=w.lift||0;
 ctx.save();ctx.translate(Math.round(w.x),Math.round(w.y));
 // The shadow stays on the sand while the little guy dangles overhead.
 const altitude=Math.min(1,lift/220);
 ctx.save();ctx.rotate(-.18);ctx.fillStyle=`rgba(65,40,24,${.32-altitude*.17})`;
 ctx.shadowColor='#4a2a29';ctx.shadowBlur=altitude*10;
 ctx.beginPath();ctx.ellipse(3,2,10+altitude*13,3+altitude*5,0,0,Math.PI*2);ctx.fill();ctx.restore();
 if(gesture?.dragging&&lift>60){ctx.save();ctx.strokeStyle='#73512d44';ctx.setLineDash([2,6]);ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(0,-lift+5);ctx.stroke();ctx.restore();}
 if(w.dropState==='impact'){ctx.beginPath();ctx.rect(-100,-150,200,154);ctx.clip();ctx.translate(0,19);}
 if(w.dropState==='crawl'){const progress=Math.min(1,w.stateTime/1.6);ctx.translate(0,Math.sin(progress*Math.PI)*5);ctx.rotate(Math.sin(progress*Math.PI)*-1.05);}
 if(w.dropState==='falling'&&!reduced.matches){ctx.strokeStyle='#fff5ba';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-9+i*9,-lift-40);ctx.lineTo(-9+i*9,-lift-60-Math.min(30,w.velocity*.04));ctx.stroke();}}

 ctx.translate(w.airX||0,-lift);
 if(w.dropState==='kicked'&&!reduced.matches)ctx.rotate(w.stateTime*15*w.kickDirection);
 if(gesture?.dragging&&!reduced.matches)ctx.rotate(Math.sin(time*.009)*.18);
 if(!reduced.matches&&reaction>0)ctx.rotate(Math.sin(reaction*15)*Math.min(reaction,.6)*.7);
 ctx.scale(s*(1+(w.squash||0)),s*(1-(w.squash||0)));
 const facing=Math.cos(w.angle)>0?1:-1;ctx.scale(facing,1);
 const px=(x,y,a,b,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),a,b)};
 px(-3,-5,2,5+gait,'#343e57');px(1,-5,2,5-gait,'#26324b');
 px(-3,gait,3,1,'#eee2c7');px(1,-gait,3,1,'#eee2c7');
 px(-4,-12,8,7,w.color);px(-4,-12,2,7,'#00000020');
 const flail=(gesture?.dragging||w.dropState==='falling')?-5:0;
 px(-6,-11+flail,2,6-gait,'#d4a17e');px(4,-11+flail,2,6+gait,'#eac09a');
 px(-3,-18,6,6,'#eac09a');px(-3,-18,6,2,'#49352c');px(-3,-16,1,2,'#49352c');
 px(2,-15,1,1,'#292a35');
 ctx.restore();
}
function draw(now){
 const dt=Math.min((now-last)/1000||0,.05);last=now;
 ctx.clearRect(0,0,width,height);
 ctx.save();ctx.translate(-scrollX,-scrollY);
 for(const w of walkers){
  w.reaction=Math.max(0,(w.reaction||0)-dt);w.squash=Math.max(0,(w.squash||0)-dt*.8);
  if(gesture?.dragging)continue;
  if(w.dropState==='falling'){
   w.velocity+=dt*1050;w.lift=Math.max(0,w.lift-w.velocity*dt);
   w.airX=(w.startAirX||0)*(w.lift/w.dropHeight);
   if(w.lift===0)impact(w);
  }else if(w.dropState==='kicked'){
   w.stateTime+=dt;const t=Math.min(1,w.stateTime/1.05);
   w.x=w.kickFrom.x+(w.kickTo.x-w.kickFrom.x)*t;w.y=w.kickFrom.y+(w.kickTo.y-w.kickFrom.y)*t;
   w.lift=Math.sin(t*Math.PI)*155;
   if(t===1)impact(w);
  }else if(w.dropState==='hop'){
   w.stateTime+=dt;const t=Math.min(1,w.stateTime/.52);
   w.x=w.hopFrom.x+(w.hopTo.x-w.hopFrom.x)*t;w.y=w.hopFrom.y+(w.hopTo.y-w.hopFrom.y)*t;
   w.lift=Math.sin(t*Math.PI)*32;
   if(t===1){w.lift=0;w.dropState=null;w.squash=.12;ripple(w,true);}
  }else if(w.dropState==='impact'){
   w.stateTime+=dt;if(w.stateTime>.65){w.dropState='crawl';w.stateTime=0;w.crawlFrom={x:w.x,y:w.y};w.crawlTo=landing(w.x+36,w.y+19);}
  }else if(w.dropState==='crawl'){
   w.stateTime+=dt;const t=Math.min(1,w.stateTime/1.6),ease=t*t*(3-2*t);
   w.x=w.crawlFrom.x+(w.crawlTo.x-w.crawlFrom.x)*ease;w.y=w.crawlFrom.y+(w.crawlTo.y-w.crawlFrom.y)*ease;w.phase+=dt*18;
   if(t===1){w.dropState=null;w.reaction=.7;w.squash=.12;w.angle=Math.atan2(w.crawlTo.y-w.crawlFrom.y,w.crawlTo.x-w.crawlFrom.x);}
  }else{w.lift=Math.max(0,(w.lift||0)-dt*110);if(w.lift===0&&w.wasLifted){w.wasLifted=false;w.squash=.22;dust(w);}}
 }

 if(!reduced.matches){
  for(const w of walkers){
   if(gesture||w.dropState||(w.reaction||0)>0||(w.lift||0)>0)continue;
   w.turn-=dt;if(w.turn<0){if(surfaces.length&&Math.random()<.7){const target=surfaces[Math.floor(Math.random()*surfaces.length)].rect;w.angle=Math.atan2((target.top+target.bottom)/2-w.y,(target.left+target.right)/2-w.x);}else w.angle+=(Math.random()-.5)*1.1;w.turn=3+Math.random()*5;}
   const nx=w.x+Math.cos(w.angle)*w.speed*dt,ny=w.y+Math.sin(w.angle)*w.speed*dt;
   if(free(nx,ny)){
    const before=surfaceAt(w.x,w.y),after=surfaceAt(nx,ny);
    if(before?.el!==after?.el){
     const target={x:w.x+Math.cos(w.angle)*25,y:w.y+Math.sin(w.angle)*25};
     if(free(target.x,target.y)){w.dropState='hop';w.stateTime=0;w.hopFrom={x:w.x,y:w.y};w.hopTo=target;continue;}
    }
    w.x=nx;w.y=ny;w.phase+=dt*8;w.step+=dt;
    if(w.step>.48){if(surfaceAt(w.x,w.y))ripple(w);else tracks.push({x:w.x+Math.cos(w.angle+Math.PI/2)*(Math.sin(w.phase)>0?2:-2),y:w.y,angle:w.angle,life:1,side:Math.sin(w.phase)>0?1:-1});w.step=0;}
   }else{w.angle+=Math.PI*.65;}
  }
 }
 // Layered compressed sand, recessed soles and a sunlit displaced rim.
 for(const t of tracks){
  t.life-=dt/110;if(t.life<=0)continue;
  ctx.save();ctx.translate(t.x,t.y);ctx.rotate(t.angle);
  ctx.globalAlpha=Math.min(1,t.life*2);
  ctx.fillStyle='#9c754437';ctx.beginPath();ctx.ellipse(0,0,5.7,3.5,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f5dfb0a8';ctx.beginPath();ctx.ellipse(.4,1,3.8,2.4,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#715130b8';ctx.beginPath();ctx.ellipse(-.3,-.35,3.7,2,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#aa8054';ctx.beginPath();ctx.ellipse(.5,.25,2.8,1.25,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#63452490';ctx.fillRect(-2,-1,1,1.8);ctx.fillRect(0,-1,1,1.8);
  ctx.restore();
 }
 tracks=tracks.filter(t=>t.life>0).slice(-1400);
 for(const c of craters){c.age+=dt;paintCrater(c);}
 craters=craters.filter(c=>c.age<30).slice(-8);
 for(const r of ripples){
  r.age+=dt;const t=r.age/(r.strong?.85:.48);if(t>=1)continue;
  ctx.save();ctx.beginPath();ctx.rect(r.rect.left,r.rect.top,r.rect.width,r.rect.height);ctx.clip();
  ctx.globalAlpha=(1-t)*.7;ctx.lineWidth=r.strong?2.5:1.5;
  for(let ring=0;ring<2;ring++){const size=4+t*(r.strong?100:32)+ring*6;ctx.strokeStyle=ring?'#ff38c8':'#19d8ff';ctx.beginPath();ctx.ellipse(r.x,r.y,size,size*.4,0,0,Math.PI*2);ctx.stroke();}
  ctx.restore();
 }
 ripples=ripples.filter(r=>r.age<(r.strong?.85:.48)).slice(-20);
 walkers.sort((a,b)=>a.y-b.y).forEach(w=>person(w,now));
 const w=walkers[0];
 if(w){hit.hidden=false;hit.style.left=(w.x+(w.airX||0)-21-scrollX)+'px';hit.style.top=(w.y-38-(w.lift||0)-scrollY)+'px';
 speech.style.left=Math.max(4,Math.min(width-65,w.x+14-scrollX))+'px';speech.style.top=Math.max(4,w.y-73-(w.lift||0)-scrollY)+'px';speech.hidden=!(w.reaction>0)||w.y-scrollY<0||w.y-scrollY>height;}
 else hit.hidden=true;
 for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=70*dt;ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size||3,p.size||3);}ctx.globalAlpha=1;particles=particles.filter(p=>p.life>0);
 ctx.restore();
 if(!reduced.matches||gesture||particles.length||walkers.some(w=>w.dropState||w.reaction>0||w.lift>0||w.squash>0))frame=requestAnimationFrame(draw);
}
let queued=false;
function refresh(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;resize();if(reduced.matches)draw(performance.now());});}
addEventListener('resize',refresh);
// Scrolling changes the camera only, never the walker or his trails.
addEventListener('scroll',()=>{obstacles();if(reduced.matches)wake();},{passive:true});
new ResizeObserver(refresh).observe(document.querySelector('#portal'));
new MutationObserver(()=>{obstacles();}).observe(document.querySelector('#screen'),{childList:true,subtree:true,attributes:true,attributeFilter:['style']});
reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);last=0;draw(performance.now());});
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(frame);else{last=0;draw(performance.now());}});
resize();frame=requestAnimationFrame(draw);

function dust(w){if(reduced.matches)return;for(let i=0;i<14;i++)particles.push({x:w.x,y:w.y-4,vx:(Math.random()-.5)*80,vy:-Math.random()*55,life:.5+Math.random()*.4,color:i%3?'#b98e56':'#fff0be'});}
function wake(){cancelAnimationFrame(frame);last=0;frame=requestAnimationFrame(draw);}
function landing(x,y){if(free(x,y))return{x,y};for(let r=8;r<Math.max(width,worldHeight);r+=8)for(let a=0;a<Math.PI*2;a+=.3){const nx=x+Math.cos(a)*r,ny=y+Math.sin(a)*r;if(free(nx,ny))return{x:nx,y:ny};}return {x:12,y:50};}
hit.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();const w=walkers[0];if(!w)return;gesture={id:e.pointerId,x:e.clientX+scrollX,y:e.clientY+scrollY,ox:w.x+(w.airX||0),oy:w.y-(w.lift||0),dragging:false};hit.setPointerCapture(e.pointerId);hit.blur();});
hit.addEventListener('pointermove',e=>{
 if(!gesture||gesture.id!==e.pointerId)return;const w=walkers[0];
 if(Math.hypot(e.clientX+scrollX-gesture.x,e.clientY+scrollY-gesture.y)>5)gesture.dragging=true;
 if(gesture.dragging){
  w.dropState=null;w.airX=0;w.reaction=0;
  w.x=Math.max(12,Math.min(width-12,gesture.ox+e.clientX+scrollX-gesture.x));
  const puppetY=Math.max(36,Math.min(worldHeight-70,gesture.oy+e.clientY+scrollY-gesture.y));
  w.y=Math.min(worldHeight-46,puppetY+220);w.lift=w.y-puppetY;
  w.wasLifted=false;hit.classList.add('dragging');wake();
 }
});
function release(e,cancelled=false){
 if(!gesture||gesture.id!==e.pointerId)return;const wasDrag=gesture.dragging;gesture=null;hit.classList.remove('dragging');hit.blur();
 if(hit.hasPointerCapture(e.pointerId))hit.releasePointerCapture(e.pointerId);
 const w=walkers[0];
 if(wasDrag){
  obstacles();const visualX=w.x,visualY=w.y-w.lift;Object.assign(w,landing(w.x,w.y));
  w.lift=Math.max(0,w.y-visualY);w.startAirX=visualX-w.x;w.airX=w.startAirX;
  w.dropHeight=Math.max(1,w.lift);w.velocity=0;w.wasLifted=false;w.stateTime=0;
  if(cancelled){w.lift=0;w.airX=0;w.dropState=null;}
  else if(reduced.matches){impact(w);w.dropState=null;w.squash=0;}
  else w.dropState='falling';
  wake();
 }
}

hit.addEventListener('pointerup',e=>release(e));hit.addEventListener('pointercancel',e=>release(e,true));
hit.addEventListener('lostpointercapture',e=>release(e,true));

hit.addEventListener('keydown',e=>{const delta={ArrowLeft:[-18,0],ArrowRight:[18,0],ArrowUp:[0,-18],ArrowDown:[0,18]}[e.key];if(!delta)return;e.preventDefault();const w=walkers[0];if(w.dropState||gesture)return;Object.assign(w,landing(w.x+delta[0],w.y+delta[1]));dust(w);wake();});

function impact(w){
 w.lift=0;w.airX=0;w.dropState='impact';w.stateTime=0;w.reaction=2.9;
 speech.textContent='wth';
 if(surfaceAt(w.x,w.y)){w.dropState=null;w.reaction=1.2;w.squash=.24;ripple(w,true);dust(w);return;}
 craters.push({x:w.x,y:w.y,age:0});
 if(!reduced.matches)for(let i=0;i<44;i++){
  const a=Math.random()*Math.PI*2,speed=35+Math.random()*110;
  particles.push({x:w.x,y:w.y-3,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed*.45-35,life:.65+Math.random()*.7,size:2+Math.random()*5,color:['#e7c896','#b88b53','#fff1c4','#94704a'][i%4]});
 }
}
function paintCrater(c){
 ctx.save();ctx.translate(c.x,c.y);ctx.globalAlpha=Math.min(1,(30-c.age)/5);
 const pop=reduced.matches?1:Math.min(1,c.age*10);ctx.scale(pop,pop);
 ctx.fillStyle='#86603b38';ctx.beginPath();ctx.ellipse(3,6,36,17,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#f2d19a';ctx.strokeStyle='#987044';ctx.lineWidth=2;
 ctx.beginPath();
 for(let i=0;i<=24;i++){const a=i/24*Math.PI*2,r=i%2?1:.86;const x=Math.cos(a)*33*r,y=Math.sin(a)*15*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle='#705137';ctx.beginPath();ctx.ellipse(0,0,25,10,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#382e25';ctx.beginPath();ctx.ellipse(-2,-2,20,7,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#ffe7b1';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,2,28,11,0,.1,Math.PI-.1);ctx.stroke();
 ctx.strokeStyle='#9a734958';ctx.lineWidth=1;
 for(let i=0;i<7;i++){const a=i*Math.PI*2/7;ctx.beginPath();ctx.moveTo(Math.cos(a)*33,Math.sin(a)*15);ctx.lineTo(Math.cos(a)*42,Math.sin(a)*23);ctx.lineTo(Math.cos(a+.1)*47,Math.sin(a+.1)*25);ctx.stroke();}
 if(c.age<.5&&!reduced.matches){ctx.globalAlpha*=1-c.age*2;ctx.strokeStyle='#fff2c5';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,33+c.age*70,15+c.age*35,0,0,Math.PI*2);ctx.stroke();}
 ctx.restore();
}
