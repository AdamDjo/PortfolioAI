'use client'

import { useCallback, useRef, useState } from 'react'

/**
 * Drives the conversation with the public assistant.
 *
 * It owns the exchange — turns, streaming, errors, aborting, feedback — so the
 * hero stays a view. The route streams plain text, so consuming it is a read loop
 * with no protocol to decode.
 */

interface AssistantTurn {
  role: 'user' | 'assistant'
  content: string
}

type Feedback = 'useful' | 'not_useful'

/** Turns kept and replayed to the server, which holds no session of its own. */
const MAX_HISTORY_TURNS = 8

const NETWORK_ERROR =
  'La connexion a échoué. Vérifiez votre réseau et réessayez, ou contactez-moi directement.'

interface UseAssistantResult {
  turns: AssistantTurn[]
  /** Text streaming in right now; empty once the turn is complete. */
  streaming: string
  pending: boolean
  error: string | null
  /** The rating the visitor gave this conversation, or null while none is given. */
  feedback: Feedback | null
  ask: (question: string) => Promise<void>
  rate: (feedback: Feedback) => void
  reset: () => void
}

const useAssistant = (): UseAssistantResult => {
  const [turns, setTurns] = useState<AssistantTurn[]>([])
  const [streaming, setStreaming] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  // Held in a ref so a new question can cancel the one still streaming without
  // re-rendering on every keystroke.
  const abortRef = useRef<AbortController | null>(null)

  // The opaque id that ties this conversation's turns together server-side.
  // Created on the first question, kept until reset — a session, never an
  // identity. `crypto.randomUUID` matches the UUID the route validates.
  const conversationIdRef = useRef<string | null>(null)

  const ask = useCallback(
    async (question: string) => {
      const trimmed = question.trim()
      if (!trimmed) return

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      conversationIdRef.current ??= crypto.randomUUID()

      setError(null)
      setPending(true)
      setStreaming('')
      // A new question reopens the conversation to feedback: the visitor rates
      // the exchange as it stands, not an answer two turns back.
      setFeedback(null)

      // The question is appended before the call so it appears instantly; the
      // history sent along is the state before it, which is what the model needs.
      const history = turns.slice(-MAX_HISTORY_TURNS)
      setTurns((current) => [...current, { role: 'user', content: trimmed }])

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: trimmed,
            history,
            conversationId: conversationIdRef.current,
          }),
          signal: controller.signal,
        })

        // A spent allowance comes back as 429 with a plain-text notice. It is
        // content, not a failure to report: shown as the assistant's reply, it
        // keeps the conversation coherent and points the visitor to /contact.
        if (response.status === 429) {
          const notice = await response.text()
          setTurns((current) => [...current, { role: 'assistant', content: notice }])
          setStreaming('')
          return
        }

        if (!response.ok || !response.body) {
          setError(NETWORK_ERROR)
          return
        }

        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
        let answer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          answer += value
          setStreaming(answer)
        }

        // Moved into the turn list in one step, so the answer never flickers
        // between the streaming buffer and its final position.
        setTurns((current) => [...current, { role: 'assistant', content: answer }])
        setStreaming('')
      } catch (cause) {
        // An abort is a deliberate cancellation, not a failure to report.
        if (cause instanceof DOMException && cause.name === 'AbortError') return
        setError(NETWORK_ERROR)
      } finally {
        // A superseded request must not clear the flag of the one that replaced it.
        if (abortRef.current === controller) {
          setPending(false)
          abortRef.current = null
        }
      }
    },
    [turns]
  )

  const rate = useCallback((next: Feedback) => {
    const conversationId = conversationIdRef.current
    if (!conversationId) return

    // Optimistic: the rating is a courtesy, not a transaction. It shows at once,
    // and a failed write is swallowed rather than nagging the visitor.
    setFeedback(next)

    void fetch('/api/chat/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, rating: next }),
    }).catch(() => undefined)
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    conversationIdRef.current = null
    setTurns([])
    setStreaming('')
    setPending(false)
    setError(null)
    setFeedback(null)
  }, [])

  return { turns, streaming, pending, error, feedback, ask, rate, reset }
}

export { useAssistant, type AssistantTurn }
