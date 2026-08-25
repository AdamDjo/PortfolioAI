'use client'

import { useCallback, useRef } from 'react'

import { Hero } from './hero'
import { HomeRail } from './home-rail'
import { ProjectsTeaser } from './projects-teaser'

import type { HeroChatHandle } from './hero'
import type { HomeAvailability, HomeProject } from './types'

interface ConversationSectionProps {
  name: string
  role: string
  location: string | null
  yearsOfExperience: number | null
  projectCount: number
  skills: string[]
  availability: HomeAvailability
  projects: HomeProject[]
  retentionNotice: string
}

/**
 * Connects the feature switcher's suggested prompts to the hero's chat input.
 *
 * The prompts sit in the switcher but drive an input owned by the hero, so the
 * bridge has to live in their closest common ancestor. Only the handle is held
 * here — the chat text stays inside `Hero`, so typing re-renders the hero alone
 * and leaves the switcher and the sections below untouched.
 */
export function ConversationSection({
  name,
  role,
  location,
  yearsOfExperience,
  projectCount,
  skills,
  availability,
  projects,
  retentionNotice,
}: ConversationSectionProps) {
  const chatRef = useRef<HeroChatHandle>(null)

  const askQuestion = useCallback((question: string) => chatRef.current?.ask(question), [])
  const startChat = useCallback(() => chatRef.current?.ask(), [])

  return (
    <>
      <Hero
        name={name}
        role={role}
        location={location}
        yearsOfExperience={yearsOfExperience}
        projectCount={projectCount}
        skills={skills}
        availability={availability}
        retentionNotice={retentionNotice}
        chatRef={chatRef}
      />
      <HomeRail onStartChat={startChat} />
      <ProjectsTeaser projects={projects} onAskQuestion={askQuestion} />
    </>
  )
}
