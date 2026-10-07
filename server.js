
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __dirname=path.dirname(fileURLToPath(import.meta.url)), PORT=3000;
const db=new DatabaseSync(path.join(__dirname,"data","equilibrio.db"));
db.exec(`
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(
 id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE COLLATE NOCASE,
 password_hash TEXT NOT NULL,password_salt TEXT NOT NULL,goal TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS checkins(
 id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,date TEXT NOT NULL,
 mood TEXT NOT NULL,craving INTEGER NOT NULL CHECK(craving BETWEEN 0 AND 10),trigger TEXT,
 consumption TEXT NOT NULL,support_needed INTEGER DEFAULT 0,notes TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(user_id,date),FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS trigger_logs(
 id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,date TEXT NOT NULL,place TEXT,
 people TEXT,feeling TEXT,thought TEXT,action TEXT,helped TEXT,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS prevention_plans(
 user_id INTEGER PRIMARY KEY,triggers TEXT,coping TEXT,contacts TEXT,safe_places TEXT,
 activities TEXT,reasons TEXT,professional TEXT,updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS trusted_contacts(
 id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,name TEXT NOT NULL,phone TEXT,email TEXT,
 consent INTEGER DEFAULT 0,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS reminders(
 id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,title TEXT NOT NULL,time TEXT NOT NULL,
 enabled INTEGER DEFAULT 1,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
`);
const sessions=new Map();
const send=(res,status,data)=>{res.writeHead(status,{"Content-Type":"application/json","Cache-Control":"no-store"});res.end(JSON.stringify(data))};
const fail=(res,s,m)=>send(res,s,{error:m});
async function body(req){let x="";for await(const c of req)x+=c;return x?JSON.parse(x):{}}
function password(password,salt=crypto.randomBytes(16).toString("hex")){return{salt,hash:crypto.scryptSync(password,salt,64).toString("hex")}}
function validPassword(p,h,s){const a=Buffer.from(password(p,s).hash,"hex"),b=Buffer.from(h,"hex");return a.length===b.length&&crypto.timingSafeEqual(a,b)}
function auth(req){return sessions.get((req.headers.authorization||"").replace("Bearer ",""))?.userId||null}
function guard(req,res){const id=auth(req);if(!id)fail(res,401,"Sessão inválida ou expirada.");return id}
const today=()=>new Date().toISOString().slice(0,10);
async function api(req,res){
 const u=new URL(req.url,`http://${req.headers.host}`),r=u.pathname;
 if(req.method==="POST"&&r==="/api/register"){
  const d=await body(req),name=String(d.name||"").trim(),email=String(d.email||"").trim().toLowerCase(),p=String(d.password||"");
  if(!name||!email||p.length<6)return fail(res,400,"Nome, e-mail e senha de pelo menos 6 caracteres são obrigatórios.");
  if(db.prepare("SELECT id FROM users WHERE email=?").get(email))return fail(res,409,"Este e-mail já está cadastrado.");
  const x=password(p),q=db.prepare("INSERT INTO users(name,email,password_hash,password_salt,goal) VALUES(?,?,?,?,?)").run(name,email,x.hash,x.salt,d.goal||null);
  const t=crypto.randomBytes(32).toString("hex");sessions.set(t,{userId:Number(q.lastInsertRowid)});
  return send(res,201,{token:t,user:{id:Number(q.lastInsertRowid),name,email,goal:d.goal||null}});
 }
 if(req.method==="POST"&&r==="/api/login"){
  const d=await body(req),email=String(d.email||"").trim().toLowerCase(),p=String(d.password||""),u=db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if(!u)return fail(res,401,"E-mail não cadastrado.");
  if(!validPassword(p,u.password_hash,u.password_salt))return fail(res,401,"Senha incorreta.");
  const t=crypto.randomBytes(32).toString("hex");sessions.set(t,{userId:u.id});
  return send(res,200,{token:t,user:{id:u.id,name:u.name,email:u.email,goal:u.goal}});
 }
 const id=guard(req,res);if(!id)return;
 if(r==="/api/me")return send(res,200,{user:db.prepare("SELECT id,name,email,goal,created_at FROM users WHERE id=?").get(id)});
 if(r==="/api/goal"&&req.method==="PUT"){const d=await body(req);db.prepare("UPDATE users SET goal=? WHERE id=?").run(String(d.goal||""),id);return send(res,200,{ok:true})}
 if(r==="/api/checkins"&&req.method==="GET")return send(res,200,{checkins:db.prepare("SELECT * FROM checkins WHERE user_id=? ORDER BY date DESC").all(id)});
 if(r==="/api/checkins"&&req.method==="POST"){
  const d=await body(req),c=Number(d.craving);
  if(!d.mood||c<0||c>10||!d.consumption)return fail(res,400,"Preencha humor, vontade e consumo.");
  db.prepare(`INSERT INTO checkins(user_id,date,mood,craving,trigger,consumption,support_needed,notes) VALUES(?,?,?,?,?,?,?,?)
  ON CONFLICT(user_id,date) DO UPDATE SET mood=excluded.mood,craving=excluded.craving,trigger=excluded.trigger,
  consumption=excluded.consumption,support_needed=excluded.support_needed,notes=excluded.notes`)
  .run(id,d.date||today(),d.mood,c,d.trigger||"",d.consumption,d.supportNeeded?1:0,d.notes||"");
  return send(res,201,{ok:true,highCraving:c>=7});
 }
 if(r.startsWith("/api/checkins/")&&req.method==="DELETE"){db.prepare("DELETE FROM checkins WHERE id=? AND user_id=?").run(Number(r.split("/").pop()),id);return send(res,200,{ok:true})}
 if(r==="/api/triggers"&&req.method==="GET")return send(res,200,{triggers:db.prepare("SELECT * FROM trigger_logs WHERE user_id=? ORDER BY id DESC").all(id)});
 if(r==="/api/triggers"&&req.method==="POST"){const d=await body(req);db.prepare("INSERT INTO trigger_logs(user_id,date,place,people,feeling,thought,action,helped) VALUES(?,?,?,?,?,?,?,?)").run(id,d.date||today(),d.place||"",d.people||"",d.feeling||"",d.thought||"",d.action||"",d.helped||"");return send(res,201,{ok:true})}
 if(r==="/api/plan"&&req.method==="GET")return send(res,200,{plan:db.prepare("SELECT * FROM prevention_plans WHERE user_id=?").get(id)||null});
 if(r==="/api/plan"&&req.method==="PUT"){const d=await body(req);db.prepare(`INSERT INTO prevention_plans(user_id,triggers,coping,contacts,safe_places,activities,reasons,professional) VALUES(?,?,?,?,?,?,?,?)
 ON CONFLICT(user_id) DO UPDATE SET triggers=excluded.triggers,coping=excluded.coping,contacts=excluded.contacts,safe_places=excluded.safe_places,activities=excluded.activities,reasons=excluded.reasons,professional=excluded.professional,updated_at=CURRENT_TIMESTAMP`)
 .run(id,d.triggers||"",d.coping||"",d.contacts||"",d.safePlaces||"",d.activities||"",d.reasons||"",d.professional||"");return send(res,200,{ok:true})}
 if(r==="/api/contact"&&req.method==="GET")return send(res,200,{contacts:db.prepare("SELECT id,name,phone,email,consent FROM trusted_contacts WHERE user_id=?").all(id)});
 if(r==="/api/contact"&&req.method==="POST"){const d=await body(req);if(!d.name||!d.consent)return fail(res,400,"Nome e consentimento são obrigatórios.");db.prepare("INSERT INTO trusted_contacts(user_id,name,phone,email,consent) VALUES(?,?,?,?,?)").run(id,d.name,d.phone||"",d.email||"",1);return send(res,201,{ok:true})}
 if(r==="/api/reminders"&&req.method==="GET")return send(res,200,{reminders:db.prepare("SELECT * FROM reminders WHERE user_id=?").all(id)});
 if(r==="/api/reminders"&&req.method==="POST"){const d=await body(req);db.prepare("INSERT INTO reminders(user_id,title,time,enabled) VALUES(?,?,?,1)").run(id,d.title||"Check-in diário",d.time||"20:00");return send(res,201,{ok:true})}
 if(r==="/api/export"&&req.method==="GET")return send(res,200,{
  user:db.prepare("SELECT id,name,email,goal,created_at FROM users WHERE id=?").get(id),
  checkins:db.prepare("SELECT date,mood,craving,trigger,consumption,support_needed,notes FROM checkins WHERE user_id=?").all(id),
  triggers:db.prepare("SELECT date,place,people,feeling,thought,action,helped FROM trigger_logs WHERE user_id=?").all(id),
  plan:db.prepare("SELECT triggers,coping,contacts,safe_places,activities,reasons,professional FROM prevention_plans WHERE user_id=?").get(id)||null});
 if(r==="/api/delete-account"&&req.method==="DELETE"){db.prepare("DELETE FROM users WHERE id=?").run(id);for(const[k,v]of sessions)if(v.userId===id)sessions.delete(k);return send(res,200,{ok:true})}
 if(r==="/api/logout"&&req.method==="POST"){sessions.delete((req.headers.authorization||"").replace("Bearer ",""));return send(res,200,{ok:true})}
 return fail(res,404,"Rota não encontrada.");
}
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8"};
http.createServer(async(req,res)=>{try{if(req.url.startsWith("/api/"))return api(req,res);let f=path.join(__dirname,"public",new URL(req.url,`http://${req.headers.host}`).pathname);if(!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(__dirname,"public","index.html");res.writeHead(200,{"Content-Type":mime[path.extname(f)]||"application/octet-stream"});fs.createReadStream(f).pipe(res)}catch(e){console.error(e);fail(res,500,"Erro interno")}}).listen(PORT,()=>console.log(`Equilíbrio: http://localhost:${PORT}`));
