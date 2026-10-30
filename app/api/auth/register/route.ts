import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import disposableDomains from 'disposable-email-domains';
import dns from 'dns/promises';
import bcrypt from 'bcrypt';

dns.setServers(['8.8.8.8', '1.1.1.1']);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Realiza o cadastro de um novo usuário
 *     description: Valida dados, e-mail temporário, DNS e salva o usuário com senha criptografada (bcrypt)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 example: joao@email.com
 *               password:
 *                 type: string
 *                 example: SenhaForte123!
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso.
 *       400:
 *         description: Erro de validação (dados inválidos, e-mail temporário ou domínio inexistente).
 *       409:
 *         description: E-mail já cadastrado na base.
 *       500:
 *         description: Erro interno no servidor.
 */   


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
        
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(authUserData.password,saltRounds);

        const insertQuery = `
            INSERT INTO users(name, email,password)
            VALUES ($1,$2,$3)
        `
        await pool.query(insertQuery,[authUserData.name,authUserData.email,hashedPassword])
        
        return NextResponse.json({
            "sucess" : true,
            "message" : "cadastro realizado!"
        },{status:201})

    } catch (error) {
        console.error("Erro ao processar request:", error);
        return NextResponse.json(
            {error: "Erro ao ler o corpo da requisição."}
        ),{status:500};
    }
}