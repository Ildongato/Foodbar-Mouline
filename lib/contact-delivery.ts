import type { ContactValues } from './contact';

/** Approved temporary client demo. Disable when the real endpoint is connected. */
export const contactDemoAllowed = process.env.NEXT_PUBLIC_CONTACT_DEMO_ALLOWED !== 'false';
export const contactDemoEnabled = contactDemoAllowed;

export function isFormspreeEndpoint(endpoint: string) {
  return /^https:\/\/formspree\.io\/f\/[a-z0-9]+\/?$/i.test(endpoint);
}

export class ContactDeliveryError extends Error {
  constructor(
    message: string,
    public fields: Partial<Record<keyof ContactValues, string>> = {},
  ) {
    super(message);
    this.name = 'ContactDeliveryError';
  }
}

/** No credentials in the browser. Recipient is verified in the Formspree dashboard. */
export async function sendContact(
  endpoint: string,
  values: ContactValues,
  idempotencyKey: string,
  fetcher: typeof fetch = fetch,
) {
  if (!endpoint)
    throw new ContactDeliveryError(
      'Online versturen is nog niet beschikbaar. Je gegevens blijven ingevuld. Bel Mouline op 03 326 06 30.',
    );
  const formspree = isFormspreeEndpoint(endpoint);
  const payload = formspree
    ? {
        intent: values.intent,
        name: values.name.trim(),
        email: values.email.trim(), // Formspree uses this field as Reply-To.
        phone: values.phone.trim(),
        ...(values.intent !== 'Andere vraag'
          ? { date: values.date, partySize: values.partySize }
          : {}),
        ...(values.intent === 'Reservatie' ? { time: values.time } : {}),
        ...(values.intent === 'Catering'
          ? { occasion: values.occasion.trim() }
          : {}),
        message: values.message.trim(),
        _gotcha: values.website,
        _subject: `${values.intent} via Foodbar Mouline`,
      }
    : values;
  const response = await fetcher(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      // The existing own-host API supports idempotency; Formspree's CORS API does not.
      ...(!formspree ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  const result = (await response.json()) as {
    ok?: boolean;
    message?: string;
    errors?:
      | Partial<Record<keyof ContactValues, string>>
      | { field?: string; message?: string }[];
  };
  if (!response.ok || result?.ok !== true) {
    const fields: Partial<Record<keyof ContactValues, string>> = {};
    if (Array.isArray(result?.errors)) {
      for (const error of result.errors) {
        if (
          error.field &&
          Object.hasOwn(values, error.field) &&
          error.field !== 'website'
        )
          fields[error.field as keyof ContactValues] =
            'Controleer dit veld en probeer opnieuw.';
      }
    } else if (result?.errors) Object.assign(fields, result.errors);
    throw new ContactDeliveryError(
      formspree
        ? 'Versturen lukt even niet. Je gegevens blijven ingevuld. Probeer opnieuw of bel Mouline.'
        : result?.message ||
            'Versturen lukt even niet. Je gegevens blijven ingevuld. Probeer opnieuw of bel ons.',
      fields,
    );
  }
  return (
    result.message || 'Bedankt, we nemen zo snel mogelijk contact met je op.'
  );
}
