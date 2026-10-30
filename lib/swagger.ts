import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () =>{
    const spec = createSwaggerSpec({
        apiFolder: 'app/api',
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'API de Autenticação - Next.js',
                version: '1.0.0',
                description: 'Documentação interativa das rotas de backend (Cadastro e Login)',
            },
        },
    });
    return spec;
}