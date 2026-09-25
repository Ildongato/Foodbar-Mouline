"""Exercise the real PHP handler in isolated processes; mail transport is stubbed."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import uuid

handler = str(Path(__file__).resolve().parent.parent / 'hosting/mouline-contact.php')
bootstrap = r'''
namespace MoulineContact;
function file_get_contents($path, ...$args) {
    return $path === 'php://input' ? getenv('TEST_PAYLOAD') : \file_get_contents($path, ...$args);
}
function sys_get_temp_dir() { return getenv('TEST_DIR'); }
function mail($to, $subject, $body, $headers, $params) {
    \file_put_contents(getenv('TEST_DIR').'/mail.jsonl', json_encode(compact('to','subject','body','headers','params'))."\n", FILE_APPEND);
    return getenv('TEST_MAIL_FAIL') !== '1';
}
$_SERVER = json_decode(getenv('TEST_SERVER'), true);
register_shutdown_function(function () { echo "\nHTTP:".(http_response_code() ?: 200); });
require getenv('TEST_HANDLER');
'''
values = dict(intent='Andere vraag', name='Technische ééntest', email='test@example.com', phone='0312345678', date='2099-10-01', time='10:00', partySize='20', occasion='Ontbijtmeeting', message='Test met é en café.', website='')
with tempfile.TemporaryDirectory() as folder:
    def request(data=values, key=None, origin='https://www.mouline.be', method='POST', content_type='application/json', fail=False):
        server = dict(HTTP_ORIGIN=origin, REQUEST_METHOD=method, CONTENT_TYPE=content_type, HTTP_IDEMPOTENCY_KEY=key or str(uuid.uuid4()), REMOTE_ADDR='192.0.2.1')
        env = {**os.environ, 'TEST_DIR': folder, 'TEST_HANDLER': handler, 'TEST_PAYLOAD': json.dumps(data), 'TEST_SERVER': json.dumps(server), 'TEST_MAIL_FAIL': '1' if fail else '0'}
        proc = subprocess.run(['php', '-r', bootstrap], env=env, capture_output=True, text=True, check=True)
        body, status = proc.stdout.rsplit('\nHTTP:', 1)
        return int(status), json.loads(body)
    assert request({})[0] == 400
    assert request(origin='https://evil.example')[0] == 403
    assert request(method='GET')[0] == 405
    assert request(content_type='text/plain')[0] == 415
    assert request({**values, 'website':'spam'})[0] == 400
    assert request({**values, 'email':'x@example.com\r\nBcc: other@example.com'})[0] == 422
    assert request({**values, 'intent':'Reservatie', 'date':'2020-01-01'})[0] == 422
    assert request({**values, 'intent':'Catering', 'occasion':''})[0] == 422
    assert not Path(folder, 'mail.jsonl').exists()
    for intent in ['Reservatie', 'Catering', 'Andere vraag']:
        payload = {**values, 'intent':intent}
        key = str(uuid.uuid4())
        status, response = request(payload, key)
        assert status == 200 and response['ok'] is True
        if intent == 'Reservatie': assert 'bevestigd' in response['message']
        assert request(payload, key) == (status, response)
        assert request({**payload, 'message':'Changed'}, key)[0] == 409
    records = [json.loads(x) for x in Path(folder, 'mail.jsonl').read_text().splitlines()]
    assert len(records) == 3, 'Retries must not send duplicate mail'
    for record in records:
        assert record['to'] == 'info@mouline.be'
        assert record['headers']['Reply-To'] == 'test@example.com'
        assert record['headers']['Content-Type'] == 'text/plain; charset=UTF-8'
    status, response = request(fail=True)
    assert status == 502 and response['ok'] is False
    for _ in range(6): request(fail=True)
    assert request()[0] == 429
print('PHP handler passed: all three intents, validation, injection, honeypot, origin, duplicate protection, real failure response and rate limit. No email sent.')
