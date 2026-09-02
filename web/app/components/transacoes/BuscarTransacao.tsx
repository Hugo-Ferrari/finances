import React from "react";

function BuscarTransacao() {
  return (
    <div className="">
      <div className=" flex gap-10">
        <h1>BUSCAR {/** get transação */}</h1>
        <h1>PERÍODO</h1> {/** get periodo */}
        <h1>CONTA</h1> {/** get conta */}
        <h1>CATEGORIA</h1> {/** getCategoria */}
      </div>
      <div>
        <h1>ATIVO: {/**get ativo, true or false */}</h1>
      </div>
      <button>Limpar Tudo</button>
    </div>
  );
}

export default BuscarTransacao;
