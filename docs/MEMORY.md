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
- Chat protégé contre les abus (issue #10, 1er lot) : limiteur de débit à trois
  paliers (rafale / minute / jour) dans `src/lib/ai/rate-limit.ts`, empreinte IP
  salée et rotée quotidiennement dans `src/lib/ai/client-fingerprint.ts`. Le 429
  part avant `resolveProvider`/`buildContext`, donc sans consommer de quota Groq,
  et renvoie vers `/contact`. Rétention des conversations, feedback et page de
  confidentialité restent à faire (2e lot de #10).
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
- Limiteur du chat : compteurs en mémoire (`Map` de module), fenêtre glissante,
  pas de datastore — assumé, l'app tourne en une poignée d'instances et le
  limiteur vit derrière une interface étroite (bascule Redis = un seul fichier).
  Les compteurs sont remis à zéro au redéploiement ; le quota du fournisseur
  reste le vrai plafond. L'empreinte combine `CHAT_FINGERPRINT_SALT` (secret
  d'environnement) et la date UTC : rotation quotidienne sans manipuler la
  variable. Sans sel, `computeFingerprint` renvoie `null` et le limiteur reste
  éteint plutôt que de hacher une valeur réversible ou de regrouper tout le
  monde. Aucune IP brute n'est jamais stockée ni journalisée.
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
