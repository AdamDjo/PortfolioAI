import { setRequestLocale } from 'next-intl/server'

import { buildAlternates } from '@/i18n/metadata'
import { getPageLocale } from '@/i18n/params'
import { getAssistantConfig } from '@/lib/assistant-context'
import { getAvailability, getIdentity, getProfile, listProjects } from '@/lib/site-content'

import { ConversationSection } from './_components/conversation-section'
import { QualityStrip } from './_components/quality-strip'

import type { Metadata } from 'next'

const PROJECT_FALLBACK_IMAGES: Record<string, string> = {
  Grimoire: '/images/project-grimoire.webp',
  Ethswap: '/images/project-ethswap.webp',
  Fitapp: '/images/project-fitapp.webp',
}

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const locale = await getPageLocale(params)
  // Title and description come from the layout; the home page only needs to
  // name its own canonical and alternates.
  return { alternates: buildAlternates(locale, '/') }
}

async function Home({ params }: PageProps<'/[locale]'>) {
  const locale = await getPageLocale(params)
  setRequestLocale(locale)

  const [identity, availability, profile, projects, assistant] = await Promise.all([
    getIdentity(),
    getAvailability(),
    getProfile(),
    listProjects(),
    getAssistantConfig(),
  ])

  // Without a project flagged as featured, show the first of the sort order
  // rather than an empty grid.
  const featured = projects.filter((project) => project.featured)
  const shown = [...featured, ...projects.filter((project) => !project.featured)].slice(0, 3)

  return (
    <>
      <ConversationSection
        name={identity.displayName}
        role={identity.role}
        location={identity.location}
        yearsOfExperience={profile.yearsOfExperience}
        projectCount={projects.length}
        skills={profile.skillGroups.flatMap((group) => group.items).slice(0, 5)}
        availability={{ available: availability.available, label: availability.label }}
        retentionNotice={assistant.retentionNotice}
        projects={shown.map((project) => ({
          id: project.id,
          url: project.url,
          title: project.title,
          description: project.description,
          imageUrl:
            project.coverUrl ??
            project.previewImageUrl ??
            PROJECT_FALLBACK_IMAGES[project.title] ??
            null,
          technologies: project.technologies,
        }))}
      />
      <QualityStrip />
    </>
  )
}

export { Home as default }
