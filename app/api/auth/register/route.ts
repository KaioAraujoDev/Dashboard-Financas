import { NextResponse } from 'next/server';
import pool from '@/lib/db';

interface authData {
    name: string,
    email: string,
    password: string
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

export async function POST(request:any){
    try{
        const authUserData:authData = await request.json();
        
        //Check for existing email
        if(!await checkEmail(authUserData.email)){
            return NextResponse.json({
                "error": "credenciais inválidas",
                "sucess": false
            },{status:409})
        }   
        
        return NextResponse.json({
            "Deu bom" : true
        })
    } catch (error) {
        console.error("Erro ao processar request:", error);
        return NextResponse.json({error: "Erro ao ler o corpo da requisição."});
    }
}