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
