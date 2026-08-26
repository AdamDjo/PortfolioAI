# Project memory — Adem Portfolio

## Repository

- GitHub : `AdamDjo/PortfolioAI`
- GitHub Project : `Scrum Board` (`AdamDjo`, projet #5)
- Project ID : `PVT_kwHOAacnj84BU6rS`
- Visibilité : publique
- Branches d'intégration : `main` et `develop`

## Current state

- Migration de Vite vers la template `AdamDjo/claude-stack` terminée.
- Monorepo Next.js 16 + Payload 3 + packages partagés.
- Scope npm renommé de `@starter/*` vers `@portfolio/*`.
- Pages publiques, collection de liens et dashboard de démonstration implémentés.
- Deux assets hero dédiés : `hero-brain-light.png` et `hero-brain-dark.png`.
- Payload CMS monté dans Next.js (issue #2) : admin sur `/admin`, API sur `/api/*`.
- Le backend Express a été supprimé ; `apps/frontend` est la seule application.
- Liens de veille servis par Payload (issue #6) : collections `bookmarks` et `tags`,
  `/veille` rendu côté serveur, ajout réservé au propriétaire connecté.
- Contenu réel servi par Payload (issue #28) : globals `site-identity` et `profile`,
  collection `experiences`, `/`, `/a-propos`, `/projets`, `/contact` et
  `/mentions-legales` alimentées depuis la base et prérendues.
- Cache serveur centralisé dans `src/lib/content-cache.ts`, invalidé à la
  publication par les hooks Payload. Plus aucun `revalidate` dans les pages.
- Administration Payload durcie (issue #4) : `PAYLOAD_SECRET` et `DATABASE_URI`
  exigés au chargement, politique de verrouillage explicite sur `users`, et
  réinitialisation du mot de passe branchée sur le transport Lumail existant.
- Surface d'attaque durcie (issue #66, lot indépendant du déploiement) :
  en-têtes de sécurité + CSP dans `next.config.ts` (CSP volontairement permissive
  sur script/style, mais `frame-ancestors 'none'`, `object-src`, `base-uri`,
  `form-action` verrouillés), suivi de redirection revalidé dans le hook Open
  Graph (plus de bypass SSRF par `302` vers une adresse interne), et note
  d'injection de prompt sur `ai-knowledge`. Restent liés au proxy/prod : confiance
  `X-Forwarded-For` (#66.2) et config `cors`/`csrf`/cookies Payload (#66.4).
- Chat protégé contre les abus (issue #10, 1er lot) : limiteur de débit à trois
  paliers (rafale / minute / jour) dans `src/lib/ai/rate-limit.ts`, empreinte IP
  salée et rotée quotidiennement dans `src/lib/ai/client-fingerprint.ts`. Le 429
  part avant `resolveProvider`/`buildContext`, donc sans consommer de quota Groq,
  et renvoie vers `/contact`.
- Rétention et confidentialité du chat (issue #10, 2e lot) : collection
  `conversations` (transcription anonyme + empreinte, jamais d'IP), écrite depuis
  la route après le stream, purgée automatiquement au bout de 30 jours
  (`src/lib/conversation-store.ts`). Feedback utile/pas utile via
  `/api/chat/feedback`. Avis de conservation éditable (`retentionNotice` sur le
  global assistant) affiché sous le champ du chat, page `/confidentialite` liée
  depuis là et depuis le footer.
- Site bilingue anglais/français (issue #74, lot interface) : anglais par défaut,
  bâti sur **`next-intl`**. Segment `[locale]` au-dessus de `(site)`, négociation
  par `createMiddleware` dans `src/proxy.ts`, catalogues ICU dans `messages/*.json`,
  sélecteur de langue dans l'en-tête, sitemap et `hreflang` par locale, assistant
  qui répond dans la langue de la conversation.
  Reste à faire : localisation du contenu éditorial Payload (voir #74).
- Code hérité de l'ère Express retiré : `lib/api.ts`, `lib/query-client.ts`,
  `providers.tsx`, `data/portfolio.ts`, pages `/liens` et `/demo`. React Query,
  Axios et quatre autres dépendances désinstallées.

## Confirmed direction

- PostgreSQL : Supabase en démo, puis auto-hébergé avec Docker sur le VPS en production.
  Les deux passent par la même variable `DATABASE_URI`.
- Coolify pilotera les déploiements, les domaines et les sauvegardes.
- La spécification fonctionnelle de référence est `docs/FEATURE_SPEC_CMS_AI.md`.
- Les collections métier arrivent par lots : `users` + `media` en #2, `projects`,
  `bookmarks` et `tags` en #6.
- Le visiteur ne publie jamais de lien. L'écriture est réservée au propriétaire
  connecté, pour que personne ne puisse polluer la grille de veille.
- L'ajout d'un lien doit rester possible depuis un téléphone, sur la page publique,
  sans ouvrir `/admin` : c'est la raison d'être du champ d'ajout dans `/veille`.
- Un lien se saisit par son URL seule, jamais en téléversant une image.

## Product boundaries

- `/admin` est le véritable back-office, servi par Payload. Les pages `/demo` et
  `/liens`, qui en étaient des démonstrations visuelles, ont été retirées.
- Le formulaire de contact ne transmet aucune donnée en phase 1.
- `/projets` ne montre que les projets personnels publics et déployés. Les missions
  en CDI sont des back-offices internes : elles restent décrites dans le parcours
  de `/a-propos`, sans lien public.

## Contenu à compléter avant mise en ligne

- Nom et adresse de l'hébergeur, pour les mentions légales. La page affiche
  aujourd'hui une phrase d'attente explicite.
- Statut de l'éditeur : publication à titre personnel ou entité légale.

## Implementation notes

- `apps/frontend` est en ESM (`"type": "module"`), requis par le chargement de la
  config Payload. C'est pour cette raison que `eslint.config.js` a été renommé
  en `eslint.config.cjs` (il utilise `require`).
- Les fichiers générés par la CLI Payload (`src/app/(payload)/**`,
  `src/payload-types.ts`) sont exclus du lint : toute correction manuelle serait
  écrasée à la prochaine génération. Les migrations restent lintées.
- `push: false` dans `payload.config.ts` : le schéma évolue uniquement par
  migrations, pour que démo et production ne divergent jamais.
- Supabase doit être utilisé en mode « Session » (port 5432). Le mode
  « Transaction » (6543) casse les migrations Payload.
- Next 16 a supprimé la clé `eslint` de `NextConfig` ; elle a été retirée de
  `next.config.ts`.
- La CLI Payload (`migrate:create`) exige un TTY. Depuis un agent, l'envelopper :
  `script -q /dev/null pnpm --filter @portfolio/frontend migrate:create`.
- Le hook d'aperçu Open Graph est partagé entre `projects` et `bookmarks`
  (`src/lib/open-graph-hook.ts`), paramétré par les noms de champs.
- Toute URL est canonicalisée avant enregistrement (`src/lib/canonical-url.ts`),
  sinon l'index unique sur `url` laisserait passer des doublons.
- **Aucune variable d'environnement critique ne prend de valeur de repli.**
  `process.env.X ?? ''` laissait Payload démarrer avec un secret vide, donc des
  cookies de session et des jetons de réinitialisation signés avec une valeur
  devinable. `src/lib/require-env.ts` échoue au chargement en nommant la
  variable ; une valeur blanche compte comme absente.
- Payload n'a pas de transport email : sans adaptateur, `forgot-password`
  répond « envoyé » et ne délivre rien. `src/lib/email/payload.ts` branche
  l'expéditeur Lumail déjà utilisé par le formulaire de contact. Le corps part
  en markdown, donc le gabarit de `src/cms/emails/reset-password.ts` écrit du
  markdown dans le champ que Payload nomme `html`.
- `resolveEmailSender` (identifiants seuls) et `resolveEmailProvider`
  (identifiants + `CONTACT_TO_EMAIL`) sont distincts : la récupération de compte
  écrit au compte concerné, le formulaire à une boîte fixe.
- CSP : `script-src`/`style-src` gardent `'unsafe-inline'` (+`'unsafe-eval'`) car
  Next injecte des scripts inline et l'admin Payload des styles inline, sans nonce
  sans middleware. `img-src` autorise `https:` parce que les previews de veille,
  favicons et covers projets sont rendus `unoptimized` (donc chargés depuis la
  source). Fonts auto-hébergées (`next/font`), Groq/Lumail côté serveur, Vercel
  Analytics same-origin : aucun hôte tiers requis. Resserrer `script-src` en
  politique à nonce est un suivi de #66.
- Le hook Open Graph suit les redirections à la main (`redirect: 'manual'`,
  `MAX_REDIRECTS`) et repasse chaque `Location` par `resolveSafeUrl` : `fetch`
  suivrait sinon une redirection vers une IP interne sans re-vérifier.
- Limiteur du chat : compteurs en mémoire (`Map` de module), fenêtre glissante,
  pas de datastore — assumé, l'app tourne en une poignée d'instances et le
  limiteur vit derrière une interface étroite (bascule Redis = un seul fichier).
  Les compteurs sont remis à zéro au redéploiement ; le quota du fournisseur
  reste le vrai plafond. L'empreinte combine `CHAT_FINGERPRINT_SALT` (secret
  d'environnement) et la date UTC : rotation quotidienne sans manipuler la
  variable. Sans sel, `computeFingerprint` renvoie `null` et le limiteur reste
  éteint plutôt que de hacher une valeur réversible ou de regrouper tout le
  monde. Aucune IP brute n'est jamais stockée ni journalisée.
- **i18n sans bibliothèque, volontairement.** Next 16 documente lui-même
  l'approche : segment `[lang]`, `proxy.ts`, dictionnaires. `react-i18next` est
  antérieur aux Server Components et forcerait des `'use client'` là où le site
  rend côté serveur. Le vrai concurrent serait `next-intl` : il apporte l'ICU
  (pluriels, genre), les dates/nombres localisés et des JSON pour un traducteur
  externe — rien dont le site ait besoin aujourd'hui. Chaque locale est typée
  d'après `en`, donc **une clé oubliée casse la compilation**. Bascule vers
  `next-intl` le jour où arrivent une 3ᵉ langue avec traducteur, des pluriels ou
  des dates affichées ; la migration est mécanique, `[lang]`/proxy/switcher ne
  bougent pas.
- `next/root-params` est inutilisable ici : il exige que **toutes** les routes
  vivent sous le segment dynamique, or Payload sert `/admin` et `/api` en dehors
  — d'où « No root params detected ». La locale descend donc par `params`
  (`getPageLocale`), et chaque page appelle `setRequestLocale` : sans lui,
  next-intl lit la locale depuis la requête et bascule tout en rendu dynamique.
  Les 16 pages restent prérendues, 8 par langue.
- Les routes `/api/chat*` sont restées **hors** de `[locale]` : le client appelle
  `/api/chat`, qui sous `[lang]` serait tombé dans le catch-all Payload
  `/api/[...slug]`. La locale voyage donc dans le corps de la requête, un
  route handler ne pouvant pas lire le segment — d'où le `getTranslations({ locale })`
  explicite côté serveur.
- Invalidation et locales : `PAGES_BY_TAG` cible des **motifs** de route
  (`/[locale]/projets` + `type`), jamais une locale littérale — sinon les autres
  langues serviraient indéfiniment du contenu périmé.
- Les états de filtre (`veille`, `outils-ia`) utilisent une sentinelle stable
  (`' all'`, `'all'`), pas le libellé traduit : changer de langue ne doit
  pas réinitialiser le filtre.
- Prettier et ESLint doivent être lancés depuis le workspace
  (`pnpm --filter @portfolio/frontend exec …`), pas depuis la racine.
- Un écran `500` sur toutes les routes `/api/*` et `/admin` après plusieurs
  modifications vient en général du cache `.next` périmé, pas du code :
  arrêter le serveur, `rm -rf apps/frontend/.next`, redémarrer.
- **Invalidation du cache : `revalidatePath`, pas `revalidateTag`.** Dans Next 16,
  `revalidateTag` marque l'entrée périmée pour une revalidation en arrière-plan,
  mais une page prérendue à la compilation porte
  `initialRevalidateSeconds: false` — aucune échéance, donc personne ne ramasse le
  travail et la page sert l'ancien contenu indéfiniment. Vérifié en production :
  purger le tag ne rafraîchit jamais, `revalidatePath` rafraîchit dès la requête
  suivante. `updateTag` expirerait bien immédiatement mais lève une exception hors
  d'une Server Action, donc inutilisable depuis un hook Payload.
- Les revalidations sont mises en file sur le store de requête et vidées à la fin
  de celle-ci. Tester l'invalidation en lisant la page depuis la requête qui écrit
  donne donc un faux négatif : il faut lire depuis l'extérieur.
- `revalidatePath` exige un contexte de requête Next. Les hooks tournent aussi sous
  `payload run` (seed, migrations), d'où le `try/catch` ciblé sur
  `static generation store missing` dans `content-cache.ts`.
- `unstable_cache` persiste dans `.next/cache/fetch-cache`, qui survit à un build :
  un build peut prérendre une valeur périmée. En cas de doute, supprimer ce dossier
  avant de reconstruire.
- Le cache Next est largement désactivé en développement : toute vérification du
  comportement de cache doit passer par un build de production.
- `@next/eslint-plugin-next` a été déplacé dans `packages/eslint-config`, qui est
  le paquet qui le référence.
- `pnpm start` depuis la racine échoue (`ERR_PNPM_NO_SCRIPT_OR_SERVER`) : lancer
  `pnpm --filter @portfolio/frontend start`.

## Validation

- `pnpm type-check`
- `pnpm lint`
- `pnpm build`
- `pnpm --filter @portfolio/frontend migrate` (nécessite `DATABASE_URI`)
- `pnpm test`
- Vérification navigateur sur `/`, `/a-propos`, `/projets`, `/contact`,
  `/mentions-legales`, `/veille` et `/admin`.
- Contrôle d'accès vérifié à l'API, seule vraie barrière : `GET /api/bookmarks`
  répond `200`, tandis que `POST`/`DELETE` sans session répondent `403`.
- Invalidation vérifiée de bout en bout sur un build de production : une écriture
  par l'API Payload fait apparaître la nouvelle valeur sur la page statique en une
  seconde, sans redémarrage.
