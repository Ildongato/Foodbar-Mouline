import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// Exercise the pure modules without introducing a test framework or browser dependency.
async function loadModule(path) {
  const input = await readFile(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(input, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
  );
}
const calendar = await loadModule('../lib/closures.ts');
const delivery = await loadModule('../lib/contact-delivery.ts');

for (const year of [2024, 2025, 2026, 2027, 2030, 2100]) {
  const days = calendar.statutoryHolidays(year);
  assert.equal(days.length, 10);
  assert.equal(new Set(days.map((day) => day.date)).size, 10);
  for (const { date, reason } of days)
    assert(calendar.closureReasons(date).includes(reason));
}
assert.deepEqual(
  calendar
    .statutoryHolidays(2026)
    .filter((d) =>
      ['Paasmaandag', 'Hemelvaart', 'Pinkstermaandag'].includes(d.reason),
    )
    .map((d) => d.date),
  ['2026-04-06', '2026-05-14', '2026-05-25'],
);
assert.deepEqual(
  calendar
    .statutoryHolidays(2027)
    .filter((d) =>
      ['Paasmaandag', 'Hemelvaart', 'Pinkstermaandag'].includes(d.reason),
    )
    .map((d) => d.date),
  ['2027-03-29', '2027-05-06', '2027-05-17'],
);
assert.deepEqual(calendar.closureReasons('2026-07-18'), []);
assert(calendar.closureReasons('2026-07-19').includes('Jaarlijkse vakantie'));
assert(calendar.closureReasons('2031-07-30').includes('Jaarlijkse vakantie'));
assert.deepEqual(calendar.closureReasons('2026-07-31'), []);
assert(calendar.closureReasons('2026-11-12').includes('Brugdag'));
assert(calendar.closureReasons('2027-05-07').includes('Brugdag'));
assert.deepEqual(calendar.closureReasons('2027-11-12'), []);
assert.equal(
  calendar.brusselsDate(new Date('2026-12-31T23:30:00Z')),
  '2027-01-01',
);
assert.equal(
  calendar.brusselsDate(new Date('2026-07-18T22:30:00Z')),
  '2026-07-19',
);
assert.equal(calendar.getClosureNotice(new Date('2026-09-24T12:00:00Z')), null);
assert.match(
  calendar.getClosureNotice(new Date('2026-09-24T12:00:00Z'), true).detail,
  /^Demo/,
);
const bridge = calendar.getClosureNotice(new Date('2027-05-06T12:00:00Z'));
assert.match(bridge.detail, /Hemelvaart · Brugdag/);
assert.match(bridge.message, /7 mei 2027/);
assert.match(
  calendar.getClosureNotice(new Date('2026-07-21T12:00:00Z')).detail,
  /19 juli 2026 t.e.m. 30 juli 2026/,
);

const values = {
  intent: 'Andere vraag',
  name: ' Test ',
  email: ' test@example.com ',
  phone: '0312345678',
  date: '2026-10-01',
  time: '10:00',
  partySize: '4',
  occasion: '',
  message: 'Een testbericht.',
  website: '',
};
const original = structuredClone(values);
// Test-only URL passed to an injected fetch function: no network or mail is sent.
const testEndpoint = 'https://formspree.io/f/testonly';
let sent;
const success = await delivery.sendContact(
  testEndpoint,
  values,
  'test-id',
  async (url, request) => {
    sent = { url, ...request, body: JSON.parse(request.body) };
    return Response.json({ ok: true });
  },
);
assert.match(success, /Bedankt/);
assert.equal(sent.method, 'POST');
assert.equal(sent.headers.Accept, 'application/json');
assert.equal(sent.headers['Idempotency-Key'], undefined);
assert.equal(sent.body.email, 'test@example.com');
assert.equal(sent.body._gotcha, '');
assert.equal(sent.body.date, undefined); // stale hidden fields must not leak into another intent
assert.equal(sent.body.time, undefined);
await assert.rejects(
  delivery.sendContact('', values, 'test-id'),
  /nog niet beschikbaar/,
);
await assert.rejects(
  delivery.sendContact(testEndpoint, values, 'test-id', async () =>
    Response.json(
      { errors: [{ field: 'email', message: 'Invalid email' }] },
      { status: 422 },
    ),
  ),
  (error) => Boolean(error.fields.email),
);
await assert.rejects(
  delivery.sendContact(testEndpoint, values, 'test-id', async () =>
    Response.json({ error: 'Unavailable' }, { status: 503 }),
  ),
  /gegevens blijven ingevuld/,
);
await assert.rejects(
  delivery.sendContact(testEndpoint, values, 'test-id', async () =>
    Response.json({}),
  ),
  /Versturen lukt/,
);
await assert.rejects(
  delivery.sendContact(testEndpoint, values, 'test-id', async () => {
    throw new TypeError('Network unavailable');
  }),
  /Network unavailable/,
);
assert.deepEqual(values, original);
console.log(
  'Passed: statutory holidays, timezone and vacation boundaries, bridge-day ranges, demo isolation, Formspree POST/Reply-To/honeypot, success/error and input preservation. No email sent.',
);

// Own-host endpoint must explicitly acknowledge delivery; HTTP 200 alone is insufficient.
for (const response of [{}, {ok:false}]) {
  await assert.rejects(delivery.sendContact('/nieuw/api/contact.php', values, 'request-id', async()=>Response.json(response)), /Versturen lukt/);
}
assert.equal(await delivery.sendContact('/nieuw/api/contact.php', values, 'request-id', async(url, request)=>{
  assert.equal(request.headers['Idempotency-Key'], 'request-id');
  assert.equal(JSON.parse(request.body).website, '');
  return Response.json({ok:true, message:'Ontvangen door server'});
}), 'Ontvangen door server');
console.log('Own-host delivery acknowledgement and idempotency header passed.');
