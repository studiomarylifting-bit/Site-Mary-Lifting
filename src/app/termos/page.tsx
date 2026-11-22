import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHero } from "@/components/shared/PageHero";
import { Alert } from "@/components/ui/Alert";
import { legal, pending } from "@/features/privacy/legal-config";
import { studio } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Termos de uso",
  alternates: { canonical: "/termos" },
};

const H = ({ children }: { children: React.ReactNode }) => <h2 className="mt-12 text-3xl md:text-4xl">{children}</h2>;
const P = ({ children }: { children: React.ReactNode }) => <p className="leading-relaxed text-cocoa">{children}</p>;

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Termos de uso" lead={`Versão ${legal.version} · atualizados em ${new Date(legal.lastUpdated).toLocaleDateString("pt-BR")}.`} />
      <Container className="max-w-3xl space-y-4 py-16 md:py-24">
        <Alert tone="info" title="Revisão jurídica pendente">Este texto é uma base técnica e deve ser revisado juridicamente antes de ser tratado como definitivo.</Alert>

        <H>1. O serviço</H>
        <P>Este site apresenta os procedimentos do {studio.fullName}, permite criar uma conta, preencher a ficha de atendimento, enviar solicitações ao SAC e feedbacks. Responsável: {pending(legal.controllerName, "Nome do controlador")}.</P>

        <H>2. Sua conta</H>
        <P>Você é responsável por manter a confidencialidade da sua senha e por informar dados verdadeiros. Podemos suspender contas usadas para fraude, spam ou abuso.</P>

        <H>3. Ficha de atendimento</H>
        <P>A ficha organiza o atendimento e é revisada pelo Studio. Ela não substitui a avaliação do atendimento nem orientação de profissional de saúde. Informe com honestidade para sua segurança.</P>

        <H>4. Valores e informações</H>
        <P>Valores e condições de retorno apresentados no catálogo são informativos e podem ser atualizados pelo Studio. Em caso de dúvida, fale pelo <Link className="underline" href="/sac">SAC</Link>.</P>

        <H>5. Feedbacks e conteúdo enviado</H>
        <P>Feedbacks passam por moderação e só são publicados com a sua autorização. Não é permitido conteúdo ofensivo, ilegal ou que exponha dados de terceiros.</P>

        <H>6. Privacidade</H>
        <P>O tratamento de dados pessoais está descrito na <Link className="underline" href="/privacidade">Política de privacidade</Link>.</P>

        <H>7. Alterações e contato</H>
        <P>Estes termos podem ser atualizados; a versão vigente fica nesta página. Contato: {pending(legal.privacyEmail, "E-mail de contato")}.</P>
      </Container>
    </>
  );
}
