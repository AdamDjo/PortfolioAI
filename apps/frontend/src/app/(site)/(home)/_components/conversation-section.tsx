'use client'

import { useCallback, useRef } from 'react'

import { FeatureSwitcher } from './feature-switcher'
import { Hero } from './hero'

import type { HeroChatHandle } from './hero'
import type { HomeBookmark } from './types'

interface ConversationSectionProps {
  role: string
  location: string | null
  bookmarks: HomeBookmark[]
}

/**
 * Connects the feature switcher's suggested prompts to the hero's chat input.
 *
 * The prompts sit in the switcher but drive an input owned by the hero, so the
 * bridge has to live in their closest common ancestor. Only the handle is held
 * here — the chat text stays inside `Hero`, so typing re-renders the hero alone
 * and leaves the switcher and the sections below untouched.
 */
export function ConversationSection({ role, location, bookmarks }: ConversationSectionProps) {
  const chatRef = useRef<HeroChatHandle>(null)

  const askQuestion = useCallback((question: string) => chatRef.current?.ask(question), [])
  const startChat = useCallback(() => chatRef.current?.ask(), [])

  return (
    <>
      <Hero role={role} location={location} chatRef={chatRef} onStartChat={startChat} />
      <FeatureSwitcher bookmarks={bookmarks} onAskQuestion={askQuestion} />
    </>
  )
}
