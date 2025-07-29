import crypto from 'crypto';

export function getSha1(str: string): string {
  const hash = crypto.createHash('sha1');
  hash.update(str, 'utf8');
  return hash.digest('hex').toLowerCase();
}

// compare semver
export function compareSemver(a: string, b: string): number {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;

    if (aPart !== bPart) {
      return aPart - bPart;
    }
  }

  return 0;
}

// next semver version
export function nextSemver(version: string, patch?: number, major?: number, minor?: number): string {
  const parts = version.split('.');

  if (typeof major !== 'number')
    major = 0;
  if (typeof minor !== 'number')
    minor = 0;
  if (typeof patch !== 'number')
    patch = 0;

  major += parseInt(parts[0], 10);
  minor += parseInt(parts[1], 10);
  patch += parseInt(parts[2], 10);

  return `${major}.${minor}.${patch}`;
}

// 15.14.1 -> 25.14
export function toGamePatch(version: string) {
  let parts = version.split('.');
  let major = parseInt(parts[0], 10);
  let minor = parseInt(parts[1], 10);
  return `${major + 10}.${minor}`;
}

// fetch the latest LoL patch version
export async function getLatestLoLPatch() {
  const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
  const versions = await res.json();
  return versions[0];
}