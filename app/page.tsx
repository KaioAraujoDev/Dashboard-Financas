'use client';

import { useState } from 'react';

export default function Home() {
  const [isLoggin, setIsLoggin] = useState(true);
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");


  const inputStyle = "border-[#555] border-[1px] p-[.7rem] rounded-[.5rem] opacity-[.5] color-[#333] w-[250px]"

  function onRegister(){
    fetch('/api/auth/register/',{
      method: 'POST',
      headers:{
        'Content-Type': 'aplication/json',
      },
      body: JSON.stringify({name,email,password}),
    })
    .then((res)=>{
      res.json()
      .then(json=>{
        if(!json.sucess){
          alert(json.error);
          setName("");
          setEmail("");
          setPassword("");
        }else{
          alert(json.message);
          setName("");
          setEmail("");
          setPassword("");
        }
      })
    })
  }
  
  function onLogin(){
    fetch('/api/auth/login/',{
      method: 'POST',
      headers:{
        'Content-type': 'aplication/json',
      },
      body: JSON.stringify({email,password}),
    }).then((res)=>{
      res.json()
      .then(res =>{
        alert(res.message)
      })
    })
  }

  return (
    <div className="h-[100vh] flex items-center gap-[10%]">
      <div className="w-[70%] h-[100%] bg-[linear-gradient(180deg,rgba(40,158,222,1)_14%,rgba(40,52,222,1)_100%)]">

      </div>
      {
        isLoggin ?
          (
            <div className="flex flex-col gap-[5px] max-w-[500px]">
              <p className="text-[2rem] text-[#333] font-[700] mb-[2rem] ">Login</p>
              <input placeholder="E-mail" value={email} onChange={(e)=>{setEmail(e.target.value)}} className={`${inputStyle} mb-[7px]`} type="text" />
              <input placeholder="Senha" value={password} onChange={(e)=>{setPassword(e.target.value)}} className={`${inputStyle} mb-[15px]`} type="password" />
              <a className="text-[#555] hover:opacity-[0.5] bg-[rgba(40,158,222,1)] p-[1rem] rounded-[2rem] text-center text-[#FFF] mb-[1rem] no-underline cursor-pointer" onClick={()=>{ onLogin() }}>Logar</a>
              <a className="text-[#555] hover:opacity-[0.5] text-center text-[.75rem] cursor-pointer" onClick={() => { setIsLoggin(!isLoggin) }}>Registrar</a>
            </div>
          )
          :
          (
            <div className="flex flex-col gap-[5px] max-w-[500px]">
              <p className="text-[2rem] text-[#333] font-[700] mb-[2rem] ">Registrar</p>
              <input value={name} onChange={(e)=>{setName(e.target.value)}} placeholder="Nome" className={`${inputStyle} mb-[7px]`} type="text" />
              <input value={email} onChange={(e)=>{setEmail(e.target.value)}} placeholder="E-mail" className={`${inputStyle} mb-[7px]`} type="text" />
              <input value={password} onChange={(e)=>{setPassword(e.target.value)}} placeholder="Senha" className={`${inputStyle} mb-[15px]`} type="password" />
              <a className="text-[#555] hover:opacity-[0.5] bg-[rgba(40,158,222,1)] p-[1rem] rounded-[2rem] text-center text-[#FFF] mb-[1rem] no-underline cursor-pointer" onClick={()=>{onRegister()}}>Registrar</a>
              <a className="text-[#555] hover:opacity-[0.5] text-center text-[.75rem] cursor-pointer" onClick={() => { setIsLoggin(!isLoggin) }}>Logar</a>
            </div>
          )
      }
    </div>
  );
}
