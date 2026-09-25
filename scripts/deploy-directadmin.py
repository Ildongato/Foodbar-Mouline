#!/usr/bin/env python3
"""Upload only this build to /nieuw/ over verified explicit FTPS. Never delete."""
import argparse
import getpass
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
from urllib.parse import quote

TARGET = '/domains/mouline.be/public_html/nieuw/'
PARENT = '/domains/mouline.be/public_html/'
MANIFEST = 'deployment-manifest.json'


def setting(name):
    value = os.environ.get(name, '')
    if not value or any(c in value for c in '\r\n\0'):
        raise ValueError('Missing or invalid deployment setting: ' + name)
    return value


def config_quote(value):
    return '"' + value.replace('\\', '\\\\').replace('"', '\\"') + '"'


class Transport:
    def __init__(self):
        self.host = setting('MOULINE_FTP_HOST')
        self.port = setting('MOULINE_FTP_PORT')
        self.username = setting('MOULINE_FTP_USERNAME')
        self.password = os.environ.get('MOULINE_FTP_PASSWORD') or getpass.getpass('FTP password (hidden): ')
        if self.host != 'web0152.zxcs.be' or self.port != '21':
            raise ValueError('Unverified FTP host/port: deployment refused')
        if self.username != 'mouline' or setting('MOULINE_FTP_REMOTE_PATH') != TARGET:
            raise ValueError('Only the verified Mouline /nieuw/ target is permitted')
        if not self.password or any(c in self.password for c in '\r\n\0'):
            raise ValueError('Invalid FTP password')

    def request(self, path, *options):
        if not path.startswith(PARENT) or '..' in PurePosixPath(path).parts:
            raise ValueError('Path outside the audited web directory')
        config = '\n'.join([
            'url = ' + config_quote('ftp://' + self.host + ':' + self.port + quote(path, safe='/')),
            'user = ' + config_quote(self.username + ':' + self.password),
        ])
        result = subprocess.run(
            ['curl', '-q', '--config', '-', '--ssl-reqd', '--tlsv1.2', '--silent',
             '--show-error', '--connect-timeout', '20', '--max-time', '90',
             '--globoff', '--ftp-skip-pasv-ip',
             *(['--cacert', os.environ['MOULINE_FTP_CA_FILE']] if os.environ.get('MOULINE_FTP_CA_FILE') else []), *options],
            input=config.encode(), stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        )
        if result.returncode:
            # Do not print curl stderr/config: no credentials or server internals in logs.
            raise RuntimeError('FTPS operation failed (curl exit %d); no deletion performed' % result.returncode)
        return result.stdout

    def inventory(self, path):
        raw = self.request(path, '--request', 'MLSD').decode('utf-8')
        entries = {}
        for line in raw.splitlines():
            facts, name = line.split(' ', 1)
            attributes = dict(part.split('=', 1) for part in facts.split(';') if '=' in part)
            kind = attributes.get('type', '').lower()
            if kind in ('cdir', 'pdir') or name in ('.', '..'):
                continue
            if '/' in name or name in entries:
                raise ValueError('Unexpected FTP directory listing')
            entries[name] = attributes
        return entries

    def upload(self, relative, path):
        if not safe_relative(relative):
            raise ValueError('Invalid build path')
        self.request(TARGET + relative, '--ftp-create-dirs', '--upload-file', str(path))


def safe_relative(path):
    return bool(re.fullmatch(r'[A-Za-z0-9_.\-/]+', path)) and not path.startswith('/') and all(
        part not in ('', '.', '..') for part in path.split('/'))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check-only', action='store_true')
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    build = root / 'dist-directadmin'
    html = (build / 'index.html').read_text()
    if '/nieuw/assets/' not in html or '/Foodbar-Mouline/' in html:
        raise ValueError('Wrong build: expected /nieuw/ asset paths')
    files = {}
    for path in build.rglob('*'):
        if path.is_symlink():
            raise ValueError('Build symlinks are forbidden')
        if path.is_file():
            relative = path.relative_to(build).as_posix()
            if not safe_relative(relative) or relative == MANIFEST:
                raise ValueError('Unsafe/reserved build file')
            files[relative] = path
    if not {'index.html', '.htaccess', 'api/contact.php'} <= files.keys():
        raise ValueError('Incomplete DirectAdmin build')
    ftp = Transport()
    before = ftp.inventory(PARENT)
    production_hash = hashlib.sha256(ftp.request(PARENT + 'index.html')).hexdigest()
    remote = {}
    owned = set()
    previous_hashes = {}
    if 'nieuw' in before:
        if before['nieuw'].get('type') != 'dir':
            raise ValueError('Test directory must be a real directory, never a symlink')
        def walk(path, prefix=''):
            for name, facts in ftp.inventory(path).items():
                relative = prefix + name
                if not safe_relative(relative):
                    raise ValueError('Unexpected remote file name')
                if facts.get('type') == 'dir':
                    walk(path + name + '/', relative + '/')
                elif facts.get('type') == 'file':
                    remote[relative] = facts
                else:
                    raise ValueError('Remote symlink or unsupported file type: deployment refused')
        walk(TARGET)
        if remote:
            if MANIFEST not in remote:
                raise ValueError('Existing /nieuw/ files have no ownership manifest; manual review required')
            previous = json.loads(ftp.request(TARGET + MANIFEST))
            if previous.get('target') != TARGET or previous.get('schema') != 1:
                raise ValueError('Invalid ownership manifest')
            owned = set(previous['files'])
            previous_hashes = previous['files']
        for relative in files:
            if relative in remote and relative not in owned:
                raise ValueError('Refusing to overwrite an unowned remote file: ' + relative)
    print('Verified FTPS, target, ownership and production index. Build files:', len(files), flush=True)
    if args.check_only:
        print('Read-only check completed; no uploads performed.')
        return
    # Assets and PHP first, homepage last. Retain all previous hashed assets for rollback.
    for relative in sorted(files, key=lambda p: (p == 'index.html', p)):
        ftp.upload(relative, files[relative])
    manifest = {
        'schema': 1, 'target': TARGET, 'commit': os.environ.get('GITHUB_SHA', 'manual'),
        'files': {**previous_hashes, **{name: hashlib.sha256(path.read_bytes()).hexdigest() for name, path in files.items()}},
    }
    # Keep manifest outside the build so it cannot recursively include itself.
    import tempfile
    with tempfile.TemporaryDirectory() as scratch:
        path = Path(scratch) / MANIFEST
        path.write_text(json.dumps(manifest, indent=2) + '\n')
        ftp.upload(MANIFEST, path)
    after = ftp.inventory(PARENT)
    for listing in (before, after):
        listing.pop('nieuw', None)
    if before != after or hashlib.sha256(ftp.request(PARENT + 'index.html')).hexdigest() != production_hash:
        raise RuntimeError('Production verification changed unexpectedly; inspect before further action')
    if ftp.request(TARGET + 'index.html') != files['index.html'].read_bytes():
        raise RuntimeError('Uploaded homepage does not match build')
    print('Upload verified. Existing production files unchanged. No remote files deleted.')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, RuntimeError) as error:
        print('Deployment stopped:', error, file=sys.stderr)
        sys.exit(1)
