import { describe, expect, it } from 'vitest'

import { buildContactMessage } from './contact-message'

const submission = {
  name: 'Camille',
  email: 'camille@example.com',
  subject: 'Une mission',
  message: 'Bonjour, deux mots sur le projet.',
}

/**
 * The body is rendered as Markdown by the vendor, so visitor input reaches a
 * renderer. These cases pin the two things that would otherwise go unnoticed:
 * a reply that answers the visitor rather than a no-reply mailbox, and input
 * that stays text instead of becoming formatting.
 */
describe('buildContactMessage', () => {
  it('répond au visiteur, pas au domaine d’expédition', () => {
    expect(buildContactMessage(submission).replyTo).toBe(submission.email)
  })

  it('préfixe le sujet tout en gardant celui du visiteur', () => {
    const { subject } = buildContactMessage(submission)
    expect(subject).toBe('[Portfolio] Une mission')
  })

  it('reporte l’expéditeur et son adresse dans le corps', () => {
    const { text } = buildContactMessage(submission)
    expect(text).toContain('Camille')
    expect(text).toContain('camille@example.com')
    expect(text).toContain(submission.message)
  })

  it('neutralise le Markdown en début de ligne au lieu de le rendre', () => {
    const { text } = buildContactMessage({
      ...submission,
      message: '# Titre injecté\n- puce\n1. numéro\n> citation',
    })

    expect(text).toContain('\\# Titre injecté')
    expect(text).toContain('\\- puce')
    expect(text).toContain('\\1. numéro')
    expect(text).toContain('\\> citation')
  })

  it('laisse intact un dièse en milieu de ligne, qui n’est pas un titre', () => {
    const { text } = buildContactMessage({ ...submission, message: 'budget # 3' })
    expect(text).toContain('budget # 3')
  })

  it('échappe aussi le nom et le sujet, pas seulement le message', () => {
    const { text } = buildContactMessage({ ...submission, name: '# Faux titre' })
    expect(text).toContain('\\# Faux titre')
  })
})
