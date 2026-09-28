"use client "
import ResultadoAnalise from "@/app/components/ia/ResultadoAnalise";
import { RegistroDeComprovanteIA } from "@/app/services/IA.service";
import { RegistroDeComprovanteDTO } from "@/app/types/ia";
import { useState } from "react";
function Page() {
   
    
   return(
    <div>
        <ResultadoAnalise/>
    </div>
   )
}

export default Page;
