import { HomePage } from '@/components/home-page'
import { listPublicBookmarks } from '@/lib/bookmarks'
import { getIdentity, listProjects } from '@/lib/site-content'

/**
 * Charge le contenu de la page d'accueil.
 *
 * `HomePage` est un composant client (chat, onglets, parallaxe) : il ne peut pas
 * interroger Payload lui-même, donc tout ce qu'il affiche est résolu ici et
 * descend en props.
 */
async function Home() {
  const [identity, projects, bookmarks] = await Promise.all([
    getIdentity(),
    listProjects(),
    listPublicBookmarks(),
  ])

  const featured = projects.filter((project) => project.featured)

  return (
    <HomePage
      identity={{ role: identity.role, location: identity.location }}
      // À défaut de projet marqué en avant, on montre les premiers du tri
      // plutôt qu'une grille vide.
      projects={(featured.length > 0 ? featured : projects).slice(0, 3)}
      bookmarks={bookmarks.slice(0, 3)}
    />
  )
}

export { Home as default }
