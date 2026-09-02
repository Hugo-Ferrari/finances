import DetalhesCategorias from '@/app/components/categoria/DetalhesCategorias'
import OrcamentoMensalTotal from '@/app/components/categoria/OrcamentoMensalTotal'
import React from 'react'

function page() {
  return (
    <div>
      <OrcamentoMensalTotal/>
      <h1>Detalhamento Por Categoria</h1>

      <DetalhesCategorias/>
    </div>
  )
}

export default page