const DB_NAME='EquilibrioPages',DB_VERSION=1;let dbp;
function openDB(){if(dbp)return dbp;dbp=new Promise((res,rej)=>{const r=indexedDB.open(DB_NAME,DB_VERSION);r.onupgradeneeded=()=>{const d=r.result;['users','checkins','triggers','plans','support'].forEach(n=>{if(!d.objectStoreNames.contains(n)){const s=d.createObjectStore(n,{keyPath:'id',autoIncrement:true});s.createIndex('userId','userId')}})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});return dbp}
function q(store,mode,fn){return openDB().then(d=>new Promise((res,rej)=>{const t=d.transaction(store,mode),s=t.objectStore(store),r=fn(s);if(r){r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}else t.oncomplete=()=>res();t.onerror=()=>rej(t.error)}))}
const all=s=>q(s,'readonly',x=>x.getAll()),add=(s,o)=>q(s,'readwrite',x=>x.add(o)),put=(s,o)=>q(s,'readwrite',x=>x.put(o)),del=(s,k)=>q(s,'readwrite',x=>x.delete(k));
async function byUser(s,id){return(await all(s)).filter(x=>x.userId===id)}
async function hash(v){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function createUser(name,email,password){email=email.trim().toLowerCase();if((await all('users')).some(u=>u.email===email))throw Error('Este e-mail já está cadastrado.');const salt=crypto.randomUUID(),id=await add('users',{name,email,salt,hash:await hash(salt+password),goal:''});return(await all('users')).find(u=>u.id===id)}
async function loginUser(email,password){const u=(await all('users')).find(x=>x.email===email.trim().toLowerCase());return u&&(await hash(u.salt+password))===u.hash?u:null}
const session=()=>Number(localStorage.getItem('eq_session')||0),setSession=id=>localStorage.setItem('eq_session',id),logout=()=>localStorage.removeItem('eq_session');
async function me(){return(await all('users')).find(x=>x.id===session())}
