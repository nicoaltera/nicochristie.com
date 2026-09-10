import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {inflateSync} from 'node:zlib';
import worker,{makePng} from './worker.mjs';
const origin='https://nicochristie.com';
function fixture(){
 const sql=new DatabaseSync(':memory:');sql.exec(readFileSync(new URL('./migrations/0001.sql',import.meta.url),'utf8'));sql.exec(readFileSync(new URL('./migrations/0002_starting_count.sql',import.meta.url),'utf8'));
 const DB={prepare(query){const stmt=sql.prepare(query);let args=[];return {bind(...values){args=values.map(x=>x instanceof ArrayBuffer?new Uint8Array(x):x);return this;},async first(){return stmt.get(...args)||null},async all(){return {results:stmt.all(...args)}},async run(){return stmt.run(...args)}}}};
 const env={DB,ALLOWED_ORIGINS:origin+',http://127.0.0.1:8765',IP_SECRET:'test-only-secret',TURNSTILE_SECRET:'test-secret',TURNSTILE_SITEKEY:'test-sitekey',POST_LIMIT:{limit:async()=>({success:true})},VISIT_LIMIT:{limit:async()=>({success:true})}};
 const request=(path,data,extra={})=>worker.fetch(new Request('https://api.example'+path,{method:data?'POST':'GET',headers:{origin,'content-type':'application/json','cf-connecting-ip':'192.0.2.1',...extra},body:data?JSON.stringify(data):undefined}),env);
 return {sql,env,request};
}
const rgb=new Uint8Array(800*560*3).fill(255);rgb.fill(0,0,1200);const pixels=Buffer.from(rgb).toString('base64');
function mockTurnstile(t,overrides={}){t.mock.method(globalThis,'fetch',async()=>Response.json({success:true,hostname:'nicochristie.com',action:'post',...overrides}));}
test('server creates a valid bounded PNG solely from RGB pixels',async()=>{
 const png=await makePng(pixels);assert.deepEqual([...png.slice(0,8)],[137,80,78,71,13,10,26,10]);assert(png.length<256000);
 const view=new DataView(png.buffer);assert.equal(view.getUint32(16),800);assert.equal(view.getUint32(20),560);
 const length=view.getUint32(33);const raw=inflateSync(png.slice(41,41+length));assert.equal(raw.length,800*560*3+560);assert.equal(raw[1],0);assert.equal(raw.at(-1),255);
 await assert.rejects(()=>makePng('data:image/svg+xml,<script>'),/Invalid/);
 await assert.rejects(()=>makePng(Buffer.alloc(rgb.length,255).toString('base64')),/Paint something/);
});
test('write requires exact origin and bot verification, and rejects oversized body',async()=>{
 const {request}=fixture();const data={request_id:crypto.randomUUID(),pixels,token:''};
 assert.equal((await request('/api/wall',data,{origin:'https://evil.example'})).status,403);
 assert.equal((await request('/api/wall',data)).status,403);
 assert.equal((await request('/api/wall',data,{'content-length':'9000000'})).status,413);
});
test('posting, retry deduplication, image serving, and untrusted text stay safe',async t=>{
 mockTurnstile(t);const {request,sql}=fixture();const data={request_id:crypto.randomUUID(),pixels,token:'verified',title:'<script>alert(1)</script>',name:"Robert'); DROP TABLE wall_posts;--"};
 const response=await request('/api/wall',data);assert.equal(response.status,201);const {id}=await response.json();
 assert.equal((await request('/api/wall',data)).status,200);assert.equal(sql.prepare('SELECT COUNT(*) n FROM wall_posts').get().n,1);
 const listing=await (await request('/api/wall')).json();assert.equal(listing.posts[0].title,data.title);assert(!('ip_hash' in listing.posts[0]));assert.equal(listing.posts[0].image,'https://api.example/api/wall/image/'+id);
 const image=await request('/api/wall/image/'+id);assert.equal(image.status,200);assert.equal(image.headers.get('content-type'),'image/png');assert.equal(image.headers.get('x-content-type-options'),'nosniff');assert.match(image.headers.get('content-security-policy'),/sandbox/);
 const bytes=sql.prepare('SELECT bytes FROM wall_storage').get().bytes;assert(bytes>0);sql.prepare('DELETE FROM wall_posts WHERE id=?').run(id);assert.equal(sql.prepare('SELECT bytes FROM wall_storage').get().bytes,0);
});
test('wrong Turnstile hostname/action rejected',async t=>{
 mockTurnstile(t,{hostname:'evil.example'});const {request}=fixture();assert.equal((await request('/api/wall',{request_id:crypto.randomUUID(),pixels,token:'bad'})).status,403);
});
test('visit count is atomic, refresh-safe and independent of previews',async t=>{
 mockTurnstile(t,{action:'visit'});const {request,sql}=fixture();const data={session:crypto.randomUUID(),token:'ok'};
 const responses=await Promise.all(Array.from({length:8},()=>request('/api/visits',data)));assert(responses.every(r=>r.ok));
 assert.equal(sql.prepare("SELECT count FROM totals WHERE scope='public'").get().count,724);assert.equal(sql.prepare("SELECT count FROM totals WHERE scope='preview'").get().count,723);
 assert.equal((await request('/api/visits',{session:data.session})).status,200);
});
test('database enforces daily limits even under concurrent attempts',async t=>{
 mockTurnstile(t);const {request,sql}=fixture();const first=await (await request('/api/wall',{request_id:crypto.randomUUID(),pixels,token:'ok'})).json();
 const row=sql.prepare('SELECT * FROM wall_posts WHERE id=?').get(first.id);
 const insert=sql.prepare('INSERT INTO wall_posts VALUES(?,?,?,?,?,?,?)');
 for(let i=1;i<50;i++)insert.run(crypto.randomUUID(),crypto.randomUUID(),'test','test',row.image,row.ip_hash,row.created_at);
 const attempts=await Promise.all(Array.from({length:3},()=>request('/api/wall',{request_id:crypto.randomUUID(),pixels,token:'ok'})));
 assert(attempts.every(r=>r.status===429));assert.equal(sql.prepare('SELECT COUNT(*) n FROM wall_posts').get().n,50);
});
test('edge limiter rejects requests before parsing or database writes',async()=>{
 const {env,request,sql}=fixture();env.POST_LIMIT.limit=async()=>({success:false});assert.equal((await request('/api/wall',{request_id:crypto.randomUUID()})).status,429);assert.equal(sql.prepare('SELECT COUNT(*) n FROM wall_posts').get().n,0);
});
