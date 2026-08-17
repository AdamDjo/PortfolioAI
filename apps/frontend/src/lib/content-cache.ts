import { revalidatePath, unstable_cache } from 'next/cache'

import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

/**
 * Cache serveur du contenu éditorial, invalidé à la publication.
 *
 * Les pages du site lisent Payload dans des composants serveur. Sans cache, Next
 * les rendrait à chaque visite et rejouerait les mêmes requêtes SQL pour un
 * contenu identique pour tous les visiteurs. Avec un simple `revalidate`, elles
 * resteraient statiques mais périmées jusqu'à l'expiration du délai — une
 * correction publiée dans `/admin` n'apparaîtrait pas tout de suite.
 *
 * On combine donc les deux : les lectures sont mises en cache, et les hooks
 * Payload invalident les pages concernées dès qu'un document change. Les pages
 * restent servies en statique, la base n'est interrogée qu'après une
 * modification, et le site est à jour immédiatement. Le cache vit ici, dans la
 * couche données, plutôt que dupliqué en configuration de segment dans chaque
 * page.
 */

/**
 * Un tag par nature de contenu, et non un tag global unique : modifier un projet
 * ne doit pas provoquer la relecture du parcours ni des mentions légales.
 */
const CONTENT_TAGS = {
  identity: 'content:identity',
  profile: 'content:profile',
  experiences: 'content:experiences',
  projects: 'content:projects',
  bookmarks: 'content:bookmarks',
} as const

type ContentTag = (typeof CONTENT_TAGS)[keyof typeof CONTENT_TAGS]

/**
 * Pages à régénérer pour chaque nature de contenu.
 *
 * L'invalidation vise les pages et non le cache de données : une page entièrement
 * prérendue à la compilation n'a aucune échéance de revalidation, donc marquer ses
 * données périmées ne déclenche jamais de nouveau rendu — seul `revalidatePath`
 * remplace son HTML. Vérifié en production : purger le tag laissait la page servir
 * l'ancien contenu indéfiniment, `revalidatePath` la rafraîchit dès la requête
 * suivante.
 *
 * L'identité alimente l'en-tête et le pied de page définis dans le layout commun :
 * toutes les pages en dépendent, d'où la racine invalidée en mode `layout`.
 */
const PAGES_BY_TAG: Record<ContentTag, { path: string; type?: 'layout' | 'page' }[]> = {
  [CONTENT_TAGS.identity]: [{ path: '/', type: 'layout' }],
  [CONTENT_TAGS.profile]: [{ path: '/a-propos' }],
  [CONTENT_TAGS.experiences]: [{ path: '/a-propos' }],
  [CONTENT_TAGS.projects]: [{ path: '/' }, { path: '/projets' }],
  [CONTENT_TAGS.bookmarks]: [{ path: '/' }, { path: '/veille' }],
}

/**
 * Met une lecture en cache sous son tag.
 *
 * `unstable_cache` exige une clé : le tag fait l'affaire, chaque lecture ayant la
 * sienne et ne prenant aucun argument. Aucune durée d'expiration n'est fixée —
 * l'invalidation vient des hooks, pas de l'horloge. `revalidate: false` évite un
 * rafraîchissement périodique qui ne servirait qu'à repasser sur la base.
 *
 * Le tag reste utile même si l'invalidation passe par les chemins : il isole les
 * entrées de cache les unes des autres et garde `/veille`, rendue dynamiquement,
 * dispensée de rejouer la requête à chaque visite.
 */
const cachedRead = <T>(tag: ContentTag, read: () => Promise<T>): (() => Promise<T>) =>
  unstable_cache(read, [tag], { tags: [tag], revalidate: false })

/**
 * Régénère les pages qui affichent ce contenu.
 *
 * `revalidatePath` exige un contexte de requête Next et lève une exception en
 * dehors. Or ces hooks tournent aussi hors du serveur web : `pnpm seed`, une
 * migration ou tout script lancé par `payload run` écrit dans les mêmes
 * collections. Sans ce filet, l'écriture échouerait alors qu'il n'y a
 * précisément aucune page à régénérer dans un processus CLI. On ignore donc cette
 * erreur, et seulement celle-là, pour ne pas masquer un vrai défaut côté serveur.
 */
const purge = (tag: ContentTag): void => {
  try {
    for (const { path, type } of PAGES_BY_TAG[tag]) {
      revalidatePath(path, type)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (!message.includes('static generation store missing')) throw error
  }
}

/**
 * Hook `afterChange` de global : régénère les pages après une sauvegarde.
 *
 * `afterChange` et non `beforeChange` : on n'invalide qu'une fois l'écriture
 * réellement passée en base, sinon un échec de validation régénérerait les pages
 * pour rien.
 *
 * Aucune valeur n'est renvoyée : Payload ne remplace le document que si le hook
 * retourne quelque chose, et invalider un cache n'a pas à le modifier.
 */
const revalidateGlobal = (tag: ContentTag): GlobalAfterChangeHook => {
  return () => {
    purge(tag)
  }
}

/** Même principe pour une collection : création, modification et suppression. */
const revalidateCollection = (
  tag: ContentTag
): { afterChange: CollectionAfterChangeHook; afterDelete: CollectionAfterDeleteHook } => ({
  afterChange: () => {
    purge(tag)
  },
  afterDelete: () => {
    purge(tag)
  },
})

/**
 * `ContentTag` n'est pas exporté : les appelants passent une valeur de
 * `CONTENT_TAGS`, dont le type se déduit tout seul. L'exporter inviterait à
 * déclarer un tag ailleurs, alors que la liste doit rester définie ici.
 */
export { CONTENT_TAGS, cachedRead, revalidateCollection, revalidateGlobal }
