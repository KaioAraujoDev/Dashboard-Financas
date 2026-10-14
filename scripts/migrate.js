const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({path: '.env.local'});

const pool = new Pool ({ connectionString: process.env.DATABASE_URL});

async function runMigrations(){
    try{
         //Cria Tabela de controle de históricos se não existir
        await pool.query(`
            CREATE TABLE IF NOT EXISTS migrations_history(
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) UNIQUE NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )   
        `)

        //Busca quais arquivos já foram executados no banco
        const executedResult = await pool.query('SELECT filename FROM migrations_history');
        const executedFiles = executedResult.rows.map(row => row.filename);

        //Lê todos os arquivos da pasta migrations/
        const migrationsDir = path.join(__dirname , '../migrations');
        const allFiles = fs.readdirSync(migrationsDir)
                         .filter(file => file.endsWith('.sql'))
                         .sort() // Ordem alfabética
        
        //Filtra apenas os arquivos que AINDA NÃO foram executados
        const pendingFiles = allFiles.filter(file => !executedFiles.includes(file));
        
        if(pendingFiles.length === 0){
            console.log('O Banco de dados já está atualizado! Nenhuma migration pendente!')
        }

        for(const file of pendingFiles){
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf-8');

            console.log(`Executando migration: ${file}`);

            //Inicia uma transação 
            await pool.query('BEGIN');

            try{
                await pool.query(sql);
                //Registra que o arquivo foi executado com sucesso
                await pool.query('INSERT INTO migrations_history (filename) VALUES ($1)',[file]);
                await pool.query('COMMIT');

                console.log(`Migration ${file} aplicada com sucesso!`);
            }catch (err){
                await pool.query('ROLLBACK');
                console.error('Erro ao executar ${file}. Alterações revertidas.');
                throw err;
            }
            
        }

        console.log('Todas as migrations pendentes foram aplicadas com sucesso!');


    }catch (error) {
        console.error('Erro ao rodar a migration: ',error);
    }finally{
        await pool.end();
    }
}

runMigrations();
