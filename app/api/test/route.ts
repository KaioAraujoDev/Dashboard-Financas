import { NextResponse } from "next/server";
import pool from '@/lib/db'; 

export async function GET(){
    try{
        const query = `
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `

        const result = await pool.query(query);

        return NextResponse.json({
            message: 'Listagem de tabelas do banco de dados',
            total: result.rowCount,
            tables: result.rows
        }, {status:200});

    } catch (error) {
        console.error('Error ao listar tabelas: ', error);

        return NextResponse.json(
            { error: 'Erro ao consultar tabelas no banco de dados'},
            { status: 500 }
        )
    }
}

