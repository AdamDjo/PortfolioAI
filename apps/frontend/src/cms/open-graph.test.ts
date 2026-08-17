import { describe, expect, it } from 'vitest'

import { resolveSafeUrl } from './open-graph'

/**
 * These tests protect a security guard: `resolveSafeUrl` is what keeps a URL
 * entered in the admin from reaching an internal resource (SSRF). A regression
 * here would be silent in production, hence the explicit coverage of every known
 * escape form.
 */
describe('resolveSafeUrl', () => {
  it('accepte une URL publique en https', async () => {
    const url = await resolveSafeUrl('https://example.com/projet')
    expect(url?.href).toBe('https://example.com/projet')
  })

  it.each([
    ['loopback nommé', 'http://localhost:3000/'],
    ['sous-domaine de localhost', 'http://api.localhost/'],
    ['loopback IPv4', 'http://127.0.0.1/'],
    ['loopback IPv4 dans la plage /8', 'http://127.10.20.30/'],
    ['loopback IPv6', 'http://[::1]/'],
    ['adresse non spécifiée', 'http://0.0.0.0/'],
    ['métadonnées cloud (link-local)', 'http://169.254.169.254/latest/meta-data/'],
    ['réseau privé 10/8', 'http://10.0.0.5/'],
    ['réseau privé 172.16/12', 'http://172.16.4.4/'],
    ['réseau privé 192.168/16', 'http://192.168.1.1/'],
    ['plage CGNAT 100.64/10', 'http://100.64.0.1/'],
    ['unique-local IPv6', 'http://[fd00::1]/'],
    ['link-local IPv6', 'http://[fe80::1]/'],
    ['IPv4 encapsulée en IPv6', 'http://[::ffff:127.0.0.1]/'],
    ['IPv4 encapsulée, notation hexadécimale', 'http://[::ffff:7f00:1]/'],
    ['IPv4 encapsulée vers un réseau privé', 'http://[::ffff:10.0.0.1]/'],
    ['broadcast', 'http://255.255.255.255/'],
    ['multicast', 'http://224.0.0.1/'],
  ])('refuse une cible interne : %s', async (_label, target) => {
    expect(await resolveSafeUrl(target)).toBeNull()
  })

  it.each([
    ['schéma file', 'file:///etc/passwd'],
    ['schéma ftp', 'ftp://example.com/'],
    ['schéma data', 'data:text/html,<h1>x</h1>'],
    ['schéma javascript', 'javascript:alert(1)'],
  ])('refuse un schéma non http(s) : %s', async (_label, target) => {
    expect(await resolveSafeUrl(target)).toBeNull()
  })

  it('refuse une URL portant des identifiants', async () => {
    expect(await resolveSafeUrl('http://admin:secret@example.com/')).toBeNull()
  })

  it('refuse une chaîne qui n’est pas une URL', async () => {
    expect(await resolveSafeUrl('pas-une-url')).toBeNull()
  })

  it('refuse un hôte qui ne résout pas', async () => {
    expect(await resolveSafeUrl('https://hote-inexistant.invalid/')).toBeNull()
  })
})
