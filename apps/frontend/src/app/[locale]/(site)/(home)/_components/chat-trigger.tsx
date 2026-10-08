'use client'

import { useChatBridge } from '@/stores/chat-bridge'

import type { ReactNode } from 'react'

/**
 * A button that opens the hero chat, optionally with a question prefilled.
 *
 * The smallest client island the home page needs: its markup comes from the
 * server component around it, only the click handler ships to the browser.
 */
export function ChatTrigger({
  children,
  className,
  question,
}: {
  children: ReactNode
  className?: string
  question?: string
}) {
  const ask = useChatBridge((state) => state.ask)

  return (
    <button className={className} onClick={() => ask(question)} type="button">
      {children}
    </button>
  )
}
