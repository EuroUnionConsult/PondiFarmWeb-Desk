#!/usr/bin/env node
// PondiFarm Web must ship with the same version as the iPhone app (PondiFarmApp).
// Rule: iPhone, web desktop and web mobile ship together; none lags behind.
//
// Source of truth: mobile/src/lib/version.ts in PondiFarmApp (release-please updates it on
// every release). This script compares it with the four places the web keeps a version:
//   src/lib/version.ts · package.json · app.json · package-lock.json (root entries)
//
// Usage:
//   npm run version:check            # exit 1 if anything differs
//   npm run version:sync             # write the PondiFarmApp version into the four files
// Where the PondiFarmApp version comes from (first that works):
//   1. PONDIFARM_APP_DIR=/path/to/PondiFarmApp (or ../PondiFarmApp next to this repo)
//   2. GitHub: EuroUnionConsult/PondiFarmApp, branch main (public repo, no token needed)
//   --ref=<branch|tag> picks another ref on GitHub, e.g. --ref=v0.10.1.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = 'EuroUnionConsult/PondiFarmApp';
const VERSION_FILE = 'mobile/src/lib/version.ts';
const RE = /APP_VERSION\s*=\s*'([^']+)'/;

const args = process.argv.slice(2);
const fix = args.includes('--fix');
const ref = (args.find((a) => a.startsWith('--ref=')) ?? '--ref=main').slice(6);

async function appVersion() {
  const dirs = [process.env.PONDIFARM_APP_DIR, join(ROOT, '..', 'PondiFarmApp')].filter(Boolean);
  if (!args.some((a) => a.startsWith('--ref='))) {
    for (const d of dirs) {
      const f = join(d, VERSION_FILE);
      if (existsSync(f)) {
        const m = readFileSync(f, 'utf8').match(RE);
        if (m) return { version: m[1], from: f };
      }
    }
  }
  const url = `https://raw.githubusercontent.com/${REPO}/${encodeURIComponent(ref)}/${VERSION_FILE}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`could not read ${url}: HTTP ${res.status}`);
  const m = (await res.text()).match(RE);
  if (!m) throw new Error(`no APP_VERSION in ${url}`);
  return { version: m[1], from: url };
}

const files = {
  'src/lib/version.ts': {
    read: (t) => t.match(RE)?.[1],
    write: (t, v) => t.replace(RE, `APP_VERSION = '${v}'`),
  },
  'package.json': {
    read: (t) => JSON.parse(t).version,
    write: (t, v) => t.replace(/("version":\s*")[^"]+(")/, `$1${v}$2`),
  },
  'app.json': {
    read: (t) => JSON.parse(t).expo?.version,
    write: (t, v) => t.replace(/("version":\s*")[^"]+(")/, `$1${v}$2`),
  },
  'package-lock.json': {
    read: (t) => {
      const j = JSON.parse(t);
      return j.version === j.packages?.['']?.version ? j.version : `${j.version} / ${j.packages?.['']?.version}`;
    },
    write: (t, v) => {
      const j = JSON.parse(t);
      j.version = v;
      if (j.packages?.['']) j.packages[''].version = v;
      return `${JSON.stringify(j, null, 2)}\n`;
    },
  },
};

const { version, from } = await appVersion();
let bad = 0;
for (const [name, f] of Object.entries(files)) {
  const path = join(ROOT, name);
  const text = readFileSync(path, 'utf8');
  const v = f.read(text);
  if (v === version) { console.log(`ok   ${name} ${v}`); continue; }
  if (fix) {
    writeFileSync(path, f.write(text, version));
    console.log(`set  ${name} ${v} -> ${version}`);
  } else {
    console.log(`DIFF ${name} ${v} (PondiFarmApp: ${version})`);
    bad += 1;
  }
}
console.log(`PondiFarmApp version ${version} (${from})`);
if (bad) {
  console.error(`\n${bad} file(s) out of sync. Run: npm run version:sync`);
  process.exit(1);
}
