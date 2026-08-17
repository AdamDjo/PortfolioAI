# Spécification fonctionnelle — CMS, veille et fonctionnalités IA

> Statut : brouillon issu de la session `/grilling`, à valider avant implémentation.
>
> Ce document décrit la direction envisagée. Il ne remplace pas encore
> `ARCHITECTURE.md` ni `PRODUCT_DESIGN.md`.

## 1. Objectif

Faire évoluer le portfolio d’Adem vers une application administrable sans
modifier le code à chaque ajout de contenu. Le produit doit réunir :

- un portfolio et des études de cas pilotés par un CMS ;
- une veille personnelle alimentée à partir d’URL ;
- un assistant public qui connaît correctement Adem ;
- un Prompt Studio privé ;
- une gestion simple de la disponibilité, des contacts et des statistiques.

## 2. Architecture envisagée

| Couche               | Choix                                                              |
| -------------------- | ------------------------------------------------------------------ |
| Application          | Next.js et Payload CMS dans la même application                    |
| Administration       | Interface privée Payload sous `/admin`                             |
| Base de données      | Supabase en démo, PostgreSQL auto-hébergé sur le VPS en production |
| Déploiement          | Docker piloté par Coolify sur le VPS                               |
| Email transactionnel | Resend                                                             |
| IA gratuite initiale | Groq avec `openai/gpt-oss-20b`                                     |

Le backend Express a été retiré : Payload prend en charge les besoins serveur.
Aucun compte public ni système d’inscription ne sont prévus.
L’administration est réservée à un compte administrateur unique.

## 3. Gestion du portfolio

### 3.1 Projets

Les projets sont créés et modifiés depuis Payload.

Chaque projet doit pouvoir contenir :

- un titre et un slug unique ;
- un résumé ;
- une image principale et une galerie éventuelle ;
- les technologies utilisées ;
- les liens vers le site et le dépôt ;
- un contenu structuré d’étude de cas ;
- un statut brouillon ou publié ;
- des métadonnées SEO.

Payload doit fournir l’historique des versions, la prévisualisation des
brouillons et une publication explicite.

Chaque projet publié dispose d’une page dynamique :

```text
/projets/[slug]
```

Les brouillons et contenus privés ne doivent jamais être exposés au public ni
utilisés par l’assistant public.

### 3.2 Disponibilité

Un réglage global permet à Adem de se déclarer disponible ou indisponible.

Ce réglage comprend :

- un état actif ou inactif ;
- un texte public personnalisable ;
- une influence sur le badge de disponibilité du hero ;
- une influence sur les réponses de l’assistant relatives à la disponibilité.

## 4. Veille et gestion des liens

### 4.1 Parcours d’ajout

L’ajout d’un lien se fait uniquement depuis l’administration :

1. Adem colle une URL.
2. Le serveur normalise l’URL.
3. Les métadonnées publiques sont extraites automatiquement.
4. Adem vérifie le résultat et choisit les tags.
5. Le lien peut être activé ou désactivé.
6. Un lien actif apparaît sur `/veille`.

Les métadonnées attendues sont :

- titre ;
- description ;
- domaine ;
- favicon ;
- URL de l’image Open Graph.

L’image distante n’est pas copiée dans le stockage du projet. Si elle est
absente ou inaccessible, l’interface affiche un visuel de remplacement.

### 4.2 Tags et visibilité

Les tags sont administrables depuis Payload. Un lien peut recevoir plusieurs
tags.

Une petite commande permet d’activer ou de désactiver un lien :

- actif : visible publiquement ;
- inactif : conservé dans Payload, mais masqué sur `/veille`.

### 4.3 Détection des doublons

La détection repose sur une URL canonique :

- suppression du fragment ;
- suppression des paramètres de suivi connus ;
- normalisation du protocole, du domaine et du chemin ;
- conservation des paramètres ayant une valeur fonctionnelle.

Deux URL pointant vers deux chemins différents restent deux liens distincts.
Deux dépôts GitHub appartenant au même domaine doivent donc pouvoir être
enregistrés.

Lorsqu’une URL canonique existe déjà :

- aucun second enregistrement n’est créé ;
- les métadonnées distantes peuvent être actualisées ;
- les tags et l’état actif/inactif existants sont conservés.

## 5. Assistant IA public

### 5.1 Connaissances

L’assistant connaît Adem grâce à deux sources validées :

- le contenu publié du portfolio ;
- une collection privée `Connaissances IA` contenant des informations,
  préférences et éléments personnels autorisés.

L’assistant ne doit jamais inventer un fait concernant Adem. Lorsqu’une
information manque, il le dit clairement.

Il peut répondre aux questions généralistes, puis reconnecter naturellement la
discussion au parcours, aux compétences ou aux projets d’Adem lorsque cela est
pertinent.

### 5.2 Accès et limites

Le chat est public et ne nécessite pas de connexion.

Protections prévues :

- environ dix messages par session ;
- limitation quotidienne reposant sur une empreinte IP anonymisée ;
- limitation des envois en rafale ;
- réponse claire lorsque la limite est atteinte ;
- proposition de poursuivre via la page de contact.

### 5.3 Confidentialité

Les conversations sont anonymisées :

- aucune adresse IP brute n’est conservée ;
- les messages sont supprimés automatiquement après 30 jours ;
- chaque réponse peut recevoir une évaluation utile ou inutile ;
- l’évaluation reste liée à la conversation anonymisée.

### 5.4 Fournisseurs

L’intégration IA utilise une abstraction de fournisseur. Groq et
`openai/gpt-oss-20b` constituent le réglage gratuit initial. Une clé et un
modèle payants pourront être ajoutés ultérieurement sans réécrire les
fonctionnalités.

## 6. Prompt Studio privé

### 6.1 Objectif

Le Prompt Studio aide Adem à produire un prompt final optimisé pour un modèle
cible. Il est accessible uniquement depuis l’administration.

Parcours principal :

1. Adem décrit ce qu’il souhaite réaliser.
2. Il sélectionne un modèle cible.
3. Groq génère un unique prompt final adapté à cette cible.
4. Adem copie le résultat.
5. Il choisit éventuellement de le conserver.

Le Prompt Studio ne lance pas le prompt sur le modèle cible. Il fabrique
uniquement le texte final à copier.

### 6.2 Catalogue des modèles

Le sélecteur regroupe les modèles par fournisseur et par modalité :

- Anthropic Claude ;
- OpenAI ;
- Google Gemini ;
- Nano Banana pour l’image ;
- Veo pour la vidéo ;
- fournisseurs ou modèles personnalisés.

Chaque entrée comprend au minimum :

- un nom d’affichage ;
- un fournisseur ;
- un identifiant de modèle ;
- une modalité ;
- un état actif ou archivé.

Le catalogue est entièrement géré manuellement. Il n’existe aucune
synchronisation automatique avec les catalogues officiels.

Une icône `×` archive un ancien modèle. Un modèle archivé :

- disparaît des nouveaux choix ;
- reste associé aux prompts déjà enregistrés ;
- peut être réactivé ;
- n’est pas supprimé automatiquement de la base.

### 6.3 Persistance optionnelle

Les prompts sont éphémères par défaut. Après une génération, un bouton discret
`Conserver` permet de persister le résultat.

Un prompt conservé enregistre :

- un titre court généré automatiquement et modifiable ;
- la demande d’origine ;
- le prompt final ;
- le modèle cible ;
- la date de création et de modification.

Une page privée dédiée permet de :

- rechercher les prompts conservés ;
- les consulter ;
- les modifier ;
- les copier ;
- les supprimer.

Quitter la page sans utiliser `Conserver` ne crée aucun enregistrement.

## 7. Contact

Les demandes envoyées depuis le formulaire sont enregistrées dans Payload avec
les états :

- nouveau ;
- lu ;
- traité.

Resend envoie une notification à Adem lors d’un nouveau message. Il sert
également aux emails nécessaires à la récupération du mot de passe
administrateur.

## 8. Statistiques internes

Le faux tableau de bord actuel est remplacé par des données réelles et
anonymes. Les événements métier sont agrégés quotidiennement :

- vues de pages ;
- ouvertures de projets ;
- ouvertures de liens ;
- conversations commencées ;
- formulaires de contact envoyés.

La première version n’utilise ni cookie publicitaire ni outil d’analytics
externe.

## 9. Critères d’acceptation

### Administration

- Une personne non authentifiée ne peut pas accéder aux fonctions privées.
- Adem peut gérer les projets, liens, tags, connaissances IA et réglages sans
  modifier le code.
- Un brouillon ne devient public qu’après une action explicite.

### Veille

- Coller une URL valide préremplit ses métadonnées.
- Une erreur de prévisualisation ne bloque pas l’enregistrement.
- Un lien inactif n’apparaît pas sur `/veille`.
- Un doublon canonique ne crée pas une nouvelle ligne.
- Deux dépôts GitHub différents peuvent coexister.

### Assistant

- Il répond à partir des contenus publiés et des connaissances autorisées.
- Il n’affirme pas comme vrai un renseignement personnel absent.
- Les limites d’usage et la protection contre les rafales fonctionnent.
- Les conversations expirées sont supprimées après 30 jours.

### Prompt Studio

- Un modèle cible actif peut être sélectionné.
- Un modèle personnalisé peut être ajouté depuis l’admin.
- Archiver un modèle ne casse pas l’historique.
- Le résultat est directement copiable.
- Aucun prompt n’est persisté sans l’action `Conserver`.
- Un prompt conservé apparaît dans la page dédiée avec un titre modifiable.

### Données et sécurité

- Les secrets des fournisseurs ne sont jamais exposés au navigateur.
- Les brouillons et connaissances privées ne sont pas servis par les routes
  publiques.
- Aucune IP brute de visiteur n’est stockée.

## 10. Cas limites à couvrir

- URL invalide, redirection en boucle ou site inaccessible ;
- métadonnées absentes, trop longues ou mal formées ;
- image distante supprimée après l’enregistrement ;
- modification de l’URL canonique d’une ressource ;
- indisponibilité ou quota épuisé chez Groq ;
- réponse IA interrompue ;
- modèle cible archivé pendant une session ;
- suppression d’un prompt conservé ;
- tentative d’accès direct à une route privée ;
- expiration d’une session administrateur.

## 11. Hors périmètre initial

- comptes et inscriptions pour les visiteurs ;
- paiement ou abonnement ;
- application mobile ;
- hébergement local d’un modèle IA ;
- exécution des prompts sur Claude, OpenAI, Gemini, Nano Banana ou Veo ;
- synchronisation automatique des catalogues de modèles ;
- stockage local des images Open Graph ;
- analytics publicitaires ou suivi intersite ;
- architecture VPS PostgreSQL autogérée.

## 12. Points à revalider avant implémentation

- liste initiale exacte des modèles proposés dans le Prompt Studio ;
- schéma Payload détaillé et règles d’accès de chaque collection ;
- budgets et limites définitives de l’assistant ;
- stratégie de migration des données TypeScript actuelles ;
- procédure de sauvegarde et de restauration PostgreSQL/Coolify ;
- organisation des lots et ordre d’implémentation.
