'use client'

import { Send, ThumbsDown, ThumbsUp } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import { EASE_OUT_QUINT } from '@/components/motion/primitives'
import { useAssistant } from '@/hooks/use-assistant'
import { Link } from '@/i18n/navigation'
import { useChatBridge } from '@/stores/chat-bridge'

const FOLLOW_TAIL_THRESHOLD = 80

/**
 * The hero's chat card — the only part of the hero that needs the browser.
 *
 * Everything around it renders on the server. Other sections of the page start
 * a conversation through `useChatBridge` rather than through a ref, so they do
 * not have to share a client ancestor with this card.
 */
export function HeroChat({ retentionNotice }: { retentionNotice: string }) {
  const t = useTranslations('Home')
  const inputRef = useRef<HTMLInputElement>(null)
  const threadRef = useRef<HTMLDivElement>(null)
  const [question, setQuestion] = useState('')
  const { turns, streaming, pending, error, feedback, ask, rate } = useAssistant()
  const request = useChatBridge((state) => state.request)
  const started = turns.length > 0
  // Feedback is offered once the assistant has answered and nothing is streaming:
  // rating an answer still being written makes no sense.
  const canRate = turns.some((turn) => turn.role === 'assistant') && !pending && !streaming

  // Reading `scrollHeight` inside the effect would force a synchronous layout:
  // the effect runs right after React has committed the new turns, so the style
  // and layout of the thread are still invalid. Deferring the measurement to the
  // next frame lets the browser lay out once, on its own schedule.
  useEffect(() => {
    const thread = threadRef.current
    if (!thread) return

    const frame = window.requestAnimationFrame(() => {
      const distanceFromBottom = thread.scrollHeight - thread.scrollTop - thread.clientHeight
      if (distanceFromBottom > FOLLOW_TAIL_THRESHOLD) return

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      thread.scrollTo({ top: thread.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [turns, streaming, pending])

  // A prompt or shortcut elsewhere on the page asked to start a conversation:
  // prefill the question when there is one, then bring the input into view.
  useEffect(() => {
    if (!request) return
    if (request.question) setQuestion(request.question)
    const input = inputRef.current
    if (!input) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    input.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
    const frame = window.requestAnimationFrame(() => input.focus({ preventScroll: true }))
    return () => window.cancelAnimationFrame(frame)
  }, [request])

  function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!question.trim() || pending) return
    void ask(question)
    setQuestion('')
  }

  return (
    <m.div
      className="home-chat-card"
      id="conversation"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, delay: 0.22, ease: EASE_OUT_QUINT }}
    >
      <div className="chat-header">
        <span>{t('chat.header')}</span>
        <small>{t('chat.status')}</small>
      </div>

      {started ? null : (
        <div className="home-chat-intro">
          <strong>{t('chat.userMessage')}</strong>
          <span>{t('chat.aiMessage')}</span>
        </div>
      )}

      <div className="chat-thread" ref={threadRef} aria-live="polite" aria-busy={pending}>
        {turns.map((turn, index) =>
          turn.role === 'user' ? (
            <m.div
              key={`user-${index}`}
              className="message message-user"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {turn.content}
            </m.div>
          ) : (
            <m.div
              key={`assistant-${index}`}
              className="message-row"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="avatar">A</span>
              <div className="message message-ai">{turn.content}</div>
            </m.div>
          )
        )}

        {streaming ? (
          <div className="message-row">
            <span className="avatar">A</span>
            <div className="message message-ai">{streaming}</div>
          </div>
        ) : null}

        {pending && !streaming ? (
          <div className="message-row">
            <span className="avatar">A</span>
            <div className="message message-ai chat-typing" role="status">
              <span />
              <span />
              <span />
              <span className="sr-only">{t('chat.typing')}</span>
            </div>
          </div>
        ) : null}
      </div>

      {canRate ? (
        <div className="chat-feedback">
          {feedback ? (
            <span className="chat-feedback-thanks" role="status">
              {t('chat.feedbackThanks')}
            </span>
          ) : (
            <>
              <span>{t('chat.feedbackPrompt')}</span>
              <button
                type="button"
                aria-label={t('chat.feedbackUseful')}
                onClick={() => rate('useful')}
              >
                <ThumbsUp size={14} />
              </button>
              <button
                type="button"
                aria-label={t('chat.feedbackNotUseful')}
                onClick={() => rate('not_useful')}
              >
                <ThumbsDown size={14} />
              </button>
            </>
          )}
        </div>
      ) : null}

      {/*
        The error animates `opacity` and `y`, not `height: auto`: animating
        height relayouts the chat card on every frame and cannot run on the
        compositor.
      */}
      <AnimatePresence>
        {error ? (
          <m.p
            className="chat-error"
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            {error}
          </m.p>
        ) : null}
      </AnimatePresence>

      <form className="chat-form" onSubmit={submitQuestion}>
        <label className="sr-only" htmlFor="hero-question">
          {t('chat.inputLabel')}
        </label>
        <input
          ref={inputRef}
          id="hero-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={t('chat.inputPlaceholder')}
        />
        <button type="submit" aria-label={t('chat.submitLabel')} disabled={pending}>
          <Send size={15} />
        </button>
      </form>

      <p className="chat-retention">
        {retentionNotice} <Link href="/confidentialite">{t('chat.privacyLink')}</Link>
      </p>
    </m.div>
  )
}
