import type { Metadata } from "next";
import Link from "next/link";
import { ATUALIZACAO_DOCUMENTOS, AUTOR, EMAIL_CONTATO } from "@/app/lib/sobre";

export const metadata: Metadata = {
  title: "Termos de Uso · FinLogic",
  description: "Regras de uso do FinLogic.",
};

export default function TermosPage() {
  return (
    <article>
      <h1>Termos de Uso</h1>
      <p>Última atualização: {ATUALIZACAO_DOCUMENTOS}.</p>

      <h2>1. Quem oferece o FinLogic</h2>
      <p>
        O FinLogic é um sistema de controle financeiro pessoal criado, desenvolvido e mantido
        por <strong>{AUTOR}</strong>, pessoa física. Para falar com o responsável, escreva
        para <a href={`mailto:${EMAIL_CONTATO}`}>{EMAIL_CONTATO}</a>.
      </p>

      <h2>2. Aceite</h2>
      <p>
        Ao criar uma conta, você declara que leu e concorda com estes Termos e com a{" "}
        <Link href="/privacidade">Política de Privacidade</Link>. Se não concordar, não use o
        sistema.
      </p>

      <h2>3. O que o FinLogic faz</h2>
      <p>
        O FinLogic é gratuito e serve para você registrar e acompanhar suas contas, transações,
        categorias, orçamentos, caixinhas e planejamento, e para ler comprovantes com ajuda de
        inteligência artificial.
      </p>
      <p>
        <strong>O FinLogic não é banco nem instituição financeira.</strong> Ele não movimenta
        dinheiro, não acessa sua conta bancária e não dá recomendação de investimento.
        Valores como rendimento de caixinhas e &quot;quanto posso gastar hoje&quot; são
        estimativas feitas a partir do que você registrou e servem só como apoio.
      </p>

      <h2>4. Sua conta</h2>
      <ul>
        <li>Você precisa ter 18 anos ou mais, ou usar com autorização dos seus responsáveis.</li>
        <li>Informe dados verdadeiros e mantenha seu e-mail atualizado.</li>
        <li>Guarde sua senha em segredo. O que for feito com ela é de sua responsabilidade.</li>
        <li>Os dados que você registra são seus, e você responde pelo que coloca no sistema.</li>
      </ul>

      <h2>5. O que não é permitido</h2>
      <ul>
        <li>Tentar acessar contas ou dados de outras pessoas.</li>
        <li>Tentar invadir, sobrecarregar ou atrapalhar o funcionamento do sistema.</li>
        <li>Enviar arquivos com vírus ou documentos de terceiros sem autorização.</li>
        <li>Usar o FinLogic para qualquer atividade ilegal.</li>
      </ul>

      <h2>6. Leitura de comprovantes com IA</h2>
      <p>
        A leitura automática pode errar. Confira valor, data e categoria antes de salvar. Para
        fazer a leitura, o arquivo pode ser enviado ao Google Gemini, como explicado na{" "}
        <Link href="/privacidade">Política de Privacidade</Link>.
      </p>

      <h2>7. Disponibilidade</h2>
      <p>
        O FinLogic usa servidores gratuitos. Ele pode demorar para abrir, ficar fora do ar ou
        mudar sem aviso. Não há garantia de funcionamento contínuo. Recomendamos exportar suas
        transações de vez em quando (menu Transações).
      </p>

      <h2>8. Responsabilidade</h2>
      <p>
        O sistema é oferecido do jeito que está. Dentro do que a lei permite, o responsável não
        responde por decisões financeiras tomadas com base nas informações do sistema nem por
        perdas causadas por períodos fora do ar. Nada nestes Termos retira direitos que a lei
        garante a você.
      </p>

      <h2>9. Direitos autorais</h2>
      <p>
        O código, o nome FinLogic, a identidade visual e o conteúdo do sistema pertencem a{" "}
        {AUTOR}. Todos os direitos reservados (Lei nº 9.609/1998 e Lei nº 9.610/1998). É
        proibido copiar, modificar ou redistribuir o sistema sem autorização por escrito.
      </p>

      <h2>10. Encerramento</h2>
      <p>
        Você pode excluir sua conta quando quiser, em Configurações → Excluir minha conta. O
        responsável pode suspender contas que descumpram estes Termos.
      </p>

      <h2>11. Mudanças nestes Termos</h2>
      <p>
        Estes Termos podem ser atualizados. Mudanças importantes serão avisadas no sistema, e a
        data no topo desta página sempre mostra a versão em vigor.
      </p>

      <h2>12. Lei aplicável</h2>
      <p>
        Estes Termos seguem as leis do Brasil. Fica eleito o foro da cidade onde você mora para
        resolver qualquer questão.
      </p>
    </article>
  );
}
