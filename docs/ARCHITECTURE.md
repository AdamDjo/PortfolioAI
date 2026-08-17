# Architecture — Adem Portfolio

## Tech stack

| Layer    | Technology                             | Decision rationale                                                          |
| -------- | -------------------------------------- | --------------------------------------------------------------------------- |
| Frontend | Next.js 16, React 19, TypeScript       | App Router, rendu statique, métadonnées et images optimisées                |
| Styling  | Tailwind CSS 4 + CSS tokens            | Conserve la template tout en permettant une direction visuelle précise      |
| CMS      | Payload 3 (monté dans Next.js)         | Admin et API dans la même application : un seul déploiement, types partagés |
| Data     | PostgreSQL (`@payloadcms/db-postgres`) | Supabase en démo, PostgreSQL auto-hébergé sur le VPS en production          |
| Monorepo | Turborepo + pnpm                       | Partage de types et commandes cohérentes                                    |

## Applications

- `apps/frontend`: portfolio public, collection de liens, admin Payload et API Payload.
- `packages/shared`: contrats TypeScript partagés.

Le service Express a été retiré : Payload fournit l'API REST et GraphQL, et tourne
dans le même processus Next.js.

## Route groups

Le routeur est découpé en deux groupes, qui n'ajoutent aucun segment d'URL :

- `src/app/(site)/` — le portfolio public, avec son propre `layout.tsx`.
- `src/app/(payload)/` — l'admin et l'API Payload, avec le layout racine fourni
  par Payload. Ces fichiers sont générés par la CLI et ne doivent pas être
  modifiés à la main (ils sont exclus du lint pour cette raison).

`globals.css` reste à la racine de `src/app/`, partagé par les deux groupes.

## Frontend routes

| Route               | Purpose                                        | Rendu                     |
| ------------------- | ---------------------------------------------- | ------------------------- |
| `/`                 | Hero conversationnelle et sélection de projets | Statique                  |
| `/projets`          | Projets personnels publics                     | Statique                  |
| `/a-propos`         | Profil, compétences, parcours et principes     | Statique                  |
| `/contact`          | Formulaire de contact                          | Statique                  |
| `/mentions-legales` | Mentions légales                               | Statique                  |
| `/veille`           | Liens de veille servis par Payload             | Dynamique (voir ci-après) |
| `/admin`            | Administration Payload                         | Dynamique                 |
| `/api/*`            | API REST Payload                               | Dynamique                 |
| `/api/graphql`      | API GraphQL Payload                            | Dynamique                 |

Les pages `/liens` et `/demo`, héritées de la template, ont été retirées : elles
démontraient un gestionnaire de favoris et un panneau d'administration désormais
remplacés par `/veille` et `/admin`.

`/veille` est la seule page de contenu rendue à la demande, et pour une raison
précise : elle dépend de la session. Le champ d'ajout n'apparaît qu'au
propriétaire, donc la page ne peut pas être prérendue une fois pour tous les
visiteurs. Les autres pages de contenu sont identiques pour tout le monde et
restent statiques.

## Collections et globals

**Globals** — contenu à instance unique :

- `site-identity` — nom, rôle, contact, liens sociaux, informations légales.
- `profile` — accroche, biographie, années d'expérience, compétences, principes.

**Collections** :

- `users` — collection d'authentification, propriétaire de l'accès à `/admin`.
- `media` — uploads, lecture publique, écriture réservée aux utilisateurs connectés.
- `experiences` — parcours professionnel, lecture publique.
- `projects` — projets du portfolio, décrits par leur URL, lecture publique.
- `bookmarks` — liens de veille, décrits par leur URL, lecture publique.
- `tags` — étiquettes de classement des liens, lecture publique.

Les types TypeScript de ce contenu ne sont pas écrits à la main : Payload les
génère dans `src/payload-types.ts` à partir des collections. Le frontend les
importe depuis là, et non depuis `@portfolio/shared` — un type recopié à la main
serait une seconde source de vérité, condamnée à divorcer du schéma.

Chaque lecture expose malgré tout une vue minimale (`ProjectView`,
`ExperienceView`…) construite dans `src/lib/site-content.ts` : les composants
n'ont pas à connaître les `null` et les relations de Payload.

### Aperçu automatique par l'URL

Un projet comme un lien de veille se saisit avec une seule information : son URL.
Un hook `beforeChange` lit alors les balises Open Graph de la page distante pour
remplir le titre, la description et l'image d'aperçu. Cela évite de téléverser un
visuel pour chaque entrée ; `projects` garde en plus le champ `cover` comme repli
quand le site cible n'expose pas d'image exploitable.

Ce hook est écrit une seule fois, dans `src/lib/open-graph-hook.ts`, et
paramétré par les noms de champs de la collection appelante : les deux
collections partagent le comportement au lieu d'en dupliquer deux variantes.

Le hook n'interroge le site distant que lorsque l'URL change, et les valeurs
saisies à la main ne sont jamais écrasées.

### Canonicalisation des URL

Avant tout enregistrement, l'URL passe par `src/lib/canonical-url.ts` : schéma
complété, hôte en minuscules, `www.` et fragment retirés, paramètres de suivi
(`utm_*`, `fbclid`, `gclid`…) supprimés, paramètres restants triés, barre oblique
finale enlevée.

Sans cette étape, l'index unique sur `url` ne servirait à rien : la même page
collée depuis deux sources différentes produirait deux fiches. Les paramètres
porteurs de sens, eux, sont conservés — `?v=abc` distingue bien deux vidéos.
`src/lib/canonical-url.test.ts` verrouille les deux côtés de cette frontière.

Comme cette requête part du serveur vers une adresse fournie par un utilisateur,
elle constitue un risque de SSRF. `src/lib/open-graph.ts` la contient :
schémas `http(s)` uniquement, refus des identifiants dans l'URL, résolution DNS
vérifiée contre les plages privées, loopback, link-local et CGNAT (y compris les
adresses IPv4 encapsulées en IPv6), délai maximal et taille de réponse plafonnée.
Ces garde-fous sont couverts par `src/lib/open-graph.test.ts` : ce sont des règles
de sécurité, elles doivent échouer bruyamment si quelqu'un les affaiblit.

## Cache du contenu et invalidation à la publication

Les pages lisent Payload dans des composants serveur. Deux écueils se présentent :
sans cache, Next rejoue les mêmes requêtes SQL à chaque visite pour un contenu
identique pour tous ; avec un simple `export const revalidate = 300` dans chaque
page, elles restent statiques mais périmées jusqu'à l'expiration du délai — une
correction publiée dans `/admin` n'apparaîtrait pas avant cinq minutes.

Tout est donc centralisé dans `src/lib/content-cache.ts` : les lectures sont mises
en cache sans expiration, et des hooks Payload régénèrent les pages concernées dès
qu'un document change. Le cache vit dans la couche données, pas dupliqué en
configuration de segment dans chaque page — aucune page du site ne déclare de
`revalidate`.

### Un tag par nature de contenu

`CONTENT_TAGS` définit cinq tags (`identity`, `profile`, `experiences`,
`projects`, `bookmarks`) et `cachedRead` enveloppe chaque lecture dans
`unstable_cache` sous son tag, avec `revalidate: false`. L'expiration ne vient pas
de l'horloge mais des hooks. Les fonctions de lecture brutes restent privées :
seule leur version mise en cache est exportée, pour qu'aucun appelant ne
contourne le cache par mégarde.

### L'invalidation vise les chemins, pas les tags

`PAGES_BY_TAG` associe chaque tag aux pages qui l'affichent, et `purge` appelle
`revalidatePath` sur chacune. Ce choix est contre-intuitif — on s'attendrait à
`revalidateTag` puisque les entrées sont taggées — et il vient d'une vérification
en production, pas d'une préférence :

> Dans Next 16, `revalidateTag(tag, profile)` marque l'entrée comme périmée pour
> une revalidation en arrière-plan. Mais une page entièrement prérendue à la
> compilation porte `initialRevalidateSeconds: false` dans
> `.next/prerender-manifest.json` : elle n'a aucune échéance de revalidation, donc
> personne ne ramasse jamais le travail. Le tag est bien attaché à la page
> (`.next/server/app/a-propos.meta` liste `x-next-cache-tags`), mais purger le tag
> laissait la page servir l'ancien contenu indéfiniment. Seul `revalidatePath`
> remplace son HTML — vérifié : la nouvelle valeur apparaît dès la requête
> suivante, une seconde après l'écriture.

`updateTag`, qui expire immédiatement au lieu de marquer périmé, n'est pas une
option : il lève une exception hors d'une Server Action, et ces hooks tournent
dans le contexte d'une requête Payload.

Les tags restent utiles pour autant : ils isolent les entrées de cache les unes
des autres et dispensent `/veille`, rendue dynamiquement, de rejouer sa requête à
chaque visite.

L'identité alimente l'en-tête et le pied de page définis dans le layout commun :
toutes les pages en dépendent, d'où la racine invalidée en mode `layout`.

### Les hooks, et le filet pour les scripts

Les deux globals portent un `afterChange`, les collections `experiences`,
`projects`, `media`, `bookmarks` et `tags` portent `afterChange` et `afterDelete`.
`afterChange` et non `beforeChange` : on n'invalide qu'une fois l'écriture passée
en base, sinon un échec de validation régénérerait les pages pour rien. Les hooks
ne renvoient rien — Payload ne remplace le document que si un hook retourne une
valeur, et invalider un cache n'a pas à le modifier.

`media` et `tags` sont dans la liste parce qu'ils sont lus à travers une relation :
le visuel d'un projet et le nom d'un tag apparaissent dans les vues, donc les
modifier doit régénérer les pages correspondantes.

`revalidatePath` exige un contexte de requête Next et lève
`Invariant: static generation store missing` en dehors. Or ces hooks tournent
aussi hors du serveur web : `pnpm seed`, une migration ou tout script lancé par
`payload run` écrit dans les mêmes collections. Sans filet, l'écriture échouerait
alors qu'il n'y a précisément aucune page à régénérer dans un processus CLI.
`purge` intercepte donc cette erreur, et seulement celle-là, pour ne pas masquer
un vrai défaut côté serveur.

### Conséquence pratique pour les builds

`unstable_cache` persiste ses entrées dans `.next/cache/fetch-cache`, qui survit à
un `pnpm build`. Un build peut donc prérendre une valeur périmée si le cache local
contient une entrée plus ancienne que la base. En cas de doute sur un
environnement de développement, supprimer `.next/cache/fetch-cache` avant de
reconstruire.

## Base de données

Une seule variable, `DATABASE_URI`, pilote les deux environnements :

- **Démo** — Supabase, en mode « Session » (port 5432). Le mode « Transaction »
  (port 6543) ne supporte pas les migrations Payload.
- **Production** — PostgreSQL auto-hébergé sur le VPS, décrit dans `docker-compose.yml`.

`push` est désactivé dans `payload.config.ts` : le schéma évolue uniquement par
migrations, pour que la démo et la production ne divergent jamais.

```bash
pnpm --filter @portfolio/frontend migrate:create
pnpm --filter @portfolio/frontend migrate
```

Les migrations sont versionnées : elles sont la seule description reproductible du
schéma. Les fichiers téléversés, eux, sont des données et restent hors du dépôt
(`apps/frontend/media/` est ignoré par Git). En production, ce dossier doit être
un volume persistant, sinon les médias disparaissent à chaque redéploiement.

## Sécurité des accès

Les permissions vivent dans les fonctions `access` des collections Payload, donc
côté serveur : `users` exige une session pour toute opération, `media`, `projects`,
`bookmarks` et `tags` autorisent la lecture publique mais réservent l'écriture aux
utilisateurs connectés.

### Ajout d'un lien depuis la page publique

`/veille` affiche un champ d'ajout, mais uniquement au propriétaire : la page est
un composant serveur qui appelle `payload.auth()` sur les en-têtes de la requête et
ne rend le formulaire que si la session est valide. Le formulaire envoie ensuite un
`POST /api/bookmarks` avec le cookie de session.

Ce champ existe pour un usage précis : coller un lien depuis un téléphone sans
passer par `/admin`. Il n'ouvre aucune porte pour autant — la barrière est le
`access.create` de la collection, pas l'absence du formulaire. Un visiteur qui
appelle l'API directement reçoit un `403`, et le masquage du formulaire n'est qu'un
confort d'affichage.

Les visiteurs n'ont donc aucun moyen d'écrire : la grille publique ne propose ni
ajout ni suppression, et l'ancien stockage `localStorage` de la page a été retiré
en même temps que le formulaire public.

Le RLS (Row Level Security) de PostgreSQL est **volontairement désactivé**. Il
protège le cas où le navigateur interroge Postgres directement via la clé publique
Supabase — ce que cette application ne fait jamais : le SDK `@supabase/supabase-js`
a été retiré, et le seul accès à la base est `DATABASE_URI`, côté serveur, derrière
les règles Payload. Activer le RLS ajouterait une seconde couche de permissions,
écrite en SQL et ignorante des utilisateurs Payload.

Cette décision devra être revue si le navigateur accède un jour directement à
Supabase (Auth, Storage ou Realtime) : dans ce cas le RLS redevient indispensable.

## État client

Le portfolio ne gère aucun état serveur côté navigateur : les pages sont des
composants serveur qui lisent Payload directement. React Query et son
`QueryClientProvider` ont donc été retirés — ils n'avaient plus rien à mettre en
cache, le cache vivant désormais côté serveur (voir plus haut). Zustand reste
disponible pour l'état d'interface, mais aucun store n'est nécessaire à ce jour :
la préférence de thème est gérée par `next-themes`.

Les composants clients restants sont ceux qui ont une vraie raison de l'être :
formulaire de contact, ajout de lien, animations au défilement, bascule de thème.

## Key decisions

- Les routes marketing restent statiques.
- Le contenu est mis en cache côté serveur et invalidé par chemin à la publication,
  jamais par un délai d'expiration en configuration de page.
- Le schéma de base est piloté par les migrations, jamais par `push`.
- Les types de contenu viennent de `src/payload-types.ts`, généré par Payload.
- Les assets cerveau clair et sombre sont distincts pour préserver lumière, matière et contraste.
