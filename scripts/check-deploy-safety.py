"""Offline tests: unsafe settings/paths cannot reach curl."""
import importlib.util
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('deploy', __file__.replace('check-deploy-safety.py', 'deploy-directadmin.py'))
deploy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deploy)
settings = {
    'MOULINE_FTP_HOST': 'web0152.zxcs.be', 'MOULINE_FTP_PORT': '21',
    'MOULINE_FTP_USERNAME': 'mouline', 'MOULINE_FTP_PASSWORD': 'offline-test-only',
    'MOULINE_FTP_REMOTE_PATH': deploy.TARGET,
}
for key, value in [('MOULINE_FTP_REMOTE_PATH', deploy.PARENT), ('MOULINE_FTP_REMOTE_PATH', deploy.TARGET + '../'), ('MOULINE_FTP_HOST', 'unverified.example'), ('MOULINE_FTP_PORT', '22')]:
    with patch.dict('os.environ', {**settings, key: value}), patch.object(deploy.subprocess, 'run') as run:
        try:
            deploy.Transport()
            raise AssertionError('Unsafe setting accepted')
        except ValueError:
            pass
        run.assert_not_called()
with patch.dict('os.environ', settings), patch.object(deploy.subprocess, 'run') as run:
    transport = deploy.Transport()
    for path in ['/index.html', '../index.html', 'assets/../../index.html', 'assets//x', 'x\nDELE index.html']:
        try:
            transport.upload(path, '/unused')
            raise AssertionError('Unsafe upload accepted')
        except ValueError:
            pass
    run.assert_not_called()
assert deploy.safe_relative('assets/home-abc123.js')
assert deploy.safe_relative('.htaccess')
print('Deployment guards passed: production target, wrong host/port and path traversal refused before network access.')

# Run the real deployment orchestration against an in-memory FTP filesystem.
import hashlib
import sys
import tempfile
from pathlib import Path

class FakeFTP:
    def __init__(self):
        self.files = {deploy.PARENT + 'index.html': b'OLD PRODUCTION'}
        self.uploads = []
        self.fail_on = None
    def request(self, path, *options):
        return self.files[path]
    def inventory(self, path):
        entries = {}
        for name, content in self.files.items():
            if not name.startswith(path): continue
            rest = name[len(path):]
            if '/' in rest:
                entries[rest.split('/')[0]] = {'type':'dir'}
            else:
                entries[rest] = {'type':'file', 'size':str(len(content))}
        return entries
    def upload(self, relative, path):
        assert deploy.safe_relative(relative)
        if relative == self.fail_on: raise RuntimeError('simulated interrupted upload')
        self.uploads.append(relative)
        self.files[deploy.TARGET + relative] = Path(path).read_bytes()

with tempfile.TemporaryDirectory() as scratch:
    root = Path(scratch)
    build = root / 'dist-directadmin'
    (build / 'api').mkdir(parents=True)
    (build / 'assets').mkdir()
    for name, data in {'index.html':'<script src="/nieuw/assets/app.js"></script>', 'api/contact.php':'<?php', '.htaccess':'Options -Indexes', 'assets/app.js':'example'}.items():
        (build / name).write_text(data)
    fake = FakeFTP()
    with patch.object(deploy, '__file__', str(root / 'scripts/deploy-directadmin.py')), patch.object(deploy, 'Transport', return_value=fake):
        with patch.object(sys, 'argv', ['deploy', '--check-only']): deploy.main()
        assert fake.uploads == []
        with patch.object(sys, 'argv', ['deploy']):
            fake.fail_on = 'assets/app.js'
            try: deploy.main()
            except RuntimeError: pass
            assert deploy.TARGET + deploy.MANIFEST in fake.files
            fake.fail_on = None
            deploy.main()
            assert fake.files[deploy.PARENT + 'index.html'] == b'OLD PRODUCTION'
            fake.uploads.clear()
            deploy.main()
            assert fake.uploads == [deploy.MANIFEST, 'index.html', deploy.MANIFEST]
            assert fake.files[deploy.PARENT + 'index.html'] == b'OLD PRODUCTION'
print('Full orchestration passed: read-only mode, interrupted-first-upload recovery, production preservation and unchanged-asset reuse.')
