'use client';
/* oxlint-disable jsx-a11y/prefer-tag-over-role -- Status regions contain headings/paragraphs; output only permits phrasing content. */
import { useState, useEffect, useRef, type SubmitEvent } from 'react';
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
import { contactEndpoint, staticHosting } from '@/lib/hosting';
import {
  ContactDeliveryError,
  isFormspreeEndpoint,
  sendContact,
} from '@/lib/contact-delivery';
export default function ContactForm({
  intent,
  onIntentChange,
  variant = 'default',
  delivery = 'auto',
  demo = false,
}: {
  intent: Intent;
  onIntentChange: (intent: Intent) => void;
  variant?: 'default' | 'editorial';
  delivery?: 'auto' | 'direct';
  demo?: boolean;
}) {
  const useEmailDraft = staticHosting && delivery !== 'direct';
  const endpoint = delivery === 'direct' ? contactEndpoint : '/api/contact';
  const [values, setValues] = useState<ContactValues>(emptyContact);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactValues, string>>
  >({});
  const [state, setState] = useState<
    'idle' | 'sending' | 'success' | 'error' | 'draft'
  >('idle');
  const [feedback, setFeedback] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const idempotency = useRef('');
  useEffect(() => {
    // Preserve entered details when an external catering/reservation CTA changes intent.
    // oxlint-disable-next-line react/react-compiler
    setValues((v) => ({ ...v, intent }));
    setErrors({});
    setState('idle');
    idempotency.current = '';
  }, [intent]);
  useEffect(() => {
    if (state === 'success') successRef.current?.focus({ preventScroll: true });
  }, [state]);
  function update(key: keyof ContactValues, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    if (state === 'error' || state === 'draft') setState('idle');
    idempotency.current = '';
  }
  async function submit(event: SubmitEvent<HTMLFormElement>) {
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
    if (useEmailDraft) {
      setState('draft');
      setFeedback(
        'Je aanvraag staat klaar. Open ze in je mailprogramma en verstuur daar je e-mail.',
      );
      return;
    }
    setState('sending');
    setFeedback('');
    if (demo) {
      // Demonstrate the existing loading/success UI without calling any mail service.
      await new Promise((resolve) => setTimeout(resolve, 650));
      setState('success');
      return;
    }
    idempotency.current ||= crypto.randomUUID();
    try {
      const message = await sendContact(endpoint, values, idempotency.current);
      setState('success');
      setFeedback(message);
    } catch (error) {
      if (error instanceof ContactDeliveryError) setErrors(error.fields);
      setState('error');
      setFeedback(
        delivery === 'direct' &&
          (error instanceof TypeError || error instanceof SyntaxError)
          ? 'Versturen lukt even niet. Je gegevens blijven ingevuld. Probeer opnieuw of bel Mouline.'
          : error instanceof Error && error.name !== 'TimeoutError'
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
        action={demo ? undefined : endpoint || undefined}
        method="POST"
        onSubmit={submit}
        noValidate
        aria-label="Contactaanvraag"
        aria-busy={state === 'sending'}
      >
        {variant === 'editorial' ? (
          <fieldset className="intent-choices" disabled={state === 'sending'}>
            <legend>Waarvoor neem je contact op?</legend>
            <div className="intent-options">
              {(
                [
                  ['Reservatie', 'Tafel reserveren'],
                  ['Catering', 'Catering'],
                  ['Andere vraag', 'Andere vraag'],
                ] as const
              ).map(([value, label]) => (
                <label className="intent-option" key={value}>
                  <input
                    type="radio"
                    name="intent"
                    value={value}
                    checked={intent === value}
                    onChange={() => onIntentChange(value)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
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
        )}
        {state === 'success' ? (
          <div
            ref={successRef}
            className="form-success"
            role="status"
            aria-live="polite"
            tabIndex={-1}
          >
            <Check size={30} aria-hidden="true" />
            <h3>
              {delivery === 'direct'
                ? 'Aanvraag verzonden'
                : 'Bedankt voor je aanvraag.'}
            </h3>
            <p>
              {delivery === 'direct'
                ? feedback || 'Bedankt, we nemen zo snel mogelijk contact met je op.'
                : feedback}
            </p>
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
                name={isFormspreeEndpoint(endpoint) ? '_gotcha' : 'website'}
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
            {useEmailDraft && (
              <p className="form-note">
                {variant === 'editorial'
                  ? 'Je verstuurt de aanvraag zelf vanuit je mailprogramma.'
                  : 'Vul je gegevens in en maak hieronder je e-mail klaar. Je verstuurt de aanvraag zelf vanuit je mailprogramma.'}
              </p>
            )}
            {(state === 'error' || state === 'draft') && (
              <div
                role="status"
                className={state === 'draft' ? 'form-email' : 'form-error'}
                aria-live="polite"
              >
                <p>{feedback}</p>
                {delivery === 'direct' ? (
                  <a className="text-link" href={business.phoneHref}>
                    Bel Mouline <ArrowUpRight size={16} />
                  </a>
                ) : (
                  <a
                    className="text-link"
                    href={`mailto:${business.email}?subject=${encodeURIComponent(`${intent} via de website`)}&body=${encodeURIComponent(draft)}`}
                  >
                    Open je aanvraag in je mailprogramma{' '}
                    <ArrowUpRight size={16} />
                  </a>
                )}
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
                    {useEmailDraft
                      ? 'Maak e-mail klaar'
                      : 'Verstuur je aanvraag'}{' '}
                    <ArrowUpRight size={17} />
                  </>
                )}
              </button>
              <p>
                Je gegevens gebruiken we alleen <br />
                om je aanvraag te beantwoorden.
              </p>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
