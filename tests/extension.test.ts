import { describe, expect, it } from 'vitest';
import { destination, siteOrigin } from '../extension/urls.mjs';
import { readFileSync } from 'node:fs';
describe('extension companion', () => {
  it('only accepts website origins or explicit loopback HTTP', () => {
    expect(destination('http://127.0.0.1:8085', '/tracker')).toBe('http://127.0.0.1:8085/tracker');
    expect(siteOrigin('https://atlas.example/')).toBe('https://atlas.example');
    for (const value of ['javascript:alert(1)', 'file:///C:/x', 'http://example.com', 'https://user:pass@example.com', 'https://example.com/path', 'https://example.com?token=1']) expect(() => siteOrigin(value)).toThrow();
    expect(() => destination('https://atlas.example', '//example.com')).toThrow();
  });
  it('ships only a storage permission and local executable code', () => {
    const manifest = JSON.parse(readFileSync('extension/manifest.json', 'utf8'));
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.permissions).toEqual(['storage']);
    expect(manifest.host_permissions).toBeUndefined();
    expect(manifest.content_security_policy.extension_pages).toBe("script-src 'self'; object-src 'none'");
  });
});
