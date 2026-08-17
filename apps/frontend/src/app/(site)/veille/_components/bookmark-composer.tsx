'use client'

import { Link2, Loader2, Plus } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

import { EASE_OUT_QUINT } from '@/components/motion/primitives'
import { canonicalizeUrl } from '@/lib/canonical-url'

/**
 * Formulaire d'ajout réservé à l'administrateur connecté.
 *
 * Il n'est rendu que lorsque la session Payload est valide, et l'API refuse de
 * toute façon l'écriture sans session : le contrôle visuel est un confort, pas la
 * barrière de sécurité.
 *
 * L'intérêt de l'avoir ici plutôt que dans `/admin` est le geste sur téléphone :
 * coller un lien depuis la page publique, sans détour par l'administration.
 */
function BookmarkComposer() {
  const router = useRouter()
  const [draft, setDraft] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function addBookmark(raw: string) {
    const url = canonicalizeUrl(raw)
    if (!url) {
      setMessage('Ce lien ne ressemble pas à une URL valide.')
      return
    }

    setStatus('saving')
    setMessage(null)

    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // La session Payload voyage par cookie : rien à porter à la main.
        credentials: 'include',
        body: JSON.stringify({ url }),
      })

      if (response.status === 403 || response.status === 401) {
        setMessage('Session expirée. Reconnecte-toi depuis /admin.')
        return
      }

      if (!response.ok) {
        // Le cas le plus fréquent est la violation d'unicité sur l'URL.
        setMessage('Ce lien existe déjà ou n’a pas pu être enregistré.')
        return
      }

      setDraft('')
      // La liste est rendue côté serveur : on demande un nouveau rendu plutôt
      // que de dupliquer l'état de la collection dans le navigateur.
      router.refresh()
    } catch {
      setMessage('Enregistrement impossible. Vérifie ta connexion.')
    } finally {
      setStatus('idle')
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'saving') return
    void addBookmark(draft)
  }

  const saving = status === 'saving'

  return (
    <>
      <form className="search-bar veille-add-bar" onSubmit={submit}>
        <Link2 size={17} />
        <label className="sr-only" htmlFor="veille-url">
          Ajouter un lien
        </label>
        <input
          id="veille-url"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            setMessage(null)
          }}
          onPaste={(event) => {
            const pasted = event.clipboardData.getData('text')
            if (canonicalizeUrl(pasted)) {
              event.preventDefault()
              setDraft(pasted)
              void addBookmark(pasted)
            }
          }}
          placeholder="Collez votre lien ici…"
          inputMode="url"
          autoComplete="off"
          aria-invalid={message !== null}
          disabled={saving}
        />
        <button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="veille-spinner" size={14} /> Ajout…
            </>
          ) : (
            <>
              <Plus size={14} /> Ajouter
            </>
          )}
        </button>
      </form>
      <AnimatePresence>
        {message ? (
          <m.p
            className="veille-error"
            role="alert"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT_QUINT }}
          >
            {message}
          </m.p>
        ) : null}
      </AnimatePresence>
    </>
  )
}

export { BookmarkComposer }
