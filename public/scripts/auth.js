const API="/api";
const form=document.querySelector("form");
const message=document.getElementById("authMessage");

function showAuthMessage(text,error=false){
  if(!message)return;
  message.textContent=text;
  message.className="form-message "+(error?"error":"success");
}

form?.addEventListener("submit",async e=>{
  e.preventDefault();
  const isRegister=location.pathname.endsWith("cadastro.html");
  const payload=isRegister
    ? {name:document.getElementById("name").value,email:document.getElementById("email").value,password:document.getElementById("password").value,goal:document.getElementById("goal").value}
    : {email:document.getElementById("email").value,password:document.getElementById("password").value};
  showAuthMessage("Verificando...");
  try{
    const r=await fetch(API+(isRegister?"/register":"/login"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const data=await r.json();
    if(!r.ok){showAuthMessage(data.error||"Não foi possível continuar.",true);return;}
    localStorage.setItem("equilibrio_token",data.token);
    localStorage.setItem("equilibrio_user",JSON.stringify(data.user));
    location.href="principal.html";
  }catch{
    showAuthMessage("Não foi possível conectar ao servidor local.",true);
  }
});
