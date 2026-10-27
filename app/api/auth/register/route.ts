import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import disposableDomains from 'disposable-email-domains';
import dns from 'dns/promises';
dns.setServers(['8.8.8.8', '1.1.1.1']);

interface authData {
    name: string,
    email: string,
    password: string
}

const verifyEmailDomain = async (email:string): Promise<boolean> =>{
    try{
        const domain = email.split('@')[1]?.toLowerCase();
        if(!domain) return false;

        const mxRecords = await dns.resolveMx(domain);

        return mxRecords && mxRecords.length > 0;
        
    }catch(error){
        return false;
    }
}

const isDisposableEmail = (email:string) =>{
    const domain = email.split('@')[1]?.toLowerCase();
    if(!domain) return true;

    return disposableDomains.includes(domain)
}

const checkEmail = async (email:string) =>{
    const equalEmails = await pool.query(`
        SELECT email FROM users WHERE email = $1`, [email])
    
    if(equalEmails.rows.length >= 1){
        return false;
    }else{
        return true;
    }
    
}

const isValidEmail = (email:string) =>{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

const validateFields = async (authUserData:authData) =>{

    if(authUserData.email.length >= 50){
        return {
            sucess:false,
            errorMessage:"E-mail não deve conter mais de 50 caracteres",
            status:400
        }
    }
    
    if(!isValidEmail(authUserData.email) || isDisposableEmail(authUserData.email) ){
        return {
            sucess:false,
            errorMessage:"E-mail inválido",
            status:400
        }
    }

    const isValidEmailDomain =  await verifyEmailDomain(authUserData.email);
    if(!isValidEmailDomain){
        return{
            sucess:false,
            errorMessage:"O Domínio do e-mail não existe.",
            status:400
        }
    }
    
    if(!authUserData.name || authUserData.name.trim() === "" || authUserData.name.length >= 50){
        return{
            sucess:false,
            errorMessage:"Nome inválido ou muito longo.",
            status:400
        }
    }
    
    if(!authUserData.password || authUserData.password.length >= 50){
        return{
            sucess:false,
            errorMessage:"A senha deve ter no máximo 50 caracteres.",
            status:400
        }
    }

    if(!await checkEmail(authUserData.email)){
        return{
            sucess:false,
            errorMessage:"E-mail indisponível para cadastro.",
            status:409
        }
    }

    return {
        sucess:true
    }
}


export async function POST(request:any){
    try{
        const authUserData:authData = await request.json();
        
        //Validate fields
        const validateObject = await validateFields(authUserData);

        if(!validateObject?.sucess){
            return NextResponse.json({
                "error": validateObject.errorMessage,
                "sucess": validateObject.sucess
            },{status:validateObject.status});
        }
  
        return NextResponse.json({
            "sucess" : true,
            "message" : "cadastro realizado!"
        },{status:200})

    } catch (error) {
        console.error("Erro ao processar request:", error);
        return NextResponse.json(
            {error: "Erro ao ler o corpo da requisição."}
        ),{status:500};
    }
}