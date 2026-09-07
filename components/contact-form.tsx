'use client';
import { useState, useEffect, useRef, type FormEvent } from 'react';
import { ArrowUpRight, Check, LoaderCircle } from 'lucide-react';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  emptyContact,
  validateContact,
  contactPayload,
  type ContactValues,
  type Intent,
} from '@/lib/contact';
import { business, localDate } from '@/lib/business';
import { staticHosting } from '@/lib/hosting';
export default function ContactForm({
  intent,
  onIntentChange,
}: {
  intent: Intent;
  onIntentChange: (intent: Intent) => void;
}) {
  const [values, setValues] = useState<ContactValues>(emptyContact);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactValues, string>>
  >({});
  const [state, setState] = useState<
    'idle' | 'sending' | 'success' | 'error' | 'draft'
  >('idle');
  const [feedback, setFeedback] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const idempotency = useRef('');
  useEffect(() => {
    setValues((v) => ({ ...v, intent }));
    setErrors({});
    setState('idle');
  }, [intent]);
  function update(key: keyof ContactValues, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    if (state === 'error' || state === 'draft') setState('idle');
    idempotency.current = '';
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === 'sending') return;
    const invalid = validateContact(values);
    setErrors(invalid);
    if (Object.keys(invalid).length) {
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${Object.keys(invalid)[0]}"]`)
        ?.focus();
      return;
    }
    if (staticHosting) {
      setState('draft');
      setFeedback(
        'Je aanvraag staat klaar. Open ze in je mailprogramma en verstuur daar je e-mail.',
      );
      return;
    }
    setState('sending');
    setFeedback('');
    idempotency.current ||= crypto.randomUUID();
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotency.current,
        },
        body: JSON.stringify(values),
        signal: AbortSignal.timeout(15000),
      });
      const result = (await response.json()) as {
        message: string;
        errors?: Partial<Record<keyof ContactValues, string>>;
      };
      if (!response.ok) {
        if (result.errors) setErrors(result.errors);
        throw new Error(
          result.message ||
            'Versturen lukt even niet. Probeer opnieuw of bel ons.',
        );
      }
      setState('success');
      setFeedback(result.message);
    } catch (error) {
      setState('error');
      setFeedback(
        error instanceof Error && error.name !== 'TimeoutError'
          ? error.message
          : 'We konden de verzending niet bevestigen. Bel ons even voordat je opnieuw verstuurt.',
      );
    }
  }
  const fields = (
    key: keyof ContactValues,
    label: string,
    type = 'text',
    required = true,
  ) => (
    <div className="form-field" key={key}>
      <label htmlFor={key}>
        {label}
        {!required && <span> (optioneel)</span>}
      </label>
      <input
        id={key}
        name={key}
        type={type}
        value={values[key]}
        onChange={(e) => update(key, e.target.value)}
        required={required}
        disabled={state === 'sending'}
        autoComplete={
          key === 'name'
            ? 'name'
            : key === 'email'
              ? 'email'
              : key === 'phone'
                ? 'tel'
                : 'off'
        }
        min={type === 'date' ? localDate() : type === 'number' ? 1 : undefined}
        max={type === 'number' ? 999 : undefined}
        maxLength={200}
        step={type === 'time' ? 900 : undefined}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `${key}-error` : undefined}
      />
      {errors[key] && (
        <span className="field-error" id={`${key}-error`}>
          {errors[key]}
        </span>
      )}
    </div>
  );
  const draft = Object.entries(contactPayload(values))
    .map(
      ([k, v]) =>
        `${({ intent: 'Aanvraag', name: 'Naam', email: 'E-mail', phone: 'Telefoon', date: 'Datum', time: 'Uur', partySize: 'Aantal personen', occasion: 'Gelegenheid', message: 'Bericht' } as Record<string, string>)[k]}: ${v}`,
    )
    .join('\n');
  return (
    <div className="form-area">
      <form
        ref={formRef}
        onSubmit={submit}
        noValidate
        aria-label="Contactaanvraag"
      >
        <div className="form-field intent-field">
          <label htmlFor="intent">Waarvoor neem je contact op?</label>
          <NativeSelect
            id="intent"
            name="intent"
            value={intent}
            disabled={state === 'sending'}
            onChange={(e) => onIntentChange(e.target.value as Intent)}
          >
            <NativeSelectOption value="Reservatie">
              Tafel reserveren
            </NativeSelectOption>
            <NativeSelectOption value="Catering">Catering</NativeSelectOption>
            <NativeSelectOption value="Andere vraag">
              Andere vraag
            </NativeSelectOption>
          </NativeSelect>
        </div>
        {state === 'success' ? (
          <div className="form-success" role="status" tabIndex={-1}>
            <Check size={30} />
            <h3>Bedankt voor je aanvraag.</h3>
            <p>{feedback}</p>
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setValues({ ...emptyContact, intent });
                setState('idle');
                idempotency.current = '';
              }}
            >
              Nog een aanvraag <ArrowUpRight size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className="form-grid">
              {fields('name', 'Naam')}
              {fields('email', 'E-mail', 'email')}
              {fields('phone', 'Telefoon', 'tel')}
              {intent !== 'Andere vraag' &&
                fields(
                  'date',
                  intent === 'Catering' ? 'Gewenste datum' : 'Datum',
                  'date',
                )}
              {intent === 'Reservatie' && fields('time', 'Uur', 'time')}
              {intent !== 'Andere vraag' &&
                fields('partySize', 'Aantal personen', 'number')}
              {intent === 'Catering' && fields('occasion', 'Type gelegenheid')}
            </div>
            <div className="form-field message-field">
              <label htmlFor="message">
                {intent === 'Reservatie' ? 'Bericht / opmerking' : 'Bericht'}
                {intent === 'Reservatie' && <span> (optioneel)</span>}
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                value={values.message}
                maxLength={5000}
                onChange={(e) => update('message', e.target.value)}
                disabled={state === 'sending'}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? 'message-error' : undefined}
                required={intent !== 'Reservatie'}
              />
              {errors.message && (
                <span id="message-error" className="field-error">
                  {errors.message}
                </span>
              )}
            </div>
            <div className="honeypot" aria-hidden="true">
              <label htmlFor="website">Laat dit veld leeg</label>
              <input
                id="website"
                name="website"
                value={values.website}
                onChange={(e) => update('website', e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <p className="form-note">
              {intent === 'Reservatie'
                ? 'Je reservatie is definitief zodra Mouline ze heeft bevestigd.'
                : 'We nemen contact op om je aanvraag samen te bespreken.'}
            </p>
            {staticHosting && (
              <p className="form-note">
                Vul je gegevens in en maak hieronder je e-mail klaar. Je
                verstuurt de aanvraag zelf vanuit je mailprogramma.
              </p>
            )}
            {(state === 'error' || state === 'draft') && (
              <div
                className={state === 'draft' ? 'form-email' : 'form-error'}
                role={state === 'draft' ? 'status' : 'alert'}
              >
                <p>{feedback}</p>
                <a
                  className="text-link"
                  href={`mailto:${business.email}?subject=${encodeURIComponent(`${intent} via de website`)}&body=${encodeURIComponent(draft)}`}
                >
                  Open je aanvraag in je mailprogramma{' '}
                  <ArrowUpRight size={16} />
                </a>
              </div>
            )}
            <div className="form-submit-row">
              <button
                type="submit"
                className="button button-ink"
                disabled={state === 'sending'}
              >
                {state === 'sending' ? (
                  <>
                    Aanvraag versturen…{' '}
                    <LoaderCircle className="spin" size={17} />
                  </>
                ) : (
                  <>
                    {staticHosting
                      ? 'Maak e-mail klaar'
                      : 'Verstuur je aanvraag'}{' '}
                    <ArrowUpRight size={17} />
                  </>
                )}
              </button>
              <p>
                Je gegevens gebruiken we alleen
                <br />
                om je aanvraag te beantwoorden.
              </p>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
