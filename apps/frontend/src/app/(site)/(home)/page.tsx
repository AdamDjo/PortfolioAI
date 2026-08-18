import { listPublicBookmarks } from '@/lib/bookmarks'
import { getAvailability, getIdentity, listProjects } from '@/lib/site-content'

import { ConversationSection } from './_components/conversation-section'
import { ProjectsTeaser } from './_components/projects-teaser'
import { QualityStrip } from './_components/quality-strip'

async function Home() {
  const [identity, availability, projects, bookmarks] = await Promise.all([
    getIdentity(),
    getAvailability(),
    listProjects(),
    listPublicBookmarks(),
  ])

  // Without a project flagged as featured, show the first of the sort order
  // rather than an empty grid.
  const featured = projects.filter((project) => project.featured)
  const shown = (featured.length > 0 ? featured : projects).slice(0, 3)

  return (
    <>
      <ConversationSection
        role={identity.role}
        location={identity.location}
        availability={{ available: availability.available, label: availability.label }}
        bookmarks={bookmarks.slice(0, 3).map((bookmark) => ({
          id: bookmark.id,
          title: bookmark.title,
          label: bookmark.tags[0] ?? bookmark.domain,
        }))}
      />
      <ProjectsTeaser
        projects={shown.map((project) => ({
          id: project.id,
          url: project.url,
          title: project.title,
          imageUrl: project.coverUrl ?? project.previewImageUrl,
          technologies: project.technologies,
        }))}
      />
      <QualityStrip />
    </>
  )
}

export { Home as default }
