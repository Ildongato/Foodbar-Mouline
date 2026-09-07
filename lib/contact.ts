import { localDate } from './business';
export type Intent = 'Reservatie' | 'Catering' | 'Andere vraag';
export interface ContactValues {
  intent: Intent;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  partySize: string;
  occasion: string;
  message: string;
  website: string;
}
export const emptyContact: ContactValues = {
  intent: 'Reservatie',
  name: '',
  email: '',
  phone: '',
  date: '',
  time: '',
  partySize: '',
  occasion: '',
  message: '',
  website: '',
};
export function validateContact(v: ContactValues) {
  const errors: Partial<Record<keyof ContactValues, string>> = {};
  if (!['Reservatie', 'Catering', 'Andere vraag'].includes(v.intent))
    errors.intent = 'Kies waarvoor je contact opneemt.';
  if (v.name.trim().length < 2) errors.name = 'Vul je naam in.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
    errors.email = 'Vul een geldig e-mailadres in.';
  if (v.phone.replace(/\D/g, '').length < 8)
    errors.phone = 'Vul een geldig telefoonnummer in.';
  if (v.intent !== 'Andere vraag') {
    const parsed = new Date(`${v.date}T12:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(v.date) ||
      Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== v.date ||
      v.date < localDate()
    )
      errors.date = 'Kies vandaag of een datum in de toekomst.';
    if (
      !/^\d+$/.test(v.partySize) ||
      Number(v.partySize) < 1 ||
      Number(v.partySize) > 999
    )
      errors.partySize = 'Vul het aantal personen in (1 tot 999).';
  }
  if (v.intent === 'Reservatie' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(v.time))
    errors.time = 'Kies een uur.';
  if (v.intent === 'Catering' && v.occasion.trim().length < 2)
    errors.occasion = 'Vermeld het type gelegenheid.';
  if (v.intent !== 'Reservatie' && v.message.trim().length < 5)
    errors.message = 'Vertel ons kort waarmee we je kunnen helpen.';
  for (const key of Object.keys(v) as (keyof ContactValues)[])
    if (
      typeof v[key] !== 'string' ||
      v[key].length > (key === 'message' ? 5000 : 200)
    )
      errors[key] = 'Deze invoer is te lang.';
  return errors;
}
export function contactPayload(v: ContactValues) {
  return {
    intent: v.intent,
    name: v.name.trim(),
    email: v.email.trim(),
    phone: v.phone.trim(),
    ...(v.intent !== 'Andere vraag'
      ? { date: v.date, partySize: v.partySize }
      : {}),
    ...(v.intent === 'Reservatie' ? { time: v.time } : {}),
    ...(v.intent === 'Catering' ? { occasion: v.occasion.trim() } : {}),
    message: v.message.trim(),
  };
}
