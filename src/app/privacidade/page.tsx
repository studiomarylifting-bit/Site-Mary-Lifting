import type { Metadata } from "next";
import { Container, PageHero } from "@/components/shared/PageHero";
import { Alert } from "@/components/ui/Alert";
import { PrivacyRequestForm } from "@/features/privacy/PrivacyRequestForm";
import { legal, pending } from "@/features/privacy/legal-config";
import { studio } from "@/lib/studio";
import { getT } from "@/i18n/server";
import { formatDate } from "@/i18n/format";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("legal.privacy.title"), description: t("legal.privacy.description"), alternates: { canonical: "/privacidade" } };
}

const P = ({ children }: { children: React.ReactNode }) => <p className="leading-relaxed text-cocoa">{children}</p>;
const H = ({ id, children }: { id?: string; children: React.ReactNode }) => (
  <h2 id={id} className="mt-12 scroll-mt-28 text-3xl md:text-4xl">{children}</h2>
);
const UL = ({ items }: { items: string[] }) => (
  <ul className="list-disc space-y-2 pl-5 text-cocoa marker:text-rose">{items.map((i) => <li key={i}>{i}</li>)}</ul>
);

export default async function PrivacyPage() {
  const t = await getT();
  const identified = Boolean(legal.controllerName && legal.privacyEmail);
  return (
    <>
      <PageHero eyebrow={t("legal.privacy.eyebrow")} title={t("legal.privacy.title")} lead={t("legal.privacy.lead", { version: legal.version, date: formatDate(legal.lastUpdated, t.locale) })} />
      <Container className="max-w-3xl space-y-4 py-16 md:py-24">
        {t.locale !== "pt" && <Alert tone="info" title={t("legal.noticeTitle")}>{t("legal.noticeText")}</Alert>}
        <div lang="pt-BR" className="space-y-4">
        {!identified && (
          <Alert tone="info" title="Documento em preparação">
            Alguns dados jurídicos (controlador, CNPJ/CPF, e-mail de privacidade, encarregado e prazos de retenção) ainda
            serão informados pelo Studio e aparecem entre colchetes. Este texto é uma base técnica e precisa de revisão
            jurídica antes de ser tratado como definitivo.
          </Alert>
        )}

        <H>1. Quem é o responsável pelos dados</H>
        <P>O controlador dos dados tratados neste site é: <strong>{pending(legal.controllerName, "Nome do controlador")}</strong>, documento: {pending(legal.controllerDocument, "CNPJ/CPF")}, atuando como {studio.fullName}, em {studio.address.display}.</P>
        <P>Contato para privacidade: {pending(legal.privacyEmail, "E-mail de privacidade")}. Encarregado (DPO): {pending(legal.dpoName, "Nome do encarregado, se aplicável")}.</P>

        <H>2. Dados que tratamos</H>
        <UL items={[
          "Cadastro: nome completo, celular, e-mail e senha (a senha é gerida pelo serviço de autenticação e nunca fica visível ao Studio).",
          "Ficha de atendimento: data de nascimento, Instagram (opcional) e informações de saúde que você escolher informar (alergias, medicamentos, condições, gestação/amamentação, sensibilidade de pele e olhos, lentes de contato, procedimentos recentes, reações anteriores, objetivos e outras informações).",
          "SAC: nome, e-mail, celular, assunto, tipo e mensagem, com número de protocolo.",
          "Feedback: nota, comentário, procedimento (opcional) e nome para exibição, conforme sua escolha de anonimização e autorização.",
          "Registros de consentimento: o que foi autorizado, quando, em qual contexto e a versão do texto.",
          "Dados técnicos mínimos: cookies de sessão e um identificador pseudonimizado do acesso, usado apenas para limitar abusos.",
        ]} />

        <H>3. Dados de saúde (dados sensíveis)</H>
        <P>As informações de saúde da ficha são dados sensíveis. Elas são usadas somente para avaliar e organizar o seu atendimento, com base no seu consentimento específico, que não é condição para outros usos. A ficha não substitui a avaliação do atendimento. Somente você e administradoras autorizadas do Studio têm acesso, protegido por regras de acesso no banco de dados.</P>
        <P>As respostas da ficha <strong>nunca</strong> são enviadas por WhatsApp, e-mail ou registradas em logs.</P>

        <H>4. Para que usamos e por quê</H>
        <UL items={[
          "Criar e manter sua conta e permitir o acesso à sua área (execução do serviço solicitado).",
          "Avaliar e organizar seu atendimento a partir da ficha (consentimento específico, art. 11 da LGPD).",
          "Responder ao SAC e a pedidos de titulares (atendimento da sua solicitação e obrigações legais).",
          "Publicar feedbacks aprovados (somente com sua autorização).",
          "Lembretes, manutenção e acompanhamento pós-atendimento por WhatsApp (somente se você autorizar).",
          "Novidades, ofertas e aniversário por WhatsApp (somente se você autorizar; nada é enviado automaticamente sem essa autorização).",
          "Ranking anual compartilhado, uso de imagem e menção ao seu Instagram (cada um com autorização própria e opcional).",
          "Segurança e prevenção de abusos.",
        ]} />

        <H>5. Consentimentos independentes</H>
        <P>Cada autorização é separada: dados de saúde, WhatsApp de acompanhamento, WhatsApp de marketing, ranking, imagem e menção. Você pode revogar as opcionais a qualquer momento em Minha conta &gt; Autorizações. Nenhuma delas condiciona o atendimento. A revogação não afeta tratamentos anteriores feitos de forma legítima.</P>

        <H>6. Com quem os dados passam</H>
        <UL items={[
          "Supabase: banco de dados, autenticação e armazenamento (operador).",
          "Uazapi / WhatsApp: apenas avisos administrativos mínimos ao número do Studio (ex.: “nova solicitação recebida”). Não contêm dados de saúde, respostas de ficha, senhas ou o conteúdo do que você escreveu.",
          "Google (Places API e Google Maps): exibição das avaliações do Google e do mapa. O mapa incorporado carrega recursos do Google.",
          "Provedor de hospedagem do site, a ser informado: [provedor — a ser informado pelo Studio].",
        ]} />
        <P>Alguns desses prestadores podem processar dados fora do Brasil. As garantias aplicáveis devem ser confirmadas pelo Studio antes da publicação.</P>

        <H>7. Cookies</H>
        <P>Usamos apenas cookies estritamente necessários para manter sua sessão e a segurança. Não usamos cookies de publicidade. O mapa incorporado do Google pode definir seus próprios cookies.</P>

        <H>8. Retenção e exclusão</H>
        <P>Mantemos os dados enquanto sua conta estiver ativa ou pelo tempo necessário para as finalidades acima. Prazo de retenção da ficha: {pending(legal.retentionIntake, "Prazo de retenção da ficha")}. Você pode excluir sua ficha em Minha conta &gt; Ficha de atendimento e solicitar a exclusão da conta abaixo. Alguns registros podem ser mantidos quando houver obrigação legal.</P>

        <H id="direitos">9. Seus direitos</H>
        <P>Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, bloqueio ou eliminação, portabilidade, informação sobre compartilhamento e revogação de consentimento. Se tiver conta, pode baixar uma cópia dos seus dados em Minha conta &gt; Perfil e dados.</P>
        <div className="rounded-media bg-ivory p-6 shadow-soft md:p-8">
          <h3 className="mb-5 text-2xl">Fazer uma solicitação</h3>
          <PrivacyRequestForm />
        </div>

        <H>10. Segurança</H>
        <P>Adotamos controle de acesso por papel, regras de acesso por linha no banco (RLS), validação no servidor, limitação de requisições, cabeçalhos de segurança e registros sem conteúdo sensível. Nenhum sistema é totalmente imune a falhas; em caso de incidente relevante, adotaremos as providências legais cabíveis.</P>

        <H>11. Alterações</H>
        <P>Esta política pode ser atualizada. A versão e a data constam no topo desta página.</P>
        </div>
      </Container>
    </>
  );
}
