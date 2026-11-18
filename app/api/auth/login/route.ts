import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: any) {
    try {
        const authUserData = await request.json();
        
        const userFinded = await pool.query(`
            SELECT email,password FROM users
            WHERE email = $1
        `, [authUserData.email]);
        
        
        if(userFinded.rows.length == 0){
            return NextResponse.json({
                "sucess": false,
                "message": "Email ou senha inválidos!"
            });
        }
        
        const userInfo = userFinded.rows[0];
        const passwordMatch = await bcrypt.compare(authUserData.password,userInfo.password);

        if(!passwordMatch){
            return NextResponse.json({
                "sucess": false,
                "message": "Email ou senha inválidos!",
                "passwordMatch": passwordMatch
            })
        }
        return NextResponse.json({
            "sucess": true,
            "message": "usuário encontrado!",
            "passwordMatch": passwordMatch
        })
        
    } catch (e) {

        return NextResponse.json({
            "error": "Erro ao processar o login!",
            "detailsError": e
        }, { status: 500 })
    }
}