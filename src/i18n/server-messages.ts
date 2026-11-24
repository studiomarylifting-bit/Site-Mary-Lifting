import type { Locale } from "./config";

/**
 * Mensagens de erro/sucesso que nascem em português no servidor (schemas Zod, rotas /api,
 * ações de login) ou nos fallbacks dos formulários. Módulo puro, usado no servidor e no cliente:
 * `translateMessage(msg, locale)` troca por versão do idioma; texto desconhecido volta como está.
 * Os schemas continuam em português (fonte da verdade e dos testes).
 */
type Row = readonly [pt: string, en: string, es: string, it: string];

const rows: Row[] = [
  // ---- schemas
  ["Celular é obrigatório", "Mobile number is required", "El celular es obligatorio", "Il cellulare è obbligatorio"],
  ["Informe um celular válido com DDD", "Enter a valid Brazilian mobile number with area code", "Ingresa un celular válido con código de área", "Inserisci un cellulare valido con prefisso"],
  ["E-mail é obrigatório", "Email is required", "El correo es obligatorio", "L'e-mail è obbligatoria"],
  ["E-mail inválido", "Invalid email", "Correo inválido", "E-mail non valida"],
  ["Senha é obrigatória", "Password is required", "La contraseña es obligatoria", "La password è obbligatoria"],
  ["A senha deve ter ao menos 10 caracteres", "Password must have at least 10 characters", "La contraseña debe tener al menos 10 caracteres", "La password deve avere almeno 10 caratteri"],
  ["A senha deve ter no máximo 72 caracteres", "Password must have at most 72 characters", "La contraseña debe tener como máximo 72 caracteres", "La password può avere al massimo 72 caratteri"],
  ["Inclua uma letra minúscula", "Include a lowercase letter", "Incluye una letra minúscula", "Includi una lettera minuscola"],
  ["Inclua uma letra maiúscula", "Include an uppercase letter", "Incluye una letra mayúscula", "Includi una lettera maiuscola"],
  ["Inclua um número", "Include a number", "Incluye un número", "Includi un numero"],
  ["Instagram inválido", "Invalid Instagram handle", "Instagram inválido", "Instagram non valido"],
  ["Informe nome e sobrenome", "Enter first and last name", "Ingresa nombre y apellido", "Inserisci nome e cognome"],
  ["É necessário aceitar a política e os termos", "You must accept the policy and the terms", "Debes aceptar la política y los términos", "Devi accettare l'informativa e i termini"],
  ["As senhas não coincidem", "Passwords do not match", "Las contraseñas no coinciden", "Le password non coincidono"],
  ["Informe a senha", "Enter your password", "Ingresa la contraseña", "Inserisci la password"],
  ["Selecione o tipo", "Select the type", "Selecciona el tipo", "Seleziona il tipo"],
  ["O consentimento é necessário para responder", "Consent is required so we can reply", "El consentimiento es necesario para responder", "Il consenso è necessario per rispondere"],
  ["Selecione uma nota", "Select a rating", "Selecciona una nota", "Seleziona un voto"],
  ["Informe um nome ou escolha a opção anônima", "Enter a name or choose the anonymous option", "Ingresa un nombre o elige la opción anónima", "Inserisci un nome o scegli l'opzione anonima"],
  ["Data inválida", "Invalid date", "Fecha inválida", "Data non valida"],
  ["Data de nascimento inválida", "Invalid date of birth", "Fecha de nacimiento inválida", "Data di nascita non valida"],
  ["A autorização de uso dos dados de saúde é obrigatória para enviar a ficha", "Authorization to use health data is required to submit the form", "La autorización para usar los datos de salud es obligatoria para enviar la ficha", "L'autorizzazione all'uso dei dati sanitari è obbligatoria per inviare la scheda"],
  ["Remova o Instagram ou desmarque “não possuo”", "Remove the Instagram handle or untick “I don't have one”", "Quita el Instagram o desmarca «no tengo»", "Rimuovi l'Instagram o deseleziona «non ce l'ho»"],
  ["Para autorizar a menção, informe seu Instagram", "To allow a mention, enter your Instagram", "Para autorizar la mención, ingresa tu Instagram", "Per autorizzare la menzione, inserisci il tuo Instagram"],
  // ---- http / api
  ["Conteúdo muito grande.", "Content is too large.", "El contenido es demasiado grande.", "Il contenuto è troppo grande."],
  ["Requisição inválida.", "Invalid request.", "Solicitud inválida.", "Richiesta non valida."],
  ["Revise os campos destacados.", "Please review the highlighted fields.", "Revisa los campos resaltados.", "Controlla i campi evidenziati."],
  ["Identificador inválido.", "Invalid identifier.", "Identificador inválido.", "Identificativo non valido."],
  ["Entre na sua conta para enviar a ficha.", "Sign in to submit the form.", "Inicia sesión para enviar la ficha.", "Accedi al tuo account per inviare la scheda."],
  ["Entre na sua conta.", "Sign in to your account.", "Inicia sesión en tu cuenta.", "Accedi al tuo account."],
  ["Acesso negado.", "Access denied.", "Acceso denegado.", "Accesso negato."],
  ["Origem inválida.", "Invalid origin.", "Origen inválido.", "Origine non valida."],
  ["Muitas solicitações. Tente novamente mais tarde.", "Too many requests. Please try again later.", "Demasiadas solicitudes. Inténtalo de nuevo más tarde.", "Troppe richieste. Riprova più tardi."],
  ["Muitas tentativas. Aguarde alguns minutos.", "Too many attempts. Please wait a few minutes.", "Demasiados intentos. Espera unos minutos.", "Troppi tentativi. Attendi qualche minuto."],
  ["Muitos envios. Tente novamente mais tarde.", "Too many submissions. Please try again later.", "Demasiados envíos. Inténtalo de nuevo más tarde.", "Troppi invii. Riprova più tardi."],
  ["Não foi possível enviar agora. Tente novamente.", "We couldn't send it right now. Please try again.", "No fue posible enviar ahora. Inténtalo de nuevo.", "Impossibile inviare ora. Riprova."],
  ["Não foi possível registrar agora.", "We couldn't record it right now.", "No fue posible registrar ahora.", "Impossibile registrare ora."],
  ["Não foi possível excluir a ficha.", "We couldn't delete the form.", "No fue posible eliminar la ficha.", "Impossibile eliminare la scheda."],
  ["Não foi possível atualizar.", "We couldn't update it.", "No fue posible actualizar.", "Impossibile aggiornare."],
  ["Não foi possível enviar a resposta.", "We couldn't send the reply.", "No fue posible enviar la respuesta.", "Impossibile inviare la risposta."],
  ["Não foi possível salvar a ficha. Tente novamente.", "We couldn't save the form. Please try again.", "No fue posible guardar la ficha. Inténtalo de nuevo.", "Impossibile salvare la scheda. Riprova."],
  ["Não foi possível salvar.", "We couldn't save.", "No fue posible guardar.", "Impossibile salvare."],
  ["Serviço indisponível no momento.", "Service unavailable at the moment.", "Servicio no disponible por el momento.", "Servizio al momento non disponibile."],
  ["Serviço indisponível.", "Service unavailable.", "Servicio no disponible.", "Servizio non disponibile."],
  // ---- login / cadastro (ações do servidor)
  ["Autenticação indisponível no momento.", "Sign-in is unavailable at the moment.", "La autenticación no está disponible por el momento.", "L'autenticazione non è al momento disponibile."],
  ["E-mail ou senha incorretos, ou e-mail ainda não confirmado.", "Incorrect email or password, or email not yet confirmed.", "Correo o contraseña incorrectos, o correo aún sin confirmar.", "E-mail o password errati, oppure e-mail non ancora confermata."],
  ["Cadastro indisponível no momento.", "Sign-up is unavailable at the moment.", "El registro no está disponible por el momento.", "La registrazione non è al momento disponibile."],
  ["Não foi possível concluir o cadastro. Verifique os dados e tente novamente.", "We couldn't complete the sign-up. Check your details and try again.", "No fue posible completar el registro. Revisa los datos e inténtalo de nuevo.", "Impossibile completare la registrazione. Controlla i dati e riprova."],
  ["Cadastro realizado. Se a confirmação de e-mail estiver ativa, enviamos um link para confirmar sua conta.", "Account created. If email confirmation is enabled, we sent you a link to confirm your account.", "Registro completado. Si la confirmación por correo está activa, te enviamos un enlace para confirmar tu cuenta.", "Registrazione completata. Se la conferma via e-mail è attiva, ti abbiamo inviato un link per confermare l'account."],
  ["Se houver uma conta com esse e-mail, enviaremos as instruções.", "If an account exists for that email, we'll send the instructions.", "Si existe una cuenta con ese correo, enviaremos las instrucciones.", "Se esiste un account con questa e-mail, invieremo le istruzioni."],
  ["Link expirado. Solicite uma nova recuperação de senha.", "Link expired. Request a new password reset.", "Enlace vencido. Solicita una nueva recuperación de contraseña.", "Link scaduto. Richiedi un nuovo ripristino della password."],
  ["Não foi possível atualizar a senha. Tente novamente.", "We couldn't update the password. Please try again.", "No fue posible actualizar la contraseña. Inténtalo de nuevo.", "Impossibile aggiornare la password. Riprova."],
  // ---- fallbacks do cliente
  ["Não foi possível concluir. Tente novamente.", "We couldn't complete this. Please try again.", "No fue posible completar. Inténtalo de nuevo.", "Impossibile completare. Riprova."],
  ["Falha de conexão. Verifique sua internet e tente novamente.", "Connection failed. Check your internet and try again.", "Falló la conexión. Revisa tu internet e inténtalo de nuevo.", "Connessione non riuscita. Controlla internet e riprova."],
  ["Não foi possível enviar.", "We couldn't send it.", "No fue posible enviar.", "Impossibile inviare."],
  ["Não foi possível excluir.", "We couldn't delete it.", "No fue posible eliminar.", "Impossibile eliminare."],
  ["Erro ao atualizar.", "Error while updating.", "Error al actualizar.", "Errore durante l'aggiornamento."],
  ["Erro ao enviar.", "Error while sending.", "Error al enviar.", "Errore durante l'invio."],
];

/** Rótulos usados por trimmed() nos schemas. */
const labels: Record<string, readonly [string, string, string]> = {
  "Nome completo": ["Full name", "Nombre completo", "Nome completo"],
  Nome: ["Name", "Nombre", "Nome"],
  Assunto: ["Subject", "Asunto", "Oggetto"],
  Mensagem: ["Message", "Mensaje", "Messaggio"],
  Resposta: ["Reply", "Respuesta", "Risposta"],
  Comentário: ["Comment", "Comentario", "Commento"],
  Alergias: ["Allergies", "Alergias", "Allergie"],
  "Medicamentos ou tratamentos": ["Medications or treatments", "Medicamentos o tratamientos", "Farmaci o trattamenti"],
  "Condições de saúde": ["Health conditions", "Condiciones de salud", "Condizioni di salute"],
  "Gestação ou amamentação": ["Pregnancy or breastfeeding", "Embarazo o lactancia", "Gravidanza o allattamento"],
  "Sensibilidade da pele": ["Skin sensitivity", "Sensibilidad de la piel", "Sensibilità della pelle"],
  "Sensibilidade dos olhos": ["Eye sensitivity", "Sensibilidad de los ojos", "Sensibilità degli occhi"],
  "Lentes de contato": ["Contact lenses", "Lentes de contacto", "Lenti a contatto"],
  "Cirurgias ou procedimentos recentes": ["Recent surgeries or procedures", "Cirugías o procedimientos recientes", "Interventi o trattamenti recenti"],
  "Reação anterior": ["Previous reaction", "Reacción anterior", "Reazione precedente"],
  "Objetivo e preferências": ["Goal and preferences", "Objetivo y preferencias", "Obiettivo e preferenze"],
  "Outras informações": ["Other information", "Otra información", "Altre informazioni"],
};

const patterns: Record<Exclude<Locale, "pt">, { required: (l: string) => string; min: (l: string, n: string) => string; max: (l: string, n: string) => string }> = {
  en: { required: (l) => `${l} is required`, min: (l, n) => `${l}: minimum ${n} characters`, max: (l, n) => `${l}: maximum ${n} characters` },
  es: { required: (l) => `${l} es obligatorio`, min: (l, n) => `${l}: mínimo ${n} caracteres`, max: (l, n) => `${l}: máximo ${n} caracteres` },
  it: { required: (l) => `${l} è obbligatorio`, min: (l, n) => `${l}: minimo ${n} caratteri`, max: (l, n) => `${l}: massimo ${n} caratteri` },
};

const LOCALE_INDEX = { en: 1, es: 2, it: 3 } as const;
const exact = new Map<string, Row>(rows.map((r) => [r[0], r]));

export function translateMessage(message: string, locale: Locale): string {
  if (locale === "pt" || !message) return message;
  const row = exact.get(message);
  if (row) return row[LOCALE_INDEX[locale]];
  const label = (pt: string) => labels[pt]?.[LOCALE_INDEX[locale] - 1];
  let m = /^(.+) é obrigatório$/.exec(message);
  if (m && label(m[1]!)) return patterns[locale].required(label(m[1]!)!);
  m = /^(.+): mínimo de (\d+) caracteres$/.exec(message);
  if (m && label(m[1]!)) return patterns[locale].min(label(m[1]!)!, m[2]!);
  m = /^(.+): máximo de (\d+) caracteres$/.exec(message);
  if (m && label(m[1]!)) return patterns[locale].max(label(m[1]!)!, m[2]!);
  return message;
}

export const serverMessageKeys = rows.map((r) => r[0]);
