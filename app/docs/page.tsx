'use client';

import { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import 'swagger-ui-react/swagger-ui.css';

export default function SwaggerDocsPage(){
    const [spec,setSpec] = useState(null);

    useEffect(()=>{
        fetch('/api/swagger')
        .then((res)=> res.json())
        .then((data)=> setSpec(data));
    },[]);

    if(!spec){
        return(
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
                <h2>Carregando documentação da ApiError...</h2>
            </div>
        );
    }

    return <SwaggerUI spec={spec} />;
}