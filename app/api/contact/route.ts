import { business } from '@/lib/business';
import {
  emptyContact,
  validateContact,
  contactPayload,
  type ContactValues,
} from '@/lib/contact';
import { serverEnv } from '@/lib/server-env';
const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin)
    return reply({ message: 'Verstuur de aanvraag via deze website.' }, 403);
  if (!request.headers.get('content-type')?.includes('application/json'))
    return reply({ message: 'Ongeldige aanvraag.' }, 415);
  const raw = await request.text();
  if (raw.length > 16000)
    return reply({ message: 'Je bericht is te lang.' }, 413);
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data))
      throw new Error();
  } catch {
    return reply({ message: 'Ongeldige aanvraag.' }, 400);
  }
  if (Object.keys(emptyContact).some((k) => typeof data[k] !== 'string'))
    return reply({ message: 'Vul alle vereiste velden in.' }, 400);
  const values = data as unknown as ContactValues;
  if (values.website)
    return reply(
      { message: 'De aanvraag kon niet worden verwerkt. Bel ons even.' },
      400,
    );
  const errors = validateContact(values);
  if (Object.keys(errors).length)
    return reply({ message: 'Controleer de aangeduide velden.', errors }, 422);
  const env = await serverEnv();
  // TODO CONFIGURATION: verified sender domain and Resend key required. No fake success.
  if (!env.RESEND_API_KEY || !env.CONTACT_FROM_EMAIL)
    return reply(
      {
        message:
          'Online versturen is momenteel niet beschikbaar. Bel ons op 03 326 06 30 of stuur je aanvraag via e-mail.',
      },
      503,
    );
  const key = request.headers.get('Idempotency-Key');
  if (!key || !/^[0-9a-f-]{36}$/i.test(key))
    return reply({ message: 'Vernieuw de pagina en probeer opnieuw.' }, 400);
  const payload = contactPayload(values);
  const labels: Record<string, string> = {
    intent: 'Aanvraag',
    name: 'Naam',
    email: 'E-mail',
    phone: 'Telefoon',
    date: 'Datum',
    time: 'Uur',
    partySize: 'Aantal personen',
    occasion: 'Type gelegenheid',
    message: 'Bericht',
  };
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': key,
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL,
        to: [business.email],
        reply_to: payload.email,
        subject: `${values.intent} via de Mouline-website`,
        text: Object.entries(payload)
          .map(([k, v]) => `${labels[k]}: ${v}`)
          .join('\n\n'),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok)
      return reply(
        {
          message:
            'Versturen lukt even niet. Je gegevens staan nog ingevuld. Probeer opnieuw of bel ons.',
        },
        502,
      );
    return reply({
      message:
        values.intent === 'Reservatie'
          ? 'Bedankt. We hebben je aanvraag ontvangen. Je reservatie is definitief zodra Mouline ze heeft bevestigd.'
          : 'Bedankt. We hebben je aanvraag ontvangen. Mouline neemt contact met je op.',
    });
  } catch {
    return reply(
      {
        message:
          'We konden de verzending niet bevestigen. Je gegevens blijven ingevuld. Bel ons even of probeer opnieuw.',
      },
      502,
    );
  }
}
