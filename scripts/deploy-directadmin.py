#!/usr/bin/env python3
"""Upload only owned website files over verified explicit FTPS. Never delete."""
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

PARENT = '/domains/mouline.be/public_html/'
STAGING = PARENT + 'nieuw/'
PRODUCTION = os.environ.get('MOULINE_DEPLOY_ENV') == 'production'
TARGET = PARENT if PRODUCTION else STAGING
PHYSICAL_TARGET = '/home/mouline' + TARGET
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
        if self.username != 'mouline' or setting('MOULINE_FTP_REMOTE_PATH') not in (TARGET, PHYSICAL_TARGET):
            raise ValueError('Only the verified target for this build environment is permitted')
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
             '--globoff', '--ftp-skip-pasv-ip', '--retry', '2', '--retry-delay', '2',
             *(['--cacert', os.environ['MOULINE_FTP_CA_FILE']] if os.environ.get('MOULINE_FTP_CA_FILE') else []), *options],
            input=config.encode(), stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        )
        if result.returncode:
            # Curl's non-verbose error is useful for connectivity diagnosis. Never
            # emit configuration or credentials, even if curl includes input text.
            detail = result.stderr.decode('utf-8', errors='replace').replace(self.password, '[redacted]').strip()
            raise RuntimeError('FTPS operation failed (curl exit %d): %s; no deletion performed' % (result.returncode, detail[:300]))
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
        if not safe_relative(relative) or (PRODUCTION and relative.split('/')[0] == 'nieuw'):
            raise ValueError('Invalid build path')
        self.request(TARGET + relative, '--ftp-create-dirs', '--upload-file', str(path))


def safe_relative(path):
    return bool(re.fullmatch(r'[A-Za-z0-9_.\-/]+', path)) and not path.startswith('/') and all(
        part not in ('', '.', '..') for part in path.split('/'))


def verify_bootstrap(receipt_path, remote, files, ftp):
    """First root upload needs a verified full backup and unchanged source files.

    This is a one-time, local operation; GitHub never passes this option.
    A missing manifest in production always stops unattended deployment.
    """
    if not PRODUCTION or not receipt_path:
        raise ValueError('Production has no ownership manifest; a verified full backup is required')
    import tarfile
    receipt = json.loads(Path(receipt_path).read_text())
    if receipt.get('verified') is not True or receipt.get('source') != PARENT:
        raise ValueError('Invalid full-backup receipt')
    archive = Path(receipt['local_archive'])
    if hashlib.sha256(archive.read_bytes()).hexdigest() != receipt['archive_sha256']:
        raise ValueError('Full-backup archive checksum mismatch')
    with tarfile.open(archive, 'r:gz') as backup:
        archived = {member.name.removeprefix('public_html/'): member
                    for member in backup.getmembers() if member.isfile()}
        if set(archived) != set(receipt['files']) or 'nieuw/index.html' not in archived:
            raise ValueError('Incomplete full backup')
        for name, member in archived.items():
            if hashlib.sha256(backup.extractfile(member).read()).hexdigest() != receipt['files'][name]:
                raise ValueError('Corrupt backup member: ' + name)
    # Only reviewed build collisions may be adopted. Verify original bytes first.
    for name in files:
        if name in remote:
            if name not in receipt['files']:
                raise ValueError('Unreviewed production collision: ' + name)
            if hashlib.sha256(ftp.request(TARGET + name)).hexdigest() != receipt['files'][name]:
                raise ValueError('Production changed since backup: ' + name)
    if hashlib.sha256(ftp.request(STAGING + 'index.html')).hexdigest() != receipt['staging_index_sha256']:
        raise ValueError('Approved staging changed since backup')
    return {'path': receipt['server_path'], 'sha256': receipt['archive_sha256'],
            'old_index_sha256': receipt['old_index_sha256']}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check-only', action='store_true')
    parser.add_argument('--bootstrap-receipt', help='Local verified full-backup receipt, first root upload only')
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    build = root / 'dist-directadmin'
    html = (build / 'index.html').read_text()
    base = '/' if PRODUCTION else '/nieuw/'
    if base + 'assets/' not in html or '/Foodbar-Mouline/' in html or (PRODUCTION and '/nieuw/' in html):
        raise ValueError('Wrong build base path')
    files = {}
    for path in build.rglob('*'):
        if path.is_symlink():
            raise ValueError('Build symlinks are forbidden')
        if path.is_file():
            relative = path.relative_to(build).as_posix()
            if not safe_relative(relative) or relative == MANIFEST or relative.split('/')[0] == 'nieuw':
                raise ValueError('Unsafe/reserved build file')
            files[relative] = path
    if not {'index.html', '.htaccess', 'api/contact.php'} <= files.keys():
        raise ValueError('Incomplete DirectAdmin build')
    ftp = Transport()
    before = ftp.inventory(PARENT)
    protected_path = STAGING if PRODUCTION else PARENT
    protected_index = ftp.request(protected_path + 'index.html')
    protected_manifest = ftp.request(STAGING + MANIFEST) if PRODUCTION else None
    remote = {}
    previous = {}
    # Inspect only directories used by the build; never descend into legacy backups.
    def walk(path, prefix=''):
        for name, facts in ftp.inventory(path).items():
            relative = prefix + name
            relevant_dir = any(file.startswith(relative + '/') for file in files)
            if facts.get('type') == 'dir':
                if relevant_dir:
                    walk(path + name + '/', relative + '/')
            elif facts.get('type') == 'file':
                if relevant_dir:
                    raise ValueError('Remote file blocks build directory: ' + relative)
                remote[relative] = facts
            elif relevant_dir or relative in files or relative == MANIFEST:
                raise ValueError('Remote symlink or unsupported file type: deployment refused')
    if PRODUCTION or 'nieuw' in before:
        if not PRODUCTION and before['nieuw'].get('type') != 'dir':
            raise ValueError('Test directory must be a real directory')
        walk(TARGET)
    if MANIFEST in remote:
        previous = json.loads(ftp.request(TARGET + MANIFEST))
        if previous.get('target') != TARGET or previous.get('schema') != 1:
            raise ValueError('Invalid ownership manifest')
        if args.bootstrap_receipt:
            raise ValueError('Production already has a manifest; do not bootstrap again')
        owned = set(previous['files'])
        for relative in files:
            if relative in remote and relative not in owned:
                raise ValueError('Refusing to overwrite an unowned remote file: ' + relative)
    elif PRODUCTION:
        previous['initial_backup'] = verify_bootstrap(args.bootstrap_receipt, remote, files, ftp)
    elif remote:
        raise ValueError('Existing staging files have no ownership manifest; manual review required')
    # Backups and arbitrary files cannot be claimed by a corrupt manifest.
    if any(not safe_relative(name) or name.split('/')[0] == 'nieuw' for name in previous.get('files', {})):
        raise ValueError('Invalid managed file path in manifest')
    previous_hashes = previous.get('files', {})
    print('Verified FTPS, target, ownership and protected site. Build files:', len(files), flush=True)
    if args.check_only:
        print('Read-only check completed; no uploads performed.')
        return
    hashes = {name: hashlib.sha256(path.read_bytes()).hexdigest() for name, path in files.items()}
    manifest = {
        'schema': 1, 'target': TARGET, 'commit': os.environ.get('GITHUB_SHA', 'manual'),
        'status': 'deploying', 'files': {**previous_hashes, **hashes},
    }
    if previous.get('initial_backup'):
        manifest['initial_backup'] = previous['initial_backup']
    import tempfile
    with tempfile.TemporaryDirectory() as scratch:
        path = Path(scratch) / MANIFEST
        path.write_text(json.dumps(manifest, indent=2) + '\n')
        ftp.upload(MANIFEST, path)
        uploaded = 0
        # All new dependencies first, root routing next, entry point last.
        for relative in sorted(files, key=lambda p: (p == 'index.html', p == '.htaccess', p)):
            unchanged = (previous.get('status') == 'complete' and relative in remote
                         and previous_hashes.get(relative) == hashes[relative]
                         and remote[relative].get('size') == str(files[relative].stat().st_size))
            if unchanged and relative != 'index.html':
                continue
            ftp.upload(relative, files[relative])
            uploaded += 1
            if uploaded % 20 == 0:
                print('Uploaded build files:', uploaded, flush=True)
        if ftp.request(TARGET + 'index.html') != files['index.html'].read_bytes():
            raise RuntimeError('Uploaded homepage does not match build')
        if ftp.request(protected_path + 'index.html') != protected_index:
            raise RuntimeError('Protected site changed unexpectedly')
        if PRODUCTION:
            if ftp.request(STAGING + MANIFEST) != protected_manifest:
                raise RuntimeError('Staging manifest changed unexpectedly')
        else:
            after = ftp.inventory(PARENT)
            before.pop('nieuw', None); after.pop('nieuw', None)
            if before != after:
                raise RuntimeError('Production inventory changed unexpectedly')
        manifest['status'] = 'complete'
        from datetime import datetime, timezone
        manifest['deployed_at'] = datetime.now(timezone.utc).isoformat()
        path.write_text(json.dumps(manifest, indent=2) + '\n')
        ftp.upload(MANIFEST, path)
    print('Uploaded', uploaded, 'files; unchanged owned assets retained.', flush=True)
    print('Upload verified. Protected site unchanged. No remote files deleted.')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, RuntimeError) as error:
        print('Deployment stopped:', error, file=sys.stderr)
        sys.exit(1)
