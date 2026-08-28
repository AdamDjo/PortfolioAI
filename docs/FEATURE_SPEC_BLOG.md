# Spécification fonctionnelle — Blog, SEO et partage social

> Statut : brouillon de conception, à valider avant implémentation.
>
> Complète `FEATURE_SPEC_CMS_AI.md`, qui reste la référence pour le CMS,
> la veille et l'assistant.

## 1. Objectif

Publier des articles techniques sur le site, pour deux raisons distinctes qu'il
ne faut pas confondre :

1. **Le référencement.** Un portfolio de six pages statiques n'a presque aucune
   surface indexable. Des articles régulières, bilingues, structurés, en donnent
   une qui grandit à chaque publication.
2. **L'audience.** Chaque article alimente LinkedIn et X, qui ramènent du
   trafic vers le site — jamais l'inverse.

La règle qui découle des deux : **le site est la source canonique**. On partage
des liens vers les articles, on ne republie jamais le texte intégral sur un
réseau. Sinon LinkedIn capte le référencement à la place du site.

## 2. Décisions retenues

| Sujet               | Décision                                                         |
| ------------------- | ---------------------------------------------------------------- |
| Source des articles | Collection Payload `posts`                                       |
| Rédaction           | Markdown importé depuis l'éditeur d'Adem, médias déposés ensuite |
| Langues             | Bilingue anglais et français, comme le reste du site             |
| Planification       | `Scheduled Publish` natif de Payload (file de jobs)              |
| Publication sociale | Postiz auto-hébergé sur le VPS, via Coolify                      |
| Rédaction des posts | Brouillons générés par Groq, relus et enrichis dans Postiz       |

### Ce qui a été écarté

- **MDX dans le dépôt.** Bon confort d'écriture, mais deux fichiers par article
  en bilingue, aucune écriture depuis un téléphone, et un second système de
  contenu à côté de Payload dont dépend déjà tout le site.
- **Écrire les posts sociaux dans Payload.** Payload n'a ni aperçu par réseau,
  ni calendrier, ni gestion des médias par plateforme. Ce n'est pas son métier.
- **Publier vers LinkedIn et X depuis l'application.** Cela obligerait le
  portfolio à détenir et rafraîchir les jetons des réseaux. Postiz le fait déjà,
  avec une interface pour la reconnexion.

## 3. Couche 1 — Le blog et son référencement

### 3.1 Collection `posts`

| Champ         | Type                         | Notes                                            |
| ------------- | ---------------------------- | ------------------------------------------------ |
| `title`       | text, localisé               | Requis                                           |
| `slug`        | text, unique, indexé         | Dérivé du titre, modifiable                      |
| `excerpt`     | textarea, localisé           | Sert de `meta description` et de résumé de liste |
| `content`     | richText (Lexical), localisé | Corps de l'article                               |
| `cover`       | upload → `media`             | Visuel de tête et image OG par défaut            |
| `tags`        | relation → `tags`            | Réutilise la collection existante                |
| `publishedAt` | date                         | Date affichée et clé de tri                      |
| `readingTime` | number, lecture seule        | Calculé à l'enregistrement                       |
| `seo`         | groupe                       | Titre et description surchargeables              |

- `versions: { drafts: true }` : brouillons, historique et publication explicite.
- Accès identique aux autres collections : lecture publique, écriture réservée
  au propriétaire connecté.
- Hooks `afterChange` et `afterDelete` branchés sur `revalidateCollection`,
  comme `projects` et `bookmarks`.
- Le slug est unique par article, pas par langue : une même URL sert les deux
  versions, distinguées par le préfixe de locale.

### 3.2 Rédaction

L'article s'écrit en Markdown dans l'éditeur d'Adem, puis s'importe : les
convertisseurs Markdown de `@payloadcms/richtext-lexical` produisent l'arbre
Lexical attendu par le champ `content`.

Les médias ne passent pas par le Markdown — un chemin local ne résout rien une
fois le texte importé. Ils se déposent dans l'éditeur après import : Lexical
téléverse dans `media` et le rendu passe par `next/image`. Les vidéos
s'intègrent par un bloc d'intégration (YouTube, Vimeo) plutôt que par téléversement,
pour ne pas faire porter au VPS le stockage et la bande passante d'un lecteur vidéo.

### 3.3 Pages

```text
/[locale]/blog            index paginé, filtrable par tag
/[locale]/blog/[slug]     article
/[locale]/blog/rss.xml    flux du blog
```

Rendues côté serveur et prérendues, sous `[locale]/(site)`, invalidées à la
publication par le cache existant. Les brouillons ne sont jamais listés ni
servis publiquement.

### 3.4 Référencement

- `generateMetadata` par article : titre, description, `canonical`, `hreflang`
  vers l'autre langue, métadonnées Open Graph et Twitter.
- Données structurées JSON-LD `BlogPosting` sur l'article, `Breadcrumb` sur
  les deux pages.
- Image Open Graph générée par `next/og` à partir du titre, avec repli sur
  `cover` quand il est renseigné.
- `sitemap.ts` devient asynchrone et lit les articles publiés. Sa liste de
  routes statiques reste, `/blog` s'y ajoute.
- Flux RSS et Atom : point d'entrée de n'importe quel automate externe, et
  moyen d'être suivi sans réseau social.

## 4. Couche 2 — Brouillons de posts sociaux

À la publication d'un article, un hook demande à Groq un brouillon par réseau,
enregistré dans une collection `social-posts` :

| Champ        | Type                                     |
| ------------ | ---------------------------------------- |
| `post`       | relation → `posts`                       |
| `platform`   | select : `linkedin`, `x`                 |
| `locale`     | select : `fr`, `en`                      |
| `body`       | textarea                                 |
| `status`     | select : `draft`, `pushed`, `failed`     |
| `externalId` | text, lecture seule — identifiant Postiz |

Un gabarit par réseau : accroche puis trois lignes et lien pour LinkedIn, fil
court pour X. La génération réutilise le fournisseur d'IA existant
(`src/lib/ai`), donc son limiteur et son mécanisme de repli.

Le brouillon n'est jamais publié directement : il est poussé vers Postiz, où il
est relu, enrichi d'un média et planifié.

## 5. Couche 3 — Postiz

Postiz tourne dans son propre conteneur sur le VPS, à côté du site. Il détient
les jetons LinkedIn et X, la file de publication et le calendrier.

Le portfolio n'en connaît que l'API : une fonction `pushToPostiz` derrière la
même forme d'interface que les fournisseurs d'IA, avec `POSTIZ_API_URL` et
`POSTIZ_API_KEY` en variables d'environnement. Absentes, la couche reste
inactive et les brouillons restent consultables dans `/admin` — le site ne
tombe jamais parce qu'un service tiers manque.

Le média — image ou vidéo — s'ajoute dans Postiz, où l'aperçu par réseau est
disponible. C'est volontaire : un post LinkedIn portant une vidéo native n'a
pas la même forme qu'un partage de lien, et cette mise en forme n'a rien à
faire dans le CMS du site.

## 6. Contraintes des plateformes

Elles ne dépendent d'aucun choix technique et doivent être connues avant de
brancher la couche 3.

- **X** : le palier gratuit a été fermé aux nouveaux comptes développeurs en
  février 2026, remplacé par un paiement à l'usage — environ 0,015 $ par post
  publié, plus 0,20 $ lorsqu'il contient une URL. Négligeable au volume d'un
  blog, mais il faut un compte crédité.
- **LinkedIn** : le portée `w_member_social` est accessible en libre service
  avec le produit « Share on LinkedIn ». Le jeton expire au bout de soixante
  jours et le rafraîchissement programmatique est réservé aux partenaires
  Marketing Developer Platform : une reconnexion manuelle est à prévoir tous
  les deux mois, depuis Postiz.
- **Portée des liens** : LinkedIn défavorise les publications sortantes. La
  pratique courante est un média natif et le lien en premier commentaire ; le
  gabarit de génération en tient compte.

## 7. Lots de livraison

Chaque lot est livrable et utile seul.

1. **Lot 1 — Blog et SEO.** Collection `posts`, migration, pages, métadonnées,
   JSON-LD, images Open Graph, flux RSS, sitemap dynamique, traductions
   d'interface. C'est la seule partie indispensable au référencement.
2. **Lot 2 — Brouillons sociaux.** Collection `social-posts`, génération par
   Groq à la publication, relecture dans `/admin`.
3. **Lot 3 — Connecteur Postiz.** Poussée des brouillons validés, statut et
   identifiant externe conservés.

## 8. Validation

- `pnpm type-check`, `pnpm lint`, `pnpm test`, `pnpm build`
- `pnpm --filter @portfolio/frontend migrate` sur une base réelle
- Vérification navigateur de `/en/blog`, `/fr/blog` et d'un article dans les
  deux langues
- Contrôle d'accès à l'API : `GET /api/posts` public, écriture refusée sans
  session
- Invalidation du cache vérifiée sur un build de production, depuis une requête
  extérieure à celle qui écrit
- Flux RSS validé par un lecteur, et `hreflang` vérifié entre les deux langues

## 9. Points ouverts

- Rythme de publication visé, qui décide de l'intérêt d'une file de
  planification plutôt que d'une publication à la demande.
- Traduction anglaise des articles : rédigée par Adem ou pré-traduite par Groq
  puis relue.
- Commentaires : hors périmètre pour l'instant, la discussion a lieu sur les
  réseaux.
