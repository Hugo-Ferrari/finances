import type { Metadata } from "next";
import Link from "next/link";
import { ATUALIZACAO_DOCUMENTOS, AUTOR, EMAIL_CONTATO } from "@/app/lib/sobre";

export const metadata: Metadata = {
  title: "Política de Privacidade · FinLogic",
  description: "Como o FinLogic trata seus dados pessoais (LGPD).",
};

export default function PrivacidadePage() {
  return (
    <article>
      <h1>Política de Privacidade</h1>
      <p>Última atualização: {ATUALIZACAO_DOCUMENTOS}.</p>
      <p>
        Esta política explica, de forma simples, quais dados o FinLogic usa, para quê e quais
        são os seus direitos, conforme a Lei Geral de Proteção de Dados (LGPD, Lei nº
        13.709/2018).
      </p>

      <h2>1. Quem é o responsável pelos seus dados</h2>
      <p>
        O controlador dos dados é <strong>{AUTOR}</strong>, pessoa física, criador e mantenedor
        do FinLogic. Contato para qualquer assunto sobre seus dados:{" "}
        <a href={`mailto:${EMAIL_CONTATO}`}>{EMAIL_CONTATO}</a>.
      </p>

      <h2>2. Quais dados usamos</h2>
      <ul>
        <li>
          <strong>Cadastro:</strong> nome, e-mail e senha. A senha é guardada criptografada
          (ninguém consegue lê-la, nem o responsável).
        </li>
        <li>
          <strong>Dados financeiros que você registra:</strong> contas e saldos, transações,
          categorias, orçamentos, caixinhas, contas recorrentes e meta de economia.
        </li>
        <li>
          <strong>Comprovantes:</strong> a imagem ou o PDF que você envia para leitura. O arquivo
          é lido na hora e <strong>não fica guardado</strong>. Só fica salva a transação que você
          confirmar.
        </li>
        <li>
          <strong>Dados técnicos:</strong> registros de acesso (como endereço IP, data e hora)
          gerados automaticamente pelos servidores onde o sistema roda.
        </li>
      </ul>
      <p>Não pedimos CPF, dados bancários, senha de banco nem número de cartão.</p>

      <h2>3. Para que usamos</h2>
      <ul>
        <li>Criar e manter sua conta e o seu login.</li>
        <li>Mostrar seus saldos, resumos, gráficos e planejamento.</li>
        <li>Ler comprovantes e sugerir valor, data e categoria.</li>
        <li>Manter o sistema seguro e corrigir erros.</li>
      </ul>
      <p>
        A base legal é a execução do serviço que você contratou ao criar a conta (art. 7º, V, da
        LGPD) e, para segurança e prevenção de abusos, o legítimo interesse (art. 7º, IX).
      </p>
      <p>
        <strong>Seus dados não são vendidos</strong> e não são usados para propaganda.
      </p>

      <h2>4. Com quem os dados são compartilhados</h2>
      <p>Só com os serviços necessários para o FinLogic funcionar:</p>
      <ul>
        <li>
          <strong>Vercel</strong> (site) e <strong>Render</strong> (servidor da API): hospedagem.
          Servidores fora do Brasil.
        </li>
        <li>
          <strong>Neon</strong>: banco de dados onde suas informações ficam guardadas.
        </li>
        <li>
          <strong>Google Gemini</strong>: quando a leitura do comprovante precisa de
          inteligência artificial (fotos e PDFs escaneados), o arquivo e os nomes das suas
          categorias são enviados ao Google. O FinLogic usa a versão gratuita do Gemini. Nessa
          versão, <strong>o Google pode usar o conteúdo enviado para melhorar os produtos dele,
          e pessoas da equipe do Google podem ler esse conteúdo</strong>. Por isso, não envie
          comprovantes com informações que você não quer compartilhar. PDFs de banco com texto
          são lidos sem IA, no próprio servidor do FinLogic.
        </li>
      </ul>
      <p>
        Alguns desses serviços ficam em outros países, principalmente nos Estados Unidos. Essa
        transferência internacional é feita para executar o serviço que você pediu (art. 33,
        IX, da LGPD) e com empresas que adotam medidas de segurança próprias.
      </p>
      <p>
        Os dados também podem ser entregues a autoridades quando houver ordem judicial ou
        obrigação legal.
      </p>

      <h2>5. Cookies e armazenamento no aparelho</h2>
      <ul>
        <li>
          <strong>Cookie de login</strong> (<code>access_token</code>): mantém você conectado.
          Dura 6 horas, ou 30 dias se você marcar &quot;Lembrar de mim&quot;.
        </li>
        <li>
          <strong>Armazenamento local do navegador:</strong> guarda suas preferências, um aviso
          de que havia sessão aberta e as transações criadas sem internet até serem enviadas.
        </li>
      </ul>
      <p>Não usamos cookies de propaganda nem ferramentas de rastreamento.</p>

      <h2>6. Por quanto tempo guardamos</h2>
      <p>
        Enquanto sua conta existir. Ao excluir a conta, seus dados são apagados do banco na hora.
        Cópias de segurança (do provedor do banco ou feitas antes de manutenções) podem manter
        esses dados por um tempo, com acesso restrito, até serem substituídas ou descartadas.
      </p>

      <h2>7. Segurança</h2>
      <p>
        Usamos conexão protegida (HTTPS), senha criptografada, cookie de login que o código da
        página não consegue ler e separação dos dados por usuário. Nenhum sistema é 100% seguro.
        Se acontecer um incidente que possa trazer risco a você, você será avisado.
      </p>

      <h2>8. Seus direitos</h2>
      <p>Pela LGPD (art. 18), você pode, a qualquer momento:</p>
      <ul>
        <li>
          <strong>Ver e corrigir</strong> seus dados: no próprio sistema e em Configurações.
        </li>
        <li>
          <strong>Levar seus dados</strong>: exporte suas transações em planilha no menu
          Transações.
        </li>
        <li>
          <strong>Apagar tudo</strong>: em Configurações → Excluir minha conta.
        </li>
        <li>
          Pedir informações sobre o uso e o compartilhamento dos seus dados, ou fazer qualquer
          outro pedido, pelo e-mail <a href={`mailto:${EMAIL_CONTATO}`}>{EMAIL_CONTATO}</a>.
          Respondemos em até 15 dias.
        </li>
        <li>
          Reclamar à Autoridade Nacional de Proteção de Dados (ANPD), em{" "}
          <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">
            gov.br/anpd
          </a>
          .
        </li>
      </ul>

      <h2>9. Menores de idade</h2>
      <p>
        O FinLogic é feito para maiores de 18 anos. Menores só podem usar com autorização dos
        responsáveis.
      </p>

      <h2>10. Mudanças nesta política</h2>
      <p>
        Esta política pode ser atualizada. Mudanças importantes serão avisadas no sistema. Veja
        também os <Link href="/termos">Termos de Uso</Link>.
      </p>
    </article>
  );
}
